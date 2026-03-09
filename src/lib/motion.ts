import type { Variants } from 'framer-motion';

/** Fade up — use with whileInView or animate */
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/** Stagger container */
export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09 } },
};

/** Card entrance (stagger child) */
export const cardEntrance: Variants = {
  hidden:  { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1 },
};

/** Fade in only */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};

/** Scale up */
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

/** Shared transition preset */
export const smoothTransition = { duration: 0.5, ease: 'easeOut' } as const;
export const fastTransition   = { duration: 0.35, ease: 'easeOut' } as const;
export const cardTransition   = { duration: 0.45, ease: 'easeOut' } as const;

/** Viewport preset — trigger once, 80 px before entering */
export const viewportOnce = { once: true, margin: '-80px' } as const;
