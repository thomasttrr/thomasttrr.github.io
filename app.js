"use strict";

const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const DURATION = 280;
const SETTINGS_ERROR =
  "Couldn't read settings.js. This is usually a missing comma or quote. Press F12, then open Console, to see the line number.";

const TAB_DEFS = [
  { id: "about", hash: "about", fallback: "About" },
  { id: "experience", hash: "work", fallback: "Work" },
  { id: "certifications", hash: "certs", fallback: "Certs" },
  { id: "projects", hash: "projects", fallback: "Projects" },
  { id: "contact", hash: "contact", fallback: "Contact" },
];

const HASH_TO_ID = {
  about: "about",
  work: "experience",
  experience: "experience",
  certs: "certifications",
  certifications: "certifications",
  projects: "projects",
  contact: "contact",
};

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function list(value) {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
}

function strings(value) {
  return Array.isArray(value) ? value.map(text).filter(Boolean) : [];
}

function skillGroups(settings) {
  const skills = Array.isArray(settings.skills) ? settings.skills : [];
  const hasGroups = skills.some((item) => item && typeof item === "object");
  if (!hasGroups) {
    const items = strings(skills);
    return items.length ? [{ group: "", items }] : [];
  }
  return list(skills)
    .map((item) => {
      const items = strings(item.items);
      if (!items.length) return null;
      return { group: text(item.group), items };
    })
    .filter(Boolean);
}

function motionOK() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pagePad() {
  const n = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--page-pad"));
  return Number.isFinite(n) ? n : 16;
}

function safeHref(value) {
  const raw = text(value);
  if (!raw || /[\s"<>]/.test(raw) || raw.startsWith("//")) return "";
  const lower = raw.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:")) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) && !/^https?:/i.test(raw) && !/^mailto:/i.test(raw)) return "";
  return raw;
}

function isExternal(href) {
  return /^https?:/i.test(href);
}

function el(tag, options = {}) {
  const node = document.createElement(tag);
  if (options.class) node.className = options.class;
  if (options.text != null) node.textContent = options.text;
  if (options.attrs) {
    for (const [key, value] of Object.entries(options.attrs)) {
      if (value != null && value !== false) node.setAttribute(key, String(value));
    }
  }
  if (options.children) {
    for (const child of options.children) if (child) node.append(child);
  }
  return node;
}

function svg(markup, filled) {
  const tpl = document.createElement("template");
  const paint = filled
    ? 'fill="currentColor" stroke="none"'
    : 'fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';
  tpl.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" ${paint}>${markup}</svg>`;
  return tpl.content.firstElementChild;
}

const ICONS = {
  pin: () =>
    svg('<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/>'),
  mail: () => svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>'),
  linkedin: () =>
    svg(
      '<path d="M6.5 9H4.2V20h2.3V9zM5.3 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM20 20h-2.3v-5.5c0-1.7-.6-2.5-1.8-2.5-1.1 0-1.8.8-1.8 2.5V20H11.8V9H14v1.1c.5-.8 1.6-1.5 3-1.5 2.2 0 3 1.5 3 4.2V20z"/>',
      true
    ),
  github: () =>
    svg(
      '<path d="M12 2C6.5 2 2 6.5 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1.1a9.4 9.4 0 0 1 5 0c2-1.4 2.8-1.1 2.8-1.1.5 1.4.2 2.4.1 2.7.7.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7 1 .7 2v2.9c0 .3.2.6.7.5A10.2 10.2 0 0 0 22 12.2C22 6.5 17.5 2 12 2z"/>',
      true
    ),
};

function initials(name) {
  const parts = text(name).split(/\s+/).filter(Boolean);
  if (!parts.length) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function showBoot(message) {
  const main = document.querySelector("#app");
  main.replaceChildren(el("p", { class: "boot", text: message, attrs: { role: "alert" } }));
}

function tabLabel(settings, def) {
  const custom = settings.tabs && typeof settings.tabs === "object" ? text(settings.tabs[def.id]) : "";
  return custom || def.fallback;
}

function educationItems(settings) {
  return list(settings.education)
    .map((item) => ({
      name: text(item.name),
      meta: [text(item.school), text(item.year)].filter(Boolean).join(" · "),
    }))
    .filter((item) => item.name);
}

function experienceItems(settings) {
  return list(settings.experience)
    .map((item) => ({
      dates: text(item.dates),
      role: text(item.role),
      company: text(item.company),
      summary: text(item.summary),
    }))
    .filter((item) => item.role || item.company || item.summary);
}

function certItems(settings) {
  return list(settings.certifications)
    .map((item) => ({
      name: text(item.name),
      issuer: text(item.issuer),
      completed: text(item.completed),
      link: safeHref(item.link),
    }))
    .filter((item) => item.name);
}

function projectItems(settings) {
  return list(settings.projects)
    .map((item) => ({
      name: text(item.name),
      summary: text(item.summary),
      link: safeHref(item.link),
      tags: strings(item.tags),
    }))
    .filter((item) => item.name || item.summary);
}

function visibleTabs(settings) {
  const contact = settings.contact && typeof settings.contact === "object" ? settings.contact : {};
  const ready = {
    about: strings(settings.about).length > 0 || skillGroups(settings).length > 0 || educationItems(settings).length > 0,
    experience: experienceItems(settings).length > 0,
    certifications: certItems(settings).length > 0,
    projects: projectItems(settings).length > 0,
    contact: Boolean(text(settings.location) || text(contact.email) || text(contact.linkedin) || text(contact.github) || text(contact.resume)),
  };
  return TAB_DEFS.filter((def) => ready[def.id]).map((def, index) => ({
    ...def,
    label: tabLabel(settings, def),
    number: String(index + 1).padStart(2, "0"),
  }));
}

function kicker(tab) {
  return el("h2", {
    class: "kicker",
    children: [
      el("span", { class: "kicker-num", text: tab.number, attrs: { "aria-hidden": "true" } }),
      el("span", { class: "kicker-rule", attrs: { "aria-hidden": "true" } }),
      document.createTextNode(tab.label),
    ],
  });
}

function panelShell(tab) {
  return el("section", {
    class: "panel",
    attrs: {
      id: `panel-${tab.id}`,
      role: "tabpanel",
      "aria-labelledby": `tab-${tab.id}`,
      tabindex: "-1",
    },
  });
}

function renderSkills(groups) {
  if (!groups.length) return null;
  if (groups.length === 1 && !groups[0].group) {
    return el("ul", {
      class: "chips",
      attrs: { "aria-label": "Skills" },
      children: groups[0].items.map((skill) => el("li", { text: skill })),
    });
  }

  return el("div", {
    class: "skill-groups",
    children: groups.map((group, index) => {
      const headingId = `skill-group-${index}`;
      const chips = el("ul", {
        class: "chips",
        attrs: group.group ? { "aria-labelledby": headingId } : { "aria-label": "Skills" },
        children: group.items.map((skill) => el("li", { text: skill })),
      });
      const block = el("div", { class: "skill-group" });
      if (group.group) {
        block.append(el("h3", { class: "skill-label", text: group.group, attrs: { id: headingId } }));
      }
      block.append(chips);
      return block;
    }),
  });
}

function renderAbout(settings, tab) {
  const panel = panelShell(tab);
  panel.append(kicker(tab));
  const prose = el("div", { class: "prose" });
  strings(settings.about).forEach((paragraph) => prose.append(el("p", { text: paragraph })));
  if (prose.childNodes.length) panel.append(prose);

  const skills = renderSkills(skillGroups(settings));
  if (skills) panel.append(skills);

  const school = educationItems(settings);
  if (school.length) {
    const block = el("div", { class: "education" });
    block.append(el("p", { class: "kicker", text: "Education" }));
    school.forEach((item) => {
      block.append(el("p", { class: "degree", text: item.name }));
      if (item.meta) block.append(el("p", { class: "school", text: item.meta }));
    });
    panel.append(block);
  }
  return panel;
}

function renderExperience(settings, tab) {
  const panel = panelShell(tab);
  panel.append(kicker(tab));
  const timeline = el("ol", { class: "timeline" });
  experienceItems(settings).forEach((job) => {
    const copy = el("div");
    if (job.dates) copy.append(el("p", { class: "when", text: job.dates }));
    copy.append(el("h3", { class: "role", text: job.role || job.company }));
    if (job.role && job.company) copy.append(el("p", { class: "company", text: job.company }));
    if (job.summary) copy.append(el("p", { class: "summary", text: job.summary }));
    timeline.append(el("li", { class: "job", children: [el("span", { class: "rail", attrs: { "aria-hidden": "true" } }), copy] }));
  });
  panel.append(timeline);
  return panel;
}

function renderCerts(settings, tab) {
  const panel = panelShell(tab);
  panel.append(kicker(tab));
  const rows = el("ul", { class: "rows" });
  certItems(settings).forEach((cert) => {
    const done = Boolean(cert.completed);
    const meta = [cert.issuer, done ? cert.completed : ""].filter(Boolean).join(" · ");
    const copy = el("span", { class: "row-copy" });
    copy.append(el("span", { class: "row-title", text: cert.name }));
    if (meta) copy.append(el("span", { class: "row-meta", text: meta }));
    const pill = el("span", { class: done ? "pill is-done" : "pill", text: done ? "Completed" : "In progress" });
    const inner = [copy, pill];
    let row;
    if (cert.link) {
      row = el("a", {
        class: "row",
        attrs: {
          href: cert.link,
          ...(isExternal(cert.link) ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        },
        children: inner,
      });
      if (isExternal(cert.link)) row.append(el("span", { class: "sr-only", text: "(opens in a new tab)" }));
    } else {
      row = el("div", { class: "row", children: inner });
    }
    rows.append(el("li", { children: [row] }));
  });
  panel.append(rows);
  return panel;
}

function renderProjects(settings, tab) {
  const panel = panelShell(tab);
  panel.append(kicker(tab));
  projectItems(settings).forEach((project) => {
    const card = el("article", { class: "project" });
    if (project.name) card.append(el("h3", { class: "role", text: project.name }));
    if (project.summary) card.append(el("p", { class: "summary", text: project.summary }));
    if (project.tags.length) {
      card.append(el("ul", { class: "chips", children: project.tags.map((tag) => el("li", { text: tag })) }));
    }
    if (project.link) {
      const link = el("a", {
        class: "text-link",
        text: "View project",
        attrs: {
          href: project.link,
          ...(isExternal(project.link) ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        },
      });
      if (isExternal(project.link)) link.append(el("span", { class: "sr-only", text: "(opens in a new tab)" }));
      card.append(link);
    }
    panel.append(card);
  });
  return panel;
}

function renderContact(settings, tab, live) {
  const panel = panelShell(tab);
  panel.append(kicker(tab));
  const contact = settings.contact && typeof settings.contact === "object" ? settings.contact : {};
  const rows = el("div", { class: "rows" });

  const location = text(settings.location);
  if (location) {
    rows.append(el("div", { class: "row contact-row", children: [ICONS.pin(), el("span", { class: "row-title", text: location })] }));
  }

  const email = text(contact.email);
  if (email && /^[^\s<>"]+@[^\s<>"]+$/.test(email)) {
    const hint = el("span", { class: "row-meta", text: "Copy" });
    const button = el("button", {
      class: "row contact-row",
      attrs: { type: "button", "aria-label": `Copy email address ${email}` },
      children: [ICONS.mail(), el("span", { class: "row-copy", children: [el("span", { class: "row-title", text: email }), hint] })],
    });
    button.addEventListener("click", async () => {
      const copied = await copyText(email);
      hint.textContent = copied ? "Copied" : "Could not copy";
      live.textContent = "";
      live.textContent = copied ? "Email address copied" : "Could not copy the email address";
      window.setTimeout(() => {
        if (hint.textContent !== "Copy") hint.textContent = "Copy";
      }, 2000);
    });
    rows.append(button);
  }

  const linkedin = safeHref(contact.linkedin);
  if (linkedin) rows.append(externalRow(ICONS.linkedin(), "LinkedIn", linkedin));
  const github = safeHref(contact.github);
  if (github) rows.append(externalRow(ICONS.github(), "GitHub", github));
  if (rows.childNodes.length) panel.append(rows);

  const actions = el("div", { class: "actions" });
  const buttonText = text(contact.buttonText);
  if (email && buttonText && /^[^\s<>"]+@[^\s<>"]+$/.test(email)) {
    actions.append(
      el("a", {
        class: "btn btn-primary",
        text: buttonText,
        attrs: { href: `mailto:${email}?subject=${encodeURIComponent(buttonText)}` },
      })
    );
  }
  const resume = safeHref(contact.resume);
  if (resume) {
    actions.append(el("a", { class: "btn btn-secondary", text: "Download resume", attrs: { href: resume, download: "" } }));
  }
  if (actions.childNodes.length) panel.append(actions);
  return panel;
}

function externalRow(icon, label, href) {
  return el("a", {
    class: "row contact-row",
    attrs: { href, target: "_blank", rel: "noopener noreferrer" },
    children: [icon, el("span", { class: "row-title", text: label }), el("span", { class: "sr-only", text: "(opens in a new tab)" })],
  });
}

async function copyText(value) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch (error) {
    /* try the older path below */
  }
  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.opacity = "0";
  document.body.append(area);
  area.focus();
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (error) {
    ok = false;
  }
  area.remove();
  return ok;
}

function mountPhoto(wrap, photoLayer, src, name) {
  wrap.append(el("span", { class: "monogram", text: initials(name), attrs: { "aria-hidden": "true" } }));
  const path = safeHref(src);
  if (!path) return;
  const img = new Image();
  img.alt = name ? `Portrait of ${name}` : "Portrait";
  img.width = 92;
  img.height = 92;
  img.decoding = "async";
  img.addEventListener("load", () => {
    const mono = wrap.querySelector(".monogram");
    if (mono) mono.remove();
    wrap.append(img);
    photoLayer.style.backgroundImage = `url("${path.replace(/["\\]/g, "")}")`;
    photoLayer.classList.add("is-on");
  });
  img.src = path;
}

function applyAccent(card, value) {
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(text(value))) {
    card.style.setProperty("--accent", text(value));
  }
}

function boot(settings) {
  const main = document.querySelector("#app");
  const name = text(settings.name);
  const title = text(settings.title);
  const tabs = visibleTabs(settings);
  const live = el("div", { class: "sr-only", attrs: { id: "live", "aria-live": "polite" } });

  const photoLayer = el("div", { class: "card-cover-photo" });
  const avatar = el("div", { class: "avatar-wrap" });
  const nameEl = el("h1", { class: "name", text: name, attrs: name ? { id: "profile-name" } : {} });
  const identity = el("div", { class: "identity" });
  if (name) identity.append(nameEl);
  if (title) identity.append(el("p", { class: "role-title", text: title }));
  const open = text(settings.openToWork);
  if (open) {
    identity.append(
      el("p", {
        class: "status",
        children: [el("span", { class: "dot", attrs: { "aria-hidden": "true" } }), el("span", { class: "status-text", text: open })],
      })
    );
  }

  const header = el("header", {
    class: "card-header",
    children: [
      el("div", { class: "cover-clip", children: [el("div", { class: "card-cover", attrs: { "aria-hidden": "true" }, children: [photoLayer] })] }),
      el("div", { class: "header-main", children: [avatar, identity] }),
    ],
  });

  const body = el("div", { class: "card-body" });
  const panels = {
    about: tabs.some((tab) => tab.id === "about") ? renderAbout(settings, tabs.find((tab) => tab.id === "about")) : null,
    experience: tabs.some((tab) => tab.id === "experience") ? renderExperience(settings, tabs.find((tab) => tab.id === "experience")) : null,
    certifications: tabs.some((tab) => tab.id === "certifications") ? renderCerts(settings, tabs.find((tab) => tab.id === "certifications")) : null,
    projects: tabs.some((tab) => tab.id === "projects") ? renderProjects(settings, tabs.find((tab) => tab.id === "projects")) : null,
    contact: tabs.some((tab) => tab.id === "contact") ? renderContact(settings, tabs.find((tab) => tab.id === "contact"), live) : null,
  };
  tabs.forEach((tab) => {
    panels[tab.id].hidden = true;
    body.append(panels[tab.id]);
  });

  const tablist = el("div", { class: "tablist", attrs: { role: "tablist", "aria-label": "Profile sections", "aria-orientation": "horizontal" } });
  const buttons = tabs.map((tab) => {
    const button = el("button", {
      class: "tab",
      text: tab.label,
      attrs: {
        type: "button",
        role: "tab",
        id: `tab-${tab.id}`,
        "aria-controls": `panel-${tab.id}`,
        "aria-selected": "false",
        tabindex: "-1",
      },
    });
    button.dataset.section = tab.id;
    tablist.append(button);
    return button;
  });

  const card = el("article", { class: "card", children: [header, body, tablist] });
  if (name) card.setAttribute("aria-labelledby", "profile-name");
  applyAccent(card, settings.accent);
  mountPhoto(avatar, photoLayer, settings.photo, name);

  let current = "";
  let flights = [];

  function viewportHeight() {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight;
  }

  function cancelMotion() {
    flights.forEach((anim) => anim.cancel());
    flights = [];
  }

  function bodyLimit(headerHeight) {
    return Math.max(64, viewportHeight() - pagePad() * 2 - headerHeight - tablist.offsetHeight - 2);
  }

  function lockHeights(animate, headerFrom) {
    const bodyFrom = body.getBoundingClientRect().height;
    header.style.height = "auto";
    const headerTo = header.offsetHeight;
    const panel = body.querySelector(".panel:not([hidden])");
    const content = panel ? panel.offsetHeight : 0;
    const bodyTo = Math.min(content, bodyLimit(headerTo));
    body.style.overflowY = content > bodyTo + 1 ? "auto" : "hidden";
    header.style.height = `${headerTo}px`;
    body.style.height = `${bodyTo}px`;
    if (!animate) return;
    if (Math.abs(headerFrom - headerTo) > 1) {
      flights.push(header.animate([{ height: `${headerFrom}px` }, { height: `${headerTo}px` }], { duration: DURATION, easing: EASE }));
    }
    if (Math.abs(bodyFrom - bodyTo) > 1) {
      flights.push(body.animate([{ height: `${bodyFrom}px` }, { height: `${bodyTo}px` }], { duration: DURATION, easing: EASE }));
    }
  }

  function playAvatar(first) {
    const last = avatar.getBoundingClientRect();
    if (!first.width || !last.width) return;
    const dx = first.left + first.width / 2 - (last.left + last.width / 2);
    const dy = first.top + first.height / 2 - (last.top + last.height / 2);
    const scale = first.width / last.width;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(scale - 1) < 0.01) return;
    flights.push(
      avatar.animate(
        [{ transform: `translate(${dx}px, ${dy}px) scale(${scale})` }, { transform: "none" }],
        { duration: DURATION, easing: EASE }
      )
    );
  }

  function select(id, options) {
    const tab = tabs.find((item) => item.id === id);
    if (!tab || !panels[id]) return;
    const animate = Boolean(options.animate && motionOK() && current);
    const wasCompact = card.classList.contains("is-compact");
    const willCompact = id !== "about";
    cancelMotion();

    const headerFrom = header.getBoundingClientRect().height;
    const avatarFrom = willCompact !== wasCompact ? avatar.getBoundingClientRect() : null;

    card.classList.toggle("is-compact", willCompact);
    tabs.forEach((item) => {
      const on = item.id === id;
      panels[item.id].hidden = !on;
      panels[item.id].classList.toggle("is-active", on);
    });
    buttons.forEach((button) => {
      const on = button.dataset.section === id;
      button.setAttribute("aria-selected", on ? "true" : "false");
      button.tabIndex = on ? 0 : -1;
      if (on && options.focus) button.focus();
    });

    lockHeights(animate, headerFrom);
    if (animate && avatarFrom) {
      playAvatar(avatarFrom);
      flights.push(
        identity.animate(
          [
            { opacity: 0, offset: 0 },
            { opacity: 0, offset: 0.4 },
            { opacity: 1, offset: 1 },
          ],
          { duration: DURATION, easing: "ease-out" }
        )
      );
    }

    current = id;
    const hash = `#${tab.hash}`;
    if (options.history === "push" && location.hash !== hash) history.pushState(null, "", hash);
    if (options.history === "replace" && location.hash !== hash) history.replaceState(null, "", hash);
    document.title = id === "about" && title ? `${name || "Portfolio"} — ${title}` : `${name || "Portfolio"} — ${tab.label}`;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => select(button.dataset.section, { animate: true, history: "push" }));
  });

  tablist.addEventListener("keydown", (event) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const index = buttons.indexOf(document.activeElement);
    if (index === -1) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
    if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = buttons.length - 1;
    select(buttons[next].dataset.section, { animate: true, history: "push", focus: true });
  });

  window.addEventListener("hashchange", () => {
    const id = HASH_TO_ID[(location.hash || "").replace("#", "").toLowerCase()];
    if (id) select(id, { animate: true, history: "none" });
  });

  let resizeTick = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeTick);
    resizeTick = requestAnimationFrame(() => {
      if (current) select(current, { animate: false, history: "none" });
    });
  });

  card.style.visibility = "hidden";
  main.replaceChildren(card);
  document.body.append(live);

  const requested = HASH_TO_ID[(location.hash || "").replace("#", "").toLowerCase()];
  const start = tabs.some((tab) => tab.id === requested) ? requested : tabs[0] && tabs[0].id;
  if (start) select(start, { animate: false, history: "replace" });
  card.style.visibility = "";
  requestAnimationFrame(() => card.classList.add("is-ready"));

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (current) select(current, { animate: false, history: "none" });
    });
  }
}

function start() {
  if (typeof SETTINGS === "undefined" || !SETTINGS || typeof SETTINGS !== "object" || Array.isArray(SETTINGS)) {
    showBoot(SETTINGS_ERROR);
    return;
  }
  try {
    boot(SETTINGS);
  } catch (error) {
    console.error(error);
    showBoot("Something went wrong while building the card. Press F12, then open Console, to see the error.");
  }
}

start();
