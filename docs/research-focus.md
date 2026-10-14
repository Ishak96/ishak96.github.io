# Live research-focus chart

The Publications page generates its pie chart **in the visitor's browser on every
page load**, using vanilla JavaScript and native SVG. No Python, p5.js, chart
library, external API, or pre-generated chart image is needed.

## Single source of truth

[\_bibliography/papers.bib](../_bibliography/papers.bib) remains the only publication
list. [The Jekyll metadata exporter](../_plugins/publication-data.rb) uses the
site's existing BibTeX parser and `scholar.source`/`scholar.bibliography`
configuration to publish `assets/data/research-publications.json`. It exports
metadata only; it does not classify publications or render a chart.

On visiting Publications, [the JavaScript module](../assets/js/research-focus.mjs)
fetches this local JSON, classifies every record, computes counts/percentages,
and draws two interactive SVG charts: research topics and journals/conferences
grouped by field.
Each chart has a colour legend beside it (below it in narrow containers); slices
only show a percentage when it fits. Hovering, focusing, or tapping a slice or
legend item shows its name, count, percentage, and the highest-ranked venue in a
small frame. Escape or moving away dismisses it. Charts stack vertically on small screens. On screens at least 1200px wide, the
Scholar metrics and both charts sit in a sticky right sidebar that stays in view
while the publication list scrolls. If the sidebar is taller than the window, it
scrolls with the page until its bottom is visible and then stays fixed.
The existing publication layout and search are unchanged. The chart counts the
entire selected bibliography, not the potentially larger Google Scholar record
or just the currently searched/filtered publications.

## Classification

[Topic rules](../_data/research_topics.json) define labels, colors, and patterns.
Titles take priority over abstracts; the abstract is used when the title has no
match. Motion-aware CT requires CT/CBCT context. Modality and principal scientific
problem determine the category, not the reconstruction algorithm.

Unknown or ambiguous topics count under **Other Research Topics**, with visible
notes and console warnings. Resolve ambiguity by adding an override to the
original BibTeX record, for example:

```bibtex
research_topic = {motion-ct},
```

Valid identifiers currently are `incomplete-ct`, `compton`, `eit`, `motion-ct`,
and `other`; exact category labels are also accepted. Unknown overrides,
duplicates, missing titles, or invalid totals produce an explicit chart error.
Missing abstracts or years are counted with notes. Adding a justified category
only requires editing the topic rules.

## Venue fields and top venues

Each publication's venue is its `booktitle`, or `journal` for articles (then
`series`, `school`, `howpublished`). The exporter also records `venue_kind`
(`journal` or `proceedings`). [The venue catalog](../_data/venue_categories.json)
is published as `assets/data/venue-categories.json` and consumed by
[venue-ranking.mjs](../assets/js/venue-ranking.mjs), which holds all
classification and ranking logic (the chart module only draws).

### Catalog schema

- `categories`: `id`, `label`, `color`, `description`, `keywords`. Current fields:
  Medical Imaging & Image Computing, Computer Vision, Signal & Image Processing,
  Computational Imaging & Inverse Problems, Machine Learning & AI, Optimization &
  Applied Mathematics, Robotics, Natural Language Processing, Remote Sensing &
  Earth Observation, Computer Graphics & Multimedia, Data Mining & Information
  Retrieval, Preprints, Other Venues.
- `venues`: one record per venue with `id`, `abbreviation`, `name`, `type`
  (`conference`, `journal`, `preprint`), `primary_category`,
  `secondary_categories`, `acronyms` (case-sensitive whole words), optional
  `name_aliases` / `exclude_patterns`, `ranking` (`{system, value, listed_as}` or
  `null` with a `ranking_note`), and optional `internal_assessment`
  (`{score, rationale}`, only when no formal ranking exists).
- `ranking_systems` and `prestige_scale` document how ranks map to a 1-4 score.

### Matching

Venue text is normalised (case, punctuation, `&`, years/ordinals, and words such as
"IEEE", "Proceedings", "International" are ignored). Journals only match journal
records by exact name or acronym; proceedings only match conference records.
Workshop proceedings never match the main conference. The longest name match wins.
Unmatched venues fall back to category keywords, then to **Other Venues**, with a
console warning. Only fields with at least one publication are plotted.

### Ranking methodology

- Conferences: [CORE 2023](https://portal.core.edu.au/conf-ranks/) — A\*=4, A=3, B=2, C=1.
- Journals: best [SCImago SJR 2025](https://www.scimagojr.com/journalrank.php) quartile — Q1=3, Q2=2, Q3/Q4=1.
- The 1-4 mapping is a site convention; CORE and SJR are not equivalent systems.
- Venues absent from both systems have `ranking: null`. A few established venues
  carry a documented `internal_assessment` instead, labelled "Internal assessment"
  in the tooltip.

For each slice, the top venue is the highest-scoring venue among that slice's
publications. Ties go to a formal ranking over an internal assessment, then to the
catalog order — never to date, citations, or alphabetical order. A slice with no
ranked venue shows "Accepted at: no ranked venue yet". Hovering, focusing, or tapping a slice
or legend item shows only that venue with an animated star (static with
`prefers-reduced-motion`) and screen-reader text.

### Adding venues or forcing a field

New papers update counts and top venues automatically. To recognise a new venue,
add a record to `venues` with its verified ranking (or `ranking: null` and a
note). To force a field for one paper:

```bibtex
venue_category = {computer-vision},
```

Unknown `venue_category` values produce an explicit chart error.

## Google Scholar metrics

Citations, h-index, and i10-index are read from
[assets/data/scholar-metrics.json](../assets/data/scholar-metrics.json), which the
browser loads every time the Publications page opens. A daily GitHub Actions job,
[scholar-metrics.yml](../.github/workflows/scholar-metrics.yml), keeps this file up to date:

1. Every day at 05:17 UTC (or on demand via Actions → Update Google Scholar
   metrics → Run workflow), it runs [bin/scholar-metrics.mjs](../bin/scholar-metrics.mjs).
   The script reads the public profile for `scholar_userid` in `_config.yml`.
2. If any number changed, it commits the JSON file and starts the `Deploy site` workflow.
3. If Scholar blocks the request (it often blocks cloud servers), the last saved
   numbers are kept and the run shows a warning. The page shows the date of the last
   successful update next to the source link.

No secrets or external services are needed. Browsers cannot read Scholar directly
(CORS), and Scholar blocks requests from cloud proxies such as Cloudflare Workers,
so the numbers are not fetched live on each visit.

To refresh the numbers by hand from your own computer, run
`node bin/scholar-metrics.mjs` and commit `assets/data/scholar-metrics.json`.

## Automatic updates and tests

Push a publication/rule/module change to `main` or `master` → existing deployment
workflow → JavaScript tests → normal Jekyll build → JSON metadata export →
deployment. The visitor's browser generates the new chart on the next page load.
Metadata and module URLs have content hashes, and the metadata request bypasses
the browser cache. No generated chart or duplicated publication list is committed.
Restart an already-running Jekyll server after adding the metadata-export plugin;
subsequent bibliography edits regenerate its JSON during normal watch builds.

Run the dependency-free tests with Node.js 18 or later:

```sh
node --test tests/research-focus.test.mjs
bundle exec jekyll build
```

The tests cover classification, duplicate/missing metadata, rounding, SVG
generation, venue matching and ranking, ties, unknown venues, and adding/editing a publication. Counts in production
are never hardcoded. Missing or unrecognised venues are counted under "Other Venues".

## Current interpretation

The eight-record source has four incomplete-data CT publications (50%), two
Compton tomography publications (25%), one EIT publication (12.5%), and one
motion-aware CT publication (12.5%). UnWave-Net is classified as Compton
tomography, QN-Mixer as incomplete-data CT, and BREIT as EIT despite its CT/MRI
data preparation. No duplicates were detected. Author metadata spells one
surname as both Cebeiro and Cebiero; the chart does not modify it.

The 2021–2024 CT papers demonstrate core tomographic reconstruction expertise.
Compton work in 2023–2024 and EIT/motion-aware CT entries in 2026 show breadth
and recent applications, useful context for prospective collaborators.
Counts alone do not establish quality, effort, impact, or sustained trends.

## Publication highlights

The sidebar also shows two counts, computed in the browser from `assets/data/research-publications.json` (generated from `_bibliography/papers.bib`):

- **Oral papers** (microphone icon): entries with `oral = {true}`.
- **Awards** (golden trophy icon): entries whose `note` field contains the word "award" but not "shortlisted".
- **Shortlisted** (small silver badge under the awards number): entries whose `note` contains "shortlisted" (or "short-listed"). Hidden when there are none.

Hover a card to see the matching paper titles or award notes.
