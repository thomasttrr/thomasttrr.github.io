"use strict";

const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const DURATION = 280;
// The contact form unfolds over 450ms and the card grows on the same clock.
const FORM_DURATION = 450;
const FORM_ENDPOINT = "https://api.web3forms.com/submit";
const SEND_TIMEOUT = 15000;
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

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function pagePad() {
  const n = parseFloat(cssVar("--page-pad"));
  return Number.isFinite(n) ? n : 16;
}

// Which of the three layouts is on screen: "split" (wide), "card"
// (tablet-ish) or "flow" (phones, short or zoomed windows). styles.css owns
// the breakpoints and sets --layout in each @media block, so the script
// never repeats a media query.
function layoutMode() {
  const mode = cssVar("--layout");
  return mode === "split" || mode === "flow" ? mode : "card";
}

// Typed example hints: type, pause, wipe, next example. They run only while
// the form is open, and hold still on the full example while a field is
// focused, resuming on blur only if the visitor left the field empty.
function typedHints(input, phrases) {
  const idle = { start() {}, stop() {} };
  if (!input || !phrases.length) return idle;
  input.setAttribute("placeholder", phrases[0]);
  if (!motionOK()) return idle;
  let phrase = 0;
  let chars = 0;
  let deleting = false;
  let timer = 0;
  let running = false;
  const tick = () => {
    const current = phrases[phrase];
    if (!deleting) {
      chars += 1;
      input.setAttribute("placeholder", current.slice(0, chars));
      if (chars === current.length) {
        deleting = true;
        timer = window.setTimeout(tick, 1235);
        return;
      }
      timer = window.setTimeout(tick, 36);
    } else {
      chars -= 1;
      input.setAttribute("placeholder", current.slice(0, chars));
      if (chars === 0) {
        deleting = false;
        phrase = (phrase + 1) % phrases.length;
        timer = window.setTimeout(tick, 230);
        return;
      }
      timer = window.setTimeout(tick, 16);
    }
  };
  const restart = () => {
    window.clearTimeout(timer);
    chars = 0;
    deleting = false;
    tick();
  };
  input.addEventListener("focus", () => {
    window.clearTimeout(timer);
    input.setAttribute("placeholder", phrases[phrase]);
  });
  input.addEventListener("blur", () => {
    if (running && !input.value) restart();
  });
  return {
    start() {
      running = true;
      if (document.activeElement === input || input.value) return;
      restart();
    },
    stop() {
      running = false;
      window.clearTimeout(timer);
      input.setAttribute("placeholder", phrases[phrase]);
    },
  };
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

// The last path part of a profile URL, e.g. "thomasttrr" from
// https://github.com/thomasttrr — shown as a quiet hint on the row.
function handle(href) {
  try {
    const parts = new URL(href).pathname.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "";
  } catch (error) {
    return "";
  }
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
  external: () => svg('<path d="M7 17 17 7"/><path d="M8.5 7H17v8.5"/>'),
  arrow: () => svg('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
  check: () => svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  alert: () => svg('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><path d="M12 16.5v.01"/>'),
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

function contactOf(settings) {
  return settings.contact && typeof settings.contact === "object" ? settings.contact : {};
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
    .map((item) => {
      const dates = text(item.dates);
      return {
        dates,
        // "2020 – Now" style ranges mark the job held today.
        current: /\b(now|present|current)\b/i.test(dates),
        role: text(item.role),
        company: text(item.company),
        summary: text(item.summary),
      };
    })
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
  const contact = contactOf(settings);
  const ready = {
    about: strings(settings.about).length > 0 || skillGroups(settings).length > 0 || educationItems(settings).length > 0,
    experience: experienceItems(settings).length > 0,
    certifications: certItems(settings).length > 0,
    projects: projectItems(settings).length > 0,
    contact: Boolean(text(settings.location) || text(contact.formKey) || text(contact.linkedin) || text(contact.github) || text(contact.resume)),
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

// Items marked .stagger fade up one after another when their panel opens.
function numberStagger(panel) {
  panel.querySelectorAll(".stagger").forEach((node, index) => node.style.setProperty("--i", String(Math.min(index, 7))));
  return panel;
}

function newTab(href) {
  return isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

function newTabNote(href) {
  return isExternal(href) ? el("span", { class: "sr-only", text: " (opens in a new tab)" }) : null;
}

function renderSkills(groups) {
  if (!groups.length) return null;
  if (groups.length === 1 && !groups[0].group) {
    return el("ul", {
      class: "chips stagger",
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
      const block = el("div", { class: "skill-group stagger" });
      if (group.group) {
        block.append(el("h3", { class: "skill-label", text: group.group, attrs: { id: headingId } }));
      }
      block.append(chips);
      return block;
    }),
  });
}

function renderAbout(settings, tab, ctx) {
  const panel = panelShell(tab);
  panel.append(kicker(tab));
  const prose = el("div", { class: "prose" });
  // The first paragraph is the lede: one size up, so the pitch reads first.
  strings(settings.about).forEach((paragraph, index) =>
    prose.append(el("p", { class: index === 0 ? "lede stagger" : "stagger", text: paragraph }))
  );
  if (prose.childNodes.length) panel.append(prose);

  const skills = renderSkills(skillGroups(settings));
  if (skills) panel.append(skills);

  const school = educationItems(settings);
  if (school.length) {
    const block = el("div", { class: "education stagger" });
    block.append(el("h3", { class: "skill-label", text: "Education" }));
    school.forEach((item) => {
      block.append(el("p", { class: "degree", text: item.name }));
      if (item.meta) block.append(el("p", { class: "school", text: item.meta }));
    });
    panel.append(block);
  }

  // Next steps after reading: open the contact form, or see the code.
  const next = el("div", { class: "next-steps stagger" });
  if (ctx.canMessage) {
    const message = el("button", {
      class: "btn btn-primary",
      attrs: { type: "button" },
      children: [el("span", { text: "Send a message" }), ICONS.arrow()],
    });
    // detail is 0 for keyboard-triggered clicks: those move focus into the
    // form; pointer clicks leave the on-screen keyboard closed on phones.
    message.addEventListener("click", (event) => ctx.messageMe(event.detail === 0));
    next.append(message);
  }
  const github = safeHref(contactOf(settings).github);
  if (github) {
    next.append(
      el("a", {
        class: "btn btn-secondary",
        attrs: { href: github, ...newTab(github) },
        children: [ICONS.github(), el("span", { text: "GitHub" }), newTabNote(github)],
      })
    );
  }
  if (next.childNodes.length) panel.append(next);
  return numberStagger(panel);
}

function renderExperience(settings, tab) {
  const panel = panelShell(tab);
  panel.append(kicker(tab));
  const timeline = el("ol", { class: "timeline" });
  experienceItems(settings).forEach((job) => {
    const copy = el("div", { class: "job-copy" });
    if (job.dates) copy.append(el("p", { class: "when", text: job.dates }));
    copy.append(el("h3", { class: "role", text: job.role || job.company }));
    if (job.role && job.company) copy.append(el("p", { class: "company", text: job.company }));
    if (job.summary) copy.append(el("p", { class: "summary", text: job.summary }));
    timeline.append(
      el("li", {
        class: job.current ? "job is-current stagger" : "job stagger",
        children: [el("span", { class: "rail", attrs: { "aria-hidden": "true" } }), copy],
      })
    );
  });
  panel.append(timeline);
  return numberStagger(panel);
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
    const pill = el("span", {
      class: done ? "pill is-done" : "pill",
      children: [done ? ICONS.check() : null, document.createTextNode(done ? "Completed" : "In progress")],
    });
    let row;
    if (cert.link) {
      row = el("a", {
        class: "row",
        attrs: { href: cert.link, ...newTab(cert.link) },
        children: [copy, pill, el("span", { class: "row-arrow", children: [ICONS.external()] }), newTabNote(cert.link)],
      });
    } else {
      row = el("div", { class: "row", children: [copy, pill] });
    }
    rows.append(el("li", { class: "stagger", children: [row] }));
  });
  panel.append(rows);
  return numberStagger(panel);
}

function renderProjects(settings, tab) {
  const panel = panelShell(tab);
  panel.append(kicker(tab));
  const stack = el("div", { class: "projects" });
  projectItems(settings).forEach((project) => {
    const card = el("article", { class: "project stagger" });
    const head = el("div", { class: "project-head" });
    if (project.name) head.append(el("h3", { class: "role", text: project.name }));
    if (project.link) {
      head.append(
        el("a", {
          class: "text-link",
          attrs: { href: project.link, ...newTab(project.link) },
          children: [
            document.createTextNode("View project"),
            project.name ? el("span", { class: "sr-only", text: `: ${project.name}` }) : null,
            ICONS.external(),
            newTabNote(project.link),
          ],
        })
      );
    }
    card.append(head);
    if (project.summary) card.append(el("p", { class: "summary", text: project.summary }));
    if (project.tags.length) {
      card.append(
        el("ul", {
          class: "chips tags",
          attrs: { "aria-label": "Built with" },
          children: project.tags.map((tag) => el("li", { text: tag })),
        })
      );
    }
    stack.append(card);
  });
  panel.append(stack);
  return numberStagger(panel);
}

function externalRow(icon, label, href) {
  const hint = handle(href);
  return el("a", {
    class: "row contact-row stagger",
    attrs: { href, ...newTab(href) },
    children: [
      icon,
      el("span", { class: "row-title", text: label }),
      hint ? el("span", { class: "row-meta row-meta-side", text: hint }) : null,
      el("span", { class: hint ? "row-arrow" : "row-arrow row-arrow-end", children: [ICONS.external()] }),
      newTabNote(href),
    ],
  });
}

function renderContact(settings, tab, ctx) {
  const panel = panelShell(tab);
  panel.append(kicker(tab));
  const contact = contactOf(settings);
  const rows = el("div", { class: "rows" });

  // Location is information, not a button, so it is drawn as a quiet line
  // rather than in the same box as the rows you can click.
  const place = text(settings.location);
  if (place) {
    rows.append(el("p", { class: "row row-static stagger", children: [ICONS.pin(), el("span", { class: "row-title", text: place })] }));
  }

  const formKey = text(contact.formKey);
  let emailNodes = null;
  if (formKey) {
    // The slim Email bar, last in the list: tapping it smoothly expands
    // the contact form downward. Messages are delivered by Web3Forms;
    // the real email address never appears in this site's code.
    const bar = el("button", {
      class: "row contact-row email-bar stagger",
      attrs: { type: "button", "aria-expanded": "false", "aria-controls": "contact-form-wrap", "aria-label": "Email: open the contact form" },
      children: [
        ICONS.mail(),
        el("span", { class: "row-title", text: "Email" }),
        el("span", {
          class: "row-meta row-meta-side",
          children: [el("span", { class: "on-touch", text: "Tap to send" }), el("span", { class: "on-mouse", text: "Click to send" })],
        }),
        el("span", { class: "row-chev", attrs: { "aria-hidden": "true" } }),
      ],
    });
    const form = el("form", { class: "contact-form", attrs: { action: FORM_ENDPOINT, method: "POST" } });
    const field = (labelText, control) =>
      el("label", { class: "field", children: [el("span", { class: "field-label", text: labelText }), control] });
    const nameInput = el("input", { attrs: { type: "text", name: "name", autocomplete: "name", required: "" } });
    const emailInput = el("input", { attrs: { type: "email", name: "email", autocomplete: "email", required: "", spellcheck: "false" } });
    const messageInput = el("textarea", { attrs: { name: "message", rows: "4", required: "" } });
    const sendLabel = el("span", { text: "Send message" });
    const sendButton = el("button", { class: "btn btn-primary", attrs: { type: "submit" }, children: [sendLabel] });
    const status = el("p", { class: "form-status", attrs: { role: "status" } });
    form.append(
      el("input", { attrs: { type: "hidden", name: "access_key", value: formKey } }),
      el("input", { attrs: { type: "hidden", name: "subject", value: "New message from your portfolio site" } }),
      el("input", { attrs: { type: "checkbox", name: "botcheck", tabindex: "-1", style: "display: none;" } }),
      field("Your name", nameInput),
      field("Your email", emailInput),
      field("Message", messageInput),
      sendButton,
      status
    );
    const hints = [
      typedHints(nameInput, ["Jane Smith", "Alex Johnson", "Maria Garcia", "David Kim"]),
      typedHints(emailInput, ["jane@company.com", "alex@studio.com", "maria@agency.com", "david@corp.com"]),
      typedHints(messageInput, ["Tell me about the role or project", "We have a role you might fit", "I have a project to discuss"]),
    ];

    const setStatus = (kind, message) => {
      status.className = kind ? `form-status is-${kind}` : "form-status";
      status.replaceChildren();
      if (!message) return;
      status.append(kind === "success" ? ICONS.check() : ICONS.alert(), el("span", { text: message }));
    };

    let sending = false;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (sending) return;
      sending = true;
      // aria-disabled rather than disabled, so focus stays on the button.
      sendButton.setAttribute("aria-disabled", "true");
      form.classList.add("is-sending");
      sendLabel.textContent = "Sending…";
      setStatus("", "");
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), SEND_TIMEOUT);
      try {
        const response = await fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), signal: controller.signal });
        const data = await response.json().catch(() => null);
        if (data && data.success) {
          form.reset();
          hints.forEach((hint) => hint.start());
          setStatus("success", "Message sent — thank you. I'll get back to you soon.");
        } else {
          setStatus("error", "Something went wrong — please try again.");
        }
      } catch (error) {
        setStatus(
          "error",
          error && error.name === "AbortError"
            ? "This is taking too long — check your connection and try again."
            : "Could not send — check your connection and try again."
        );
      }
      window.clearTimeout(timer);
      sending = false;
      sendButton.removeAttribute("aria-disabled");
      form.classList.remove("is-sending");
      sendLabel.textContent = "Send message";
      // The status line changes the panel height; let the card follow.
      ctx.fit({ animate: true });
    });

    const wrap = el("div", { class: "form-collapse", attrs: { id: "contact-form-wrap" }, children: [form] });
    let revealTimer = 0;
    const setOpen = (open, options = {}) => {
      const isOpen = wrap.classList.contains("is-open");
      if (open !== isOpen) {
        bar.setAttribute("aria-expanded", open ? "true" : "false");
        // Measure the card in the target state with the transition off,
        // then restore and toggle for real, so the wrap's CSS transition
        // unfolds the form while the card height follows on the same clock.
        wrap.classList.add("no-anim");
        wrap.classList.toggle("is-open", open);
        ctx.fit({ animate: true, duration: FORM_DURATION });
        wrap.classList.toggle("is-open", !open);
        void wrap.offsetHeight;
        wrap.classList.remove("no-anim");
        wrap.classList.toggle("is-open", open);
        hints.forEach((hint) => (open ? hint.start() : hint.stop()));
        if (!open && wrap.contains(document.activeElement)) bar.focus();
      }
      window.clearTimeout(revealTimer);
      if (!open) return;
      if (options.focus === "field") nameInput.focus({ preventScroll: true });
      if (options.focus === "bar") bar.focus({ preventScroll: true });
      // Once unfolded, bring the form into view if it opened below the fold.
      revealTimer = window.setTimeout(
        () => wrap.scrollIntoView({ block: "nearest", behavior: motionOK() ? "smooth" : "auto" }),
        motionOK() ? FORM_DURATION : 0
      );
    };
    bar.addEventListener("click", () => setOpen(!wrap.classList.contains("is-open")));
    ctx.openForm = (options) => setOpen(true, options);
    emailNodes = [bar, wrap];
  }

  const linkedin = safeHref(contact.linkedin);
  if (linkedin) rows.append(externalRow(ICONS.linkedin(), "LinkedIn", linkedin));
  const github = safeHref(contact.github);
  if (github) rows.append(externalRow(ICONS.github(), "GitHub", github));
  // The Email bar goes last, under GitHub, so expanding the form pushes
  // nothing else out of the way.
  if (emailNodes) rows.append(...emailNodes);
  if (rows.childNodes.length) panel.append(rows);

  // Printed pages cannot use the form, so print says where to find it.
  if (formKey) {
    const here = `${location.host}${location.pathname}#contact`.replace(/^www\./, "");
    panel.append(el("p", { class: "print-only", text: `To send a message, use the form at ${here}` }));
  }

  const actions = el("div", { class: "actions" });
  const resume = safeHref(contact.resume);
  if (resume) {
    actions.append(el("a", { class: "btn btn-secondary", text: "Download resume", attrs: { href: resume, download: "" } }));
  }
  if (actions.childNodes.length) panel.append(actions);
  return numberStagger(panel);
}

function mountPhoto(wrap, photoLayer, src, name) {
  wrap.append(el("span", { class: "monogram", text: initials(name), attrs: { "aria-hidden": "true" } }));
  const path = safeHref(src);
  if (!path) return;
  const img = new Image();
  img.alt = name ? `Portrait of ${name}` : "Portrait";
  img.width = 96;
  img.height = 96;
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

// Search engines read this description of the person, built from the same
// settings as the page. No email address, ever.
function addStructuredData(settings) {
  const contact = contactOf(settings);
  const photo = safeHref(settings.photo);
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: text(settings.name) || undefined,
    description: text(settings.title) || undefined,
    url: `${location.origin}${location.pathname}`,
    image: photo ? new URL(photo, location.href).href : undefined,
    homeLocation: text(settings.location) ? { "@type": "Place", name: text(settings.location) } : undefined,
    sameAs: [safeHref(contact.github), safeHref(contact.linkedin)].filter(isExternal),
    knowsAbout: skillGroups(settings).flatMap((group) => group.items),
  };
  document.head.append(el("script", { text: JSON.stringify(data), attrs: { type: "application/ld+json" } }));
}

function boot(settings) {
  const main = document.querySelector("#app");
  const name = text(settings.name);
  const title = text(settings.title);
  const place = text(settings.location);
  const tabs = visibleTabs(settings);
  const ctx = {
    canMessage: Boolean(text(contactOf(settings).formKey)) && tabs.some((tab) => tab.id === "contact"),
    fit: () => {},
    openForm: null,
    messageMe: () => {},
  };

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
  // Shown under the status in the wide layout only; Contact lists it too.
  if (place) identity.append(el("p", { class: "where", children: [ICONS.pin(), el("span", { text: place })] }));

  const header = el("header", {
    class: "card-header",
    children: [
      el("div", { class: "cover-clip", children: [el("div", { class: "card-cover", attrs: { "aria-hidden": "true" }, children: [photoLayer] })] }),
      el("div", { class: "header-main", children: [avatar, identity] }),
    ],
  });

  const body = el("div", { class: "card-body" });
  const renderers = {
    about: renderAbout,
    experience: renderExperience,
    certifications: renderCerts,
    projects: renderProjects,
    contact: renderContact,
  };
  const panels = {};
  tabs.forEach((tab) => {
    panels[tab.id] = renderers[tab.id](settings, tab, ctx);
    panels[tab.id].hidden = true;
    body.append(panels[tab.id]);
  });

  const indicator = el("span", { class: "tab-indicator", attrs: { "aria-hidden": "true" } });
  const tablist = el("div", {
    class: "tablist",
    attrs: { role: "tablist", "aria-label": "Profile sections" },
    children: [indicator],
  });
  const buttons = tabs.map((tab) => {
    const button = el("button", {
      class: "tab",
      attrs: {
        type: "button",
        role: "tab",
        id: `tab-${tab.id}`,
        "aria-controls": `panel-${tab.id}`,
        "aria-selected": "false",
        tabindex: "-1",
      },
      children: [
        el("span", { class: "tab-num", text: tab.number, attrs: { "aria-hidden": "true" } }),
        el("span", { class: "tab-label", text: tab.label }),
      ],
    });
    button.dataset.section = tab.id;
    tablist.append(button);
    return button;
  });

  // DOM order is header → tabs → panels, so keyboard and screen reader
  // users meet the tabs before the panel they control (the ARIA tabs
  // pattern). CSS still draws the tab bar under the panel on small screens.
  const card = el("article", { class: "card", children: [header, tablist, body] });
  if (name) card.setAttribute("aria-labelledby", "profile-name");
  applyAccent(card, settings.accent);
  mountPhoto(avatar, photoLayer, settings.photo, name);

  let current = "";
  let mode = layoutMode();
  let flights = [];
  let heightFlights = [];

  function viewportHeight() {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight;
  }

  function cancelMotion() {
    flights.forEach((anim) => anim.cancel());
    flights = [];
  }

  // A soft fade at the bottom edge of the panel while more is below.
  function updateScrollHint() {
    const more = mode !== "flow" && body.scrollHeight - body.clientHeight - body.scrollTop > 2;
    body.classList.toggle("has-more", more);
  }

  // Size the card body to its panel, within the screen. In the card and
  // split layouts the body height is locked in px (animated between tabs);
  // in the flow layout the page simply scrolls, so the locks come off.
  function fit(options = {}) {
    const bodyFrom = body.getBoundingClientRect().height;
    const headerFrom = options.headerFrom != null ? options.headerFrom : header.getBoundingClientRect().height;
    heightFlights.forEach((anim) => anim.cancel());
    heightFlights = [];
    if (mode === "flow") {
      header.style.height = "";
      body.style.height = "";
      body.style.overflowY = "";
      updateScrollHint();
      return;
    }
    header.style.height = "auto";
    const headerTo = header.offsetHeight;
    const panel = body.querySelector(".panel:not([hidden])");
    const content = panel ? panel.offsetHeight : 0;
    let floor = 0;
    let limit;
    if (mode === "split") {
      // Header and tabs share the left column; the body spans the right
      // one and is never shorter than that column.
      floor = headerTo + tablist.offsetHeight;
      limit = viewportHeight() - (main.getBoundingClientRect().top + window.scrollY) - pagePad() - 2;
    } else {
      limit = viewportHeight() - pagePad() * 2 - headerTo - tablist.offsetHeight - 2;
    }
    const bodyTo = Math.max(floor, Math.min(content, Math.max(64, limit)));
    body.style.overflowY = content > bodyTo + 1 ? "auto" : "hidden";
    header.style.height = `${headerTo}px`;
    body.style.height = `${bodyTo}px`;
    updateScrollHint();
    if (!options.animate || !motionOK()) return;
    const duration = options.duration || DURATION;
    if (Math.abs(headerFrom - headerTo) > 1) {
      heightFlights.push(header.animate([{ height: `${headerFrom}px` }, { height: `${headerTo}px` }], { duration, easing: EASE }));
    }
    if (Math.abs(bodyFrom - bodyTo) > 1) {
      const anim = body.animate([{ height: `${bodyFrom}px` }, { height: `${bodyTo}px` }], { duration, easing: EASE });
      anim.addEventListener("finish", updateScrollHint);
      heightFlights.push(anim);
    }
  }
  ctx.fit = fit;

  // The tab highlight glides to the selected tab: under it in the tab bar,
  // beside it in the wide layout's side nav.
  function placeIndicator(animate) {
    const active = buttons.find((button) => button.getAttribute("aria-selected") === "true");
    if (!active) return;
    indicator.classList.toggle("no-anim", !animate);
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.height = `${active.offsetHeight}px`;
    indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    if (!animate) {
      void indicator.offsetWidth;
      indicator.classList.remove("no-anim");
    }
  }

  function playAvatar(first) {
    const last = avatar.getBoundingClientRect();
    if (!first.width || !last.width) return false;
    const dx = first.left + first.width / 2 - (last.left + last.width / 2);
    const dy = first.top + first.height / 2 - (last.top + last.height / 2);
    const scale = first.width / last.width;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(scale - 1) < 0.01) return false;
    flights.push(
      avatar.animate(
        [{ transform: `translate(${dx}px, ${dy}px) scale(${scale})` }, { transform: "none" }],
        { duration: DURATION, easing: EASE }
      )
    );
    return true;
  }

  // Panels slide in from the side you moved toward (right for a later tab,
  // left for an earlier one); their items follow in a short stagger.
  function enter(panel, direction) {
    panel.style.setProperty("--enter-x", `${direction * 14}px`);
    panel.classList.remove("is-entering");
    void panel.offsetWidth;
    panel.classList.add("is-entering");
  }

  function select(id, options) {
    const tab = tabs.find((item) => item.id === id);
    if (!tab || !panels[id]) return;
    mode = layoutMode();
    const changed = current !== id;
    const animate = Boolean(options.animate && motionOK() && current && changed);
    const fromIndex = tabs.findIndex((item) => item.id === current);
    const toIndex = tabs.findIndex((item) => item.id === id);
    cancelMotion();

    const headerFrom = header.getBoundingClientRect().height;
    const avatarFrom = avatar.getBoundingClientRect();

    // The big centred header belongs to About in the card layout; other
    // tabs, and every tab on phones, use the compact one.
    card.classList.toggle("is-compact", mode === "flow" || (mode === "card" && id !== "about"));
    tabs.forEach((item) => {
      const on = item.id === id;
      panels[item.id].hidden = !on;
      panels[item.id].tabIndex = on ? 0 : -1;
      if (!on) panels[item.id].classList.remove("is-entering");
    });
    buttons.forEach((button) => {
      const on = button.dataset.section === id;
      button.setAttribute("aria-selected", on ? "true" : "false");
      button.tabIndex = on ? 0 : -1;
      if (on && options.focus) button.focus();
    });
    tablist.setAttribute("aria-orientation", mode === "split" ? "vertical" : "horizontal");

    // On phones the page itself scrolls; a new tab starts at its top.
    if (mode === "flow" && changed && current && window.scrollY > 0) window.scrollTo(0, 0);
    if (changed) body.scrollTop = 0;

    fit({ animate, headerFrom });
    placeIndicator(animate);
    if (animate) {
      if (playAvatar(avatarFrom)) {
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
      enter(panels[id], toIndex > fromIndex ? 1 : -1);
    }

    current = id;
    const hash = `#${tab.hash}`;
    if (options.history === "push" && location.hash !== hash) history.pushState(null, "", hash);
    if (options.history === "replace" && location.hash !== hash) history.replaceState(null, "", hash);
    document.title = id === "about" && title ? `${name || "Portfolio"} — ${title}` : `${name || "Portfolio"} — ${tab.label}`;
  }

  ctx.messageMe = (viaKeyboard) => {
    select("contact", { animate: true, history: "push" });
    if (ctx.openForm) ctx.openForm({ focus: viaKeyboard ? "field" : "bar" });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => select(button.dataset.section, { animate: true, history: "push" }));
  });

  tablist.addEventListener("keydown", (event) => {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const index = buttons.indexOf(document.activeElement);
    if (index === -1) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % buttons.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + buttons.length) % buttons.length;
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

  body.addEventListener("scroll", updateScrollHint, { passive: true });

  // A soft light follows the pointer across clickable rows (mouse only).
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    card.addEventListener("pointermove", (event) => {
      const surface = event.target.closest("a.row, button.row");
      if (!surface) return;
      const box = surface.getBoundingClientRect();
      surface.style.setProperty("--mx", `${Math.round(event.clientX - box.left)}px`);
      surface.style.setProperty("--my", `${Math.round(event.clientY - box.top)}px`);
    });
  }

  card.style.visibility = "hidden";
  main.replaceChildren(card);

  const requested = HASH_TO_ID[(location.hash || "").replace("#", "").toLowerCase()];
  const start = tabs.some((tab) => tab.id === requested) ? requested : tabs[0] && tabs[0].id;
  if (start) select(start, { animate: false, history: "replace" });
  card.style.visibility = "";
  if (motionOK()) {
    card.classList.add("is-intro");
    if (start) enter(panels[start], 0);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (current) select(current, { animate: false, history: "none" });
    });
  }
  addStructuredData(settings);
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
