const Table = ({ children, className = "", minWidth = "" }) => <div className={`overflow-x-auto ${className}`}><table className={`vc-table w-full text-sm ${minWidth}`}>{children}</table></div>;

export const Cell = ({ children, align = "left", title, className = "" }) => <td title={title} className={`vc-cell ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"} ${className}`}><div className="truncate">{children}</div></td>;
export const HeaderCell = ({ children, align = "left", className = "" }) => <th className={`vc-header-cell ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"} ${className}`}>{children}</th>;
export default Table;
