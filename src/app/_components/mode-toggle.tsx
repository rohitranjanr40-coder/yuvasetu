
"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

const DiyaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <defs>
      <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path
      d="M12.55 5.3C12.86 4.3 12.56 3.1 11.5 3.1C10.44 3.1 10.14 4.3 10.45 5.3C11.15 7.8 8.5 9.55 8.5 11.5C8.5 13.43 10.07 15 12 15C13.93 15 15.5 13.43 15.5 11.5C15.5 9.55 12.85 7.8 12.55 5.3Z"
      fill="url(#flameGradient)"
      stroke="none"
    />
    <path
      d="M2 17c0 2.21 4.48 4 10 4s10-1.79 10-4"
      stroke="#9333ea"
      strokeWidth="2.5"
    />
    <path
      d="M2 17c0-2.21 4.48-4 10-4s10 1.79 10 4"
      stroke="#a855f7"
      strokeWidth="2.5"
      fill="#a855f7"
    >
      <animate attributeName="fill" values="#a855f7;#c084fc;#a855f7" dur="3s" repeatCount="indefinite" />
    </path>
  </svg>
)


export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <DiyaIcon className="absolute h-[1.5rem] w-[1.5rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
