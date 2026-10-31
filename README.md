# Ozone Mall, Ojhar — Modern Full-Stack Website & Admin CMS

A complete, modern, responsive, and database-connected retail and lifestyle destination website for **Ozone Mall, Ojhar, Maharashtra, India**, featuring an integrated **Content Management Admin Panel**.

---

## 🏬 Overview

Ozone Mall is the premier retail, dining, and family entertainment hub situated on the Mumbai-Agra Highway (NH-3) in Ojhar, Nashik District, Maharashtra. This full-stack application includes:
1. **Public-Facing Website:** Immersive lifestyle design, store directory with search/filters, promotional sales, event calendar & RSVP passes, dining directory, 4K Cineplex & arcade recreation, high-resolution media gallery, visitor guides, interactive map, and private contact inquiry dispatch.
2. **Secure Admin CMS Panel:** Real database metrics dashboard, store CRUD, offer publishing & validity scheduling, event & RSVP management, restaurant directory, media gallery uploads with Firebase Storage, homepage and about page CMS text editing, FAQ management, visitor guide configuration, and private contact inquiry processing.

> **Strict Scope Restriction:** Built strictly for the public website and website CMS. Excludes ERP, employee attendance, collections, internal housekeeping, and staff management modules.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling & Design System:** Tailwind CSS, Custom Editorial typography (`Cinzel`, `Playfair Display`, `Plus Jakarta Sans`)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Database:** Google Cloud Firestore
- **Authentication:** Firebase Authentication
- **Media Storage:** Firebase Storage
- **Hosting:** Firebase Hosting (Single-page app rewrite configuration)
- **Forms & Validation:** React Hook Form, Zod schema validation
- **Animations & Polish:** CSS3 keyframes, hardware-accelerated transitions

---

## 📂 Project Architecture

```
src/
├── app/
│   ├── App.tsx                    # Main App wrapper with router & auth context
│   └── routes.tsx                 # Route declarations for public & admin routes
├── components/
│   └── common/
│       ├── Breadcrumbs.tsx        # Accessible navigation breadcrumbs
│       ├── ConfirmDialog.tsx      # Modal for destructive action confirmation
│       ├── EmptyState.tsx         # Polished empty-state feedback
│       ├── Footer.tsx             # Comprehensive footer with mall hours & directory
│       ├── GlobalSearchModal.tsx  # Universal search across stores, deals & events (Ctrl+K)
│       ├── LightboxModal.tsx      # Full-screen photo lightbox viewer
│       ├── LoadingSpinner.tsx     # Gold shimmering load indicator
│       ├── Logo.tsx               # Ozone Mall geometric insignia
│       ├── Navbar.tsx             # Sticky responsive header with announcement ticker
│       ├── PageHero.tsx           # Page banner with lifestyle imagery
│       └── SectionHeading.tsx     # Editorial section heading
├── context/
│   └── AuthContext.tsx            # Firebase Auth & local admin provider
├── firebase/
│   ├── config.ts                  # Firebase app initialization & credential safety
│   ├── dbClient.ts                # Firestore repository with resilient local fallback
│   ├── seed/
│   │   ├── seedData.ts            # Realistic Ozone Mall Ojhar directory records
│   │   └── seedDatabase.ts        # Automated batch write script for Cloud Firestore
│   └── services/
│       ├── contentService.ts      # Homepage & About page CMS service
│       ├── diningService.ts       # Restaurants & Food Court CRUD service
│       ├── entertainmentService.ts# Cineplex & Recreation service
│       ├── enquiriesService.ts    # Contact form private storage & status service
│       ├── eventRegistrationsService.ts # Event RSVP registration service
│       ├── eventsService.ts       # Events calendar CRUD service
│       ├── faqsService.ts         # FAQs CRUD service
│       ├── galleryService.ts      # Photography gallery service
│       ├── offersService.ts       # Promotional offers & expiry service
│       ├── statsService.ts        # Admin dashboard live metric calculations
│       ├── storageService.ts      # Firebase Storage upload & validation service
│       ├── storesService.ts       # Retail stores directory CRUD service
│       └── visitorService.ts      # Visitor guide & amenities service
├── layouts/
│   ├── AdminLayout.tsx            # Protected CMS layout with sidebar navigation
│   └── PublicLayout.tsx           # Public shell with Navbar and Footer
├── pages/
│   ├── about/AboutPage.tsx        # About Ozone Mall story, vision & pillars
│   ├── admin/
│   │   ├── AdminDashboardPage.tsx # Live metrics and recent enquiries
│   │   ├── AdminDiningPage.tsx    # Food & dining outlet CMS
│   │   ├── AdminEntertainmentPage.tsx # Cineplex & recreation CMS
│   │   ├── AdminEnquiriesPage.tsx # Private visitor message processor
│   │   ├── AdminEventsPage.tsx    # Calendar & RSVP capacity manager
│   │   ├── AdminFaqsPage.tsx      # FAQ manager
│   │   ├── AdminGalleryPage.tsx   # Photo gallery uploader & reorder
│   │   ├── AdminLoginPage.tsx     # Password-protected admin gate
│   │   ├── AdminOffersPage.tsx    # Promotions & validity scheduler
│   │   ├── AdminPagesContentPage.tsx # Hero, announcement & about CMS
│   │   ├── AdminSettingsPage.tsx  # Backend status & database seeder
│   │   ├── AdminStoresPage.tsx    # Store boutique directory manager
│   │   └── AdminVisitorPage.tsx   # Operating hours & amenities manager
│   ├── contact/ContactPage.tsx    # Contact inquiry form with spam protection
│   ├── dining/DiningPage.tsx      # Food & dining directory
│   ├── entertainment/EntertainmentPage.tsx # 4K Cineplex & arcade arena
│   ├── events/
│   │   ├── EventDetailPage.tsx    # Event details with online RSVP pass form
│   │   └── EventsPage.tsx         # Upcoming & past events calendar
│   ├── gallery/GalleryPage.tsx    # Media gallery with fullscreen lightbox
│   ├── home/HomePage.tsx          # Dynamic homepage with CMS feeds
│   ├── notFound/NotFoundPage.tsx  # Friendly 404 page
│   ├── offers/OffersPage.tsx      # Active & upcoming discounts
│   ├── stores/
│   │   ├── StoreDetailPage.tsx    # Store profile, timings & location
│   │   └── StoresPage.tsx         # Searchable directory with category/floor filters
│   └── visitor/VisitorInformationPage.tsx # Hours, map, parking & FAQs
├── types/index.ts                 # Strongly-typed data models
├── utils/
│   └── formatters.ts              # Date, currency, slug & CSS helpers
├── firestore.rules                # Cloud Firestore Security Rules
├── firestore.indexes.json         # Firestore Composite Query Indexes
├── storage.rules                  # Firebase Storage Security Rules
├── firebase.json                  # Firebase Hosting & Emulator configuration
└── vite.config.ts                 # Optimized Vite build with vendor chunking
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your Firebase Project configuration:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=ozone-mall-ojhar.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ozone-mall-ojhar
VITE_FIREBASE_STORAGE_BUCKET=ozone-mall-ojhar.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```
*(Note: If Firebase API keys are not supplied immediately, the application seamlessly runs in resilient local database mode, allowing full evaluation of all customer modules and the Admin CMS without crashing!)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
Creates a production-ready, minified bundle in `dist/` with vendor code-splitting.

---

## 🔐 Admin Panel Access

1. Navigate to: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Default Administrator Credentials (for development / demo):
   - **Email:** `admin@ozonemall.com`
   - **Password:** `admin123`
3. Access all CMS modules:
   - `/admin/dashboard`: Live stats for published stores, active offers, events, and unresolved inquiries.
   - `/admin/stores`: Full store directory CRUD, floor/unit assigner, logo & cover image uploader, publish toggle.
   - `/admin/offers`: Promotion title, discount, participating store, and date validity scheduler.
   - `/admin/events`: Shows & workshops with RSVP booking management.
   - `/admin/dining`: Restaurant, food court, and terrace dining outlet manager.
   - `/admin/entertainment`: 4K Cineplex, cosmic bowling, and VR arena manager.
   - `/admin/gallery`: Photo uploads with Firebase Storage integration.
   - `/admin/pages`: Edit live homepage hero headline, announcement banner, and story text.
   - `/admin/faqs`: Add, reorder, and publish visitor questions.
   - `/admin/visitor-information`: Mall timings, EV parking slots, and transit directions.
   - `/admin/enquiries`: Private customer inquiry resolution, status tracker, and internal notes.
   - `/admin/settings`: Backend connectivity status and one-click database seeder.

---

## 🔒 Security Architecture

1. **Private Contact Inquiries:** Contact submissions (`enquiries` collection) allow public creates only. Read, update, and delete operations are restricted exclusively to authenticated administrators.
2. **Authenticated Modifications:** Only users verified by Firebase Auth with administrator privileges can write to website collections (`stores`, `offers`, `events`, `diningOutlets`, `gallery`, `siteContent`, `visitorInformation`, `faqs`).
3. **Storage Restrictions:** File uploads are restricted to authentic admins with strict MIME-type validation (`image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`, `image/avif`) and maximum size limit of 5 MB.
4. **Anti-Spam Form Protection:** Hidden honeypot fields on the public contact form reject automated bot submissions.
5. **No Exposed Service Accounts:** Client bundle contains only public Firebase Web SDK keys; privileged secrets and admin initialization procedures are insulated.

---

## ☁️ Firebase Deployment Instructions

```bash
# 1. Login to Firebase CLI
firebase login

# 2. Initialize project (if not already linked)
firebase use --add

# 3. Deploy Firestore rules and indexes
firebase deploy --only firestore

# 4. Deploy Storage rules
firebase deploy --only storage

# 5. Build and deploy hosting
npm run build
firebase deploy --only hosting
```

---

## 📍 Location & Contact
- **Address:** Ozone Mall, Mumbai-Agra National Highway (NH-3), Ojhar (Ozar), Nashik District, Maharashtra 422206
- **Phone:** +91 253 278 1000 / +91 98220 54321
- **Email:** info@ozonemallojhar.com
- **Timings:** Daily 10:00 AM – 10:30 PM (Food Court & Cineplex open till 11:30 PM)
