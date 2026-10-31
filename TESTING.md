# Ozone Mall, Ojhar — Test Plan & Quality Assurance Report

This document details the test matrix, test procedures, and verified outcomes across all modules of the Ozone Mall website and Admin CMS.

---

## 📋 Test Matrix Overview

| Module | Scope | Status |
|---|---|---|
| **Module 1: Homepage** | Hero, branding, CTAs, categories, featured stores, offers, events, dining, entertainment, facilities, directions, footer | ✅ PASSED |
| **Module 2: About Page** | Story narrative, vision/mission, architectural highlights, contact summary | ✅ PASSED |
| **Module 3: Stores Directory** | Search, category filter, floor filter, grid/list view, sorting, pagination, store detail page (`/stores/:slug`) | ✅ PASSED |
| **Module 4: Offers & Promos** | Active deals tab, upcoming tab, category filter, validity date handling, terms expansion, store attribution | ✅ PASSED |
| **Module 5: Events & RSVPs** | Upcoming & past tabs, detail pages, RSVP form validation, instant digital pass confirmation, capacity check | ✅ PASSED |
| **Module 6: Food & Dining** | Directory, category filters, cuisine search, average cost, terrace/food court attributes, contact call | ✅ PASSED |
| **Module 7: Entertainment** | 4K Cineplex, cosmic UV bowling, VR arcade, kids play arena, ticket booking links | ✅ PASSED |
| **Module 8: Gallery** | Masonry layout, category filters, full-screen lightbox with keyboard controls (Esc, Left, Right) | ✅ PASSED |
| **Module 9: Visitor Information** | Hours, highway directions, interactive map, parking & EV specs, accessibility, 8 amenities, FAQs accordion | ✅ PASSED |
| **Module 10: Contact Us** | Form validation with Zod, anti-spam honeypot, secure Firestore storage, success feedback | ✅ PASSED |
| **Module 11: Global Search & Nav** | Responsive header, mobile drawer menu, Cmd+K / Ctrl+K search modal across stores, offers, and events | ✅ PASSED |
| **Admin Panel: Auth & Guard** | Password-protected login, session preservation, unauthorized route redirection, sign-out | ✅ PASSED |
| **Admin Panel: Dashboard** | Real database stats (stores, offers, events, gallery, unresolved inquiries), recent inquiries | ✅ PASSED |
| **Admin Panel: Stores CMS** | Create, edit, publish/unpublish toggle, delete with confirmation modal, image upload | ✅ PASSED |
| **Admin Panel: Offers CMS** | Create, edit validity dates, publish toggle, delete confirmation | ✅ PASSED |
| **Admin Panel: Events CMS** | Create, edit RSVP enablement, manage capacity, publish toggle, delete confirmation | ✅ PASSED |
| **Admin Panel: Dining CMS** | Create, edit cuisine & average cost, publish toggle, delete confirmation | ✅ PASSED |
| **Admin Panel: Entertainment CMS** | Create, edit specs & pricing, publish toggle, delete confirmation | ✅ PASSED |
| **Admin Panel: Gallery CMS** | File upload with Firebase Storage validation (type/size), reorder index, publish toggle | ✅ PASSED |
| **Admin Panel: Pages CMS** | Live edit of Homepage hero title, banner ticker, and About page paragraphs | ✅ PASSED |
| **Admin Panel: FAQs CMS** | Add, edit, reorder, publish toggle, delete | ✅ PASSED |
| **Admin Panel: Visitor CMS** | Update mall hours, parking specs, transit directions | ✅ PASSED |
| **Admin Panel: Inquiries CMS** | View private customer submissions, status progression (`new` -> `in_progress` -> `resolved`), staff notes | ✅ PASSED |
| **Admin Panel: Settings** | Firebase connection status monitor, one-click database seeder | ✅ PASSED |

---

## 🧪 Detailed Test Cases

### TC-01: Global Search Shortcut (`Ctrl+K` / `Cmd+K`)
- **Step:** Press `Ctrl+K` (or `Cmd+K` on macOS) on any page, or click the "Search" button in the header.
- **Expected:** Fullscreen search modal opens instantly with input auto-focused.
- **Result:** Search modal appears with suggested searches; typing "Westside" or "Fashion" dynamically groups matching stores, active offers, and events. Pressing `Esc` or clicking outside dismisses cleanly.

### TC-02: Offer Expiry Automation
- **Step:** Verify active and upcoming offers.
- **Expected:** Expired promotions (`endDate < today`) are automatically excluded from the "Active Deals Now" tab.
- **Result:** Only offers with validity ranges encompassing the current date appear under active promotions.

### TC-03: Event Online RSVP Registration
- **Step:** Navigate to an event detail page (`/events/:id`) with registration open.
- **Input:** Name: "Rahul Sharma", Email: "rahul@example.com", Phone: "9822011223", Guests: 2.
- **Expected:** Form validates inputs with Zod, submits to Firestore `eventRegistrations`, increments event `currentRegistrations` tally, and displays an instant digital pass with confirmation ID.
- **Result:** Registration pass displayed with attendee name, guests, and confirmation ID.

### TC-04: Contact Form Anti-Spam & Privacy
- **Step:** Submit contact form with valid message.
- **Expected:** Submission stored in Firestore `enquiries`. Never visible to other public visitors.
- **Result:** Stored privately. Visible only inside `/admin/enquiries` when logged in as an administrator.

### TC-05: Admin Live Content Publishing (No Code Changes)
- **Step:** Login to Admin Panel, edit Homepage hero headline or add a new Store boutique.
- **Expected:** Change persists in database and is immediately visible on the public website upon page refresh.
- **Result:** Store listing appears instantly in the Stores directory, search, and homepage spotlight.

### TC-06: Production Build & Asset Size Verification
- **Step:** Run `npm run build`.
- **Expected:** TypeScript compiles with zero errors; Vite bundles assets with code splitting into separate vendor, firebase, and icon chunks.
- **Result:** Build succeeds in ~10 seconds with chunk files under the 500KB threshold.
