import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/models";

/**
 * Shared TypeScript shape for the CMS settings. This is the single source of
 * truth the admin form, the API, and every storefront component agree on.
 */
export interface NavLink {
  label: string;
  href: string;
}
export interface FooterColumn {
  title: string;
  links: NavLink[];
}
export interface Highlight {
  icon: string;
  title: string;
  subtitle: string;
}
export interface Banner {
  image: string;
  heading: string;
  subheading: string;
  link: string;
}

export interface SiteSettingsData {
  brand: {
    storeName: string;
    tagline: string;
    logoUrl: string;
    faviconUrl: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  theme: {
    primaryColor: string;
    primaryForeground: string;
  };
  commerce: {
    currencySymbol: string;
    currencyCode: string;
    shippingFee: number;
    freeShippingThreshold: number;
    codEnabled: boolean;
    razorpayEnabled: boolean;
  };
  announcement: {
    enabled: boolean;
    text: string;
    link: string;
  };
  home: {
    hero: {
      title: string;
      subtitle: string;
      ctaText: string;
      ctaLink: string;
      backgroundImage: string;
    };
    categoriesHeading: string;
    featuredHeading: string;
    trustedBrands: string[];
    popularSearches: string[];
    highlights: Highlight[];
    banners: Banner[];
  };
  header: {
    navLinks: NavLink[];
  };
  footer: {
    about: string;
    columns: FooterColumn[];
    copyrightText: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
    youtube: string;
  };
}

/**
 * The fallback content used when the DB has no settings yet (fresh install),
 * or when a stored doc is missing a newly-added field. These defaults mirror
 * the values that were previously hardcoded in the storefront, so the site
 * looks identical before the admin touches anything.
 */
export const DEFAULT_SETTINGS: SiteSettingsData = {
  brand: {
    storeName: "Techbront",
    tagline: "Quality products, fair prices, fast shipping.",
    logoUrl: "",
    faviconUrl: "",
  },
  seo: {
    metaTitle: "Ready-made websites, apps and software | Techbront",
    metaDescription: "Built with Next.js, MongoDB, and Cloudinary",
  },
  theme: {
    primaryColor: "#111827",
    primaryForeground: "#ffffff",
  },
  commerce: {
    currencySymbol: "₹",
    currencyCode: "INR",
    shippingFee: 49,
    freeShippingThreshold: 999,
    codEnabled: true,
    razorpayEnabled: true,
  },
  announcement: {
    enabled: false,
    text: "",
    link: "",
  },
  home: {
    hero: {
      title: "Build and launch with Techbront",
      subtitle: "Quality products, fair prices, fast shipping.",
      ctaText: "Shop Now",
      ctaLink: "/shop",
      backgroundImage: "",
    },
    categoriesHeading: "Shop by Category",
    featuredHeading: "Featured Products",
    trustedBrands: [
      "BluePeak Realty",
      "Northfield School Group",
      "Kavya Foods Co.",
      "Sundara Travels",
      "Ridgeline HR",
      "Vantara Logistics",
      "Meridian Health",
      "Orbit FinTech",
    ],
    popularSearches: [
      "Clinic management",
      "Delivery app",
      "School ERP",
      "Real estate CRM",
      "AI chatbot",
    ],
    highlights: [
      { icon: "Truck", title: "Fast Shipping", subtitle: "On all orders" },
      { icon: "ShieldCheck", title: "Secure Payments", subtitle: "Razorpay protected" },
      { icon: "RotateCcw", title: "Easy Returns", subtitle: "7-day policy" },
    ],
    banners: [],
  },
  header: {
    navLinks: [{ label: "Shop", href: "/shop" }],
  },
  footer: {
    about: "Quality products, fair prices, fast shipping.",
    columns: [
      {
        title: "Shop",
        links: [
          { label: "All Products", href: "/shop" },
          { label: "Cart", href: "/cart" },
        ],
      },
      {
        title: "Account",
        links: [
          { label: "My Account", href: "/account" },
          { label: "Orders", href: "/account" },
        ],
      },
    ],
    copyrightText: "© {year} Techbront. All rights reserved.",
  },
  contact: {
    email: "",
    phone: "",
    address: "",
  },
  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    youtube: "",
  },
};

/** True for plain `{}` objects — used to decide what to deep-merge vs. copy. */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Deep-merge `stored` over `defaults`. Objects merge key-by-key; arrays and
 * scalars from `stored` replace the default entirely (so an admin who clears
 * all nav links really gets zero nav links, not the defaults back).
 */
export function mergeSettings<T>(defaults: T, stored: unknown): T {
  if (!isPlainObject(defaults) || !isPlainObject(stored)) return defaults;
  const out: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };

  for (const key of Object.keys(defaults as Record<string, unknown>)) {
    const dVal = (defaults as Record<string, unknown>)[key];
    const sVal = stored[key];
    if (sVal === undefined || sVal === null) {
      out[key] = dVal;
    } else if (isPlainObject(dVal) && isPlainObject(sVal)) {
      out[key] = mergeSettings(dVal, sVal);
    } else {
      out[key] = sVal;
    }
  }
  return out as T;
}

/**
 * Existing installations may still have the former display name saved in
 * MongoDB. Normalise only that exact piece of visible copy at read time;
 * lowercase URLs, email addresses, asset paths and integration keys remain
 * untouched.
 */
function replaceLegacyBrandText<T>(value: T): T {
  if (typeof value === "string") {
    return value.replaceAll("TechBro", "Techbront") as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceLegacyBrandText(item)) as T;
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceLegacyBrandText(item)])
    ) as T;
  }
  return value;
}

/**
 * Reads the singleton settings doc, creating it with defaults on first call,
 * and always returns a plain, fully-populated SiteSettingsData object (defaults
 * merged under whatever is stored). Safe to call from any Server Component,
 * layout, or route handler.
 */
export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    await connectDB();
    let doc = await SiteSettings.findOne({ singletonKey: "site" }).lean();
    if (!doc) {
      const created = await SiteSettings.create({ singletonKey: "site", ...DEFAULT_SETTINGS });
      doc = created.toObject();
    }
    return replaceLegacyBrandText(mergeSettings(DEFAULT_SETTINGS, doc as unknown));
  } catch (err) {
    // Never let a settings/DB hiccup take down a page — fall back to defaults.
    console.error("getSiteSettings failed, using defaults:", err);
    return DEFAULT_SETTINGS;
  }
}

/** Format a numeric amount with the configured currency symbol, e.g. "₹499". */
export function formatPrice(amount: number, symbol = "₹"): string {
  return `${symbol}${amount}`;
}
