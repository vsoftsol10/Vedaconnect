import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import MemberCard from "../components/members/MemberCard";
import { listMembers } from "../services/memberService";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      listMembers({ search }).then((data) => {
        setMembers(data);
        setIsLoading(false);
      });
    }, 300); // debounce typing
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Members</h1>
          <p className="text-gray-500 mb-6">Connect with members of the VedaConnect community.</p>

          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 hover:border-green-300 transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            <strong className="text-gray-900">{members.length}</strong> members found
          </p>

          {isLoading ? (
            <p className="text-gray-400">Loading members...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {members.map((member) => (
                <MemberCard key={member.userId} member={member} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Members;