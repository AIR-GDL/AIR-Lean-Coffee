interface ShieldIconProps {
  size?: number;
  className?: string;
  fill?: string;
}

export default function ShieldIcon({
  size = 18,
  className = '',
  fill = '#2563eb',
}: ShieldIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      className={className}
      role="img"
      aria-hidden="true"
    >
      <path d="M12 2 4 5v6c0 5 3.44 9.74 8 11 4.56-1.26 8-6 8-11V5l-8-3Zm0 2.18 6 2.25v4.57c0 3.96-2.52 7.72-6 8.96-3.48-1.24-6-5-6-8.96V6.43l6-2.25Zm0 3.82a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
    </svg>
  );
}
