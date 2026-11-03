// YOUR PORTFOLIO
//
// This is the only file you need to edit for your content.
//
// How to edit:
// - Change the words inside the quotes.
// - To hide something, leave it empty ("" or []) or delete that line.
// - A skills group disappears when its items list is empty ([]).
// - A tab disappears when its section has nothing to show.
// - Items show in the order you list them.
// - Keep a comma between items. A comma after the last item is fine.
// - Save this file, then refresh the page.
//
// Your phone number is not in this file on purpose. Leave it that way.
// Link previews (LinkedIn, iMessage, Slack) are the exception: those few
// lines live at the top of index.html, in the block marked LINK PREVIEW.

const SETTINGS = {
  name: "Thomas Tucker",
  title: "AI Operations · Data Quality",
  location: "Sanford, FL (Orlando area)",

  // Your portrait. A missing file falls back to the TT monogram.
  // portrait.jpg is a small square crop of IMG_1944-EDIT.jpg (the original
  // is kept in assets/). A square photo about 320px wide works best.
  photo: "assets/portrait.jpg",

  // Leave empty ("") to hide the green status pill.
  openToWork: "Open to AI Trainer & Data Quality roles",

  about: [
    "Since 2018, my job has been checking work before it ships: print files, machines, and consumer tech. I catch errors early, follow specs exactly, train teammates, and help automate the work.",

    "Now I want to do the same work for AI: rate answers, spot wrong facts, and follow scoring guides the same way every time. I build AI tools in my own time, and I’m currently taking Google and DeepLearning.AI courses.",
  ],

  skills: [
    {
      group: "AI",
      items: [
        "Prompting",
        "Model Output Evaluation",
        "Fact-Checking AI Output",
        "Data Quality Review",
        "AI Applications",
      ],
    },
    { group: "Development", items: ["Rust", "TypeScript", "React", "Next.js"] },
    {
      group: "Operations",
      items: [
        "Quality Control",
        "Workflow Automation",
        "Troubleshooting",
        "Technical Training",
        "Client Communication",
      ],
    },
    { group: "Tools", items: ["Photoshop", "Illustrator", "HTML & CSS", "JavaScript", "Python"] },
  ],

  // Newest job first.
  experience: [
    {
      dates: "2020 – Now",
      role: "Production Print Specialist",
      company: "Online Labels",
      summary: "Fix digital print files in Photoshop and Illustrator before they reach the press. Help automate workflows so errors get caught earlier.",
    },
    {
      dates: "2019 – 2020",
      role: "Electronics & Technology Specialist",
      company: "Target",
      summary: "Promoted to Technical Trainer within two months and trained four new teammates on electronics, systems, and inventory.",
    },
    {
      dates: "2018 – 2019",
      role: "Press Machine Operator",
      company: "HM Golf Products",
      summary: "Troubleshot production machinery to limit downtime, and held quality-control standards on the line.",
    },
  ],

  // Leave completed empty while you are still taking the course.
  // When you finish, set completed to the month, for example "Oct 2026",
  // and replace link with your certificate link.
  certifications: [
    {
      name: "Google AI Essentials",
      issuer: "Google",
      completed: "",
      link: "https://grow.google/ai-essentials/",
    },
    {
      name: "AI for Everyone",
      issuer: "DeepLearning.AI",
      completed: "",
      link: "https://www.coursera.org/learn/ai-for-everyone",
    },
    {
      name: "Generative AI for Everyone",
      issuer: "DeepLearning.AI",
      completed: "",
      link: "https://www.coursera.org/learn/generative-ai-for-everyone",
    },
  ],

  education: [
    {
      name: "Associate Degree, Information & Technology",
      school: "",
      year: "",
    },
  ],

  // The Projects tab appears when you add one. Copy this shape:
  // {
  //   name: "Prompt checklist",
  //   summary: "A short checklist I use to review AI answers before they go out.",
  //   link: "",
  //   tags: ["Prompting", "Quality"],
  // },
  projects: [
    {
      name: "PrintOpti",
      summary:
        "Rust tool I built for print production. Paste in a production schedule and it plans the best cardstock use and makes the pull sheet. The web version runs fully in the browser — nothing is uploaded.",
      link: "",
      tags: ["Rust", "WebAssembly", "JavaScript", "Workflow Automation"],
    },
    {
      name: "HQ Board",
      summary:
        "One screen that shows the true state of all my projects, and what needs me first. Passcode-protected, in plain words.",
      link: "",
      tags: ["Next.js", "TypeScript", "React"],
    },
    {
      name: "AI Deal Tray",
      summary:
        "Windows tool that compares AI models by real value, not headline price. It checks live prices, applies quality gates first, and shows the cost per job.",
      link: "",
      tags: ["Python", "PySide6", "AI Applications"],
    },
    {
      name: "WuWa Today",
      summary:
        "Guide and tier-list site for a popular game, built and run by me. All data is checked against two sources before it goes up, and pages update on a set schedule.",
      link: "",
      tags: ["Next.js", "TypeScript", "Data Verification"],
    },
    {
      name: "StarDiveMeta",
      summary:
        "Tier-list site for a mobile game. Every ranking is backed by evidence from several sources, kept one tap away so readers can check it themselves.",
      link: "",
      tags: ["Data Quality", "Research", "Web App"],
    },
    {
      name: "LogMyMoto",
      summary: "An app for logging motorcycle rides — trips and stops kept in one place.",
      link: "",
      tags: ["Ride Logging"],
    },
  ],

  contact: {
    // The contact form is delivered by Web3Forms, which forwards messages
    // to the inbox. This key is a public label for the form, not a
    // password. The real email address is intentionally not written
    // anywhere in this site's code.
    formKey: "a65fe5d5-e64a-41ea-aa1e-ee1643a657c7",
    linkedin: "",
    github: "https://github.com/thomasttrr",
    // After you export a resume with the phone number removed, save it as
    // assets/Thomas-Tucker-Resume.pdf and set this to that path.
    resume: "",
  },

  tabs: {
    about: "About",
    experience: "Work",
    certifications: "Certs",
    projects: "Projects",
    contact: "Contact",
  },

  // Tab underline and focus outline. Use a light color, for example "#7dd3fc".
  accent: "#ffffff",
};
