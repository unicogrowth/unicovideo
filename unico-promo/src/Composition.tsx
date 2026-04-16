import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const ACCENT = "#E8431A";
const BG = "#080808";
const FONT = "'Space Grotesk', 'Arial Black', sans-serif";

// ── Scene durations (frames @ 30fps) ─────────────────────────────────────────
const S1 = 75;  // 2.5s — logo reveal
const S2 = 105; // 3.5s — problem
const S3 = 105; // 3.5s — solution
const S4 = 150; // 5.0s — services grid
const S5 = 105; // 3.5s — positioning tagline
const S6 = 120; // 4.0s — CTA / outro
export const TOTAL_FRAMES = S1 + S2 + S3 + S4 + S5 + S6; // 660

// ── Shared animation hooks ────────────────────────────────────────────────────
function useSlideIn(delay = 0, fromY = 42) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const s = spring({ frame: f, fps, config: { damping: 14, stiffness: 70, mass: 1 } });
  return {
    opacity: interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(s, [0, 1], [fromY, 0])}px)`,
  };
}

function useScaleIn(delay = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const s = spring({ frame: f, fps, config: { damping: 13, stiffness: 80 } });
  return {
    opacity: interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
    transform: `scale(${interpolate(s, [0, 1], [0.82, 1])})`,
  };
}

function useFadeIn(delay = 0) {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - delay);
  return { opacity: interpolate(f, [0, 16], [0, 1], { extrapolateRight: "clamp" }) };
}

function useFadeOut(duration: number, fadeLen = 18) {
  const frame = useCurrentFrame();
  return interpolate(frame, [duration - fadeLen, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function useLineGrow(delay = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const s = spring({ frame: f, fps, config: { damping: 18, stiffness: 60 } });
  return { width: `${interpolate(s, [0, 1], [0, 100])}%` };
}

// ── Shared background ─────────────────────────────────────────────────────────
function Grid() {
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `
          linear-gradient(rgba(232,67,26,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(232,67,26,.04) 1px, transparent 1px)
        `,
        backgroundSize: "64px 64px",
        pointerEvents: "none",
      }}
    />
  );
}

function Orb({
  cx, cy, size = 700, opacity = 0.12,
}: {
  cx: string; cy: string; size?: number; opacity?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: ACCENT,
        filter: "blur(120px)",
        opacity,
        left: cx,
        top: cy,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    />
  );
}

function Overline({ text, delay = 0 }: { text: string; delay?: number }) {
  const style = useFadeIn(delay);
  return (
    <div
      style={{
        ...style,
        fontFamily: FONT,
        fontSize: 18,
        fontWeight: 600,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color: ACCENT,
        marginBottom: 18,
      }}
    >
      {text}
    </div>
  );
}

// ── Scene 1 · Logo Reveal ─────────────────────────────────────────────────────
function SceneLogo() {
  const fadeOut = useFadeOut(S1);
  const title = useSlideIn(16);
  const over = useFadeIn(4);
  const line = useLineGrow(36);
  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: BG, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Grid />
      <Orb cx="-6%" cy="-20%" size={820} opacity={0.13} />
      <div style={{ textAlign: "center", zIndex: 1, position: "relative" }}>
        <div style={{ ...over, fontFamily: FONT, fontSize: 16, fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", color: ACCENT, marginBottom: 18 }}>
          Premium Digital Agency
        </div>
        <div
          style={{
            ...title,
            fontFamily: FONT,
            fontSize: 112,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          UNICO{" "}
          <span style={{ color: ACCENT }}>GROWTH</span>
        </div>
        <div
          style={{
            ...line,
            height: 4,
            background: ACCENT,
            maxWidth: 200,
            margin: "28px auto 0",
          }}
        />
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 2 · The Problem ─────────────────────────────────────────────────────
function SceneProblem() {
  const fadeOut = useFadeOut(S2);
  const h = useSlideIn(10);
  const sub = useFadeIn(28);
  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: BG, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Grid />
      <Orb cx="112%" cy="110%" size={860} opacity={0.11} />
      <div style={{ textAlign: "center", zIndex: 1, position: "relative", padding: "0 8%" }}>
        <Overline text="The Reality" delay={4} />
        <div
          style={{
            ...h,
            fontFamily: FONT,
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Most businesses
          <br />
          <span style={{ color: ACCENT }}>leave money</span>
          <br />
          on the table.
        </div>
        <div
          style={{
            ...sub,
            fontFamily: FONT,
            fontSize: 22,
            color: "rgba(255,255,255,.52)",
            marginTop: 28,
            lineHeight: 1.6,
          }}
        >
          Slow websites. Manual grunt work. Zero automation.
          <br />
          While your competitors scale — you&apos;re stuck grinding.
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 3 · The Solution ─────────────────────────────────────────────────────
function SceneSolution() {
  const fadeOut = useFadeOut(S3);
  const h = useScaleIn(8);
  const sub = useFadeIn(32);
  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: BG, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Grid />
      <Orb cx="50%" cy="50%" size={900} opacity={0.1} />
      <div style={{ textAlign: "center", zIndex: 1, position: "relative", padding: "0 8%" }}>
        <Overline text="Enter Unico Growth" delay={4} />
        <div
          style={{
            ...h,
            fontFamily: FONT,
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
          }}
        >
          WE BUILD.
          <br />
          <span style={{ color: ACCENT }}>WE AUTOMATE.</span>
          <br />
          YOU SCALE.
        </div>
        <div
          style={{
            ...sub,
            fontFamily: FONT,
            fontSize: 22,
            color: "rgba(255,255,255,.52)",
            marginTop: 28,
          }}
        >
          Premium digital systems, engineered for results.
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 4 · Services Grid ────────────────────────────────────────────────────
const SERVICES = [
  { num: "01", label: "Custom Websites",  desc: "High-converting sites that command attention & drive leads" },
  { num: "02", label: "E-Commerce Builds", desc: "Online stores engineered to convert visitors into buyers" },
  { num: "03", label: "AI Automation",    desc: "Intelligent systems that handle operations while you sleep" },
  { num: "04", label: "n8n Workflows",    desc: "End-to-end automation for every business operation" },
];

function ServiceCard({ num, label, desc, delay }: { num: string; label: string; desc: string; delay: number }) {
  const anim = useSlideIn(delay, 32);
  return (
    <div
      style={{
        ...anim,
        border: `1px solid rgba(232,67,26,.28)`,
        padding: "28px 30px",
        background: "rgba(232,67,26,.04)",
      }}
    >
      <div style={{ fontFamily: FONT, fontSize: 52, fontWeight: 800, color: ACCENT, lineHeight: 1 }}>{num}</div>
      <div style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 6 }}>{label}</div>
      <div style={{ fontFamily: FONT, fontSize: 14, color: "rgba(255,255,255,.45)", marginTop: 8, lineHeight: 1.55 }}>{desc}</div>
    </div>
  );
}

function SceneServices() {
  const fadeOut = useFadeOut(S4);
  const over = useFadeIn(4);
  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: BG, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Grid />
      <div style={{ textAlign: "center", zIndex: 1, position: "relative", width: "100%", padding: "0 6%" }}>
        <div style={{ ...over, fontFamily: FONT, fontSize: 16, fontWeight: 600, letterSpacing: "0.36em", textTransform: "uppercase", color: ACCENT, marginBottom: 28 }}>
          What We Do
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            maxWidth: 1020,
            margin: "0 auto",
          }}
        >
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.num} {...s} delay={8 + i * 12} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 5 · Positioning / Tagline ───────────────────────────────────────────
function SceneTagline() {
  const fadeOut = useFadeOut(S5);
  const h = useSlideIn(8);
  const sub = useFadeIn(32);
  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: BG, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Grid />
      <Orb cx="108%" cy="-24%" size={920} opacity={0.11} />
      <div style={{ textAlign: "center", zIndex: 1, position: "relative", padding: "0 8%" }}>
        <div
          style={{
            ...h,
            fontFamily: FONT,
            fontSize: 108,
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
          }}
        >
          PREMIUM.
          <br />
          <span style={{ color: ACCENT }}>RESULTS-DRIVEN.</span>
          <br />
          GROWTH.
        </div>
        <div
          style={{
            ...sub,
            fontFamily: FONT,
            fontSize: 22,
            color: "rgba(255,255,255,.52)",
            marginTop: 30,
          }}
        >
          For businesses that refuse to settle for average.
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 6 · CTA / Outro ─────────────────────────────────────────────────────
function SceneCTA() {
  const h = useSlideIn(10);
  const btn = useScaleIn(32);
  const logo = useFadeIn(52);
  const over = useFadeIn(4);
  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Grid />
      <Orb cx="50%" cy="118%" size={750} opacity={0.13} />
      <div style={{ textAlign: "center", zIndex: 1, position: "relative", padding: "0 8%" }}>
        <div style={{ ...over, fontFamily: FONT, fontSize: 16, fontWeight: 600, letterSpacing: "0.36em", textTransform: "uppercase", color: ACCENT, marginBottom: 18 }}>
          Ready to grow?
        </div>
        <div
          style={{
            ...h,
            fontFamily: FONT,
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
          }}
        >
          Let&apos;s build something
          <br />
          <span style={{ color: ACCENT }}>extraordinary.</span>
        </div>
        <div style={{ ...btn, marginTop: 48 }}>
          <div
            style={{
              display: "inline-block",
              background: ACCENT,
              padding: "18px 52px",
              fontFamily: FONT,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#fff",
            }}
          >
            unicogrowth.com
          </div>
        </div>
        <div
          style={{
            ...logo,
            fontFamily: FONT,
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: "0.06em",
            marginTop: 44,
          }}
        >
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
      <Sequence from={0}           durationInFrames={S1}><SceneLogo /></Sequence>
      <Sequence from={S1}          durationInFrames={S2}><SceneProblem /></Sequence>
      <Sequence from={S1 + S2}     durationInFrames={S3}><SceneSolution /></Sequence>
      <Sequence from={S1+S2+S3}    durationInFrames={S4}><SceneServices /></Sequence>
      <Sequence from={S1+S2+S3+S4} durationInFrames={S5}><SceneTagline /></Sequence>
      <Sequence from={S1+S2+S3+S4+S5} durationInFrames={S6}><SceneCTA /></Sequence>
    </AbsoluteFill>
  );
};
