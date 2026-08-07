import Link from "next/link";
import { BRAND_NAME, BRAND_BYLINE, BRAND_TAGLINE, BRAND_WEBSITE_URL } from "@/lib/brand";

type BrandLogoProps = {
  href?: string;
  className?: string;
};

export default function BrandLogo({ href = "/", className = "" }: BrandLogoProps) {
  const nameContent = (
    <span className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-primary-dark transition-colors truncate">
      {BRAND_NAME}
    </span>
  );

  return (
    <span className={`flex flex-col min-w-0 leading-tight ${className}`}>
      {href ? (
        <Link href={href} className="group shrink-0 min-w-0">
          {nameContent}
        </Link>
      ) : (
        nameContent
      )}
      <a
        href={BRAND_WEBSITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-fit text-[10px] sm:text-xs font-bold text-gray-500 hover:text-primary-dark hover:underline transition-colors truncate"
      >
        {BRAND_BYLINE}
      </a>
      <span className="text-[10px] sm:text-xs font-medium text-gray-500 truncate">{BRAND_TAGLINE}</span>
    </span>
  );
}
