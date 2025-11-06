interface MaterialSymbolProps {
  name: string;
  size?: number;
  className?: string;
  filled?: boolean;
  weight?: number;
  grade?: number;
  color?: string;
}

export default function MaterialSymbol({
  name,
  size = 24,
  className = '',
  filled = false,
  weight = 400,
  grade = 0,
  color,
}: MaterialSymbolProps) {
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${size}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        color: color,
      }}
    >
      {name}
    </span>
  );
}
