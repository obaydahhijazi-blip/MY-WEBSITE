"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoCentroid, geoDistance, geoGraticule10, geoOrthographic, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { FeatureCollection, Geometry, LineString } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";

type Props = {
  countries: string[];
  names: Record<string, string>;
  selected: string | null;
  hovered: string | null;
  highlightAll: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
};

type Label = { x: number; y: number; name: string } | null;
type Engine = { focus: (id: string) => void; redraw: () => void };

const SIZE = 560;
const R = SIZE / 2 - 14;
const HOME = "760"; // Syria — arcs start here

/**
 * Orthographic globe rendered as SVG with d3-geo: a real sphere projection (drag to rotate,
 * eases to the chosen country, arcs from Syria). No WebGL, so it can't fail on weak devices;
 * the animation loop runs only while the globe is visible and moving.
 */
export default function Globe({ countries, names, selected, hovered, highlightAll, onHover, onSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const engine = useRef<Engine | null>(null);
  const labelId = useRef<string | null>(null);
  const [label, setLabel] = useState<Label>(null);

  const data = useMemo(() => {
    const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
    const all = feature(topo, topo.objects.countries) as FeatureCollection<Geometry, { name: string }>;
    const chosen = new Set(countries);
    const others: FeatureCollection = { type: "FeatureCollection", features: all.features.filter((f) => !chosen.has(String(f.id)) && f.id !== "010") };
    const picked = countries
      .map((id) => all.features.find((f) => String(f.id) === id))
      .filter(Boolean)
      .map((f) => ({ id: String(f!.id), feature: f!, centroid: geoCentroid(f!) as [number, number] }));
    const home = picked.find((p) => p.id === HOME) ?? picked[0];
    const arcs = home
      ? picked.filter((p) => p.id !== home.id).map((p) => ({ id: p.id, line: { type: "LineString", coordinates: [home.centroid, p.centroid] } as LineString }))
      : [];
    const borders = mesh(topo, topo.objects.countries, (a, b) => a !== b);
    return { others, picked, arcs, borders };
  }, [countries]);

  // All animation state lives inside this effect; path strings are written straight to the DOM.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const projection = geoOrthographic().scale(R).translate([SIZE / 2, SIZE / 2]).clipAngle(90).precision(0.6);
    const path = geoPath(projection);
    const graticule = geoGraticule10();
    let rot: [number, number] = [-28, -30];
    let target: [number, number] | null = null;
    let vel = 0;
    let drag: { x: number; y: number; r: [number, number]; t: number; px: number; touch: boolean } | null = null;
    let idleUntil = 0;
    let visible = false;
    let raf = 0;

    const front = (c: [number, number]) => geoDistance(c, [-rot[0], -rot[1]]) < Math.PI / 2 - 0.05;
    const draw = () => {
      projection.rotate(rot);
      const set = (sel: string, d: GeoPermissibleObjects) => svg.querySelector(sel)?.setAttribute("d", path(d) ?? "");
      set(".g-grat", graticule);
      set(".g-land", data.others);
      set(".g-borders", data.borders);
      for (const p of data.picked) set(`[data-c="${p.id}"]`, p.feature);
      for (const a of data.arcs) set(`[data-arc="${a.id}"]`, a.line);
      for (const p of data.picked) {
        const dot = svg.querySelector<SVGGElement>(`[data-dot="${p.id}"]`);
        const xy = projection(p.centroid);
        if (!dot) continue;
        dot.style.display = front(p.centroid) && xy ? "" : "none";
        if (xy) dot.setAttribute("transform", `translate(${xy[0].toFixed(1)} ${xy[1].toFixed(1)})`);
      }
      const p = data.picked.find((x) => x.id === labelId.current);
      const xy = p && front(p.centroid) ? projection(p.centroid) : null;
      setLabel(p && xy ? { x: (xy[0] / SIZE) * 100, y: (xy[1] / SIZE) * 100, name: names[p.id] ?? p.id } : null);
    };

    const loop = () => {
      raf = 0;
      if (!visible) return;
      let moving = false;
      if (target) {
        let dl = target[0] - rot[0];
        dl = ((dl + 540) % 360) - 180; // shortest way round
        const dp = target[1] - rot[1];
        rot = [rot[0] + dl * 0.1, rot[1] + dp * 0.1];
        if (Math.abs(dl) < 0.05 && Math.abs(dp) < 0.05) target = null;
        moving = true;
      } else if (!drag && Math.abs(vel) > 0.01) {
        rot = [rot[0] + vel, rot[1]];
        vel *= 0.94;
        moving = true;
      } else if (!drag && !reduce.matches && performance.now() > idleUntil) {
        rot = [rot[0] + 0.06, rot[1]];
        moving = true;
      }
      if (moving || drag) {
        draw();
        raf = requestAnimationFrame(loop);
      }
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    const down = (e: PointerEvent) => {
      svg.setPointerCapture?.(e.pointerId);
      drag = { x: e.clientX, y: e.clientY, r: [...rot] as [number, number], t: performance.now(), px: e.clientX, touch: e.pointerType === "touch" };
      target = null;
      vel = 0;
      idleUntil = performance.now() + 6000;
      kick();
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const k = 0.32;
      const tilt = drag.touch ? 0 : (e.clientY - drag.y) * k; // touch: horizontal only, vertical scrolls the page
      rot = [drag.r[0] + (e.clientX - drag.x) * k, Math.max(-60, Math.min(60, drag.r[1] - tilt))];
      const now = performance.now();
      vel = ((e.clientX - drag.px) * k) / Math.max(1, (now - drag.t) / 16);
      drag.px = e.clientX;
      drag.t = now;
    };
    const up = () => {
      drag = null;
      idleUntil = performance.now() + 5000;
      kick();
    };

    engine.current = {
      focus: (id) => {
        const p = data.picked.find((x) => x.id === id);
        if (!p) return;
        const to: [number, number] = [-p.centroid[0], Math.max(-55, Math.min(55, -p.centroid[1] + 8))];
        idleUntil = performance.now() + 6000;
        vel = 0;
        if (reduce.matches) {
          rot = to;
          draw();
        } else {
          target = to;
          kick();
        }
      },
      redraw: draw,
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(svg);
    svg.addEventListener("pointerdown", down);
    svg.addEventListener("pointermove", move);
    svg.addEventListener("pointerup", up);
    svg.addEventListener("pointercancel", up);
    draw();
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      svg.removeEventListener("pointerdown", down);
      svg.removeEventListener("pointermove", move);
      svg.removeEventListener("pointerup", up);
      svg.removeEventListener("pointercancel", up);
      engine.current = null;
    };
  }, [data, names]);

  // Label follows the hovered / selected country; selecting turns the globe to face it.
  useEffect(() => {
    labelId.current = hovered ?? selected;
    engine.current?.redraw();
  }, [hovered, selected]);
  useEffect(() => {
    if (selected) engine.current?.focus(selected);
  }, [selected]);

  return (
    <div className="globe" data-all={highlightAll || undefined}>
      <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} className="globe-svg" aria-hidden="true" onPointerLeave={() => onHover(null)}>
        <defs>
          <radialGradient id="g-ocean" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#0b5560" />
            <stop offset="55%" stopColor="#023640" />
            <stop offset="100%" stopColor="#001a20" />
          </radialGradient>
          <radialGradient id="g-glow" cx="50%" cy="50%" r="50%">
            <stop offset="86%" stopColor="#00BBD4" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#00BBD4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g-shade" cx="70%" cy="75%" r="70%">
            <stop offset="40%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
          </radialGradient>
        </defs>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R + 14} fill="url(#g-glow)" />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="url(#g-ocean)" />
        <path className="g-grat" />
        <path className="g-land" />
        <path className="g-borders" />
        {data.picked.map((p) => (
          <path
            key={p.id}
            data-c={p.id}
            className="g-country"
            data-on={p.id === selected || p.id === hovered || undefined}
            onPointerEnter={(e) => e.pointerType === "mouse" && onHover(p.id)}
            onPointerLeave={(e) => e.pointerType === "mouse" && onHover(null)}
            onClick={() => onSelect(p.id)}
          />
        ))}
        {data.arcs.map((a, i) => (
          <path key={a.id} data-arc={a.id} className="g-arc" style={{ ["--i" as string]: i }} />
        ))}
        {data.picked.map((p) => (
          <g key={p.id} data-dot={p.id} className="g-dot" data-on={p.id === selected || p.id === hovered || undefined} onClick={() => onSelect(p.id)}>
            <circle r="12" fill="transparent" />
            <circle className="g-dot-ring" r="7" />
            <circle className="g-dot-core" r="3.2" />
          </g>
        ))}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="url(#g-shade)" pointerEvents="none" />
      </svg>
      {label ? (
        <span className="globe-tip" style={{ left: `${label.x}%`, top: `${label.y}%` }} role="status">
          {label.name}
        </span>
      ) : null}
    </div>
  );
}
