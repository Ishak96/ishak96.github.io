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
and draws two interactive SVG charts: research topics and journals/conferences.
The page has no tables or permanent right-side legend. Hovering, focusing, or
tapping a slice shows its full name, publication count, and percentage in a
small frame. Escape or moving away dismisses it; venue abbreviations are shown
on the venue slices. Charts stack vertically on small screens. On screens at least 1200px wide, the
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
generation, venue grouping, and adding/editing a publication. Counts in production
are never hardcoded. Missing venues remain counted as "Venue not specified".

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
