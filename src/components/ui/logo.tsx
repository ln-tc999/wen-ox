"use client";

import Image from "next/image";
import { useTheme } from "@/lib/theme-context";

type LogoProps = {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
};

export function Logo({
  width = 32,
  height = 32,
  className = "",
  priority = false,
}: LogoProps) {
  const { theme } = useTheme();

  return (
    <Image
      src={
        theme === "dark"
          ? "/Assets/Images/Logo-Brand/logo-light.png"
          : "/Assets/Images/Logo-Brand/logo-dark.png"
      }
      alt="Zknull"
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
