import crypto from "crypto";
import { prisma } from "../config/prismaClient.js";
import { supabaseStorage } from "../config/supabaseStorageClient.js";
import { AppError } from "../middleware/errorHandler.js";

export const CERTIFICATES_BUCKET = "business-certificates";
export const DOCUMENT_TYPES = ["BUSINESS_CERTIFICATE", "GST_CERTIFICATE", "LICENSE", "OTHER"];
const ACCEPTED_TYPES = new Map([
  ["application/pdf", [".pdf"]],
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/png", [".png"]],
  ["image/webp", [".webp"]],
]);

const safeFileName = (name) => {
  const normalized = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const extension = normalized.slice(normalized.lastIndexOf(".")).toLowerCase();
  const base = normalized.slice(0, normalized.length - extension.length).replace(/[^A-Za-z0-9.-]/g, "_").replace(/_+/g, "_").replace(/^[._-]+|[._-]+$/g, "") || "document";
  return `${base}${extension}`;
};

export const isAllowedDocumentFile = (file) => {
  const extension = file?.originalname?.slice(file.originalname.lastIndexOf(".")).toLowerCase();
  return !!extension && ACCEPTED_TYPES.get(file?.mimetype)?.includes(extension);
};

const documentDto = (document) => ({
  id: document.id,
  title: document.title || document.fileName,
  documentType: document.documentType,
  fileName: document.fileName,
  mimeType: document.mimeType,
  size: document.fileSizeBytes,
  uploadedAt: document.uploadedAt,
});

export const listMemberDocuments = async (userId) => documentDtoList(await prisma.businessCertificate.findMany({ where: { userId }, orderBy: { uploadedAt: "desc" } }));
const documentDtoList = (documents) => documents.map(documentDto);

const findOwnedDocument = async (userId, documentId) => {
  const document = await prisma.businessCertificate.findFirst({ where: { id: documentId, userId } });
  if (!document) throw new AppError("Document not found.", 404);
  return document;
};

export const uploadMemberDocument = async (userId, { title, documentType }, file) => {
  if (!file) throw new AppError("Choose a document to upload.", 400);
  if (!isAllowedDocumentFile(file)) throw new AppError("Only PDF, JPG, PNG, and WebP documents are allowed.", 400);
  if (!DOCUMENT_TYPES.includes(documentType || "BUSINESS_CERTIFICATE")) throw new AppError("Choose a valid document type.", 400);
  const count = await prisma.businessCertificate.count({ where: { userId } });
  if (count >= 10) throw new AppError("You can keep up to 10 documents.", 400);

  const filePath = `${userId}/${crypto.randomUUID()}-${safeFileName(file.originalname)}`;
  const { error: uploadError } = await supabaseStorage.storage.from(CERTIFICATES_BUCKET).upload(filePath, file.buffer, { contentType: file.mimetype, upsert: false });
  if (uploadError) throw new AppError(`Could not upload document: ${uploadError.message}`, 500);

  try {
    return documentDto(await prisma.businessCertificate.create({ data: {
      userId, filePath, fileName: file.originalname, fileSizeBytes: file.size, mimeType: file.mimetype,
      title: title?.trim() || null, documentType: documentType || "BUSINESS_CERTIFICATE",
    } }));
  } catch (error) {
    await supabaseStorage.storage.from(CERTIFICATES_BUCKET).remove([filePath]).catch(() => {});
    throw error;
  }
};

export const getMemberDocumentUrl = async (userId, documentId) => {
  const document = await findOwnedDocument(userId, documentId);
  const { data, error } = await supabaseStorage.storage.from(CERTIFICATES_BUCKET).createSignedUrl(document.filePath, 300);
  if (error || !data?.signedUrl) throw new AppError("Could not create a document link.", 500);
  return { url: data.signedUrl, expiresIn: 300 };
};

export const deleteMemberDocument = async (userId, documentId) => {
  const document = await findOwnedDocument(userId, documentId);
  const { error } = await supabaseStorage.storage.from(CERTIFICATES_BUCKET).remove([document.filePath]);
  if (error && !/not found|does not exist/i.test(error.message || "")) throw new AppError("Could not remove document file.", 500);
  await prisma.businessCertificate.delete({ where: { id: document.id } });
  return { id: document.id };
};

export const listAdminMemberDocuments = async (userId) => {
  const member = await prisma.user.findFirst({ where: { id: userId, role: "MEMBER", memberProfile: { isNot: null } }, select: { id: true } });
  if (!member) throw new AppError("Member not found.", 404);
  return listMemberDocuments(userId);
};

export const getAdminMemberDocumentUrl = async (userId, documentId) => getMemberDocumentUrl(userId, documentId);
