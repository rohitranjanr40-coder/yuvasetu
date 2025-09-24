
'use client';

import { motion } from 'framer-motion';

export const TickVibeIcon = (props: React.SVGProps<SVGSVGElement>) => {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: 'spring', duration: 1.5, bounce: 0 },
        opacity: { duration: 0.01 },
      },
    },
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#tick-vibe-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="hidden"
      animate="visible"
      {...props}
    >
      <defs>
        <linearGradient id="tick-vibe-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
        </linearGradient>
      </defs>
      <motion.path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" variants={pathVariants} />
      <motion.path d="M8 14s1.5 2 4 2 4-2 4-2" variants={pathVariants} custom={1} />
      <motion.line x1="9" y1="9" x2="9.01" y2="9" variants={pathVariants} custom={2} />
      <motion.line x1="15" y1="9" x2="15.01" y2="9" variants={pathVariants} custom={2} />
    </motion.svg>
  );
};
