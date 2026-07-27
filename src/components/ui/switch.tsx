"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border shadow-xs transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-[#D3FD50]/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[#D3FD50] data-[state=checked]:bg-[#D3FD50] data-[state=unchecked]:border-white/20 data-[state=unchecked]:bg-white/15",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=checked]:bg-black data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-white"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
