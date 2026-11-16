import { memo } from 'react';

interface TaskPilotLogoProps {
  size?: number | string;
  className?: string;
  withBackground?: boolean;
}

export const TaskPilotLogo = memo(function TaskPilotLogo({
  size = 36,
  className = '',
  withBackground = true,
}: TaskPilotLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TaskPilot Logo"
    >
      <defs>
        {/* Background Gradient */}
        <radialGradient id="tp-comp-bg" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#241E1A" />
          <stop offset="60%" stopColor="#141110" />
          <stop offset="100%" stopColor="#0A0807" />
        </radialGradient>

        {/* Border Glow Gradient */}
        <linearGradient id="tp-comp-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5722" />
          <stop offset="40%" stopColor="#FF4D12" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FF4D12" stopOpacity="0.1" />
        </linearGradient>

        {/* Left Wing Gradient (Lit Side) */}
        <linearGradient id="tp-comp-wing-left" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FFA489" />
          <stop offset="30%" stopColor="#FF5722" />
          <stop offset="100%" stopColor="#D93600" />
        </linearGradient>

        {/* Right Wing Gradient (Shaded Side) */}
        <linearGradient id="tp-comp-wing-right" x1="80%" y1="0%" x2="20%" y2="100%">
          <stop offset="0%" stopColor="#FF4D12" />
          <stop offset="40%" stopColor="#B82E00" />
          <stop offset="100%" stopColor="#731900" />
        </linearGradient>

        {/* Cockpit Core Vector Gradient */}
        <linearGradient id="tp-comp-core" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#FFE0D6" />
          <stop offset="100%" stopColor="#FFA489" />
        </linearGradient>

        {/* Plasma Thruster Flame */}
        <linearGradient id="tp-comp-flame" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#FFA489" />
          <stop offset="70%" stopColor="#FF4D12" />
          <stop offset="100%" stopColor="#FF4D12" stopOpacity="0" />
        </linearGradient>

        {/* Ambient Plasma Glow */}
        <radialGradient id="tp-comp-ambient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF4D12" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FF4D12" stopOpacity="0" />
        </radialGradient>
      </defs>

      {withBackground && (
        <>
          {/* Base Dark Squircle */}
          <rect x="20" y="20" width="472" height="472" rx="128" fill="url(#tp-comp-bg)" />
          <rect
            x="20"
            y="20"
            width="472"
            height="472"
            rx="128"
            stroke="url(#tp-comp-border)"
            strokeWidth="8"
          />

          {/* HUD Telemetry Circles (Eisenhower Radar) */}
          <circle
            cx="256"
            cy="256"
            r="176"
            stroke="#FF4D12"
            strokeOpacity="0.2"
            strokeWidth="2.5"
            strokeDasharray="10 10"
          />
          <circle
            cx="256"
            cy="256"
            r="206"
            stroke="#FFA489"
            strokeOpacity="0.1"
            strokeWidth="1.5"
          />

          {/* 4 Cardinal Quadrant Ticks */}
          <line
            x1="256"
            y1="48"
            x2="256"
            y2="76"
            stroke="#FF5722"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
          <line
            x1="256"
            y1="436"
            x2="256"
            y2="464"
            stroke="#FF5722"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />
          <line
            x1="48"
            y1="256"
            x2="76"
            y2="256"
            stroke="#FF5722"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />
          <line
            x1="436"
            y1="256"
            x2="464"
            y2="256"
            stroke="#FF5722"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />
        </>
      )}

      {/* Plasma Ambient Core Glow */}
      <circle cx="256" cy="310" r="130" fill="url(#tp-comp-ambient)" />

      {/* Plasma Afterburner Thruster Flame */}
      <path d="M 252,316 L 260,316 L 264,396 L 256,420 L 248,396 Z" fill="url(#tp-comp-flame)" />
      <circle cx="256" cy="326" r="4.5" fill="#FFFFFF" />

      {/* Stealth Wing Pilot Craft - Left Facet (Light) */}
      <path
        d="M 256,106 L 118,360 L 202,328 L 228,344 L 256,316 Z"
        fill="url(#tp-comp-wing-left)"
      />

      {/* Stealth Wing Pilot Craft - Right Facet (Shade) */}
      <path
        d="M 256,106 L 256,316 L 284,344 L 310,328 L 394,360 Z"
        fill="url(#tp-comp-wing-right)"
      />

      {/* Wing Leading Edge Laser Pencils */}
      <path
        d="M 256,106 L 118,360"
        stroke="#FFFFFF"
        strokeOpacity="0.75"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 256,106 L 394,360"
        stroke="#FF7A45"
        strokeOpacity="0.5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Spine Centerline Highlight */}
      <line
        x1="256"
        y1="106"
        x2="256"
        y2="316"
        stroke="#FFFFFF"
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />

      {/* Cockpit Core Navigation Vector (Brilliant White Diamond) */}
      <path d="M 256,162 L 276,246 L 256,230 L 236,246 Z" fill="url(#tp-comp-core)" />
      <path
        d="M 256,162 L 276,246 L 256,230 L 236,246 Z"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeOpacity="0.9"
      />
    </svg>
  );
});
