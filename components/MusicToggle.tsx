"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MusicIcon } from "@/components/icons";
import { MEDIA_EVENT } from "@/lib/scroll";

type Props = { src: string; title: string; volume: number; loop: boolean; className?: string };

const PREF_KEY = "obaydah:music";
const readPref = () => {
  try {
    return localStorage.getItem(PREF_KEY);
  } catch {
    return null;
  }
};
const writePref = (v: "on" | "off") => {
  try {
    localStorage.setItem(PREF_KEY, v);
  } catch {
    /* storage unavailable — preference simply isn't remembered */
  }
};

/**
 * Background music: OFF by default, never autoplays. The file is only requested after the
 * visitor presses the button (or, if they turned music on during an earlier visit, after
 * their first click or key press on this visit — browsers forbid starting audio sooner).
 */
export function MusicToggle({ src, title, volume, loop, className = "" }: Props) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const fade = useRef<number>(0);
  const ducked = useRef(false);
  const [playing, setPlaying] = useState(false);

  const ramp = useCallback((to: number, ms: number, done?: () => void) => {
    const el = audio.current;
    if (!el) return;
    cancelAnimationFrame(fade.current);
    const from = el.volume;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      el.volume = Math.max(0, Math.min(1, from + (to - from) * t * (2 - t)));
      if (t < 1) fade.current = requestAnimationFrame(step);
      else done?.();
    };
    fade.current = requestAnimationFrame(step);
  }, []);

  const play = useCallback(async () => {
    if (!audio.current) {
      const el = new Audio();
      el.preload = "auto";
      el.loop = loop;
      el.src = src;
      el.volume = 0;
      audio.current = el;
    }
    try {
      audio.current.volume = Math.min(audio.current.volume, volume);
      await audio.current.play();
      setPlaying(true);
      ramp(volume, 1400);
      return true;
    } catch {
      setPlaying(false);
      return false;
    }
  }, [loop, ramp, src, volume]);

  const pause = useCallback(() => {
    setPlaying(false);
    ramp(0, 700, () => audio.current?.pause());
  }, [ramp]);

  const toggle = () => {
    ducked.current = false;
    if (playing) {
      pause();
      writePref("off");
    } else {
      play().then((ok) => ok && writePref("on"));
    }
  };

  // Resume on the first deliberate interaction if the visitor had music on last time.
  useEffect(() => {
    if (readPref() !== "on") return;
    const start = (e: Event) => {
      if ((e.target as Element | null)?.closest?.("[data-music-toggle]")) return cleanup();
      play();
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", start, true);
      window.removeEventListener("keydown", start, true);
    };
    window.addEventListener("pointerdown", start, true);
    window.addEventListener("keydown", start, true);
    return cleanup;
  }, [play]);

  // Duck while a portfolio video plays, then come back.
  useEffect(() => {
    const onMedia = (e: Event) => {
      const state = (e as CustomEvent<{ state: "play" | "pause" }>).detail?.state;
      const el = audio.current;
      if (!el) return;
      if (state === "play" && !el.paused) {
        ducked.current = true;
        ramp(0, 400, () => el.pause());
        setPlaying(false);
      } else if (state === "pause" && ducked.current) {
        ducked.current = false;
        play();
      }
    };
    window.addEventListener(MEDIA_EVENT, onMedia);
    return () => window.removeEventListener(MEDIA_EVENT, onMedia);
  }, [play, ramp]);

  useEffect(
    () => () => {
      cancelAnimationFrame(fade.current);
      audio.current?.pause();
    },
    [],
  );

  return (
    <button
      type="button"
      data-music-toggle
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}
      title={title}
      className={`grid size-11 place-items-center rounded-full border border-current/20 transition-colors hover:border-current/60 ${className}`}
    >
      <MusicIcon playing={playing} className="size-[18px]" />
    </button>
  );
}
