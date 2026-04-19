import { useMemo } from "react";
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

// ── Brand ────────────────────────────────────────────────────────────────────
const ACCENT = "#E8431A";
const BLACK  = "#000";
const WHITE  = "#FFFFFF";
const FONT   = "'Space Grotesk','Arial Black',sans-serif";

// ── Scene timing (30fps, music drop at frame 150 = 5.0s) ─────────────────────
// Synchronized to cinematic-music.wav: tension 0-4s, build 4-5s, drop 5s+
const T = {
  openBlack:    { from: 0,   dur: 100 }, // 3.3s tension
  comp1:        { from: 100, dur: 20  }, // YOUR COMPETITORS
  comp2:        { from: 120, dur: 20  }, // AREN'T WAITING.
  blackA:       { from: 140, dur: 10  },
  areYou:       { from: 150, dur: 26  }, // ARE YOU? — hits on music drop
  blackB:       { from: 176, dur: 5   },
  hardFlash:    { from: 181, dur: 4   },
  weBuild:      { from: 185, dur: 26  }, // WE BUILD.
  weAutomate:   { from: 211, dur: 26  }, // WE AUTOMATE.
  youDominate:  { from: 237, dur: 32  }, // YOU DOMINATE.
  blackC:       { from: 269, dur: 10  },
  services:     { from: 279, dur: 72  }, // 4 services
  blackD:       { from: 351, dur: 8   },
  stopManaging: { from: 359, dur: 28  }, // STOP MANAGING.
  startGrowing: { from: 387, dur: 100 }, // START GROWING. 3.3s hold
  blackE:       { from: 487, dur: 10  },
  logo:         { from: 497, dur: 100 }, // UNICO GROWTH
  url:          { from: 597, dur: 83  }, // unicogrowth.com
};
export const CINEMATIC_TOTAL = 597 + 83; // 680 frames ≈ 22.7s

// ── Deterministic pseudo-random ───────────────────────────────────────────────
const rng = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ── Bokeh particle background ─────────────────────────────────────────────────
function Bokeh({ intensity = 1.0, speed = 1.0 }: { intensity?: number; speed?: number }) {
  const frame = useCurrentFrame();
  const COUNT = 55;

  type P = { bx:number; by:number; angle:number; spd:number; size:number; opacity:number; isOrange:boolean };
  const particles: P[] = useMemo(() =>
    Array.from({ length: COUNT }, (_: unknown, i: number) => ({
      bx:      rng(i * 7.31),
      by:      rng(i * 3.17),
      angle:   rng(i * 11.43) * Math.PI * 2,
      spd:     rng(i * 5.79) * 0.0006 + 0.0001,
      size:    rng(i * 2.61) * 180 + 30,
      opacity: rng(i * 9.13) * 0.22 + 0.04,
      isOrange: i % 6 === 0,
    })),
  []);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {particles.map((p, i) => {
        const x = ((p.bx + Math.cos(p.angle) * p.spd * speed * frame) % 1 + 1) % 1;
        const y = ((p.by + Math.sin(p.angle) * p.spd * speed * frame) % 1 + 1) % 1;
        const color = p.isOrange ? "232,67,26" : "255,255,255";
        const sz = p.size * intensity;
        return (
          <div key={i} style={{
            position: "absolute",
            width: sz, height: sz,
            borderRadius: "50%",
            left: `${x * 100}%`,
            top:  `${y * 100}%`,
            transform: "translate(-50%,-50%)",
            background: `radial-gradient(circle, rgba(${color},${p.opacity * intensity}) 0%, rgba(${color},0) 65%)`,
            pointerEvents: "none",
          }} />
        );
      })}
    </AbsoluteFill>
  );
}

// ── Cinematic letterbox (2.39:1) ──────────────────────────────────────────────
function Letterbox() {
  const BAR = "10.8%";
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: BAR, background: BLACK, zIndex: 200, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: BAR, background: BLACK, zIndex: 200, pointerEvents: "none" }} />
    </>
  );
}

// ── Film grain ────────────────────────────────────────────────────────────────
function FilmGrain() {
  const frame = useCurrentFrame();
  // Shift grain each frame so it "moves" like real film
  const ox = (frame * 37) % 200;
  const oy = (frame * 53) % 200;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 195, mixBlendMode: "overlay", opacity: 0.065 }}>
      <svg width="100%" height="100%">
        <filter id="fg">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4"
            seed={frame % 60} stitchTiles="stitch" result="noise" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="110%" height="110%" x={-ox} y={-oy} filter="url(#fg)" fill="white" />
      </svg>
    </AbsoluteFill>
  );
}

// ── Vignette ─────────────────────────────────────────────────────────────────
function Vignette({ strength = 0.75 }: { strength?: number }) {
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
      zIndex: 5,
    }} />
  );
}

// ── Orange orb glow (cinematic light source) ──────────────────────────────────
function OrbGlow({ cx = "50%", cy = "50%", size = 400, opacity = 0.15 }: { cx?: string; cy?: string; size?: number; opacity?: number }) {
  return (
    <div style={{
      position: "absolute", width: size, height: size, borderRadius: "50%",
      background: ACCENT, filter: "blur(120px)",
      opacity, left: cx, top: cy, transform: "translate(-50%,-50%)",
      pointerEvents: "none",
    }} />
  );
}

// ── Flash (white) ─────────────────────────────────────────────────────────────
function HardFlash() {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 4], [1, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: WHITE, opacity: op, zIndex: 99 }} />;
}

// ── Orange flash ──────────────────────────────────────────────────────────────
function SoftFlash({ frames = 4 }: { frames?: number }) {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, frames], [0.65, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: ACCENT, opacity: op, zIndex: 99 }} />;
}

// ── Text slam (Nike: hard scale pop) ─────────────────────────────────────────
function Slam({ children, delay = 0, from = 1.14 }: { children: React.ReactNode; delay?: number; from?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const s = spring({ frame: f, fps, config: { damping: 26, stiffness: 360, mass: 0.85 } });
  return (
    <div style={{
      transform: `scale(${interpolate(s, [0, 1], [from, 1])})`,
      opacity: interpolate(f, [0, 2], [0, 1], { extrapolateRight: "clamp" }),
    }}>
      {children}
    </div>
  );
}

// ── Service line (instant left slide) ─────────────────────────────────────────
function ServiceLine({ text, delay, accent = false }: { text: string; delay: number; accent?: boolean }) {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - delay);
  const op = interpolate(f, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  const x  = interpolate(f, [0, 8], [-40, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 18,
      opacity: op, transform: `translateX(${x}px)`,
      fontFamily: FONT, fontSize: 60, fontWeight: 800,
      color: accent ? ACCENT : WHITE,
      letterSpacing: "-0.025em", lineHeight: 1.12, marginBottom: 4,
    }}>
      {text}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENES
// ─────────────────────────────────────────────────────────────────────────────

// Opening: pure cinematic tension
function SceneOpenBlack() {
  const frame = useCurrentFrame();
  // Bokeh barely visible, very slow
  const bokehIntensity = interpolate(frame, [0, 80], [0.08, 0.3], { extrapolateRight: "clamp" });
  // Subtle orange orb pulse
  const pulse = 0.06 + Math.sin(frame * 0.04) * 0.02;
  return (
    <AbsoluteFill style={{ background: BLACK }}>
      <Bokeh intensity={bokehIntensity} speed={0.3} />
      <OrbGlow cx="50%" cy="60%" size={600} opacity={pulse} />
      <Vignette strength={0.9} />
      <FilmGrain />
      <Letterbox />
    </AbsoluteFill>
  );
}

// Generic statement scene
function SceneStatement({ text, size = 56, color = WHITE, align = "left" as "left"|"center", bokehSpeed = 1.2, orbCx = "20%", orbCy = "70%" }: {
  text: string; size?: number; color?: string; align?: "left"|"center";
  bokehSpeed?: number; orbCx?: string; orbCy?: string;
}) {
  return (
    <AbsoluteFill style={{ background: BLACK, alignItems: "center", justifyContent: "center" }}>
      <Bokeh intensity={0.5} speed={bokehSpeed} />
      <OrbGlow cx={orbCx} cy={orbCy} size={500} opacity={0.10} />
      <Vignette />
      <FilmGrain />
      <SoftFlash frames={3} />
      <div style={{ width: "100%", padding: align === "left" ? "0 10%" : "0 6%", textAlign: align, zIndex: 10 }}>
        <Slam>
          <span style={{ fontFamily: FONT, fontSize: size, fontWeight: 800, color, letterSpacing: "-0.025em", display: "block", lineHeight: 1.0 }}>
            {text}
          </span>
        </Slam>
      </div>
      <Letterbox />
    </AbsoluteFill>
  );
}

// ARE YOU? — hits on music drop, big impact
function SceneAreYou() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18, stiffness: 280 } });
  const scale = interpolate(s, [0, 1], [1.22, 1]);
  const op = interpolate(frame, [0, 2], [0, 1], { extrapolateRight: "clamp" });
  // Bokeh explodes outward on hit
  const bokehIntensity = interpolate(frame, [0, 8, 26], [0.2, 1.2, 0.6]);
  const orbPulse = interpolate(frame, [0, 10, 26], [0, 0.35, 0.18]);
  return (
    <AbsoluteFill style={{ background: BLACK, alignItems: "center", justifyContent: "center" }}>
      <Bokeh intensity={bokehIntensity} speed={2.5} />
      <OrbGlow cx="50%" cy="50%" size={700} opacity={orbPulse} />
      <Vignette strength={0.6} />
      <FilmGrain />
      <SoftFlash frames={2} />
      <div style={{ textAlign: "center", zIndex: 10, transform: `scale(${scale})`, opacity: op }}>
        <div style={{ fontFamily: FONT, fontSize: 152, fontWeight: 800, color: ACCENT, letterSpacing: "-0.038em", lineHeight: 0.9 }}>
          ARE
          <br />
          YOU?
        </div>
      </div>
      <Letterbox />
    </AbsoluteFill>
  );
}

// Huge impact line (WE BUILD / WE AUTOMATE / YOU DOMINATE)
function SceneHuge({ text, color = WHITE, orbSide = "right" }: { text: string; color?: string; orbSide?: "left"|"right" }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 22, stiffness: 320, mass: 0.9 } });
  const scale = interpolate(s, [0, 1], [1.1, 1]);
  const op = interpolate(frame, [0, 2], [0, 1], { extrapolateRight: "clamp" });
  const orbX = orbSide === "right" ? "85%" : "15%";
  return (
    <AbsoluteFill style={{ background: BLACK, alignItems: "center", justifyContent: "center" }}>
      <Bokeh intensity={0.8} speed={1.6} />
      <OrbGlow cx={orbX} cy="50%" size={520} opacity={0.14} />
      <Vignette />
      <FilmGrain />
      <SoftFlash frames={2} />
      <div style={{ textAlign: "center", width: "100%", padding: "0 5%", zIndex: 10, transform: `scale(${scale})`, opacity: op }}>
        <span style={{ fontFamily: FONT, fontSize: 148, fontWeight: 800, color, letterSpacing: "-0.035em", lineHeight: 0.92, display: "block" }}>
          {text}
        </span>
      </div>
      <Letterbox />
    </AbsoluteFill>
  );
}

// Services list
function SceneServices() {
  const lineDelay = 16;
  return (
    <AbsoluteFill style={{ background: BLACK, alignItems: "center", justifyContent: "flex-start", paddingTop: "32%" }}>
      <Bokeh intensity={0.4} speed={0.8} />
      <OrbGlow cx="80%" cy="30%" size={400} opacity={0.09} />
      <Vignette />
      <FilmGrain />
      <SoftFlash frames={3} />
      <div style={{ padding: "0 10%", zIndex: 10 }}>
        <ServiceLine text="WEBSITES."        delay={0}             />
        <ServiceLine text="CUSTOM APPS."     delay={lineDelay}     accent />
        <ServiceLine text="AI SYSTEMS."      delay={lineDelay * 2} />
        <ServiceLine text="CRM."             delay={lineDelay * 3} accent />
      </div>
      <Letterbox />
    </AbsoluteFill>
  );
}

// START GROWING — climax, 3.3s hold with evolving glow
function SceneStartGrowing() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 240 } });
  const scale = interpolate(s, [0, 1], [1.18, 1]);
  const op    = interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  const glowGrow = Math.min(1, frame / 70);
  const pulse = 0.25 + Math.sin(frame * 0.1) * 0.08;
  const bokehIntensity = interpolate(frame, [0, 30, 100], [0.3, 1.2, 0.9]);
  return (
    <AbsoluteFill style={{ background: BLACK, alignItems: "center", justifyContent: "center" }}>
      <Bokeh intensity={bokehIntensity} speed={2.2} />
      {/* Multiple orbs for explosion feel */}
      <OrbGlow cx="50%" cy="50%" size={400 + glowGrow * 500} opacity={pulse * 0.5} />
      <OrbGlow cx="30%" cy="60%" size={300} opacity={pulse * 0.15} />
      <OrbGlow cx="70%" cy="40%" size={280} opacity={pulse * 0.12} />
      <Vignette strength={0.5} />
      <FilmGrain />
      <SoftFlash frames={2} />
      <div style={{ textAlign: "center", zIndex: 10, transform: `scale(${scale})`, opacity: op }}>
        <div style={{
          fontFamily: FONT, fontSize: 155, fontWeight: 800,
          color: ACCENT, letterSpacing: "-0.038em", lineHeight: 0.9,
          textShadow: `0 0 ${60 + glowGrow * 120}px rgba(232,67,26,${0.4 + glowGrow * 0.4})`,
        }}>
          START
          <br />
          GROWING.
        </div>
      </div>
      <Letterbox />
    </AbsoluteFill>
  );
}

// Logo reveal
function SceneLogo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 20, stiffness: 180 } });
  const s2 = spring({ frame: Math.max(0, frame - 28), fps, config: { damping: 20, stiffness: 180 } });
  const lineS = spring({ frame: Math.max(0, frame - 22), fps, config: { damping: 18, stiffness: 110 } });
  const y1 = interpolate(s1, [0, 1], [50, 0]);
  const y2 = interpolate(s2, [0, 1], [50, 0]);
  const op1 = interpolate(Math.max(0, frame - 12), [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const op2 = interpolate(Math.max(0, frame - 28), [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const lineW = interpolate(lineS, [0, 1], [0, 200]);
  const pulse = 0.12 + Math.sin(frame * 0.06) * 0.04;
  return (
    <AbsoluteFill style={{ background: BLACK, alignItems: "center", justifyContent: "center" }}>
      <Bokeh intensity={0.35} speed={0.5} />
      <OrbGlow cx="50%" cy="55%" size={500} opacity={pulse} />
      <Vignette />
      <FilmGrain />
      <div style={{ textAlign: "center", zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: "0.2em" }}>
          <span style={{ fontFamily: FONT, fontSize: 96, fontWeight: 800, color: WHITE, letterSpacing: "-0.02em", opacity: op1, transform: `translateY(${y1}px)`, display: "inline-block" }}>
            UNICO
          </span>
          <span style={{ fontFamily: FONT, fontSize: 96, fontWeight: 800, color: ACCENT, letterSpacing: "-0.02em", opacity: op2, transform: `translateY(${y2}px)`, display: "inline-block" }}>
            GROWTH
          </span>
        </div>
        <div style={{ height: 3, background: ACCENT, width: lineW, margin: "18px auto 0", boxShadow: `0 0 16px 4px ${ACCENT}` }} />
      </div>
      <Letterbox />
    </AbsoluteFill>
  );
}

// URL scene
function SceneURL() {
  const frame = useCurrentFrame();
  const text  = "unicogrowth.com";
  const chars = Math.floor(interpolate(frame, [10, 10 + text.length * 2.8], [0, text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const cursor = frame > 10 + text.length * 2.8
    ? interpolate((frame - 10 - text.length * 2.8) % 18, [0, 9, 18], [1, 0, 1]) : 1;
  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: BLACK, alignItems: "center", justifyContent: "center", opacity: fadeIn }}>
      <Bokeh intensity={0.2} speed={0.4} />
      <Vignette />
      <FilmGrain />
      <div style={{ textAlign: "center", zIndex: 10 }}>
        <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
          {text.slice(0, chars)}<span style={{ opacity: cursor, color: ACCENT }}>|</span>
        </div>
      </div>
      <Letterbox />
    </AbsoluteFill>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export const UnicoCinematic: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BLACK }}>
      <Audio src={staticFile("cinematic-music.wav")} volume={0.42} />

      <Sequence from={T.openBlack.from}    durationInFrames={T.openBlack.dur}>    <SceneOpenBlack /> </Sequence>
      <Sequence from={T.comp1.from}        durationInFrames={T.comp1.dur}>        <SceneStatement text="YOUR COMPETITORS" size={60} align="left" /> </Sequence>
      <Sequence from={T.comp2.from}        durationInFrames={T.comp2.dur}>        <SceneStatement text="AREN'T WAITING." size={60} align="left" orbCy="30%" /> </Sequence>
      <Sequence from={T.blackA.from}       durationInFrames={T.blackA.dur}>       <AbsoluteFill style={{ background: BLACK }}><FilmGrain /><Letterbox /></AbsoluteFill> </Sequence>
      <Sequence from={T.areYou.from}       durationInFrames={T.areYou.dur}>       <SceneAreYou /> </Sequence>
      <Sequence from={T.blackB.from}       durationInFrames={T.blackB.dur}>       <AbsoluteFill style={{ background: BLACK }}><FilmGrain /><Letterbox /></AbsoluteFill> </Sequence>
      <Sequence from={T.hardFlash.from}    durationInFrames={T.hardFlash.dur}>    <HardFlash /> </Sequence>
      <Sequence from={T.weBuild.from}      durationInFrames={T.weBuild.dur}>      <SceneHuge text="WE BUILD."     color={WHITE}  orbSide="right" /> </Sequence>
      <Sequence from={T.weAutomate.from}   durationInFrames={T.weAutomate.dur}>   <SceneHuge text="WE AUTOMATE."  color={ACCENT} orbSide="left"  /> </Sequence>
      <Sequence from={T.youDominate.from}  durationInFrames={T.youDominate.dur}>  <SceneHuge text="YOU DOMINATE." color={WHITE}  orbSide="right" /> </Sequence>
      <Sequence from={T.blackC.from}       durationInFrames={T.blackC.dur}>       <AbsoluteFill style={{ background: BLACK }}><FilmGrain /><Letterbox /></AbsoluteFill> </Sequence>
      <Sequence from={T.services.from}     durationInFrames={T.services.dur}>     <SceneServices /> </Sequence>
      <Sequence from={T.blackD.from}       durationInFrames={T.blackD.dur}>       <AbsoluteFill style={{ background: BLACK }}><FilmGrain /><Letterbox /></AbsoluteFill> </Sequence>
      <Sequence from={T.stopManaging.from} durationInFrames={T.stopManaging.dur}> <SceneHuge text="STOP MANAGING." color={WHITE} orbSide="left" /> </Sequence>
      <Sequence from={T.startGrowing.from} durationInFrames={T.startGrowing.dur}> <SceneStartGrowing /> </Sequence>
      <Sequence from={T.blackE.from}       durationInFrames={T.blackE.dur}>       <AbsoluteFill style={{ background: BLACK }}><FilmGrain /><Letterbox /></AbsoluteFill> </Sequence>
      <Sequence from={T.logo.from}         durationInFrames={T.logo.dur}>         <SceneLogo /> </Sequence>
      <Sequence from={T.url.from}          durationInFrames={T.url.dur}>          <SceneURL /> </Sequence>
    </AbsoluteFill>
  );
};
