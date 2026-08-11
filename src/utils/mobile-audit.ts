/**
 * Mobile Responsiveness Audit Utility
 *
 * This utility helps identify and fix mobile responsiveness issues
 * across the Run-Quest codebase.
 */

/**
 * Mobile-first responsive breakpoints
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Minimum touch target size (WCAG recommendation)
 */
export const MIN_TOUCH_TARGET = 44; // 44x44px

/**
 * Mobile audit checklist items
 */
export interface MobileAuditItem {
  id: string;
  description: string;
  component: string;
  file: string;
  line: number;
  severity: "high" | "medium" | "low";
  status: "pass" | "fail" | "warning";
  fix?: string;
}

/**
 * Common mobile responsiveness issues to check for
 */
export const MOBILE_AUDIT_CHECKLIST = [
  {
    id: "touch-targets",
    description:
      "All interactive elements must have minimum 44x44px touch targets",
    severity: "high",
  },
  {
    id: "responsive-grid",
    description:
      "Grid layouts should adapt from 1 column (mobile) to multiple columns (desktop)",
    severity: "high",
  },
  {
    id: "text-readability",
    description: "Text must be readable on mobile screens without zooming",
    severity: "high",
  },
  {
    id: "viewport-meta",
    description: "Pages must have proper viewport meta tag",
    severity: "high",
  },
  {
    id: "horizontal-scroll",
    description: "Avoid horizontal scrolling on mobile",
    severity: "medium",
  },
  {
    id: "image-sizing",
    description: "Images must not overflow container on mobile",
    severity: "medium",
  },
  {
    id: "form-inputs",
    description: "Form inputs must be mobile-friendly with proper sizing",
    severity: "medium",
  },
  {
    id: "navigation",
    description: "Navigation must be thumb-friendly on mobile",
    severity: "medium",
  },
  {
    id: "animations",
    description:
      "Animations should be reduced or disabled on mobile for performance",
    severity: "low",
  },
  {
    id: "loading-states",
    description: "Loading states must be mobile-optimized",
    severity: "low",
  },
];

/**
 * Generate responsive class names for mobile-first design
 */
export function getResponsiveClasses(
  mobile: string,
  tablet?: string,
  desktop?: string,
  largeDesktop?: string,
): string {
  const classes = [mobile];

  if (tablet) {
    classes.push(`md:${tablet}`);
  }
  if (desktop) {
    classes.push(`lg:${desktop}`);
  }
  if (largeDesktop) {
    classes.push(`xl:${largeDesktop}`);
  }

  return classes.join(" ");
}

/**
 * Generate touch target classes to ensure minimum 44x44px
 */
export function getTouchTargetClasses(additionalClasses = ""): string {
  return `min-w-[44px] min-h-[44px] ${additionalClasses}`.trim();
}

/**
 * Generate responsive padding classes
 */
export function getResponsivePadding(
  mobilePadding: string,
  desktopPadding?: string,
): string {
  return desktopPadding ? `${mobilePadding} ${desktopPadding}` : mobilePadding;
}

/**
 * Check if a class string contains responsive breakpoints
 */
export function hasResponsiveClasses(className: string): boolean {
  return /(sm:|md:|lg:|xl:|2xl:)/.test(className);
}

/**
 * Check if a class string contains mobile-first patterns
 */
export function hasMobileFirstClasses(className: string): boolean {
  // Mobile-first means base classes without breakpoints, then breakpoints for larger screens
  const hasBaseClasses = /[^\s]+/.test(className);
  const hasBreakpoints = hasResponsiveClasses(className);

  return hasBaseClasses && hasBreakpoints;
}

/**
 * Generate a mobile-first container class
 */
export function getMobileContainerClasses(): string {
  return "mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8";
}

/**
 * Generate a mobile-first card class
 */
export function getMobileCardClasses(): string {
  return "bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow";
}

/**
 * Generate mobile-first button classes
 */
export function getMobileButtonClasses(
  variant: "primary" | "secondary" = "primary",
): string {
  const baseClasses =
    "py-2.5 rounded-xl text-xs font-black active:scale-95 transition";
  const touchClasses = getTouchTargetClasses();

  if (variant === "primary") {
    return `${baseClasses} ${touchClasses} bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20`;
  }

  return `${baseClasses} ${touchClasses} border bg-white dark:bg-slate-900 text-slate-550 border-[#E5E7EB] dark:border-slate-800 hover:bg-slate-50`;
}

/**
 * Generate mobile-first typography classes
 */
export function getMobileTypographyClasses(
  element: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "label",
): string {
  const typographyMap = {
    h1: "font-heading font-black text-xl sm:text-2xl lg:text-3xl",
    h2: "font-heading font-black text-lg sm:text-xl lg:text-2xl",
    h3: "font-heading font-black text-base sm:text-lg",
    h4: "font-heading font-black text-sm sm:text-base",
    p: "text-sm sm:text-base",
    span: "text-xs sm:text-sm",
    label: "text-xs sm:text-sm font-medium",
  };

  return typographyMap[element] || typographyMap.p;
}

/**
 * Mobile performance optimization: reduce animations on mobile
 */
export function getMobileAnimationClasses(
  desktopClasses: string,
  mobileClasses: string = "",
): string {
  return `md:${desktopClasses} ${mobileClasses}`.trim();
}

/**
 * Check if current device is likely mobile based on user agent
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|windows phone|opera mini|iemobile|mobile/i.test(
    userAgent,
  );
}

/**
 * Check if current viewport is mobile size
 */
export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;

  return window.innerWidth < BREAKPOINTS.md;
}

/**
 * Mobile audit helper for components
 */
export function auditComponentForMobile(
  componentName: string,
  className: string,
): MobileAuditItem[] {
  const issues: MobileAuditItem[] = [];

  // Check for touch targets
  if (!className.includes("min-w-") && !className.includes("min-h-")) {
    if (
      className.includes("button") ||
      className.includes("clickable") ||
      className.includes("interactive")
    ) {
      issues.push({
        id: "touch-target-missing",
        description: "Missing minimum touch target sizes",
        component: componentName,
        file: "",
        line: 0,
        severity: "high",
        status: "fail",
        fix: `Add ${getTouchTargetClasses()}`,
      });
    }
  }

  // Check for responsive classes
  if (!hasResponsiveClasses(className)) {
    issues.push({
      id: "responsive-missing",
      description: "Missing responsive class variants",
      component: componentName,
      file: "",
      line: 0,
      severity: "medium",
      status: "warning",
      fix: "Add responsive variants (sm:, md:, lg:, xl:)",
    });
  }

  return issues;
}
