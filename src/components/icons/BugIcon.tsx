interface BugIconProps {
  size?: number;
  color?: string;
}

export default function BugIcon({ size = 24, color = 'currentColor' }: BugIconProps) {
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
      <path d="M12 6V2m0 20v-4" />
      <path d="M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83" />
      <path d="M2 12h4m12 0h4" />
      <path d="M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83" />
      <path d="M9 9h6v6H9z" />
      <path d="M12 9v6" />
    </svg>
  );
}
