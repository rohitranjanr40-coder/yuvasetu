
'use client';

import { motion } from 'framer-motion';

export const PlaylistIcon = (props: React.SVGProps<SVGSVGElement>) => {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.2, type: 'spring', duration: 1.5, bounce: 0 },
        opacity: { delay: i * 0.2, duration: 0.01 },
      },
    }),
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#playlist-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="hidden"
      animate="visible"
      {...props}
    >
      <defs>
        <linearGradient id="playlist-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
        </linearGradient>
      </defs>
      
      {/* Musical Note */}
      <motion.path 
        d="M9 18V5l12-2v13" 
        variants={pathVariants}
        custom={1}
      />
      <motion.circle 
        cx="6" 
        cy="18" 
        r="3" 
        variants={pathVariants}
        custom={1.5}
      />
      <motion.circle 
        cx="18" 
        cy="16" 
        r="3" 
        variants={pathVariants}
        custom={2}
      />
    </motion.svg>
  );
};
