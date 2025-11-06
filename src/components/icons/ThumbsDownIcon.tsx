interface ThumbsDownIconProps {
  size?: number;
  color?: string;
}

export default function ThumbsDownIcon({ size = 24, color = 'currentColor' }: ThumbsDownIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-.5 2.6a2 2 0 0 0 2 2.4h2.6a2 2 0 0 1 2 2v3.5" />
    </svg>
  );
}
