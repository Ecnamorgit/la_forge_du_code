import Image from "next/image";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({
  size = 40,
  className = "",
  priority = false,
}: BrandLogoProps) {
  return (
    <div
      className={`brand-logo-stage shrink-0 ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src="/Gemini_Generated_Image_921tq4921tq4921t-removebg-preview.png"
        alt="Nebula Command logo"
        width={size}
        height={size}
        priority={priority}
        className="brand-logo-coin h-full w-full object-contain"
      />
    </div>
  );
}
