'use client';

import { useEffect, useRef, useState } from 'react';

// ── Types ──
interface AiMetadata {
  models: {
    inspector: string;
    explainer: string;
    generator: string;
    reviewer: string;
  };
  primary_model?: string;
}

interface ReportLoaderProps {
  agentStep: number;           // 0–3, driven by parent interval
  aiMetadata?: AiMetadata;    // Available only after response resolves (optional)
}

// ── Per-agent static config ──
const AGENT_CONFIG = [
  {
    id: 'a0',
    key: 'inspector' as const,
    label: 'Inspector',
    task: 'Isolating root cause clusters',
    color: '#6366f1',
    glowColor: '#6366f1',
    position: { top: '12%', left: '12%' },
    mobilePosition: { top: '5%', left: '5%' },
  },
  {
    id: 'a1',
    key: 'explainer' as const,
    label: 'Explainer',
    task: 'Contextualizing failure nodes',
    color: '#8b5cf6',
    glowColor: '#8b5cf6',
    position: { top: '12%', right: '12%' },
    mobilePosition: { top: '5%', right: '5%' },
  },
  {
    id: 'a2',
    key: 'generator' as const,
    label: 'Generator',
    task: 'Drafting remediation patches',
    color: '#f59e0b',
    glowColor: '#f59e0b',
    position: { bottom: '12%', left: '12%' },
    mobilePosition: { bottom: '25%', left: '5%' },
  },
  {
    id: 'a3',
    key: 'reviewer' as const,
    label: 'Reviewer',
    task: 'Validating integrity scores',
    color: '#10b981',
    glowColor: '#10b981',
    position: { bottom: '12%', right: '12%' },
    mobilePosition: { bottom: '25%', right: '5%' },
  },
];

// ── Animated percentage counter tied to agentStep ──
function useProgressCounter(agentStep: number): number {
  const [pct, setPct] = useState(0);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef(0);

  useEffect(() => {
    // Each completed step = 25 %, active step animates toward its midpoint
    targetRef.current = agentStep >= 4 ? 100 : agentStep * 25;

    const animate = () => {
      setPct((prev) => {
        const target = targetRef.current;
        if (Math.abs(prev - target) < 0.5) return target;
        const next = prev + (target - prev) * 0.06;
        rafRef.current = requestAnimationFrame(animate);
        return next;
      });
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [agentStep]);

  return Math.floor(pct);
}

// ── The Loader Component ──
export default function ReportLoader({ agentStep, aiMetadata }: ReportLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef(45);
  const rafRef = useRef<number | null>(null);
  const pct = useProgressCounter(agentStep);

  // Active agent color for orb
  const activeColor = agentStep < 4 ? AGENT_CONFIG[Math.min(agentStep, 3)].glowColor : '#10b981';
  const isComplete = agentStep >= 4;

  // Draw the isometric rotating cube on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SIZE = 100;
    canvas.width = SIZE * 2;
    canvas.height = SIZE * 2;

    function drawFace(
      ctx: CanvasRenderingContext2D,
      points: [number, number][],
      fillColor: string,
      strokeColor: string
    ) {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    function project(x: number, y: number, z: number, rotY: number): [number, number] {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const rx = x * cosY - z * sinY;
      const rz = x * sinY + z * cosY;
      // Isometric-style projection
      const screenX = SIZE + (rx - rz) * 0.6;
      const screenY = SIZE + (y * 0.8 + (rx + rz) * 0.35);
      return [screenX, screenY];
    }

    const s = 28; // half-size of cube
    const vertices: [number, number, number][] = [
      [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
      [-s, -s,  s], [s, -s,  s], [s, s,  s], [-s, s,  s],
    ];

    const faces = [
      { verts: [0, 1, 2, 3], shade: 0.65 }, // back
      { verts: [4, 5, 6, 7], shade: 0.55 }, // front
      { verts: [1, 5, 6, 2], shade: 0.80 }, // right
      { verts: [0, 4, 7, 3], shade: 0.45 }, // left
      { verts: [3, 2, 6, 7], shade: 0.70 }, // bottom
      { verts: [0, 1, 5, 4], shade: 0.90 }, // top
    ];

    function frame() {
      rotRef.current += 0.008;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const rotY = rotRef.current;
      const projected = vertices.map(([x, y, z]) => project(x, y, z, rotY));

      // Sort faces by average z depth for painter's algo
      const withDepth = faces.map((f) => {
        const avgZ = f.verts.reduce((acc, vi) => {
          const [vx, , vz] = vertices[vi];
          return acc + (vx * Math.sin(rotY) + vz * Math.cos(rotY));
        }, 0) / 4;
        return { ...f, avgZ };
      });
      withDepth.sort((a, b) => a.avgZ - b.avgZ);

      withDepth.forEach(({ verts, shade }) => {
        const pts = verts.map((vi) => projected[vi]) as [number, number][];
        // Tint toward active agent color
        const baseAlpha = 0.12 + shade * 0.18;
        drawFace(
          ctx!,
          pts,
          `rgba(255,255,255,${baseAlpha})`,
          'rgba(255,255,255,0.35)'
        );
      });

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 120px)',
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(160deg,#f0f9ff 0%,#e0f2fe 60%,#f0f9ff 100%)',
        borderRadius: '1.25rem',
      }}
    >
      {/* ── Orbital Rings ── */}
      <OrbitRing size={320} duration={25} />
      <OrbitRing size={550} duration={40} reverse />

      {/* ── Agent Cards ── */}
      {AGENT_CONFIG.map((agent, i) => {
        const state = i < agentStep ? 'done' : i === agentStep ? 'active' : 'pending';
        const modelName = aiMetadata?.models?.[agent.key] ?? null;
        return (
          <AgentCard
            key={agent.id}
            agent={agent}
            state={state}
            modelName={modelName}
            index={i}
          />
        );
      })}

      {/* ── Central Core ── */}
      <div
        style={{
          position: 'absolute',
          width: 150,
          height: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}
      >
        {/* Glow Orb */}
        <div
          style={{
            position: 'absolute',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, #fff, ${activeColor})`,
            filter: 'blur(2px)',
            boxShadow: `0 0 30px ${activeColor}, 0 0 60px ${activeColor}44`,
            animation: 'breathe 3s ease-in-out infinite alternate',
            zIndex: 105,
            transition: 'background 0.6s ease, box-shadow 0.6s ease',
          }}
        />
        {/* Canvas Cube */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            width: 100,
            height: 100,
            opacity: 0.9,
            zIndex: 104,
            filter: `drop-shadow(0 0 12px ${activeColor}88)`,
            transition: 'filter 0.6s ease',
          }}
        />
      </div>

      {/* ── Bottom Metrics ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          textAlign: 'center',
          zIndex: 150,
        }}
      >
        <div
          style={{
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: '#1e293b',
            fontVariantNumeric: 'tabular-nums',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            transition: 'color 0.4s',
          }}
        >
          {String(pct).padStart(2, '0')}
        </div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 10,
            padding: '6px 16px',
            background: isComplete ? '#10b981' : activeColor,
            color: '#fff',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            borderRadius: 4,
            transition: 'background 0.6s ease',
          }}
        >
          {isComplete
            ? 'FORENSIC_SYNC_COMPLETE'
            : aiMetadata?.models?.[AGENT_CONFIG[agentStep]?.key]
            ? `ACTIVE_MODEL: ${aiMetadata.models[AGENT_CONFIG[agentStep].key].toUpperCase()}`
            : `ACTIVE_AGENT: ${AGENT_CONFIG[Math.min(agentStep, 3)].label.toUpperCase()}`}
        </div>
      </div>

      {/* ── Keyframe styles injected once ── */}
      <style>{`
        @keyframes breathe {
          0%   { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.1); opacity: 1;   }
        }
        @keyframes orbit {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

// ── Orbital dashed ring ──
function OrbitRing({ size, duration, reverse }: { size: number; duration: number; reverse?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        border: '1px dashed #e2e8f0',
        pointerEvents: 'none',
        animation: `orbit ${duration}s linear infinite ${reverse ? 'reverse' : ''}`,
      }}
    />
  );
}

// ── Individual agent card ──
function AgentCard({
  agent,
  state,
  modelName,
  index,
}: {
  agent: (typeof AGENT_CONFIG)[number];
  state: 'active' | 'done' | 'pending';
  modelName: string | null;
  index: number;
}) {
  const isActive = state === 'active';
  const isDone = state === 'done';

  const displayModel = modelName
    ? modelName.toUpperCase()
    : isDone
    ? 'MODEL RESOLVED'
    : isActive
    ? 'INITIALIZING MODEL…'
    : 'STANDBY';

  // Responsive: detect narrow screens via CSS media approach via inline style trick
  // We use a CSS custom property via a wrapper, keeping everything inline
  return (
    <div
      style={{
        position: 'absolute',
        ...agent.position,
        background: isActive ? '#fff' : isDone ? '#fff' : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(12px)',
        padding: '16px 20px',
        border: `1px solid ${isActive ? agent.color + '55' : '#e2e8f0'}`,
        borderLeft: `4px solid ${isActive ? agent.color : isDone ? '#1e293b' : 'transparent'}`,
        width: 'clamp(160px, 18vw, 240px)',
        borderRadius: 4,
        opacity: state === 'pending' ? 0.25 : 1,
        transform: isActive ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: isActive
          ? `0 15px 35px ${agent.color}22, 0 2px 8px rgba(0,0,0,0.06)`
          : isDone
          ? '0 2px 8px rgba(0,0,0,0.04)'
          : 'none',
        transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        zIndex: 50,
        animation: isActive ? 'cardFloat 2.5s ease-in-out infinite' : 'none',
      }}
    >
      {/* Model tag */}
      <span
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: '0.58rem',
          background: isActive ? agent.color + '15' : '#f1f5f9',
          color: isActive ? agent.color : '#64748b',
          padding: '2px 8px',
          borderRadius: 4,
          marginBottom: 8,
          display: 'inline-block',
          letterSpacing: '0.03em',
          border: isActive ? `1px solid ${agent.color}33` : '1px solid transparent',
          transition: 'all 0.4s ease',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={displayModel}
      >
        {displayModel}
      </span>

      {/* Agent name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        {/* Status dot */}
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            flexShrink: 0,
            background: isDone ? '#10b981' : isActive ? agent.color : '#cbd5e1',
            boxShadow: isActive ? `0 0 8px ${agent.color}` : 'none',
            display: 'inline-block',
            animation: isActive ? 'breathe 1.5s ease-in-out infinite alternate' : 'none',
            transition: 'background 0.4s ease',
          }}
        />
        <span
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: state === 'pending' ? '#94a3b8' : '#1e293b',
            transition: 'color 0.4s',
          }}
        >
          {agent.label}
        </span>
        {isDone && (
          <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600, marginLeft: 2 }}>
            ✓
          </span>
        )}
      </div>

      {/* Task description — hide on very small screens via fontSize trick */}
      <div
        style={{
          fontSize: '0.72rem',
          color: '#64748b',
          lineHeight: 1.4,
        }}
      >
        {agent.task}
      </div>

      {/* Active pulse bar */}
      {isActive && (
        <div
          style={{
            marginTop: 10,
            height: 2,
            borderRadius: 2,
            background: '#f1f5f9',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${agent.color}, ${agent.color}88)`,
              animation: 'progressScan 1.6s ease-in-out infinite',
              borderRadius: 2,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes progressScan {
          0%   { width: 0%;   margin-left: 0%;   }
          50%  { width: 60%;  margin-left: 20%;  }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}