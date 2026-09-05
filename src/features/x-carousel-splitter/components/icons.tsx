type IconProps = {
  className?: string;
};

const commonProps = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.6,
  viewBox: "0 0 24 24"
};

export function UploadCloudIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} {...commonProps}>
      <path d="M7 18a4.5 4.5 0 0 1-.4-8.98A5.5 5.5 0 0 1 17.4 8.03 4 4 0 0 1 17 18H7Z" />
      <path d="M12 11v6m0-6 2.5 2.5M12 11 9.5 13.5" />
    </svg>
  );
}

export function CropIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} {...commonProps}>
      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
      <path d="M18 22V8a2 2 0 0 0-2-2H2" />
    </svg>
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} {...commonProps}>
      <path d="M12 3.5 14.3 9l6 .6-4.5 3.9 1.4 5.9L12 16.3 6.8 19.4l1.4-5.9L3.7 9.6l6-.6Z" />
    </svg>
  );
}

export function SnowflakeIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} {...commonProps}>
      <path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11" />
      <path d="M12 6 9.7 4.3M12 6l2.3-1.7M12 18l-2.3 1.7M12 18l2.3 1.7" />
    </svg>
  );
}

export function FitIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} {...commonProps}>
      <path d="M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}

export function ResetIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} {...commonProps}>
      <path d="M4 4v5h5" />
      <path d="M4.5 9A7.5 7.5 0 1 1 5 15.5" />
    </svg>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} {...commonProps}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function ZoomIcon({ className, out }: IconProps & { out?: boolean }) {
  return (
    <svg aria-hidden="true" className={className} {...commonProps}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.3-4.3" />
      {out ? <path d="M7.5 10.5h6" /> : <path d="M10.5 7.5v6M7.5 10.5h6" />}
    </svg>
  );
}
