'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface HomeSectionProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'zoom';
  delay?: number;
}

export default function HomeSection({
  children,
  className = '',
  direction = 'up',
  delay = 0,
}: HomeSectionProps) {
  const initial = {
    up: { opacity: 0, y: 50 },
    left: { opacity: 0, x: 80 },
    right: { opacity: 0, x: -80 },
    zoom: { opacity: 0, scale: 0.9 },
  }[direction];

  const animate = {
    up: { opacity: 1, y: 0 },
    left: { opacity: 1, x: 0 },
    right: { opacity: 1, x: 0 },
    zoom: { opacity: 1, scale: 1 },
  }[direction];

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
