interface TimerDisplayProps {
  secondsLeft: number;
}

/** Muestra el tiempo en formato MM:SS con dígitos de tamaño responsive */
export function TimerDisplay({ secondsLeft }: TimerDisplayProps) {
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <div
      className="text-[5rem] sm:text-[8rem] lg:text-[12rem] font-bold leading-none tabular-nums text-white drop-shadow-lg"
      aria-live="off"
      aria-label={`${minutes} minutos ${seconds} segundos`}
    >
      {minutes}:{seconds}
    </div>
  );
}
