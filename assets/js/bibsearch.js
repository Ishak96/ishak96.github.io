import { highlightSearchTerm } from "./highlight-search-term.js";

document.addEventListener("DOMContentLoaded", function () {
  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Hide year-section headers / lists that contain no visible entries. */
  const hideEmptyYearGroups = () => {
    // Handle h2.year groups (publications page)
    document.querySelectorAll("h2.year").forEach(function (h2) {
      let iterator = h2.nextElementSibling;
      let hasVisible = false;
      while (iterator && iterator.tagName !== "H2") {
        if (iterator.tagName === "OL") {
          const total = iterator.querySelectorAll(":scope > li");
          const hidden = iterator.querySelectorAll(":scope > li.unloaded");
          if (hidden.length === total.length) {
            iterator.classList.add("unloaded");
          } else {
            iterator.classList.remove("unloaded");
            hasVisible = true;
          }
        }
        iterator = iterator.nextElementSibling;
      }
      if (hasVisible) {
        h2.classList.remove("unloaded");
      } else {
        h2.classList.add("unloaded");
      }
    });

    // Handle h2.bibliography groups (used by other templates)
    document.querySelectorAll("h2.bibliography").forEach(function (element) {
      let iterator = element.nextElementSibling; // get next sibling element after h2, which can be h3 or ol
      let hideFirstGroupingElement = true;
      // iterate until next group element (h2), which is already selected by the querySelectorAll(-).forEach(-)
      while (iterator && iterator.tagName !== "H2") {
        if (iterator.tagName === "OL") {
          const ol = iterator;
          const unloadedSiblings = ol.querySelectorAll(":scope > li.unloaded");
          const totalSiblings = ol.querySelectorAll(":scope > li");

          if (unloadedSiblings.length === totalSiblings.length) {
            ol.previousElementSibling.classList.add("unloaded"); // Add the '.unloaded' class to the previous grouping element (e.g. year)
            ol.classList.add("unloaded"); // Add the '.unloaded' class to the OL itself
          } else {
            hideFirstGroupingElement = false; // there is at least some visible entry, don't hide the first grouping element
          }
        }
        iterator = iterator.nextElementSibling;
      }
      // Add unloaded class to first grouping element (e.g. year) if no item left in this group
      if (hideFirstGroupingElement) {
        element.classList.add("unloaded");
      }
    });
  };

  // ── Field values (for the year / conference dropdowns) ───────────────────

  const yearOf = (li) => {
    const ol = li.closest("ol.bibliography");
    let sibling = ol ? ol.previousElementSibling : null;
    while (sibling) {
      if (sibling.tagName === "H2" && sibling.classList.contains("year")) {
        const year = sibling.textContent.trim();
        return { key: year, label: year };
      }
      sibling = sibling.previousElementSibling;
    }
    return { key: "", label: "" };
  };

  const conferenceOf = (li) => {
    const venueEl = li.querySelector(".periodical em") || li.querySelector(".periodical");
    const full = venueEl
      ? venueEl.textContent
          .replace(/\s+/g, " ")
          .trim()
          .replace(/^In\s+/i, "")
          .replace(/,\s*\d{4}$/, "")
      : "";
    if (!full) return { key: "", label: "" };
    // Prefer the acronym in parentheses, e.g. "(MICCAI)" or "(EUSIPCO 2026)"
    const acronym = full.match(/\(([^()]+)\)\s*$/);
    const label = acronym ? acronym[1].replace(/\s+\d{4}$/, "").trim() : full.replace(/^IEEE\s+/i, "");
    return { key: label.toLowerCase(), label, full };
  };

  const collectChoices = (searchType) => {
    const valueOf = searchType === "year" ? yearOf : conferenceOf;
    const choices = new Map();
    document.querySelectorAll(".publications .bibliography > li").forEach((li) => {
      const value = valueOf(li);
      if (!value.key) return;
      const entry = choices.get(value.key) || { ...value, count: 0 };
      entry.count += 1;
      choices.set(value.key, entry);
    });
    return [...choices.values()].sort((a, b) => (searchType === "year" ? Number(b.label) - Number(a.label) : a.label.localeCompare(b.label)));
  };

  // ── Filter ────────────────────────────────────────────────────────────────

  const filterItems = (searchTerm, searchType) => {
    // Clear previous unloaded state
    document.querySelectorAll(".bibliography, .unloaded").forEach((element) => element.classList.remove("unloaded"));

    if (!searchTerm) {
      return;
    }

    const listItems = document.querySelectorAll(".bibliography > li");

    if (!searchType || searchType === "all") {
      // Full-text search with optional CSS Highlight API
      if (CSS.highlights) {
        const nonMatchingElements = highlightSearchTerm({ search: searchTerm, selector: ".bibliography > li" });
        if (nonMatchingElements == null) {
          return;
        }
        nonMatchingElements.forEach((element) => {
          element.classList.add("unloaded");
        });
      } else {
        // Simply add unloaded class to all non-matching items if Browser does not support CSS highlights
        listItems.forEach((element) => {
          const text = element.innerText.toLowerCase();
          if (text.indexOf(searchTerm) == -1) {
            element.classList.add("unloaded");
          }
        });
      }
    } else if (searchType === "year" || searchType === "conference") {
      // Exact match against the value chosen in the dropdown
      if (CSS.highlights) {
        CSS.highlights.delete("search");
      }
      const valueOf = searchType === "year" ? yearOf : conferenceOf;
      listItems.forEach((li) => {
        if (valueOf(li).key !== searchTerm) {
          li.classList.add("unloaded");
        }
      });
    } else {
      // Title search – plain text match
      if (CSS.highlights) {
        CSS.highlights.delete("search");
      }
      listItems.forEach((li) => {
        const text = Array.from(li.querySelectorAll(".title"))
          .map((el) => el.innerText)
          .join(" ")
          .toLowerCase();
        if (text.indexOf(searchTerm) === -1) {
          li.classList.add("unloaded");
        }
      });
    }

    hideEmptyYearGroups();
  };

  // ── Sort ──────────────────────────────────────────────────────────────────

  const sortYearGroups = (direction) => {
    const container = document.querySelector(".publications");
    if (!container) return;

    // Collect (h2.year, ol.bibliography) pairs
    const groups = [];
    let currentH2 = null;
    Array.from(container.children).forEach((child) => {
      if (child.tagName === "H2" && child.classList.contains("year")) {
        currentH2 = child;
      } else if (child.tagName === "OL" && child.classList.contains("bibliography") && currentH2) {
        const year = parseInt(currentH2.textContent.trim(), 10);
        groups.push({ year: isNaN(year) ? 0 : year, h2: currentH2, ol: child });
        currentH2 = null;
      }
    });

    groups.sort((a, b) => (direction === "asc" ? a.year - b.year : b.year - a.year));

    groups.forEach((group) => {
      container.appendChild(group.h2);
      container.appendChild(group.ol);
    });
  };

  // ── Input / hash handling ─────────────────────────────────────────────────

  const getSearchType = () => {
    const typeSelect = document.getElementById("bibsearch-type");
    return typeSelect ? typeSelect.value : "all";
  };

  const bibsearchInput = document.getElementById("bibsearch");
  const choiceSelect = document.getElementById("bibsearch-choice");
  const usesChoices = (searchType) => Boolean(choiceSelect) && (searchType === "year" || searchType === "conference");

  /** Show a dropdown of existing values for year/conference, a text box otherwise. */
  const updateSearchControl = (searchType) => {
    const showChoices = usesChoices(searchType);
    if (bibsearchInput) bibsearchInput.hidden = showChoices;
    if (!choiceSelect) return;
    choiceSelect.hidden = !showChoices;
    if (!showChoices) return;

    const noun = searchType === "year" ? "years" : "conferences";
    choiceSelect.setAttribute("aria-label", `Choose a ${searchType}`);
    choiceSelect.replaceChildren(new Option(`All ${noun}`, ""));
    collectChoices(searchType).forEach((choice) => {
      const option = new Option(`${choice.label} (${choice.count})`, choice.key);
      if (choice.full) option.title = choice.full;
      choiceSelect.append(option);
    });
  };

  const currentSearchTerm = () => {
    const searchType = getSearchType();
    if (usesChoices(searchType)) return choiceSelect.value;
    return bibsearchInput ? bibsearchInput.value.toLowerCase() : "";
  };

  const updateInputField = () => {
    const hashValue = decodeURIComponent(window.location.hash.substring(1)); // Remove the '#' character
    const searchType = getSearchType();
    if (usesChoices(searchType)) {
      const key = hashValue.toLowerCase();
      choiceSelect.value = [...choiceSelect.options].some((option) => option.value === key) ? key : "";
    } else if (bibsearchInput) {
      bibsearchInput.value = hashValue;
    }
    filterItems(currentSearchTerm(), searchType);
  };

  // Sensitive search. Only start searching if there's been no input for 300 ms
  let timeoutId;
  if (bibsearchInput) {
    bibsearchInput.addEventListener("input", function () {
      clearTimeout(timeoutId); // Clear the previous timeout
      const searchTerm = this.value.toLowerCase();
      timeoutId = setTimeout(() => filterItems(searchTerm, getSearchType()), 300);
    });
  }

  if (choiceSelect) {
    choiceSelect.addEventListener("change", () => filterItems(choiceSelect.value, getSearchType()));
  }

  // Switch control and re-run filter when search type changes
  const bibsearchType = document.getElementById("bibsearch-type");
  if (bibsearchType) {
    bibsearchType.addEventListener("change", function () {
      updateSearchControl(this.value);
      filterItems(currentSearchTerm(), this.value);
    });
  }

  // Sort button – toggle asc/desc on click
  const sortBtn = document.getElementById("pub-sort-btn");
  if (sortBtn) {
    sortBtn.addEventListener("click", function () {
      const currentOrder = this.getAttribute("data-order");
      const newOrder = currentOrder === "desc" ? "asc" : "desc";
      this.setAttribute("data-order", newOrder);
      const icon = this.querySelector("i");
      if (icon) {
        icon.className = newOrder === "asc" ? "fa-solid fa-arrow-up-wide-short" : "fa-solid fa-arrow-down-wide-short";
      }
      this.title = newOrder === "asc" ? "Sort by year (ascending)" : "Sort by year (descending)";
      this.setAttribute("aria-label", newOrder === "asc" ? "Sort by year (ascending)" : "Sort by year (descending)");
      sortYearGroups(newOrder);
    });
  }

  window.addEventListener("hashchange", updateInputField); // Update the filter when the hash changes

  updateSearchControl(getSearchType()); // Browsers may restore the field selection on reload
  updateInputField(); // Update filter when page loads
});
