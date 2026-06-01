import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';

/**
 * Animated number counter that counts up from 0 when in viewport
 * Supports suffixes like "k+", "+", "%"
 */
interface CountUpProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export default function CountUp({ end, suffix = '', prefix = '', duration = 2000, className = '' }: CountUpProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for satisfying deceleration at the end
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * end);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}
