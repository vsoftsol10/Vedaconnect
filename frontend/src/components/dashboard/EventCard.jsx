import { Calendar, Clock, MapPin } from "lucide-react";
import EventPoster from "../ui/EventPoster";

const attendedStatuses = ["ATTENDED", "PRESENT", "CONFIRMED"];
const notAttendedStatuses = ["ABSENT", "NOT_ATTENDED"];

const EventCard = ({ event }) => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
    <div className="relative h-44 bg-gray-100">
      <EventPoster src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
        {(event.tags || []).map((tag) => (
          <span key={tag} className="bg-white/90 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {tag}
          </span>
        ))}
        {event.attendanceStatus && (
          <AttendanceBadge status={event.attendanceStatus} />
        )}
      </div>
    </div>
    <div className="p-4 sm:p-5">
      <h3 className="font-bold text-gray-900 mb-3">{event.title}</h3>
      {event.eventType === 'NO_FEE' && <span className="inline-block -mt-1 mb-3 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">Weekly Meeting</span>}
      <div className="space-y-1.5 text-sm text-gray-500 mb-4">
        <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-green-600" />{event.date}</p>
        <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-green-600" />{event.time}</p>
        <p className="flex items-center gap-2 break-words"><MapPin className="h-4 w-4 flex-shrink-0 text-green-600" />{event.location}</p>
      </div>
      <button className="flex min-h-11 w-full items-center justify-between bg-gray-50 px-4 py-2.5 font-medium text-gray-900 transition-colors hover:bg-gray-100 rounded-xl">
        View Event <span>→</span>
      </button>
    </div>
  </div>
);

const AttendanceBadge = ({ status }) => {
  const attended = attendedStatuses.includes(status);
  const notAttended = notAttendedStatuses.includes(status);
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
      attended ? "bg-green-50 text-green-700" : notAttended ? "bg-red-50 text-red-600" : "bg-white/90 text-gray-600"
    }`}>
      {attended ? "Attended" : notAttended ? "Not attended" : "Attendance not marked"}
    </span>
  );
};

export default EventCard;
