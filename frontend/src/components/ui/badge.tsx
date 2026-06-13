import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'info' | 'neutral' | 'premium'
}

function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  const variants = {
    neutral: "bg-white/[0.08] text-ios-text border-white/10",
    success: "bg-ios-green/15 text-ios-green border-ios-green/20",
    warning: "bg-ios-orange/15 text-ios-orange border-ios-orange/20",
    info: "bg-ios-accent/8 text-ios-accent border-ios-accent/12",
    premium: "bg-ios-accent/6 text-ios-accent border-ios-accent/15 backdrop-blur-ios",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-all duration-300 ease-ios",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
