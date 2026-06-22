// Generate TRMNL markup for all 4 layout sizes.
// Uses Smart Columns (overflow engine) for automatic column distribution.

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

const FOOTER_TAGLINES = [
  "Don't forget the snacks.",
  "Your fridge believes in you.",
  "Shop smart. Shop e-ink.",
  "Alexa probably reminded you already.",
  "Pro tip: buy chocolate.",
  "You've got this, aisle by aisle.",
  "Remember: samples are free.",
  "The list is short. The lines won't be.",
  "Powered by Bring!, displayed by TRMNL.",
  "One does not simply skip the dairy aisle.",
];

function pick(arr, seed) { return arr[(seed || 0) % arr.length]; }

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function greeting(utcHour) {
  if (utcHour < 6) return "Late night shop?";
  if (utcHour < 12) return "Good morning!";
  if (utcHour < 17) return "Afternoon run";
  if (utcHour < 21) return "Evening shop";
  return "Late night list";
}

function titleBar(title, instance) {
  return `<div class="title_bar"><span class="title">${escapeHtml(title)}</span><span class="instance">${escapeHtml(instance)}</span></div>`;
}

function emptyState(seed) {
  const phrase = pick(WITTY_EMPTY, seed);
  return `<div class="flex flex--col gap--small" style="text-align:center"><span class="title title--large lg:title--xlarge" data-value-fit="true" style="font-style:italic">${escapeHtml(phrase)}</span></div>`;
}

function titleSizeClass(count, layout) {
  if (layout === "quadrant") {
    if (count <= 2) return "title title--base lg:title--large";
    return "title title--small lg:title--base";
  }
  if (layout === "half") {
    if (count === 1) return "title title--xlarge lg:title--xxlarge";
    if (count <= 3) return "title title--large lg:title--xlarge";
    if (count <= 5) return "title title--base lg:title--large";
    return "title title--small lg:title--base";
  }
  if (count === 1) return "title title--xxlarge";
  if (count <= 4) return "title title--xlarge lg:title--xxlarge";
  if (count <= 8) return "title title--large lg:title--xlarge";
  if (count <= 14) return "title title--base lg:title--large";
  return "title title--small lg:title--base";
}

const GENERIC_ICON = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="black" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20h36l-4 20H10z"/><path d="M16 20l8-14 8 14"/><line x1="24" y1="26" x2="24" y2="36"/><line x1="16" y1="26" x2="17" y2="36"/><line x1="32" y1="26" x2="31" y2="36"/></svg>')}`;

function iconHtml(item, showIcons) {
  if (!showIcons) return `<div class="meta"></div>`;
  const src = item.iconUrl ? escapeHtml(item.iconUrl) : GENERIC_ICON;
  const onerror = item.iconUrl ? ` onerror="this.src='${GENERIC_ICON}'"` : '';
  return `<div class="icon"><img src="${src}" class="w--[32px] h--[32px] lg:w--[40px] lg:h--[40px]" style="filter:brightness(0); object-fit:contain"${onerror} /></div>`;
}

function assignedBadge(item) {
  if (!item.assignedTo) return "";
  return ` <span class="label label--small label--underline">${escapeHtml(item.assignedTo)}</span>`;
}

// Render a flat list of item divs
function renderItems(items, layout, totalCount, opts = {}) {
  const cls = titleSizeClass(totalCount, layout);
  return items.map((item) => {
    const spec = opts.showSpec && item.specification
      ? `<span class="description">${escapeHtml(item.specification)}</span>` : "";
    const badge = assignedBadge(item);
    const icon = iconHtml(item, opts.showIcons);
    return `<div class="item">${icon}<div class="content"><span class="${cls}">${escapeHtml(item.name)}${badge}</span>${spec}</div></div>`;
  }).join("\n");
}

// Use Smart Columns — let the overflow engine distribute items across columns.
function columnsHtml(items, layout, maxCols, opts = {}) {
  const count = items.length;
  if (count === 0) return "";

  const itemsHtml = renderItems(items, layout, count, opts);
  const lgCols = Math.min(maxCols + 1, 4);

  return `<div class="columns stretch-y" data-overflow-max-cols="${maxCols}" data-overflow-max-cols-lg="${lgCols}" data-overflow-counter="true"><div class="column">${itemsHtml}</div></div>`;
}

function greetingHeader(count, utcHour) {
  const greet = greeting(utcHour);
  const suffix = count === 1 ? "1 item to grab" : `${count} items to grab`;
  return `<div class="bg--gray-70 rounded--medium" style="padding:8px 14px"><div class="flex gap--small" style="align-items:center;justify-content:space-between"><span class="label label--medium" style="font-weight:700">${greet}</span><span class="label label--small">${suffix}</span></div></div>`;
}

function completionPct(purchaseCount, recentCount) {
  const total = purchaseCount + recentCount;
  if (total === 0) return "";
  const pct = Math.round((recentCount / total) * 100);
  return `${pct}% completed`;
}

function footerStrip(recentItems, seed) {
  const parts = [];
  if (recentItems.length) {
    const names = recentItems.map((i) => escapeHtml(i.name)).join(" · ");
    parts.push(`<div class="divider"></div><span class="label label--small label--gray">Got: ${names}</span>`);
  }
  parts.push(`<div class="flex" style="justify-content:center"><span class="label label--small label--gray" style="font-style:italic">${escapeHtml(pick(FOOTER_TAGLINES, seed + 3))}</span></div>`);
  return parts.join("");
}

export function generateMarkup(purchase, recently, updatedAt, listName) {
  const count = purchase.length;
  const countLabel = `${count} item${count !== 1 ? "s" : ""}`;
  const displayName = listName || "Shopping List";
  const utcHour = new Date().getUTCHours();
  const seed = utcHour;

  const fullInstance = displayName !== "Shopping List"
    ? `${displayName} · ${countLabel} · ${updatedAt}`
    : `${countLabel} · ${updatedAt}`;
  const shortInstance = displayName !== "Shopping List"
    ? `${displayName} · ${countLabel}`
    : countLabel;

  const recentlySlice = recently.slice(0, 5);
  const pctLabel = completionPct(count, recentlySlice.length);
  const fullInst = pctLabel ? `${fullInstance} · ${pctLabel}` : fullInstance;
  const shortInst = pctLabel ? `${shortInstance} · ${pctLabel}` : shortInstance;

  // -- Full --
  let fullContent;
  if (count === 0) {
    fullContent = `<div class="layout layout--center">${emptyState(seed)}</div>`;
  } else {
    const header = greetingHeader(count, utcHour);
    const cols = columnsHtml(purchase, "full", 2, { showSpec: true, showIcons: true });
    const footer = footerStrip(recentlySlice, seed);
    fullContent = `<div class="layout layout--col gap--small">${header}${cols}${footer}</div>`;
  }
  const full = `${fullContent}${titleBar("Shopping List", fullInst)}`;

  // -- Half Horizontal --
  let halfHContent;
  if (count === 0) {
    halfHContent = `<div class="layout layout--center">${emptyState(seed)}</div>`;
  } else {
    const cols = columnsHtml(purchase, "half", 2, { showIcons: true });
    const footer = footerStrip(recentlySlice.slice(0, 3), seed);
    halfHContent = `<div class="layout layout--col gap--small">${cols}${footer}</div>`;
  }
  const halfH = `${halfHContent}${titleBar("Shopping List", shortInst)}`;

  // -- Half Vertical --
  let halfVContent;
  if (count === 0) {
    halfVContent = `<div class="layout layout--center">${emptyState(seed)}</div>`;
  } else {
    const cols = columnsHtml(purchase, "half", 1, { showSpec: true, showIcons: true });
    const footer = footerStrip(recentlySlice.slice(0, 3), seed);
    halfVContent = `<div class="layout layout--col gap--small">${cols}${footer}</div>`;
  }
  const halfV = `${halfVContent}${titleBar("Shopping List", shortInst)}`;

  // -- Quadrant --
  let quadContent;
  if (count === 0) {
    quadContent = `<div class="layout layout--center">${emptyState(seed)}</div>`;
  } else {
    const cols = columnsHtml(purchase, "quadrant", 2, { showIcons: true });
    quadContent = `<div class="layout layout--col gap">${cols}</div>`;
  }
  const quadrant = `${quadContent}${titleBar("Shopping", shortInst)}`;

  return {
    markup: full,
    markup_half_horizontal: halfH,
    markup_half_vertical: halfV,
    markup_quadrant: quadrant,
  };
}
