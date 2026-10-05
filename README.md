# CampusMart — Student Marketplace & Entrepreneurship Platform

> **"Your Campus. Your Marketplace. Buy. Sell. Build."**

CampusMart is a full-stack e-commerce marketplace and entrepreneurship hub built for undergraduate university students. It empowers students to buy products directly from peers, launch their own student storefronts, eliminate shipping costs with safe campus quad handoffs, and build real businesses between lectures.

---

## 1. System Architecture & Database Design

### Technology Stack
- **Frontend / Client**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend & Persistence**: Modular storage service with localStorage client sync and direct drop-in compatibility with **Supabase PostgreSQL & Row Level Security (RLS)**.
- **Database Schema**: Full production SQL migration provided in `supabase_schema.sql` with tables for profiles, stores, categories, products, orders, order_items, reviews, conversations, messages, notifications, reports, and blog posts.
- **Authentication**: Role-based access control (RBAC) with 5 distinct permission levels.
- **Deployment**: Configured for instant deployment on Vercel or cloud runtimes.

---

## 2. The 5 Account Roles & Permission Matrix

| Role | Target Persona | Key Capabilities | Restricted From |
| :--- | :--- | :--- | :--- |
| **Customer / Buyer** | General student | Browse products, search & filter by campus, add to cart & wishlist, multi-step checkout, track orders, review purchased items, direct-message sellers. | Admin functions, seller inventory. |
| **Seller / Store Owner** | Student entrepreneurs | Manage their store brand, upload logo/banner, set physical campus pickup hub, add/edit/delete products, manage inventory & stock, fulfill orders, view revenue analytics. | Cannot modify other sellers' stores or products. |
| **Editor** | Student council / moderator | Review listing moderation queue, approve/suspend suspicious items, resolve peer safety reports, moderate reviews, curate featured products. | Platform code, admin role management, global credentials. |
| **Author** | Campus business journalist | Draft and publish campus founder stories, business guides, and hustler tips; manage article status and track reader views & likes. | Managing products globally, financial settings. |
| **Administrator** | Platform Co-Founders | Full platform oversight: total GMV, global order monitor, user management (promote, demote, suspend accounts), store verification, platform announcement controls. | N/A (Superuser). |

---

## 3. Demo Test Accounts

CampusMart includes an interactive **Testing Mode Bar** at the top of the interface allowing instant 1-click role switching between all 5 accounts:

1. **Customer**: Maya Lin (`maya.buyer@campus.edu`) — Junior studying Architecture; has past orders and active wishlist items.
2. **Seller**: Ayomide Bello (`ayomide.tech@campus.edu`) — Senior Electrical Engineering student; founder of **Ay's Tech Store**.
3. **Editor**: Sarah Jenkins (`sarah.editor@campus.edu`) — Student Union Marketplace Moderator; listing and report moderation.
4. **Author**: David Kim (`david.author@campus.edu`) — Campus Journalist; writes founder spotlights and logistics guides.
5. **Administrator**: Alex Rivera (`admin@campusmart.edu`) — Platform Co-Founder; user role delegation and system controls.

---

## 4. Supabase Setup & Deployment

To deploy this marketplace to Supabase:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Copy and run the contents of `supabase_schema.sql` (located in the root folder).
4. Configure your `.env` file with your project keys:
   ```env
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-public-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

---

## 5. Vercel Deployment Instructions

1. Push this repository to GitHub or GitLab.
2. Import the project into your Vercel Dashboard.
3. Configure the environment variables from `.env.example` in Vercel **Settings > Environment Variables**.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click **Deploy**.
