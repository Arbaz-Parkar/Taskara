# Taskara

Taskara is a hyperlocal service marketplace built as my final year project and also my first full stack web application. The idea behind it is simple: users should be able to create service listings, discover local or digital service providers, place orders, chat, leave reviews, raise disputes, and manage everything through a proper marketplace workflow.

This project started as a basic service listing platform, but while building it I kept pushing it closer to how a real marketplace works. By the end, it became a much bigger system with separate buyer and seller flows, admin moderation, profiles, reviews, notifications, disputes, and route-based dashboards.

## What Taskara does

Taskara is designed around the full service marketplace journey:

1. A seller creates a service
2. A buyer browses the marketplace and opens a dedicated service page
3. The buyer places an order
4. Buyer and seller communicate through order-linked messaging
5. The seller delivers work and the order moves through status stages
6. The buyer completes the order and leaves a review
7. If something goes wrong, a dispute can be raised and handled through admin

The platform supports both digital services and real-world services. That includes categories like design, programming, writing, marketing, and also local services like plumbing, deliveries, car washing, electricians, cooking, lawn mowing, and more.

## Main features

- User authentication and protected routes
- Separate user dashboard and admin dashboard
- Service creation, editing, status management, and deletion
- Service images with support for multiple uploads
- Dedicated public service pages
- Public user profiles with active services, ratings, and reviews
- Order system with lifecycle states such as pending, accepted, in progress, delivered, completed, and cancelled
- Buyer and seller order views
- Order-linked messaging system
- Attachments and file delivery support in chat
- Reviews and ratings after completed orders
- Seller replies to reviews
- Settings page with profile and account controls
- Avatar upload and profile photo support
- Notification center tied to real platform events
- Dispute center with evidence upload, case timeline, and admin-user conversation
- Admin dashboard with overview, users, services, orders, and reports sections
- Marketplace search, filters, and ranking improvements

## Tech stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Custom CSS

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcrypt for password hashing

## Project structure

```text
Taskara/
  backend/
    prisma/
    scripts/
    src/
    uploads/
  frontend/
    public/
    src/
```

## How to run the project

### Backend

From the `backend` folder:

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend

From the `frontend` folder:

```bash
npm install
npm run dev
```

The frontend runs through Vite and the backend runs on Express with Prisma connected to PostgreSQL.

## Demo accounts

These accounts are available in the project for testing:

### Admin

- Email: `admin@taskara.com`
- Password: `admin123`

### User

- Email: `user@taskara.com`
- Password: `user123`

Only `admin@taskara.com` is intended to behave as the admin account.

## What I learned from building this project

This project taught me a lot because it was the first time I built a complete application from frontend to backend instead of just isolated pages or small practice projects.

The biggest thing I learned was how much planning matters in a real system. At the beginning I mostly focused on getting pages to work, but once features like orders, messaging, reviews, profiles, admin controls, and disputes started connecting to each other, I understood why structure, naming, routes, and database design are so important. A small shortcut in one place can create confusion in many other places later.

I also learned how a full stack app is not just about writing UI. The frontend might be what users see, but the backend is what makes the application feel real. Building APIs, handling authentication, managing order states, storing uploads, connecting data with Prisma, and making sure different user roles see the correct things gave me a much better understanding of how real platforms work.

Another major lesson was state management and data flow. Early on, I had a lot happening in one dashboard page, and it became messy very quickly. Refactoring that into separate pages and route-based sections made the app cleaner and easier to maintain. That showed me why separation of concerns is not just theory. It genuinely makes development easier.

I learned a lot about database thinking as well. Before this project, I did not fully appreciate how important relationships are between users, services, orders, reviews, disputes, messages, and notifications. Prisma helped me understand models and relations in a practical way because every new feature depended on getting that part right.

I also improved a lot in debugging. Many issues were not huge coding mistakes, but small things like wrong imports, mismatched route behavior, stale TypeScript errors, layout problems, encoding issues, image handling bugs, or UI states not syncing properly with backend data. Fixing those problems taught me patience and made me much more comfortable reading through my own code and tracing what was actually happening.

On the design side, I learned that building something that works is only one part of the job. Making it feel polished is another challenge entirely. I spent a lot of time improving the red and white visual theme, making pages consistent, cleaning clutter, separating concerns into proper pages, and making the app feel more like a real marketplace instead of just a college CRUD project.

Probably the most important thing I learned is how features depend on each other. A marketplace is not just listings. Orders make the platform real. Messaging makes orders usable. Reviews create trust. Profiles create identity. Admin tools create control. Notifications improve usability. Disputes handle edge cases. Building Taskara helped me understand product flow, not just code.

## Why I built Taskara this way

I wanted this project to feel closer to a real marketplace product rather than a simple demo. That is why I kept expanding it into something that includes both seller-side and buyer-side experiences, public profiles, admin tools, moderation features, and support workflows. Since Taskara is positioned as a hyperlocal service marketplace, I also wanted it to support both online work and location-based services.

## Current status

Taskara is already in a strong state for a final year project. It includes the major core marketplace systems and shows both technical depth and product thinking. There is still room for future improvements like real payments, stronger analytics, deeper admin moderation, and more advanced ranking, but the current version already covers the full marketplace flow in a meaningful way.

## Future improvements

Some things that can still be added later:

- Real payment integration
- Better search ranking and recommendation logic
- Real-time messaging with websockets
- More advanced admin moderation tools
- Payout system for sellers
- Saved services or wishlist
- Stronger analytics and reporting
- Email notifications
- Deployment to production

## Final note

Taskara was the project where I went from building screens to building a system. Since this was my first full stack application, I learned not just how to code features, but how different parts of a product connect together. More than anything, this project helped me understand how a real-world web application is planned, built, debugged, and improved step by step.
