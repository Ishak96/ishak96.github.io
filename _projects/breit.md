---
layout: page
title: BREIT
description: Brain Stroke Reconstruction using Multi-Frequency 3D EIT
img: assets/img/breit.png
---

## BREIT: A Framework for Brain Stroke Reconstruction using Multi-Frequency 3D EIT

BREIT is a modular and reproducible framework for 3D Multi-Frequency Electrical Impedance Tomography (MF-EIT) stroke reconstruction. EIT is a non-invasive, low-cost, and portable modality that reconstructs electrical property distributions from boundary voltages — making it a promising tool for continuous, bedside stroke monitoring where CT/MRI are unavailable.

### Framework Overview

BREIT unifies three core components into a single configurable pipeline:

1. **Neuroimaging-to-EIT pipeline** — converts CT/MRI scans into frequency-dependent ground-truth admittivity volumes, supporting both ischemic (DWI/ADC/MRI) and hemorrhagic (CT) stroke types, registered to MNI152 space.
2. **3D CEM forward solver** — a self-contained Python implementation of the 3D Complete Electrode Model (CEM) for simulating MF-EIT voltages across 17 frequencies (5–2000 Hz), validated against EIDORS on the public UCLH stroke dataset.
3. **3D D-bar reconstruction** — supports non-uniform electrode layouts via spherical Voronoi surface-area weighting, providing classical baselines for benchmarking.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/breit.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Code

The codebase is currently under review. **Code coming soon at [BREIT GitHub Repository](https://github.com/Ishak96/BREIT).**