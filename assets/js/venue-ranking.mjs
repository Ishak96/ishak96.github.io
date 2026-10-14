// Venue classification and prestige ranking. Kept independent of the charts:
// everything here works on plain catalog data from _data/venue_categories.json.

const VENUE_TYPES = new Set(["conference", "journal", "preprint"]);
const COMPATIBLE_TYPES = {
  journal: new Set(["journal", "preprint"]),
  proceedings: new Set(["conference", "preprint"]),
};
// Publisher/society prefixes and filler words that bibliographies add or omit freely.
const IGNORED_WORDS = new Set(["the", "ieee", "cvf", "acm", "rsj", "proceedings", "proc", "annual", "international", "intl"]);
const compiled = new WeakMap();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function cleanText(value = "") {
  return String(value)
    .replace(/[{}]/g, "")
    .replace(/\\([&%_])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeVenueText(value = "") {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((word) => word && !IGNORED_WORDS.has(word) && !/^\d+(?:st|nd|rd|th)?$/.test(word))
    .join(" ");
}

const acronymPattern = (acronym) => new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(acronym)}(?![A-Za-z0-9])`);

export function validateVenueCatalog(catalog) {
  if (compiled.has(catalog)) return compiled.get(catalog);
  if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) throw new Error("The venue catalog must be an object.");
  const { categories, venues, ranking_systems: systems = {}, prestige_scale: scale } = catalog;
  if (!scale || !Number.isFinite(scale.min) || !Number.isFinite(scale.max) || scale.min > scale.max) {
    throw new Error("The venue catalog needs a numeric prestige_scale.");
  }
  const inScale = (score) => Number.isFinite(score) && score >= scale.min && score <= scale.max;
  for (const [id, system] of Object.entries(systems)) {
    if (!system?.label || !system.scores || !Object.values(system.scores).every(inScale)) throw new Error(`Invalid ranking system: ${id}`);
    if (!VENUE_TYPES.has(system.applies_to)) throw new Error(`Ranking system ${id} has an invalid applies_to type.`);
  }

  if (!Array.isArray(categories) || !categories.length) throw new Error("The venue catalog needs categories.");
  const categoryIds = new Set();
  const labels = new Set();
  const categoryRules = categories.map((category) => {
    if (!category || !/^[a-z0-9-]+$/.test(category.id) || typeof category.label !== "string" || !category.label.trim()) {
      throw new Error("Each venue category needs an identifier and label.");
    }
    if (categoryIds.has(category.id)) throw new Error(`Duplicate venue-category identifier: ${category.id}`);
    if (labels.has(category.label)) throw new Error(`Duplicate venue-category label: ${category.label}`);
    categoryIds.add(category.id);
    labels.add(category.label);
    if (!/^#[a-f0-9]{6}$/i.test(category.color)) throw new Error(`Invalid color for venue category ${category.id}.`);
    if (!Array.isArray(category.keywords) || category.keywords.some((keyword) => typeof keyword !== "string" || !keyword.trim())) {
      throw new Error(`Invalid keywords for venue category ${category.id}.`);
    }
    return { id: category.id, keywords: category.keywords.map((keyword) => new RegExp(`\\b(?:${keyword})`, "i")) };
  });
  if (!categoryIds.has("other")) throw new Error("The venue catalog requires the 'other' fallback category.");

  if (!Array.isArray(venues)) throw new Error("The venue catalog needs a venues array.");
  const venueIds = new Set();
  const acronymOwners = new Map();
  const nameOwners = new Map();
  const venueRules = venues.map((venue, index) => {
    const where = `venue ${venue?.id ?? index}`;
    if (!venue || !/^[a-z0-9-]+$/.test(venue.id)) throw new Error(`Invalid venue identifier at position ${index}.`);
    if (venueIds.has(venue.id)) throw new Error(`Duplicate venue identifier: ${venue.id}`);
    venueIds.add(venue.id);
    if (!venue.abbreviation?.trim() || !venue.name?.trim()) throw new Error(`${where} needs a name and abbreviation.`);
    if (!VENUE_TYPES.has(venue.type)) throw new Error(`${where} has an invalid type.`);
    if (!categoryIds.has(venue.primary_category) || venue.primary_category === "other") throw new Error(`${where} has an invalid primary category.`);
    const secondary = venue.secondary_categories ?? [];
    if (!Array.isArray(secondary) || secondary.some((id) => !categoryIds.has(id) || id === venue.primary_category || id === "other")) {
      throw new Error(`${where} has invalid secondary categories.`);
    }
    if (new Set(secondary).size !== secondary.length) throw new Error(`${where} repeats a secondary category.`);
    const acronyms = venue.acronyms ?? [];
    const aliases = venue.name_aliases ?? [];
    const excludes = venue.exclude_patterns ?? [];
    for (const list of [acronyms, aliases, excludes]) {
      if (!Array.isArray(list) || list.some((value) => typeof value !== "string" || !value.trim())) throw new Error(`${where} has an invalid list.`);
    }
    for (const acronym of acronyms) {
      if (acronymOwners.has(acronym)) throw new Error(`Acronym ${acronym} is used by ${acronymOwners.get(acronym)} and ${venue.id}.`);
      acronymOwners.set(acronym, venue.id);
    }
    const names = [...new Set([venue.name, ...aliases].map(normalizeVenueText))].filter(Boolean);
    for (const name of names) {
      const owner = nameOwners.get(`${venue.type}|${name}`);
      if (owner) throw new Error(`Name "${name}" is used by ${owner} and ${venue.id}.`);
      nameOwners.set(`${venue.type}|${name}`, venue.id);
    }

    let ranking = null;
    if (venue.ranking !== null && venue.ranking !== undefined) {
      const system = systems[venue.ranking.system];
      if (!system) throw new Error(`${where} uses an unknown ranking system.`);
      if (system.applies_to !== venue.type) throw new Error(`${where}: ${venue.ranking.system} does not rank ${venue.type}s.`);
      if (!Object.hasOwn(system.scores, venue.ranking.value)) throw new Error(`${where} has an invalid ${venue.ranking.system} value.`);
      ranking = { score: system.scores[venue.ranking.value], formal: true, basis: `${system.label}: ${venue.ranking.value}` };
    }
    if (venue.internal_assessment) {
      if (ranking) throw new Error(`${where} cannot have both a formal ranking and an internal assessment.`);
      const { score, rationale } = venue.internal_assessment;
      if (!inScale(score) || typeof rationale !== "string" || !rationale.trim()) throw new Error(`${where} has an invalid internal assessment.`);
      ranking = { score, formal: false, basis: "Internal assessment (not a formal ranking)" };
    }
    return {
      venue,
      index,
      ranking,
      names,
      acronyms: acronyms.map((acronym) => ({ acronym, pattern: acronymPattern(acronym) })),
      excludes: excludes.map((pattern) => new RegExp(pattern, "i")),
      workshop: names.some((name) => /\bworkshops?\b/.test(name)),
    };
  });

  const result = { categoryRules, venueRules, categories };
  compiled.set(catalog, result);
  return result;
}

// kind: "journal" (BibTeX journal field), "proceedings" (booktitle) or "" (unknown).
export function matchVenue(text, catalog, kind = "") {
  const { venueRules } = validateVenueCatalog(catalog);
  const raw = cleanText(text);
  const normalized = normalizeVenueText(raw);
  if (!normalized) return null;
  const padded = ` ${normalized} `;
  const isWorkshop = /\bworkshops?\b/.test(normalized);
  const allowed = COMPATIBLE_TYPES[kind];
  let best = null;
  for (const rule of venueRules) {
    if (allowed && !allowed.has(rule.venue.type)) continue;
    if (rule.excludes.some((pattern) => pattern.test(raw))) continue;
    // Workshops do not inherit the rank of their host conference.
    if (isWorkshop && !rule.workshop) continue;
    // Journal names must match exactly ("Pattern Recognition" is not "Pattern Recognition Letters").
    const nameLength = Math.max(
      0,
      ...rule.names.filter((name) => (rule.venue.type === "journal" ? name === normalized : padded.includes(` ${name} `))).map((name) => name.length)
    );
    const acronymLength = Math.max(0, ...rule.acronyms.filter(({ pattern }) => pattern.test(raw)).map(({ acronym }) => acronym.length));
    if (!nameLength && !acronymLength) continue;
    const candidate = { rule, nameLength, acronymLength };
    if (!best || nameLength > best.nameLength || (nameLength === best.nameLength && acronymLength > best.acronymLength)) best = candidate;
  }
  return best ? best.rule.venue : null;
}

export function venueScore(venue, catalog) {
  if (!venue) return null;
  const rule = validateVenueCatalog(catalog).venueRules.find((item) => item.venue === venue || item.venue.id === venue.id);
  return rule?.ranking ? { ...rule.ranking, index: rule.index } : null;
}

export function classifyVenue(text, catalog, { override = "", kind = "" } = {}) {
  const { categoryRules, categories } = validateVenueCatalog(catalog);
  const venue = matchVenue(text, catalog, kind);
  const wanted = override.trim().toLowerCase();
  if (wanted) {
    const category = categories.find((item) => item.id === wanted || item.label.toLowerCase() === wanted);
    if (!category) throw new Error(`Unknown venue_category '${override.trim()}'.`);
    return { categoryId: category.id, categoryIds: [category.id], venue, method: "override" };
  }
  if (venue) {
    return {
      categoryId: venue.primary_category,
      categoryIds: [venue.primary_category, ...(venue.secondary_categories ?? [])],
      venue,
      method: "catalog",
    };
  }
  // Uncatalogued venue: most keyword hits wins; ties go to the category listed first.
  const raw = cleanText(text);
  let best = { id: "other", score: 0 };
  for (const rule of categoryRules) {
    if (rule.id === "other") continue;
    const score = rule.keywords.filter((pattern) => pattern.test(raw)).length;
    if (score > best.score) best = { id: rule.id, score };
  }
  return { categoryId: best.id, categoryIds: [best.id], venue: null, method: best.score ? "keywords" : "fallback" };
}

// Highest prestige score wins; ties prefer formal rankings, then catalog order.
export function topVenue(venues, catalog) {
  let best = null;
  for (const venue of venues) {
    const score = venueScore(venue, catalog);
    if (!score) continue;
    if (
      !best ||
      score.score > best.score ||
      (score.score === best.score && score.formal && !best.formal) ||
      (score.score === best.score && score.formal === best.formal && score.index < best.index)
    ) {
      best = { ...score, venue };
    }
  }
  return best && { venue: best.venue, name: best.venue.abbreviation, score: best.score, formal: best.formal, basis: best.basis };
}
