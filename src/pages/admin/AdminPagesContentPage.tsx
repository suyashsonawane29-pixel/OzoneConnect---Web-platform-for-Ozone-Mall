import React, { useEffect, useState } from 'react';
import {
  getHomepageContent,
  updateHomepageContent,
  getAboutPageContent,
  updateAboutPageContent,
} from '../../firebase/services/contentService';
import { HomepageContent, AboutPageContent } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Save, CheckCircle2, Sparkles, FileText, Home } from 'lucide-react';

export const AdminPagesContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'about'>('home');
  const [homeData, setHomeData] = useState<HomepageContent | null>(null);
  const [aboutData, setAboutData] = useState<AboutPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [h, a] = await Promise.all([getHomepageContent(), getAboutPageContent()]);
        setHomeData(h);
        setAboutData(a);
      } catch (err) {
        console.error('Failed to load page content', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveHomepage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeData) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateHomepageContent(homeData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update homepage content.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aboutData) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateAboutPageContent(aboutData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update about page content.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !homeData || !aboutData) {
    return <LoadingSpinner fullPage message="Loading CMS page content..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Pages Content Management (CMS)
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Edit live hero headlines, announcement tickers, story paragraphs, and vision statements.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Changes Published Live!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 rounded-2xl bg-white border border-charcoal-200 w-fit">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'home'
              ? 'bg-charcoal-900 text-white shadow-sm'
              : 'text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Homepage Content</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'about'
              ? 'bg-charcoal-900 text-white shadow-sm'
              : 'text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>About Ozone Mall Content</span>
        </button>
      </div>

      {/* 1. HOMEPAGE CMS FORM */}
      {activeTab === 'home' && (
        <form onSubmit={handleSaveHomepage} className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-100 shadow-subtle space-y-6">
          <div className="pb-4 border-b border-charcoal-100">
            <h3 className="font-serif text-xl font-bold text-charcoal-900">
              Hero Banner & Announcement Ticker
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Updates immediately appear on the top banner of the public website.
            </p>
          </div>

          {/* Announcement Bar */}
          <div className="p-4 rounded-2xl bg-ivory-100 border border-charcoal-200/80 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-charcoal-900">
              <input
                type="checkbox"
                checked={homeData.announcementBanner?.enabled ?? true}
                onChange={(e) =>
                  setHomeData({
                    ...homeData,
                    announcementBanner: {
                      enabled: e.target.checked,
                      text: homeData.announcementBanner?.text || '',
                      link: homeData.announcementBanner?.link || '',
                    },
                  })
                }
                className="w-4 h-4 rounded text-gold-600 focus:ring-0"
              />
              <span>Display Top Notification Banner</span>
            </label>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Banner Message Text
              </label>
              <input
                type="text"
                value={homeData.announcementBanner?.text || ''}
                onChange={(e) =>
                  setHomeData({
                    ...homeData,
                    announcementBanner: {
                      enabled: homeData.announcementBanner?.enabled ?? true,
                      text: e.target.value,
                      link: homeData.announcementBanner?.link,
                    },
                  })
                }
                placeholder="Festive Season Celebrations are Live at Ozone Mall..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>
          </div>

          {/* Main Hero Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Hero Top Subtitle Tagline
              </label>
              <input
                type="text"
                value={homeData.heroSubtitle}
                onChange={(e) => setHomeData({ ...homeData, heroSubtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Main Hero Editorial Headline
              </label>
              <input
                type="text"
                value={homeData.heroTitle}
                onChange={(e) => setHomeData({ ...homeData, heroTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans font-serif text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Short Hero Description
              </label>
              <textarea
                rows={3}
                value={homeData.heroDescription}
                onChange={(e) => setHomeData({ ...homeData, heroDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Hero Background Mall Image URL
              </label>
              <input
                type="url"
                value={homeData.heroImageUrl}
                onChange={(e) => setHomeData({ ...homeData, heroImageUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={homeData.heroCtaPrimaryText}
                  onChange={(e) =>
                    setHomeData({ ...homeData, heroCtaPrimaryText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  value={homeData.heroCtaSecondaryText}
                  onChange={(e) =>
                    setHomeData({ ...homeData, heroCtaSecondaryText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-charcoal-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-600 hover:bg-gold-500 text-charcoal-950 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Homepage Content'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. ABOUT PAGE CMS FORM */}
      {activeTab === 'about' && (
        <form onSubmit={handleSaveAbout} className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-100 shadow-subtle space-y-6">
          <div className="pb-4 border-b border-charcoal-100">
            <h3 className="font-serif text-xl font-bold text-charcoal-900">
              About Ozone Mall Story & Mission
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Craft the official architectural narrative, vision, and core pillars.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Main Story Headline
              </label>
              <input
                type="text"
                value={aboutData.mainTitle}
                onChange={(e) => setAboutData({ ...aboutData, mainTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Banner Image URL
              </label>
              <input
                type="url"
                value={aboutData.bannerImageUrl}
                onChange={(e) => setAboutData({ ...aboutData, bannerImageUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Story Paragraph 1
              </label>
              <textarea
                rows={3}
                value={aboutData.storyParagraphs[0] || ''}
                onChange={(e) => {
                  const arr = [...aboutData.storyParagraphs];
                  arr[0] = e.target.value;
                  setAboutData({ ...aboutData, storyParagraphs: arr });
                }}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Story Paragraph 2
              </label>
              <textarea
                rows={3}
                value={aboutData.storyParagraphs[1] || ''}
                onChange={(e) => {
                  const arr = [...aboutData.storyParagraphs];
                  arr[1] = e.target.value;
                  setAboutData({ ...aboutData, storyParagraphs: arr });
                }}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Vision Statement
                </label>
                <textarea
                  rows={3}
                  value={aboutData.visionText}
                  onChange={(e) => setAboutData({ ...aboutData, visionText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Mission Statement
                </label>
                <textarea
                  rows={3}
                  value={aboutData.missionText}
                  onChange={(e) => setAboutData({ ...aboutData, missionText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-charcoal-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-600 hover:bg-gold-500 text-charcoal-950 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save About Page Content'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
