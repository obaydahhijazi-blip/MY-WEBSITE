"use client";

import { useEffect, useRef, useState } from "react";

/** Keep the mailto link, with a small accessible one-click copy action beside it. */
export function CopyEmail({ email }: { email: string }) {
  const [message, setMessage] = useState("");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);
  const copy = async () => {
    if (timeout.current) clearTimeout(timeout.current);
    try {
      await navigator.clipboard.writeText(email);
      setMessage("تم نسخ البريد");
    } catch {
      setMessage("تعذّر النسخ التلقائي. يمكنك تحديد البريد ونسخه.");
    }
    timeout.current = setTimeout(() => setMessage(""), 2800);
  };
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <a href={`mailto:${email}`} className="text-white/80 hover:text-white">
        <bdi dir="ltr" className="font-latin">{email}</bdi>
      </a>
      <button type="button" onClick={copy} className="email-copy-btn" aria-label="نسخ عنوان البريد الإلكتروني" title="نسخ البريد">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="size-4">
          <rect x="8" y="8" width="11" height="11" rx="2"/>
          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>
        </svg>
      </button>
      {message ? <span role="status" className="w-full text-xs text-cyan">{message}</span> : null}
    </div>
  );
}
