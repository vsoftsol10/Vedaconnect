import { Calendar, Clock, MapPin } from "lucide-react";

const EventCard = ({ event }) => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
    <div className="relative h-44 bg-gray-100">
      {event.imageUrl && (
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
      )}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
        {event.tags.map((tag) => (
          <span key={tag} className="bg-white/90 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </div>
    <div className="p-5">
      <h3 className="font-bold text-gray-900 mb-3">{event.title}</h3>
      <div className="space-y-1.5 text-sm text-gray-500 mb-4">
        <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-green-600" />{event.date}</p>
        <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-green-600" />{event.time}</p>
        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-green-600" />{event.location}</p>
      </div>
      <button className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 text-gray-900 font-medium px-4 py-2.5 rounded-xl transition-colors">
        View Event <span>→</span>
      </button>
    </div>
  </div>
);

export default EventCard;