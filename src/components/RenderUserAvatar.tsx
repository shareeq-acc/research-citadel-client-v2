import React from "react";
import { NeobrutalistAvatar } from "./NeobrutalistAvatar";

export const parseCustomAvatar = (avatarStr: string | null) => {
  if (avatarStr && avatarStr.startsWith("custom-avatar::")) {
    try {
      return JSON.parse(avatarStr.slice("custom-avatar::".length));
    } catch (e) {
      return null;
    }
  }
  return null;
};

interface RenderUserAvatarProps {
  avatar: string | null;
  name: string;
  size?: number;
  className?: string;
  squareBorder?: boolean;
}

export const RenderUserAvatar: React.FC<RenderUserAvatarProps> = ({
  avatar,
  name,
  size = 32,
  className = "",
  squareBorder = false,
}) => {
  const custom = parseCustomAvatar(avatar);
  const roundedClass = squareBorder ? "rounded-xs" : "rounded-full";
  if (custom) {
    return (
      <div 
        className={`overflow-hidden shrink-0 flex items-center justify-center bg-stone-100 ${roundedClass} border-4 border-neo-dark ${className}`}
        style={{ width: size, height: size }}
      >
        <NeobrutalistAvatar
          gender={custom.gender || "femme"}
          bg={custom.bg || "#38BDF8"}
          eye={custom.eye || "sunglasses"}
          hair={custom.hair || "long-bob"}
          accessory={custom.accessory || "none"}
          hairColor={custom.hairColor || "#FACC15"}
          skinColor={custom.skinColor || "#FFF4F2"}
          size={size}
          shape={squareBorder ? "square" : "circle"}
          noBorder={true}
        />
      </div>
    );
  }

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`border-4 border-neo-dark bg-stone-100 object-cover shrink-0 ${roundedClass} ${className}`}
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`bg-neo-yellow border-4 border-neo-dark flex items-center justify-center font-black uppercase text-neo-dark shrink-0 ${roundedClass} ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: `${Math.max(10, Math.floor(size * 0.45))}px`,
      }}
    >
      {name ? name.charAt(0) : "S"}
    </div>
  );
};
