import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, UploadCloud, ShieldCheck, FileCheck2, X, Loader2 } from "lucide-react";
import OnboardingHeader from "../../components/onboarding/OnboardingHeader";
import OnboardingProgress from "../../components/onboarding/OnboardingProgress";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";
import { uploadBusinessCertificate } from "../../services/onboardingService";

const MAX_SIZE_MB = 5;
const MAX_FILES = 5;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

const BusinessCertificate = () => {
  const navigate = useNavigate();
  const { userId } = useOnboarding();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!userId) navigate("/onboarding/personal-details", { replace: true });
  }, [navigate, userId]);

  const addFiles = (selectedFiles) => {
    const incomingFiles = Array.from(selectedFiles || []);
    if (!incomingFiles.length) return;

    const availableSlots = MAX_FILES - files.length;
    if (availableSlots <= 0) {
      setError(`You can upload up to ${MAX_FILES} certificates.`);
      return;
    }

    const acceptedFiles = [];
    const rejectedMessages = [];

    incomingFiles.slice(0, availableSlots).forEach((selectedFile) => {
      if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
        rejectedMessages.push(`${selectedFile.name} must be a PDF, JPG, or PNG file.`);
        return;
      }
      if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
        rejectedMessages.push(`${selectedFile.name} must be under ${MAX_SIZE_MB}MB.`);
        return;
      }
      acceptedFiles.push(selectedFile);
    });

    if (incomingFiles.length > availableSlots) {
      rejectedMessages.push(`Only ${availableSlots} more file${availableSlots === 1 ? "" : "s"} can be added.`);
    }

    if (acceptedFiles.length) {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    }
    setError(rejectedMessages[0] || "");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileInput = (e) => addFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemoveFile = (indexToRemove) => (e) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatSize = (bytes) =>
    bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const handleContinue = async () => {
    if (!files.length) return;
    if (!userId) {
      setError("Member profile not found. Complete Step 1 first.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await uploadBusinessCertificate({ userId, certificates: files });
      navigate("/onboarding/membership");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => navigate("/onboarding/business-details");

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-stone-50 px-4 py-6 sm:py-12">
      <div className="w-full max-w-2xl">
        <OnboardingHeader />
        <OnboardingProgress currentStep={3} />

        <OnboardingCard>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <h1 className="text-2xl font-bold text-gray-900">Business Certificate</h1>
          </div>
          <p className="text-gray-500 mb-8">Upload your business registration certificate.</p>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileInput}
            className="hidden"
          />

          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed px-6 py-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-300 ${
              files.length || isDragging
                ? "border-green-400 bg-green-50/40"
                : "border-gray-200 hover:border-green-300 hover:bg-green-50/20"
            }`}
          >
            {files.length ? (
              <div className="w-full space-y-3">
                <div className="h-14 w-14 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                  <FileCheck2 className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900 mb-4">
                  {files.length} certificate{files.length === 1 ? "" : "s"} selected
                </p>
                <div className="space-y-2 text-left">
                  {files.map((selectedFile, index) => (
                    <div
                      key={`${selectedFile.name}-${selectedFile.size}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white border border-green-100 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileCheck2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-400">{formatSize(selectedFile.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile(index)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                {files.length < MAX_FILES && (
                  <p className="pt-2 text-sm text-gray-400">
                    Click or drop more files to add up to {MAX_FILES}.
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                  <UploadCloud className="h-6 w-6 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">Click to upload your certificates</p>
                <p className="text-sm text-gray-400">
                  PDF, JPG, or PNG up to {MAX_SIZE_MB}MB each. Maximum {MAX_FILES} files.
                </p>
              </>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-red-500 text-center">{error}</p>}

          <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 flex gap-3">
            <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 leading-relaxed">
              Your certificate is required to verify your business and keep the community
              trusted. It&apos;s kept private and only used for verification.
            </p>
          </div>

          <div className="mt-9 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="group inline-flex min-h-11 items-center justify-center gap-2 text-gray-500 hover:text-green-600 font-semibold px-2 py-3.5 rounded-xl transition-colors duration-300 sm:justify-start"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!files.length || isSubmitting}
              className="group inline-flex min-h-11 w-full items-center justify-center gap-2 bg-amber-400 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:ring-0 text-gray-900 hover:text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-green-200 ring-2 ring-transparent hover:ring-green-100 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </OnboardingCard>

        <p className="text-center text-xs text-gray-400 mt-6">
          Your details are used only to set up your VedaConnect membership account.
        </p>
      </div>
    </div>
  );
};

export default BusinessCertificate;
