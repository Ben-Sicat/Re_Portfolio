export const profile = {
  name: "Ben Sicat",
  role: "AI Engineer",
  email: "bensicat00@gmail.com",
  github: "https://github.com/Ben-Sicat",
};

export const mpcam = {
  title: "Food volume from a single photo.",
  intro:
    "M-PCAM estimates how much food is on a plate from one smartphone picture, with no special hardware. It is a hybrid: deep learning finds the food, classical camera geometry measures it.",
  steps: [
    {
      title: "Segment every food item",
      body: "Mask R-CNN separates each item on the plate, so every portion is measured on its own.",
    },
    {
      title: "Recover depth",
      body: "ARCore depth data and a pinhole camera model turn pixels back into real-world distances from the lens.",
    },
    {
      title: "Measure the volume",
      body: "Geometric analysis integrates the height of each item over its footprint to get a portion size for dietary tracking.",
      stat: { value: "85-95%", note: "volume accuracy from one phone photo" },
    },
  ],
  stack: ["Mask R-CNN", "ARCore depth", "Pinhole camera model", "Python"],
};

export const scanqc = {
  title: "A scan QC gate that knows when it is unsure.",
  intro:
    "Every dental case arrives as two or three 3D scans. Scan QC scores the case on CPU from geometric checks, auto-accepts only what it is confident about, and queues the rest for a person, worst first, with findings in plain words like \"long open boundary\".",
  stats: [
    { value: "0.83", unit: "AUC", note: "pooled over 10,000+ cases it never saw. Batches range from 0.75 to 0.83." },
    { value: "0.80", unit: "AUC", note: "cross-validated across 97 labs" },
    { value: "~97%", unit: "", note: "of auto-accepted cases are clean" },
  ],
  comparison: {
    title: "Simple geometry beat a deep net",
    note: "Same cases, same split. Measured in AUC, where 0.5 is a coin flip.",
    bars: [
      { label: "Geometric features + gradient boosting", value: 0.756, shipped: true },
      { label: "PointNet on raw point clouds", value: 0.64, shipped: false },
    ],
  },
  leak: "An early model scored 0.87 AUC. It was reading file formats, not scan quality. The numbers here come from held-out labs and unseen batches.",
  stack: ["Mesh geometry", "scikit-learn", "FastAPI", "Docker", "Shadow-mode logging"],
};

export const llmFacts = [
  { value: "58 tok/s", note: "decode on a single RTX 5080, with 633 tok/s prefill" },
  { value: "10", note: "custom tools, from read-only text-to-SQL to a Confluence reader" },
  { value: "1 gateway", note: "for three groups: developers, a legal pilot, and general staff" },
];

export const llmStack = [
  "Qwen3 27B on Ollama",
  "Open WebUI",
  "Entra ID sign-in",
  "Self-hosted web search",
  "Code search: tree-sitter, Qdrant, hybrid ranking, reranker",
  "Blind A/B eval harness",
];

export type Project = {
  metric: string;
  metricNote: string;
  title: string;
  body: string;
  stack: string;
};

export const projects: Project[] = [
  {
    metric: "Excel, retired",
    metricNote: "ERP and payroll, vetted through beta",
    title: "FundPro ERP",
    body: "A custom web app that replaced FundPro's spreadsheets. It pulls data from their sources, runs payroll, ships preset exports, and puts every number on one overview page.",
    stack: "Next.js on Vercel",
  },
  {
    metric: "60%",
    metricNote: "less manual CAD design time",
    title: "Dental 3D tooling",
    body: "Took an existing tooth-generation pipeline further and built the tools around it: a mesh labeler for training data and an ACAD tool for the lab's technicians.",
    stack: "3D deep learning, mesh processing, ACAD",
  },
  {
    metric: "2,942",
    metricNote: "conversation chunks labeled locally",
    title: "Customer conversation labeling",
    body: "Scrubs personal data from customer chats, filters what matters in three gates, then labels theme, emotion and escalation with local Llama models.",
    stack: "Llama 3.1 8B, Llama 3.2 1B, Ollama, Docker",
  },
  {
    metric: "206 tests",
    metricNote: "behind a production portal API",
    title: "Customer portal backend",
    body: "The integration layer between a lab portal and two data sources, with retries, a circuit breaker, fallbacks, caching and lab-level access control.",
    stack: "FastAPI, Azure App Service, JWT, Locust",
  },
  {
    metric: "<200 ms",
    metricNote: "inference for live recommendations",
    title: "Customer preference engine",
    body: "Reads behavioral signals in real time to predict churn and serve personalized product recommendations.",
    stack: "ML microservices, inference APIs, dashboards",
  },
];

export type Earlier = { metric: string; title: string; context: string; body: string; stack: string };

export const earlier: Earlier[] = [
  {
    metric: "+40%",
    title: "Finquest",
    context: "Generative AI app",
    body: "A financial advisor in a Unity mobile app, backed by a RAG pipeline. Prompt work lifted response relevance by 40%.",
    stack: "Gemini 1.5 Flash, LangChain, MongoDB vector search",
  },
  {
    metric: "Stateless",
    title: "Mitos API",
    context: "Veda Technologies",
    body: "Broke a Caveman2 monolith into modular services that run on Hunchentoot or Woo, with JWT auth and Redis stream caching.",
    stack: "Common Lisp, Redis, PostgreSQL, ASDF",
  },
  {
    metric: "92%",
    title: "Supplier deduplication",
    context: "Vertiv",
    body: "Jaccard similarity scoring that finds duplicate suppliers across 10,000+ Oracle ERP records.",
    stack: "VBA, Oracle ERP",
  },
  {
    metric: "75%",
    title: "Supplier BI pipelines",
    context: "Vertiv",
    body: "ETL from Snowflake and Oracle ERP into executive dashboards. Manual reporting effort dropped by 75%.",
    stack: "Power BI, DAX, M Query, Snowflake",
  },
  {
    metric: "97%",
    title: "Handwritten digit recognition",
    context: "Deep learning",
    body: "A CNN digit classifier with a tuned architecture, reaching 97% test accuracy on MNIST.",
    stack: "TensorFlow, Keras",
  },
  {
    metric: "Real-time",
    title: "Car servicing app",
    context: "Raya Solutions",
    body: "A React Native app for booking and tracking car service, with multi-step transactions and live sync.",
    stack: "React Native, Firebase",
  },
  {
    metric: "No install",
    title: "STL viewer",
    context: "Tooling",
    body: "Drag an STL or OBJ into the browser to inspect it, with wireframe and auto-rotate. One HTML file.",
    stack: "Three.js",
  },
];

export const experience = [
  {
    dates: "Oct 2025 - Present",
    role: "AI Engineer",
    company: "Nimbyx Inc. (Evismart)",
    body: "The office LLM platform, scan QC and 3D tooling for a dental lab, and the customer portal backend.",
  },
  {
    dates: "Jun 2025 - Oct 2025",
    role: "Software Engineer & AI Researcher",
    company: "Veda Technologies",
    body: "Stateless Common Lisp backends and hybrid symbolic-statistical AI systems.",
  },
  {
    dates: "Oct 2024 - May 2025",
    role: "Business Analyst",
    company: "Vertiv Holdings",
    body: "ETL pipelines from Snowflake and Oracle ERP into executive dashboards, plus supplier data cleanup.",
  },
  {
    dates: "Sep 2021 - Dec 2022",
    role: "Software Developer Intern",
    company: "Raya Solutions",
    body: "A React Native app for car servicing with a Firebase backend and real-time sync.",
  },
];

export const stackRows = [
  ["Python", "TypeScript", "TensorFlow", "Ollama", "Qdrant", "FastAPI", "Three.js", "Common Lisp", "React Native"],
  ["Qwen3", "Llama", "LangChain", "scikit-learn", "Docker", "PostgreSQL", "Redis", "Next.js", "Azure"],
];
