// constants/colors.ts — Provision warm palette (SAGE / AMBER / CLAY)

// Core warm anchors
export const SAGE = '#5B7B6F';
export const SAGE_LIGHT = '#EBF2EF';
export const SAGE_DARK = '#3D5C52';

export const AMBER = '#C17F3A';
export const AMBER_LIGHT = '#FDF3E7';
export const AMBER_MID = '#D97706';

export const CLAY = '#A8432B';
export const CLAY_LIGHT = '#FAEAE6';

// Neutrals (unchanged names — all imports stay valid)
export const BLACK = '#000000';
export const NEAR_BLACK = '#1A1A1A';
export const TEXT_PRIMARY = '#2C2C2C';
export const TEXT_SECONDARY = '#6B6B6B';
export const TEXT_MUTED = '#999999';
export const BORDER = '#E0E0E0';
export const CARD_BG = '#F5F5F5';
export const BG = '#FAFAFA';
export const WHITE = '#FFFFFF';

// Semantic names mapped to new warm values (backward-compatible)
export const PRIMARY = SAGE;
export const PRIMARY_DARK = SAGE_DARK;
export const PRIMARY_LIGHT = SAGE_LIGHT;
export const PRIMARY_MID = AMBER_MID;

export const DANGER = CLAY;
export const DANGER_LIGHT = CLAY_LIGHT;
export const DANGER_DARK = CLAY;

// Legacy aliases kept for any lingering references
export const AMBER_DARK = AMBER;

// Neutrals with numbered names
export const NEUTRAL_900 = NEAR_BLACK;
export const NEUTRAL_800 = TEXT_PRIMARY;
export const NEUTRAL_700 = TEXT_SECONDARY;
export const NEUTRAL_600 = '#777677';
export const NEUTRAL_500 = TEXT_MUTED;
export const NEUTRAL_400 = '#AAA9A1';
export const NEUTRAL_300 = BORDER;
export const NEUTRAL_100 = BG;
