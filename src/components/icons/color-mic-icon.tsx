
import * as React from "react"

export const ColorMicIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" fill="#0D6EFC" stroke="none" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="#4CAF50" strokeWidth="2.5" />
    <line x1="12" y1="19" x2="12" y2="22" stroke="#F57D1F" strokeWidth="2.5" />
  </svg>
)
