import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

const Popover = PopoverPrimitive.Root;

interface PopoverTriggerProps {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  [key: string]: any;
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, className, title, ...props }, ref) => (
    <PopoverPrimitive.Trigger {...props} asChild>
      {children || <button className={className}>{title}</button>}
    </PopoverPrimitive.Trigger>
  )
);
PopoverTrigger.displayName = "PopoverTrigger";

interface PopoverContentProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  [key: string]: any;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, title, className, align, side, ...props }, forwardedRef) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className="bg-white dark:bg-slate-800 text-sm w-sm rounded-md p-2.5 shadow-md"
        align={align}
        side={side}
        sideOffset={5}
        {...props}
        ref={forwardedRef}
      >
        <div className="dark:text-slate-900 text-slate-200 bg-slate-900 dark:bg-slate-600 -mx-2.5 -mt-2.5 p-2.5  rounded-sm text-sm font-medium rounded-t-md rounded-b-none">
          {title}
        </div>
        <p className="mt-2">{children}</p>
        <PopoverPrimitive.Arrow className="fill-white dark:fill-slate-600" />
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
