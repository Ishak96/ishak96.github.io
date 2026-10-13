const BACKGROUND = "#171c23";
const TEXT = "#ece9e2";
const MUTED = "#b8b1a3";

export function plainText(value = "") {
  return value
    .replace(/[{}]/g, "")
    .replace(/\\([&%_])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateTopics(topics) {
  if (!Array.isArray(topics) || !topics.length) throw new Error("Research-topic rules must be a nonempty array.");
  const ids = new Set();
  for (const topic of topics) {
    if (!topic || !/^[a-z0-9-]+$/.test(topic.id) || typeof topic.label !== "string" || !topic.label.trim()) {
      throw new Error("Each research topic needs an identifier and label.");
    }
    if (ids.has(topic.id)) throw new Error(`Duplicate research-topic identifier: ${topic.id}`);
    ids.add(topic.id);
    if (!/^#[a-f0-9]{6}$/i.test(topic.color)) throw new Error(`Invalid color for ${topic.id}.`);
    if (!Array.isArray(topic.patterns) || !Array.isArray(topic.required_context ?? [])) {
      throw new Error(`Invalid patterns for ${topic.id}.`);
    }
    for (const pattern of [...topic.patterns, ...(topic.required_context ?? [])]) {
      if (typeof pattern !== "string") throw new Error(`Invalid pattern for ${topic.id}.`);
      new RegExp(pattern, "i");
    }
  }
  if (!ids.has("other")) throw new Error("Research-topic rules require the 'other' fallback.");
}

export function classifyPublication(record, topics) {
  const warnings = [];
  if (!record.abstract?.trim()) warnings.push(`${record.key}: missing abstract; using available metadata.`);
  if (!/^\d{4}$/.test(record.year ?? "")) warnings.push(`${record.key}: missing or invalid publication year.`);
  const override = record.research_topic?.trim();
  if (override) {
    const topic = topics.find((item) => item.id === override || item.label === override);
    if (!topic) throw new Error(`${record.key}: unknown research_topic '${override}'.`);
    return { categoryId: topic.id, reason: "Explicit research_topic metadata", warnings };
  }
  const context = plainText(`${record.title} ${record.abstract ?? ""}`);
  for (const field of ["title", "abstract"]) {
    const text = plainText(record[field] ?? "");
    const matches = topics.filter(
      (topic) =>
        topic.id !== "other" &&
        topic.patterns.some((pattern) => new RegExp(pattern, "i").test(text)) &&
        (!topic.required_context?.length || topic.required_context.some((pattern) => new RegExp(pattern, "i").test(context)))
    );
    if (matches.length === 1) return { categoryId: matches[0].id, reason: `Primary topic matched in ${field}`, warnings };
    if (matches.length > 1) {
      warnings.push(`${record.key}: ambiguous ${field} (${matches.map((topic) => topic.id).join(", ")}); set research_topic.`);
      return { categoryId: "other", reason: `Ambiguous primary topic in ${field}`, warnings };
    }
  }
  warnings.push(`${record.key}: no matching topic; counted in Other Research Topics. Set research_topic or extend the rules.`);
  return { categoryId: "other", reason: "No matching primary-topic rule", warnings };
}

export function analyzePublications(records, topics) {
  validateTopics(topics);
  if (!Array.isArray(records) || !records.length) throw new Error("The publication source is empty or invalid.");
  const keys = new Set();
  const identities = new Set();
  const dois = new Set();
  const warnings = [];
  const publications = records.map((record) => {
    if (!record || typeof record !== "object") throw new Error("Invalid publication record.");
    for (const field of ["key", "title", "abstract", "year", "venue", "doi", "research_topic"]) {
      if (record[field] !== undefined && typeof record[field] !== "string") throw new Error(`Invalid publication field: ${field}`);
    }
    if (!record.key?.trim() || !plainText(record.title)) throw new Error("A publication is missing its key or title.");
    if (keys.has(record.key)) throw new Error(`Duplicate BibTeX key: ${record.key}`);
    keys.add(record.key);
    const title = plainText(record.title);
    const year = (record.year ?? "").trim();
    const identity = `${title.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")}|${year}`;
    const doi = (record.doi ?? "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "");
    if (identities.has(identity) || (doi && dois.has(doi))) throw new Error(`Possible duplicate publication: ${record.key}`);
    identities.add(identity);
    if (doi) dois.add(doi);
    const classification = classifyPublication(record, topics);
    warnings.push(...classification.warnings);
    return {
      key: record.key,
      title,
      year,
      venue: plainText(record.venue ?? ""),
      categoryId: classification.categoryId,
      category: topics.find((topic) => topic.id === classification.categoryId).label,
      reason: classification.reason,
    };
  });
  const categories = topics
    .map((topic) => {
      const titles = publications.filter((paper) => paper.categoryId === topic.id).map((paper) => paper.title);
      return {
        id: topic.id,
        label: topic.label,
        color: topic.color,
        count: titles.length,
        percentage: Math.round((10000 * titles.length) / publications.length) / 100,
        titles,
      };
    })
    .filter((category) => category.count);
  const report = { total: publications.length, publications, categories, warnings };
  validateReport(report);
  const largestCount = Math.max(...categories.map((category) => category.count));
  const largest = categories.filter((category) => category.count === largestCount);
  const other = categories.filter((category) => category.count < largestCount).map((category) => category.label);
  report.interpretation =
    `${largest.map((category) => category.label).join(" and ")} ${largest.length === 1 ? "accounts" : "tie"} for the largest share: ` +
    `${largestCount} of ${report.total} publications (${largest[0].percentage}%${largest.length > 1 ? " each" : ""}).` +
    (other.length ? ` The selected record also includes ${other.join(", ")}.` : "") +
    " Counts describe topic representation, not citation impact, quality, or research importance.";
  return report;
}

export function validateReport(report) {
  if (!Number.isInteger(report.total) || report.total < 1 || report.publications.length !== report.total) {
    throw new Error("Invalid publication total.");
  }
  if (new Set(report.publications.map((paper) => paper.key)).size !== report.total) throw new Error("Publications must be counted exactly once.");
  if (report.categories.reduce((sum, category) => sum + category.count, 0) !== report.total)
    throw new Error("Category counts do not sum to the total.");
  const percentage = report.categories.reduce((sum, category) => sum + category.percentage, 0);
  if (Math.abs(percentage - 100) > 0.005 * report.categories.length + 1e-8) throw new Error("Percentages do not sum to approximately 100%.");
  for (const category of report.categories) {
    const count = report.publications.filter((paper) => paper.categoryId === category.id).length;
    if (count !== category.count || category.percentage !== Math.round((10000 * count) / report.total) / 100) {
      throw new Error(`Inconsistent category data: ${category.id}`);
    }
  }
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]);
}

export function analyzeVenues(report) {
  const palette = ["#8e99aa", "#b08b6f", "#829b8e", "#b6a1bd", "#baa875", "#79a8ac", "#b8b1a3"];
  const groups = new Map();
  for (const paper of report.publications) {
    const label = paper.venue || "Venue not specified";
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(paper);
  }
  const categories = [...groups].map(([label, papers], index) => ({
    id: `venue-${index}`,
    label,
    shortLabel: label.match(/\(([A-Z][A-Z0-9/-]+)(?:\s+\d{4})?\)/)?.[1] || label.replace(/^IEEE\s+/, "").replace(/\s+\d{4}\b/g, ""),
    color: palette[index % palette.length],
    count: papers.length,
    percentage: Math.round((10000 * papers.length) / report.total) / 100,
    titles: papers.map((paper) => paper.title),
  }));
  const publications = report.publications.map((paper) => ({
    ...paper,
    categoryId: categories.find((category) => category.label === (paper.venue || "Venue not specified")).id,
  }));
  const result = { total: report.total, publications, categories };
  validateReport(result);
  return result;
}

function pieMarkup(report, interactive = false) {
  let angle = -Math.PI / 2;
  const radius = 145;
  const point = (theta, distance = radius) => [180 + distance * Math.cos(theta), 180 + distance * Math.sin(theta)];
  const slices = report.categories.map((category) => {
    const next = angle + (2 * Math.PI * category.count) / report.total;
    const start = point(angle);
    const end = point(next);
    const label = point((angle + next) / 2, 108);
    const accessibility = interactive
      ? ` tabindex="0" role="button" aria-label="${escapeXml(`${category.label}: ${category.count} publications, ${category.percentage}%`)}"`
      : "";
    const attributes = `fill="${category.color}" stroke="${BACKGROUND}" stroke-width="3" data-category="${escapeXml(category.id)}" data-count="${
      category.count
    }"${accessibility}`;
    const shape =
      category.count === report.total
        ? `<circle cx="180" cy="180" r="${radius}" ${attributes}/>`
        : `<path d="M180,180 L${start.join(",")} A${radius},${radius} 0 ${category.count > report.total / 2 ? 1 : 0},1 ${end.join(
            ","
          )} Z" ${attributes}/>`;
    angle = next;
    return (
      shape +
      `<text x="${label[0]}" y="${
        label[1]
      }" fill="#0e1116" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="700" pointer-events="none">${escapeXml(
        category.shortLabel || `${category.percentage}%`
      )}</text>`
    );
  });
  return (
    slices.join("") +
    `<circle cx="180" cy="180" r="70" fill="${BACKGROUND}"/>` +
    `<text x="180" y="177" text-anchor="middle" fill="${TEXT}" font-size="38" font-weight="700">${report.total}</text>` +
    `<text x="180" y="202" text-anchor="middle" fill="${MUTED}" font-size="13">publications</text>`
  );
}

export function createPieSvg(report, { id = "research", title = "Research Focus Across Publications", interactive = false } = {}) {
  validateReport(report);
  const description = report.categories
    .map((category) => `${category.label}: ${category.count} publication${category.count === 1 ? "" : "s"}, ${category.percentage}%`)
    .join("; ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" role="${interactive ? "group" : "img"}" aria-labelledby="${escapeXml(
    id
  )}-pie-title ${escapeXml(id)}-pie-description" font-family="Arial, sans-serif">
    <title id="${escapeXml(id)}-pie-title">${escapeXml(title)}</title>
    <desc id="${escapeXml(id)}-pie-description">${escapeXml(description)}</desc>${pieMarkup(report, interactive)}</svg>`;
}

export function createChartSvg(report) {
  validateReport(report);
  const height = Math.max(470, 130 + report.categories.length * 80);
  const legend = report.categories
    .map((category, index) => {
      const words = category.label.split(" ");
      const lines = [""];
      for (const word of words) {
        if ((lines.at(-1) + " " + word).trim().length > 40) lines.push(word);
        else lines[lines.length - 1] = (lines.at(-1) + " " + word).trim();
      }
      const y = 125 + index * 80;
      return (
        lines
          .map(
            (line, lineIndex) =>
              `<text x="415" y="${y + lineIndex * 22}" fill="${category.color}" font-size="18" font-weight="700">${escapeXml(line)}</text>`
          )
          .join("") +
        `<text x="415" y="${y + lines.length * 22 + 4}" fill="${TEXT}" font-size="16">${category.count} publication${
          category.count === 1 ? "" : "s"
        } | ${category.percentage}%</text>`
      );
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 ${height}" width="860" height="${height}" role="img" font-family="Arial, sans-serif">
    <title>Research Focus Across Publications</title><desc>${escapeXml(report.interpretation)}</desc>
    <rect width="860" height="${height}" fill="${BACKGROUND}"/>
    <text x="30" y="42" fill="${TEXT}" font-size="26" font-weight="700">Research Focus Across Publications</text>
    <text x="30" y="72" fill="${MUTED}" font-size="16">Distribution of publications by primary research topic</text>
    <g transform="translate(15 90)">${pieMarkup(report)}</g>${legend}
    <text x="30" y="${
      height - 20
    }" fill="${MUTED}" font-size="13">One primary topic per publication. Slice size represents publication count only.</text>
  </svg>`;
}

export function toCsv(headers, rows) {
  return [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n") + "\r\n";
}

function renderInteractiveChart(container, report, id, title) {
  container.innerHTML = createPieSvg(report, { id, title, interactive: true });
  const tooltip = document.createElement("div");
  tooltip.className = "research-focus-tooltip";
  tooltip.id = `${id}-tooltip`;
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;
  const heading = document.createElement("strong");
  const details = document.createElement("span");
  tooltip.append(heading, details);
  container.append(tooltip);
  const hide = () => {
    tooltip.hidden = true;
  };
  for (const slice of container.querySelectorAll("[data-category]")) {
    const category = report.categories.find((item) => item.id === slice.dataset.category);
    slice.setAttribute("aria-describedby", tooltip.id);
    const show = () => {
      heading.textContent = category.label;
      details.textContent = `${category.count} publication${category.count === 1 ? "" : "s"} | ${category.percentage}%`;
      tooltip.hidden = false;
    };
    slice.addEventListener("pointerenter", show);
    slice.addEventListener("pointerleave", hide);
    slice.addEventListener("focus", show);
    slice.addEventListener("blur", hide);
    slice.addEventListener("click", show);
    slice.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hide();
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        show();
      }
    });
  }
  container.addEventListener("pointerleave", hide);
  document.addEventListener("pointerdown", (event) => {
    if (!container.contains(event.target)) hide();
  });
}

function showReport(section, report) {
  section.querySelector("[data-research-total]").textContent = `${report.total} publications in `;
  renderInteractiveChart(section.querySelector("[data-research-pie]"), report, "research", "Research topics");
  renderInteractiveChart(section.querySelector("[data-venue-pie]"), analyzeVenues(report), "venues", "Journals and conferences");
  const notices = section.querySelector("[data-research-warnings]");
  for (const warning of report.warnings) {
    console.warn("Research focus:", warning);
    const item = document.createElement("li");
    item.textContent = warning;
    notices.append(item);
  }
  section.querySelector("[data-research-notes]").hidden = !report.warnings.length;
  section.querySelector("[data-research-content]").hidden = false;
  section.querySelector("[data-research-status]").hidden = true;
}

export function isOral(publication) {
  return /^(true|yes|1)$/i.test(String(publication.oral ?? "").trim());
}

export function hasAward(publication) {
  return /\baward/i.test(plainText(publication.note ?? ""));
}

export function analyzeHighlights(publications) {
  const orals = publications.filter(isOral);
  const awards = publications.filter(hasAward);
  return {
    orals: orals.length,
    awards: awards.length,
    oralTitles: orals.map((paper) => plainText(paper.title)),
    awardNotes: awards.map((paper) => plainText(paper.note)),
  };
}

function renderHighlights(section, highlights) {
  const container = section.querySelector("[data-publication-highlights]");
  if (!container) return;
  const fill = (name, count, details) => {
    const cell = container.querySelector(`[data-highlight-value="${name}"]`);
    cell.textContent = String(count);
    cell.title = details.join("\n");
  };
  fill("orals", highlights.orals, highlights.oralTitles);
  fill("awards", highlights.awards, highlights.awardNotes);
  container.hidden = false;
}

const SCHOLAR_METRICS = ["citations", "h_index", "i10_index"];

export function validateScholarMetrics(metrics) {
  if (!metrics || metrics.available !== true) return null;
  for (const name of SCHOLAR_METRICS) {
    const value = metrics[name]?.all;
    if (!Number.isInteger(value) || value < 0) throw new Error(`Invalid Google Scholar metric: ${name}.`);
  }
  if (Number.isNaN(Date.parse(metrics.fetched_at))) throw new Error("Invalid Google Scholar update time.");
  return metrics;
}

export function renderScholarMetrics(container, metrics) {
  for (const name of SCHOLAR_METRICS) {
    const value = metrics[name];
    const cell = container.querySelector(`[data-scholar-value="${name}"]`);
    cell.textContent = value.all.toLocaleString("en-US");
    if (Number.isInteger(value.recent)) cell.title = `${value.recent.toLocaleString("en-US")} in the last 5 years`;
  }
  const meta = container.querySelector("[data-scholar-meta]");
  const date = new Date(metrics.fetched_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  const link = document.createElement("a");
  link.href = metrics.profile_url;
  link.rel = "external nofollow noopener";
  link.target = "_blank";
  link.textContent = "Google Scholar";
  meta.replaceChildren("Source: ", link);
  container.hidden = false;
}

export async function initializeScholarMetrics(section, fetchSource = fetch) {
  const container = section.querySelector("[data-scholar-metrics]");
  if (!container || !section.dataset.scholarSource) return;
  try {
    const response = await fetchSource(section.dataset.scholarSource, { cache: "no-store", mode: "cors" });
    if (!response.ok) throw new Error(`Scholar metrics request failed (HTTP ${response.status}).`);
    const metrics = validateScholarMetrics(await response.json());
    if (metrics) renderScholarMetrics(container, metrics);
    else console.warn("Google Scholar metrics are currently unavailable.");
  } catch (error) {
    container.hidden = true;
    console.error("Google Scholar metrics failed:", error);
  }
}

export async function initializeResearchFocus(section, fetchSource = fetch) {
  initializeScholarMetrics(section, fetchSource);
  try {
    const response = await fetchSource(section.dataset.source, { cache: "no-store" });
    if (!response.ok) throw new Error(`Publication data request failed (HTTP ${response.status}).`);
    const publications = await response.json();
    renderHighlights(section, analyzeHighlights(publications));
    const report = analyzePublications(publications, JSON.parse(section.dataset.topics));
    showReport(section, report);
  } catch (error) {
    console.error("Research-focus chart failed:", error);
    const status = section.querySelector("[data-research-status]");
    status.textContent = `Unable to generate the research-focus chart: ${error instanceof Error ? error.message : String(error)}`;
    status.setAttribute("role", "alert");
  }
}

function keepSidebarBottomVisible(sidebar) {
  if (!sidebar || typeof ResizeObserver === "undefined") return;
  const update = () => {
    const navbar = document.querySelector("nav.navbar");
    const top = (navbar ? navbar.getBoundingClientRect().height : 56) + 16;
    // Taller sidebars stick at their bottom edge so every chart stays reachable.
    sidebar.style.setProperty("--publications-sidebar-top", `${Math.min(top, window.innerHeight - sidebar.offsetHeight - 16)}px`);
  };
  new ResizeObserver(update).observe(sidebar);
  window.addEventListener("resize", update);
  update();
}

if (typeof document !== "undefined") {
  const section = document.querySelector("[data-research-focus]");
  if (section) initializeResearchFocus(section);
  keepSidebarBottomVisible(document.querySelector(".publications-sidebar"));
}
