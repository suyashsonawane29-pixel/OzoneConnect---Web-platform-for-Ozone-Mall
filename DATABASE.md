# Ozone Mall — Cloud Firestore Database Documentation

This document outlines the data schema, collections, indexing rules, and security enforcement implemented for the Ozone Mall website and Admin CMS.

---

## 📁 Firestore Collections Schema

### 1. `stores`
Stores retail brand boutiques, supermarkets, and fashion stores.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique document identifier (e.g. `store-1`) |
| `name` | string | Store name (e.g. `Westside Lifestyle`) |
| `slug` | string | URL-friendly slug (e.g. `westside-lifestyle`) |
| `category` | string | Enum: `Fashion`, `Electronics`, `Beauty & Personal Care`, `Lifestyle`, `Food & Dining`, `Entertainment`, `Other` |
| `subCategory` | string (optional) | Specific department (e.g. `Apparel & Footwear`) |
| `floor` | string | Enum: `Lower Ground (LG)`, `Ground Floor (G)`, `First Floor (1F)`, `Second Floor (2F)`, `Third Floor (3F)`, `Food Court` |
| `unitNumber` | string | Physical mall location (e.g. `G-12 to G-16`) |
| `phone` | string (optional) | Store contact telephone |
| `email` | string (optional) | Customer care email |
| `website` | string (optional) | External brand URL |
| `openingHours` | string | e.g. `10:00 AM - 9:30 PM` |
| `shortDescription` | string | Summary used on search and category cards |
| `description` | string | Detailed overview of brand products and offerings |
| `logoUrl` | string | Store brand logo URL |
| `coverImageUrl` | string | High-resolution storefront / interior photo |
| `isFeatured` | boolean | Controls appearance in Homepage Spotlight |
| `isPublished` | boolean | Public visibility toggle |
| `tags` | string[] | Keyword array for global search |
| `createdAt` | string (ISO) | Record creation timestamp |
| `updatedAt` | string (ISO) | Record modification timestamp |

---

### 2. `offers`
Stores seasonal sales, brand discounts, and promotional privileges.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique document identifier |
| `title` | string | Promo headline (e.g. `Grand Festive Mega Sale`) |
| `storeId` | string (optional) | Associated store document ID |
| `storeName` | string | Participating brand name |
| `category` | string | Product category |
| `discountText` | string | Callout badge text (e.g. `Up to 50% Off`) |
| `badgeText` | string (optional) | e.g. `Trending`, `Hot Deal` |
| `description` | string | Promotion details |
| `terms` | string | Terms and conditions |
| `imageUrl` | string | Promotional banner image |
| `startDate` | string (YYYY-MM-DD) | Promotion launch date |
| `endDate` | string (YYYY-MM-DD) | Promotion expiry date (auto-filters from active deals) |
| `isFeatured` | boolean | Featured on homepage |
| `isPublished` | boolean | Public visibility toggle |
| `createdAt` | string (ISO) | Timestamp |
| `updatedAt` | string (ISO) | Timestamp |

---

### 3. `events`
Stores cultural events, concerts, workshops, and seasonal festivals.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique document identifier |
| `title` | string | Event title |
| `category` | string | Enum: `Cultural`, `Festival`, `Fashion`, `Kids`, `Music`, `Workshop`, `Sale & Promo`, `Other` |
| `description` | string | Event agenda and details |
| `venue` | string | Mall location (e.g. `Central Atrium, Ground Floor`) |
| `startDate` | string (YYYY-MM-DD) | Event date |
| `endDate` | string (YYYY-MM-DD) | Event conclusion date |
| `timeString` | string | e.g. `6:30 PM - 10:00 PM` |
| `imageUrl` | string | Event promotional poster |
| `isFeatured` | boolean | Featured on homepage |
| `isPublished` | boolean | Visibility toggle |
| `isRegistrationOpen` | boolean | Controls online RSVP form display |
| `maxRegistrations` | number (optional) | Seat limit |
| `currentRegistrations` | number | Registered attendee tally |
| `createdAt` | string (ISO) | Timestamp |
| `updatedAt` | string (ISO) | Timestamp |

---

### 4. `diningOutlets`
Stores food court outlets, cafes, bakeries, and fine dining restaurants.

| Field | Type | Description |
|---|---|---|
| `id` | string | Document ID |
| `name` | string | Restaurant / cafe name |
| `diningType` | string | Enum: `Casual Dining`, `Food Court`, `Quick Bites`, `Fine Dining`, `Cafe & Bakery`, `Beverages & Desserts` |
| `cuisineType` | string | e.g. `North Indian, Continental, Asian` |
| `floor` | string | Floor level |
| `unitNumber` | string | e.g. `3F-01` |
| `phone` | string (optional) | Table reservation phone |
| `openingHours` | string | e.g. `12:00 PM - 11:30 PM` |
| `averageCostForTwo` | string | e.g. `₹1,200 for two` |
| `description` | string | Ambiance and specialty cuisine overview |
| `logoUrl` | string | Brand logo |
| `coverImageUrl` | string | Restaurant photo |
| `features` | string[] | e.g. `Outdoor Terrace`, `Live Mocktails`, `Vegetarian Friendly` |
| `isFeatured` | boolean | Homepage highlight |
| `isPublished` | boolean | Visibility toggle |

---

### 5. `entertainment`
Stores Cineplex cinema screens, cosmic bowling, VR gaming, and kids play park.

| Field | Type | Description |
|---|---|---|
| `id` | string | Document ID |
| `title` | string | e.g. `Ozone Cineplex (4 Screens Dolby Atmos)` |
| `type` | string | Enum: `Cinema`, `Arcade`, `Bowling`, `Kids Zone`, `VR Gaming`, `Live Arena` |
| `floor` | string | Floor level |
| `unitNumber` | string | Unit identifier |
| `openingHours` | string | Operational hours |
| `priceRange` | string | Ticket or admission pricing |
| `description` | string | Attraction specifications |
| `coverImageUrl` | string | Photo |
| `bookingUrl` | string (optional) | Online ticket purchase URL (e.g. BookMyShow) |
| `features` | string[] | Technical features (e.g. `4K Laser Projection`, `Dolby Atmos 7.1`) |
| `isFeatured` | boolean | Visibility |
| `isPublished` | boolean | Visibility |

---

### 6. `gallery`
Stores high-resolution photography for the visual showcase.

| Field | Type | Description |
|---|---|---|
| `id` | string | Document ID |
| `title` | string | Photo title |
| `category` | string | Enum: `Architecture`, `Shopping`, `Dining`, `Events`, `Entertainment`, `Atmosphere` |
| `imageUrl` | string | Firebase Storage URL or CDN URL |
| `description` | string (optional) | Photo caption for lightbox viewer |
| `orderIndex` | number | Display sort order |
| `isPublished` | boolean | Visibility toggle |

---

### 7. `siteContent`
Single-document CMS collections for public site copy:
- `siteContent/homepage_content`:
  - `heroTitle`, `heroSubtitle`, `heroDescription`, `heroImageUrl`
  - `heroCtaPrimaryText`, `heroCtaPrimaryLink`, `heroCtaSecondaryText`, `heroCtaSecondaryLink`
  - `announcementBanner`: `{ enabled: boolean, text: string, link?: string }`
  - `statsSection`: Array of `{ label: string, value: string }`
- `siteContent/about_page_content`:
  - `mainTitle`, `subtitle`, `bannerImageUrl`, `storyParagraphs[]`, `visionText`, `missionText`, `features[]`

---

### 8. `visitorInformation`
Stores mall operational timings, highway directions, EV parking specifications, and public transit info (`visitorInformation/default`).

---

### 9. `faqs`
Stores visitor frequently asked questions with category and order indexing.

---

### 10. `enquiries` (Private Security Restitution)
Stores public contact inquiries.
- **Access Rule:** Public create only. Read, update, and delete access strictly limited to authenticated admins.

---

### 11. `eventRegistrations`
Stores online RSVP passes submitted by visitors for events.
- **Access Rule:** Public create only. Read and list restricted to authenticated admins.

---

## ⚡ Firestore Composite Indexes

Defined in `firestore.indexes.json` for queries combining `isPublished` with `category`, `floor`, and `startDate`:

1. `stores`: `isPublished` (ASC) + `category` (ASC)
2. `stores`: `isPublished` (ASC) + `isFeatured` (ASC)
3. `offers`: `isPublished` (ASC) + `startDate` (ASC)
4. `events`: `isPublished` (ASC) + `startDate` (ASC)
