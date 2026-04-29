import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-airspeak-red focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-airspeak-red text-white hover:bg-airspeak-red/90',
        secondary: 'bg-airspeak-navy text-white hover:bg-airspeak-navy/90',
        outline: 'border border-border bg-white text-foreground hover:bg-secondary',
        ghost: 'text-foreground hover:bg-secondary',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        gold: 'bg-airspeak-gold text-airspeak-navy hover:bg-airspeak-gold/90',
        green: 'bg-airspeak-green text-white hover:bg-airspeak-green/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
