// Lightweight follow-up presets (avoids pulling a native date-picker module for Part 2).
export interface Preset { key: string; label: string; iso: string | null; }

export function followUpPresets(): Preset[] {
  const now = new Date();
  const at = (days: number, h: number, m = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  return [
    { key: 'none', label: 'None', iso: null },
    { key: 'today', label: 'Today 5 PM', iso: at(0, 17) },
    { key: 'tomorrow', label: 'Tomorrow 10 AM', iso: at(1, 10) },
    { key: '3days', label: 'In 3 days', iso: at(3, 10) },
    { key: 'week', label: 'In a week', iso: at(7, 10) },
  ];
}
