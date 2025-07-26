
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

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
    <div className={cn("grid grid-cols-3 sm:grid-cols-4 gap-2", className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value)
        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => handleToggle(option.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "p-2 sm:p-3 rounded-md border text-center text-xs sm:text-sm font-medium transition-colors duration-200 relative overflow-hidden",
              isSelected
                ? "bg-primary border-primary/80 text-primary-foreground shadow-lg"
                : "bg-transparent border-input hover:bg-accent/50 hover:border-accent"
            )}
          >
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute top-1 right-1 h-4 w-4 bg-primary-foreground rounded-full flex items-center justify-center"
                >
                  <Check className="h-3 w-3 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
            {option.label}
          </motion.button>
        )
      })}
    </div>
  )
}
