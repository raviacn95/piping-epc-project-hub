const fs = require("fs");
const path = require("path");
const readline = require("readline");
const pdf = require("pdf-parse");
const vm = require("vm");

const CONFIG_FILE = path.join(__dirname, "automation-config.json");

const TOPIC_LIBRARY = [
  {
    topic: "Piping",
    category: "Piping",
    titleSeed: "Piping Engineering Fundamentals",
    tags: ["piping", "engineering", "design"],
    core: [
      "Piping engineering involves the design of systems that transport fluids in industrial plants.",
      "P&ID diagrams define the process flow and instrument connections before layout begins.",
      "Stress analysis ensures pipes withstand thermal expansion, pressure, and dead weight loads."
    ],
    rules: [
      "Always follow ASME B31.3 for process piping design and B31.1 for power piping.",
      "Verify Material Take-Off (MTO) against approved specifications before procurement.",
      "Route pipes to minimize stress concentrations while maintaining accessibility."
    ],
    workflow: "1. Review P&ID and process requirements.\n2. Develop piping layout in 3D model.\n3. Extract isometric drawings.\n4. Perform stress analysis.\n5. Generate Material Take-Off.\n6. Coordinate with other disciplines for clash check.",
    architecture: "Plant design starts with process flow diagrams (PFDs). Detailed P&IDs define every pipe, valve, and instrument. 3D models translate P&IDs into spatial layouts. Isometrics are extracted for fabrication. Stress analysis verifies structural integrity. MTO drives procurement. Construction drawings guide field installation.",
    tryThis: "Step 1: Read the P&ID for a simple pump discharge line.\nStep 2: Identify pipe size, material spec, and insulation.\nStep 3: Sketch a basic isometric with dimensions.",
    quizQ: "Why is stress analysis critical for high-temperature piping systems?",
    quizA: "Thermal expansion creates forces that can overstress pipes, supports, and connected equipment.",
    takeaway: "Good piping design balances safety, cost, constructability, and maintainability."
  },
  {
    topic: "Primavera",
    category: "Primavera",
    titleSeed: "Primavera P6 Project Scheduling",
    tags: ["primavera", "scheduling", "planning"],
    core: [
      "Oracle Primavera P6 is the industry standard for planning and scheduling EPC projects.",
      "Critical Path Method (CPM) identifies the longest sequence of dependent activities.",
      "Resource loading and leveling optimize manpower and equipment utilization."
    ],
    rules: [
      "Define a clear WBS before creating activities.",
      "Always baseline the schedule before execution begins.",
      "Use progress tracking and delay analysis for earned schedule management."
    ],
    workflow: "1. Create project structure with EPS and WBS.\n2. Define activities with durations and relationships.\n3. Assign resources and costs.\n4. Calculate schedule and identify critical path.\n5. Baseline the plan.\n6. Track progress and update forecasts.",
    architecture: "P6 uses an Oracle database to store project hierarchies. The Enterprise Project Structure (EPS) organizes projects. Work Breakdown Structure (WBS) decomposes scope. Activities are linked with FS/SS/FF/SF relationships. The scheduling engine calculates early/late dates and float. Resource profiles show demand curves. Earned Value integrates cost and schedule performance.",
    tryThis: "Step 1: Create a WBS for a simple piping installation.\nStep 2: Add 5 activities with FS relationships.\nStep 3: Run the scheduler and identify the critical path.",
    quizQ: "What does zero total float on an activity indicate?",
    quizA: "The activity is on the critical path — any delay directly impacts the project finish date.",
    takeaway: "A well-structured P6 schedule is the backbone of EPC project control."
  },
  {
    topic: "SAP",
    category: "SAP",
    titleSeed: "SAP ERP for EPC Projects",
    tags: ["sap", "erp", "project-system"],
    core: [
      "SAP PS (Project System) provides end-to-end project lifecycle management.",
      "SAP MM (Material Management) handles procurement, inventory, and vendor coordination.",
      "Work orders and purchase orders ensure controlled spending and material tracking."
    ],
    rules: [
      "Map your WBS in SAP PS to mirror the project breakdown structure.",
      "Use SAP MM for all material requisitions to maintain audit trail.",
      "Integrate cost elements with controlling (CO) for accurate project accounting."
    ],
    workflow: "1. Create project definition and WBS in SAP PS.\n2. Create network activities and milestones.\n3. Generate purchase requisitions for material.\n4. Process purchase orders in SAP MM.\n5. Confirm activities and track costs.\n6. Generate MIS reports for project review.",
    architecture: "SAP runs on a three-tier architecture: presentation, application, and database. SAP PS creates project structures linked to finance (FI/CO). SAP MM manages the procure-to-pay cycle. Work orders trigger material reservations. Goods receipts update inventory. Cost collection flows from network activities to WBS elements. Reports aggregate actuals vs. budget.",
    tryThis: "Step 1: Create a WBS element in SAP PS.\nStep 2: Create a purchase requisition for pipe material.\nStep 3: Track the PO status through to goods receipt.",
    quizQ: "Why should WBS elements in SAP PS mirror the project's scope breakdown?",
    quizA: "Aligned WBS ensures accurate cost collection, reporting, and earned value analysis.",
    takeaway: "SAP integrates planning, procurement, and control into a single auditable platform."
  },
  {
    topic: "Shutdown",
    category: "Shutdown",
    titleSeed: "Shutdown and Turnaround Planning",
    tags: ["shutdown", "turnaround", "maintenance"],
    core: [
      "Shutdown planning coordinates the safe stoppage, maintenance, and restart of plant units.",
      "Turnaround planning focuses on minimizing downtime while maximizing work completion.",
      "Risk assessment and permit planning ensure safety compliance during high-risk activities."
    ],
    rules: [
      "Freeze the work scope at least 4 weeks before the shutdown window.",
      "Develop a detailed permit-to-work matrix for all hot work and confined space entries.",
      "Build contingency time into the schedule for unforeseen discoveries."
    ],
    workflow: "1. Identify work scope from inspection and maintenance lists.\n2. Develop detailed activity-level schedule.\n3. Plan resources, materials, and logistics.\n4. Conduct safety reviews and permit planning.\n5. Execute shutdown with daily progress tracking.\n6. Commission systems and restart plant safely.",
    architecture: "Turnaround planning starts 6-12 months before execution. Scope freeze locks the work list. Scheduling uses CPM to optimize the critical path. Resource histograms ensure peak manpower fits site capacity. Material staging ensures availability on day one. Daily tracking meetings compare actual vs. plan. Punch lists close out remaining items before startup.",
    tryThis: "Step 1: List 10 maintenance activities for a heat exchanger overhaul.\nStep 2: Sequence them with dependencies.\nStep 3: Identify the critical path for the overhaul.",
    quizQ: "Why is scope freeze important in shutdown planning?",
    quizA: "Late scope additions cause resource conflicts, schedule overruns, and safety risks.",
    takeaway: "Successful turnarounds depend on early planning, scope discipline, and safety-first execution."
  },
  {
    topic: "AutoCAD",
    category: "AutoCAD",
    titleSeed: "AutoCAD for Engineering Drawings",
    tags: ["autocad", "drafting", "cad"],
    core: [
      "AutoCAD is the standard tool for 2D drafting of engineering drawings in EPC projects.",
      "Proper layer management and drawing templates ensure consistency across disciplines.",
      "P&IDs, plot plans, and isometrics are commonly produced in AutoCAD."
    ],
    rules: [
      "Use standardized layer naming conventions (discipline-type-content).",
      "Always draw to real-world scale and dimension accurately.",
      "Use blocks and attributes for frequently used symbols like valves and instruments."
    ],
    workflow: "1. Set up drawing template with layers and title block.\n2. Import reference drawings and set scale.\n3. Draft the layout using proper line types.\n4. Add dimensions, annotations, and symbols.\n5. Review and cross-check against P&ID.\n6. Plot to PDF with standard sheet sizes.",
    architecture: "AutoCAD stores geometry in DWG format. Layers organize objects by discipline and type. Blocks encapsulate reusable components with attributes. External references (XREFs) link drawings from other disciplines. Dimension styles enforce consistent annotation. Plot styles control line weights for printing. Sheet sets manage multi-sheet deliverables.",
    tryThis: "Step 1: Create a new drawing with A1 sheet template.\nStep 2: Set up 5 layers: pipe, valve, instrument, support, text.\nStep 3: Draw a simple pipe route with 2 valves and labels.",
    quizQ: "Why should you use XREFs instead of copying other discipline drawings?",
    quizA: "XREFs auto-update when the source changes, preventing coordination errors.",
    takeaway: "Disciplined AutoCAD practices produce clear, coordinated, and revision-controlled drawings."
  },
  {
    topic: "Project Control",
    category: "Project Control",
    titleSeed: "Project Control Essentials",
    tags: ["project-control", "evm", "cost-control"],
    core: [
      "Earned Value Management (EVM) integrates scope, schedule, and cost for performance measurement.",
      "Cost control tracks actual spending against budget to identify variances early.",
      "MIS reporting provides management with actionable project health indicators."
    ],
    rules: [
      "Establish measurement baselines (scope, schedule, cost) before execution.",
      "Calculate CPI and SPI monthly to detect trends early.",
      "Use Estimate At Completion (EAC) to forecast final project cost."
    ],
    workflow: "1. Define scope baseline with WBS and budget.\n2. Create time-phased budget (BCWS).\n3. Measure progress and calculate BCWP (earned value).\n4. Collect actual costs (ACWP).\n5. Calculate SPI, CPI, SV, CV.\n6. Forecast EAC and report to stakeholders.",
    architecture: "Project control sits between planning and execution. The cost engineer collects actual costs from SAP or accounting. The planner measures physical progress against the baseline schedule. EVM formulas combine these into performance indices. Variance analysis identifies problem areas. Trend charts show trajectory. Management reports recommend corrective actions.",
    tryThis: "Step 1: Set a budget of $100K for a work package.\nStep 2: At 50% schedule, measure 40% physical progress.\nStep 3: Calculate SPI = 0.80 and interpret the schedule delay.",
    quizQ: "What does a CPI of 0.85 indicate?",
    quizA: "For every $1 spent, only $0.85 of value has been earned — the project is over budget.",
    takeaway: "EVM provides early warning signals that enable corrective action before overruns become critical."
  },
  {
    topic: "EPC",
    category: "EPC",
    titleSeed: "EPC Project Execution",
    tags: ["epc", "construction", "project-management"],
    core: [
      "EPC (Engineering, Procurement, Construction) is the dominant delivery model in oil & gas and petrochemical sectors.",
      "Project coordination across engineering, procurement, and construction phases requires integrated planning.",
      "Quantity Take-Off (QTO) and Bill of Quantities (BOQ) are essential for cost estimation and bidding."
    ],
    rules: [
      "Align engineering deliverables schedule with procurement lead times.",
      "Conduct constructability reviews during detailed design phase.",
      "Track site progress using S-curves and milestone reports."
    ],
    workflow: "1. Complete FEED (Front-End Engineering Design).\n2. Execute detailed engineering with all disciplines.\n3. Procure long-lead items based on MTO.\n4. Mobilize site and begin construction.\n5. Mechanical completion and commissioning.\n6. Performance testing and handover.",
    architecture: "An EPC project spans three overlapping phases. Engineering produces specifications, drawings, and data sheets. Procurement converts MTOs into purchase orders, expedites deliveries, and manages vendors. Construction mobilizes labor, manages subcontractors, and executes the build sequence. All phases share a common project controls framework covering cost, schedule, quality, and HSE.",
    tryThis: "Step 1: List the major deliverables for each EPC phase.\nStep 2: Identify 3 long-lead procurement items.\nStep 3: Create a milestone chart showing phase overlaps.",
    quizQ: "Why is early procurement of long-lead items critical in EPC projects?",
    quizA: "Late delivery of long-lead items (vessels, compressors) delays construction start and extends the critical path.",
    takeaway: "EPC success requires tight integration between engineering, procurement, and construction milestones."
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC_SEEDS — 50 unique subtopics covering piping, planning, Primavera,
// SAP, shutdown, EPC projects, AutoCAD & project control
// ─────────────────────────────────────────────────────────────────────────────
const TOPIC_SEEDS = [
  // ── Piping Engineering (10) ──────────────────────────────────────────────
  { topic: "Piping", subtopic: "Piping Engineering Fundamentals and Career Guide", category: "Piping", tags: ["piping","engineering","design","career"], level: "beginner" },
  { topic: "Piping", subtopic: "Piping Layout Design Best Practices",              category: "Piping", tags: ["piping","layout","design","plant"], level: "beginner" },
  { topic: "Piping", subtopic: "Isometric Drawings Reading and Interpretation",    category: "Piping", tags: ["piping","isometric","drawings","fabrication"], level: "beginner" },
  { topic: "Piping", subtopic: "P&ID Piping and Instrumentation Diagram Guide",   category: "Piping", tags: ["piping","p&id","instrumentation","process"], level: "intermediate" },
  { topic: "Piping", subtopic: "Pipe Routing Principles and Optimization",         category: "Piping", tags: ["piping","routing","optimization","design"], level: "intermediate" },
  { topic: "Piping", subtopic: "Stress Analysis for Process Piping Systems",       category: "Piping", tags: ["piping","stress-analysis","thermal","ASME"], level: "advanced" },
  { topic: "Piping", subtopic: "Material Take-Off MTO Preparation and Verification",category: "Piping", tags: ["piping","mto","material","procurement"], level: "intermediate" },
  { topic: "Piping", subtopic: "Pipe Support Design Types and Selection",          category: "Piping", tags: ["piping","supports","design","structural"], level: "intermediate" },
  { topic: "Piping", subtopic: "ASME B31.3 Process Piping Code Overview",          category: "Piping", tags: ["piping","ASME","standards","code"], level: "advanced" },
  { topic: "Piping", subtopic: "Plant Layout Design for Process Industries",       category: "Piping", tags: ["piping","plant-layout","design","safety"], level: "advanced" },

  // ── AutoCAD & Design Tools (5) ───────────────────────────────────────────
  { topic: "AutoCAD", subtopic: "AutoCAD for Piping Engineers Complete Guide",     category: "AutoCAD", tags: ["autocad","cad","drafting","piping"], level: "beginner" },
  { topic: "AutoCAD", subtopic: "2D Drafting Techniques for Engineering Drawings", category: "AutoCAD", tags: ["autocad","2d-drafting","engineering","drawings"], level: "beginner" },
  { topic: "AutoCAD", subtopic: "Engineering Drawing Standards and Sheet Formats",  category: "AutoCAD", tags: ["autocad","standards","drawings","format"], level: "beginner" },
  { topic: "AutoCAD", subtopic: "CAD Modelling and 3D Plant Design Basics",        category: "AutoCAD", tags: ["autocad","cad","3d-model","plant-design"], level: "intermediate" },
  { topic: "AutoCAD", subtopic: "Layout Drafting for Plot Plans and GA Drawings",  category: "AutoCAD", tags: ["autocad","layout","plot-plan","GA"], level: "intermediate" },

  // ── Primavera & Project Scheduling (10) ──────────────────────────────────
  { topic: "Primavera", subtopic: "Oracle Primavera P6 Getting Started Guide",     category: "Primavera", tags: ["primavera","p6","scheduling","beginner"], level: "beginner" },
  { topic: "Primavera", subtopic: "Project Scheduling Basics and Terminology",     category: "Primavera", tags: ["primavera","scheduling","basics","planning"], level: "beginner" },
  { topic: "Primavera", subtopic: "Baseline Planning in Primavera P6",             category: "Primavera", tags: ["primavera","baseline","planning","schedule"], level: "beginner" },
  { topic: "Primavera", subtopic: "Critical Path Method CPM Explained",            category: "Primavera", tags: ["primavera","cpm","critical-path","scheduling"], level: "intermediate" },
  { topic: "Primavera", subtopic: "Work Breakdown Structure WBS Development",      category: "Primavera", tags: ["primavera","wbs","breakdown","scope"], level: "intermediate" },
  { topic: "Primavera", subtopic: "Resource Loading and Histograms in P6",         category: "Primavera", tags: ["primavera","resource","loading","histogram"], level: "intermediate" },
  { topic: "Primavera", subtopic: "Resource Leveling Techniques and Strategy",     category: "Primavera", tags: ["primavera","leveling","resource","optimization"], level: "advanced" },
  { topic: "Primavera", subtopic: "Schedule Optimization and Compression",         category: "Primavera", tags: ["primavera","optimization","crashing","fast-tracking"], level: "advanced" },
  { topic: "Primavera", subtopic: "Progress Tracking and Schedule Updates",        category: "Primavera", tags: ["primavera","progress","tracking","update"], level: "intermediate" },
  { topic: "Primavera", subtopic: "Delay Analysis Methods EOT Claims",             category: "Primavera", tags: ["primavera","delay","analysis","claims"], level: "advanced" },

  // ── Shutdown & Maintenance Planning (7) ──────────────────────────────────
  { topic: "Shutdown", subtopic: "Shutdown Planning Complete Guide for Engineers",  category: "Shutdown", tags: ["shutdown","planning","maintenance","guide"], level: "beginner" },
  { topic: "Shutdown", subtopic: "Turnaround Planning and Execution Strategy",     category: "Shutdown", tags: ["shutdown","turnaround","execution","strategy"], level: "intermediate" },
  { topic: "Shutdown", subtopic: "Maintenance Scheduling Best Practices",          category: "Shutdown", tags: ["shutdown","maintenance","scheduling","best-practices"], level: "beginner" },
  { topic: "Shutdown", subtopic: "Outage Planning for Power and Process Plants",   category: "Shutdown", tags: ["shutdown","outage","power-plant","process"], level: "intermediate" },
  { topic: "Shutdown", subtopic: "Risk Assessment in Shutdown Turnarounds",        category: "Shutdown", tags: ["shutdown","risk","assessment","safety"], level: "advanced" },
  { topic: "Shutdown", subtopic: "Permit to Work Planning and Management",         category: "Shutdown", tags: ["shutdown","permit","safety","compliance"], level: "intermediate" },
  { topic: "Shutdown", subtopic: "Safety Compliance in Industrial Shutdowns",      category: "Shutdown", tags: ["shutdown","safety","compliance","HSE"], level: "advanced" },

  // ── SAP & Contracts (7) ──────────────────────────────────────────────────
  { topic: "SAP", subtopic: "SAP ERP Overview for EPC Project Engineers",          category: "SAP", tags: ["sap","erp","project","overview"], level: "beginner" },
  { topic: "SAP", subtopic: "SAP PS Project System Module Complete Guide",         category: "SAP", tags: ["sap","ps","project-system","planning"], level: "intermediate" },
  { topic: "SAP", subtopic: "SAP MM Material Management for Projects",            category: "SAP", tags: ["sap","mm","material","procurement"], level: "intermediate" },
  { topic: "SAP", subtopic: "Contract Management in EPC Projects",                category: "SAP", tags: ["sap","contracts","management","procurement"], level: "intermediate" },
  { topic: "SAP", subtopic: "Purchase Orders and Procurement Workflow in SAP",    category: "SAP", tags: ["sap","purchase-orders","procurement","workflow"], level: "beginner" },
  { topic: "SAP", subtopic: "Work Orders Creation and Tracking in SAP",           category: "SAP", tags: ["sap","work-orders","tracking","maintenance"], level: "intermediate" },
  { topic: "SAP", subtopic: "Vendor Coordination and Expediting Best Practices",  category: "SAP", tags: ["sap","vendor","coordination","expediting"], level: "advanced" },

  // ── Site & Project Execution (6) ─────────────────────────────────────────
  { topic: "EPC", subtopic: "Site Planning and Mobilization Strategy",             category: "EPC", tags: ["epc","site-planning","mobilization","construction"], level: "beginner" },
  { topic: "EPC", subtopic: "Construction Planning and Sequencing Guide",          category: "EPC", tags: ["epc","construction","planning","sequencing"], level: "intermediate" },
  { topic: "EPC", subtopic: "Project Coordination Across EPC Disciplines",        category: "EPC", tags: ["epc","coordination","disciplines","management"], level: "intermediate" },
  { topic: "EPC", subtopic: "EPC Project Lifecycle from FEED to Handover",        category: "EPC", tags: ["epc","lifecycle","FEED","handover"], level: "beginner" },
  { topic: "EPC", subtopic: "Quantity Take-Off QTO Methods and Tools",            category: "EPC", tags: ["epc","qto","quantity","estimation"], level: "intermediate" },
  { topic: "EPC", subtopic: "Bill of Quantities BOQ Preparation Guide",           category: "EPC", tags: ["epc","boq","quantities","bidding"], level: "intermediate" },

  // ── Advanced Project Control (5) ─────────────────────────────────────────
  { topic: "Project Control", subtopic: "Earned Value Management EVM Complete Guide",      category: "Project Control", tags: ["project-control","evm","earned-value","performance"], level: "advanced" },
  { topic: "Project Control", subtopic: "Cost Control Techniques for EPC Projects",        category: "Project Control", tags: ["project-control","cost-control","budget","variance"], level: "intermediate" },
  { topic: "Project Control", subtopic: "Budget Tracking and Variance Analysis",           category: "Project Control", tags: ["project-control","budget","tracking","variance"], level: "intermediate" },
  { topic: "Project Control", subtopic: "Project Forecasting EAC and ETC Methods",         category: "Project Control", tags: ["project-control","forecasting","eac","estimation"], level: "advanced" },
  { topic: "Project Control", subtopic: "MIS Reporting for Project Management",            category: "Project Control", tags: ["project-control","mis","reporting","management"], level: "advanced" }
];

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadConfig() {
  const defaults = {
    scheduler: {
      enabled: true,
      intervalMinutes: 60,
      intervalJitterPercent: 20,
      runImmediately: true,
      maxRuns: 0
    },
    linkedin: {
      postCount: 2,
      startIndex: 0,
      delayBetweenPostsMinSec: 30,
      delayBetweenPostsMaxSec: 90,
      prePostDelayMinSec: 2,
      prePostDelayMaxSec: 5
    },
    safetyLimits: {
      maxPostsPerDay: 10,
      similarityThreshold: 0.6,
      maxHistory: 50
    },
    contentGeneration: {
      sourceMode: "topics",
      targetPostCount: 100,
      pdfPath: "",
      promptForPdfPath: true,
      defaultCategory: "Piping",
      autoGenerateOnEveryRun: true,
      topicPool: ["Piping", "Primavera", "SAP", "Shutdown", "AutoCAD", "Project Control", "EPC"],
      tags: ["piping", "epc", "engineering"],
      outputFile: "posts-data.js"
    },
    aiGeneration: {
      enabled: false,
      endpoint: "https://api.openai.com/v1/chat/completions",
      model: "gpt-4o-mini",
      apiKeyEnvVar: "OPENAI_API_KEY",
      systemPrompt: "Generate high-quality technical social posts as valid JSON only."
    }
  };

  if (!fs.existsSync(CONFIG_FILE)) {
    return defaults;
  }

  const parsed = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  return {
    ...defaults,
    ...parsed,
    scheduler: {
      ...defaults.scheduler,
      ...(parsed.scheduler || {})
    },
    linkedin: {
      ...defaults.linkedin,
      ...(parsed.linkedin || {})
    },
    safetyLimits: {
      ...defaults.safetyLimits,
      ...(parsed.safetyLimits || {})
    },
    contentGeneration: {
      ...defaults.contentGeneration,
      ...(parsed.contentGeneration || {})
    },
    aiGeneration: {
      ...defaults.aiGeneration,
      ...(parsed.aiGeneration || {})
    }
  };
}

function normalizeSentence(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u001f]/g, "")
    .trim();
}

function splitIntoSentences(text) {
  return normalizeSentence(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);
}

function extractCodeBlocks(rawText) {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim());
  const codeLines = lines.filter((line) =>
    /\b(function|const|let|var|if|for|while|return|=>|console\.log|class|import|export)\b/.test(line)
  );

  const blocks = [];
  for (let i = 0; i < codeLines.length; i += 3) {
    const snippet = codeLines.slice(i, i + 3).join("\n");
    if (snippet.length > 0) {
      blocks.push(snippet);
    }
  }
  return blocks;
}

function buildDetailedContent({ topic, subtopic, core, rules, workflow, architecture, tryThis, quizQ, quizA, takeaway }) {
  const topicName = subtopic || topic || "this concept";
  return [
    "## How to Apply " + topicName + " on Site?",
    "",
    core,
    "",
    "## Real Example",
    "",
    tryThis,
    "",
    "This real-world approach saves time, reduces rework, and keeps your project on track.",
    "",
    "## What is " + topicName + "?",
    "",
    core,
    "",
    "Mastering this is essential for delivering projects on schedule and within budget. It forms the foundation for every successful EPC execution.",
    "",
    "When applied correctly, it reduces costly rework, improves cross-discipline coordination, and strengthens your engineering deliverables.",
    "",
    "## When to Apply " + topicName + "?",
    "",
    "Apply this approach when:",
    "",
    "- Projects require " + (rules[0] || "structured engineering processes").toLowerCase(),
    "- Teams need " + (rules[1] || "consistent standards across disciplines").toLowerCase(),
    "- Verifying that " + (rules[2] || "deliverables meet code and spec requirements").toLowerCase(),
    "- Transitioning from engineering to procurement or construction phase",
    "- Conducting audits, reviews, or third-party inspections",
    "",
    "## Step by Step Guide",
    "",
    workflow || "1. Review project scope and specifications.\n2. Develop discipline-specific deliverables.\n3. Coordinate across engineering, procurement, and construction.\n4. Conduct quality checks and inspections.\n5. Resolve site issues with MOC process.\n6. Document lessons learned for future projects.",
    "",
    "## Real Example — How It Helps",
    "",
    tryThis,
    "",
    "Following these steps prevented schedule delays and reduced material wastage on a recent refinery project.",
    "",
    "## Method Comparison",
    "",
    "| Approach | When to Use | Key Benefit | Complexity |",
    "| --- | --- | --- | --- |",
    "| " + (rules[0] || "Standard Practice") + " | Routine projects | Proven reliability | Low |",
    "| " + (rules[1] || "Enhanced Workflow") + " | Complex multi-discipline scope | Better coordination | Medium |",
    "| " + (rules[2] || "Advanced Analysis") + " | Mega projects or critical systems | Risk mitigation | High |",
    "",
    "## Best Practices",
    "",
    "- " + rules[0],
    "- " + rules[1],
    "- " + rules[2],
    "- Always verify deliverables against approved specifications before issue",
    "- Conduct interdisciplinary reviews to catch clashes early",
    "- Document deviations and get engineering approval before construction proceeds",
    "",
    "### Common Mistakes to Avoid",
    "",
    "- Skipping clash checks which leads to costly field rework",
    "- Not updating schedules when scope changes occur",
    "- Ignoring vendor document reviews that cause procurement delays",
    "- Proceeding with construction without approved-for-construction drawings",
    "",
    "## Common Issues and Fixes",
    "",
    "### Why do schedule delays occur?",
    "",
    "Usually from incomplete scope definition, late vendor data, or poor resource leveling. Always freeze scope early and track critical path activities daily.",
    "",
    "### Why do material shortages happen on site?",
    "",
    "Check that your MTO is reconciled against approved drawings and that procurement lead times are realistic. Expedite long-lead items from day one.",
    "",
    "## Advanced Scenarios",
    "",
    "### " + topicName + " in Complex Projects",
    "",
    architecture || "The project starts with FEED deliverables, moves to detailed engineering across all disciplines, procurement runs in parallel based on MTO, construction sequences follow area-wise completion strategy, and commissioning validates systems before handover.",
    "",
    "### Integration Across Disciplines",
    "",
    "When combining piping, structural, electrical, and instrumentation work, ensure each discipline has clear interface points and hold-free dates. This makes execution smoother and reduces field conflicts.",
    "",
    "## Real World Use Cases",
    "",
    "### Use Case: Refinery Turnaround",
    "",
    "During a 45-day shutdown, this approach helped complete 2,500 piping spools on schedule by front-loading material procurement and pre-fabrication 3 months ahead of the turnaround window.",
    "",
    "### Use Case: Greenfield EPC Project",
    "",
    "On a $200M petrochemical plant, applying these practices reduced engineering rework by 30% and brought mechanical completion 2 weeks ahead of the contractual deadline.",
    "",
    "## FAQs",
    "",
    "### What is " + topicName + "?",
    "",
    core,
    "",
    "### When should I apply " + topicName + "?",
    "",
    "Apply it when you need " + (rules[0] || "structured, reliable engineering processes").toLowerCase() + ". It is especially valuable in multi-discipline EPC environments and large capital projects.",
    "",
    "### What are the best practices for " + topicName + "?",
    "",
    rules[0] + " " + rules[1] + " " + rules[2],
    "",
    "### " + quizQ,
    "",
    quizA,
    "",
    "### What are common mistakes with " + topicName + "?",
    "",
    "The most common mistake is not verifying deliverables against specifications before issue. Always ensure drawings, MTOs, and schedules align with the approved project scope.",
    "",
    "## Conclusion",
    "",
    takeaway + " In this guide, you learned the fundamentals of " + topicName + ", step by step implementation, best practices, and how to avoid common mistakes. Apply these on your next project and share your results."
  ].join("\n");
}

function generatedTimestamp(baseTime, index) {
  return new Date(baseTime - index * 60000).toISOString();
}

function createTopicPosts(cfg) {
  const target = Number(cfg.targetPostCount || 100);
  const topicPool = Array.isArray(cfg.topicPool) && cfg.topicPool.length > 0 ? cfg.topicPool : ["JavaScript"];
  const selectedTopicTemplates = TOPIC_LIBRARY.filter((entry) => topicPool.includes(entry.topic));
  const templates = selectedTopicTemplates.length > 0 ? selectedTopicTemplates : TOPIC_LIBRARY;
  const nowSeed = Date.now();
  const baseTime = Date.now();

  const posts = [];
  for (let i = 0; i < target; i += 1) {
    const tpl = templates[i % templates.length];
    const rotation = (i + nowSeed) % tpl.core.length;
    const core = tpl.core[rotation];
    const rules = [
      tpl.rules[rotation % tpl.rules.length],
      tpl.rules[(rotation + 1) % tpl.rules.length],
      tpl.rules[(rotation + 2) % tpl.rules.length]
    ];

    const title = `${tpl.titleSeed} ${i + 1}`;
    const excerpt = core.length > 140 ? `${core.slice(0, 137)}...` : core;
    const tags = Array.from(new Set([...(cfg.tags || []), ...tpl.tags])).slice(0, 6);

    const levels = ["beginner", "intermediate", "advanced"];
    posts.push({
      id: i + 1,
      category: tpl.category || cfg.defaultCategory || "JavaScript",
      title,
      tags,
      excerpt,
      sourceUrl: "",
      createdAt: generatedTimestamp(baseTime, i),
      level: levels[i % 3],
      content: buildDetailedContent({
        topic: tpl.topic,
        subtopic: tpl.titleSeed,
        core,
        rules,
        workflow: tpl.workflow,
        architecture: tpl.architecture,
        tryThis: tpl.tryThis,
        quizQ: tpl.quizQ,
        quizA: tpl.quizA,
        takeaway: tpl.takeaway
      })
    });
  }

  return posts;
}

function generatePostsFromText(rawText, cfg) {
  const sentencePool = splitIntoSentences(rawText);
  const codePool = extractCodeBlocks(rawText);
  const target = Number(cfg.targetPostCount || 100);
  const tags = Array.isArray(cfg.tags) && cfg.tags.length > 0 ? cfg.tags : ["javascript", "automation"];
  const posts = [];
  const baseTime = Date.now();

  if (sentencePool.length === 0) {
    throw new Error("PDF content looks empty after parsing. Use a text-based PDF with selectable text.");
  }

  for (let i = 0; i < target; i += 1) {
    const core = sentencePool[i % sentencePool.length];
    const rules = [
      sentencePool[(i + 1) % sentencePool.length] || "Prefer small reusable functions.",
      sentencePool[(i + 2) % sentencePool.length] || "Validate inputs and expected outputs.",
      sentencePool[(i + 3) % sentencePool.length] || "Keep naming explicit and consistent."
    ];
    const quizQ = sentencePool[(i + 4) % sentencePool.length] || "What test case would fail first?";
    const quizA = sentencePool[(i + 5) % sentencePool.length] || "Start with empty, invalid, and boundary inputs.";
    const takeaway = sentencePool[(i + 6) % sentencePool.length] || "Capture reusable patterns and validate behavior with examples.";
    const code = codePool.length > 0 ? codePool[i % codePool.length] : "const result = values.filter(Boolean);\nconsole.log(result);";

    const titleWords = normalizeSentence(core)
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 7)
      .join(" ");

    const title = `Generated Insight ${i + 1}: ${titleWords || "Practical Concept"}`;
    const excerpt = core.length > 140 ? `${core.slice(0, 137)}...` : core;

    posts.push({
      id: i + 1,
      category: cfg.defaultCategory || "JavaScript",
      title,
      tags,
      excerpt,
      sourceUrl: "",
      createdAt: generatedTimestamp(baseTime, i),
      content: buildDetailedContent({
        topic: cfg.defaultCategory || "JavaScript",
        subtopic: titleWords || "Practical Concept",
        core,
        rules,
        tryThis: code,
        quizQ,
        quizA,
        takeaway
      })
    });
  }

  return posts;
}

/* ── Accumulation helpers ─────────────────────────────── */
const HIGH_WATER_MARK_FILE = path.join(__dirname, ".auth", "post-count-hwm.json");

function getHighWaterMark() {
  try {
    if (fs.existsSync(HIGH_WATER_MARK_FILE)) {
      const data = JSON.parse(fs.readFileSync(HIGH_WATER_MARK_FILE, "utf8"));
      return Number(data.maxPosts) || 0;
    }
  } catch { /* ignore */ }
  return 0;
}

function updateHighWaterMark(count) {
  const current = getHighWaterMark();
  if (count > current) {
    const dir = path.dirname(HIGH_WATER_MARK_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(HIGH_WATER_MARK_FILE, JSON.stringify({ maxPosts: count, updatedAt: new Date().toISOString() }, null, 2), "utf8");
  }
}

function loadExistingPosts(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const source = fs.readFileSync(filePath, "utf8");
  // If the file is trivially small (header only), treat as empty
  if (source.trim().length < 50) return [];
  const sandbox = { console };
  vm.createContext(sandbox);
  vm.runInContext(source + "\n;globalThis.__ALL_POSTS = ALL_POSTS;", sandbox);
  const posts = sandbox.__ALL_POSTS;
  if (!Array.isArray(posts)) {
    throw new Error("posts-data.js did not produce a valid ALL_POSTS array");
  }
  // Update high water mark whenever we successfully load posts
  updateHighWaterMark(posts.length);
  return posts;
}

function verifyWrittenPosts(filePath) {
  try {
    const source = fs.readFileSync(filePath, "utf8");
    const sandbox = { console };
    vm.createContext(sandbox);
    vm.runInContext(source + "\n;globalThis.__ALL_POSTS = ALL_POSTS;", sandbox);
    const posts = sandbox.__ALL_POSTS;
    return Array.isArray(posts) ? posts.length : 0;
  } catch {
    return -1;
  }
}

function tokenizeTitle(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
}

function titleSimilarity(a, b) {
  const tA = new Set(tokenizeTitle(a));
  const tB = new Set(tokenizeTitle(b));
  if (tA.size === 0 || tB.size === 0) return 0;
  let inter = 0;
  for (const w of tA) { if (tB.has(w)) inter++; }
  const union = new Set([...tA, ...tB]).size;
  return union > 0 ? inter / union : 0;
}

function isDuplicatePost(newPost, existingPosts, threshold) {
  const t = threshold || 0.75;
  for (const ep of existingPosts) {
    if (titleSimilarity(newPost.title, ep.title) >= t) return true;
  }
  return false;
}

function mergeAndDedupPosts(existingPosts, newPosts, threshold) {
  const merged = [...existingPosts];
  let added = 0;
  for (const np of newPosts) {
    if (!isDuplicatePost(np, merged, threshold)) {
      merged.push(np);
      added++;
    } else {
      console.log("  Skipped duplicate: " + np.title);
    }
  }
  // Re-assign sequential IDs
  merged.forEach((p, i) => { p.id = i + 1; });
  console.log("  Merged: " + added + " new + " + existingPosts.length + " existing = " + merged.length + " total posts.");
  return merged;
}

function toPostsDataJs(posts) {
  const lines = [];
  lines.push("/* ================================================================");
  lines.push("   AUTO-GENERATED POSTS");
  lines.push("   Regenerate with: npm run posts:generate");
  lines.push("   ================================================================ */");
  lines.push("");
  lines.push("// eslint-disable-next-line no-unused-vars");
  lines.push("const ALL_POSTS = [");

  posts.forEach((post, index) => {
    lines.push("  {");
    lines.push(`    id: ${post.id}, category: ${JSON.stringify(post.category)},`);
    lines.push(`    title: ${JSON.stringify(post.title)},`);
    lines.push(`    tags: ${JSON.stringify(post.tags)},`);
    lines.push(`    excerpt: ${JSON.stringify(post.excerpt)},`);
    lines.push(`    sourceUrl: ${JSON.stringify(post.sourceUrl || "")},`);
    lines.push(`    createdAt: ${JSON.stringify(post.createdAt || generatedTimestamp(Date.now(), index))},`);
    lines.push(`    level: ${JSON.stringify(post.level || "beginner")},`);
    lines.push(`    content: ${JSON.stringify(post.content)}`);
    lines.push(index === posts.length - 1 ? "  }" : "  },");
  });

  lines.push("];\n");
  return lines.join("\n");
}

async function resolvePdfPath(cfg) {
  const cliPath = process.argv[2] ? process.argv[2].trim() : "";
  if (cliPath) {
    return path.resolve(__dirname, cliPath);
  }

  if (cfg.promptForPdfPath || !cfg.pdfPath) {
    const entered = await ask("Enter PDF path to generate posts from: ");
    if (!entered) {
      throw new Error("No PDF path provided.");
    }
    return path.resolve(__dirname, entered);
  }

  return path.resolve(__dirname, cfg.pdfPath);
}

function stripCodeFence(text) {
  const trimmed = String(text || "").trim();
  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    return trimmed.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }
  return trimmed;
}

function normalizeAiPost(post, index, cfg) {
  const title = normalizeSentence(post.title || `Generated Insight ${index + 1}`);
  const excerpt = normalizeSentence(post.excerpt || "");
  // Preserve line breaks in content — only normalize control chars and convert literal \n
  const rawContent = String(post.content || "")
    .replace(/\\n/g, "\n")
    .replace(/[\u0000-\u0009\u000b\u000c\u000e-\u001f]/g, "")
    .trim();
  const category = normalizeSentence(post.category || cfg.defaultCategory || "JavaScript");
  const tags = Array.isArray(post.tags) && post.tags.length > 0
    ? post.tags.map((t) => normalizeSentence(t.toLowerCase())).filter(Boolean).slice(0, 8)
    : (cfg.tags || ["javascript", "automation"]);

  return {
    id: index + 1,
    category,
    title,
    tags,
    excerpt: excerpt || rawContent.slice(0, 140),
    sourceUrl: normalizeSentence(post.sourceUrl || ""),
    createdAt: normalizeSentence(post.createdAt || generatedTimestamp(Date.now(), index)),
    level: normalizeSentence(post.level || "beginner"),
    content: rawContent
  };
}

async function createAiPosts(cfg, aiCfg) {
  const apiKey = process.env[aiCfg.apiKeyEnvVar || "OPENAI_API_KEY"];
  if (!aiCfg.enabled || !apiKey) {
    return null;
  }

  const target = Number(cfg.targetPostCount || 100);
  const topicPool = Array.isArray(cfg.topicPool) && cfg.topicPool.length > 0
    ? cfg.topicPool.join(", ")
    : "Playwright, TypeScript, Azure DevOps, JavaScript";

  const userPrompt = [
    `Create ${target} detailed technical posts.`,
    `Topics should come from: ${topicPool}.`,
    "Return strict JSON only, no markdown.",
    "Schema: [{id, category, title, tags, excerpt, content}]",
    "content must include markdown sections exactly:",
    "## Core Concept",
    "## Key Rules",
    "## Try This",
    "## Quick Quiz",
    "## Key Takeaway"
  ].join("\n");

  const response = await fetch(aiCfg.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: aiCfg.model,
      temperature: 0.7,
      messages: [
        { role: "system", content: aiCfg.systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("AI response did not contain content.");
  }

  const parsed = JSON.parse(stripCodeFence(text));
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("AI response JSON is not a non-empty array.");
  }

  return parsed.slice(0, target).map((post, index) => normalizeAiPost(post, index, cfg));
}

// ─────────────────────────────────────────────────────────────────────────────
// FREE AI GENERATION — Groq (llama-3.1-8b-instant) or Google Gemini free tier
// Get a free key: https://console.groq.com  |  https://aistudio.google.com
// Set env var GROQ_API_KEY or GEMINI_API_KEY before running.
// ─────────────────────────────────────────────────────────────────────────────

function buildPostPrompt(seed) {
  const level = seed.level || "beginner";
  const lang = seed.topic === "TypeScript" ? "ts" : "js";
  const levelGuide = {
    beginner: "Explain like teaching a first-year student. Use simple language, analogies, and everyday examples. No jargon without explaining it.",
    intermediate: "Assume the reader knows basics. Focus on patterns, best practices, and real-world gotchas. Include production-ready examples.",
    advanced: "Write for a senior/architect audience. Cover system design, scalability, trade-offs, and enterprise patterns. Include architecture decisions."
  };
  return (
    "You are a senior " + seed.topic + " expert and technical writer creating a COMPREHENSIVE, SEO-optimized tutorial guide for a professional learning website.\n" +
    "Topic: \"" + seed.subtopic + "\"\n" +
    "Level: " + level.toUpperCase() + "\n" +
    "Audience: " + levelGuide[level] + "\n\n" +
    "WRITING RULES (mandatory):\n" +
    "- Write a VERY DETAILED tutorial (3000-5000 words minimum in the content field).\n" +
    "- Professional tutorial tone — like a senior dev writing a definitive guide.\n" +
    "- Short paragraphs (2-3 lines max) for readability.\n" +
    "- MANY code examples throughout (at least 8-10 separate code blocks).\n" +
    "- Include comparison tables using markdown pipe tables where relevant.\n" +
    "- Use H2 (##) and H3 (###) headings liberally — at least 15-20 headings total.\n" +
    "- Include inline Q&A as ### sub-sections (e.g. ### Is X different from Y?) after relevant sections.\n" +
    "- Bold important terms with **term**.\n" +
    "- Every section should teach something actionable.\n" +
    "- Numbered steps for procedural sections (1. Step one\\n2. Step two).\n" +
    "- Bullet points for lists of features, tips, use cases.\n\n" +
    "Return ONLY a valid JSON object (no markdown fences, no extra text).\n" +
    "Schema: { \"title\": string, \"tags\": string[], \"excerpt\": string, \"content\": string, \"level\": \"" + level + "\" }\n\n" +
    "The title MUST be an SEO-friendly guide title like: \"" + seed.subtopic + " Guide with Examples\"\n" +
    "The excerpt must be 2-3 sentences summarizing what readers will learn.\n\n" +
    "The content field must use \\n for line breaks. Add a BLANK LINE (\\n\\n) between every section.\n" +
    "Follow this EXACT section layout (EVERY section is REQUIRED, write substantial content for each):\n\n" +

    "## How to Use " + seed.subtopic + " Quickly?\\n\\n" +
    "<2-3 sentence intro explaining the fastest way to use this>\\n\\n" +
    "<Show the simplest possible working example>\\n\\n" +
    "```" + lang + "\\n<5-8 line quick example with comments>\\n```\\n\\n" +

    "## How to " + seed.subtopic + " in Detail?\\n\\n" +
    "<3-4 paragraphs explaining how this works with a complete example. Explain the flow step by step.>\\n\\n" +
    "```" + lang + "\\n<10-20 line complete working example>\\n```\\n\\n" +
    "<Explain what the code does in 3-4 sentences>\\n\\n" +

    "## What is " + seed.subtopic + "?\\n\\n" +
    "<4-5 paragraphs explaining the concept in depth. What it is, why it exists, how it works internally, when it was introduced, and how it fits in the ecosystem.>\\n\\n" +

    "## When to Use " + seed.subtopic + "?\\n\\n" +
    "<Bullet list of 5-7 real scenarios where this is useful, each with 1-2 sentence explanation>\\n\\n" +

    "### Is " + seed.subtopic + " different from [related concept]?\\n\\n" +
    "<3-4 sentence comparison answering a common confusion>\\n\\n" +

    "### Does " + seed.subtopic + " trigger events?\\n\\n" +
    "<2-3 sentence technical answer>\\n\\n" +

    "## What is the Difference Between [Method A] and [Method B]?\\n\\n" +
    "<Explanation paragraph>\\n\\n" +
    "| Method | When to Use | Key Behavior | Speed |\\n" +
    "| --- | --- | --- | --- |\\n" +
    "<4-5 rows comparing related approaches>\\n\\n" +

    "## Step by Step Guide with Examples\\n\\n" +
    "<Numbered steps 1-6, each step has a ### sub-heading, brief explanation, and a code snippet>\\n\\n" +
    "### Step 1: <action>\\n\\n<explanation>\\n\\n```" + lang + "\\n<code>\\n```\\n\\n" +
    "### Step 2: <action>\\n\\n<explanation>\\n\\n```" + lang + "\\n<code>\\n```\\n\\n" +
    "### Step 3: <action>\\n\\n<explanation>\\n\\n```" + lang + "\\n<code>\\n```\\n\\n" +
    "<Continue for 4-6 steps total>\\n\\n" +

    "## Common Patterns and Variations\\n\\n" +
    "<Show 3-4 different code patterns with ### sub-headings and code blocks for each>\\n\\n" +

    "## Best Practices\\n\\n" +
    "<6-8 bullet points of actionable best practices, each with 1-2 sentence explanation>\\n\\n" +

    "### Advanced Tips for Stable " + seed.subtopic + "\\n\\n" +
    "<4-5 advanced tips for production use>\\n\\n" +

    "### Common Mistakes to Avoid\\n\\n" +
    "<5-6 bullet points of mistakes with brief explanation and how to fix>\\n\\n" +

    "## Common Issues and Fixes\\n\\n" +
    "### Why does [common problem 1] happen?\\n\\n" +
    "<Problem explanation>\\n\\n" +
    "```" + lang + "\\n// Incorrect\\n<wrong code>\\n\\n// Correct\\n<right code>\\n```\\n\\n" +
    "### Why does [common problem 2] happen?\\n\\n" +
    "<Problem explanation>\\n\\n" +
    "```" + lang + "\\n// Incorrect\\n<wrong code>\\n\\n// Correct\\n<right code>\\n```\\n\\n" +
    "### Why does [common problem 3] happen?\\n\\n" +
    "<Problem explanation + fix>\\n\\n" +

    "## Advanced Scenarios\\n\\n" +
    "<3-4 advanced use cases with ### sub-headings, each with detailed explanation and code example>\\n\\n" +

    "## Real World Use Cases\\n\\n" +
    "<4-5 practical examples with ### sub-headings showing real usage>\\n\\n" +
    "### Example: <use case 1>\\n\\n<code + explanation>\\n\\n" +
    "### Example: <use case 2>\\n\\n<code + explanation>\\n\\n" +
    "### Example: <use case 3>\\n\\n<code + explanation>\\n\\n" +

    "## Related Tutorials\\n\\n" +
    "<Bullet list of 4-5 related topics the reader should explore next, phrased as tutorial titles>\\n\\n" +

    "## Conclusion\\n\\n" +
    "<4-5 sentence wrap-up summarizing what was covered. Mention key methods/concepts learned. Suggest next steps for the reader.>\\n\\n" +

    "## FAQs\\n\\n" +
    "### <SEO question 1>?\\n\\n<3-4 sentence detailed answer>\\n\\n" +
    "### <SEO question 2>?\\n\\n<3-4 sentence detailed answer>\\n\\n" +
    "### <SEO question 3>?\\n\\n<3-4 sentence detailed answer>\\n\\n" +
    "### <SEO question 4>?\\n\\n<3-4 sentence detailed answer>\\n\\n" +
    "### <SEO question 5>?\\n\\n<3-4 sentence detailed answer>\\n\\n" +
    "### <SEO question 6>?\\n\\n<3-4 sentence detailed answer>\\n\\n" +
    "### <SEO question 7>?\\n\\n<3-4 sentence detailed answer>\\n\\n" +
    "### <SEO question 8>?\\n\\n<3-4 sentence detailed answer>"
  );
}

async function callGroq(prompt, apiKey, model) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey
    },
    body: JSON.stringify({
      model: model || "llama-3.1-8b-instant",
      temperature: 0.75,
      messages: [
        { role: "system", content: "You are a technical content expert. Return valid JSON only — no markdown fences, no explanation." },
        { role: "user", content: prompt }
      ]
    })
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error("Groq API " + response.status + ": " + errText);
  }
  const data = await response.json();
  return String(data?.choices?.[0]?.message?.content || "");
}

async function callGemini(prompt, apiKey, model) {
  const modelId = model || "gemini-1.5-flash";
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelId + ":generateContent?key=" + apiKey;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.75, responseMimeType: "application/json" }
    })
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error("Gemini API " + response.status + ": " + errText);
  }
  const data = await response.json();
  return String(data?.candidates?.[0]?.content?.parts?.[0]?.text || "");
}

async function callGitHubModels(prompt, apiKey, model) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min total timeout
  try {
    const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        temperature: 0.75,
        // Keep response size bounded to reduce token/minute throttling.
        max_tokens: 1600,
        messages: [
          { role: "system", content: "You are a technical content expert. Return valid JSON only — no markdown fences, no explanation." },
          { role: "user", content: prompt }
        ]
      }),
      signal: controller.signal
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      throw new Error("GitHub Models API " + response.status + ": " + errText);
    }
    const data = await response.json();
    return String(data?.choices?.[0]?.message?.content || "");
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callFreeAi(prompt, freeAiCfg, providerOverride) {
  const provider = String(providerOverride || freeAiCfg.provider || "groq").toLowerCase();
  if (provider === "gemini") {
    const apiKey = process.env[freeAiCfg.gemini?.apiKeyEnvVar || "GEMINI_API_KEY"] || "";
    if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set.");
    return callGemini(prompt, apiKey, freeAiCfg.gemini?.model);
  }
  if (provider === "copilot" || provider === "github") {
    const apiKey = process.env[freeAiCfg.copilot?.apiKeyEnvVar || "GITHUB_TOKEN"] || "";
    if (!apiKey) throw new Error("GITHUB_TOKEN environment variable is not set. Get a free PAT from https://github.com/settings/tokens");
    return callGitHubModels(prompt, apiKey, freeAiCfg.copilot?.model);
  }
  // Default: Groq
  const apiKey = process.env[freeAiCfg.groq?.apiKeyEnvVar || "GROQ_API_KEY"] || "";
  if (!apiKey) throw new Error("GROQ_API_KEY environment variable is not set.");
  return callGroq(prompt, apiKey, freeAiCfg.groq?.model);
}

const providerCooldownUntil = Object.create(null);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

function isRateLimitError(error) {
  const msg = String(error?.message || error || "").toLowerCase();
  return msg.includes("429") || msg.includes("ratelimit") || msg.includes("rate limit") || msg.includes("please wait");
}

function parseRetryAfterMs(error) {
  const msg = String(error?.message || error || "");
  const secMatch = msg.match(/please wait\s+(\d+)\s*seconds?/i);
  if (secMatch) return Number(secMatch[1]) * 1000;
  const retryAfterMatch = msg.match(/retry-after[:\s]+(\d+)/i);
  if (retryAfterMatch) return Number(retryAfterMatch[1]) * 1000;
  // Safe default for provider minute-window throttling.
  return 65000;
}

function setProviderCooldown(provider, ms) {
  const until = Date.now() + Math.max(1000, ms);
  providerCooldownUntil[provider] = Math.max(providerCooldownUntil[provider] || 0, until);
}

async function waitForProviderCooldown(provider) {
  const now = Date.now();
  const until = Number(providerCooldownUntil[provider] || 0);
  if (until > now) {
    const waitMs = until - now;
    console.log("  " + provider + " cooldown active. Waiting " + Math.ceil(waitMs / 1000) + "s...");
    await sleep(waitMs);
  }
}

async function callFreeAiWithRetry(prompt, freeAiCfg, provider, maxAttempts) {
  const attempts = Math.max(1, Number(maxAttempts || 4));
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    await waitForProviderCooldown(provider);
    try {
      return await callFreeAi(prompt, freeAiCfg, provider);
    } catch (error) {
      if (!isRateLimitError(error) || attempt === attempts) {
        throw error;
      }
      const baseWait = parseRetryAfterMs(error);
      const jitter = randomBetween(500, 2500);
      const waitMs = baseWait + jitter;
      setProviderCooldown(provider, waitMs);
      console.warn(
        "  " + provider + " rate-limited (attempt " + attempt + "/" + attempts + "). Retrying in " +
        Math.ceil(waitMs / 1000) + "s..."
      );
      await sleep(waitMs);
    }
  }
  throw new Error("Unexpected retry exit for provider: " + provider);
}

/**
 * Returns list of available providers based on configured API keys.
 */
function getAvailableProviders(freeAiCfg) {
  const providers = [];
  const primary = String(freeAiCfg.provider || "copilot").toLowerCase();
  // Always put primary provider first
  const allProviders = [primary, "copilot", "groq", "gemini"];
  const seen = new Set();
  for (const p of allProviders) {
    const name = (p === "github") ? "copilot" : p;
    if (seen.has(name)) continue;
    seen.add(name);
    if (name === "copilot" || name === "github") {
      if (process.env[freeAiCfg.copilot?.apiKeyEnvVar || "GITHUB_TOKEN"]) providers.push("copilot");
    } else if (name === "groq") {
      if (process.env[freeAiCfg.groq?.apiKeyEnvVar || "GROQ_API_KEY"]) providers.push("groq");
    } else if (name === "gemini") {
      if (process.env[freeAiCfg.gemini?.apiKeyEnvVar || "GEMINI_API_KEY"]) providers.push("gemini");
    }
  }
  return providers.length > 0 ? providers : [primary];
}

function repairTruncatedJson(text) {
  // Try to salvage a truncated JSON response by extracting fields individually
  const titleMatch = text.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const excerptMatch = text.match(/"excerpt"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const levelMatch = text.match(/"level"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const tagsMatch = text.match(/"tags"\s*:\s*(\[[^\]]*\])/);
  // Content is the largest field — grab from "content": " until end of available text
  const contentStart = text.indexOf('"content"');
  let content = "";
  if (contentStart !== -1) {
    const afterKey = text.substring(contentStart);
    const valueMatch = afterKey.match(/^"content"\s*:\s*"([\s\S]*)$/);
    if (valueMatch) {
      // Remove trailing incomplete JSON artifacts
      content = valueMatch[1]
        .replace(/"\s*}?\s*$/, "")  // trailing " or "}
        .replace(/\\\\/g, "\\")   // \\ → \ (must be first)
        .replace(/\\"/g, '"')      // \" → "
        .replace(/\\n/g, "\n");    // \n → newline
    }
  }
  if (!titleMatch) return null;
  let tags = [];
  if (tagsMatch) {
    try { tags = JSON.parse(tagsMatch[1]); } catch { tags = []; }
  }
  return {
    title: titleMatch[1].replace(/\\"/g, '"'),
    excerpt: excerptMatch ? excerptMatch[1].replace(/\\"/g, '"') : "",
    level: levelMatch ? levelMatch[1] : "beginner",
    tags,
    content: content || ""
  };
}

function parseFreeAiResponse(rawText, seed, index, cfg) {
  const cleaned = stripCodeFence(rawText.trim());
  let obj;
  try {
    obj = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { obj = JSON.parse(match[0]); } catch { /* fall through to repair */ }
    }
    if (!obj) {
      // Attempt to repair truncated JSON from long AI responses
      obj = repairTruncatedJson(cleaned);
      if (obj) {
        console.log("  Repaired truncated JSON for: " + (obj.title || seed.subtopic));
      } else {
        throw new Error("No valid JSON found in AI response.");
      }
    }
  }
  return normalizeAiPost(
    {
      ...obj,
      category: seed.category,
      level: obj.level || seed.level || "beginner",
      tags: Array.isArray(obj.tags) && obj.tags.length > 0 ? obj.tags : seed.tags
    },
    index,
    cfg
  );
}

function createFallbackPost(seed, index, cfg) {
  const tpl = TOPIC_LIBRARY.find((t) => t.topic === seed.topic) || TOPIC_LIBRARY[index % TOPIC_LIBRARY.length];
  const rotation = index % tpl.core.length;
  const core = tpl.core[rotation];
  const rules = [
    tpl.rules[rotation % tpl.rules.length],
    tpl.rules[(rotation + 1) % tpl.rules.length],
    tpl.rules[(rotation + 2) % tpl.rules.length]
  ];
  return {
    id: index + 1,
    category: seed.category,
    title: seed.subtopic,
    tags: seed.tags,
    excerpt: core.length > 140 ? core.slice(0, 137) + "..." : core,
    sourceUrl: "",
    createdAt: generatedTimestamp(Date.now(), index),
    level: seed.level || "beginner",
    content: buildDetailedContent({ topic: seed.topic, subtopic: seed.subtopic, core, rules, workflow: tpl.workflow, architecture: tpl.architecture, tryThis: tpl.tryThis, quizQ: tpl.quizQ, quizA: tpl.quizA, takeaway: tpl.takeaway })
  };
}

async function createFreeAiPostsWithWorkers(cfg, freeAiCfg) {
  const target = Number(cfg.targetPostCount || 4);
  const configuredConcurrency = Math.min(Number(freeAiCfg.concurrentWorkers || 5), 10);
  const configuredBatchDelayMs = Number(freeAiCfg.batchDelayMs || 2000);
  const maxRetriesPerProvider = Math.max(1, Number(freeAiCfg.maxRetriesPerProvider || 4));
  const useMultiProvider = Boolean(freeAiCfg.multiProvider);

  // Determine available providers for round-robin distribution
  const providers = useMultiProvider ? getAvailableProviders(freeAiCfg) : [freeAiCfg.provider || "copilot"];

  let concurrency = configuredConcurrency;
  let batchDelayMs = configuredBatchDelayMs;

  const isCopilotOnly = providers.length === 1 && providers[0] === "copilot";
  if (isCopilotOnly) {
    // Copilot has strict minute token windows; serialize requests to avoid 429 storms.
    concurrency = 1;
    const safeGap = Number(freeAiCfg.copilot?.minIntervalMs || 65000);
    batchDelayMs = Math.max(batchDelayMs, safeGap);
  }

  // Randomly pick 'target' seeds from the full 100 pool so each run gets fresh topics
  const shuffled = [...TOPIC_SEEDS].sort(() => Math.random() - 0.5);
  const seeds = shuffled.slice(0, target);
  const results = [];

  console.log("Free AI workers: " + seeds.length + " posts | " + concurrency + " concurrent | providers: " + providers.join(", ") + (useMultiProvider ? " (round-robin)" : ""));

  for (let i = 0; i < seeds.length; i += concurrency) {
    const batch = seeds.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      batch.map(async (seed, batchIdx) => {
        const index = i + batchIdx;
        const provider = providers[index % providers.length];
        const prompt = buildPostPrompt(seed);
        try {
          const raw = await callFreeAiWithRetry(prompt, freeAiCfg, provider, maxRetriesPerProvider);
          return parseFreeAiResponse(raw, seed, index, cfg);
        } catch (primaryErr) {
          // If multi-provider, retry with a different provider before giving up
          if (useMultiProvider && providers.length > 1) {
            const fallbackProvider = providers[(index + 1) % providers.length];
            console.log("  Worker " + (index + 1) + " retrying with " + fallbackProvider + " (was " + provider + ")");
            const raw = await callFreeAiWithRetry(prompt, freeAiCfg, fallbackProvider, maxRetriesPerProvider);
            return parseFreeAiResponse(raw, seed, index, cfg);
          }
          throw primaryErr;
        }
      })
    );

    settled.forEach((result, batchIdx) => {
      const index = i + batchIdx;
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        const reason = result.reason?.message || String(result.reason);
        console.warn("  Worker " + (index + 1) + " failed (" + seeds[index].subtopic + "): " + reason + " — using template fallback.");
        results.push(createFallbackPost(seeds[index], index, cfg));
      }
    });

    const done = Math.min(i + concurrency, seeds.length);
    process.stdout.write("  Progress: " + done + "/" + seeds.length + "\r");

    if (i + concurrency < seeds.length) {
      await new Promise((resolve) => setTimeout(resolve, batchDelayMs));
    }
  }

  console.log("\n  All workers finished.");
  return results;
}

async function generatePostBatch(cfg, mode, aiCfg, freeAiCfg, useFreeAi) {
  if (useFreeAi) {
    try {
      return await createFreeAiPostsWithWorkers(cfg, freeAiCfg);
    } catch (err) {
      console.warn("Free AI generation failed: " + (err.message || err) + ". Falling back to topic templates.");
      return createTopicPosts(cfg);
    }
  }

  if (mode === "pdf") {
    const pdfPath = await resolvePdfPath(cfg);
    if (!fs.existsSync(pdfPath)) {
      throw new Error("PDF not found at: " + pdfPath);
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const parsed = await pdf(pdfBuffer);
    return generatePostsFromText(parsed.text || "", cfg);
  }

  if (mode === "ai") {
    const aiPosts = await createAiPosts(cfg, aiCfg);
    if (aiPosts && aiPosts.length > 0) {
      return aiPosts;
    }
    return createTopicPosts(cfg);
  }

  return createTopicPosts(cfg);
}

async function generatePostsFromConfig(options = {}) {
  const config = loadConfig();
  const cfg = config.contentGeneration;
  const aiCfg = config.aiGeneration || {};
  const freeAiCfg = config.freeAiGeneration || {};
  const mode = ["pdf", "ai"].includes(cfg.sourceMode) ? cfg.sourceMode : "topics";
  const outputPath = path.resolve(__dirname, cfg.outputFile || "posts-data.js");

  const useFreeAi = freeAiCfg.enabled && cfg.autoGenerateOnEveryRun && mode !== "pdf";
  const posts = await generatePostBatch(cfg, mode, aiCfg, freeAiCfg, useFreeAi);

  const effectiveMode = useFreeAi ? "free-ai (" + (freeAiCfg.provider || "groq") + ")" : mode;

  // Accumulate: load existing posts, merge with dedup, then write
  const existingPosts = loadExistingPosts(outputPath);
  const dedupThreshold = cfg.dedupThreshold || 0.75;
  const hwm = getHighWaterMark();
  let allPosts = mergeAndDedupPosts(existingPosts, posts, dedupThreshold);

  if (allPosts.length < hwm && mode !== "pdf") {
    console.warn("  Detected post inventory below HWM (" + allPosts.length + "/" + hwm + "). Generating recovery posts before write.");

    for (let attempt = 1; attempt <= 4 && allPosts.length < hwm; attempt += 1) {
      const beforeCount = allPosts.length;
      const missing = hwm - allPosts.length;
      const recoveryCfg = {
        ...cfg,
        targetPostCount: Math.max(Number(cfg.targetPostCount || 1), missing)
      };

      console.log("  Recovery batch " + attempt + ": generating " + recoveryCfg.targetPostCount + " additional post(s).");
      const recoveryPosts = await generatePostBatch(recoveryCfg, mode, aiCfg, freeAiCfg, useFreeAi);
      allPosts = mergeAndDedupPosts(allPosts, recoveryPosts, dedupThreshold);

      if (allPosts.length === beforeCount) {
        console.warn("  Recovery batch " + attempt + " added no new unique posts.");
      }
    }
  }

  if (allPosts.length < hwm) {
    throw new Error("Unable to recover posts-data.js to high-water mark (" + allPosts.length + "/" + hwm + ").");
  }

  // Safety: backup before writing
  const backupPath = outputPath + ".bak";
  if (fs.existsSync(outputPath)) {
    fs.copyFileSync(outputPath, backupPath);
  }

  const outputContent = toPostsDataJs(allPosts);
  fs.writeFileSync(outputPath, outputContent, "utf8");

  // Verify: read back and check post count matches
  const verifiedCount = verifyWrittenPosts(outputPath);
  if (verifiedCount < existingPosts.length || verifiedCount < hwm) {
    const expected = Math.max(existingPosts.length, hwm);
    console.error("CRITICAL: Written file has " + verifiedCount + " posts but expected at least " + expected + " (HWM=" + hwm + "). Restoring backup.");
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, outputPath);
      console.error("Backup restored successfully.");
    }
    throw new Error("Post data verification failed — backup restored.");
  } else {
    console.log("  Verified: " + verifiedCount + " posts written successfully (HWM=" + hwm + ").");
    updateHighWaterMark(verifiedCount);
    // Clean up backup on success
    if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
  }

  if (!options.silent) {
    console.log("Generated " + posts.length + " new posts using '" + effectiveMode + "' mode.");
    console.log("Total posts on website: " + allPosts.length);
    console.log("Output: " + outputPath);
  }

  return { posts: allPosts, mode: effectiveMode, outputPath, config };
}

if (require.main === module) {
  generatePostsFromConfig().catch((error) => {
    console.error("Generation failed:", error.message || error);
    process.exit(1);
  });
}

module.exports = {
  generatePostsFromConfig,
  loadConfig
};
