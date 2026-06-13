// Generate TRMNL markup for all 4 layout sizes.
// Uses Overflow engine, adaptive text, item icons, and recently-purchased strip.

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
  return `<div class="flex flex--col gap--small" style="text-align:center"><span class="title title--large" data-value-fit="true" style="font-style:italic">${escapeHtml(phrase)}</span></div>`;
}

// Adaptive title sizing: fewer items → bigger text to fill available space.
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
  // full — very aggressive sizing since items spread across 2 columns
  if (count === 1) return "title title--xxlarge";
  if (count <= 4) return "title title--xlarge";
  if (count <= 8) return "title title--large";
  if (count <= 14) return "title title--base";
  return "title title--small";
}

// Pick column strategy based on item count.
// Force 2 columns when there are enough items to fill them — the overflow engine's
// "max-cols" mode only splits when items OVERFLOW, which leaves empty space.
function columnAttrs(count, maxCols) {
  if (count >= 3 && maxCols >= 2) {
    return `data-overflow-cols="2" data-overflow-counter="true"`;
  }
  return `data-overflow-max-cols="${maxCols}" data-overflow-counter="true"`;
}

// Generic fallback icon: shopping basket as inline SVG.
const GENERIC_ICON = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="black" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20h36l-4 20H10z"/><path d="M16 20l8-14 8 14"/><line x1="24" y1="26" x2="24" y2="36"/><line x1="16" y1="26" x2="17" y2="36"/><line x1="32" y1="26" x2="31" y2="36"/></svg>')}`;

function iconHtml(item, showIcons) {
  if (!showIcons) return `<div class="meta"></div>`;
  const imgStyle = `filter:brightness(0); width:24px; height:24px; object-fit:contain; vertical-align:middle`;
  if (!item.iconUrl) {
    return `<div class="icon"><img src="${GENERIC_ICON}" style="${imgStyle}" /></div>`;
  }
  return `<div class="icon"><img src="${escapeHtml(item.iconUrl)}" style="${imgStyle}" onerror="this.src='${GENERIC_ICON}'" /></div>`;
}

// Render items for the main "To Buy" section.
function toBuyHtml(items, layout, { showSpec = false, showIcons = false } = {}) {
  const cls = titleSizeClass(items.length, layout);
  return items
    .map((item) => {
      const spec =
        showSpec && item.specification
          ? `<span class="description">${escapeHtml(item.specification)}</span>`
          : "";
      const icon = iconHtml(item, showIcons);
      return `<div class="item">${icon}<div class="content"><span class="${cls}">${escapeHtml(item.name)}</span>${spec}</div></div>`;
    })
    .join("\n");
}

// Render a compact "Recently Got" strip — inline names, small text, grayed.
function recentlyStrip(items, showIcons) {
  if (!items.length) return "";
  const names = items.map((i) => escapeHtml(i.name)).join(" · ");
  return `<div class="divider"></div><div class="flex gap--small" style="align-items:center"><span class="label label--small label--gray">Recently got: ${names}</span></div>`;
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

  const recentlySlice = recently.slice(0, 5);

  // -- Full: To Buy fills main area, Recently Got as compact strip at bottom --
  let fullContent;
  if (count === 0) {
    fullContent = `<div class="layout layout--center">${emptyState(seed)}</div>`;
  } else {
    const mainItems = toBuyHtml(purchase, "full", { showSpec: true, showIcons: true });
    const recentStrip = recentlyStrip(recentlySlice);
    const colAttrs = columnAttrs(count, 2);
    fullContent = `<div class="layout layout--col gap"><div class="columns stretch-y" ${colAttrs}><div class="column">${mainItems}</div></div>${recentStrip}</div>`;
  }
  const full = `${fullContent}${titleBar("Shopping List", fullInstance)}`;

  // -- Half Horizontal: same structure, tighter --
  let halfHContent;
  if (count === 0) {
    halfHContent = `<div class="layout layout--center">${emptyState(seed)}</div>`;
  } else {
    const mainItems = toBuyHtml(purchase, "half", { showIcons: true });
    const recentStrip = recentlyStrip(recentlySlice.slice(0, 3));
    const colAttrs = columnAttrs(count, 2);
    halfHContent = `<div class="layout layout--col gap"><div class="columns stretch-y" ${colAttrs}><div class="column">${mainItems}</div></div>${recentStrip}</div>`;
  }
  const halfH = `${halfHContent}${titleBar("Shopping List", shortInstance)}`;

  // -- Half Vertical: single column --
  let halfVContent;
  if (count === 0) {
    halfVContent = `<div class="layout layout--center">${emptyState(seed)}</div>`;
  } else {
    const mainItems = toBuyHtml(purchase, "half", { showSpec: true, showIcons: true });
    const recentStrip = recentlyStrip(recentlySlice.slice(0, 3));
    halfVContent = `<div class="layout layout--col gap"><div class="columns stretch-y" data-overflow-max-cols="1" data-overflow-counter="true"><div class="column">${mainItems}</div></div>${recentStrip}</div>`;
  }
  const halfV = `${halfVContent}${titleBar("Shopping List", shortInstance)}`;

  // -- Quadrant: compact, no recently --
  let quadContent;
  if (count === 0) {
    quadContent = `<div class="layout layout--center">${emptyState(seed)}</div>`;
  } else {
    const colAttrs = columnAttrs(count, 2);
    quadContent = `<div class="layout layout--col gap"><div class="columns stretch-y" ${colAttrs}><div class="column">${toBuyHtml(purchase, "quadrant", { showIcons: true })}</div></div></div>`;
  }
  const quadrant = `${quadContent}${titleBar("Shopping", shortInstance)}`;

  return {
    markup: full,
    markup_half_horizontal: halfH,
    markup_half_vertical: halfV,
    markup_quadrant: quadrant,
  };
}
