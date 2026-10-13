import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  analyzeHighlights,
  analyzePublications,
  analyzeVenues,
  classifyPublication,
  createChartSvg,
  createPieSvg,
  initializeResearchFocus,
  initializeScholarMetrics,
  plainText,
  toCsv,
  validateReport,
  validateScholarMetrics,
} from "../assets/js/research-focus.mjs";
import scholarWorker, { parseScholarMetrics } from "../cloudflare/scholar-metrics/worker.mjs";

const topics = JSON.parse(readFileSync(new URL("../_data/research_topics.json", import.meta.url), "utf8"));
const record = (key, title, abstract = "Computed tomography.", extra = {}) => ({ key, title, abstract, year: "2026", ...extra });
const records = [
  record("ct", "Sparse-view CT reconstruction"),
  record("compton", "Unrolled wavelet reconstruction for Compton tomography"),
  record("eit", "Brain stroke reconstruction using multi-frequency 3D EIT"),
  record("motion", "Rigid motion compensated medical image reconstruction"),
];

test("primary topics use contributions rather than background modalities", () => {
  assert.deepEqual(
    analyzePublications(records, topics).publications.map((paper) => paper.categoryId),
    ["incomplete-ct", "compton", "eit", "motion-ct"]
  );
  assert.equal(classifyPublication(record("limited", "Limited-angle tomographic artifact suppression"), topics).categoryId, "incomplete-ct");
  assert.equal(classifyPublication(record("cst", "Compton tomography", "Sparse-view CT is common."), topics).categoryId, "compton");
  assert.equal(classifyPublication(record("unknown", "Motion-aware ultrasound", "Ultrasound imaging."), topics).categoryId, "other");
});

test("abstract fallback, explicit overrides, and invalid overrides", () => {
  assert.equal(classifyPublication(record("a", "A reconstruction framework", "Electrical impedance tomography."), topics).categoryId, "eit");
  assert.equal(classifyPublication(record("a", "A framework", "", { research_topic: "motion-ct" }), topics).categoryId, "motion-ct");
  assert.throws(() => analyzePublications([record("a", "A framework", "", { research_topic: "typo" })], topics), /unknown research_topic/);
});

test("unknown, ambiguous, and missing metadata records are never excluded", () => {
  for (const title of ["Ultrasound imaging", "Sparse-view CT and Compton tomography"]) {
    const report = analyzePublications([{ key: "a", title }], topics);
    assert.equal(report.total, 1);
    assert.equal(report.categories[0].id, "other");
    assert.ok(report.warnings.length);
  }
  const report = analyzePublications([{ key: "a", title: "Sparse-view CT" }], topics);
  assert.equal(report.categories[0].id, "incomplete-ct");
  assert.equal(report.warnings.length, 2);
});

test("duplicate keys, normalized title/year pairs, and DOIs are errors", () => {
  assert.throws(() => analyzePublications([records[0], records[0]], topics), /Duplicate BibTeX key/);
  assert.throws(
    () => analyzePublications([records[0], { ...records[0], key: "another", title: "{Sparse}-view CT reconstruction" }], topics),
    /duplicate publication/
  );
  assert.throws(
    () =>
      analyzePublications(
        [
          { ...records[0], doi: "10.1/test" },
          { ...records[1], doi: "https://doi.org/10.1/test" },
        ],
        topics
      ),
    /duplicate publication/
  );
});

test("empty and malformed metadata and rules fail explicitly", () => {
  assert.throws(() => analyzePublications([], topics), /empty/);
  assert.throws(() => analyzePublications([{ key: "a" }], topics), /missing/);
  assert.throws(() => analyzePublications([record("a", "CT", "", { year: 2026 })], topics), /field/);
  assert.throws(() => analyzePublications(records, []), /rules/);
  assert.throws(
    () =>
      analyzePublications(
        records,
        topics.filter((topic) => topic.id !== "other")
      ),
    /fallback/
  );
});

test("percentages are independently calculated and tolerate rounding only", () => {
  const report = analyzePublications(records.slice(0, 3), topics);
  assert.equal(report.total, 3);
  assert.deepEqual(
    report.categories.map((category) => category.percentage),
    [33.33, 33.33, 33.33]
  );
  assert.equal(
    report.categories.reduce((sum, category) => sum + category.count, 0),
    3
  );
  report.categories[0].count += 1;
  assert.throws(() => validateReport(report), /counts/);
});

test("SVG has one slice per category with exact counts and readable labels", () => {
  const report = analyzePublications(records, topics);
  const svg = createPieSvg(report);
  assert.equal((svg.match(/data-category=/g) ?? []).length, report.categories.length);
  for (const category of report.categories) {
    assert.ok(svg.includes(`data-category="${category.id}" data-count="${category.count}"`));
    assert.ok(svg.includes(`${category.percentage}%`));
  }
  const downloadable = createChartSvg(report);
  assert.ok(downloadable.includes("Research Focus Across Publications"));
  assert.ok(downloadable.includes("Distribution of publications by primary research topic"));
  assert.ok(downloadable.includes('width="860"'));
  assert.ok(!downloadable.includes("NaN"));
  const single = createPieSvg(analyzePublications([records[0]], topics));
  assert.ok(single.includes('<circle cx="180" cy="180" r="145"'));
  assert.ok(single.includes("100%"));
});

test("adding and editing a publication updates counts, labels, and geometry", () => {
  const original = analyzePublications(records, topics);
  const updated = analyzePublications([...records, record("new", "Limited-angle CT reconstruction")], topics);
  assert.equal(updated.total, original.total + 1);
  assert.equal(updated.categories[0].count, 2);
  assert.equal(updated.categories[0].percentage, 40);
  assert.notEqual(createPieSvg(updated), createPieSvg(original));
  const edited = analyzePublications([...records, record("new", "New Compton tomography reconstruction", "CST.", { year: "2027" })], topics);
  assert.equal(edited.categories.find((category) => category.id === "compton").count, 2);
  assert.equal(edited.publications.at(-1).year, "2027");
  assert.notEqual(createPieSvg(updated), createPieSvg(edited));
});

test("title formatting and exported data preserve actual titles safely", () => {
  assert.equal(plainText("{{QN-Mixer}: A {Q}uasi-{N}ewton Model}"), "QN-Mixer: A Quasi-Newton Model");
  assert.equal(toCsv(["Title", "Count"], [['A "quoted", title', 1]]), '"Title","Count"\r\n"A ""quoted"", title","1"\r\n');
  const customized = topics.map((topic) => ({ ...topic, label: `${topic.label} & <test>` }));
  const svg = createChartSvg(analyzePublications(records, customized));
  assert.ok(svg.includes("&amp; &lt;test&gt;"));
  assert.ok(!svg.includes("& <test>"));
});

test("venue chart groups publications and shows venue names on slices", () => {
  const report = analyzePublications(
    [
      record("a", "Sparse-view CT reconstruction", "CT.", { venue: "Proceedings of MICCAI (MICCAI)" }),
      record("b", "Compton tomography reconstruction", "CST.", { venue: "Proceedings of MICCAI (MICCAI)" }),
      record("c", "EIT reconstruction", "EIT.", { venue: "IEEE SITIS" }),
      record("d", "Motion compensated CT", "CT."),
    ],
    topics
  );
  const venues = analyzeVenues(report);
  assert.equal(venues.total, 4);
  assert.deepEqual(
    venues.categories.map((category) => category.count),
    [2, 1, 1]
  );
  assert.deepEqual(
    venues.categories.map((category) => category.percentage),
    [50, 25, 25]
  );
  assert.equal(venues.categories[0].shortLabel, "MICCAI");
  assert.equal(venues.categories[1].shortLabel, "SITIS");
  assert.equal(venues.categories[2].label, "Venue not specified");
  const svg = createPieSvg(venues, { id: "venues", title: "Journals and conferences", interactive: true });
  assert.ok(svg.includes("venues-pie-title"));
  assert.ok(svg.includes('tabindex="0" role="button"'));
  assert.ok(svg.includes(">MICCAI</text>"));
  assert.ok(svg.includes("50%"));
});

test("failed data requests expose an error rather than an empty success chart", async () => {
  const status = {
    textContent: "",
    setAttribute(name, value) {
      this[name] = value;
    },
  };
  const section = {
    dataset: { source: "/missing.json" },
    querySelector() {
      return status;
    },
  };
  const originalError = console.error;
  const errors = [];
  console.error = (...args) => errors.push(args);
  try {
    await initializeResearchFocus(section, async () => ({ ok: false, status: 404 }));
    assert.match(status.textContent, /HTTP 404/);
    assert.equal(status.role, "alert");
    assert.equal(errors.length, 1);
  } finally {
    console.error = originalError;
  }
});

test("Scholar metrics validate profile values and reject unavailable data", () => {
  const metrics = {
    available: true,
    fetched_at: "2026-01-02T03:04:05Z",
    profile_url: "https://scholar.google.com/citations?user=x",
    citations: { all: 37, recent: 37 },
    h_index: { all: 3, recent: 3 },
    i10_index: { all: 1, recent: 1 },
  };
  assert.equal(validateScholarMetrics(metrics), metrics);
  assert.equal(validateScholarMetrics({ available: false }), null);
  assert.throws(() => validateScholarMetrics({ ...metrics, h_index: { all: -1 } }), /h_index/);
  assert.throws(() => validateScholarMetrics({ ...metrics, fetched_at: "never" }), /update time/);
});

test("failed Scholar metric requests keep the metrics block hidden", async () => {
  const container = { hidden: true };
  const section = {
    dataset: { scholarSource: "/assets/data/scholar-metrics.json" },
    querySelector: () => container,
  };
  const originalError = console.error;
  const errors = [];
  console.error = (...args) => errors.push(args);
  try {
    await initializeScholarMetrics(section, async () => ({ ok: false, status: 503 }));
    assert.equal(container.hidden, true);
    assert.match(String(errors[0][1].message), /HTTP 503/);
  } finally {
    console.error = originalError;
  }
});

test("Scholar Worker parses profile metrics and reports captchas", () => {
  const cell = (value) => `<td class="gsc_rsb_std">${value}</td>`;
  const html = `<table id="gsc_rsb_st"><tr>${cell("1,234")}${cell(37)}</tr><tr>${cell(3)}${cell(3)}</tr><tr>${cell(1)}${cell(1)}</tr></table>`;
  assert.deepEqual(parseScholarMetrics(html), {
    citations: { all: 1234, recent: 37 },
    h_index: { all: 3, recent: 3 },
    i10_index: { all: 1, recent: 1 },
  });
  assert.throws(() => parseScholarMetrics("Please show you're not a robot: unusual traffic"), /captcha/);
  assert.throws(() => parseScholarMetrics("<html></html>"), /layout/);
});

test("Scholar Worker serves only the configured profile with CORS headers", async () => {
  const env = { SCHOLAR_USER_ID: "", ALLOWED_ORIGINS: "https://ishak96.github.io" };
  const request = new Request("https://worker.example/?user=someone-else", { headers: { Origin: "https://ishak96.github.io" } });
  const response = await scholarWorker.fetch(request, env, {});
  assert.equal(response.status, 500);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://ishak96.github.io");
  const preflight = await scholarWorker.fetch(new Request("https://worker.example/", { method: "OPTIONS" }), env, {});
  assert.equal(preflight.status, 204);
  assert.equal((await scholarWorker.fetch(new Request("https://worker.example/", { method: "POST" }), env, {})).status, 405);
});

test("highlights count oral papers and award notes", () => {
  const papers = [
    record("a", "Paper A", "CT.", { oral: "true", note: "MICCAI Young Scientist {Award}" }),
    record("b", "Paper B", "CT.", { oral: "True" }),
    record("c", "Paper C", "CT.", { oral: "false", note: "Best paper awarded" }),
    record("d", "Paper D", "CT.", { note: "Accepted as poster" }),
    record("f", "Paper F", "CT.", { note: "Best Student Paper Award – Shortlisted" }),
    record("g", "Paper G", "CT.", { note: "Short-listed for best paper" }),
  ];
  const result = analyzeHighlights(papers);
  assert.equal(result.orals, 2);
  assert.equal(result.awards, 2);
  assert.deepEqual(result.oralTitles, ["Paper A", "Paper B"]);
  assert.deepEqual(result.awardNotes, ["MICCAI Young Scientist Award", "Best paper awarded"]);
  assert.equal(result.shortlisted, 2);
  assert.deepEqual(result.shortlistedNotes, ["Best Student Paper Award – Shortlisted", "Short-listed for best paper"]);
  assert.deepEqual(analyzeHighlights([record("e", "Paper E")]), {
    orals: 0,
    awards: 0,
    shortlisted: 0,
    oralTitles: [],
    awardNotes: [],
    shortlistedNotes: [],
  });
});
