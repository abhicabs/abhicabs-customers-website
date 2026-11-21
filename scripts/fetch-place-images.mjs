#!/usr/bin/env node
/**
 * Resolve a free (Creative Commons / public-domain) Wikimedia photo for every tourist
 * place and one-day-trip destination on the city pages, and write them to
 * src/content/placeImages.json — which the city pages read at build time.
 *
 *   npm run images:places            # fill in places that have no photo yet
 *   npm run images:places -- --all   # re-resolve every place
 *
 * Run it on your machine, review the result, and COMMIT the JSON. The site never calls
 * Wikipedia at runtime or at build time, so a Wikipedia outage can't break a deploy.
 *
 * How a photo is chosen: the place's Wikipedia article → its lead image, restricted to
 * free licences (pilicense=free) → licence + author from the file's metadata, which the
 * cards show as the required attribution.
 *
 * To fix a wrong or missing photo, edit PLACE_SOURCES below:
 *   "Place name": ["Article title", "Fallback title"]   — tried in order
 *   "Place name": [{ file: "Some_photo.jpg" }]          — force a specific Commons file
 * Or hand-edit an entry in placeImages.json and add  "locked": true  so re-runs keep it.
 */
import fs from "node:fs";
import path from "node:path";
import { CITY_CONTENT } from "../src/content/cityDefaults.js";

const OUT = path.resolve("src/content/placeImages.json");
const API = "https://en.wikipedia.org/w/api.php";
// Wikimedia asks every API client to identify itself (https://meta.wikimedia.org/wiki/User-Agent_policy).
const UA = "AbhiCabsWebsite/1.0 (https://abhicabs24x7.com; support@abhicabs.com) place-images-script";
const WIDTH = 900;
const ALL = process.argv.includes("--all");

/** Place name (exactly as in cityDefaults.js) → Wikipedia article titles to try, in order. */
const PLACE_SOURCES = {
  // Mangaluru
  "Panambur Beach": ["Panambur Beach", "Panambur"],
  "Tannirbhavi Beach": ["Tannirbhavi Beach", "Tannirbavi"],
  "Kudroli Gokarnanatheshwara Temple": ["Gokarnanatheshwara Temple", "Kudroli Gokarnanatheshwara Temple"],
  "Kadri Manjunatha Temple": ["Kadri Manjunath Temple", "Kadri Manjunatha Temple"],
  "Mangaladevi Temple": ["Mangaladevi Temple"],
  "Pilikula Nisargadhama": ["Pilikula Nisargadhama"],
  "St. Aloysius Chapel": ["St. Aloysius Chapel", "St Aloysius Chapel, Mangalore"],
  "Someshwara Beach": ["Someshwar Beach", "Someshwara Beach", "Ullal"],
  "Udupi": ["Udupi Sri Krishna Matha", "Udupi"],
  "Malpe Beach": ["Malpe Beach", "Malpe"],
  "Kateel Temple": ["Kateel Sri Durgaparameshwari Temple", "Kateel"],
  "Dharmasthala": ["Dharmasthala Manjunatha Temple", "Dharmasthala"],
  "Kukke Subramanya": ["Kukke Subramanya Temple", "Subramanya, Karnataka"],
  "Moodbidri": ["Saavira Kambada Basadi", "Moodabidri"],
  "Karkala": ["Gommateshwara statue, Karkala", "Karkala"],
  "Mulki": ["Mulki, Karnataka", "Mulki"],
  // Tirupati
  "Sri Govindaraja Swamy Temple": ["Govindaraja Temple, Tirupati", "Sri Govindaraja Swamy Temple"],
  "Sri Padmavathi Ammavari Temple": ["Padmavathi Ammavari Temple", "Tiruchanur"],
  "Kapila Theertham": ["Kapila Theertham"],
  "Sri Kodandarama Swamy Temple": ["Kodandarama Temple, Tirupati", "Sri Kodandarama Swamy Temple, Tirupati"],
  "ISKCON Temple Tirupati": ["ISKCON Tirupati", "ISKCON Temple Tirupati"],
  "Sri Venkateswara Zoological Park": ["Sri Venkateswara Zoological Park"],
  "Regional Science Centre": ["Regional Science Centre, Tirupati"],
  "Chandragiri Fort": ["Chandragiri Fort"],
  "Srikalahasti": ["Srikalahasti Temple", "Srikalahasti"],
  "Kanipakam Temple": ["Kanipakam Vinayaka Temple", "Kanipakam"],
  "Talakona Waterfalls": ["Talakona waterfall", "Talakona"],
  "Kailasakona Waterfalls": ["Kailasakona Falls", "Kailasakona"],
  "Nagalapuram": ["Vedanarayana Temple, Nagalapuram", "Nagalapuram"],
  "Narayanavanam Temple": ["Kalyana Venkateswara Temple, Narayanavanam", "Narayanavanam"],
  "Horsley Hills": ["Horsley Hills"],
  // Pune
  "Shaniwar Wada": ["Shaniwar Wada"],
  "Aga Khan Palace": ["Aga Khan Palace"],
  "Dagdusheth Ganpati Temple": ["Shreemant Dagdusheth Halwai Ganpati Temple", "Dagadusheth Halwai Ganapati Temple"],
  "Pataleshwar Cave Temple": ["Pataleshwar Cave Temple", "Pataleshwar"],
  "Raja Dinkar Kelkar Museum": ["Raja Dinkar Kelkar Museum"],
  "Sarasbaug Ganpati Temple": ["Sarasbaug"],
  "Parvati Hill": ["Parvati Hill"],
  "Rajiv Gandhi Zoological Park": ["Rajiv Gandhi Zoological Park"],
  "Lal Mahal": ["Lal Mahal"],
  "Sinhagad Fort": ["Sinhagad"],
  "Khadakwasla Dam": ["Khadakwasla Dam"],
  "Mulshi": ["Mulshi Dam", "Mulshi"],
  "Lonavala": ["Lonavala"],
  "Khandala": ["Khandala"],
  "Pawna Lake": ["Pawna Lake", "Pavana Dam"],
  "Jejuri Temple": ["Khandoba Temple, Jejuri", "Jejuri"],
  "Bhimashankar": ["Bhimashankar Temple", "Bhimashankar Wildlife Sanctuary"],
  "Lavasa": ["Lavasa"],
  // Visakhapatnam
  "RK Beach": ["Ramakrishna Beach", "RK Beach"],
  "Kailasagiri Hill Park": ["Kailasagiri"],
  "Rushikonda Beach": ["Rushikonda Beach", "Rushikonda"],
  "Simhachalam Temple": ["Simhachalam Temple", "Varaha Lakshmi Narasimha temple, Simhachalam"],
  "INS Kurusura Submarine Museum": ["INS Kursura (S20)", "INS Kursura Submarine Museum"],
  "TU-142 Aircraft Museum": ["TU 142 Aircraft Museum", "TU-142 Aircraft Museum"],
  "Yarada Beach": ["Yarada Beach", "Yarada"],
  "Dolphin’s Nose Lighthouse": ["Dolphin's Nose, Visakhapatnam", "Dolphin's Nose"],
  "Indira Gandhi Zoological Park": ["Indira Gandhi Zoological Park"],
  "Visakha Museum": ["Visakha Museum", "Visakhapatnam Museum"],
  "Bheemili": ["Bheemunipatnam", "Bheemili"],
  "Thotlakonda": ["Thotlakonda"],
  "Bavikonda": ["Bavikonda"],
  "Kambalakonda Wildlife Sanctuary": ["Kambalakonda Wildlife Sanctuary"],
  "Borra Caves": ["Borra Caves"],
  "Araku Valley": ["Araku Valley"],
  "Ananthagiri Hills": ["Ananthagiri Hills, Visakhapatnam", "Ananthagiri hills"],
  "Vizianagaram": ["Vizianagaram Fort", "Vizianagaram"],
};

/** "Pune to Lonavala" → "Lonavala" (same rule as CityLanding.jsx) */
export const destOf = (name) => (/ to (.+)$/.exec(name)?.[1] || name).trim();

export function placeNames(cities = CITY_CONTENT) {
  const names = new Set();
  for (const c of Object.values(cities)) {
    for (const p of c.attractions?.places || []) names.add(p.name);
    for (const p of c.dayTrips?.places || []) names.add(destOf(p.name));
  }
  return [...names];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stripHtml = (h = "") => h.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/\s+/g, " ").trim();
const isFree = (lic = "") => /^(cc[\s-]|cc0|public domain|pd)/i.test(lic.trim()) && !/fair use|non-free/i.test(lic);

async function api(params, fetchImpl = fetch) {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", origin: "*", ...params })}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetchImpl(url, { headers: { "User-Agent": UA, "Api-User-Agent": UA } });
    if (res.ok) return res.json();
    if (res.status === 429 || res.status >= 500) { await sleep(1000 * attempt); continue; }
    throw new Error(`Wikipedia API ${res.status} for ${url}`);
  }
  throw new Error(`Wikipedia API kept failing for ${url}`);
}

/** Lead image of an article, free licences only → "File_name.jpg" or null. */
export async function leadImage(title, fetchImpl) {
  const j = await api({ action: "query", redirects: "1", prop: "pageimages", piprop: "name", pilicense: "free", titles: title }, fetchImpl);
  const page = j?.query?.pages?.[0];
  return page && !page.missing && page.pageimage ? page.pageimage : null;
}

/** Thumbnail URL + attribution for a file (works for Commons files via enwiki's shared repo). */
export async function fileInfo(file, fetchImpl) {
  const j = await api({ action: "query", prop: "imageinfo", iiprop: "url|size|extmetadata", iiurlwidth: String(WIDTH), titles: `File:${file}` }, fetchImpl);
  const info = j?.query?.pages?.[0]?.imageinfo?.[0];
  if (!info?.thumburl) return null;
  const meta = info.extmetadata || {};
  const license = meta.LicenseShortName?.value || "";
  if (!isFree(license)) return null;
  return {
    src: info.thumburl,
    width: info.thumbwidth,
    height: info.thumbheight,
    author: stripHtml(meta.Artist?.value || "") || "Wikimedia Commons contributor",
    license,
    licenseUrl: meta.LicenseUrl?.value || "",
    source: info.descriptionurl,
    file,
  };
}

export async function resolvePlace(name, fetchImpl) {
  for (const cand of PLACE_SOURCES[name] || [name]) {
    const file = typeof cand === "object" ? cand.file : await leadImage(cand, fetchImpl);
    await sleep(150);
    if (!file) continue;
    const info = await fileInfo(file, fetchImpl);
    await sleep(150);
    if (info) return { ...info, article: typeof cand === "string" ? cand : undefined };
  }
  return null;
}

async function main() {
  const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
  const out = { ...existing };
  const names = placeNames();
  let found = 0; const missing = [];
  for (const name of names) {
    if (existing[name]?.locked || (!ALL && existing[name]?.src)) { found++; continue; }
    try {
      const img = await resolvePlace(name);
      if (img) { out[name] = img; found++; console.log(`✓ ${name}  ←  ${img.file} (${img.license})`); }
      else { delete out[name]; missing.push(name); console.log(`– ${name}: no free photo found`); }
    } catch (e) {
      missing.push(name); console.log(`! ${name}: ${e.message}`);
    }
  }
  const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
  fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`\n${found}/${names.length} places have a photo → ${path.relative(process.cwd(), OUT)}`);
  if (missing.length) console.log(`No photo yet (placeholder shown): ${missing.join(", ")}\nAdd article titles or { file } overrides in PLACE_SOURCES and re-run.`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("fetch-place-images.mjs")) main();
