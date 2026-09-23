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
  photo: "assets/IMG_1944-EDIT.jpg",

  // Leave empty ("") to hide the green status pill.
  openToWork: "Open to AI operations roles",

  about: [
    "Since 2018 I’ve worked in fast-paced production environments troubleshooting machines, consumer tech, and digital print files. I’ve trained teammates and helped automate workflows, always with a focus on getting the output right the first time.",

    "Now I’m applying that same quality-first mindset to AI — evaluating model outputs, writing clear prompts, and helping teams use AI tools reliably. Currently completing Google AI Essentials and DeepLearning.AI certifications.", 
  ],

  skills: [
    { group: "AI", items: ["Prompting", "AI Applications"] },
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
      summary: "Resolve digital print-file issues in Photoshop and Illustrator, and help automate workflows that raise production efficiency.",
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
  projects: [],

  contact: {
    email: "thomasttrr@gmail.com",
    linkedin: "",
    github: "",
    // After you export a resume with the phone number removed, save it as
    // assets/Thomas-Tucker-Resume.pdf and set this to that path.
    resume: "",
    buttonText: "Work together",
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
