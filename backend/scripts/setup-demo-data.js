const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'demo123';

const demoAccounts = [
  {
    name: 'Aarav Mehta',
    email: 'aaravmehta@taskara.com',
    title: 'Brand Identity Designer',
    country: 'India',
    pricingModel: 'FIXED',
    price: 3500,
    category: 'Graphics & Design / Logo Design',
    serviceTitle: 'I will design a clean and memorable brand logo for your business',
    description:
      'I create professional logo concepts tailored to your niche, audience, and brand personality. This service includes concept development, polished final files, and a logo system that works well across social media, websites, and print assets.',
    experienceYears: 4,
    baseHourlyRate: 900,
    bio: 'Logo and identity designer focused on modern, practical branding for startups and local businesses.',
  },
  {
    name: 'Diya Kapoor',
    email: 'diyakapoor@taskara.com',
    title: 'Web Developer',
    country: 'India',
    pricingModel: 'PACKAGE',
    price: 18000,
    category: 'Programming & Tech / Website Development',
    serviceTitle: 'I will build a responsive business website with a complete launch-ready package',
    description:
      'This package is ideal for service businesses that need a modern website with key pages, mobile responsiveness, contact forms, and polished presentation. I focus on clean frontend implementation, usability, and a structure that is easy to maintain after launch.',
    experienceYears: 5,
    baseHourlyRate: 1400,
    bio: 'Frontend developer building fast, polished business websites and landing pages.',
  },
  {
    name: 'Rohan Sharma',
    email: 'rohansharma@taskara.com',
    title: 'SEO Specialist',
    country: 'India',
    pricingModel: 'HOURLY',
    price: 1200,
    category: 'Digital Marketing / Search Engine Optimization',
    serviceTitle: 'I will optimize your website SEO and improve technical search visibility',
    description:
      'I work on on-page SEO, search intent alignment, content structure, and technical fixes that improve visibility over time. This hourly service is useful for audits, targeted improvements, and ongoing optimization for growing websites.',
    experienceYears: 6,
    baseHourlyRate: 1200,
    bio: 'SEO consultant helping websites improve rankings, structure, and organic traffic quality.',
  },
  {
    name: 'Sana Iqbal',
    email: 'sanaiqbal@taskara.com',
    title: 'Content Writer',
    country: 'India',
    pricingModel: 'FIXED',
    price: 2200,
    category: 'Writing & Translation / Blog & Article Writing',
    serviceTitle: 'I will write a research-backed blog article that matches your brand tone',
    description:
      'I write clear, engaging blog content designed for readability, audience trust, and strong structure. This service works well for businesses that want informative long-form content with a professional voice and practical subject research.',
    experienceYears: 4,
    baseHourlyRate: 800,
    bio: 'Content writer focused on business blogs, thought leadership pieces, and clear web writing.',
  },
  {
    name: 'Kabir Nair',
    email: 'kabirnair@taskara.com',
    title: 'Video Producer',
    country: 'India',
    pricingModel: 'PACKAGE',
    price: 15000,
    category: 'Video & Animation / Explainer Videos',
    serviceTitle: 'I will produce a polished explainer video package for your product or service',
    description:
      'This package covers scripting support, scene planning, editing, motion design, and a final explainer that presents your offer clearly. It is best suited for startups, SaaS products, and service brands that want a professional presentation asset.',
    experienceYears: 5,
    baseHourlyRate: 1300,
    bio: 'Video producer creating explainer videos, promo edits, and polished visual storytelling assets.',
  },
  {
    name: 'Meera Joshi',
    email: 'meerajoshi@taskara.com',
    title: 'Voice Over Artist',
    country: 'India',
    pricingModel: 'FIXED',
    price: 3000,
    category: 'Music & Audio / Voice Over',
    serviceTitle: 'I will record a clear professional voice over for ads, reels, or videos',
    description:
      'I provide a clean and expressive voice over recording for brand videos, explainers, short ads, and digital campaigns. Audio is delivered with a polished finish, clear diction, and performance matched to the tone of your script.',
    experienceYears: 3,
    baseHourlyRate: 950,
    bio: 'Professional voice over artist delivering clean recordings for digital media and brand content.',
  },
  {
    name: 'Arjun Bhat',
    email: 'arjunbhat@taskara.com',
    title: 'Virtual Assistant',
    country: 'India',
    pricingModel: 'HOURLY',
    price: 700,
    category: 'Business / Virtual Assistant',
    serviceTitle: 'I will support your admin tasks, scheduling, research, and inbox management',
    description:
      'I help founders and busy professionals stay organized by handling recurring admin work, online research, scheduling, and structured support tasks. This hourly model is ideal when you need flexible assistance based on your workload.',
    experienceYears: 4,
    baseHourlyRate: 700,
    bio: 'Reliable virtual assistant supporting founders with admin workflows and day-to-day business tasks.',
  },
  {
    name: 'Nisha Verma',
    email: 'nishaverma@taskara.com',
    title: 'AI Automation Consultant',
    country: 'India',
    pricingModel: 'PACKAGE',
    price: 25000,
    category: 'AI Services / AI Chatbot Setup',
    serviceTitle: 'I will set up an AI chatbot package for customer support and lead capture',
    description:
      'This package includes chatbot flow setup, prompt design, business use-case alignment, and a customer-facing bot structure for support or lead capture. It is ideal for companies that want a practical first AI workflow in production.',
    experienceYears: 5,
    baseHourlyRate: 1600,
    bio: 'AI consultant building practical chatbot and automation systems for real business use cases.',
  },
  {
    name: 'Vikram Sethi',
    email: 'vikramsethi@taskara.com',
    title: 'Data Analyst',
    country: 'India',
    pricingModel: 'FIXED',
    price: 8500,
    category: 'Data & Analytics / Dashboard Creation',
    serviceTitle: 'I will build a business dashboard that turns raw data into clear insights',
    description:
      'I create reporting dashboards that help teams understand sales, operations, and performance trends quickly. This fixed-price service includes data structuring, metrics planning, and a final dashboard designed for decision-making.',
    experienceYears: 5,
    baseHourlyRate: 1100,
    bio: 'Data analyst building clear dashboards and reporting systems for small teams and service businesses.',
  },
  {
    name: 'Isha Rao',
    email: 'isharao@taskara.com',
    title: 'Cybersecurity Consultant',
    country: 'India',
    pricingModel: 'HOURLY',
    price: 1800,
    category: 'Cybersecurity & IT Support / Security Audit',
    serviceTitle: 'I will perform a practical security audit for your website or web application',
    description:
      'I review common security risks, access issues, configuration gaps, and exposed weaknesses in web systems. This hourly audit service is best for businesses that need professional guidance before launch or after a security concern.',
    experienceYears: 6,
    baseHourlyRate: 1800,
    bio: 'Cybersecurity consultant focused on practical audits, web risk review, and secure setup guidance.',
  },
  {
    name: 'Neel Malhotra',
    email: 'neelmalhotra@taskara.com',
    title: 'CRM Implementation Specialist',
    country: 'India',
    pricingModel: 'PACKAGE',
    price: 12000,
    category: 'Sales & CRM / CRM Setup',
    serviceTitle: 'I will set up your CRM pipeline package for leads, follow-ups, and sales tracking',
    description:
      'This package is built for growing teams that need a clean sales pipeline, lead stages, follow-up logic, and CRM structure they can actually use. I focus on a setup that is simple, trackable, and aligned with your sales process.',
    experienceYears: 5,
    baseHourlyRate: 1250,
    bio: 'CRM specialist helping teams organize leads, follow-ups, and pipeline visibility.',
  },
  {
    name: 'Tara Kulkarni',
    email: 'tarakulkarni@taskara.com',
    title: 'Legal Documentation Specialist',
    country: 'India',
    pricingModel: 'FIXED',
    price: 4000,
    category: 'Legal & Compliance / Contract Drafting',
    serviceTitle: 'I will draft a clear business contract tailored to your service requirements',
    description:
      'I draft clear and structured contract documents for service-based business engagements. This service is useful for freelancers, agencies, and startups that want better client clarity, stronger scope definition, and professional documentation.',
    experienceYears: 7,
    baseHourlyRate: 1500,
    bio: 'Legal documentation specialist helping service businesses use clear and practical agreements.',
  },
];

const orderCounts = [2, 3, 4, 2, 3, 5, 2, 4, 3, 2, 4, 3];
const reviewRatings = [5, 4, 5, 5, 4, 5, 4, 5, 5, 3, 4, 5, 5, 4, 5, 4, 5, 5, 4, 5, 3, 4, 5, 5, 4, 5, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 5];
const buyerReviewComments = [
  'Very smooth experience. The seller understood the brief and delivered exactly what I needed.',
  'Professional communication, strong quality, and the delivery was on time.',
  'The outcome matched the scope well and the workflow felt reliable throughout.',
  'Clear updates, good attention to detail, and a polished final result.',
  'Really solid service. I would comfortably hire this seller again.',
  'The seller handled the work professionally and the final output was useful right away.',
  'Good collaboration from start to finish and the quality was worth the price.',
  'Everything was delivered in a structured and dependable way.',
];
const sellerReplyComments = [
  'Thank you for the clear brief and smooth communication throughout the order.',
  'I appreciate the detailed feedback and would be happy to work together again.',
  'Thank you for the trust. It was a pleasure delivering this project for you.',
  'Glad the service met your expectations. Looking forward to future work together.',
];

const disputePlans = [
  {
    orderIndex: 1,
    raisedBy: 'buyer',
    status: 'RESOLVED',
    reason: 'The delivery was completed, but I needed one final clarification on the agreed scope before closing the matter.',
    firstMessage: 'I am raising this case because I wanted admin to review whether the final scope matched what was discussed.',
    adminReply: 'We reviewed the order history and asked both parties to clarify the final deliverables before resolving the case.',
    finalReply: 'Thank you. The explanation helped and I am satisfied with the resolution now.',
  },
  {
    orderIndex: 9,
    raisedBy: 'seller',
    status: 'UNDER_REVIEW',
    reason: 'The buyer requested extra revisions beyond the original scope, so I requested admin assistance.',
    firstMessage: 'I am requesting admin review because the revision requests now exceed what was included in the order.',
    adminReply: 'This case is under review. We are checking the original scope and revision limits mentioned in the service.',
    finalReply: 'I have shared the original delivery notes and revision details for review.',
  },
  {
    orderIndex: 18,
    raisedBy: 'buyer',
    status: 'OPEN',
    reason: 'I needed clarification about one missing handoff item after completion.',
    firstMessage: 'I am opening this dispute because one promised handoff file was not included in the final delivery.',
    adminReply: 'We have contacted the seller and asked them to respond with the missing handoff details.',
    finalReply: 'I have attached the checklist that shows the item I am referring to.',
  },
  {
    orderIndex: 28,
    raisedBy: 'seller',
    status: 'RESOLVED',
    reason: 'I raised this case after a misunderstanding about the final handoff, and admin helped close it cleanly.',
    firstMessage: 'I wanted an admin note on record because there was confusion around what counted as final delivery.',
    adminReply: 'We reviewed the conversation and confirmed that the delivered scope matched the accepted order terms.',
    finalReply: 'Understood. Thank you for reviewing it and documenting the resolution.',
  },
];

function daysAgo(days, hour = 10, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function getBuyerIndex(sellerIndex, iteration, totalUsers) {
  let buyerIndex = (sellerIndex + 2 + iteration * 3) % totalUsers;
  if (buyerIndex === sellerIndex) {
    buyerIndex = (buyerIndex + 1) % totalUsers;
  }
  return buyerIndex;
}

function shouldCreateChat(globalOrderIndex) {
  return globalOrderIndex % 10 < 7;
}

function orderAmount(account, iteration) {
  if (account.pricingModel === 'HOURLY') {
    const hours = 2 + (iteration % 4);
    return account.price * hours;
  }
  return account.price;
}

async function createOrderMessages(order, buyer, seller, createdAt, finalAt, globalOrderIndex) {
  if (!shouldCreateChat(globalOrderIndex)) {
    return 0;
  }

  const script = [
    { senderId: buyer.id, content: `Hi ${seller.name.split(' ')[0]}, I have just placed this order and shared the initial requirements.` },
    { senderId: seller.id, content: `Thanks ${buyer.name.split(' ')[0]}. I have reviewed the scope and I will keep you updated as I make progress.` },
    { senderId: buyer.id, content: 'Perfect. Please focus on quality and keep the delivery aligned with the original brief.' },
    { senderId: seller.id, content: 'Absolutely. I will share progress clearly and make sure the final delivery is clean and usable.' },
  ];

  const messagesToCreate = globalOrderIndex % 3 === 0 ? script.slice(0, 4) : script.slice(0, 3);

  for (let i = 0; i < messagesToCreate.length; i += 1) {
    const messageTime = addHours(createdAt, 3 + i * 8);
    await prisma.orderMessage.create({
      data: {
        orderId: order.id,
        senderId: messagesToCreate[i].senderId,
        content: messagesToCreate[i].content,
        createdAt: messageTime,
        updatedAt: messageTime,
      },
    });
  }

  return messagesToCreate.length;
}

async function updateSellerProfiles(users) {
  for (const user of users) {
    const reviews = await prisma.review.findMany({
      where: { revieweeId: user.id },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1))
      : 0;

    await prisma.providerProfile.update({
      where: { userId: user.id },
      data: {
        totalReviews,
        averageRating,
      },
    });
  }
}

async function main() {
  const adminRole = await prisma.role.upsert({ where: { name: 'admin' }, update: {}, create: { name: 'admin' } });
  const userRole = await prisma.role.upsert({ where: { name: 'user' }, update: {}, create: { name: 'user' } });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskara.com' },
    update: { roleId: adminRole.id, isActive: true },
    create: {
      name: 'Taskara Admin',
      email: 'admin@taskara.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      roleId: adminRole.id,
      isActive: true,
    },
  });

  await prisma.notification.deleteMany({});
  await prisma.disputeMessageAttachment.deleteMany({});
  await prisma.disputeMessage.deleteMany({});
  await prisma.dispute.deleteMany({});
  await prisma.orderMessageAttachment.deleteMany({});
  await prisma.orderMessage.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.serviceImage.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.providerProfile.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { not: 'admin@taskara.com' } } });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const createdUsers = [];

  for (const account of demoAccounts) {
    const user = await prisma.user.create({
      data: {
        name: account.name,
        email: account.email,
        passwordHash,
        roleId: userRole.id,
        isActive: true,
        title: account.title,
        country: account.country,
      },
    });

    await prisma.providerProfile.create({
      data: {
        userId: user.id,
        bio: account.bio,
        experienceYears: account.experienceYears,
        baseHourlyRate: account.baseHourlyRate,
        serviceRadiusKm: 25,
        averageRating: 0,
        totalReviews: 0,
        verified: false,
      },
    });

    const service = await prisma.service.create({
      data: {
        sellerId: user.id,
        title: account.serviceTitle,
        description: account.description,
        category: account.category,
        pricingModel: account.pricingModel,
        price: account.price,
        isActive: true,
      },
    });

    createdUsers.push({
      ...account,
      userId: user.id,
      serviceId: service.id,
    });
  }

  const createdOrders = [];
  let globalOrderIndex = 0;
  let totalChatThreads = 0;
  let totalMessages = 0;

  for (let sellerIndex = 0; sellerIndex < createdUsers.length; sellerIndex += 1) {
    const seller = createdUsers[sellerIndex];
    const serviceOrderCount = orderCounts[sellerIndex];

    for (let iteration = 0; iteration < serviceOrderCount; iteration += 1) {
      const buyerIndex = getBuyerIndex(sellerIndex, iteration, createdUsers.length);
      const buyer = createdUsers[buyerIndex];
      const createdAt = daysAgo(90 - globalOrderIndex * 2, 9 + (iteration % 3), 15);
      const completedAt = addHours(createdAt, 36 + iteration * 10);
      const amount = orderAmount(seller, iteration);
      const requirements = `Project requested by ${buyer.name}. Focus on a professional result, clean communication, and on-time delivery.`;

      const order = await prisma.order.create({
        data: {
          serviceId: seller.serviceId,
          buyerId: buyer.userId,
          sellerId: seller.userId,
          amount,
          requirements,
          status: 'COMPLETED',
          createdAt,
          updatedAt: completedAt,
        },
      });

      const messageCount = await createOrderMessages(order, { id: buyer.userId, name: buyer.name }, { id: seller.userId, name: seller.name }, createdAt, completedAt, globalOrderIndex);
      if (messageCount > 0) {
        totalChatThreads += 1;
        totalMessages += messageCount;
      }

      const rating = reviewRatings[globalOrderIndex % reviewRatings.length];
      const reviewAt = addHours(completedAt, 10 + (globalOrderIndex % 5));
      const reviewComment = buyerReviewComments[globalOrderIndex % buyerReviewComments.length];
      const addSellerReply = globalOrderIndex % 3 !== 1;

      await prisma.review.create({
        data: {
          orderId: order.id,
          reviewerId: buyer.userId,
          revieweeId: seller.userId,
          rating,
          comment: reviewComment,
          sellerReply: addSellerReply ? sellerReplyComments[globalOrderIndex % sellerReplyComments.length] : null,
          sellerReplyAt: addSellerReply ? addHours(reviewAt, 8) : null,
          createdAt: reviewAt,
          updatedAt: addSellerReply ? addHours(reviewAt, 8) : reviewAt,
        },
      });

      createdOrders.push({
        id: order.id,
        seller,
        buyer,
        createdAt,
        completedAt,
      });

      globalOrderIndex += 1;
    }
  }

  let disputesCreated = 0;
  for (const plan of disputePlans) {
    const target = createdOrders[plan.orderIndex];
    if (!target) {
      continue;
    }

    const raisedById = plan.raisedBy === 'buyer' ? target.buyer.userId : target.seller.userId;
    const disputeCreatedAt = addHours(target.completedAt, 18);
    const disputeUpdatedAt = addHours(disputeCreatedAt, plan.status === 'OPEN' ? 5 : 18);

    const dispute = await prisma.dispute.create({
      data: {
        orderId: target.id,
        buyerId: target.buyer.userId,
        sellerId: target.seller.userId,
        raisedById,
        reason: plan.reason,
        status: plan.status,
        createdAt: disputeCreatedAt,
        updatedAt: disputeUpdatedAt,
      },
    });

    await prisma.disputeMessage.create({
      data: {
        disputeId: dispute.id,
        senderId: raisedById,
        content: plan.firstMessage,
        createdAt: addHours(disputeCreatedAt, 1),
        updatedAt: addHours(disputeCreatedAt, 1),
      },
    });

    await prisma.disputeMessage.create({
      data: {
        disputeId: dispute.id,
        senderId: admin.id,
        content: plan.adminReply,
        createdAt: addHours(disputeCreatedAt, 6),
        updatedAt: addHours(disputeCreatedAt, 6),
      },
    });

    await prisma.disputeMessage.create({
      data: {
        disputeId: dispute.id,
        senderId: plan.raisedBy === 'buyer' ? target.buyer.userId : target.seller.userId,
        content: plan.finalReply,
        createdAt: addHours(disputeCreatedAt, 12),
        updatedAt: addHours(disputeCreatedAt, 12),
      },
    });

    disputesCreated += 1;
  }

  await updateSellerProfiles(createdUsers.map((user) => ({ id: user.userId })));

  const accounts = createdUsers.map((account) => ({
    name: account.name,
    email: account.email,
    password: DEMO_PASSWORD,
    serviceTitle: account.serviceTitle,
    category: account.category,
    pricingModel: account.pricingModel,
    price: account.price,
  }));

  console.log(JSON.stringify({
    adminKept: 'admin@taskara.com',
    createdUsers: createdUsers.length,
    createdServices: createdUsers.length,
    completedOrders: createdOrders.length,
    chatThreads: totalChatThreads,
    messages: totalMessages,
    disputes: disputesCreated,
    reviews: createdOrders.length,
    accounts,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
