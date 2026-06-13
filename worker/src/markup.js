// Generate TRMNL markup for all 4 layout sizes.
// Features: overflow columns, adaptive text, item icons, assigned-to badges,
// shopping progress bar, time-based greeting, dithered header, witty footer taglines.

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

function pick(arr, seed) {
  return arr[(seed || 0) % arr.length];
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Time-based greeting from UTC hour
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
  return `<div class="flex flex--col gap--small" style="text-align:center"><span class="title title--large" data-value-fit="true" style="font-style:italic">${escapeHtml(phrase)}</span></div>`;
}

// Adaptive title sizing
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
  if (count <= 4) return "title title--xlarge";
  if (count <= 8) return "title title--large";
  if (count <= 14) return "title title--base";
  return "title title--small";
}

function columnAttrs(count, maxCols) {
  if (count >= 3 && maxCols >= 2) {
    return `data-overflow-cols="2" data-overflow-counter="true"`;
  }
  return `data-overflow-max-cols="${maxCols}" data-overflow-counter="true"`;
}

const GENERIC_ICON = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="black" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20h36l-4 20H10z"/><path d="M16 20l8-14 8 14"/><line x1="24" y1="26" x2="24" y2="36"/><line x1="16" y1="26" x2="17" y2="36"/><line x1="32" y1="26" x2="31" y2="36"/></svg>')}`;

function iconHtml(item, showIcons) {
  if (!showIcons) return `<div class="meta"></div>`;
  const imgStyle = `filter:brightness(0); width:24px; height:24px; object-fit:contain; vertical-align:middle`;
  if (!item.iconUrl) {
    return `<div class="icon"><img src="${GENERIC_ICON}" style="${imgStyle}" /></div>`;
  }
  return `<div class="icon"><img src="${escapeHtml(item.iconUrl)}" style="${imgStyle}" onerror="this.src='${GENERIC_ICON}'" /></div>`;
}

// Assigned-to badge (for shared lists)
function assignedBadge(item) {
  if (!item.assignedTo) return "";
  return ` <span class="label label--small label--underline">${escapeHtml(item.assignedTo)}</span>`;
}

// Render items with icons, specs, and assigned-to badges
function toBuyHtml(items, layout, { showSpec = false, showIcons = false } = {}) {
  const cls = titleSizeClass(items.length, layout);
  return items
    .map((item) => {
      const spec =
        showSpec && item.specification
          ? `<span class="description">${escapeHtml(item.specification)}</span>`
          : "";
      const badge = assignedBadge(item);
      const icon = iconHtml(item, showIcons);
      return `<div class="item">${icon}<div class="content"><span class="${cls}">${escapeHtml(item.name)}${badge}</span>${spec}</div></div>`;
    })
    .join("\n");
}

// Greeting header with dithered background accent
function greetingHeader(count, utcHour) {
  const greet = greeting(utcHour);
  const suffix = count === 1 ? "1 item to grab" : `${count} items to grab`;
  return `<div class="bg--gray-70 rounded--medium" style="padding:8px 14px;margin-bottom:4px"><div class="flex gap--small" style="align-items:center;justify-content:space-between"><span class="label label--medium" style="font-weight:700">${greet}</span><span class="label label--small">${suffix}</span></div></div>`;
}

// Shopping progress bar: purchased vs total
function progressBar(purchaseCount, recentCount) {
  const total = purchaseCount + recentCount;
  if (total === 0) return "";
  const pct = Math.round((recentCount / total) * 100);
  return `<div class="progress-bar progress-bar--xsmall"><div class="content"><span class="label label--small label--gray">${recentCount} of ${total} done</span><span class="value value--xxsmall">${pct}%</span></div><div class="track"><div class="fill" style="width:${pct}%"></div></div></div>`;
}

// Recently-got strip + witty footer tagline
function footerStrip(recentItems, seed) {
  const parts = [];
  if (recentItems.length) {
    const names = recentItems.map((i) => escapeHtml(i.name)).join(" · ");
    parts.push(`<div class="divider"></div><div class="flex gap--small" style="align-items:center"><span class="label label--small label--gray">Got: ${names}</span></div>`);
  }
  const tagline = pick(FOOTER_TAGLINES, seed + 3);
  parts.push(`<div class="flex" style="justify-content:center"><span class="label label--small label--gray" style="font-style:italic">${escapeHtml(tagline)}</span></div>`);
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

  // -- Full --
  let fullContent;
  if (count === 0) {
    fullContent = `<div class="layout layout--center">${emptyState(seed)}</div>`;
  } else {
    const header = greetingHeader(count, utcHour);
    const progress = progressBar(count, recentlySlice.length);
    const mainItems = toBuyHtml(purchase, "full", { showSpec: true, showIcons: true });
    const footer = footerStrip(recentlySlice, seed);
    const colAttrs = columnAttrs(count, 2);
    fullContent = `<div class="layout layout--col gap--small">${header}<div class="columns stretch-y" ${colAttrs}><div class="column">${mainItems}</div></div>${progress}${footer}</div>`;
  }
  const full = `${fullContent}${titleBar("Shopping List", fullInstance)}`;

  // -- Half Horizontal --
  let halfHContent;
  if (count === 0) {
    halfHContent = `<div class="layout layout--center">${emptyState(seed)}</div>`;
  } else {
    const mainItems = toBuyHtml(purchase, "half", { showIcons: true });
    const footer = footerStrip(recentlySlice.slice(0, 3), seed);
    const colAttrs = columnAttrs(count, 2);
    halfHContent = `<div class="layout layout--col gap--small"><div class="columns stretch-y" ${colAttrs}><div class="column">${mainItems}</div></div>${footer}</div>`;
  }
  const halfH = `${halfHContent}${titleBar("Shopping List", shortInstance)}`;

  // -- Half Vertical --
  let halfVContent;
  if (count === 0) {
    halfVContent = `<div class="layout layout--center">${emptyState(seed)}</div>`;
  } else {
    const mainItems = toBuyHtml(purchase, "half", { showSpec: true, showIcons: true });
    const footer = footerStrip(recentlySlice.slice(0, 3), seed);
    halfVContent = `<div class="layout layout--col gap--small"><div class="columns stretch-y" data-overflow-max-cols="1" data-overflow-counter="true"><div class="column">${mainItems}</div></div>${footer}</div>`;
  }
  const halfV = `${halfVContent}${titleBar("Shopping List", shortInstance)}`;

  // -- Quadrant: compact, no frills --
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
