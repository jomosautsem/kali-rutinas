
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type MultiToggleOption = {
  value: string
  label: string
}

type MultiToggleButtonGroupProps = {
  options: MultiToggleOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
}

export function MultiToggleButtonGroup({
  options,
  selected,
  onChange,
  className,
}: MultiToggleButtonGroupProps) {
  const handleToggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    )
  }

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggle(option.value)}
            className={cn(
              "p-3 rounded-md border text-center text-sm font-medium transition-colors duration-200",
              isSelected
                ? "bg-primary border-primary text-primary-foreground shadow-md"
                : "bg-transparent border-input hover:bg-accent/50"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
