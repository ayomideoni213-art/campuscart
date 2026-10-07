import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { X, Bell, Package, ShieldCheck, MessageSquare, Check } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToTab
}) => {
  const { currentUser } = useAuth();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useMarketplace();

  if (!isOpen || !currentUser) return null;

  const userNotifs = notifications.filter((n) => n.user_id === currentUser.id);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'moderation':
        return <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-stone-600 dark:text-stone-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white dark:bg-[#151921] shadow-2xl border-l border-stone-200 dark:border-[#262e3d] flex flex-col transition-colors">
          {/* Header */}
          <div className="p-4 border-b border-stone-200 dark:border-[#222936] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-stone-900 dark:text-amber-400" />
              <h2 className="text-sm font-bold text-stone-900 dark:text-white">Notifications</h2>
              <span className="text-xs text-stone-400 dark:text-stone-500">({userNotifs.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {userNotifs.some((n) => !n.is_read) && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-[#222936] p-2 space-y-1">
            {userNotifs.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400 dark:text-stone-500">
                You're all caught up! No notifications.
              </div>
            ) : (
              userNotifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    if (notif.link_tab) {
                      onNavigateToTab(notif.link_tab);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                    notif.is_read
                      ? 'bg-white dark:bg-[#151921] opacity-70'
                      : 'bg-stone-50 dark:bg-[#1a2230] border border-stone-200/70 dark:border-[#262e3d] shadow-2xs'
                  }`}
                >
                  <div className="p-2 bg-stone-100 dark:bg-[#20293a] rounded-lg shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                      {notif.title}
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mt-0.5">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 font-mono">
                      {new Date(notif.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
