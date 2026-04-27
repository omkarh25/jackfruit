"use client";

interface FloatingOrbsProps {
  count?: number;
  className?: string;
}

/**
 * Floating decorative orbs for premium background effect.
 */
export function FloatingOrbs({ count = 5, className = "" }: FloatingOrbsProps) {
  const orbs = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 300 + 150,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 4 + 6,
    delay: Math.random() * 2,
    type: i % 2 === 0 ? "purple" : "gold"
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`orb orb-${orb.type} animate-float-slow`}
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            animationDuration: `${orb.duration}s`,
            animationDelay: `${orb.delay}s`
          }}
        />
      ))}
    </div>
  );
}