#!/usr/bin/env node
// Fetches public Google Scholar profile metrics and saves them to
// assets/data/scholar-metrics.json. Run daily by .github/workflows/scholar-metrics.yml.
// If Scholar blocks the request, the previously saved metrics are kept.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PROFILE_URL = "https://scholar.google.com/citations";
export const OUTPUT_FILE = "assets/data/scholar-metrics.json";

export function parseScholarMetrics(html) {
  const table = html.match(/<table[^>]*id="gsc_rsb_st"[\s\S]*?<\/table>/);
  const values = [...(table ? table[0] : "").matchAll(/<td class="gsc_rsb_std">([\d,]+)<\/td>/g)].map((match) => Number(match[1].replace(/,/g, "")));
  if (values.length < 6 || values.some((value) => !Number.isInteger(value))) {
    throw new Error(
      /captcha|unusual traffic|automated queries/i.test(html) ? "Google Scholar requested a captcha." : "Unexpected Google Scholar profile layout."
    );
  }
  return {
    citations: { all: values[0], recent: values[1] },
    h_index: { all: values[2], recent: values[3] },
    i10_index: { all: values[4], recent: values[5] },
  };
}

export async function fetchScholarMetrics(userId, fetchSource = fetch, now = new Date()) {
  const profileUrl = `${PROFILE_URL}?user=${encodeURIComponent(userId)}&hl=en`;
  const response = await fetchSource(profileUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!response.ok) throw new Error(`Google Scholar responded with HTTP ${response.status}.`);
  return {
    available: true,
    source: "google-scholar",
    user_id: userId,
    profile_url: profileUrl,
    fetched_at: now.toISOString(),
    ...parseScholarMetrics(await response.text()),
  };
}

export function sameMetrics(a, b) {
  const pick = (m) => JSON.stringify([m?.user_id, m?.citations, m?.h_index, m?.i10_index]);
  return pick(a) === pick(b);
}

async function readScholarUserId() {
  const config = await readFile("_config.yml", "utf8");
  const match = config.match(/^scholar_userid:\s*["']?([\w-]+)/m);
  if (!match) throw new Error("scholar_userid is not set in _config.yml.");
  return match[1];
}

async function main() {
  const userId = process.argv[2] || (await readScholarUserId());
  const previous = await readFile(OUTPUT_FILE, "utf8")
    .then(JSON.parse)
    .catch(() => null);
  let metrics;
  try {
    metrics = await fetchScholarMetrics(userId);
  } catch (error) {
    // Keep the last saved numbers; the annotation makes the failure visible in the Actions run.
    console.log(`::warning::Google Scholar metrics were not updated: ${error.message}`);
    return;
  }
  if (sameMetrics(previous, metrics)) {
    console.log("Google Scholar metrics are unchanged.");
    return;
  }
  await mkdir(dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, `${JSON.stringify(metrics, null, 2)}\n`);
  console.log(`Updated ${OUTPUT_FILE}: ${metrics.citations.all} citations, h-index ${metrics.h_index.all}, i10-index ${metrics.i10_index.all}.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
