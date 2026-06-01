import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'glass' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
    
    const variants = {
      default: "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20",
      outline: "border border-white/20 bg-transparent hover:bg-white/5 text-white",
      secondary: "bg-slate-800 text-white hover:bg-slate-700 shadow-lg shadow-slate-900/50",
      ghost: "hover:bg-white/5 text-white",
      link: "underline-offset-4 hover:underline text-white",
      glass: "glass text-white hover:bg-white/10",
      gradient: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-blue-500/25"
    }

    const sizes = {
      sm: "h-9 px-3 text-xs rounded-lg",
      md: "h-11 px-5 text-sm rounded-xl",
      lg: "h-12 px-6 text-base rounded-2xl"
    }

    const currentVariant = variants[variant] || variants.default
    const currentSize = sizes[size] || sizes.md

    return (
      <button
        className={cn(baseStyles, currentVariant, currentSize, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
