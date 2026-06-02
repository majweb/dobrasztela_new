import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  addon?: React.ReactNode
}

function Input({ className, type, addon, ...props }: InputProps) {
  const input = (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-brand-burgundy/20 dark:aria-invalid:ring-brand-burgundy/40 aria-invalid:border-brand-burgundy",
        addon && "rounded-l-none border-l-0",
        className
      )}
      {...props}
    />
  )

  if (addon) {
    return (
      <div className="flex w-full items-center">
        <div className="bg-muted text-muted-foreground border-input flex h-9 items-center rounded-l-md border border-r-0 px-3 text-sm font-medium whitespace-nowrap">
          {addon}
        </div>
        {input}
      </div>
    )
  }

  return input
}

export { Input }
