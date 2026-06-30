---
layout: page
title: BREIT
description: Brain Stroke Reconstruction using Multi-Frequency 3D EIT
img: assets/img/breit/fig_framework.png
_styles: >
  :root {
    --blue-bg: color-mix(in srgb, #7d8899 16%, #171c23);   --blue-border: #7d8899;  --blue-ink: #8e99aa;
    --peach-bg: color-mix(in srgb, #a0806a 16%, #171c23);  --peach-border: #a0806a; --peach-ink: #b08b6f;
    --green-bg: color-mix(in srgb, #5e6d67 16%, #171c23);  --green-border: #5e6d67; --green-ink: #6f7e77;
    --gray-bg: #171c23;   --gray-border: #2b323b;  --gray-ink: #ece9e2;
    --ink: #ece9e2;
    --muted: #b8b1a3;
    --line: #2b323b;
    --card: #171c23;
    --navy: #5e6d67;
    --radius: 14px;
    --radius-sm: 9px;
    --shadow-sm: none;
    --shadow: none;
    --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  html { scroll-behavior: smooth; }
  .post-header { display: none; }
  .breit-nav {
    position: sticky;
    top: 10px;
    z-index: 1020;
    margin: 6px 0 18px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--card);
    backdrop-filter: none;
    box-shadow: var(--shadow-sm);
  }
  body.fixed-top-nav .breit-nav {
    top: 66px;
  }
  .paper-btn {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    overflow: visible;
  }
  .coming-soon {
    position: absolute;
    margin-top: 55px;
    padding: 2px 8px;
    font-size: 0.7rem;
    font-weight: 600;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    background: #ff9800;
    border-radius: 999px;
    z-index: 10;
    white-space: nowrap;
  }
  .breit-nav-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
  }
  .breit-brand {
    font-family: var(--mono);
    font-size: .88rem;
    font-weight: 800;
    letter-spacing: .06em;
    color: var(--ink);
    white-space: nowrap;
  }
  .breit-brand span { color: var(--blue-ink); }
  .breit-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 6px 14px;
  }
  .breit-links a {
    color: var(--muted);
    text-decoration: none;
    font-size: .82rem;
    font-weight: 700;
    padding: 2px 0;
    border-bottom: 2px solid transparent;
    transition: color .12s ease, border-color .12s ease;
  }
  .breit-links a:hover {
    color: var(--ink);
    border-bottom-color: var(--blue-border);
    text-decoration: none;
  }
  .breit-links a.accent {
    color: var(--peach-ink);
  }
  .hero-section { text-align: center; padding: 20px 0 30px; }
  .venue-badge {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: .8rem; font-weight: 700; color: var(--peach-ink);
    background: var(--peach-bg); border: 1px solid var(--peach-border);
    padding: 6px 14px; border-radius: 999px; margin-bottom: 18px;
  }
  .hero-section h1 {
    font-size: clamp(1.6rem, 3.5vw, 2.4rem); line-height: 1.15;
    letter-spacing: -.02em; font-weight: 800; margin: 0 auto 14px;
  }
  .hero-section h1 .lit { color: var(--blue-ink); }
  .authors { font-size: 1rem; margin: 0 auto 6px; }
  .authors a { color: var(--ink); font-weight: 600; text-decoration: none; }
  .authors sup { color: var(--blue-ink); font-weight: 700; }
  .author-disabled { pointer-events: none; cursor: default; }
  .affil { color: var(--muted); font-size: .88rem; margin: 4px auto; }
  .affil-note { margin-top: 2px; font-size: .8rem; }
  .btn-row { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin: 24px 0 50px; }
  .btn {
    display: inline-flex; align-items: center;
    font-weight: 700; font-size: .9rem;
    padding: 10px 18px; border-radius: 999px;
    border: 1px solid var(--line); background: var(--card); color: var(--ink);
    box-shadow: var(--shadow-sm); transition: transform .08s ease, border-color .12s ease;
    text-decoration: none;
  }
  .btn:hover { transform: translateY(-1px); border-color: var(--blue-border); text-decoration: none; }
  .btn.primary { background: var(--navy); border-color: var(--navy); color: #ece9e2; }
  .section-block { padding: 36px 0; border-top: 1px solid var(--line); scroll-margin-top: 92px; }
  .section-block:first-of-type { border-top: none; }
  .eyebrow {
    font-family: var(--mono);
    font-size: .88rem; font-weight: 700;
    letter-spacing: .14em; text-transform: uppercase;
    color: var(--blue-ink); margin: 0 0 10px;
  }
  .eyebrow.peach { color: var(--peach-ink); }
  .section-title { font-size: 1.5rem; font-weight: 800; letter-spacing: -.02em; margin: 0 0 8px; }
  .section-lead { color: var(--muted); max-width: 760px; margin: 0 0 20px; }
  .fig-card {
    margin: 20px 0; background: var(--card); border: 1px solid var(--line);
    border-radius: var(--radius); padding: 14px; box-shadow: var(--shadow-sm);
  }
  .fig-card img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: contain;
    background: #ffffff;
    padding: 6px;
    border: 1px solid color-mix(in srgb, var(--line) 75%, #0e1116);
    border-radius: var(--radius-sm);
    box-sizing: border-box;
  }
  .fig-card .caption { color: var(--muted); font-size: .85rem; margin-top: 10px; }
  .fig-card .caption b { color: var(--ink); }
  .results-carousel {
    position: relative;
    margin-top: 2px;
  }
  .results-carousel-viewport {
    overflow: hidden;
    border-radius: var(--radius-sm);
    touch-action: pan-y;
    cursor: grab;
  }
  .results-carousel.is-dragging .results-carousel-viewport {
    cursor: grabbing;
  }
  .results-carousel-track {
    display: flex;
    transition: transform .45s cubic-bezier(.22,.61,.36,1);
    will-change: transform;
  }
  .results-carousel-slide {
    flex: 0 0 100%;
    min-width: 100%;
    padding: 2px 0 4px;
  }
  .results-slide-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 2px 10px;
  }
  .results-slide-kicker {
    font-family: var(--mono);
    font-size: .72rem;
    letter-spacing: .09em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 700;
  }
  .results-slide-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }
  .results-gif-tile {
    margin: 0;
  }
  .results-gif {
    width: 100%;
    aspect-ratio: 1 / 1;
    display: block;
    object-fit: contain;
    background: #0e1116;
    padding: 6px;
    border: 1px solid color-mix(in srgb, var(--line) 75%, #0e1116);
    border-radius: var(--radius-sm);
    box-sizing: border-box;
    user-select: none;
    -webkit-user-drag: none;
    pointer-events: none;
  }
  .results-col-label {
    text-align: center;
    font-size: .8rem;
    font-weight: 700;
    color: var(--muted);
    line-height: 1.3;
    margin-top: 7px;
  }
  .results-carousel-arrow {
    position: absolute;
    top: calc(50% - 16px);
    transform: translateY(-50%);
    z-index: 3;
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 1px solid var(--line);
    background: color-mix(in srgb, var(--card) 86%, transparent);
    color: var(--ink);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: border-color .16s ease, background-color .16s ease, color .16s ease;
  }
  .results-carousel-arrow:hover:not(:disabled) {
    border-color: var(--blue-border);
    background: color-mix(in srgb, var(--card) 100%, transparent);
    color: var(--blue-ink);
  }
  .results-carousel-arrow:disabled {
    opacity: .45;
    cursor: not-allowed;
  }
  .results-carousel-arrow.prev { left: 8px; }
  .results-carousel-arrow.next { right: 8px; }
  .results-carousel-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin: 14px 0 2px;
  }
  .results-carousel-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    border: 1px solid var(--line);
    background: color-mix(in srgb, var(--muted) 25%, transparent);
    transition: width .2s ease, background-color .2s ease, border-color .2s ease;
  }
  .results-carousel-dot.is-active {
    width: 22px;
    background: var(--blue-ink);
    border-color: var(--blue-border);
  }
  .abstract-block { max-width: 820px; margin: 0 auto; }
  .abstract-block p { font-size: 1.02rem; line-height: 1.8; color: var(--muted); text-align: justify; }
  .abstract-block p b { color: var(--ink); }
  .breit-grid { display: grid; gap: 18px; }
  .breit-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
  .breit-card {
    background: var(--card); border: 1px solid var(--line);
    border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow-sm);
    position: relative;
  }
  .breit-card h3 { margin: 0 0 6px; font-size: 1rem; font-weight: 700; }
  .breit-card p { margin: 0; color: var(--muted); font-size: .9rem; }
  .breit-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 50%;
    font-family: var(--mono); font-weight: 700; font-size: .9rem;
    background: var(--blue-bg); color: var(--blue-ink); border: 1px solid var(--blue-border);
    margin-bottom: 12px;
  }
  .breit-badge.blue { background: color-mix(in srgb, var(--blue-bg) 62%, #171c23); color: var(--ink); border-color: var(--blue-border); }
  .breit-badge.peach { background: color-mix(in srgb, var(--peach-bg) 62%, #171c23); color: var(--ink); border-color: var(--peach-border); }
  .breit-badge.green { background: color-mix(in srgb, var(--green-bg) 62%, #171c23); color: var(--ink); border-color: var(--green-border); }
  .breit-pipeline {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 18px;
  }
  .breit-panel {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    padding: 16px;
  }
  .breit-panel h4 {
    margin: 0 0 8px;
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: -.01em;
  }
  .breit-panel p {
    margin: 0;
    color: var(--muted);
    font-size: .9rem;
    line-height: 1.55;
  }
  .breit-panel.blue {
    background: var(--blue-bg);
    border-color: var(--blue-border);
  }
  .breit-panel.peach {
    background: var(--peach-bg);
    border-color: var(--peach-border);
  }
  .breit-panel.green {
    background: var(--green-bg);
    border-color: var(--green-border);
  }
  .breit-panel.gray {
    background: var(--gray-bg);
    border-color: var(--gray-border);
  }
  .breit-plabel {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
    padding: 4px 10px;
    border-radius: 999px;
    font-family: var(--mono);
    font-size: .68rem;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    border: 1px solid;
  }
  .breit-plabel.step1 {
    background: #24364d;
    color: #a8c8f7;
    border-color: #4d78a8;
  }
  .breit-plabel.step2 {
    background: #25382f;
    color: #b8e0c2;
    border-color: #5b8a6c;
  }
  .breit-plabel.step3 {
    background: #433328;
    color: #f0c9a6;
    border-color: #9d7253;
  }
  .breit-plabel.step4 {
    background: #322c47;
    color: #d2c6f6;
    border-color: #7e71b3;
  }
  .breit-badge.step1{
    background: #24364d;
    color: #a8c8f7;
    border-color: #4d78a8;
  }
  .breit-badge.step2{
    background: #25382f;
    color: #b8e0c2;
    border-color: #5b8a6c;
  }
  .breit-badge.step3{
    background: #433328;
    color: #f0c9a6;
    border-color: #9d7253;
  }
  .breit-panel.blue .breit-plabel { color: var(--blue-ink); border-color: var(--blue-border); }
  .breit-panel.peach .breit-plabel { color: var(--peach-ink); border-color: var(--peach-border); }
  .breit-panel.green .breit-plabel { color: var(--green-ink); border-color: var(--green-border); }
  .breit-panel.gray .breit-plabel { color: var(--gray-ink); border-color: var(--gray-border); }
  .breit-panel.blue h4,
  .breit-panel.green h4,
  .breit-panel.blue p,
  .breit-panel.green p,
  .breit-panel.blue .breit-io,
  .breit-panel.green .breit-io,
  .breit-panel.blue .breit-plabel,
  .breit-panel.green .breit-plabel {
    color: color-mix(in srgb, var(--ink) 98%, var(--card));
  }
  .breit-panel.blue .breit-plabel,
  .breit-panel.peach .breit-plabel,
  .breit-panel.green .breit-plabel,
  .breit-panel.gray .breit-plabel {
    background: var(--card);
  }
  .breit-panel:hover {
    transform: translateY(-1px);
    transition: all .2s ease;
    border-color: var(--blue-border);
    box-shadow: var(--shadow);
  }
  .breit-io {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed rgba(184,177,163,.35);
    font-size: .78rem;
    color: var(--muted);
  }
  .breit-io b { color: var(--ink); }
  .stat-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin: 20px 0; }
  .stat {
    text-align: center; background: var(--card); border: 1px solid var(--line);
    border-radius: var(--radius); padding: 18px 12px; box-shadow: var(--shadow-sm);
  }
  .paper-note {
    max-width: 760px;
    margin: 0 auto 36px;
    text-align: center;
    font-size: .86rem;
    color: var(--muted);
    line-height: 1.5;
  }
  .paper-note em {
    color: var(--ink);
    font-style: normal;
    font-weight: 600;
  }
  .stat .num { font-size: 1.6rem; font-weight: 800; letter-spacing: -.02em; color: var(--ink); }
  .stat .num.ssim-value { color: var(--blue-ink); }
  .stat .num.cc-value { color: var(--green-ink); }
  .stat .num.time-value { color: var(--peach-ink); }
  .stat .num.rbar-value { color: var(--green-ink); }
  .stat .num.nmse-value { color: var(--blue-ink); }
  .stat .lbl { font-weight: 700; font-size: .88rem; margin-top: 2px; }
  .stat .sub { color: var(--muted); font-size: .78rem; margin-top: 4px; }
  .stat-row.results-metrics { grid-template-columns: repeat(3, 1fr); }
  .citation-actions { justify-content: flex-start; margin: 0 0 12px; }
  pre.bibtex {
    background: #171c23; color: #ece9e2; border-radius: var(--radius);
    padding: 18px 20px; overflow-x: auto; font-family: var(--mono);
    font-size: .8rem; line-height: 1.6; border: 1px solid #2b323b;
    text-align: left !important;
  }
  @media (max-width: 900px) {
    .breit-nav-wrap {
      flex-direction: column;
      align-items: flex-start;
    }
    .breit-links {
      justify-content: flex-start;
      gap: 6px 10px;
    }
    .breit-grid.cols-3 { grid-template-columns: 1fr; }
    .results-slide-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .results-gif { padding: 4px; }
    .results-col-label { font-size: .72rem; }
    .results-carousel-arrow {
      width: 34px;
      height: 34px;
      top: calc(50% - 12px);
    }
    .stat-row { grid-template-columns: repeat(2, 1fr); }
    .stat-row.results-metrics { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 560px) {
    .results-slide-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
    }
    .results-carousel-arrow {
      width: 30px;
      height: 30px;
      top: calc(50% - 9px);
    }
    .results-carousel-arrow.prev { left: 4px; }
    .results-carousel-arrow.next { right: 4px; }
    .stat-row { grid-template-columns: 1fr; }
    .stat-row.results-metrics { grid-template-columns: 1fr; }
  }
---

<!-- Top Navigation -->
<nav class="breit-nav" id="top">
  <div class="breit-nav-wrap">
    <a class="breit-brand" href="#">BREIT <span>MICCAI 2026</span></a>
    <div class="breit-links">
      <a href="#abstract">Abstract</a>
      <a href="#highlights">Highlights</a>
      <a href="#pipeline">Pipeline</a>
      <a href="#validation">Validation</a>
      <a href="#reconstruction">Reconstruction</a>
      <a href="#results">Results</a>
      <a href="#citation" class="accent">Cite</a>
    </div>
  </div>
</nav>

<div class="hero-section">
  <div class="venue-badge" id="hero">● Accepted at MICCAI 2026</div>
  <h1><span class="lit">BREIT</span>: A Framework for Brain Stroke Reconstruction using Multi-Frequency 3D EIT</h1>
  <p class="authors">
    <a class="author-disabled">Djahid Abdelmoumene</a><sup>1,2,*</sup>,
    <a href="https://ishak96.github.io/">Ishak Ayad</a><sup>3</sup>,
    <a href="https://perso.etis-lab.fr/nguyen-verger/">Maï K. Nguyen</a><sup>1</sup>,
    <a href="https://daveau.u-cergy.fr/">Christian Daveau</a><sup>2</sup>
  </p>
  <p class="affil"><sup>1</sup> ETIS (UMR 8051), CY Cergy Paris University, ENSEA, CNRS · <sup>2</sup> AGM (UMR 8088), CY Cergy Paris University, CNRS<br><sup>3</sup> Paris-Saclay University, CentraleSupélec, Inria, CVN</p>
  <p class="affil affil-note"><sup>*</sup> Corresponding author</p>
  <div class="btn-row">
    <div class="paper-btn">
      <a href="#" class="btn primary disabled" onclick="return false;">
        <i class="fa-solid fa-book"></i>&nbsp; Paper (MICCAI 2026)
      </a>
      <span class="coming-soon">Coming Soon</span>
    </div>

    <a href="http://arxiv.org/abs/2606.28787" class="btn">
      <i class="fa-solid fa-file-pdf"></i>&nbsp; arXiv preprint
    </a>

    <a href="https://github.com/djahiddj13/BREIT" class="btn">
      <i class="fa-brands fa-github"></i>&nbsp; Code
    </a>

    <a href="https://zenodo.org/records/20937062" class="btn">
      <i class="fa-solid fa-table"></i>&nbsp; Dataset
    </a>
  </div>

  <p class="paper-note">
    <em>The MICCAI 2026 proceedings paper</em> represents the peer-reviewed version of record
    (<strong>link forthcoming</strong>). The earlier arXiv preprint differs from the final camera-ready version.
  </p>

<!-- Main framework figure -->
<div class="section-block">
  <div class="fig-card">
    <img src="{{ '/assets/img/breit/fig_framework.png' | relative_url | bust_file_cache }}" alt="BREIT Framework Overview">
    <p class="caption"><b>The BREIT framework.</b> A modular pipeline for 3D MF-EIT stroke reconstruction: neuroimaging-to-admittivity ground-truth generation, a Python 3D CEM forward solver, and a 3D D-bar implementation supporting non-uniform electrode layouts.</p>
  </div>
</div>

<!-- Abstract -->
<div class="section-block" id="abstract">
  <p class="eyebrow">Abstract</p>
  <div class="abstract-block">
    <p>Multi-Frequency Electrical Impedance Tomography (MF-EIT) is a non-invasive, low-cost modality that reconstructs electrical property distributions from boundary voltages. For stroke imaging, progress in 3D deep-learning reconstruction is limited by the lack of large-scale datasets with paired ground-truth volumes and by non-standardized pipelines for data generation, simulation, and evaluation. We introduce <b>BREIT</b>, a modular framework for 3D MF-EIT stroke reconstruction providing: (i) a neuroimaging-to-EIT pipeline that converts CT/MRI into frequency-dependent GT admittivity volumes; (ii) a self-contained Python 3D Complete Electrode Model (CEM) forward solver for simulating MF-EIT voltages; and (iii) a 3D D-bar implementation supporting non-uniform electrode layouts. Building on BREIT, we propose <b>dFNO-bar</b>, which integrates Fourier Neural Operators into D-bar by learning a mapping from scattering data t(ξ) to conductivity σ(x)=ℜ{γ}. We evaluate dFNO-bar against D-bar, Deep D-bar, and Gauss–Newton reconstructions on UCLH-matched synthetic data, and observe higher brain SSIM with comparable CC across noise settings.</p>
  </div>
</div>

<!-- Highlights / Contributions -->
<div class="section-block" id="highlights">
  <p class="eyebrow">Highlights</p>
  <h2 class="section-title">Key Contributions</h2>
  <p class="section-lead">BREIT unifies radiology-based admittivity generation, realistic MF-EIT simulation, and DL benchmarking under consistent configurations.</p>
  <div class="breit-grid cols-3">
    <div class="breit-card">
      <div class="breit-badge step1">1</div>
      <h3>Multimodal Data Generation</h3>
      <p>CT/MRI-based tissue and lesion mapping to 3D frequency-dependent admittivity volumes, paired with simulated MF-EIT voltages across 17 frequencies.</p>
    </div>
    <div class="breit-card">
      <div class="breit-badge step2">2</div>
      <h3>3D CEM + D-bar Tooling</h3>
      <p>A Python implementation of 3D D-bar components including t<sup>exp</sup> and t<sup>0</sup> approximations for non-uniform electrode layouts with Voronoi weighting.</p>
    </div>
    <div class="breit-card">
      <div class="breit-badge step3">3</div>
      <h3>dFNO-bar Reconstruction</h3>
      <p>A 3D MF-EIT reconstruction model that couples Fourier Neural Operator learning with D-bar structure for improved stroke imaging.</p>
    </div>
  </div>
</div>

<!-- BREIT Pipeline -->
<div class="section-block" id="pipeline">
  <p class="eyebrow">The Method</p>
  <h2 class="section-title">BREIT Pipeline</h2>
  <p class="section-lead">A four-stage workflow for generating clinically plausible MF-EIT data and simulations: patient-specific data curation, imaging-driven ground-truth approximation, physics-consistent augmentation, and multi-frequency forward-model voltage synthesis.</p>

  <div class="breit-pipeline">
    <div class="breit-panel">
      <div class="breit-plabel step1">Step 1 · Data Generation</div>
      <h4>Clinical Imaging to EIT-Ready Volumes</h4>
      <p>CT and MRI studies are collected, aligned, and converted into consistent 3D head representations with tissue-level labels and lesion localization used for subsequent electrical property modeling.</p>
      <div class="breit-io"><b>in</b> CT or MRI + metadata &nbsp;→&nbsp; <b>out</b> curated 3D anatomical volumes</div>
    </div>

    <div class="breit-panel">
      <div class="breit-plabel step2">Step 2 · Ground-Truth Approximation Pipeline</div>
      <h4>Neuroimaging to Frequency-Dependent Admittivity</h4>
      <p>Tissue compartments are mapped to conductivity and permittivity priors across frequency, producing voxel-wise admittivity targets that serve as reconstruction ground truth.</p>
      <div class="breit-io"><b>in</b> segmented anatomy + frequency priors &nbsp;→&nbsp; <b>out</b> 3D admittivity GT volumes</div>
    </div>

    <div class="breit-panel">
      <div class="breit-plabel step3">Step 3 · Data Augmentation</div>
      <h4>Diversity and Robustness Enrichment</h4>
      <p>Subject variability is expanded with controlled perturbations of lesion extent, position, and tissue-property ranges so training covers realistic anatomical and pathological uncertainty.</p>
      <div class="breit-io"><b>in</b> GT admittivity volumes &nbsp;→&nbsp; <b>out</b> augmented multi-case dataset</div>
    </div>

    <div class="breit-panel">
      <div class="breit-plabel step4">Step 4 · Forward Problem Simulation</div>
      <h4>3D CEM Multi-Frequency Voltage Synthesis</h4>
      <p>A Python 3D Complete Electrode Model solver simulates boundary voltages for non-uniform electrode layouts over all acquisition frequencies, yielding paired inputs for reconstruction learning and evaluation.</p>
      <div class="breit-io"><b>in</b> augmented admittivity + electrode geometry &nbsp;→&nbsp; <b>out</b> simulated MF-EIT measurements</div>
    </div>
  </div>
</div>

<!-- Pipeline Validation: Measured vs Simulated -->
<div class="section-block" id="validation">
  <p class="eyebrow peach">Validation</p>
  <h2 class="section-title">Forward Solver Agreement with Clinical MF-EIT</h2>
  <p class="section-lead">We validate simulation realism by comparing forward-simulated voltages to corresponding clinical MF-EIT measurements in UCLH for all subjects with matched imaging (12 patients, 14 sessions).</p>
  <div class="fig-card">
    <img src="{{ '/assets/img/breit/fig_measured_vs_simulated.png' | relative_url | bust_file_cache }}" alt="Measured vs Simulated Data Comparison">
    <p class="caption"><b>Forward-solver voltage agreement with clinical MF-EIT.</b> Overlays for pat-01 at 5 Hz and 2 kHz after per-frequency affine alignment, showing strong correlation (r = 0.928 at 5 Hz, r = 0.935 at 2 kHz).</p>
  </div>
  <div class="stat-row">
    <div class="stat">
      <div class="num rbar-value">0.817</div>
      <div class="lbl">Mean r̄ &uarr; across all patients</div>
      <div class="sub">After affine alignment</div>
    </div>
    <div class="stat">
      <div class="num nmse-value">0.290</div>
      <div class="lbl">NMSE &darr; across all patients</div>
      <div class="sub">Forward solver error</div>
    </div>
  </div>
</div>

<!-- dFNO-bar Architecture -->
<div class="section-block" id="reconstruction">
  <p class="eyebrow">Reconstruction</p>
  <h2 class="section-title">dFNO-bar Architecture</h2>
  <p class="section-lead">dFNO-bar integrates Fourier Neural Operators into a D-bar reconstruction pipeline, learning a mapping from multi-truncation scattering data to spatial-domain conductivity.</p>
  <div class="breit-pipeline" style="margin-top:18px;">
    <div class="breit-panel">
      <div class="breit-plabel step1">Methodological Novelty</div>
      <h4>Classical D-bar: Stability Through Truncation</h4>
      <p>
        Conventional D-bar reconstruction improves robustness by truncating
        high-frequency scattering components <i>t(ξ)</i>, which are generally
        more sensitive to measurement noise. While this regularization strategy
        stabilizes the inverse problem and reduces artifacts, it may also remove
        informative structural content that contributes to accurate conductivity
        recovery, particularly near fine anatomical boundaries.
      </p>
    </div>

    <div class="breit-panel">
      <div class="breit-plabel step2">dFNO-bar Insight</div>
      <h4>Learning Information Across Truncation Levels</h4>
      <p>
        Rather than enforcing a single truncation radius, dFNO-bar provides
        multiple complex scattering truncations <i>T<sub>ξ</sub></i> as parallel
        input channels. The FNO learns which higher-frequency components should
        be preserved, attenuated, or denoised, yielding a data-driven balance
        between stability and information retention. This design naturally
        complements the D-bar recovery stage that maps scattering-domain data
        into conductivity estimates.
      </p>
    </div>
  </div>
  <div class="fig-card">
    <img src="{{ '/assets/img/breit/fig_dfno_bar.png' | relative_url | bust_file_cache }}" alt="dFNO-bar Architecture">
    <p class="caption"><b>Proposed dFNO-bar architecture.</b> A FNO maps the input in Fourier space (split real/imag from 4 truncation radii) through stacked Fourier blocks, followed by a lightweight 3D U-Net decoder to produce the spatial-domain output conductivity σ(x).</p>
  </div>
</div>

<!-- Results -->
<div class="section-block" id="results">
  <p class="eyebrow peach">Results</p>
  <h2 class="section-title">Quantitative & Visual Comparison</h2>
  <p class="section-lead">dFNO-bar achieves consistently higher brain SSIM and comparable CC to Deep D-bar across noise settings, with fewer parameters and lower memory usage. Below, SSIM and CC are reported as averages over noiseless, 50 dB, and 40 dB settings.</p>
  <div class="fig-card">
    <div class="results-carousel" id="results-carousel" role="region" aria-roledescription="carousel" aria-label="Animated ischemia and hemorrhage reconstruction comparison">
      <button class="results-carousel-arrow prev" type="button" data-action="prev" aria-label="Show previous GIF set">
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
      </button>
      <div class="results-carousel-viewport">
        <div class="results-carousel-track">
          <section class="results-carousel-slide is-active" aria-label="Ischemia reconstruction case">
            <div class="results-slide-top">
              <div class="results-slide-kicker">Ischemia</div>
            </div>
            <div class="results-slide-grid">
              <figure class="results-gif-tile">
                <img src="{{ '/assets/img/breit/isc/dbar.gif' | relative_url | bust_file_cache }}" data-gif-src="{{ '/assets/img/breit/isc/dbar.gif' | relative_url | bust_file_cache }}" alt="Ischemia D-bar reconstruction" class="results-gif js-carousel-gif" loading="eager" decoding="async">
                <figcaption class="results-col-label">D-bar</figcaption>
              </figure>
              <figure class="results-gif-tile">
                <img src="{{ '/assets/img/breit/isc/deepdbar.gif' | relative_url | bust_file_cache }}" data-gif-src="{{ '/assets/img/breit/isc/deepdbar.gif' | relative_url | bust_file_cache }}" alt="Ischemia Deep D-bar reconstruction" class="results-gif js-carousel-gif" loading="eager" decoding="async">
                <figcaption class="results-col-label">Deep D-bar</figcaption>
              </figure>
              <figure class="results-gif-tile">
                <img src="{{ '/assets/img/breit/isc/dfnobar.gif' | relative_url | bust_file_cache }}" data-gif-src="{{ '/assets/img/breit/isc/dfnobar.gif' | relative_url | bust_file_cache }}" alt="Ischemia dFNO-bar reconstruction" class="results-gif js-carousel-gif" loading="eager" decoding="async">
                <figcaption class="results-col-label">dFNO-bar</figcaption>
              </figure>
              <figure class="results-gif-tile">
                <img src="{{ '/assets/img/breit/isc/gt.gif' | relative_url | bust_file_cache }}" data-gif-src="{{ '/assets/img/breit/isc/gt.gif' | relative_url | bust_file_cache }}" alt="Ischemia ground truth" class="results-gif js-carousel-gif" loading="eager" decoding="async">
                <figcaption class="results-col-label">Ground Truth</figcaption>
              </figure>
            </div>
          </section>

          <section class="results-carousel-slide" aria-label="Hemorrhage reconstruction case">
            <div class="results-slide-top">
              <div class="results-slide-kicker">Hemorrhage</div>
            </div>
            <div class="results-slide-grid">
              <figure class="results-gif-tile">
                <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" data-gif-src="{{ '/assets/img/breit/hem/dbar.gif' | relative_url | bust_file_cache }}" alt="Hemorrhage D-bar reconstruction" class="results-gif js-carousel-gif" loading="lazy" decoding="async">
                <figcaption class="results-col-label">D-bar</figcaption>
              </figure>
              <figure class="results-gif-tile">
                <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" data-gif-src="{{ '/assets/img/breit/hem/deepdbar.gif' | relative_url | bust_file_cache }}" alt="Hemorrhage Deep D-bar reconstruction" class="results-gif js-carousel-gif" loading="lazy" decoding="async">
                <figcaption class="results-col-label">Deep D-bar</figcaption>
              </figure>
              <figure class="results-gif-tile">
                <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" data-gif-src="{{ '/assets/img/breit/hem/dfnobar.gif' | relative_url | bust_file_cache }}" alt="Hemorrhage dFNO-bar reconstruction" class="results-gif js-carousel-gif" loading="lazy" decoding="async">
                <figcaption class="results-col-label">dFNO-bar</figcaption>
              </figure>
              <figure class="results-gif-tile">
                <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" data-gif-src="{{ '/assets/img/breit/hem/gt.gif' | relative_url | bust_file_cache }}" alt="Hemorrhage ground truth" class="results-gif js-carousel-gif" loading="lazy" decoding="async">
                <figcaption class="results-col-label">Ground Truth</figcaption>
              </figure>
            </div>
          </section>
        </div>
      </div>
      <button class="results-carousel-arrow next" type="button" data-action="next" aria-label="Show next GIF set">
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
    <div class="results-carousel-dots" role="tablist" aria-label="Select pathology case">
      <button class="results-carousel-dot is-active" type="button" role="tab" data-slide-to="0" aria-selected="true" aria-label="Show Ischemia GIF set"></button>
      <button class="results-carousel-dot" type="button" role="tab" data-slide-to="1" aria-selected="false" aria-label="Show Hemorrhage GIF set"></button>
    </div>
    <p class="caption"><b>Animated qualitative comparison.</b> Two pathology cases are shown with matched frame-wise reconstructions from D-bar, Deep D-bar, and dFNO-bar against ground truth.</p>
  </div>
  <div class="stat-row results-metrics">
    <div class="stat">
      <div class="num ssim-value">38.73</div>
      <div class="lbl">Avg SSIM &uarr;</div>
      <div class="sub">x100 over noiseless, 50 dB, 40 dB</div>
    </div>
    <div class="stat">
      <div class="num cc-value">45.87</div>
      <div class="lbl">Avg CC &uarr;</div>
      <div class="sub">x100 over noiseless, 50 dB, 40 dB</div>
    </div>
    <div class="stat">
      <div class="num time-value">0.32s</div>
      <div class="lbl">Inference Time &darr;</div>
      <div class="sub">Per sample (dFNO-bar)</div>
    </div>
  </div>
</div>

<!-- Citation -->
<div class="section-block" id="citation">
  <p class="eyebrow">Citation</p>
  <h2 class="section-title">BibTeX</h2>
  <p class="section-lead">If you find BREIT useful, please cite the paper.</p>
  <div class="btn-row citation-actions">
    <button id="copy-bibtex-btn" class="btn" type="button" onclick="copyBreitBibtex()">Copy BibTeX</button>
  </div>
  <pre class="bibtex" id="breit-bibtex">@inproceedings{abdelmoumene2026breit,
  title={BREIT: A Framework for Brain Stroke Reconstruction using Multi-Frequency 3D EIT},
  author={Abdelmoumene, Djahid and Ayad, Ishak and Nguyen, Ma{\"i} K. and Daveau, Christian},
  booktitle={International Conference on Medical Image Computing and Computer-Assisted Intervention (MICCAI)},
  year={2026}
}</pre>
</div>

<script>
  function copyBreitBibtex() {
    var bibtex = document.getElementById('breit-bibtex');
    var button = document.getElementById('copy-bibtex-btn');

    if (!bibtex || !button) {
      return;
    }

    var originalText = button.textContent;
    var content = bibtex.innerText;

    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      return;
    }

    navigator.clipboard.writeText(content).then(function () {
      button.textContent = 'Copied';
      setTimeout(function () {
        button.textContent = originalText;
      }, 1400);
    });
  }

  function initBreitResultsCarousel() {
    var carousel = document.getElementById('results-carousel');
    if (!carousel) {
      return;
    }

    var viewport = carousel.querySelector('.results-carousel-viewport');
    var track = carousel.querySelector('.results-carousel-track');
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.results-carousel-slide'));
    var prevButton = carousel.querySelector('[data-action="prev"]');
    var nextButton = carousel.querySelector('[data-action="next"]');
    var root = carousel.closest('.fig-card') || document;
    var dots = Array.prototype.slice.call(root.querySelectorAll('.results-carousel-dot'));

    if (!viewport || !track || slides.length === 0) {
      return;
    }

    var transparentGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    var activeIndex = 0;
    var isDragging = false;
    var dragStartX = 0;
    var dragDeltaX = 0;

    function setTrackPosition(extraPercent) {
      var offset = typeof extraPercent === 'number' ? extraPercent : 0;
      track.style.transform = 'translateX(calc(' + (-activeIndex * 100) + '% + ' + offset + '%))';
    }

    function syncSlideGifs() {
      slides.forEach(function (slide, slideIndex) {
        var gifs = Array.prototype.slice.call(slide.querySelectorAll('.js-carousel-gif'));
        gifs.forEach(function (img) {
          var gifSrc = img.getAttribute('data-gif-src');
          if (!gifSrc) {
            return;
          }
          img.setAttribute('src', slideIndex === activeIndex ? gifSrc : transparentGif);
        });
      });
    }

    function syncControls() {
      if (prevButton) {
        prevButton.disabled = activeIndex === 0;
      }
      if (nextButton) {
        nextButton.disabled = activeIndex === slides.length - 1;
      }

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        var isActive = dotIndex === activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      syncSlideGifs();
    }

    function goTo(nextIndex) {
      activeIndex = Math.max(0, Math.min(nextIndex, slides.length - 1));
      track.style.transition = '';
      setTrackPosition(0);
      syncControls();
    }

    function onPointerDown(event) {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      isDragging = true;
      dragStartX = event.clientX;
      dragDeltaX = 0;
      carousel.classList.add('is-dragging');
      track.style.transition = 'none';

      if (viewport.setPointerCapture) {
        viewport.setPointerCapture(event.pointerId);
      }
    }

    function onPointerMove(event) {
      if (!isDragging) {
        return;
      }

      dragDeltaX = event.clientX - dragStartX;
      var offsetPercent = (dragDeltaX / viewport.clientWidth) * 100;
      setTrackPosition(offsetPercent);
    }

    function onPointerUp() {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      carousel.classList.remove('is-dragging');
      track.style.transition = '';

      var threshold = viewport.clientWidth * 0.15;
      if (dragDeltaX > threshold) {
        goTo(activeIndex - 1);
      } else if (dragDeltaX < -threshold) {
        goTo(activeIndex + 1);
      } else {
        goTo(activeIndex);
      }

      dragDeltaX = 0;
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        goTo(activeIndex - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        goTo(activeIndex + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var targetIndex = parseInt(dot.getAttribute('data-slide-to'), 10);
        if (Number.isNaN(targetIndex)) {
          return;
        }
        goTo(targetIndex);
      });
    });

    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', onPointerUp);
    viewport.addEventListener('pointercancel', onPointerUp);
    viewport.addEventListener('lostpointercapture', onPointerUp);

    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(activeIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(activeIndex + 1);
      }
    });

    window.addEventListener('resize', function () {
      setTrackPosition(0);
    });

    goTo(0);
  }

  initBreitResultsCarousel();
</script>
