'use client';
/**
 * SilentEye — Cloudflare Turnstile widget (invisible anti-bot).
 *
 * Renders once and hands the solved token back via onToken. If the public
 * site key isn't configured it renders nothing (graceful — the backend also
 * skips verification when its secret is absent).
 */
import { useEffect, useRef } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

export default function TurnstileWidget({ onToken }: { onToken: (token: string | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (!SITE_KEY) return;

    const render = () => {
      if (rendered.current || !containerRef.current || !window.turnstile) return;
      rendered.current = true;
      window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(null),
        'error-callback': () => onToken(null),
      });
    };

    if (window.turnstile) {
      render();
      return;
    }
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = render;
      document.head.appendChild(s);
      return;
    }
    // Script is loading from a previous mount — poll until ready.
    const iv = setInterval(() => {
      if (window.turnstile) {
        clearInterval(iv);
        render();
      }
    }, 200);
    return () => clearInterval(iv);
  }, [onToken]);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className="my-3 flex justify-center" />;
}
