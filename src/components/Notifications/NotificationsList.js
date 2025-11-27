import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { notificationsAPI } from "../../utils/api";
import Navbar from "../Layout/Navbar";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle, Bell } from "lucide-react";

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin text-6xl">⚽</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Notificaciones
            </h1>
            <p className="text-gray-600">
              {unreadCount > 0
                ? `Tienes ${unreadCount} notificación${
                    unreadCount > 1 ? "es" : ""
                  } sin leer`
                : "No tienes notificaciones sin leer"}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Marcar todas como leídas</span>
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">
              No tienes notificaciones
            </p>
            <Link to="/dashboard">
              <Button>Ir al inicio</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-md p-6 transition-all ${
                  !notification.read ? "border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Bell
                        className={`w-5 h-5 ${
                          !notification.read ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          !notification.read ? "text-blue-600" : "text-gray-500"
                        }`}
                      >
                        {notification.notification_type === "ticket_available"
                          ? "Entradas Disponibles"
                          : "Notificación"}
                      </span>
                    </div>
                    <p className="text-gray-900 mb-2">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(notification.sent_at), "PPp", {
                        locale: es,
                      })}
                    </p>
                  </div>

                  {!notification.read && (
                    <Button
                      onClick={() => handleMarkAsRead(notification.id)}
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Marcar como leída</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
