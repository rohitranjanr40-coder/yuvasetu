
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TickIconProps {
  isTicked: boolean;
}

export const TickIcon = ({ isTicked }: TickIconProps) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-7 h-7 transition-colors", isTicked ? "text-green-400" : "text-white")}
      whileTap={{ scale: 1.2 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <motion.path
        d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.path
        d="M22 4L12 14.01l-3-3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: isTicked ? 1 : 0, opacity: isTicked ? 1 : 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </motion.svg>
  );
};
