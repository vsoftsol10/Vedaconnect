import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../services/notificationService";

const NotificationBell = ({ badgeClass = "bg-amber-400 text-gray-900" }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({ items: [], unreadCount: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const load = () => getNotifications().then(setNotifications).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = async (item) => {
    await markNotificationRead(item.id).catch(() => {});
    setIsOpen(false);
    load();
    if (item.link) navigate(item.link);
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead().catch(() => {});
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-50 hover:text-green-600"
      >
        <Bell className="h-5 w-5" />
        {notifications.unreadCount > 0 && (
          <span className={`absolute -top-2 -right-2 min-w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold px-1 ${badgeClass}`}>
            {notifications.unreadCount > 9 ? "9+" : notifications.unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg sm:w-80">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="font-semibold text-gray-900">Notifications</p>
            <button
              type="button"
              onClick={handleMarkAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          </div>
          <div className="max-h-[min(20rem,calc(100vh-9rem))] overflow-y-auto">
            {notifications.items.length ? (
              notifications.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                    item.isRead ? "bg-white" : "bg-amber-50/50"
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.message}</p>
                  <p className="text-[11px] text-gray-400 mt-2">
                    {new Date(item.createdAt).toLocaleString("en-IN")}
                  </p>
                </button>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No notifications yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
