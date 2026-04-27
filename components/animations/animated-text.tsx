"use client";

interface AnimatedTextProps {
  text: string;
  className?: string;
  staggerDelay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

/**
 * Text that animates word-by-word with stagger effect.
 */
export function AnimatedText({
  text,
  className = "",
  staggerDelay = 100,
  as: Tag = "h1"
}: AnimatedTextProps) {
  const words = text.split(" ");

  return (
    <Tag className={className}>
      {words.map((word, index) => (
        <span
          key={index}
          className="inline-block animate-fade-in-up opacity-0"
          style={{
            animationDelay: `${index * staggerDelay}ms`,
            animationFillMode: "forwards"
          }}
        >
          {word}
          {index < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}