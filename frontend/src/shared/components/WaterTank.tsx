interface WaterTankProps {
  /** 0 = empty, 1 = full */
  level: number;
  color: string;
}

/** Full-page water tank background with animated wave at the waterline. */
export function WaterTank({ level, color }: WaterTankProps) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 pointer-events-none"
      style={{
        height: `${level * 100}%`,
        transition: "height 950ms linear, background-color 800ms ease",
        backgroundColor: color,
      }}
    >
      <svg
        className="absolute left-0 w-[200%] h-10"
        style={{
          top: "-36px",
          fill: color,
          animation: "waveScroll 4s linear infinite",
        }}
        viewBox="0 0 2880 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,20 C240,4 480,36 720,20 C960,4 1200,36 1440,20 C1680,4 1920,36 2160,20 C2400,4 2640,36 2880,20 L2880,40 L0,40 Z" />
      </svg>
    </div>
  );
}
