"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  type CSSProperties,
  memo,
  useMemo,
} from "react";

export type TextShimmerProps = {
  children: string;
  as?: "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  duration?: number;
  spread?: number;
};

// Pre-create motion components for supported elements
const motionComponents = {
  p: motion.p,
  span: motion.span,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
} as const;

const ShimmerComponent = ({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) => {
  const MotionComponent = motionComponents[Component];

  const dynamicSpread = useMemo(
    () => (children?.length ?? 0) * spread,
    [children, spread]
  );

  return (
    <MotionComponent
      animate={{ backgroundPosition: "0% center" }}
      className={cn(
        "relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent",
        "[background-repeat:no-repeat,padding-box]",
        // Light mode: gray base with darker shimmer
        "[--base-color:#a1a1aa] [--shimmer-color:#000]",
        // Dark mode: darker gray base with white shimmer
        "dark:[--base-color:#71717a] dark:[--shimmer-color:#fff]",
        className
      )}
      initial={{ backgroundPosition: "100% center" }}
      style={
        {
          "--spread": `${dynamicSpread}px`,
          "--bg": "linear-gradient(90deg, transparent calc(50% - var(--spread)), var(--shimmer-color), transparent calc(50% + var(--spread)))",
          backgroundImage:
            "var(--bg), linear-gradient(var(--base-color), var(--base-color))",
        } as CSSProperties
      }
      transition={{
        repeat: Number.POSITIVE_INFINITY,
        duration,
        ease: "linear",
      }}
    >
      {children}
    </MotionComponent>
  );
};

export const Shimmer = memo(ShimmerComponent);
