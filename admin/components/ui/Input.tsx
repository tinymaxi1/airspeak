import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors',
        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-airspeak-red focus-visible:border-airspeak-red',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-20 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors',
        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-airspeak-red focus-visible:border-airspeak-red',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export function Label({
  children,
  htmlFor,
  required,
  hint,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5', className)}
    >
      {children}
      {required && <span className="text-airspeak-red ml-1">*</span>}
      {hint && <span className="ml-2 text-muted-foreground/70 normal-case font-normal">{hint}</span>}
    </label>
  );
}

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-airspeak-red focus-visible:border-airspeak-red',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';
