---
layout: page
permalink: /publications/
title: Publications
description: Selected publications. You can find a full list of publications in my <a href='https://scholar.google.com/citations?user=IBUjNFYAAAAJ&hl=en'>Google Scholar profile</a>.
years: [2026, 2024, 2023, 2022, 2021]
nav: true
---

<!-- _pages/publications.md -->
{% include bib_search.liquid %}
<div class="publications">

{%- for y in page.years %}
  <h2 class="year">{{y}}</h2>
  {% bibliography -f papers -q @*[year={{y}}]* --group_by none %}
{% endfor %}

</div>