import Link from "next/link";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

type BrandLogoProps = {
  href?: string;
  className?: string;
};

export default function BrandLogo({ href = "/", className = "" }: BrandLogoProps) {
  const content = (
    <span className={`flex flex-col min-w-0 leading-tight ${className}`}>
      <span className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-primary-dark transition-colors truncate">
        {BRAND_NAME}
      </span>
      <span className="text-[10px] sm:text-xs font-medium text-gray-500 truncate">{BRAND_TAGLINE}</span>
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="group shrink-0 min-w-0">
      {content}
    </Link>
  );
}
