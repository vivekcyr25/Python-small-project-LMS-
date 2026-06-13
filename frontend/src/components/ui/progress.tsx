import * as React from "react"
import { ProgressBarComponent } from '@syncfusion/ej2-react-progressbar'
import { cn } from "../../lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  label?: string
  useSyncfusion?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, label, useSyncfusion = true, ...props }, ref) => {
    if (useSyncfusion) {
      return (
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {label && (
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px] text-ios-text-secondary">{label}</span>
              <span className="text-[11px] font-medium text-ios-text">{value}%</span>
            </div>
          )}
          <ProgressBarComponent
            id={`progress-${Math.random().toString(36).slice(2)}`}
            type="Linear"
            height="6"
            value={value}
            animation={{ enable: true, duration: 800 }}
            trackThickness={6}
            progressThickness={6}
            cornerRadius="Round"
          />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]",
          className
        )}
        {...props}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-ios-green to-ios-accent transition-all duration-700 ease-ios"
          style={{ width: `${value}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
