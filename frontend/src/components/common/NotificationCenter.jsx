import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'PM-KISAN Installment Credited', time: '2 hours ago', unread: true, type: 'success' },
    { id: 2, title: 'PM Vishwakarma Deadline Approaching', time: '1 day ago', unread: true, type: 'warning' },
    { id: 3, title: 'Application #SCH-2026-90 Sanctioned', time: '3 days ago', unread: false, type: 'info' },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 relative transition-all border border-slate-700"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-scale-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-emerald-400" /> Notifications
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] text-emerald-400 hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  n.unread ? 'bg-slate-800/90 border-slate-700 text-slate-100' : 'bg-slate-900/50 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{n.title}</span>
                  {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
