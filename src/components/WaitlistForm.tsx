"use client";
import { useState, useEffect } from "react";

interface Props {
  company: string;
  source?: string;
  cta?: string;
  placeholder?: string;
  thanks?: string;
  className?: string;
  apiBase?: string;
}

// Universal waitlist / email-capture widget. Posts to MCC `/api/leads` with
// the page's UTM params auto-attached. Drop into any landing page and
// emails go to data/leads/<company>.jsonl + listmonk + mautic mirrors.
export function WaitlistForm({
  company,
  source = "homepage",
  cta = "Get early access",
  placeholder = "you@work.com",
  thanks = "You're in. Watch your inbox.",
  className = "",
  apiBase,
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState("");
  const [utm, setUtm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const sp = new URLSearchParams(window.location.search);
      setUtm({
        utm_source: sp.get("utm_source") || "",
        utm_medium: sp.get("utm_medium") || "",
        utm_campaign: sp.get("utm_campaign") || "",
        utm_content: sp.get("utm_content") || "",
      });
    } catch {}
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Need a real email.");
      setStatus("err");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const base =
        apiBase ||
        process.env.NEXT_PUBLIC_MCC_API ||
        "https://mcc.jonakfir.com";
      const res = await fetch(`${base}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          email: email.trim().toLowerCase(),
          source,
          referrer: typeof document !== "undefined" ? document.referrer : "",
          ...utm,
        }),
      });
      if (!res.ok) throw new Error(`server ${res.status}`);
      setStatus("ok");
      setEmail("");
    } catch (e2) {
      setStatus("err");
      setError(e2 instanceof Error ? e2.message : "Try again in a sec.");
    }
  };

  if (status === "ok") {
    return (
      <div className={`rounded-lg border border-emerald-300/50 bg-emerald-50/50 px-4 py-3 text-emerald-900 ${className}`}>
        {thanks}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`flex flex-col gap-2 sm:flex-row ${className}`}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        autoComplete="email"
        inputMode="email"
        className="flex-1 rounded-lg border border-current/15 bg-white/5 px-4 py-3 text-base placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-current/20"
        disabled={status === "loading"}
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={status === "loading" || !email}
        className="rounded-lg bg-current px-5 py-3 text-base font-semibold text-white opacity-90 transition hover:opacity-100 disabled:opacity-60"
      >
        <span className="text-white">
          {status === "loading" ? "..." : cta}
        </span>
      </button>
      {status === "err" && (
        <p className="basis-full text-sm text-red-700">{error}</p>
      )}
    </form>
  );
}
