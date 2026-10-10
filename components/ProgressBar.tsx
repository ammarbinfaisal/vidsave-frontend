export default function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.floor(value * 100)}
      className={`h-1 overflow-hidden rounded-full bg-line ${className}`}
    >
      <div
        className="h-full rounded-full bg-action transition-[width] duration-700 ease-out"
        style={{ width: `${value * 100}%` }}
      />
    </div>
  );
}
