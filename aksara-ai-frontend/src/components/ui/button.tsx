import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform duration-150 ease-in-out hover:scale-105 focus:scale-105 relative overflow-hidden',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
                success: 'bg-green-600 text-white hover:bg-green-700',
                warning: 'bg-yellow-500 text-black hover:bg-yellow-600',
                info: 'bg-blue-500 text-white hover:bg-blue-600',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 px-3',
                lg: 'h-11 px-8',
                icon: 'h-10 w-10 p-2',
            },
            fullWidth: {
                true: 'w-full justify-center',
                false: '',
            },
            iconOnly: {
                true: 'p-2 w-10 h-10 justify-center',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            fullWidth: false,
            iconOnly: false,
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    tooltip?: string;
    loadingText?: string;
}

const Spinner: React.FC = () => (
    <svg
        className="h-4 w-4 animate-spin text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
        ></path>
    </svg>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            loading = false,
            fullWidth = false,
            iconOnly = false,
            leftIcon,
            rightIcon,
            tooltip,
            loadingText,
            children,
            ...props
        },
        ref,
    ) => {
        const Comp = asChild ? Slot : 'button';

        return (
            <Comp
                className={cn(
                    buttonVariants({ variant, size, fullWidth, iconOnly, className }),
                    loading && 'cursor-wait opacity-70',
                )}
                ref={ref}
                disabled={loading || props.disabled}
                aria-busy={loading}
                title={tooltip}
                {...props}
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Spinner />
                        {loadingText && <span>{loadingText}</span>}
                    </div>
                ) : (
                    <>
                        {leftIcon && <span className="flex items-center">{leftIcon}</span>}
                        {children}
                        {rightIcon && <span className="flex items-center">{rightIcon}</span>}
                    </>
                )}
            </Comp>
        );
    },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
