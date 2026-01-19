import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, ClipboardList, ArrowRight } from 'lucide-react';
import { gameService } from '../services/gameService';
import { Notification, ViewState } from '../types';

interface NotificationCenterProps {
  onNavigate?: (view: ViewState, data?: any) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const data = await gameService.getNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 10 seconds (simulating real-time)
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await gameService.markNotificationRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await gameService.markAllNotificationsRead();
    fetchNotifications();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
        gameService.markNotificationRead(notification.id);
        fetchNotifications();
    }

    if (notification.relatedTaskId && onNavigate) {
        setIsOpen(false);
        onNavigate(ViewState.TASKS, { taskId: notification.relatedTaskId });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'task': return <ClipboardList className="w-5 h-5 text-blue-600" />;
      default: return <Info className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
      if (read) return 'hover:bg-slate-50';
      switch (type) {
          case 'task': return 'bg-blue-50/70 border-l-4 border-blue-500 hover:bg-blue-100/50';
          case 'warning': return 'bg-amber-50/70 border-l-4 border-amber-500 hover:bg-amber-100/50';
          case 'success': return 'bg-emerald-50/70 border-l-4 border-emerald-500 hover:bg-emerald-100/50';
          default: return 'bg-slate-50 border-l-4 border-slate-300';
      }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800 focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-gray-900 animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in-up origin-top-right">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-blue-700 hover:text-blue-900 font-bold"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                No new notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((note) => (
                  <div 
                    key={note.id} 
                    onClick={() => handleNotificationClick(note)}
                    className={`p-4 flex items-start transition-all cursor-pointer group ${getBgColor(note.type, note.read)}`}
                  >
                    <div className="mt-0.5 mr-3 shrink-0">
                      {getIcon(note.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm font-bold ${!note.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {note.title}
                        </p>
                        {!note.read && (
                          <button 
                            onClick={(e) => handleMarkRead(note.id, e)}
                            className="text-gray-400 hover:text-blue-600 ml-2 p-1"
                            title="Mark read"
                          >
                            <span className="w-2 h-2 bg-blue-600 rounded-full block"></span>
                          </button>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 line-clamp-2 ${!note.read ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                          {note.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-gray-400 font-medium">
                            {new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                          {note.relatedTaskId && (
                              <span className="text-[10px] flex items-center text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                  View Action <ArrowRight className="w-3 h-3 ml-1" />
                              </span>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;