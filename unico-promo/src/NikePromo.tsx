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

const ACCENT = "#E8431A";
const BLACK  = "#000";
const WHITE  = "#FFFFFF";
const FONT   = "'Space Grotesk', 'Arial Black', sans-serif";

// ── Scene offsets (frames @ 30fps) ───────────────────────────────────────────
const T = {
  openBlack:   { from: 0,   dur: 88  }, // 2.9s — pure tension
  comp1:       { from: 88,  dur: 18  }, // "YOUR COMPETITORS"
  comp2:       { from: 106, dur: 18  }, // "AREN'T WAITING."
  blackA:      { from: 124, dur: 8   },
  areYou:      { from: 132, dur: 24  }, // "ARE YOU?"
  blackB:      { from: 156, dur: 6   },
  hardFlash:   { from: 162, dur: 4   },
  weBuild:     { from: 166, dur: 24  }, // "WE BUILD."
  weAutomate:  { from: 190, dur: 24  }, // "WE AUTOMATE."
  youDominate: { from: 214, dur: 30  }, // "YOU DOMINATE."
  blackC:      { from: 244, dur: 10  },
  s1:          { from: 254, dur: 16  }, // "WEBSITES."
  s2:          { from: 270, dur: 16  }, // "CUSTOM APPS."
  s3:          { from: 286, dur: 16  }, // "AI SYSTEMS."
  s4:          { from: 302, dur: 16  }, // "CRM."
  blackD:      { from: 318, dur: 8   },
  stopManaging:{ from: 326, dur: 28  }, // "STOP MANAGING."
  startGrowing:{ from: 354, dur: 96  }, // "START GROWING." — 3.2s hold
  blackE:      { from: 450, dur: 10  },
  logo:        { from: 460, dur: 100 }, // UNICO GROWTH
  url:         { from: 560, dur: 80  }, // unicogrowth.com
};
export const NIKE_TOTAL = 560 + 80; // 640 frames ≈ 21.3s

// ── Slam animation — text appears with a hard scale pop (Nike style) ─────────
function Slam({
  children, delay = 0, fromScale = 1.12,
}: {
  children: React.ReactNode; delay?: number; fromScale?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const s = spring({ frame: f, fps, config: { damping: 28, stiffness: 380, mass: 0.8 } });
  const sc = interpolate(s, [0, 1], [fromScale, 1]);
  const op = interpolate(f, [0, 2], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ transform: `scale(${sc})`, opacity: op }}>
      {children}
    </div>
  );
}

// ── Service line — slides from left instantly ─────────────────────────────────
function ServiceLine({ text, delay }: { text: string; delay: number }) {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - delay);
  const op = interpolate(f, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  const x  = interpolate(f, [0, 6], [-24, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{
      opacity: op, transform: `translateX(${x}px)`,
      fontFamily: FONT, fontSize: 64, fontWeight: 800,
      color: WHITE, letterSpacing: "-0.025em",
      lineHeight: 1.15, marginBottom: 2,
    }}>
      {text}
    </div>
  );
}

// ── White flash ───────────────────────────────────────────────────────────────
function HardFlash() {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 4], [1, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: WHITE, opacity: op, zIndex: 99 }} />;
}

// ── Orange flash (lighter) ────────────────────────────────────────────────────
function AccentFlash({ frames = 3 }: { frames?: number }) {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, frames], [0.7, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: ACCENT, opacity: op, zIndex: 99 }} />;
}

// ── Subtle vignette ───────────────────────────────────────────────────────────
function Vignette() {
  return (
    <AbsoluteFill style={{
      background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
      pointerEvents: "none",
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENES
// ─────────────────────────────────────────────────────────────────────────────

function SceneOpenBlack() {
  const frame = useCurrentFrame();
  // Very subtle pulsing dot in center
  const pulse = 0.08 + Math.sin(frame * 0.06) * 0.05;
  return (
    <AbsoluteFill style={{ background: BLACK }}>
      <div style={{
        position: "absolute", width: 6, height: 6, borderRadius: "50%",
        background: ACCENT, opacity: pulse,
        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
      }} />
    </AbsoluteFill>
  );
}

function SceneText({
  text, color = WHITE, size = 52, align = "left", weight = 800,
}: {
  text: string; color?: string; size?: number; align?: "left" | "center" | "right"; weight?: number;
}) {
  return (
    <AbsoluteFill style={{ background: BLACK, alignItems: "center", justifyContent: "center" }}>
      <Vignette />
      <AccentFlash frames={3} />
      <div style={{ width: "100%", padding: "0 10%", textAlign: align, zIndex: 1 }}>
        <Slam>
          <span style={{
            fontFamily: FONT, fontSize: size, fontWeight: weight,
            color, letterSpacing: "-0.025em", lineHeight: 1.0,
            display: "block",
          }}>
            {text}
          </span>
        </Slam>
      </div>
    </AbsoluteFill>
  );
}

function SceneHugeLine({ text, color = WHITE, size = 148 }: { text: string; color?: string; size?: number }) {
  return (
    <AbsoluteFill style={{ background: BLACK, alignItems: "center", justifyContent: "center" }}>
      <Vignette />
      <AccentFlash frames={2} />
      <div style={{ width: "100%", padding: "0 6%", textAlign: "center", zIndex: 1 }}>
        <Slam fromScale={1.08}>
          <span style={{
            fontFamily: FONT, fontSize: size, fontWeight: 800,
            color, letterSpacing: "-0.03em", lineHeight: 0.95,
            display: "block",
          }}>
            {text}
          </span>
        </Slam>
      </div>
    </AbsoluteFill>
  );
}

function SceneAreYou() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 22, stiffness: 320 } });
  const scale = interpolate(s, [0, 1], [1.2, 1]);
  const op = interpolate(frame, [0, 2], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: BLACK, alignItems: "center", justifyContent: "center" }}>
      <Vignette />
      <div style={{ textAlign: "center", zIndex: 1, transform: `scale(${scale})`, opacity: op }}>
        <div style={{ fontFamily: FONT, fontSize: 148, fontWeight: 800, color: ACCENT, letterSpacing: "-0.035em", lineHeight: 0.92 }}>
          ARE YOU?
        </div>
      </div>
    </AbsoluteFill>
  );
}

function SceneServices() {
  return (
    <AbsoluteFill style={{ background: BLACK, alignItems: "center", justifyContent: "flex-start", paddingTop: "38%" }}>
      <AccentFlash frames={3} />
      <Vignette />
      <div style={{ padding: "0 10%", zIndex: 1 }}>
        <ServiceLine text="WEBSITES."       delay={0}  />
        <ServiceLine text="CUSTOM APPS."    delay={16} />
        <ServiceLine text="AI SYSTEMS."     delay={32} />
        <ServiceLine text="CRM."            delay={48} />
      </div>
    </AbsoluteFill>
  );
}

function SceneStartGrowing() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Glow intensifies over the 3.2s hold
  const glow = Math.min(1, frame / 60);
  const s = spring({ frame, fps, config: { damping: 18, stiffness: 260 } });
  const scale = interpolate(s, [0, 1], [1.15, 1]);
  const op = interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: BLACK, alignItems: "center", justifyContent: "center" }}>
      <Vignette />
      <div style={{ textAlign: "center", zIndex: 1, transform: `scale(${scale})`, opacity: op }}>
        <div style={{
          fontFamily: FONT, fontSize: 152, fontWeight: 800,
          color: ACCENT, letterSpacing: "-0.035em", lineHeight: 0.92,
          textShadow: `0 0 ${40 + glow * 80}px rgba(232,67,26,${0.3 + glow * 0.5})`,
        }}>
          START
          <br />
          GROWING.
        </div>
      </div>
    </AbsoluteFill>
  );
}

function SceneLogo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 22, stiffness: 200 } });
  const s2 = spring({ frame: Math.max(0, frame - 28), fps, config: { damping: 22, stiffness: 200 } });
  const op1 = interpolate(Math.max(0, frame - 10), [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const op2 = interpolate(Math.max(0, frame - 28), [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const y1 = interpolate(s1, [0, 1], [40, 0]);
  const y2 = interpolate(s2, [0, 1], [40, 0]);
  // line grows
  const lineS = spring({ frame: Math.max(0, frame - 22), fps, config: { damping: 20, stiffness: 120 } });
  const lineW = interpolate(lineS, [0, 1], [0, 180]);

  return (
    <AbsoluteFill style={{ background: BLACK, alignItems: "center", justifyContent: "center" }}>
      <Vignette />
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: "0.2em" }}>
          <span style={{
            fontFamily: FONT, fontSize: 96, fontWeight: 800,
            color: WHITE, letterSpacing: "-0.02em",
            opacity: op1, transform: `translateY(${y1}px)`, display: "inline-block",
          }}>
            UNICO
          </span>
          <span style={{
            fontFamily: FONT, fontSize: 96, fontWeight: 800,
            color: ACCENT, letterSpacing: "-0.02em",
            opacity: op2, transform: `translateY(${y2}px)`, display: "inline-block",
          }}>
            GROWTH
          </span>
        </div>
        <div style={{
          height: 3, background: ACCENT, width: lineW,
          margin: "18px auto 0",
          boxShadow: `0 0 14px 3px ${ACCENT}`,
        }} />
      </div>
    </AbsoluteFill>
  );
}

function SceneURL() {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  // typing effect
  const text = "unicogrowth.com";
  const chars = Math.floor(interpolate(frame, [8, 8 + text.length * 2.5], [0, text.length], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }));
  const cursor = frame > 8 + text.length * 2.5
    ? interpolate((frame - 8 - text.length * 2.5) % 18, [0, 9, 18], [1, 0, 1])
    : 1;

  return (
    <AbsoluteFill style={{ background: BLACK, alignItems: "center", justifyContent: "center", opacity: op }}>
      <Vignette />
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{
          fontFamily: FONT, fontSize: 38, fontWeight: 600,
          color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}>
          {text.slice(0, chars)}
          <span style={{ opacity: cursor, color: ACCENT }}>|</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export const UnicoNike: React.FC = () => {
  const { T: _ } = { T }; void _;
  return (
    <AbsoluteFill style={{ background: BLACK }}>
      <Audio src={staticFile("nike-music.wav")} volume={0.4} />

      <Sequence from={T.openBlack.from}    durationInFrames={T.openBlack.dur}>   <SceneOpenBlack /> </Sequence>
      <Sequence from={T.comp1.from}        durationInFrames={T.comp1.dur}>       <SceneText text="YOUR COMPETITORS" size={58} align="left" /> </Sequence>
      <Sequence from={T.comp2.from}        durationInFrames={T.comp2.dur}>       <SceneText text="AREN'T WAITING." size={58} align="left" /> </Sequence>
      <Sequence from={T.blackA.from}       durationInFrames={T.blackA.dur}>      <AbsoluteFill style={{ background: BLACK }} /> </Sequence>
      <Sequence from={T.areYou.from}       durationInFrames={T.areYou.dur}>      <SceneAreYou /> </Sequence>
      <Sequence from={T.blackB.from}       durationInFrames={T.blackB.dur}>      <AbsoluteFill style={{ background: BLACK }} /> </Sequence>
      <Sequence from={T.hardFlash.from}    durationInFrames={T.hardFlash.dur}>   <HardFlash /> </Sequence>
      <Sequence from={T.weBuild.from}      durationInFrames={T.weBuild.dur}>     <SceneHugeLine text="WE BUILD."     color={WHITE} /> </Sequence>
      <Sequence from={T.weAutomate.from}   durationInFrames={T.weAutomate.dur}>  <SceneHugeLine text="WE AUTOMATE."  color={ACCENT} /> </Sequence>
      <Sequence from={T.youDominate.from}  durationInFrames={T.youDominate.dur}> <SceneHugeLine text="YOU DOMINATE." color={WHITE} /> </Sequence>
      <Sequence from={T.blackC.from}       durationInFrames={T.blackC.dur}>      <AbsoluteFill style={{ background: BLACK }} /> </Sequence>
      <Sequence from={T.s1.from}           durationInFrames={T.s4.from + T.s4.dur - T.s1.from}> <SceneServices /> </Sequence>
      <Sequence from={T.blackD.from}       durationInFrames={T.blackD.dur}>      <AbsoluteFill style={{ background: BLACK }} /> </Sequence>
      <Sequence from={T.stopManaging.from} durationInFrames={T.stopManaging.dur}><SceneHugeLine text="STOP MANAGING." color={WHITE} size={110} /> </Sequence>
      <Sequence from={T.startGrowing.from} durationInFrames={T.startGrowing.dur}><SceneStartGrowing /> </Sequence>
      <Sequence from={T.blackE.from}       durationInFrames={T.blackE.dur}>      <AbsoluteFill style={{ background: BLACK }} /> </Sequence>
      <Sequence from={T.logo.from}         durationInFrames={T.logo.dur}>        <SceneLogo /> </Sequence>
      <Sequence from={T.url.from}          durationInFrames={T.url.dur}>         <SceneURL /> </Sequence>
    </AbsoluteFill>
  );
};
