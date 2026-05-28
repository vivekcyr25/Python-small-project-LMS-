import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'info' | 'neutral' | 'premium'
}

function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  const variants = {
    neutral: "bg-white/10 text-white border-white/10",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/20",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/20",
    premium: "bg-gradient-to-r from-violet-600/30 to-cyan-600/30 text-cyan-300 border-cyan-500/30"
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
