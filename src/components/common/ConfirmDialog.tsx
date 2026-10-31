import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-charcoal-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-full flex-shrink-0 ${
                isDestructive ? 'bg-red-50 text-red-600' : 'bg-gold-50 text-gold-600'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg font-bold text-charcoal-900">{title}</h3>
              <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="text-charcoal-400 hover:text-charcoal-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-charcoal-700 hover:bg-charcoal-100 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
              }}
              disabled={loading}
              className={`px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-colors ${
                isDestructive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gold-600 hover:bg-gold-700'
              } disabled:opacity-50`}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
