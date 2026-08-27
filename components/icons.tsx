import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  ...props,
});

export const LogoIcon = (props: P) => (
  <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
    <path d="M16 2.5c1.4 0 2.6.7 3.4 1.9l.3.5 8.6 15.8c.4.8.7 1.7.7 2.6 0 3.2-2.6 5.7-5.8 5.7-1.9 0-3.7-.8-5.3-2.2l-1.9-1.8-1.9 1.8c-1.6 1.4-3.4 2.2-5.3 2.2-3.2 0-5.8-2.5-5.8-5.7 0-.9.3-1.8.7-2.6L12.3 4.9C13.1 3.4 14.4 2.5 16 2.5Zm0 3c-.5 0-.9.2-1.2.7L6.3 21.9c-.2.4-.3.8-.3 1.2 0 1.5 1.2 2.7 2.8 2.7 1.2 0 2.3-.6 3.5-1.7 1.3-1.2 2.4-2.6 2.4-4.3 0-1.1-.6-2.2-1.4-3.1l1.7-2.5 1.7 2.5c-.8.9-1.4 2-1.4 3.1 0 1.7 1.1 3.1 2.4 4.3 1.2 1.1 2.3 1.7 3.5 1.7 1.6 0 2.8-1.2 2.8-2.7 0-.4-.1-.8-.3-1.2L17.2 6.2c-.3-.5-.7-.7-1.2-.7Z" />
  </svg>
);

export const SearchIcon = (props: P) => (
  <svg {...base(props)} strokeWidth={props.strokeWidth ?? 2.5}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const GlobeIcon = (props: P) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
  </svg>
);

export const MenuIcon = (props: P) => (
  <svg {...base(props)} strokeWidth={2}>
    <path d="M4 6.5h16M4 12h16M4 17.5h16" />
  </svg>
);

export const UserIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4.5a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6Zm0 13a8 8 0 0 1-5.6-2.3c.5-1.9 2.9-3 5.6-3s5.1 1.1 5.6 3A8 8 0 0 1 12 19.5Z" />
  </svg>
);

export const HeartIcon = ({ filled, ...props }: P & { filled?: boolean }) => (
  <svg
    viewBox="0 0 32 32"
    fill={filled ? "#FF385C" : "rgba(0,0,0,0.5)"}
    stroke="#fff"
    strokeWidth={2}
    {...props}
  >
    <path d="M16 28c7-4.7 14-10 14-17a6.98 6.98 0 0 0-14-.7A6.98 6.98 0 0 0 2 11c0 7 7 12.3 14 17Z" />
  </svg>
);

export const ShareIcon = (props: P) => (
  <svg {...base(props)} strokeWidth={2}>
    <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" />
    <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </svg>
);

export const ChevronLeft = (props: P) => (
  <svg {...base(props)} strokeWidth={2.5}>
    <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />
  </svg>
);

export const ChevronRight = (props: P) => (
  <svg {...base(props)} strokeWidth={2.5}>
    <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
  </svg>
);

export const StarIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.6l2.9 5.8 6.4.9-4.6 4.6 1.1 6.4L12 17.3l-5.8 3 1.1-6.4L2.7 9.3l6.4-.9L12 2.6Z" />
  </svg>
);

/* Category rail icons */
export const CatHome = (props: P) => (
  <svg {...base(props)}>
    <path d="m3 11 9-8 9 8" />
    <path d="M5.5 9.5V21h13V9.5" />
    <path d="M10 21v-6h4v6" />
  </svg>
);
export const CatTag = (props: P) => (
  <svg {...base(props)}>
    <path d="M3 3h8l10 10-8 8L3 11V3Z" />
    <circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);
export const CatKey = (props: P) => (
  <svg {...base(props)}>
    <circle cx="8" cy="8" r="5" />
    <path d="m11.5 11.5 9 9M17 17l2.5-2.5M14 14l2.5-2.5" />
  </svg>
);
export const CatPool = (props: P) => (
  <svg {...base(props)}>
    <path d="M2 17c1.7 0 1.7 1.5 3.3 1.5S7 17 8.7 17s1.6 1.5 3.3 1.5S13.7 17 15.3 17s1.7 1.5 3.3 1.5S20.3 17 22 17" />
    <path d="M8 14V5.5A2.5 2.5 0 0 1 10.5 3M16 14V5.5A2.5 2.5 0 0 0 13.5 3M8 7h8M8 11h8" />
  </svg>
);
export const CatBeach = (props: P) => (
  <svg {...base(props)}>
    <path d="M13 5a7 7 0 0 0-9 9M13 5a7 7 0 0 1 1 9.9M13 5 4 14M13 5l-2.5 16M3 21h18" />
  </svg>
);
export const CatViews = (props: P) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
  </svg>
);
export const CatMansion = (props: P) => (
  <svg {...base(props)}>
    <path d="M2 21h20M4 21V11l4-3 4 3v10M12 21V8l4-3 4 3v13" />
    <path d="M7 21v-4h2v4M15 21v-4h2v4" />
  </svg>
);
export const CatClassic = (props: P) => (
  <svg {...base(props)}>
    <path d="M3 21h18M4 9h16M12 3 4 9M12 3l8 6" />
    <path d="M6 21V9M10 21V9M14 21V9M18 21V9" />
  </svg>
);
export const CatSparkle = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" />
    <path d="M19 3l.8 2.2L22 6l-2.2.8L19 9l-.8-2.2L16 6l2.2-.8L19 3Z" />
  </svg>
);
export const CatTree = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 21v-5M12 3 6.5 10h2L5 15h14l-3.5-5h2L12 3Z" />
  </svg>
);
export const CatBuilding = (props: P) => (
  <svg {...base(props)}>
    <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M2 21h20" />
    <path d="M7 8h2M7 12h2M7 16h2M17 13h1M17 17h1" />
  </svg>
);

export const CATEGORY_ICONS: Record<string, (p: P) => React.JSX.Element> = {
  home: CatHome,
  tag: CatTag,
  key: CatKey,
  pool: CatPool,
  beach: CatBeach,
  views: CatViews,
  mansion: CatMansion,
  classic: CatClassic,
  sparkle: CatSparkle,
  tree: CatTree,
  building: CatBuilding,
};
