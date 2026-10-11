import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Bell, X } from "lucide-react";

export default function NotificationToast() {
  const { notifications, dismissNotification } = useApp();

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        dismissNotification(notifications[notifications.length - 1]?.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  return (
    <div className="toast-container">
      {notifications.slice(0, 3).map((n) => (
        <div key={n.id} className="toast animate-fadeInUp">
          <span style={{ flex: 1 }}>{n.message}</span>
          <button className="toast-close" onClick={() => dismissNotification(n.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
