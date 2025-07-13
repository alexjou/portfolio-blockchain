import React from 'react';
import { useNotification } from '../context/NotificationContext';

const typeColors: Record<string, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 items-end">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`min-w-[220px] px-4 py-3 rounded shadow-lg text-white font-semibold flex items-center justify-between ${typeColors[n.type]}`}
        >
          <span>{n.message}</span>
          <button className="ml-4 text-white font-bold" onClick={() => removeNotification(n.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
