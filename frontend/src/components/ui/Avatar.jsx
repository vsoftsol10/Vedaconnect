export const Avatar = ({ src, name, className = "h-9 w-9" }) => src ? (
  <img src={src} alt={name || "Member"} className={`${className} rounded-full object-cover`} />
) : (
  <span aria-label={name || "Member"} className={`${className} inline-flex shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700`}>
    {name?.trim()?.[0]?.toUpperCase() || "?"}
  </span>
);
