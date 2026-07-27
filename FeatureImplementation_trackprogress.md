# 🍽 Restaurant Platform — Feature Implementation Checklist

---

## PHASE 1 — Foundation (Weeks 1–2)

### Project Setup

- [x] Initialize Next.js project with TypeScript
- [x] Configure Tailwind CSS + shadcn/ui
- [x] Set up PostgreSQL database (Supabase or Railway)
- [x] Set up Prisma ORM and connect to database
- [x] Write and run initial Prisma schema migration
- [x] Seed database with default data (cities, plans, complaint categories, permissions)
- [ ] Set up Cloudinary for image uploads
- [ ] Deploy project skeleton to Vercel

---

## PHASE 2 — Authentication & Roles (Weeks 3–4)

### Super Admin Auth

- [ ] Super admin registration (first user only, locked after)
- [ ] Super admin login page
- [ ] Super admin protected route middleware

### Restaurant Owner / Staff Auth

- [ ] Restaurant owner registration page
- [ ] Login page (shared for all roles)
- [ ] JWT session management with NextAuth.js
- [ ] Password reset via email
- [ ] Invite staff by email flow
- [ ] Role assignment on invite (owner, manager, viewer)
- [ ] Permission check middleware (RBAC — per route and per UI element)

---

## PHASE 3 — Super Admin Dashboard (Weeks 5–6)

### Restaurant Management

- [ ] List all restaurants (active / inactive / pending)
- [ ] View individual restaurant details
- [ ] Activate / deactivate restaurant account
- [ ] Manually record a payment and activate subscription
- [ ] View subscription status per restaurant (active, overdue, expired)
- [ ] Filter restaurants by city, plan, status

### Platform Analytics (Super Admin)

- [ ] Total restaurants on platform
- [ ] Total reviews submitted platform-wide
- [ ] Total complaints platform-wide
- [ ] Revenue overview (per month)
- [ ] Most active cities

### Audit Logs

- [ ] View full audit log (who did what, when, on which restaurant)
- [ ] Filter audit logs by user, restaurant, action type

---

## PHASE 4 — Restaurant Setup (Weeks 7–8)

### Restaurant Profile

- [ ] Create restaurant profile (name, slug, city, address, phone, WhatsApp)
- [ ] Upload logo and cover image
- [ ] Add opening hours (per day)
- [ ] Add social media links (Instagram, Facebook)
- [ ] Add GPS coordinates (latitude/longitude)
- [ ] Edit restaurant profile

### Branch Management (Premium)

- [ ] Add a branch (name, address, city)
- [ ] Activate / deactivate a branch
- [ ] Assign staff to a specific branch

### Staff Management

- [ ] View all staff members
- [ ] Invite a new staff member by email
- [ ] Assign or change staff role
- [ ] Deactivate a staff member
- [ ] View staff member activity

### Roles & Permissions

- [ ] View default roles (owner, manager, viewer)
- [ ] Create a custom role
- [ ] Assign permissions to a custom role
- [ ] Edit or delete a custom role

---

## PHASE 5 — Menu (Week 9)

### Menu Images

- [ ] Upload menu images (up to 5 photos)
- [ ] Reorder menu image pages (drag and drop)
- [ ] Delete a menu image
- [ ] Preview menu as customer would see it

---

## PHASE 6 — Customer-Facing Page (Week 10)

### Public Restaurant Page (accessed via QR scan)

- [ ] Display restaurant logo, name, city
- [ ] Display opening hours
- [ ] Display phone and WhatsApp button
- [ ] Display menu images (swipeable, pinch-to-zoom on mobile)
- [ ] Display photo gallery
- [ ] Display average ratings
- [ ] Review form (ratings + complaint + suggestion)

### QR Code

- [ ] Auto-generate unique QR code per restaurant on creation
- [ ] Auto-generate unique QR code per branch
- [ ] Download QR code as PNG
- [ ] Download QR code as PDF (print-ready)
- [ ] Regenerate QR code (invalidates old one)

---

## PHASE 7 — Reviews & Complaints (Weeks 11–12)

### Reviews

- [ ] Customer submits review (overall, food, service, atmosphere, cleanliness)
- [ ] Customer selects would_recommend (yes/no)
- [ ] Customer leaves a comment (optional)
- [ ] Customer selects table number (optional)
- [ ] Restaurant dashboard — view all reviews
- [ ] Filter reviews by rating, date, branch
- [ ] Average rating display per category

### Complaints

- [ ] Customer reports a problem (category + description + optional employee name)
- [ ] Complaint automatically created from review
- [ ] Manager views all complaints
- [ ] Manager updates complaint status (pending → in progress → resolved)
- [ ] Manager adds internal note to complaint
- [ ] Filter complaints by status, category, employee, branch
- [ ] Notify manager by email when new complaint arrives

---

## PHASE 8 — Employee Management (Week 13)

### Employees

- [ ] Add employee (name, photo, job title, branch)
- [ ] Deactivate employee
- [ ] Link complaint to a specific employee
- [ ] View employee complaint history
- [ ] Employee performance summary (total complaints, total positive mentions, average rating from reviews that mention them)

---

## PHASE 9 — Analytics Dashboard (Weeks 14–15)

### Restaurant Analytics

- [ ] Weekly average rating chart
- [ ] Monthly average rating chart
- [ ] Rating trend over time (line chart)
- [ ] Complaints by category (bar or pie chart)
- [ ] Most mentioned employees (positive and negative)
- [ ] Would recommend percentage
- [ ] Reviews per day/week/month
- [ ] Filter all analytics by branch

### Super Admin Analytics

- [ ] Platform-wide rating trends
- [ ] City-by-city performance comparison
- [ ] Top rated restaurants
- [ ] Most complained-about restaurants
- [ ] Subscription revenue per month

---

## PHASE 10 — Gallery (Week 16)

### Photo Gallery

- [ ] Upload restaurant photos (up to 20 images)
- [ ] Add caption to each photo
- [ ] Reorder gallery images
- [ ] Delete a gallery image
- [ ] Display gallery on public customer page

---

## PHASE 11 — Public Directory (Weeks 17–18)

### Homepage

- [ ] Search restaurants by city
- [ ] Search restaurants by cuisine / category
- [ ] Featured restaurants section (Premium plan)
- [ ] Recently added restaurants

### Restaurant Directory Page

- [ ] Browse all restaurants in a city
- [ ] Filter by rating, cuisine type, price range
- [ ] Restaurant card (logo, name, city, average rating, short description)

### Public Restaurant Profile Page

- [ ] Full restaurant info (name, address, hours, phone, WhatsApp, social)
- [ ] Average ratings display
- [ ] Photo gallery
- [ ] Menu images viewer
- [ ] Google Maps embed (using coordinates)
- [ ] Public reviews list (most recent first)

---

## PHASE 12 — Notifications (Week 19)

- [ ] Email notification to manager on new complaint
- [ ] Email notification to manager on new low rating (1–2 stars)
- [ ] Email notification to restaurant owner when subscription is about to expire (7 days before)
- [ ] Email notification to super admin when a new restaurant registers
- [ ] In-app notification bell (mark as read)

---

## PHASE 13 — Polish & Launch (Week 20)

### Security

- [ ] Rate limiting on review submission (prevent spam)
- [ ] Input validation and sanitization on all forms
- [ ] CSRF protection
- [ ] SQL injection protection (Prisma handles this, verify)
- [ ] Secure image upload validation (file type + size limits)

### Performance

- [ ] Image optimization (Next.js Image component)
- [ ] Lazy loading for gallery and menu images
- [ ] Caching for public restaurant pages (ISR with Next.js)
- [ ] Database indexes on frequently queried columns (restaurant_id, slug, city_id, created_at)

### Testing

- [ ] Test all auth flows (login, invite, reset password)
- [ ] Test QR code scan on real mobile device
- [ ] Test review form on mobile
- [ ] Test image upload and display
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

### Launch

- [ ] Set up custom domain
- [ ] Configure environment variables on Vercel
- [ ] Final database backup strategy
- [ ] Onboard first restaurant manually

---

## FUTURE FEATURES (Post-Launch)

- [ ] AI summary of reviews per restaurant (OpenAI API)
- [ ] Online table reservation system
- [ ] Customer loyalty card (QR-based points)
- [ ] Digital menu (structured items with prices) as Premium upsell
- [ ] Online ordering
- [ ] SMS notifications (via Africa's Talking API — Rwanda-friendly)
- [ ] Multi-language support (English + Kinyarwanda)
- [ ] Mobile app (React Native)
- [ ] Discount coupon system
- [ ] Integration with payment gateways (MTN MoMo, Airtel Money)

