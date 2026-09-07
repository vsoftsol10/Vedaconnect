import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRight, ShieldCheck } from "lucide-react";

const MemberCard = ({ member }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm sm:p-6">
      <div className="relative inline-block mb-4">
        {member.profilePhoto ? (
          <img
            src={member.profilePhoto}
            alt={member.fullName}
            className="h-20 w-20 rounded-2xl object-cover"
          />
        ) : (
          <div className="h-20 w-20 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-700">
            {member.fullName?.[0]}
          </div>
        )}
        {member.isVerified && (
          <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
            <ShieldCheck className="h-3 w-3 text-white" />
          </span>
        )}
      </div>

      <h3 className="font-bold text-gray-900">{member.fullName}</h3>
      <p className="text-sm text-gray-500 mb-3">{member.businessName}</p>

      {member.businessCategory && (
        <span className="inline-block bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full mb-2">
          {member.businessCategory}
        </span>
      )}

      <p className="flex items-center justify-center gap-1 text-sm text-gray-400 mb-5">
        <MapPin className="h-3.5 w-3.5" />
        {member.location}
      </p>

      <button
        onClick={() => navigate(`/members/${member.userId}`)}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 font-medium text-gray-900 transition-colors hover:bg-gray-100"
      >
        View Profile <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default MemberCard;
