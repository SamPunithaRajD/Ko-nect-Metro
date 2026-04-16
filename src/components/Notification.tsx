import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { KMRL_COLORS } from '../lib/colors';

type NotificationProps = {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
};

export const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: {
      backgroundColor: 'rgba(40, 167, 69, 0.1)',
      borderColor: KMRL_COLORS.status.ready,
      color: '#155724',
    },
    error: {
      backgroundColor: 'rgba(227, 30, 36, 0.1)',
      borderColor: KMRL_COLORS.primary,
      color: KMRL_COLORS.primaryDark,
    },
    info: {
      backgroundColor: 'rgba(0, 114, 206, 0.1)',
      borderColor: KMRL_COLORS.lightBlue,
      color: '#004085',
    },
  };

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 border rounded-lg shadow-lg animate-in slide-in-from-top"
      style={styles[type]}
    >
      {icons[type]}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
