import { ChevronLeft, ChevronRight } from "lucide-react";

export const usePagination = (items, page, rowsPerPage) => items.slice((page - 1) * rowsPerPage, page * rowsPerPage);

const Pagination = ({ page, onPageChange, rowsPerPage, onRowsPerPageChange, total }) => {
  const pages = Math.max(1, Math.ceil(total / rowsPerPage));
  const start = total ? (page - 1) * rowsPerPage + 1 : 0;
  const end = Math.min(page * rowsPerPage, total);
  return <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-end sm:px-6">
    <label className="flex items-center gap-2">Rows per page <select value={rowsPerPage} onChange={(event) => onRowsPerPageChange(Number(event.target.value))} className="vc-select rounded-lg px-2 py-1 text-sm"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label>
    <span>Showing {start}–{end} of {total} results</span>
    <div className="flex items-center gap-1"><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="vc-page-button"><ChevronLeft className="h-4 w-4" /></button><span className="min-w-14 text-center">{page} / {pages}</span><button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="vc-page-button"><ChevronRight className="h-4 w-4" /></button></div>
  </div>;
};

export default Pagination;
