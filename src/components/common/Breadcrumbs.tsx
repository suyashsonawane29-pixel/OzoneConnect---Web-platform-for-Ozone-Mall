import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  light?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, light = false }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-medium">
      <Link
        to="/"
        className={`flex items-center gap-1 transition-colors ${
          light ? 'text-charcoal-300 hover:text-white' : 'text-charcoal-400 hover:text-charcoal-900'
        }`}
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight
              className={`w-3.5 h-3.5 ${light ? 'text-charcoal-500' : 'text-charcoal-300'}`}
            />
            {isLast || !item.path ? (
              <span
                className={`truncate max-w-[200px] sm:max-w-xs font-semibold ${
                  light ? 'text-gold-300' : 'text-gold-700'
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className={`truncate max-w-[150px] transition-colors ${
                  light ? 'text-charcoal-300 hover:text-white' : 'text-charcoal-500 hover:text-charcoal-900'
                }`}
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
