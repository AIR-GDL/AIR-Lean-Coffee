interface ThumbsUpIconProps {
  size?: number;
  color?: string;
}

export default function ThumbsUpIcon({ size = 24, color = 'currentColor' }: ThumbsUpIconProps) {
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
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l.5-2.6a2 2 0 0 0-2-2.4h-2.6a2 2 0 0 1-2-2v-3.5" />
    </svg>
  );
}
