import { useEffect, useState } from "react";
import { getRentalRates } from "../api/services/vehicles";

/**
 * Local rental packages (hours / km), live from the backend.
 *
 * Source: GET /fares/rental-packages (via getRentalRates — cached, shared with
 * the fleet pages, so this adds no extra request). Every vehicle class lists
 * its packages; the distinct durations across all classes become the package
 * list, shortest first. Until the backend answers — or if it fails / returns
 * nothing — the standard list below is used, so the UI never changes shape.
 *
 * Each item: { value: "8 hrs / 80 km", label, description, hours, km }
 * `value` keeps the "<h> hrs / <km> km" format the booking flow and fare
 * calculation already understand.
 */
const DESCRIPTIONS = { 4: "Half day", 8: "Full day", 12: "Extended day" };

const toItem = (hours, km) => {
  const value = `${hours} hrs / ${km} km`;
  return { value, label: value, description: DESCRIPTIONS[hours] || `${hours} hour package`, hours, km };
};

export const DEFAULT_RENTAL_PACKAGES = [toItem(4, 40), toItem(8, 80), toItem(12, 120)];

let cached = null; // resolved list, shared across components

function fromRates(rates) {
  const seen = new Map();
  for (const rate of rates.values()) {
    for (const p of rate.packages || []) {
      const h = Number(p.includedHours), km = Number(p.includedKm);
      if (!h || !km) continue;
      const key = `${h}/${km}`;
      if (!seen.has(key)) seen.set(key, toItem(h, km));
    }
  }
  return [...seen.values()].sort((a, b) => a.hours - b.hours || a.km - b.km);
}

export default function useRentalPackages() {
  const [packages, setPackages] = useState(cached || DEFAULT_RENTAL_PACKAGES);
  useEffect(() => {
    if (cached) return;
    let alive = true;
    getRentalRates()
      .then((rates) => {
        const list = rates && rates.size ? fromRates(rates) : [];
        cached = list.length ? list : DEFAULT_RENTAL_PACKAGES;
        if (alive) setPackages(cached);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return packages;
}

/** Map the three package cards (Hourly / Half-Day / Full-Day) onto the live list:
 *  shortest, middle and longest package. */
export function packageForCard(label, list) {
  const pkgs = list && list.length ? list : DEFAULT_RENTAL_PACKAGES;
  const pick = /full/i.test(label) ? pkgs[pkgs.length - 1] : /half/i.test(label) ? pkgs[Math.floor((pkgs.length - 1) / 2)] : pkgs[0];
  return { pkg: pick.value, hours: pick.hours };
}

/** Closest live package to a "<h> hrs / <km> km" value (keeps presets/defaults valid). */
export function nearestPackageValue(value, list) {
  const pkgs = list && list.length ? list : DEFAULT_RENTAL_PACKAGES;
  if (pkgs.some((p) => p.value === value)) return value;
  const want = parseInt(value, 10) || 8;
  return pkgs.reduce((a, b) => (Math.abs(b.hours - want) < Math.abs(a.hours - want) ? b : a)).value;
}
