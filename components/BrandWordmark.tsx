type BrandWordmarkProps = {
  name?: string;
  tone?: "default" | "inverse";
  tagline?: boolean;
  className?: string;
};

/**
 * Shared brand mark used by the storefront, mobile navigation, footer,
 * partner welcome screen and admin shell. Keeping every placement behind
 * one component prevents old and new identities from appearing together.
 */
export function BrandWordmark({
  tone = "default",
  className = "",
}: BrandWordmarkProps) {
  return (
    <span
      className={`inline-flex items-center ${
        tone === "inverse" ? "rounded-lg bg-white px-2 py-1" : ""
      } ${className}`}
    >
      <span className="relative block h-9 w-[9.5rem] overflow-hidden sm:h-10 sm:w-44">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/techbrand-logo.png"
          alt="Techbrand"
          width={2172}
          height={724}
          className="absolute left-0 top-1/2 h-auto w-full -translate-y-1/2"
        />
      </span>
    </span>
  );
}
