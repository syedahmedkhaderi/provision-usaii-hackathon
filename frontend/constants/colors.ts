// constants/colors.ts
// PROVISION — Grayscale palette only.
// FRONTEND RULES override: black, white, and gradients of them. No color accents.

// NOTE: The spec's teal/amber/coral tokens are SUPERSEDED.
// Status differentiation is done via icon style, weight, and fill density.

export const BLACK = '#000000';
export const NEAR_BLACK = '#1A1A1A'; // primary text
export const TEXT_PRIMARY = '#2C2C2C'; // primary text
export const TEXT_SECONDARY = '#6B6B6B'; // secondary text
export const TEXT_MUTED = '#999999'; // muted text, captions
export const BORDER = '#E0E0E0'; // borders, dividers
export const CARD_BG = '#F5F5F5'; // card backgrounds
export const BG = '#FAFAFA'; // page background
export const WHITE = '#FFFFFF'; // card backgrounds, white surfaces

// Semantic mappings (kept for code compatibility but all grayscale)
// Status is now conveyed through icon style + fill density, not hue.
export const PRIMARY = BLACK;
export const PRIMARY_DARK = BLACK;
export const PRIMARY_LIGHT = CARD_BG;
export const PRIMARY_MID = TEXT_SECONDARY;

// These are kept as grayscale equivalents for any code referencing them
export const AMBER = TEXT_SECONDARY;
export const AMBER_LIGHT = CARD_BG;
export const AMBER_DARK = NEAR_BLACK;

export const DANGER = NEAR_BLACK;
export const DANGER_LIGHT = CARD_BG;
export const DANGER_DARK = NEAR_BLACK;

// Neutrals (used throughout)
export const NEUTRAL_900 = NEAR_BLACK;
export const NEUTRAL_800 = TEXT_PRIMARY;
export const NEUTRAL_700 = TEXT_SECONDARY;
export const NEUTRAL_600 = '#777677';
export const NEUTRAL_500 = TEXT_MUTED;
export const NEUTRAL_400 = '#AAA9A1';
export const NEUTRAL_300 = BORDER;
export const NEUTRAL_100 = BG;
