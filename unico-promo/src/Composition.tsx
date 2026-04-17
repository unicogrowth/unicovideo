import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const ACCENT = "#E8431A";
const BG = "#080808";
const FONT = "'Space Grotesk', 'Arial Black', sans-serif";

// ── Scene durations (frames @ 30fps) ─────────────────────────────────────────
const S1 = 85;   // logo reveal
const S2 = 100;  // problem
const S3 = 90;   // solution
const S4 = 140;  // services
const S5 = 95;   // tagline
const S6 = 120;  // CTA
export const TOTAL_FRAMES = S1 + S2 + S3 + S4 + S5 + S6; // 630

// ── Spring configs ────────────────────────────────────────────────────────────
type SpringCfg = { damping: number; stiffness: number; mass: number };
const CFG_SNAPPY:  SpringCfg = { damping: 10, stiffness: 120, mass: 0.9 };
const CFG_ELASTIC: SpringCfg = { damping:  7, stiffness: 100, mass: 1.0 };
const CFG_SMOOTH:  SpringCfg = { damping: 18, stiffness:  70, mass: 1.0 };

// ── Helpers ───────────────────────────────────────────────────────────────────
function spr(frame: number, fps: number, delay: number, cfg = CFG_SNAPPY) {
  return spring({ frame: Math.max(0, frame - delay), fps, config: cfg });
}

function vel(frame: number, fps: number, delay: number, cfg = CFG_SNAPPY) {
  // approximate instantaneous velocity for motion-blur simulation
  const a = spring({ frame: Math.max(0, frame - delay - 1), fps, config: cfg });
  const b = spring({ frame: Math.max(0, frame - delay),     fps, config: cfg });
  return Math.abs(b - a);
}

// ── Shared decorative elements ────────────────────────────────────────────────
function Grid() {
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `
          linear-gradient(rgba(232,67,26,.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(232,67,26,.045) 1px, transparent 1px)
        `,
        backgroundSize: "68px 68px",
        pointerEvents: "none",
      }}
    />
  );
}

function Orb({ cx, cy, size = 700, opacity = 0.11 }: { cx: string; cy: string; size?: number; opacity?: number }) {
  return (
    <div style={{
      position: "absolute", width: size, height: size,
      borderRadius: "50%", background: ACCENT,
      filter: "blur(130px)", opacity,
      left: cx, top: cy,
      transform: "translate(-50%,-50%)",
      pointerEvents: "none",
    }} />
  );
}

// Orange flash on scene entry — cinematic impact
function Flash({ frames = 5, intensity = 0.9 }: { frames?: number; intensity?: number }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, frames], [intensity, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: ACCENT, opacity, pointerEvents: "none", zIndex: 99 }} />;
}

// Bright white-orange flash (harder hit)
function HardFlash({ frames = 3 }: { frames?: number }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, frames], [1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, #fff 0%, ${ACCENT} 60%)`, opacity, pointerEvents: "none", zIndex: 99 }} />
  );
}

// Horizontal scan line that sweeps top→bottom
function ScanLine({ start = 0, end = 28 }: { start?: number; end?: number }) {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [start, end], [-1, 102], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [end - 5, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: `${y}%`, height: 2,
      background: `linear-gradient(90deg, transparent 0%, ${ACCENT} 20%, #fff 50%, ${ACCENT} 80%, transparent 100%)`,
      boxShadow: `0 0 24px 6px ${ACCENT}`,
      opacity, pointerEvents: "none", zIndex: 10,
    }} />
  );
}

// Diagonal light sweep (l→r)
function LightSweep({ start = 0, end = 40 }: { start?: number; end?: number }) {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [start, end], [-120, 220], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", top: "-30%", width: "22%", height: "160%",
        background: "linear-gradient(90deg, transparent 0%, rgba(232,67,26,.14) 50%, transparent 100%)",
        transform: `translateX(${x}%) skewX(-14deg)`,
      }} />
    </AbsoluteFill>
  );
}

// Masked text reveal — text slides up from behind hidden overflow (core AE technique)
function MaskedReveal({
  children,
  delay = 0,
  fromY = 110,
  cfg = CFG_SNAPPY,
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  fromY?: number;
  cfg?: SpringCfg;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spr(frame, fps, delay, cfg);
  const v = vel(frame, fps, delay, cfg);
  const y = interpolate(s, [0, 1], [fromY, 0]);
  const blur = Math.min(v * 80, 6); // motion blur
  return (
    <div style={{ overflow: "hidden", display: "block", ...style }}>
      <div style={{ transform: `translateY(${y}%)`, filter: blur > 0.3 ? `blur(${blur}px)` : "none" }}>
        {children}
      </div>
    </div>
  );
}

// Character-by-character stagger reveal
function CharStagger({
  text, delay = 0, stagger = 2, cfg = CFG_SNAPPY, color = "#fff", fontSize = 88, weight = 800,
}: {
  text: string; delay?: number; stagger?: number; cfg?: SpringCfg;
  color?: string; fontSize?: number; weight?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span>
      {text.split("").map((ch, i) => {
        const f = Math.max(0, frame - delay - i * stagger);
        const s = spring({ frame: f, fps, config: cfg });
        const v = Math.abs(
          spring({ frame: Math.max(0, f - 1), fps, config: cfg }) -
          spring({ frame: f, fps, config: cfg })
        );
        const y = interpolate(s, [0, 1], [80, 0]);
        const opacity = interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" });
        return (
          <span key={i} style={{
            display: "inline-block",
            transform: `translateY(${y}%)`,
            opacity,
            filter: v > 0.02 ? `blur(${Math.min(v * 60, 5)}px)` : "none",
            fontFamily: FONT, fontSize, fontWeight: weight, color,
            whiteSpace: ch === " " ? "pre" : undefined,
          }}>
            {ch === " " ? "\u00A0" : ch}
          </span>
        );
      })}
    </span>
  );
}

// Word-by-word reveal
function WordReveal({
  words, delays, fontSize = 88, color = "#fff", cfg = CFG_SNAPPY,
}: {
  words: string[]; delays: number[]; fontSize?: number; color?: string | string[]; cfg?: SpringCfg;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {words.map((word, i) => {
        const f = Math.max(0, frame - delays[i]);
        const s = spring({ frame: f, fps, config: cfg });
        const v = Math.abs(
          spring({ frame: Math.max(0, f - 1), fps, config: cfg }) - s
        );
        const y = interpolate(s, [0, 1], [100, 0]);
        const c = Array.isArray(color) ? color[i] : color;
        return (
          <div key={i} style={{ overflow: "hidden", display: "block", lineHeight: 1.05 }}>
            <div style={{
              transform: `translateY(${y}%)`,
              filter: v > 0.015 ? `blur(${Math.min(v * 70, 5)}px)` : "none",
              fontFamily: FONT, fontSize, fontWeight: 800, color: c,
              letterSpacing: "-0.025em",
            }}>
              {word}
            </div>
          </div>
        );
      })}
    </>
  );
}

// Side-crash entrance (from left or right)
function SideCrash({
  children, delay = 0, from = "left", cfg = CFG_ELASTIC,
}: {
  children: React.ReactNode; delay?: number; from?: "left" | "right"; cfg?: SpringCfg;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spr(frame, fps, delay, cfg);
  const v = vel(frame, fps, delay, cfg);
  const dir = from === "left" ? -1 : 1;
  const x = interpolate(s, [0, 1], [dir * 120, 0]);
  const opacity = interpolate(Math.max(0, frame - delay), [0, 8], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{
      transform: `translateX(${x}%)`,
      filter: v > 0.01 ? `blur(${Math.min(v * 60, 5)}px)` : "none",
      opacity,
    }}>
      {children}
    </div>
  );
}

// Overline label
function Overline({ text, delay = 0 }: { text: string; delay?: number }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(Math.max(0, frame - delay), [0, 14], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{
      opacity, fontFamily: FONT, fontSize: 16, fontWeight: 600,
      letterSpacing: "0.36em", textTransform: "uppercase",
      color: ACCENT, marginBottom: 20,
    }}>
      {text}
    </div>
  );
}

// Typing animation for subtext
function TypeIn({
  text, startFrame = 0, speed = 2, style = {},
}: {
  text: string; startFrame?: number; speed?: number; style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const chars = Math.floor(
    interpolate(frame, [startFrame, startFrame + text.length * speed], [0, text.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    })
  );
  const cursorOpacity = frame > startFrame + text.length * speed
    ? interpolate((frame - startFrame - text.length * speed) % 18, [0, 9, 18], [1, 0, 1])
    : 1;
  return (
    <span style={{ fontFamily: FONT, ...style }}>
      {text.slice(0, chars)}
      <span style={{ opacity: cursorOpacity, color: ACCENT }}>|</span>
    </span>
  );
}

// Glitch overlay — brief RGB-split distortion
function Glitch({ activeFrames }: { activeFrames: number[] }) {
  const frame = useCurrentFrame();
  if (!activeFrames.includes(frame)) return null;
  const offset = ((frame * 7) % 5) - 2;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 50 }}>
      <AbsoluteFill style={{
        background: "transparent",
        boxShadow: `inset ${offset * 3}px 0 0 rgba(232,67,26,0.4), inset ${-offset * 3}px 0 0 rgba(0,120,255,0.2)`,
        clipPath: `inset(${Math.abs(offset) * 10}% 0 ${Math.abs(offset) * 12}% 0)`,
      }} />
    </AbsoluteFill>
  );
}

// Fade-out at scene end
function useFadeOut(dur: number, len = 16) {
  const frame = useCurrentFrame();
  return interpolate(frame, [dur - len, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

// ── Scene 1 · Logo Reveal ─────────────────────────────────────────────────────
function SceneLogo() {
  const fadeOut = useFadeOut(S1);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Expanding accent line under logo
  const lineS = spr(frame, fps, 42, CFG_SMOOTH);
  const lineW = interpolate(lineS, [0, 1], [0, 260]);

  // Subtle pulsing glow
  const pulse = 0.09 + Math.sin(frame * 0.08) * 0.03;

  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: BG, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Grid />
      <Orb cx="-8%" cy="-18%" size={900} opacity={pulse} />
      <ScanLine start={0} end={26} />
      <LightSweep start={38} end={72} />
      <Flash frames={4} intensity={0.7} />

      <div style={{ textAlign: "center", zIndex: 1, position: "relative" }}>
        <Overline text="Premium Digital Agency" delay={8} />

        {/* Masked char-stagger reveal */}
        <div style={{ overflow: "hidden", lineHeight: 1.05, paddingBottom: "0.06em" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.06em", alignItems: "baseline" }}>
            <CharStagger text="UNICO" delay={14} stagger={3} cfg={CFG_SNAPPY} color="#fff" fontSize={88} />
            <span style={{ display: "inline-block", width: "0.28em" }} />
            <CharStagger text="GROWTH" delay={28} stagger={3} cfg={CFG_SNAPPY} color={ACCENT} fontSize={88} />
          </div>
        </div>

        {/* Accent divider */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
          <div style={{ height: 4, background: ACCENT, width: lineW, boxShadow: `0 0 16px 4px ${ACCENT}` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 2 · The Problem ─────────────────────────────────────────────────────
function SceneProblem() {
  const fadeOut = useFadeOut(S2);
  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: BG, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Grid />
      <Orb cx="114%" cy="108%" size={860} opacity={0.10} />
      <Flash frames={5} intensity={0.75} />

      <div style={{ textAlign: "center", zIndex: 1, position: "relative", padding: "0 8%" }}>
        <Overline text="The Reality" delay={6} />

        {/* 3-line masked word reveal */}
        <WordReveal
          words={["Most businesses", "leave money", "on the table."]}
          delays={[8, 22, 36]}
          fontSize={64}
          color={["#fff", ACCENT, "#fff"]}
          cfg={CFG_SNAPPY}
        />

        {/* Subtext types in */}
        <div style={{ marginTop: 24, fontSize: 18, color: "rgba(255,255,255,.5)", letterSpacing: "0.01em", lineHeight: 1.6 }}>
          <TypeIn
            text="Slow sites. Manual grunt work. Zero automation."
            startFrame={52}
            speed={1.5}
            style={{ fontSize: 18 }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 3 · The Solution ─────────────────────────────────────────────────────
function SceneSolution() {
  const fadeOut = useFadeOut(S3);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "YOU SCALE." — scale punch + shake
  const scaleS = spr(frame, fps, 26, CFG_ELASTIC);
  const scale = interpolate(scaleS, [0, 1], [0, 1]);
  const shakeX = frame >= 38 && frame <= 42 ? Math.sin(frame * 12) * 6 : 0;

  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: BG, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Grid />
      <Orb cx="50%" cy="50%" size={980} opacity={0.09} />
      <HardFlash frames={4} />
      <Glitch activeFrames={[38, 39, 40, 42]} />

      <div style={{ textAlign: "center", zIndex: 1, position: "relative", padding: "0 8%", transform: `translateX(${shakeX}px)` }}>
        <Overline text="Enter Unico Growth" delay={6} />

        {/* Line 1 — crashes from top */}
        <MaskedReveal delay={6} fromY={-120} cfg={CFG_SNAPPY} style={{ lineHeight: 1.05 }}>
          <span style={{ fontFamily: FONT, fontSize: 72, fontWeight: 800, color: "#fff", letterSpacing: "-0.025em" }}>
            WE BUILD.
          </span>
        </MaskedReveal>

        {/* Line 2 — slides from left */}
        <SideCrash delay={14} from="left" cfg={CFG_SNAPPY}>
          <div style={{ fontFamily: FONT, fontSize: 72, fontWeight: 800, color: ACCENT, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
            WE AUTOMATE.
          </div>
        </SideCrash>

        {/* Line 3 — scale punch from center */}
        <div style={{ transform: `scale(${scale})`, lineHeight: 1.05, overflow: "hidden" }}>
          <span style={{ display: "block", fontFamily: FONT, fontSize: 72, fontWeight: 800, color: "#fff", letterSpacing: "-0.025em" }}>
            YOU SCALE.
          </span>
        </div>

        <MaskedReveal delay={48} cfg={CFG_SMOOTH} style={{ marginTop: 22 }}>
          <span style={{ fontFamily: FONT, fontSize: 22, color: "rgba(255,255,255,.5)" }}>
            Premium digital systems, engineered for results.
          </span>
        </MaskedReveal>
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 4 · Services Grid ────────────────────────────────────────────────────
function ServiceCard({ num, label, desc, delay }: { num: string; label: string; desc: string; delay: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spr(frame, fps, delay, CFG_ELASTIC);
  const v = vel(frame, fps, delay, CFG_ELASTIC);
  const y = interpolate(s, [0, 1], [60, 0]);
  const opacity = interpolate(Math.max(0, frame - delay), [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // Line width reveal
  const lineS = spr(frame, fps, delay + 10, CFG_SMOOTH);
  const lineW = `${interpolate(lineS, [0, 1], [0, 100])}%`;

  // Number count: "—" → "0X"
  const countF = Math.max(0, frame - delay);
  const showNum = countF > 6;

  return (
    <div style={{
      transform: `translateY(${y}%)`,
      filter: v > 0.01 ? `blur(${Math.min(v * 50, 4)}px)` : "none",
      opacity,
      border: `1px solid rgba(232,67,26,.25)`,
      padding: "26px 28px",
      background: "rgba(232,67,26,.04)",
      textAlign: "left",
    }}>
      <div style={{ height: 3, background: ACCENT, width: lineW, marginBottom: 18, boxShadow: `0 0 8px 2px ${ACCENT}` }} />
      <div style={{ fontFamily: FONT, fontSize: 38, fontWeight: 800, color: ACCENT, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {showNum ? num : "—"}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 5, color: "#fff" }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,.42)", marginTop: 6, lineHeight: 1.55 }}>
        {desc}
      </div>
    </div>
  );
}

const SERVICES = [
  { num: "01", label: "Custom Websites",   desc: "High-converting sites that command attention & drive leads" },
  { num: "02", label: "E-Commerce Builds", desc: "Online stores engineered to convert visitors into buyers" },
  { num: "03", label: "AI Automation",     desc: "Intelligent systems that handle operations while you sleep" },
  { num: "04", label: "n8n Workflows",     desc: "End-to-end workflow automation for every operation" },
];

function SceneServices() {
  const fadeOut = useFadeOut(S4);
  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: BG, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Grid />
      <Flash frames={5} intensity={0.7} />

      <div style={{ textAlign: "center", zIndex: 1, position: "relative", width: "100%", padding: "0 6%" }}>
        <MaskedReveal delay={4} cfg={CFG_SMOOTH} style={{ marginBottom: 28, fontSize: 16, fontFamily: FONT, fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", color: ACCENT }}>
          What We Do
        </MaskedReveal>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, maxWidth: 740, margin: "0 auto" }}>
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.num} {...s} delay={10 + i * 16} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 5 · Tagline ─────────────────────────────────────────────────────────
function SceneTagline() {
  const fadeOut = useFadeOut(S5);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "GROWTH." scales up from 0 in accent — biggest impact
  const growthS = spr(frame, fps, 32, CFG_ELASTIC);
  const growthScale = interpolate(growthS, [0, 1], [0, 1]);
  const growthOpacity = interpolate(Math.max(0, frame - 32), [0, 6], [0, 1], { extrapolateRight: "clamp" });

  // Flash between each word
  const flash2 = interpolate(Math.max(0, frame - 14), [0, 4], [0.5, 0], { extrapolateRight: "clamp" });
  const flash3 = interpolate(Math.max(0, frame - 30), [0, 4], [0.6, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: BG, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Grid />
      <Orb cx="110%" cy="-20%" size={940} opacity={0.10} />
      <Flash frames={5} intensity={0.7} />
      <AbsoluteFill style={{ background: ACCENT, opacity: flash2, pointerEvents: "none", zIndex: 98 }} />
      <AbsoluteFill style={{ background: ACCENT, opacity: flash3, pointerEvents: "none", zIndex: 98 }} />

      <div style={{ textAlign: "center", zIndex: 1, position: "relative", padding: "0 8%" }}>
        {/* "PREMIUM." — crashes from left */}
        <SideCrash delay={4} from="left" cfg={CFG_SNAPPY}>
          <div style={{ fontFamily: FONT, fontSize: 76, fontWeight: 800, color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.05, textAlign: "center" }}>
            PREMIUM.
          </div>
        </SideCrash>

        {/* "RESULTS-DRIVEN." — crashes from right */}
        <SideCrash delay={18} from="right" cfg={CFG_SNAPPY}>
          <div style={{ fontFamily: FONT, fontSize: 76, fontWeight: 800, color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.05 }}>
            RESULTS-DRIVEN.
          </div>
        </SideCrash>

        {/* "GROWTH." — scale punch in accent */}
        <div style={{ transform: `scale(${growthScale})`, opacity: growthOpacity, lineHeight: 1.05 }}>
          <div style={{ fontFamily: FONT, fontSize: 88, fontWeight: 800, color: ACCENT, letterSpacing: "-0.025em", textShadow: `0 0 60px rgba(232,67,26,0.6)` }}>
            GROWTH.
          </div>
        </div>

        <MaskedReveal delay={52} cfg={CFG_SMOOTH} style={{ marginTop: 26, fontSize: 22, fontFamily: FONT, color: "rgba(255,255,255,.5)" }}>
          For businesses that refuse to settle for average.
        </MaskedReveal>
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 6 · CTA / Outro ─────────────────────────────────────────────────────
function SceneCTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // CTA button glow pulse (repeating sine)
  const btnOpacity = interpolate(Math.max(0, frame - 36), [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const glowPulse = 0.5 + Math.sin(Math.max(0, frame - 50) * 0.14) * 0.3;

  // Logo final reveal
  const logoS = spr(frame, fps, 70, CFG_SMOOTH);

  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Grid />
      <Orb cx="50%" cy="115%" size={780} opacity={0.12} />
      <Flash frames={5} intensity={0.6} />

      <div style={{ textAlign: "center", zIndex: 1, position: "relative", padding: "0 8%" }}>
        <Overline text="Ready to grow?" delay={6} />

        <MaskedReveal delay={12} cfg={CFG_SNAPPY} style={{ lineHeight: 1.08, fontSize: 58, fontFamily: FONT, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>
          Let&apos;s build something
        </MaskedReveal>
        <MaskedReveal delay={22} cfg={CFG_SNAPPY} style={{ lineHeight: 1.08, fontSize: 78, fontFamily: FONT, fontWeight: 800, letterSpacing: "-0.02em", color: ACCENT }}>
          extraordinary.
        </MaskedReveal>

        {/* CTA Button — slides in + glow pulse */}
        <div style={{ opacity: btnOpacity, marginTop: 46 }}>
          <div style={{
            display: "inline-block",
            background: `linear-gradient(135deg, #E8431A 0%, #FF5E2E 100%)`,
            padding: "16px 48px",
            fontFamily: FONT, fontSize: 17, fontWeight: 700,
            letterSpacing: "0.09em", textTransform: "uppercase",
            boxShadow: `0 0 ${40 + glowPulse * 30}px ${10 + glowPulse * 10}px rgba(232,67,26,${0.35 + glowPulse * 0.2})`,
          }}>
            <TypeIn text="unicogrowth.com" startFrame={52} speed={2} style={{ fontSize: 20, fontWeight: 700 }} />
          </div>
        </div>

        {/* Logo fade in */}
        <div style={{
          marginTop: 48,
          opacity: interpolate(logoS, [0, 1], [0, 1]),
          fontFamily: FONT, fontSize: 34, fontWeight: 800, letterSpacing: "0.06em",
        }}>
          UNICO <span style={{ color: ACCENT }}>GROWTH</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Root composition ──────────────────────────────────────────────────────────
export const UnicoPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Audio src={staticFile("music.wav")} volume={0.32} />
      <Sequence from={0}                    durationInFrames={S1}><SceneLogo /></Sequence>
      <Sequence from={S1}                   durationInFrames={S2}><SceneProblem /></Sequence>
      <Sequence from={S1+S2}                durationInFrames={S3}><SceneSolution /></Sequence>
      <Sequence from={S1+S2+S3}             durationInFrames={S4}><SceneServices /></Sequence>
      <Sequence from={S1+S2+S3+S4}          durationInFrames={S5}><SceneTagline /></Sequence>
      <Sequence from={S1+S2+S3+S4+S5}       durationInFrames={S6}><SceneCTA /></Sequence>
    </AbsoluteFill>
  );
};
