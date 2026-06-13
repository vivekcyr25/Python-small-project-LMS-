import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'glass' | 'gradient' | 'ios'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-500 ease-ios focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-accent/40 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"

    const variants = {
      default: "bg-white text-black hover:bg-white/90 shadow-lg",
      destructive: "bg-ios-red text-white hover:bg-ios-red/90",
      outline: "border border-white/15 bg-transparent hover:bg-white/[0.06] text-ios-text",
      secondary: "bg-white/10 text-ios-text hover:bg-white/15",
      ghost: "hover:bg-white/[0.06] text-ios-text",
      link: "underline-offset-4 hover:underline text-ios-accent",
      glass: "glass text-ios-text hover:bg-white/10",
      gradient: "btn-ios text-white",
      ios: "btn-ios text-white",
    }

    const sizes = {
      sm: "h-9 px-3.5 text-xs rounded-[12px]",
      md: "h-11 px-5 text-sm rounded-[14px]",
      lg: "h-12 px-6 text-[15px] rounded-[16px]",
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
