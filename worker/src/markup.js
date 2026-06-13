// Generate TRMNL markup for all 4 layout sizes.
// Uses Overflow engine, adaptive text, item icons, group headers, and recently-purchased section.

const WITTY_EMPTY = [
  "Cart's empty. Fridge is judging you.",
  "Nothing to buy. Nothing to forget.",
  "List: zero. Willpower: hero.",
  "The fridge called. You hung up.",
  "All shopped out. Go take a nap.",
  "Nothing here. Suspicious, isn't it?",
  "Your list is on vacation.",
  "Achievement unlocked: empty list.",
  "Plot twist: you have everything.",
  "The grocery aisle misses you.",
  "List status: blissfully blank.",
  "Bring! has nothing to bring.",
];

function randomWitty(seed) {
  const idx = (seed || 0) % WITTY_EMPTY.length;
  return WITTY_EMPTY[idx];
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function titleBar(title, instance) {
  return `<div class="title_bar"><span class="title">${escapeHtml(title)}</span><span class="instance">${escapeHtml(instance)}</span></div>`;
}

function emptyState(seed) {
  const phrase = randomWitty(seed);
  return `<div class="layout layout--center"><div class="flex flex--col gap--small"><span class="title title--large" data-value-fit="true">${escapeHtml(phrase)}</span></div></div>`;
}

// Adaptive title sizing: fewer items → bigger text.
function titleSizeClass(count, layout) {
  if (layout === "quadrant") {
    if (count <= 2) return "title title--base";
    return "title title--small";
  }
  if (layout === "half") {
    if (count === 1) return "title title--xlarge";
    if (count <= 3) return "title title--large";
    if (count <= 5) return "title title--base";
    return "title title--small";
  }
  if (count === 1) return "title title--xxlarge";
  if (count === 2) return "title title--xlarge";
  if (count <= 4) return "title title--large";
  if (count <= 8) return "title title--base";
  return "title title--small";
}

// Generic fallback icon: shopping basket as inline SVG.
const GENERIC_ICON = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="black" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20h36l-4 20H10z"/><path d="M16 20l8-14 8 14"/><line x1="24" y1="26" x2="24" y2="36"/><line x1="16" y1="26" x2="17" y2="36"/><line x1="32" y1="26" x2="31" y2="36"/></svg>')}`;

function iconHtml(item, showIcons) {
  if (!showIcons) return `<div class="meta"></div>`;
  // Fixed pixel size for icons so they don't inflate row height.
  // The item row height is driven by the text; the icon fits within it.
  const imgStyle = `filter:brightness(0); width:24px; height:24px; object-fit:contain; vertical-align:middle`;
  if (!item.iconUrl) {
    return `<div class="icon"><img src="${GENERIC_ICON}" style="${imgStyle}" /></div>`;
  }
  return `<div class="icon"><img src="${escapeHtml(item.iconUrl)}" style="${imgStyle}" onerror="this.src='${GENERIC_ICON}'" /></div>`;
}

// Render a list of items as HTML.
function itemsHtml(items, layout, { showSpec = false, showIcons = false, gray = false } = {}) {
  const cls = titleSizeClass(items.length, layout);
  const grayClass = gray ? " label--gray" : "";
  return items
    .map((item) => {
      const spec =
        showSpec && item.specification
          ? `<span class="description${grayClass}">${escapeHtml(item.specification)}</span>`
          : "";
      const icon = iconHtml(item, showIcons);
      return `<div class="item">${icon}<div class="content"><span class="${cls}${grayClass}">${escapeHtml(item.name)}</span>${spec}</div></div>`;
    })
    .join("\n");
}

// Group header label (e.g., "🛒 To Buy", "✓ Recently Got")
function groupHeader(text) {
  return `<span class="label label--medium group-header" data-group-header="true">${text}</span>`;
}

export function generateMarkup(purchase, recently, updatedAt, listName) {
  const count = purchase.length;
  const countLabel = `${count} item${count !== 1 ? "s" : ""}`;
  const displayName = listName || "Shopping List";
  const seed = new Date(updatedAt || Date.now()).getUTCHours?.() || Math.floor(Date.now() / 3600000);

  const fullInstance = displayName !== "Shopping List"
    ? `${displayName} · ${countLabel} · ${updatedAt}`
    : `${countLabel} · ${updatedAt}`;
  const shortInstance = displayName !== "Shopping List"
    ? `${displayName} · ${countLabel}`
    : countLabel;

  // Limit recently-purchased to a few items (don't overwhelm the screen)
  const recentlySlice = recently.slice(0, 5);
  const showRecent = recentlySlice.length > 0;

  // -- Full: group headers + recently purchased section --
  let fullContent;
  if (count === 0) {
    fullContent = `<div class="layout">${emptyState(seed)}</div>`;
  } else {
    let columnContent = "";
    columnContent += groupHeader("🛒 To Buy");
    columnContent += itemsHtml(purchase, "full", { showSpec: true, showIcons: true });
    if (showRecent) {
      columnContent += groupHeader("✓ Recently Got");
      columnContent += itemsHtml(recentlySlice, "full", { showSpec: false, showIcons: true, gray: true });
    }
    fullContent = `<div class="layout layout--col layout--stretch gap"><div class="columns" data-overflow-max-cols="2" data-overflow-counter="true"><div class="column">${columnContent}</div></div></div>`;
  }
  const full = `${fullContent}${titleBar("Shopping List", fullInstance)}`;

  // -- Half Horizontal: group headers, no specs --
  let halfHContent;
  if (count === 0) {
    halfHContent = `<div class="layout">${emptyState(seed)}</div>`;
  } else {
    let columnContent = groupHeader("🛒 To Buy");
    columnContent += itemsHtml(purchase, "half", { showIcons: true });
    if (showRecent) {
      columnContent += groupHeader("✓ Got");
      columnContent += itemsHtml(recentlySlice.slice(0, 3), "half", { showIcons: true, gray: true });
    }
    halfHContent = `<div class="layout layout--col layout--stretch gap"><div class="columns" data-overflow-max-cols="2" data-overflow-counter="true"><div class="column">${columnContent}</div></div></div>`;
  }
  const halfH = `${halfHContent}${titleBar("Shopping List", shortInstance)}`;

  // -- Half Vertical: group headers + specs --
  let halfVContent;
  if (count === 0) {
    halfVContent = `<div class="layout">${emptyState(seed)}</div>`;
  } else {
    let columnContent = groupHeader("🛒 To Buy");
    columnContent += itemsHtml(purchase, "half", { showSpec: true, showIcons: true });
    if (showRecent) {
      columnContent += groupHeader("✓ Got");
      columnContent += itemsHtml(recentlySlice.slice(0, 3), "half", { showIcons: true, gray: true });
    }
    halfVContent = `<div class="layout layout--col layout--stretch gap"><div class="columns" data-overflow-max-cols="1" data-overflow-counter="true"><div class="column">${columnContent}</div></div></div>`;
  }
  const halfV = `${halfVContent}${titleBar("Shopping List", shortInstance)}`;

  // -- Quadrant: compact, icons, no recently --
  let quadContent;
  if (count === 0) {
    quadContent = `<div class="layout">${emptyState(seed)}</div>`;
  } else {
    quadContent = `<div class="layout layout--col layout--stretch gap"><div class="columns" data-overflow-max-cols="2" data-overflow-counter="true"><div class="column">${itemsHtml(purchase, "quadrant", { showIcons: true })}</div></div></div>`;
  }
  const quadrant = `${quadContent}${titleBar("Shopping", shortInstance)}`;

  return {
    markup: full,
    markup_half_horizontal: halfH,
    markup_half_vertical: halfV,
    markup_quadrant: quadrant,
  };
}
