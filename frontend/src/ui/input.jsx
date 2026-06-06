import * as React from "react"

import { cn } from "../lib/utils"

function Input({
  className,
  id,
  type,
  ...props
}) {
  const isFile = type === "file";
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <input
      id={inputId}
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input h-11 w-full min-w-0 rounded-xl border bg-background px-3.5 text-sm shadow-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:border-input",
        isFile
          ? "py-1 file:mr-3 file:h-9 file:rounded-lg file:border file:border-border file:bg-secondary file:px-3 file:py-0 file:text-sm file:font-medium"
          : "py-2 file:inline-flex file:h-9 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none focus:outline-none",
        "[&:-webkit-autofill]:bg-background [&:-webkit-autofill]:text-foreground [&:-webkit-autofill:hover]:bg-background [&:-webkit-autofill:focus]:bg-background [&:-webkit-autofill]:focus-visible:ring-ring/50 [&:-webkit-autofill]:focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props} />
  );
}

export { Input }

