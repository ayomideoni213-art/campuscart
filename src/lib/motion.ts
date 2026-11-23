import type { Transition, Variants } from 'motion/react';

/** Consistent deceleration curve for CampusMart UI transitions. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const FAST_TRANSITION: Transition = {
  duration: 0.16,
  ease: EASE_OUT
};

export const NORMAL_TRANSITION: Transition = {
  duration: 0.22,
  ease: EASE_OUT
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: FAST_TRANSITION },
  exit: { opacity: 0, transition: { duration: 0.14 } }
};

export const dialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: NORMAL_TRANSITION },
  exit: { opacity: 0, scale: 0.98, y: 6, transition: { duration: 0.14 } }
};

export const drawerRightVariants: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { duration: 0.24, ease: EASE_OUT } },
  exit: { x: '100%', transition: { duration: 0.18, ease: EASE_OUT } }
};

export const drawerLeftVariants: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { duration: 0.24, ease: EASE_OUT } },
  exit: { x: '-100%', transition: { duration: 0.18, ease: EASE_OUT } }
};

export const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: FAST_TRANSITION },
  exit: { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }
};

export const stepVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: EASE_OUT } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } }
};

export const alertVariants: Variants = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: FAST_TRANSITION },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } }
};

export const tapPress = { scale: 0.97 };
