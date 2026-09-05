import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, CheckCircle2, FileText, MapPin, ShieldCheck, UserRound } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { getMemberDetail } from "../services/memberService";

const MemberProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setError("");
    getMemberDetail(userId)
      .then(setMember)
      .catch((err) => setError(err.response?.data?.message || "Member profile could not be loaded."))
      .finally(() => setIsLoading(false));
  }, [userId]);

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <button
            onClick={() => navigate("/members")}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Members
          </button>

          {isLoading ? (
            <p className="text-gray-400">Loading member profile...</p>
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : (
            <>
              <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="h-28 bg-gradient-to-r from-amber-100 via-stone-50 to-green-50" />
                <div className="-mt-12 flex flex-wrap items-end justify-between gap-4 px-6 pb-6">
                  <div className="flex items-end gap-4">
                    {member.profilePhoto ? (
                      <img
                        src={member.profilePhoto}
                        alt={member.fullName}
                        className="h-24 w-24 rounded-2xl border-4 border-white object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-amber-100 text-3xl font-bold text-amber-700">
                        {member.fullName?.[0] || "?"}
                      </div>
                    )}
                    <div className="pb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-900">{member.fullName}</h1>
                        {member.isVerified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{member.businessName}</p>
                    </div>
                  </div>
                  {member.businessCategory && (
                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
                      {member.businessCategory}
                    </span>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                    <UserRound className="h-5 w-5 text-green-600" />
                    Member Details
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Name" value={member.fullName} />
                    <Field label="Location" value={member.location} icon={MapPin} />
                    <Field label="Membership" value={member.membershipType?.replace("_", " ")} />
                    <Field label="Verification" value={member.isVerified ? "Verified" : "Pending Review"} />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                    <Building2 className="h-5 w-5 text-green-600" />
                    Business Details
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Business Name" value={member.businessName} />
                    <Field label="Category" value={member.businessCategory} />
                    <Field label="Business Location" value={member.businessLocation} />
                    <Field label="Products / Services" value={member.productsServices} />
                  </div>
                  <div className="mt-4">
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Description</p>
                    <p className="text-sm leading-6 text-gray-700">{member.businessDescription || "-"}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                  <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                    <FileText className="h-5 w-5 text-green-600" />
                    Business Certificates
                  </h2>
                  {member.certificates?.length ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {member.certificates.map((certificate) => (
                        <div key={certificate.id} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                          <p className="truncate text-sm font-semibold text-gray-900">{certificate.fileName}</p>
                          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {certificate.isVerified ? "Verified" : "Pending Review"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No certificates uploaded.</p>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const Field = ({ label, value, icon: Icon }) => (
  <div>
    <p className="mb-1 text-xs font-semibold uppercase text-gray-400">{label}</p>
    <p className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
      {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      {value || "-"}
    </p>
  </div>
);

export default MemberProfile;
