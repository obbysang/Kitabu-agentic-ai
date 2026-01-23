import React from 'react'
import { X, Check, Info, AlertTriangle, AlertCircle, Clock } from 'lucide-react'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  timestamp: Date
  read: boolean
}

interface NotificationsProps {
  notifications: Notification[]
  onClose: () => void
  onMarkAsRead: (id: string) => void
  onClearAll: () => void
}

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'success':
      return <div className="p-2 bg-green-100 text-green-600 rounded-full"><Check size={16} /></div>
    case 'warning':
      return <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full"><AlertTriangle size={16} /></div>
    case 'error':
      return <div className="p-2 bg-red-100 text-red-600 rounded-full"><AlertCircle size={16} /></div>
    default:
      return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Info size={16} /></div>
  }
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export const Notifications: React.FC<NotificationsProps> = ({ 
  notifications, 
  onClose, 
  onMarkAsRead,
  onClearAll
}) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900">Notifications</h3>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {notifications.filter(n => !n.read).length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button 
              onClick={onClearAll}
              className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              Clear all
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-3">
            <div className="p-3 bg-slate-100 rounded-full">
              <Clock size={24} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs text-slate-400">We'll notify you when something important happens.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-slate-50 transition-colors relative group cursor-pointer ${!notification.read ? 'bg-blue-50/30' : ''}`}
                onClick={() => onMarkAsRead(notification.id)}
              >
                <div className="flex gap-3 items-start">
                  <NotificationIcon type={notification.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
          <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors py-1">
            View all notifications
          </button>
        </div>
      )}
    </div>
  )
}
