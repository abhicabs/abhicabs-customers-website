// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — extracted from the Figma "Bimayantra Mobile" page.
// Every screen/component reads from here; nothing hard-codes a hex value.
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
  // Surfaces
  bg: '#f4f6fb',
  surface: '#ffffff',
  border: '#e8ecf3',

  // Brand navy
  navy: '#13294b',
  navyGradFrom: '#1a3460',
  navyGradTo: '#0e1f3b',

  // Text
  text: '#172b4d',
  muted: '#7a8699',
  muted2: '#5b6b80',
  muted3: '#44526a',
  onPrimary: '#ffffff',

  // Accent blue
  blue: '#1f5fd6',
  blueSoft: '#d9eafd',
  blueSoft2: '#e8f0fd',

  // Purple
  purple: '#5b3fb8',
  purpleSoft: '#e9e3fc',
  purpleSoft2: '#dcd2fb',

  // Green
  green: '#127650',
  greenSoft: '#d4f1e7',
  greenSoft2: '#e7f4ee',

  // Amber / warning
  amber: '#8a5a12',
  amberSoft: '#fde8c9',
  amberChip: '#fbf1e1',
  amberAlert: '#fff9ef',

  // Red / danger
  red: '#b4323c',
  redPink: '#b4325a',
  redSoft: '#fbebec',
  redAlert: '#fff7f7',

  // Pink (Add task, renewals)
  addFrom: '#f9c6d0',
  addTo: '#f29db0',
  addShadow: 'rgba(232,137,156,0.3)',
  renewalCard: '#fde8ec',
  renewalText: '#8b3a4c',
  avatarPink: '#fbd5dd',

  // Misc
  checkboxBorder: '#c3ccd8',
  grayBar: '#9aa4b5',
  googleBar: '#e8899c',
};

export const spacing = { xs: 4, sm: 6, md: 8, lg: 12, xl: 16, xxl: 24 };

export const radius = {
  sm: 8,
  chip: 14,
  tile: 14,
  input: 16,
  stat: 16,
  card: 22,
  button: 24,
  iconBtn: 20,
  pill: 999,
};

// Plus Jakarta Sans — loaded via @expo-google-fonts/plus-jakarta-sans in App.tsx.
// RN custom fonts don't synthesize weight, so pick the family per weight.
export const family = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
};

export const shadow = {
  card: {
    shadowColor: '#13294b',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  button: {
    shadowColor: '#13294b',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  iconBtn: {
    shadowColor: '#13294b',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
};

export const theme = { colors, spacing, radius, family, shadow };
export type Theme = typeof theme;
