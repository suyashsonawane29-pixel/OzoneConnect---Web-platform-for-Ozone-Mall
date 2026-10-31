import React from 'react';
import { LucideIcon, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Search,
  actionText,
  actionLink,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-charcoal-100 shadow-subtle max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-gold-50 flex items-center justify-center text-gold-600 mb-4 border border-gold-200/50">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">{title}</h3>
      <p className="text-sm text-charcoal-500 mb-6 leading-relaxed">{description}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-charcoal-900 text-white hover:bg-gold-600 transition-colors shadow-sm"
        >
          {actionText}
        </Link>
      )}
      {actionText && onActionClick && !actionLink && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-charcoal-900 text-white hover:bg-gold-600 transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
