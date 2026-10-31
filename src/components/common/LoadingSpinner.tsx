import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string; fullPage?: boolean }> = ({
  message = 'Loading curated experiences...',
  fullPage = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-gold-200 animate-ping opacity-25"></div>
        <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-gold-500 border-r-gold-500 animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-charcoal-500 tracking-wide">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
