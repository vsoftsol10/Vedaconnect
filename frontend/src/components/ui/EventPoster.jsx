import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function EventPoster({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return <div className={`flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 ${className}`} role="img" aria-label={`${alt} poster unavailable`}>
      <div className="text-center"><ImageOff className="mx-auto h-7 w-7" /><span className="mt-2 block text-xs font-semibold">Event poster</span></div>
    </div>;
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} className={className} />;
}
