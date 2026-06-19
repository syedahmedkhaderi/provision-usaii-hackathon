// constants/typography.ts
// Provision Design System — Typography
// All fonts: Platform default. No custom font imports.

import { Platform } from 'react-native';

export const FONT_FAMILY =
  Platform.OS === 'ios' ? 'System' : 'Roboto';

// Scale
export const CAPTION = 10; // labels, eyebrows (UPPERCASE + letterSpacing: 0.8)
export const LABEL_SM = 11; // disclaimer text, meta info
export const BODY_SM = 12; // secondary body, document lists
export const BODY = 13; // primary body copy, card text
export const BODY_LG = 14; // input text, emphasized body
export const HEADING_SM = 16; // card headings
export const HEADING = 18; // screen headings (rare)
export const HEADING_LG = 20; // tab screen titles
export const DISPLAY = 22; // dashboard greeting

// Weights
export const REGULAR = '400';
export const MEDIUM = '500';
export const SEMIBOLD = '600';

// Line heights
export const LINE_TIGHT = 1.2; // headings
export const LINE_NORMAL = 1.5; // body
export const LINE_LOOSE = 1.7; // long paragraphs, instructions

// Letter spacing
export const LETTERSPACING_CAPTION = 0.8; // uppercase eyebrow labels
export const LETTERSPACING_DISPLAY = -0.3; // large sizes
