interface IconProps {
  size?: number;
  className?: string;
  filled?: boolean;
}

export default function ThumbDownIcon({ size = 24, className = '', filled = false }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={size}
      width={size}
      viewBox="0 -960 960 960"
      fill="currentColor"
      className={className}
    >
      {filled ? (
        <path d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l86-412q9-20 30-34t44-14Zm360 80H240l-120 280v80h360l-54 220 174-174v-406Zm0 406v-406-406zm80 34v-80h120v-360H680v-80h200v520H680Z"/>
      ) : (
        <path d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l86-412q9-20 30-34t44-14Zm360 80H240l-120 280v80h360l-54 220 174-174v-406Zm0 406v-406-406zm80 34v-80h120v-360H680v-80h200v520H680Z"/>
      )}
    </svg>
  );
}
