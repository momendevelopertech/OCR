import * as React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'destructive' | 'outline' }>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-900/80 dark:bg-neutral-50 dark:text-neutral-900',
      secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80 dark:bg-neutral-800 dark:text-neutral-50',
      destructive: 'bg-red-500 text-neutral-50 shadow hover:bg-red-500/80',
      outline: 'border border-neutral-200 text-neutral-950 dark:border-neutral-800 dark:text-neutral-50',
    };
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors',
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = 'Badge';

export { Badge };
