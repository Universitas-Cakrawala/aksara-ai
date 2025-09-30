import { cn } from '@/lib/utils';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { Info } from 'lucide-react';
import * as React from 'react';

const labelVariants = cva(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    {
        variants: {
            size: {
                sm: 'text-sm',
                md: 'text-base',
                lg: 'text-lg',
            },
            state: {
                default: 'text-gray-700',
                error: 'text-destructive',
                disabled: 'text-muted-foreground',
            },
            required: {
                true: "after:content-['*'] after:ml-0.5 after:text-destructive",
                false: '',
            },
        },
        defaultVariants: {
            size: 'md',
            state: 'default',
            required: false,
        },
    },
);

export interface LabelProps
    extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
        VariantProps<typeof labelVariants> {
    helperText?: string;
    tooltip?: string;
}

const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
    ({ className, size, state, required, helperText, tooltip, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1">
                <LabelPrimitive.Root
                    ref={ref}
                    className={cn(labelVariants({ size, state, required, className }))}
                    {...props}
                >
                    {props.children}
                    {tooltip && (
                        <span title={tooltip}>
                            <Info
                                className="ml-1 inline-block h-3 w-3 cursor-help text-gray-400 hover:text-gray-600"
                            />
                        </span>
                    )}
                </LabelPrimitive.Root>
                {helperText && <span className="text-xs text-muted-foreground">{helperText}</span>}
            </div>
        );
    },
);

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
