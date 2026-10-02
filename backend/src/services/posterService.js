import crypto from "crypto";
import { prisma } from "../config/prismaClient.js";
import { supabaseStorage } from "../config/supabaseStorageClient.js";
import { AppError } from "../middleware/errorHandler.js";

export const POSTERS_BUCKET = process.env.POSTERS_BUCKET || "posters";
const allowedFiles = {
  "image/png": { ext: "png", type: "IMAGE", signature: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/jpeg": { ext: "jpg", type: "IMAGE", signature: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/webp": { ext: "webp", type: "IMAGE", signature: (b) => b.length >= 12 && b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
  "application/pdf": { ext: "pdf", type: "PDF", signature: (b) => b.length >= 5 && b.subarray(0, 5).toString() === "%PDF-" },
};

const publicUrlFor = (filePath) => supabaseStorage.storage.from(POSTERS_BUCKET).getPublicUrl(filePath).data.publicUrl;
const dto = (poster) => ({ ...poster, fileUrl: poster.fileUrl || publicUrlFor(poster.filePath) });

export const validatePosterFile = (file) => {
  if (!file || !file.size || !file.buffer?.length) throw new AppError("Choose a non-empty PNG, JPG, WebP, or PDF file.", 400);
  if (file.size > 5 * 1024 * 1024) throw new AppError("Poster must be 5 MB or smaller.", 400);
  const definition = allowedFiles[file.mimetype];
  if (!definition) throw new AppError("Only PNG, JPG, WebP, and PDF posters are allowed.", 400);
  if (!definition.signature(file.buffer)) throw new AppError("The uploaded file does not match its declared type.", 400);
  return definition;
};

export const createPoster = async (adminId, data, file) => {
  const definition = validatePosterFile(file);
  const filePath = `posters/${crypto.randomUUID()}.${definition.ext}`;
  const fileUrl = publicUrlFor(filePath);
  const { error } = await supabaseStorage.storage.from(POSTERS_BUCKET).upload(filePath, file.buffer, { contentType: file.mimetype, upsert: false });
  if (error) throw new AppError("Could not upload poster file.", 500);
  try {
    return dto(await prisma.poster.create({ data: { ...data, filePath, fileUrl, fileType: definition.type, mimeType: file.mimetype, fileSizeBytes: file.size, createdBy: adminId } }));
  } catch (error) {
    await supabaseStorage.storage.from(POSTERS_BUCKET).remove([filePath]).catch(() => {});
    throw error;
  }
};

export const listAdminPosters = async () => (await prisma.poster.findMany({ orderBy: { createdAt: "desc" } })).map(dto);
export const updatePoster = async (id, data) => dto(await prisma.poster.update({ where: { id }, data }).catch(() => { throw new AppError("Poster not found.", 404); }));
const changeState = async (id, data) => dto(await prisma.poster.update({ where: { id }, data }).catch(() => { throw new AppError("Poster not found.", 404); }));
export const publishPoster = (id) => changeState(id, { isPublished: true, publishedAt: new Date() });
export const unpublishPoster = (id) => changeState(id, { isPublished: false, isPinned: false, publishedAt: null });
export const pinPoster = async (id) => {
  const poster = await prisma.poster.findUnique({ where: { id } });
  if (!poster) throw new AppError("Poster not found.", 404);
  if (!poster.isPublished) throw new AppError("Publish a poster before pinning it.", 400);
  return changeState(id, { isPinned: true });
};
export const unpinPoster = (id) => changeState(id, { isPinned: false });
export const deletePoster = async (id) => {
  const poster = await prisma.poster.findUnique({ where: { id } });
  if (!poster) throw new AppError("Poster not found.", 404);
  const { error } = await supabaseStorage.storage.from(POSTERS_BUCKET).remove([poster.filePath]);
  if (error && !/not found|does not exist/i.test(error.message || "")) throw new AppError("Could not remove poster file.", 500);
  await prisma.poster.delete({ where: { id } });
  return { id };
};

export const memberPosterWhere = (isNewMember) => ({ isPublished: true, OR: [{ audience: "ALL_MEMBERS" }, ...(isNewMember ? [{ audience: "NEW_MEMBERS" }] : [])] });
const isNewMember = async (userId) => {
  const membership = await prisma.membership.findUnique({ where: { userId }, select: { joinedAt: true } });
  return !!membership?.joinedAt && membership.joinedAt >= new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
};
export const listMemberPosters = async (userId) => (await prisma.poster.findMany({ where: memberPosterWhere(await isNewMember(userId)), orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }] })).map(dto);
export const getMemberPoster = async (userId, id) => {
  const poster = await prisma.poster.findFirst({ where: { id, ...memberPosterWhere(await isNewMember(userId)) } });
  if (!poster) throw new AppError("Poster not found.", 404);
  return dto(poster);
};
