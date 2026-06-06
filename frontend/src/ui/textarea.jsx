import * as React from "react"
import { cn } from "../lib/utils"

const Textarea = React.forwardRef(({ className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
        (<textarea
            id={textareaId}
            className={cn(
                "flex min-h-[96px] w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:border-input",
                className
            )}
            ref={ref}
            {...props} />)
    );
})
Textarea.displayName = "Textarea"

export { Textarea }

