import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Public Pages
import { HomePage } from '../pages/home/HomePage';
import { AboutPage } from '../pages/about/AboutPage';
import { StoresPage } from '../pages/stores/StoresPage';
import { StoreDetailPage } from '../pages/stores/StoreDetailPage';
import { OffersPage } from '../pages/offers/OffersPage';
import { EventsPage } from '../pages/events/EventsPage';
import { EventDetailPage } from '../pages/events/EventDetailPage';
import { DiningPage } from '../pages/dining/DiningPage';
import { EntertainmentPage } from '../pages/entertainment/EntertainmentPage';
import { GalleryPage } from '../pages/gallery/GalleryPage';
import { VisitorInformationPage } from '../pages/visitor/VisitorInformationPage';
import { ContactPage } from '../pages/contact/ContactPage';
import { NotFoundPage } from '../pages/notFound/NotFoundPage';

// Admin Pages
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminStoresPage } from '../pages/admin/AdminStoresPage';
import { AdminOffersPage } from '../pages/admin/AdminOffersPage';
import { AdminEventsPage } from '../pages/admin/AdminEventsPage';
import { AdminDiningPage } from '../pages/admin/AdminDiningPage';
import { AdminEntertainmentPage } from '../pages/admin/AdminEntertainmentPage';
import { AdminGalleryPage } from '../pages/admin/AdminGalleryPage';
import { AdminPagesContentPage } from '../pages/admin/AdminPagesContentPage';
import { AdminFaqsPage } from '../pages/admin/AdminFaqsPage';
import { AdminVisitorPage } from '../pages/admin/AdminVisitorPage';
import { AdminEnquiriesPage } from '../pages/admin/AdminEnquiriesPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/stores/:slug" element={<StoreDetailPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/dining" element={<DiningPage />} />
        <Route path="/entertainment" element={<EntertainmentPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/visitor-information" element={<VisitorInformationPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Authentication (Standalone) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin CMS Panel Protected Layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="stores" element={<AdminStoresPage />} />
        <Route path="offers" element={<AdminOffersPage />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="dining" element={<AdminDiningPage />} />
        <Route path="entertainment" element={<AdminEntertainmentPage />} />
        <Route path="gallery" element={<AdminGalleryPage />} />
        <Route path="pages" element={<AdminPagesContentPage />} />
        <Route path="faqs" element={<AdminFaqsPage />} />
        <Route path="visitor-information" element={<AdminVisitorPage />} />
        <Route path="enquiries" element={<AdminEnquiriesPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
};
