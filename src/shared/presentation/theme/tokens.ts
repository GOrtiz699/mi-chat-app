/**
 * Design tokens — Minimalist + glassmorphism, identidad juvenil y limpia.
 * Única fuente de verdad para colores, gradientes, espaciado, radios,
 * tipografía y sombras. Sin valores mágicos en los componentes.
 */

export const colors = {
  /** Fondo profundo del degradado base */
  background: {
    deep: "#0F0C29",
    mid: "#302B63",
    end: "#24243E",
  },
  accent: {
    primary: "#7C5CFF", // violeta eléctrico
    secondary: "#FF6B9D", // coral / rosa
    tertiary: "#3DDBD9", // turquesa menta
  },
  text: {
    primary: "#F5F5FA",
    secondary: "rgba(245,245,250,0.6)",
    tertiary: "rgba(245,245,250,0.38)",
    onAccent: "#F5F5FA",
  },
  /** Superficies de vidrio: el relleno real vive en los componentes Glass* */
  glass: {
    fill: "rgba(255,255,255,0.08)",
    fillStrong: "rgba(255,255,255,0.14)",
    fillSoft: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.18)",
    borderSoft: "rgba(255,255,255,0.10)",
  },
  /** Orbes difuminados detrás del vidrio */
  orb: {
    violet: "rgba(124,92,255,0.55)",
    coral: "rgba(255,107,157,0.42)",
    teal: "rgba(61,219,217,0.35)",
  },
  status: {
    success: "#4ADE80",
    error: "#FF6B6B",
    warning: "#F6C860",
  },
} as const;

export const gradients = {
  background: ["#0F0C29", "#302B63", "#24243E"] as const,
  /** CTA principales, burbuja propia y botón de envío */
  primary: ["#7C5CFF", "#FF6B9D"] as const,
  /** Relleno suave para orbs: acento → transparente */
  orbPrimary: ["rgba(124,92,255,0.60)", "rgba(124,92,255,0)"] as const,
  orbSecondary: ["rgba(255,107,157,0.50)", "rgba(255,107,157,0)"] as const,
  orbTertiary: ["rgba(61,219,217,0.45)", "rgba(61,219,217,0)"] as const,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 26,
  pill: 999,
} as const;

export const typography = {
  fontFamily: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  lineHeight: {
    xs: 14,
    sm: 18,
    md: 21,
    lg: 24,
    xl: 30,
    xxl: 38,
  },
} as const;

/** Intensidades de BlurView (iOS). En Android se usa fillStrong sin blur. */
export const blur = {
  header: 40,
  card: 30,
  cardStrong: 45,
  inputBar: 45,
  overlay: 60,
} as const;

export const shadows = {
  card: {
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  glow: {
    shadowColor: "#7C5CFF",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
} as const;
