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
  const clientPage = clientContent[activeItem.slug];

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
            {clientPage ? (
              <p>
                {clientPage.intro}
              </p>
            ) : (
              <p>
                This is the shell for the <strong>{activeItem.label}</strong> section. We can now
                build each footer topic one by one and load its actual content into this page.
              </p>
            )}
          </div>

          {clientPage ? (
            <>
              {clientPage.topCards ? (
                <div className="footer-info-grid">
                  {clientPage.topCards.map((card) => (
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

              {clientPage.sections ? (
                <div className="footer-page-placeholder-card footer-journey-card">
                  <div className="footer-journey-head">
                    <div>
                      <p className="footer-page-section-label">Client Guide</p>
                      <h3>{clientPage.highlightTitle}</h3>
                    </div>
                    {clientPage.highlightBody ? <p>{clientPage.highlightBody}</p> : null}
                  </div>

                  <div className="footer-journey-grid">
                    {clientPage.sections.map((section) => (
                      <article key={section.title} className="footer-journey-step">
                        <h4>{section.title}</h4>
                        <p>{section.body}</p>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {clientPage.bottomCards ? (
                <div className="footer-info-grid footer-info-grid-wide">
                  {clientPage.bottomCards.map((card) => (
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
