import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  testId?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  testId,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('ios-segmented', className)} data-testid={testId}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          data-testid={`role-${opt.value}`}
          onClick={() => onChange(opt.value)}
          className={cn(
            'ios-segmented-item flex items-center justify-center gap-1.5',
            value === opt.value && 'active',
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
