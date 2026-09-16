import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import MemberCard from "../components/members/MemberCard";
import { listMembers } from "../services/memberService";
import Dropdown from "../components/ui/Dropdown";
import Pagination, { usePagination } from "../components/ui/Pagination";

const uniqueValues = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

const Members = () => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ location: "", category: "", status: "", tier: "", alphabetical: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    listMembers().then(setMembers).catch((err) => setError(err.message || "Could not load members.")).finally(() => setIsLoading(false));
  }, []);

  const locations = useMemo(() => uniqueValues(members.map((member) => member.hub || member.location)), [members]);
  const categories = useMemo(() => uniqueValues(members.map((member) => member.businessCategory || member.businessType)), [members]);
  const filteredMembers = useMemo(() => {
    const searchTerm = search.trim().toLocaleLowerCase();
    return members.filter((member) => {
      const memberLocation = member.hub || member.location;
      const memberCategory = member.businessCategory || member.businessType;
      const inactive = member.membershipStatus !== "ACTIVE";
      const searchable = [member.fullName, member.businessName, member.businessCategory, member.businessType, member.location, member.hub].filter(Boolean).join(" ").toLocaleLowerCase();
      return (!searchTerm || searchable.includes(searchTerm)) && (!filters.location || memberLocation === filters.location) && (!filters.category || memberCategory === filters.category) && (!filters.status || (filters.status === "INACTIVE" ? inactive : member.membershipStatus === filters.status)) && (!filters.tier || member.membershipTier === filters.tier);
    }).sort((a, b) => filters.alphabetical === "AZ" ? a.fullName.localeCompare(b.fullName) : 0);
  }, [members, search, filters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const visibleMembers = usePagination(filteredMembers, page, rowsPerPage);
  useEffect(() => { setPage(1); }, [search, filters, rowsPerPage]);
  const setFilter = (key) => (event) => setFilters((current) => ({ ...current, [key]: event.target.value }));
  const clearFilters = () => setFilters({ location: "", category: "", status: "", tier: "", alphabetical: "" });

  return <div className="flex min-h-screen bg-stone-50"><Sidebar /><div className="min-w-0 flex-1"><DashboardHeader /><main className="px-4 py-6 sm:px-6 md:p-8">
    <h1 className="mb-1 text-2xl font-bold text-gray-900">Members</h1><p className="mb-6 text-gray-500">Connect with members of the VedaConnect community.</p>
    <div className="relative mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"><div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search members..." className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-gray-900 outline-none transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-100" /></div><button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-gray-700 transition-colors hover:border-green-300 sm:justify-start"><SlidersHorizontal className="h-4 w-4" /> Filters{activeFilterCount > 0 && <span className="rounded-full bg-green-600 px-1.5 py-0.5 text-xs font-bold text-white">{activeFilterCount}</span>}</button>
      {filtersOpen && <div className="z-10 w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:absolute sm:right-0 sm:top-14 sm:w-[34rem]"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-gray-900">Filter members</h2><button type="button" onClick={clearFilters} disabled={!activeFilterCount} className="text-sm font-medium text-green-600 disabled:text-gray-400">Clear filters</button></div><div className="grid gap-3 sm:grid-cols-2"><FilterSelect label="Location / Hub" value={filters.location} onChange={setFilter("location")} options={locations} /><FilterSelect label="Category / Business type" value={filters.category} onChange={setFilter("category")} options={categories} /><FilterSelect label="Membership status" value={filters.status} onChange={setFilter("status")} options={["ACTIVE", "INACTIVE"]} labels={{ ACTIVE: "Active", INACTIVE: "Inactive" }} /><FilterSelect label="Sort" value={filters.alphabetical} onChange={setFilter("alphabetical")} options={["AZ"]} labels={{ AZ: "Alphabetical (A–Z)" }} /></div></div>}
    </div>
    <div className="mb-4 w-full sm:w-52"><Dropdown value={filters.tier} onChange={(value) => setFilters((current) => ({ ...current, tier: value }))} placeholder="All Membership Tiers" options={[{ value: "FOUNDING_MEMBER", label: "Founding Member" }, { value: "MEMBER", label: "Member" }]} /></div>
    <p className="mb-4 text-sm text-gray-500"><strong className="text-gray-900">{filteredMembers.length}</strong> members found</p>
    {isLoading ? <p className="text-gray-400">Loading members...</p> : error ? <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : filteredMembers.length ? <><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{visibleMembers.map((member) => <MemberCard key={member.userId} member={member} />)}</div><div className="mt-5 rounded-2xl border border-gray-100 bg-white"><Pagination page={page} onPageChange={setPage} rowsPerPage={rowsPerPage} onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(1); }} total={filteredMembers.length} /></div></> : <div className="rounded-xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-500"><X className="mx-auto mb-2 h-5 w-5 text-gray-400" />No members match your search and filters.</div>}
  </main></div></div>;
};

const FilterSelect = ({ label, value, onChange, options, labels = {} }) => <label className="text-sm font-medium text-gray-700">{label}<Dropdown value={value} onChange={(nextValue) => onChange({ target: { value: nextValue } })} className="mt-1.5" options={[{ value: "", label: "All" }, ...options.map((option) => ({ value: option, label: labels[option] || option }))]} /></label>;

export default Members;
