import { useMemo, useState } from 'react';
import { withBase } from '../lib/paths';

type ChildNode = { label: string; href: string };
type BranchNode = {
  id: string;
  label: string;
  href: string;
  children?: ChildNode[];
};

type Point = { x: number; y: number };

const BRANCHES: BranchNode[] = [
  {
    id: 'podcast',
    label: 'Podcast',
    href: '/podcast',
    children: [
      { label: 'Cine Manija', href: '/podcast/cine-manija' },
      { label: 'Micro Lado C', href: '/podcast/micro-lado-c' },
    ],
  },
  { id: 'noticias', label: 'Noticias', href: '/noticias' },
  { id: 'agenda', label: 'Agenda', href: '/agenda' },
  { id: 'proyecto', label: 'Proyecto', href: '/proyecto' },
  { id: 'redes', label: 'Redes', href: '/redes' },
  { id: 'contacto', label: 'Contacto', href: '/contacto' },
];

const CX = 400;
const CY = 400;
const R_BRANCH = 178;
const R_CHILD = 296;

function polar(angle: number, radius: number): Point {
  return {
    x: CX + Math.cos(angle) * radius,
    y: CY + Math.sin(angle) * radius,
  };
}

function curve(a: Point, b: Point, bow = 0): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return `M ${a.x} ${a.y} Q ${mx + nx * bow} ${my + ny * bow} ${b.x} ${b.y}`;
}

function Sparkles() {
  const points = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const angle = (i * 137.508 * Math.PI) / 180;
        const radius = 205 + ((i * 47) % 160);
        return {
          ...polar(angle, radius),
          r: i % 6 === 0 ? 2.2 : 1.2,
          opacity: 0.06 + ((i * 13) % 9) / 100,
        };
      }),
    [],
  );

  return (
    <g aria-hidden="true">
      {points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={point.r}
          fill="#f3e8d7"
          opacity={point.opacity}
        />
      ))}
    </g>
  );
}

export default function RadialMenu() {
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<string | null>(null);

  const branches = useMemo(
    () =>
      BRANCHES.map((branch, index) => {
        const angle = -Math.PI / 2 + (index * Math.PI * 2) / BRANCHES.length;
        const point = polar(angle, R_BRANCH);
        const children = (branch.children ?? []).map((child, childIndex, all) => {
          const spread = 0.22;
          const childAngle =
            angle + (childIndex - (all.length - 1) / 2) * spread * 2;
          return {
            ...child,
            point: polar(childAngle, R_CHILD),
          };
        });
        return { ...branch, angle, point, children };
      }),
    [],
  );

  const reset = () => {
    setActiveBranch(null);
    setActiveChild(null);
  };

  const hoverBranch = (id: string) => {
    setActiveBranch(id);
    setActiveChild(null);
  };

  const hoverChild = (branchId: string, href: string) => {
    setActiveBranch(branchId);
    setActiveChild(href);
  };

  const allLinks = branches.flatMap((branch) =>
    branch.children.length > 0
      ? [{ label: branch.label, href: branch.href }, ...branch.children]
      : [{ label: branch.label, href: branch.href }],
  );

  return (
    <div
      className="radial-menu mx-auto flex w-full flex-col items-center"
      onMouseLeave={reset}
    >
      <nav
        aria-label="Menú radial de secciones"
        className="hidden w-full justify-center md:flex"
      >
        <svg
          viewBox="0 0 800 800"
          className="h-auto w-full max-w-[740px] overflow-visible"
          role="group"
          aria-label="Árbol de secciones de Membrillo"
        >
          <defs>
            <radialGradient id="centerFill" cx="38%" cy="32%" r="80%">
              <stop offset="0%" stopColor="#2a1f18" />
              <stop offset="100%" stopColor="#120d0b" />
            </radialGradient>
            <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g aria-hidden="true" fill="none">
            <circle
              cx={CX}
              cy={CY}
              r={R_BRANCH}
              stroke="#f3e8d7"
              strokeOpacity="0.07"
              strokeDasharray="2 8"
            />
            <circle
              cx={CX}
              cy={CY}
              r={R_CHILD}
              stroke="#f3e8d7"
              strokeOpacity="0.05"
              strokeDasharray="2 10"
            />
            <circle
              cx={CX}
              cy={CY}
              r="104"
              stroke="#f0a63c"
              strokeOpacity="0.45"
              className="radial-halo"
            />
            <circle
              cx={CX}
              cy={CY}
              r="84"
              stroke="#f0a63c"
              strokeOpacity="0.16"
              strokeDasharray="1 6"
            />
          </g>

          <Sparkles />

          <g aria-hidden="true" fill="none">
            {branches.map((branch) => {
              const isActive = activeBranch === branch.id;
              return (
                <g key={`link-${branch.id}`}>
                  <path
                    d={curve({ x: CX, y: CY }, branch.point, 0)}
                    stroke={isActive ? '#f0a63c' : '#4a3a32'}
                    strokeWidth={isActive ? 1.8 : 1}
                    strokeOpacity={isActive ? 0.95 : 0.45}
                    className="transition-all duration-300"
                  />
                  {branch.children.map((child) => {
                    const childActive = activeChild === child.href;
                    return (
                      <path
                        key={`link-${child.href}`}
                        d={curve(branch.point, child.point, 10)}
                        stroke={childActive ? '#f0a63c' : isActive ? '#8a6a44' : '#3a2f2a'}
                        strokeWidth={childActive ? 1.8 : 1}
                        strokeOpacity={childActive ? 1 : isActive ? 0.85 : 0.4}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </g>
              );
            })}
          </g>

          <g aria-hidden="true">
            <circle
              cx={CX}
              cy={CY}
              r="66"
              fill="url(#centerFill)"
              stroke="#f0a63c"
              strokeOpacity="0.65"
              filter="url(#softGlow)"
            />
            <text
              x={CX}
              y={CY - 6}
              textAnchor="middle"
              fill="#f3e8d7"
              fontSize="13"
              fontWeight="600"
              letterSpacing="2"
            >
              MEMBRILLO
            </text>
            <text
              x={CX}
              y={CY + 12}
              textAnchor="middle"
              fill="#c9b8a4"
              fontSize="7"
              letterSpacing="1.4"
            >
              CONTENIDO
            </text>
            <text
              x={CX}
              y={CY + 24}
              textAnchor="middle"
              fill="#c9b8a4"
              fontSize="7"
              letterSpacing="1.4"
            >
              AUDIOVISUAL
            </text>
          </g>

          {branches.map((branch) => {
            const isActive = activeBranch === branch.id;
            return (
              <g key={branch.id}>
                {branch.children.map((child) => {
                  const childActive = activeChild === child.href;
                  return (
                    <a
                      key={child.href}
                      href={withBase(child.href)}
                      aria-label={`${branch.label}: ${child.label}`}
                      onMouseEnter={() => hoverChild(branch.id, child.href)}
                      onFocus={() => hoverChild(branch.id, child.href)}
                      onBlur={reset}
                    >
                      <circle
                        cx={child.point.x}
                        cy={child.point.y}
                        r="40"
                        fill={childActive ? '#f0a63c' : '#151010'}
                        stroke={childActive ? '#f0a63c' : '#3a2f2a'}
                        strokeWidth="1"
                        className="transition-all duration-300"
                      />
                      <text
                        x={child.point.x}
                        y={child.point.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={childActive ? '#0c0908' : '#c9b8a4'}
                        fontSize="10.5"
                        fontWeight="500"
                        letterSpacing="0.4"
                        className="pointer-events-none select-none"
                      >
                        {child.label}
                      </text>
                    </a>
                  );
                })}

                <a
                  href={withBase(branch.href)}
                  aria-label={`Ir a ${branch.label}`}
                  onMouseEnter={() => hoverBranch(branch.id)}
                  onFocus={() => hoverBranch(branch.id)}
                  onBlur={reset}
                >
                  <circle
                    cx={branch.point.x}
                    cy={branch.point.y}
                    r="46"
                    fill={isActive ? '#f0a63c' : '#151010'}
                    stroke={isActive ? '#f0a63c' : '#4a3a32'}
                    strokeWidth="1.2"
                    className="transition-all duration-300"
                  />
                  <text
                    x={branch.point.x}
                    y={branch.point.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isActive ? '#0c0908' : '#f3e8d7'}
                    fontSize="12.5"
                    fontWeight="600"
                    letterSpacing="0.6"
                    className="pointer-events-none select-none"
                  >
                    {branch.label}
                  </text>
                </a>
              </g>
            );
          })}
        </svg>
      </nav>

      <p className="mt-2 hidden text-[10px] uppercase tracking-[0.22em] text-cream-dim/50 md:block">
        Explorá el árbol
      </p>

      <nav aria-label="Secciones" className="w-full max-w-md md:hidden">
        <ul className="divide-y divide-ink-line border-y border-ink-line">
          {allLinks.map((link) => (
            <li key={link.href}>
              <a
                href={withBase(link.href)}
                className="flex items-center justify-between px-1 py-4 text-sm text-cream transition-colors hover:text-quince"
              >
                <span>{link.label}</span>
                <span aria-hidden="true" className="text-quince">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
