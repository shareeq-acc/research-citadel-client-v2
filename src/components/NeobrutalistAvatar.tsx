import React from "react";

interface AvatarProps {
  gender: "femme" | "masc";
  bg: string; // Background color HEX or CSS class
  eye: "sunglasses" | "glasses" | "cute" | "focus";
  hair: string;
  accessory: "headset" | "scope" | "earring" | "none";
  hairColor: string;
  size?: number;
  skinColor?: string;
  shape?: "square" | "circle";
  noBorder?: boolean;
}

export const NeobrutalistAvatar: React.FC<AvatarProps> = ({
  gender,
  bg,
  eye,
  hair,
  accessory,
  hairColor,
  size = 140,
  skinColor = "#FFF4F2",
  shape = "square",
  noBorder = false,
}) => {
  // Let's draw high-contrast, neobrutalist vectors with crisp solid black strokes or borders.
  const roundedClass = shape === "circle" ? "rounded-full" : "rounded-xs";
  const borderClass = noBorder ? "" : "border-4 border-neo-dark";
  const shadowClass = noBorder ? "" : "shadow-[3px_3px_0px_#000]";

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
      }}
      className={`${borderClass} ${roundedClass} ${shadowClass} overflow-hidden flex items-center justify-center relative select-none shrink-0`}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow Overlay / Vintage screen scanline grid lines */}
        <defs>
          <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="4" y2="0" stroke="#000" strokeWidth="1" opacity="0.04" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#scanlines)" />

        {/* Neck */}
        <rect
          x={gender === "femme" ? "91" : "86"}
          y="132"
          width={gender === "femme" ? "18" : "28"}
          height="32"
          fill={skinColor}
          stroke="#000000"
          strokeWidth="4"
          rx="2"
        />

        {/* Ears */}
        <circle cx="66" cy="98" r="9" fill={skinColor} stroke="#000000" strokeWidth="4" />
        <circle cx="134" cy="98" r="9" fill={skinColor} stroke="#000000" strokeWidth="4" />

        {/* Face */}
        <rect
          x={gender === "femme" ? "72" : "70"}
          y="64"
          width={gender === "femme" ? "56" : "60"}
          height="72"
          fill={skinColor}
          stroke="#000000"
          strokeWidth="4"
          rx={gender === "femme" ? "24" : "12"}
        />

        {/* Mouth */}
        {gender === "femme" ? (
          <path
            d="M 94 117 Q 100 125 106 117 Q 100 114 94 117"
            fill="#E11D48"
            stroke="#000000"
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M 94 118 Q 100 124 106 118"
            stroke="#000000"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Nose */}
        <path
          d="M 100 98 L 98 106 L 102 106"
          stroke="#000000"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Gender/Style specific basic hair base underneath overlay */}
        {gender === "femme" && (
          <>
            {/* Long Bob Back Hair Block */}
            <path
              d="M 62 76 C 62 76, 52 100, 52 135 L 72 135 L 70 76 Z"
              fill={hairColor}
              stroke="#000000"
              strokeWidth="4"
            />
            <path
              d="M 138 76 C 138 76, 148 100, 148 135 L 128 135 L 130 76 Z"
              fill={hairColor}
              stroke="#000000"
              strokeWidth="4"
            />
          </>
        )}

        {/* EYEBROWS & EYELASHES LAYER */}
        {gender === "femme" ? (
          <>
            {/* Soft elegant feminine curved eyebrows */}
            <path
              d="M 72 79 Q 82 73 91 78"
              stroke="#000000"
              strokeWidth="3.2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 109 78 Q 118 73 128 79"
              stroke="#000000"
              strokeWidth="3.2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Long eyelashes */}
            <path
              d="M 72 88 Q 63 84 66 79"
              stroke="#000000"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 128 88 Q 137 84 134 79"
              stroke="#000000"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 77 86 Q 71 80 75 75"
              stroke="#000000"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 123 86 Q 129 80 125 75"
              stroke="#000000"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            {/* Bold/low eyebrows for masc */}
            <path
              d="M 72 80 L 90 80"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M 110 80 L 128 80"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </>
        )}

        {/* HAIR COMBINATIONS */}
        {gender === "femme" && hair === "long-bob" && (
          <>
            {/* Top Fringe Bangs Block */}
            <path
              d="M 68 64 C 68 38, 132 38, 132 64 C 132 64, 100 48, 68 64 Z"
              fill={hairColor}
              stroke="#000000"
              strokeWidth="4"
            />
            {/* Side strand wraps (beautiful curving paths framing face) */}
            <path
              d="M 70 64 C 61 74, 58 100, 64 116 L 74 116 C 70 98, 70 76, 74 64 Z"
              fill={hairColor}
              stroke="#000"
              strokeWidth="4"
            />
            <path
              d="M 130 64 C 139 74, 142 100, 136 116 L 126 116 C 130 98, 130 76, 126 64 Z"
              fill={hairColor}
              stroke="#000"
              strokeWidth="4"
            />
          </>
        )}

        {gender === "femme" && hair === "ponytail" && (
          <>
            {/* Ponytail strand left and back */}
            <path
              d="M 50 82 C 34 72, 30 100, 42 118 C 54 130, 58 110, 54 94 Z"
              fill={hairColor}
              stroke="#000000"
              strokeWidth="4"
            />
            {/* Hair band tying the ponytail */}
            <rect x="48" y="82" width="10" height="14" fill="#E11D48" stroke="#000000" strokeWidth="3.5" rx="2" />
            
            {/* Front Head Hair Outline */}
            <path
              d="M 68 64 C 68 38, 132 38, 132 64 C 132 64, 106 50, 68 64 Z"
              fill={hairColor}
              stroke="#000000"
              strokeWidth="4"
            />
            {/* Beautiful side strands framing face so ponytail looks fully connected to the hair structure */}
            <path
              d="M 70 64 C 61 74, 58 92, 64 106 L 74 106 C 70 92, 70 76, 74 64 Z"
              fill={hairColor}
              stroke="#000"
              strokeWidth="4"
            />
            <path
              d="M 130 64 C 139 74, 142 92, 136 106 L 126 106 C 130 92, 130 76, 126 64 Z"
              fill={hairColor}
              stroke="#000"
              strokeWidth="4"
            />
          </>
        )}

        {gender === "femme" && hair === "curly-fem" && (
          <>
            {/* Curly circular clouds surrounding the skull */}
            <circle cx="70" cy="52" r="15" fill={hairColor} stroke="#000000" strokeWidth="4" />
            <circle cx="100" cy="42" r="16" fill={hairColor} stroke="#000000" strokeWidth="4" />
            <circle cx="130" cy="52" r="15" fill={hairColor} stroke="#000000" strokeWidth="4" />
            <circle cx="60" cy="74" r="14" fill={hairColor} stroke="#000000" strokeWidth="4" />
            <circle cx="140" cy="74" r="14" fill={hairColor} stroke="#000000" strokeWidth="4" />
            <circle cx="58" cy="98" r="12" fill={hairColor} stroke="#000000" strokeWidth="4" />
            <circle cx="142" cy="98" r="12" fill={hairColor} stroke="#000000" strokeWidth="4" />
            {/* Cover Face forehead nicely */}
            <path d="M 70 65 L 130 65 L 120 74 L 80 74 Z" fill={hairColor} stroke="#000000" strokeWidth="3" />
          </>
        )}

        {gender === "masc" && hair === "quiff" && (
          <>
            {/* Sweeping dynamic pompadour / quiff */}
            <path
              d="M 68 64 Q 100 24, 138 42 L 132 64 Z"
              fill={hairColor}
              stroke="#000000"
              strokeWidth="4"
            />
            {/* Trim Sideburns */}
            <rect x="68" y="64" width="5" height="14" fill={hairColor} stroke="#000000" strokeWidth="3.5" rx="1" />
            <rect x="127" y="64" width="5" height="14" fill={hairColor} stroke="#000000" strokeWidth="3.5" rx="1" />
          </>
        )}

        {gender === "masc" && hair === "fade-masc" && (
          <>
            {/* Crisp flat top */}
            <rect x="68" y="44" width="64" height="22" fill={hairColor} stroke="#000000" strokeWidth="4" rx="2" />
            <rect x="68" y="64" width="5" height="14" fill={hairColor} stroke="#000000" strokeWidth="3" rx="1" />
            <rect x="127" y="64" width="5" height="14" fill={hairColor} stroke="#000000" strokeWidth="3" rx="1" />
          </>
        )}

        {gender === "masc" && hair === "spiky-punk" && (
          <>
            {/* Razor spikes pointing outward */}
            <path
              d="M 68 64 L 74 38 L 86 52 L 96 34 L 106 52 L 115 34 L 123 52 L 132 40 L 132 64 Z"
              fill={hairColor}
              stroke="#000000"
              strokeWidth="4"
              strokeLinejoin="miter"
            />
            <rect x="68" y="64" width="5" height="12" fill={hairColor} stroke="#000" strokeWidth="3" />
            <rect x="127" y="64" width="5" height="12" fill={hairColor} stroke="#000" strokeWidth="3" />
          </>
        )}

        {gender === "masc" && hair === "beanie" && (
          <>
            {/* Beanie overlapping the top of face */}
            <path d="M 66 64 C 66 34, 134 34, 134 64 Z" fill={hairColor} stroke="#000" strokeWidth="4" />
            {/* Ribbed brim */}
            <rect x="62" y="56" width="76" height="12" fill="#3B82F6" stroke="#000" strokeWidth="4" rx="3" />
            {/* Cute pom-pom bubble */}
            <circle cx="100" cy="28" r="8" fill="#FFF" stroke="#000" strokeWidth="4" />
          </>
        )}

        {/* EYES LAYER */}
        {eye === "sunglasses" && (
          <>
            {/* Square high-contrast neobrutalist specs */}
            <rect
              x="72"
              y="84"
              width="22"
              height="15"
              fill="#000000"
              stroke="#000000"
              strokeWidth="3.5"
              rx="2"
            />
            <rect
              x="106"
              y="84"
              width="22"
              height="15"
              fill="#000000"
              stroke="#000000"
              strokeWidth="3.5"
              rx="2"
            />
            {/* Glass frame bridge */}
            <line x1="94" y1="90" x2="106" y2="90" stroke="#000000" strokeWidth="4.5" />
            {/* Bright highlights */}
            <line x1="76" y1="88" x2="81" y2="95" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
            <line x1="110" y1="88" x2="115" y2="95" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {eye === "glasses" && (
          <>
            {/* Round reading specs */}
            <circle cx="82" cy="92" r="11" fill="none" stroke="#000000" strokeWidth="4" />
            <circle cx="118" cy="92" r="11" fill="none" stroke="#000000" strokeWidth="4" />
            <line x1="93" y1="92" x2="107" y2="92" stroke="#000000" strokeWidth="4" />
            <line x1="66" y1="90" x2="71" y2="90" stroke="#000" strokeWidth="3px;" />
            <line x1="129" y1="90" x2="134" y2="90" stroke="#000" strokeWidth="3px;" />
            {/* Cute pupil dot inside */}
            <circle cx="82" cy="92" r="3" fill="#000000" />
            <circle cx="118" cy="92" r="3" fill="#000000" />
          </>
        )}

        {eye === "cute" && (
          <>
            {/* Manga anime-style friendly eyes with white high glints */}
            <ellipse cx="82" cy="92" rx="5" ry="8" fill="#000" />
            <ellipse cx="118" cy="92" rx="5" ry="8" fill="#000" />
            <circle cx="80" cy="90" r="1.8" fill="#FFF" />
            <circle cx="116" cy="90" r="1.8" fill="#FFF" />
            {/* Cute happy eyebrows */}
            <path
              d="M 76 80 Q 82 76 88 80"
              stroke="#000000"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 112 80 Q 118 76 124 80"
              stroke="#000000"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}

        {eye === "focus" && (
          <>
            {/* Glowing HUD/Visor over eyes */}
            <rect
              x="66"
              y="85"
              width="68"
              height="12"
              fill="#22D3EE"
              stroke="#000000"
              strokeWidth="3.5"
              rx="2"
            />
            <line x1="72" y1="91" x2="128" y2="91" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
            {/* Visor details */}
            <rect x="70" y="88" width="4" height="6" fill="#000" />
            <rect x="126" y="88" width="4" height="6" fill="#000" />
          </>
        )}

        {/* ACCESSORIES LAYER */}
        {accessory === "headset" && (
          <>
            {/* Cyber earmuff block left */}
            <rect
              x="58"
              y="86"
              width="8"
              height="20"
              fill="#475569"
              stroke="#000000"
              strokeWidth="3.5"
              rx="2"
            />
            {/* Connecting head-band */}
            <path
              d="M 62 86 C 62 46, 138 46, 138 86"
              fill="none"
              stroke="#000000"
              strokeWidth="3.5"
            />
            {/* Microphone extension cord */}
            <path d="M 60 98 Q 54 116 75 116" fill="none" stroke="#000000" strokeWidth="3.5" />
            <circle cx="75" cy="116" r="3" fill="#EF4444" stroke="#000" strokeWidth="2" />
          </>
        )}

        {accessory === "scope" && (
          <>
            {/* Futuristic reticle target eye lens */}
            <circle cx="118" cy="92" r="15" fill="none" stroke="#EF4444" strokeWidth="3" strokeDasharray="4 2" />
            <circle cx="118" cy="92" r="3" fill="#EF4444" />
          </>
        )}

        {accessory === "earring" && (
          <>
            {/* Golden loop earrings on the ear margins */}
            <circle cx="60" cy="106" r="5.5" fill="none" stroke="#FBBF24" strokeWidth="3.5" />
            <circle cx="140" cy="106" r="5.5" fill="none" stroke="#FBBF24" strokeWidth="3.5" />
          </>
        )}
      </svg>
    </div>
  );
};
