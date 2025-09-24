import * as React from "react"

export const ViralIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path 
            d="M5 8.5L10.5 10.5L19 7L21 17L11.5 14L5 15.5Z" 
            fill="hsl(var(--accent))" 
            stroke="hsl(var(--foreground))"
        />
        <path 
            d="M5 8.5L10.5 10.5V14L5 15.5V8.5Z" 
            fill="hsl(var(--primary))" 
            stroke="hsl(var(--foreground))"
        />
        <path 
            d="M9.5 14L10.5 20H12.5L11.5 14H9.5Z" 
            fill="hsl(var(--secondary))" 
            stroke="hsl(var(--foreground))"
        />
        <ellipse cx="6" cy="12" rx="3" ry="3.5" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" />
    </svg>
)
