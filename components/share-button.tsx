"use client";

import { useState, useCallback } from "react";

interface ShareButtonProps {
  url?: string;
  title?: string;
  className?: string;
}

export function ShareButton({
  url,
  title = "Check this out",
  className = "inline-flex items-center gap-1.5 rounded-full bg-tattvam-purple-50 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-100",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    let shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    if (typeof window !== "undefined" && shareUrl.startsWith("/")) {
      shareUrl = `${window.location.origin}${shareUrl}`;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url, title]);

  return (
    <button
      onClick={handleShare}
      className={className}
      aria-label="Share link"
      type="button"
    >
      <span>🔗</span>
      <span>{copied ? "Link copied!" : "Share"}</span>
    </button>
  );
}
