import { Link, useParams } from "react-router-dom";
import logo from "../assets/logo.png";

type FooterNavItem = {
  label: string;
  slug: string;
};

type FooterNavGroup = {
  title: string;
  items: FooterNavItem[];
};

type FooterContentSection = {
  title: string;
  body: string;
};

type FooterContentCard = {
  eyebrow?: string;
  title: string;
  body: string;
  bullets?: string[];
};

type FooterContentData = {
  intro: string;
  guideLabel?: string;
  topCards?: FooterContentCard[];
  highlightTitle?: string;
  highlightBody?: string;
  sections?: FooterContentSection[];
  bottomCards?: FooterContentCard[];
};

const footerNavGroups: FooterNavGroup[] = [
  {
    title: "For Clients",
    items: [
      { label: "How Taskara Works", slug: "how-taskara-works" },
      { label: "Quality Guide", slug: "quality-guide" },
      { label: "Project Briefs", slug: "project-briefs" },
      { label: "Hiring Support", slug: "hiring-support" },
      { label: "Enterprise Solutions", slug: "enterprise-solutions" },
      { label: "Trust & Safety", slug: "trust-and-safety" },
    ],
  },
  {
    title: "For Sellers",
    items: [
      { label: "Become a Seller", slug: "become-a-seller" },
      { label: "Seller Handbook", slug: "seller-handbook" },
      { label: "Community Hub", slug: "community-hub" },
      { label: "Seller Success Stories", slug: "seller-success-stories" },
      { label: "Service Catalog Tips", slug: "service-catalog-tips" },
      { label: "Affiliate Program", slug: "affiliate-program" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", slug: "about" },
      { label: "Careers", slug: "careers" },
      { label: "Terms of Service", slug: "terms-of-service" },
      { label: "Privacy Policy", slug: "privacy-policy" },
      { label: "Press & News", slug: "press-and-news" },
      { label: "Contact", slug: "contact" },
    ],
  },
];

const defaultItem = footerNavGroups[0].items[0];

const howTaskaraWorksSteps = [
  {
    title: "1. Explore services",
    description:
      "Browse the marketplace, compare listings, open dedicated service pages, and review pricing, seller details, and ratings before making a decision.",
  },
  {
    title: "2. Place an order",
    description:
      "Once you find the right service, continue to order and create a proper marketplace transaction tied to that listing.",
  },
  {
    title: "3. Work happens inside the platform",
    description:
      "Buyers and sellers stay connected through order-linked messaging, updates, attachments, and delivery flow so communication stays organized.",
  },
  {
    title: "4. Complete, review, and build trust",
    description:
      "After the work is finished, the buyer can complete the order, leave a rating and review, and help strengthen marketplace trust for future users.",
  },
];

const howTaskaraWorksSignals = [
  "Dedicated service pages for every listing",
  "Buyer and seller order workspaces",
  "Messaging tied directly to each order",
  "Ratings, reviews, and public profiles",
  "Dispute support when an order needs help",
];

const clientContent: Record<string, FooterContentData> = {
  "how-taskara-works": {
    intro:
      "Taskara is built around a complete marketplace flow where clients can discover the right service, place orders, communicate clearly, receive delivery, and review the experience in one connected system.",
    guideLabel: "Client Guide",
    topCards: [
      {
        title: "For clients",
        body:
          "Clients can search for local and digital services, compare listings, review seller profiles, and order the service that best matches their needs.",
      },
      {
        title: "For sellers",
        body:
          "Sellers can create service listings, manage their own storefront, receive buyer orders, communicate inside the platform, and grow their reputation over time.",
      },
    ],
    highlightTitle: "How the Taskara flow works from start to finish",
    highlightBody:
      "The platform is designed to feel structured, transparent, and reliable for both sides of a service transaction.",
    sections: howTaskaraWorksSteps.map((step) => ({
      title: step.title,
      body: step.description,
    })),
    bottomCards: [
      {
        eyebrow: "Why It Matters",
        title: "A marketplace is more than listings",
        body:
          "Taskara is built so that services, orders, messaging, reviews, notifications, and disputes all connect together. That makes the platform feel like a real service marketplace rather than a simple directory.",
      },
      {
        eyebrow: "Core Signals",
        title: "What supports trust on Taskara",
        body: "",
        bullets: howTaskaraWorksSignals,
      },
    ],
  },
  "quality-guide": {
    intro:
      "The quality guide helps clients understand what a strong Taskara service looks like before placing an order, so expectations stay clear from the start.",
    guideLabel: "Client Guide",
    topCards: [
      {
        title: "What to review first",
        body:
          "Read the service title, description, deliverables, pricing, response history, and seller profile before ordering. A good listing should explain exactly what is being offered.",
      },
      {
        title: "What strong quality looks like",
        body:
          "Strong services are specific, realistic, professional in tone, and transparent about timelines, revisions, and scope.",
      },
    ],
    highlightTitle: "How to judge service quality before you buy",
    highlightBody:
      "Clients usually make better choices when they evaluate clarity, fit, and professionalism instead of focusing only on price.",
    sections: [
      {
        title: "Check listing clarity",
        body:
          "A quality listing should clearly explain what the seller will do, what is included, what is not included, and what the buyer should provide.",
      },
      {
        title: "Look at proof of trust",
        body:
          "Ratings, reviews, profile details, active services, and communication quality all help you understand whether the seller is reliable.",
      },
      {
        title: "Match the service to your need",
        body:
          "The best listing is not always the cheapest one. It is the one that best fits your actual requirement, budget, and timeline.",
      },
      {
        title: "Avoid vague promises",
        body:
          "If a listing feels too broad, unrealistic, or unclear about delivery, it is worth asking questions before placing the order.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Client Tip",
        title: "Ask before you commit",
        body:
          "If anything about a service feels unclear, use the platform workflow to understand the seller's process before making the purchase decision.",
      },
      {
        eyebrow: "Best Practice",
        title: "Compare value, not just price",
        body:
          "A slightly higher priced service can often save time and revision effort if the seller is more specialized and communicates more clearly.",
      },
    ],
  },
  "project-briefs": {
    intro:
      "A good project brief helps sellers understand exactly what you need. Better briefs usually lead to faster delivery, fewer revisions, and smoother communication.",
    guideLabel: "Client Guide",
    topCards: [
      {
        title: "Why briefs matter",
        body:
          "Sellers can only deliver strong work when the request is specific. A short but clear brief reduces confusion and saves time for both sides.",
      },
      {
        title: "What to include",
        body:
          "Mention your goal, preferred outcome, timeline, references, technical requirements, and anything the seller should avoid.",
      },
    ],
    highlightTitle: "What makes a useful project brief",
    highlightBody:
      "The goal is not to write something long. The goal is to give the seller enough context to do the job properly.",
    sections: [
      {
        title: "Explain the outcome",
        body:
          "Start by describing what you want the finished result to achieve. That helps the seller align their approach with your real objective.",
      },
      {
        title: "Share constraints early",
        body:
          "Mention deadlines, format requirements, brand rules, budget limits, or technical restrictions at the beginning instead of later in the order.",
      },
      {
        title: "Attach useful references",
        body:
          "Examples, screenshots, notes, and source material help the seller understand your expectations much faster.",
      },
      {
        title: "Keep communication practical",
        body:
          "Try to keep requirements consistent. Changing the brief repeatedly can delay delivery and create avoidable confusion.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Quick Prompt",
        title: "A simple way to brief a seller",
        body:
          "Describe what you need, who it is for, the final format you expect, the deadline, and any examples that match your vision.",
      },
      {
        eyebrow: "Client Reminder",
        title: "Clear input improves output",
        body:
          "The stronger your brief is, the easier it becomes for a seller to deliver high quality work with fewer back and forth revisions.",
      },
    ],
  },
  "hiring-support": {
    intro:
      "Hiring support on Taskara is about helping clients choose the right seller with better judgment, better questions, and better alignment before an order starts.",
    guideLabel: "Client Guide",
    topCards: [
      {
        title: "Start with fit",
        body:
          "The best seller is the one whose service, communication style, and workflow match your project needs, not simply the first result you see.",
      },
      {
        title: "Use platform signals",
        body:
          "Profiles, reviews, service descriptions, order history patterns, and response quality all help you evaluate whether a seller is a good fit.",
      },
    ],
    highlightTitle: "How to choose the right seller",
    highlightBody:
      "Good hiring decisions usually come from comparing relevance, clarity, and professionalism instead of rushing into the first available option.",
    sections: [
      {
        title: "Shortlist relevant services",
        body:
          "Focus first on sellers whose listings clearly match the work you need done. Relevance matters more than general popularity.",
      },
      {
        title: "Review communication quality",
        body:
          "Clear sellers usually explain scope, delivery, and expectations in a straightforward way. That is often a strong sign of a smoother order experience.",
      },
      {
        title: "Ask focused questions",
        body:
          "If you need clarification, ask practical questions about deliverables, timeline, revisions, or required input instead of broad open-ended questions.",
      },
      {
        title: "Choose for reliability",
        body:
          "A reliable seller gives confidence through clarity, consistency, and realistic promises. That matters more than a flashy description alone.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Hiring Advice",
        title: "Do not overbuy or underbuy",
        body:
          "Choose the seller whose service scope matches the actual work. Paying for the wrong fit can create friction even when the seller is talented.",
      },
      {
        eyebrow: "Platform Value",
        title: "Taskara keeps the process structured",
        body:
          "Once you choose a seller, the order, messaging, delivery, review, and dispute systems keep the transaction organized in one place.",
      },
    ],
  },
  "enterprise-solutions": {
    intro:
      "Enterprise solutions are for teams that need a more structured way to discover service providers, coordinate work, and maintain consistency across multiple projects.",
    guideLabel: "Client Guide",
    topCards: [
      {
        title: "Built for growing teams",
        body:
          "Taskara can support repeated hiring needs where teams want dependable workflows, easier coordination, and a cleaner view of marketplace activity.",
      },
      {
        title: "Useful for recurring work",
        body:
          "Whether the work is creative, technical, operational, or location based, recurring marketplace usage benefits from clearer structure and vendor consistency.",
      },
    ],
    highlightTitle: "What enterprise support means on Taskara",
    highlightBody:
      "This section is intended for organizations that want reliable marketplace processes, repeatable service usage, and more controlled collaboration.",
    sections: [
      {
        title: "Centralized discovery",
        body:
          "Teams can use the platform to discover specialized providers in one marketplace instead of handling sourcing in scattered channels.",
      },
      {
        title: "Structured transaction flow",
        body:
          "Orders, communication, delivery, reviews, and disputes remain linked, which makes follow-up much easier for multi-project use cases.",
      },
      {
        title: "Better accountability",
        body:
          "Public profiles, service details, and review signals help teams choose providers with more confidence and clearer expectations.",
      },
      {
        title: "Scalable marketplace usage",
        body:
          "As the number of services and projects grows, structured systems matter more. Taskara is being shaped with that long-term direction in mind.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Use Case",
        title: "Repeated hiring made simpler",
        body:
          "Teams that regularly need design, development, writing, operations, or local support can benefit from a single marketplace flow instead of fragmented sourcing.",
      },
      {
        eyebrow: "Direction",
        title: "Built with future growth in mind",
        body:
          "This section can later expand into larger-scale support, account workflows, and advanced organizational features as the platform grows.",
      },
    ],
  },
  "trust-and-safety": {
    intro:
      "Trust and safety on Taskara is about creating a marketplace where buyers and sellers can work with more confidence, clearer expectations, and better safeguards.",
    guideLabel: "Client Guide",
    topCards: [
      {
        title: "Why trust matters",
        body:
          "Service marketplaces depend on clear communication, reliable delivery, visible reputation, and fair processes when problems happen.",
      },
      {
        title: "How Taskara supports safety",
        body:
          "Public profiles, ratings, reviews, order-linked chat, delivery flow, notifications, and disputes all work together to reduce confusion and improve accountability.",
      },
    ],
    highlightTitle: "What helps keep the marketplace safe",
    highlightBody:
      "No platform can remove every risk, but strong structure makes it easier for users to make informed decisions and resolve issues properly.",
    sections: [
      {
        title: "Transparent profiles and listings",
        body:
          "Visible seller information, service details, pricing, and reviews help buyers understand who they are ordering from.",
      },
      {
        title: "Tracked order lifecycle",
        body:
          "Order states help both sides understand where work stands and provide a clearer record of what is happening.",
      },
      {
        title: "Messaging tied to the order",
        body:
          "Keeping communication linked to the transaction reduces confusion and makes it easier to reference earlier commitments or updates.",
      },
      {
        title: "Dispute support when needed",
        body:
          "If an order runs into serious issues, the dispute flow provides a structured way to raise concerns and involve platform oversight.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Safety Reminder",
        title: "Read before you buy",
        body:
          "Clients should always review service details, profile signals, and order expectations carefully before placing an order.",
      },
      {
        eyebrow: "Shared Responsibility",
        title: "Good outcomes come from both sides",
        body:
          "Buyers and sellers both help create a safer marketplace by communicating clearly, staying realistic, and using the platform workflow properly.",
      },
    ],
  },
};

const sellerContent: Record<string, FooterContentData> = {
  "become-a-seller": {
    intro:
      "Becoming a seller on Taskara means turning your skill into a structured service that buyers can discover, order, review, and return to again.",
    guideLabel: "Seller Guide",
    topCards: [
      {
        title: "Who Taskara is for",
        body:
          "Taskara supports both digital professionals and hyperlocal service providers, so sellers can offer online work as well as real-world services in their area.",
      },
      {
        title: "What you need to begin",
        body:
          "A clear service idea, realistic pricing, a strong title, a professional description, and a good understanding of what you can reliably deliver.",
      },
    ],
    highlightTitle: "How to get started as a seller",
    highlightBody:
      "The strongest sellers usually start simple, define their offer clearly, and build trust through consistency instead of trying to do everything at once.",
    sections: [
      {
        title: "Create a focused service",
        body:
          "Start with one service that is easy to explain and easy for buyers to understand. Clear offers convert better than vague all-in-one listings.",
      },
      {
        title: "Set practical pricing",
        body:
          "Choose pricing that reflects your effort, skill level, and delivery scope. Unrealistic pricing often leads to bad expectations on both sides.",
      },
      {
        title: "Write with clarity",
        body:
          "Explain what you do, what the buyer receives, how long it takes, and what input you need. Clear writing makes your listing feel more trustworthy.",
      },
      {
        title: "Build reputation over time",
        body:
          "Completed orders, good communication, strong reviews, and professional delivery all help you grow steadily on the platform.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Seller Reminder",
        title: "Start with a promise you can keep",
        body:
          "It is better to offer one strong service with a clear scope than to overpromise and struggle to deliver consistently.",
      },
      {
        eyebrow: "Growth Mindset",
        title: "Refine as you learn",
        body:
          "You can improve your service title, images, pricing, and positioning over time as you learn what buyers respond to most.",
      },
    ],
  },
  "seller-handbook": {
    intro:
      "The seller handbook is a practical guide to how professional sellers should present services, manage orders, communicate with buyers, and maintain quality on Taskara.",
    guideLabel: "Seller Guide",
    topCards: [
      {
        title: "What the handbook covers",
        body:
          "It gives sellers a clear idea of the standards expected in listings, delivery, revisions, messaging, and overall platform behavior.",
      },
      {
        title: "Why it matters",
        body:
          "Consistent seller habits improve buyer trust, reduce confusion, and create a better marketplace experience for everyone involved.",
      },
    ],
    highlightTitle: "Core practices every seller should follow",
    highlightBody:
      "A strong seller experience is usually built on responsiveness, honesty, organization, and a clear understanding of scope.",
    sections: [
      {
        title: "Be precise in your listing",
        body:
          "Your service page should explain exactly what you offer, what is included, and what the buyer should expect after ordering.",
      },
      {
        title: "Communicate early and clearly",
        body:
          "Use order-linked messaging to keep updates practical, answer questions directly, and avoid leaving buyers unsure about progress.",
      },
      {
        title: "Respect the agreed scope",
        body:
          "If the buyer asks for something outside the original service scope, clarify it instead of silently taking on mismatched work.",
      },
      {
        title: "Deliver professionally",
        body:
          "Well-structured delivery, clear notes, and timely updates often matter just as much as the work itself when it comes to buyer satisfaction.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Professional Standard",
        title: "Clarity beats complexity",
        body:
          "Buyers usually trust sellers who explain things simply, stay organized, and communicate with confidence.",
      },
      {
        eyebrow: "Long-Term Value",
        title: "Good habits build repeat business",
        body:
          "Reliable process and strong communication make buyers more likely to return and leave positive reviews.",
      },
    ],
  },
  "community-hub": {
    intro:
      "The community hub is the shared space for seller learning, platform knowledge, and collective marketplace improvement on Taskara.",
    guideLabel: "Seller Guide",
    topCards: [
      {
        title: "Why community matters",
        body:
          "Sellers improve faster when they can learn from common patterns, shared experiences, and practical marketplace advice.",
      },
      {
        title: "What belongs here",
        body:
          "Best practices, seller guidance, workflow ideas, platform tips, and support resources all fit naturally into a strong community hub.",
      },
    ],
    highlightTitle: "What the community hub is meant to support",
    highlightBody:
      "This space is intended to help sellers improve their services, make better marketplace decisions, and feel more connected to how the platform works.",
    sections: [
      {
        title: "Learning from real seller experience",
        body:
          "Patterns around listing quality, delivery flow, revisions, and buyer communication can help newer sellers avoid common mistakes.",
      },
      {
        title: "Sharing service growth ideas",
        body:
          "Sellers often benefit from seeing how others improve titles, descriptions, visuals, pricing, and positioning.",
      },
      {
        title: "Strengthening marketplace standards",
        body:
          "A stronger seller community usually leads to clearer listings, smoother orders, and a better experience for buyers as well.",
      },
      {
        title: "Creating room for future support",
        body:
          "This section can later expand into discussions, guides, updates, and other resources that help sellers grow on the platform.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Community Value",
        title: "Growth is easier when knowledge is shared",
        body:
          "Sellers do better when they can learn from platform patterns instead of figuring everything out alone.",
      },
      {
        eyebrow: "Future Direction",
        title: "A foundation for deeper seller resources",
        body:
          "The community hub gives Taskara a place to expand seller education and shared knowledge as the platform grows.",
      },
    ],
  },
  "seller-success-stories": {
    intro:
      "Seller success stories highlight how strong services, consistent delivery, and good communication can help providers grow on Taskara over time.",
    guideLabel: "Seller Guide",
    topCards: [
      {
        title: "Why success stories matter",
        body:
          "They make growth feel practical. Sellers can see that success usually comes from process, reliability, and focus rather than shortcuts.",
      },
      {
        title: "What strong stories show",
        body:
          "The best examples usually reveal how a seller positioned their service, improved quality, handled buyers well, and built trust gradually.",
      },
    ],
    highlightTitle: "What seller growth often looks like",
    highlightBody:
      "Most strong marketplace journeys are built step by step through clearer offers, better client experience, and steady reputation building.",
    sections: [
      {
        title: "Start with one clear offer",
        body:
          "Many successful sellers begin with a focused service instead of launching too many offers at the same time.",
      },
      {
        title: "Improve from buyer feedback",
        body:
          "Reviews, repeat questions, and revision patterns can all help a seller improve their listing and delivery process.",
      },
      {
        title: "Build trust through consistency",
        body:
          "Showing up on time, communicating properly, and delivering what was promised creates stronger long-term growth than flashy marketing alone.",
      },
      {
        title: "Turn quality into momentum",
        body:
          "Once a seller has strong reviews and clear positioning, it becomes easier for buyers to trust their services and order with confidence.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Seller Lesson",
        title: "Progress usually compounds",
        body:
          "Each well-handled order can strengthen your profile, improve your service quality, and make the next order easier to win.",
      },
      {
        eyebrow: "Mindset",
        title: "Consistency is often the real differentiator",
        body:
          "A seller who is dependable, organized, and clear often performs better over time than someone who only focuses on appearance.",
      },
    ],
  },
  "service-catalog-tips": {
    intro:
      "Service catalog tips help sellers shape listings that are easier to understand, easier to compare, and more compelling to buyers browsing the marketplace.",
    guideLabel: "Seller Guide",
    topCards: [
      {
        title: "Why your catalog matters",
        body:
          "Your service catalog is how buyers understand your offer. If it feels confusing or weak, they may leave before ordering.",
      },
      {
        title: "What a strong catalog does",
        body:
          "It makes your services look focused, professional, and intentional while helping buyers quickly understand what each listing is for.",
      },
    ],
    highlightTitle: "How to improve your service catalog",
    highlightBody:
      "A strong catalog usually feels consistent in pricing, messaging, visuals, and service structure instead of looking random or repetitive.",
    sections: [
      {
        title: "Avoid duplicate sounding listings",
        body:
          "Each service should have a distinct purpose. If multiple listings sound almost identical, buyers can get confused about what to choose.",
      },
      {
        title: "Use strong titles and images",
        body:
          "The title should explain the outcome clearly, and the service visuals should reinforce professionalism and relevance.",
      },
      {
        title: "Keep scope easy to compare",
        body:
          "Buyers should be able to understand what changes between your offerings, whether that is complexity, speed, format, or depth.",
      },
      {
        title: "Refine based on results",
        body:
          "If certain listings get more clicks or better conversion, that is useful feedback for improving the rest of your catalog.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Catalog Rule",
        title: "Every listing should earn its place",
        body:
          "If a service is not clearly different or clearly useful, it may be worth rewriting, merging, or repositioning it.",
      },
      {
        eyebrow: "Marketplace Effect",
        title: "A better catalog improves buyer confidence",
        body:
          "Organized service pages make your profile feel stronger and help buyers choose more quickly with less uncertainty.",
      },
    ],
  },
  "affiliate-program": {
    intro:
      "The affiliate program section is where Taskara can explain how partners, promoters, and community advocates may help bring more buyers and sellers to the marketplace.",
    guideLabel: "Seller Guide",
    topCards: [
      {
        title: "What this area represents",
        body:
          "It introduces the idea of marketplace growth through referrals, partnerships, and structured promotion rather than relying only on direct platform discovery.",
      },
      {
        title: "Why it matters",
        body:
          "Affiliate-style growth can help a marketplace expand reach while creating new opportunities for creators, communities, and ecosystem partners.",
      },
    ],
    highlightTitle: "How affiliate support can fit into Taskara",
    highlightBody:
      "This section acts as a foundation for future growth programs tied to referrals, awareness, and marketplace expansion.",
    sections: [
      {
        title: "Promote relevant services",
        body:
          "Partners should focus on bringing in buyers who are actually aligned with the kinds of services available on the platform.",
      },
      {
        title: "Support marketplace growth",
        body:
          "Affiliate participation can help bring visibility to sellers, increase buyer traffic, and strengthen category demand over time.",
      },
      {
        title: "Keep promotion trustworthy",
        body:
          "Good marketplace promotion should be clear, honest, and useful instead of exaggerated or misleading.",
      },
      {
        title: "Leave room for future expansion",
        body:
          "This section can later grow into a more complete referral or affiliate system with clearer program rules and incentives.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Growth Potential",
        title: "Partnership can strengthen marketplace reach",
        body:
          "Well-aligned promotion helps good services get discovered by the right audience instead of being lost in a crowded market.",
      },
      {
        eyebrow: "Future Program",
        title: "A base for structured referral growth",
        body:
          "This area gives Taskara a place to formalize referral or affiliate workflows later without redesigning the information architecture.",
      },
    ],
  },
};

const companyContent: Record<string, FooterContentData> = {
  about: {
    intro:
      "Taskara is a hyperlocal service marketplace built to connect buyers with service providers through a structured workflow that includes listings, orders, messaging, reviews, and platform support.",
    guideLabel: "Company Overview",
    topCards: [
      {
        title: "What Taskara stands for",
        body:
          "The platform is designed to make service discovery and service delivery feel organized, transparent, and professional for both clients and sellers.",
      },
      {
        title: "What makes it different",
        body:
          "Taskara supports both digital work and real-world local services, which makes it broader than a marketplace built only for one kind of provider.",
      },
    ],
    highlightTitle: "What Taskara is trying to build",
    highlightBody:
      "The goal is to create a marketplace where discovery, trust, transactions, and communication all work together instead of feeling disconnected.",
    sections: [
      {
        title: "A structured service journey",
        body:
          "From listing creation to order completion, the platform is organized around a complete service flow instead of acting like a simple classifieds board.",
      },
      {
        title: "Support for local and digital work",
        body:
          "Taskara is built for categories like design, development, writing, marketing, and also local services such as plumbing, deliveries, and home support.",
      },
      {
        title: "Trust through platform systems",
        body:
          "Profiles, reviews, messaging, disputes, and notifications all help users work with more confidence and clearer expectations.",
      },
      {
        title: "Built with long-term growth in mind",
        body:
          "The platform architecture leaves room for future features such as stronger admin tooling, richer analytics, and deeper marketplace support.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Positioning",
        title: "A marketplace with real product flow",
        body:
          "Taskara is designed around real interactions between buyers and sellers, not just static listing pages.",
      },
      {
        eyebrow: "Vision",
        title: "Hyperlocal and scalable",
        body:
          "The idea is to support services that can work within local communities while still being flexible enough for broader digital marketplace use.",
      },
    ],
  },
  careers: {
    intro:
      "The careers section represents the future team and growth direction of Taskara as the platform expands beyond a single project into a more complete product vision.",
    guideLabel: "Company Overview",
    topCards: [
      {
        title: "Why careers matter",
        body:
          "A growing marketplace eventually needs people across product, engineering, operations, support, moderation, and community growth.",
      },
      {
        title: "What this page is for",
        body:
          "It gives the platform a dedicated place to describe future opportunities, team culture, and the kinds of roles that would help Taskara grow.",
      },
    ],
    highlightTitle: "What a future Taskara team could focus on",
    highlightBody:
      "As the marketplace matures, growth will depend not only on code, but also on product direction, trust systems, user support, and community building.",
    sections: [
      {
        title: "Engineering and platform work",
        body:
          "Future contributors could improve marketplace stability, user experience, discovery systems, moderation tools, and internal platform operations.",
      },
      {
        title: "Operations and support",
        body:
          "As service volume grows, support and dispute handling become more important to maintaining trust across the platform.",
      },
      {
        title: "Growth and community",
        body:
          "A marketplace also needs people who understand community building, category expansion, seller development, and strategic growth.",
      },
      {
        title: "A place for future hiring information",
        body:
          "This section can later include roles, expectations, application steps, and a clearer view of how the Taskara team is evolving.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Long-Term View",
        title: "Products grow through people",
        body:
          "Behind every strong platform is a team that handles product decisions, trust, support, systems, and growth with care.",
      },
      {
        eyebrow: "Future Expansion",
        title: "Ready for a real team page later",
        body:
          "The structure is here so this section can grow into a proper careers page without changing the overall footer architecture.",
      },
    ],
  },
  "terms-of-service": {
    intro:
      "The Terms of Service section explains the rules, expectations, and platform boundaries that help Taskara operate in a structured and fair way.",
    guideLabel: "Company Overview",
    topCards: [
      {
        title: "Why terms exist",
        body:
          "Terms create shared expectations for how users interact with the platform, use services, and participate in marketplace activity.",
      },
      {
        title: "What they usually cover",
        body:
          "They normally define account usage, listing responsibility, order expectations, acceptable conduct, and how disputes or restrictions may be handled.",
      },
    ],
    highlightTitle: "What platform terms help protect",
    highlightBody:
      "Clear terms support users, protect the marketplace, and make it easier to define how the platform should be used responsibly.",
    sections: [
      {
        title: "Account and platform use",
        body:
          "Users are expected to use the platform in a lawful, respectful, and honest manner while maintaining accurate account information.",
      },
      {
        title: "Listing and service responsibility",
        body:
          "Sellers are responsible for presenting services clearly and accurately so buyers understand what they are ordering.",
      },
      {
        title: "Order and communication behavior",
        body:
          "Marketplace communication should remain professional, practical, and tied to the service transaction wherever possible.",
      },
      {
        title: "Moderation and enforcement",
        body:
          "Platforms need the ability to review issues, respond to misuse, and maintain a safe operating environment for the wider user base.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Purpose",
        title: "Rules support trust",
        body:
          "Terms are not only legal framing. They also help define what responsible participation looks like on the platform.",
      },
      {
        eyebrow: "Future Expansion",
        title: "Can be formalized later",
        body:
          "This page acts as the base for a fuller legal and policy section as the project grows further.",
      },
    ],
  },
  "privacy-policy": {
    intro:
      "The Privacy Policy section explains how user information is handled within Taskara and why privacy matters in a platform that manages accounts, services, orders, and communication.",
    guideLabel: "Company Overview",
    topCards: [
      {
        title: "Why privacy matters",
        body:
          "A marketplace naturally handles account details, listings, messages, orders, and profile information, so users should understand how that data is treated.",
      },
      {
        title: "What this page represents",
        body:
          "It gives Taskara a clear place to explain data responsibility, transparency, and the basic expectations around information handling.",
      },
    ],
    highlightTitle: "What a privacy policy should make clear",
    highlightBody:
      "Users should be able to understand what data is collected, why it is needed, and how the platform uses it to support marketplace activity.",
    sections: [
      {
        title: "Account and profile information",
        body:
          "Basic user identity and profile details help support authentication, visibility, trust, and marketplace participation.",
      },
      {
        title: "Service and order data",
        body:
          "Listings, orders, delivery updates, and related workflow details are part of how the platform enables real transactions.",
      },
      {
        title: "Messages and communication",
        body:
          "Order-linked messaging exists to keep service communication organized and easier to reference when needed.",
      },
      {
        title: "Platform responsibility",
        body:
          "A privacy policy should help users understand that data should be handled with care, purpose, and transparency.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "User Trust",
        title: "Transparency matters",
        body:
          "People are more comfortable using a platform when they understand how their information supports the product experience.",
      },
      {
        eyebrow: "Policy Growth",
        title: "A base for a fuller privacy document",
        body:
          "This section can later expand into a more formal privacy statement with deeper legal and technical detail.",
      },
    ],
  },
  "press-and-news": {
    intro:
      "The Press & News section gives Taskara a place to communicate platform milestones, announcements, updates, and public-facing progress over time.",
    guideLabel: "Company Overview",
    topCards: [
      {
        title: "Why this matters",
        body:
          "A marketplace grows through visibility, credibility, and momentum. Public updates help show how the platform is evolving.",
      },
      {
        title: "What belongs here",
        body:
          "Product announcements, feature releases, milestones, media mentions, launch updates, and important platform changes all fit naturally into this section.",
      },
    ],
    highlightTitle: "How press and updates support a marketplace",
    highlightBody:
      "A strong public presence helps users, partners, and future stakeholders understand where the platform is heading and what it is building.",
    sections: [
      {
        title: "Product announcements",
        body:
          "Major feature launches, admin tools, marketplace improvements, or trust and safety updates can be shared through this page.",
      },
      {
        title: "Growth milestones",
        body:
          "Marketplace stats, new categories, seller growth, and community progress can all help show development over time.",
      },
      {
        title: "Public storytelling",
        body:
          "Press content also helps shape how the platform is understood by external audiences beyond its current user base.",
      },
      {
        title: "A hub for future updates",
        body:
          "This section can later evolve into a dedicated news feed or media page as the project grows further.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Brand Value",
        title: "Visibility supports growth",
        body:
          "Public updates help a marketplace feel alive, active, and easier to trust from the outside.",
      },
      {
        eyebrow: "Future Direction",
        title: "Ready for structured announcements",
        body:
          "This gives Taskara a foundation for future launch notes, updates, and public progress stories.",
      },
    ],
  },
  contact: {
    intro:
      "The contact section provides a direct way to reach Taskara for questions, project communication, or general platform inquiries.",
    guideLabel: "Company Overview",
    topCards: [
      {
        title: "Get in touch",
        body:
          "If you need to reach Taskara for support, collaboration, or general communication, the details below can be used as the primary contact points.",
      },
      {
        title: "Best use of this page",
        body:
          "This space works well for project contact details, communication channels, and future support information as the platform continues to grow.",
      },
    ],
    highlightTitle: "Taskara contact information",
    highlightBody:
      "You can use the following details for direct communication related to the project and the platform.",
    sections: [
      {
        title: "Mobile number",
        body: "+917666082523",
      },
      {
        title: "Email address",
        body: "arbaazparkar15@gmail.com",
      },
      {
        title: "Project communication",
        body:
          "This contact page can also expand later into support, partnership, or team communication channels as Taskara grows.",
      },
      {
        title: "Response expectations",
        body:
          "As this is currently a project-stage platform, this section serves as a direct point of contact rather than a large support desk.",
      },
    ],
    bottomCards: [
      {
        eyebrow: "Direct Contact",
        title: "Simple and clear communication",
        body:
          "The goal of this page is to make it easy for someone to know exactly how to reach Taskara without searching elsewhere.",
      },
      {
        eyebrow: "Future Expansion",
        title: "Can grow into full support channels",
        body:
          "Later, this section can include support forms, business inquiries, and dedicated communication paths for different needs.",
      },
    ],
  },
};

const findItemBySlug = (slug?: string) => {
  if (!slug) {
    return defaultItem;
  }

  for (const group of footerNavGroups) {
    const item = group.items.find((entry) => entry.slug === slug);
    if (item) {
      return item;
    }
  }

  return defaultItem;
};

const FooterContentPage = () => {
  const { slug } = useParams();
  const activeItem = findItemBySlug(slug);
  const activePage =
    clientContent[activeItem.slug] ??
    sellerContent[activeItem.slug] ??
    companyContent[activeItem.slug];

  return (
    <div className="footer-page-shell">
      <div className="footer-page-header">
        <Link to="/" className="footer-page-brand" aria-label="Go to home">
          <img src={logo} alt="Taskara" className="footer-page-logo" />
        </Link>
      </div>

      <div className="footer-page-layout">
        <aside className="footer-page-sidebar">
          <p className="footer-page-kicker">TASKARA GUIDE</p>
          <h1>Information Center</h1>
          <p className="footer-page-intro">
            This page will hold the content linked from the footer across client, seller, and
            company sections.
          </p>

          <nav className="footer-page-nav" aria-label="Footer navigation">
            {footerNavGroups.map((group) => (
              <div key={group.title} className="footer-page-nav-group">
                <h2>{group.title}</h2>
                <ul>
                  {group.items.map((item) => {
                    const isActive = item.slug === activeItem.slug;

                    return (
                      <li key={item.slug}>
                        <Link
                          to={`/abouts/${item.slug}`}
                          className={isActive ? "active" : undefined}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <section className="footer-page-content">
          <div className="footer-page-card">
            <p className="footer-page-section-label">Selected Section</p>
            <h2>{activeItem.label}</h2>
            {activePage ? (
              <p>{activePage.intro}</p>
            ) : (
              <p>
                This is the shell for the <strong>{activeItem.label}</strong> section. We can now
                build each footer topic one by one and load its actual content into this page.
              </p>
            )}
          </div>

          {activePage ? (
            <>
              {activePage.topCards ? (
                <div className="footer-info-grid">
                  {activePage.topCards.map((card) => (
                    <article key={card.title} className="footer-page-placeholder-card footer-info-card">
                      {card.eyebrow ? <p className="footer-page-section-label">{card.eyebrow}</p> : null}
                      <h3>{card.title}</h3>
                      <p>{card.body}</p>
                      {card.bullets ? (
                        <ul className="footer-signal-list">
                          {card.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : null}

              {activePage.sections ? (
                <div className="footer-page-placeholder-card footer-journey-card">
                  <div className="footer-journey-head">
                    <div>
                      <p className="footer-page-section-label">
                        {activePage.guideLabel ?? "Guide"}
                      </p>
                      <h3>{activePage.highlightTitle}</h3>
                    </div>
                    {activePage.highlightBody ? <p>{activePage.highlightBody}</p> : null}
                  </div>

                  <div className="footer-journey-grid">
                    {activePage.sections.map((section) => (
                      <article key={section.title} className="footer-journey-step">
                        <h4>{section.title}</h4>
                        <p>{section.body}</p>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {activePage.bottomCards ? (
                <div className="footer-info-grid footer-info-grid-wide">
                  {activePage.bottomCards.map((card) => (
                    <article key={card.title} className="footer-page-placeholder-card footer-info-card">
                      {card.eyebrow ? <p className="footer-page-section-label">{card.eyebrow}</p> : null}
                      <h3>{card.title}</h3>
                      {card.body ? <p>{card.body}</p> : null}
                      {card.bullets ? (
                        <ul className="footer-signal-list">
                          {card.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="footer-page-placeholder-grid">
              <article className="footer-page-placeholder-card">
                <h3>Overview Block</h3>
                <p>Reserved for the main introduction and top-level explanation for this section.</p>
              </article>

              <article className="footer-page-placeholder-card">
                <h3>Details Block</h3>
                <p>
                  Reserved for policies, guidance, FAQs, resources, or long-form marketplace copy.
                </p>
              </article>

              <article className="footer-page-placeholder-card">
                <h3>Action Block</h3>
                <p>Reserved for links, calls to action, contact methods, or follow-up navigation.</p>
              </article>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FooterContentPage;
