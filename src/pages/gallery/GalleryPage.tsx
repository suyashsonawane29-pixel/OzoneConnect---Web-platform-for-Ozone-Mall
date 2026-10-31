import React, { useEffect, useState } from 'react';
import { PageHero } from '../../components/common/PageHero';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { LightboxModal } from '../../components/common/LightboxModal';
import { getGalleryItems } from '../../firebase/services/galleryService';
import { GalleryItem } from '../../types';
import { Maximize2, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Architecture',
  'Shopping',
  'Dining',
  'Events',
  'Entertainment',
  'Atmosphere',
];

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await getGalleryItems({ publishedOnly: true });
        setItems(list);
      } catch (err) {
        console.error('Failed to load gallery items', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return true;
  });

  const openLightbox = (idx: number) => {
    setCurrentPhotoIndex(idx);
    setLightboxOpen(true);
  };

  const lightboxImages = filteredItems.map((item) => ({
    url: item.imageUrl,
    title: item.title,
    description: item.description,
    category: item.category,
  }));

  return (
    <div>
      <PageHero
        badge="Visual Splendor"
        title="Ozone Mall Image Gallery"
        subtitle="MOMENTS & ARCHITECTURE"
        description="Glimpse the grand sunlight atriums, architectural elegance, festive night illumination, and celebratory moments at Ozone Mall Ojhar."
        breadcrumbs={[{ label: 'Gallery' }]}
        imageUrl="https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Category Filter Chips */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'bg-white text-charcoal-700 hover:bg-gold-50 border border-charcoal-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Content */}
        {loading ? (
          <LoadingSpinner message="Curating gallery views..." />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No Images in this Category"
            description="Our photography team is curating additional perspectives. Please explore other categories."
            actionText="View All Photos"
            onActionClick={() => setSelectedCategory('All')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-charcoal-950 cursor-pointer shadow-subtle hover:shadow-premium transition-all duration-300"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-95"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-charcoal-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                        {item.category}
                      </span>
                      <h4 className="font-serif text-lg font-bold text-white mt-0.5">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-charcoal-300 mt-1 line-clamp-1 font-light">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="p-2.5 rounded-full bg-white/20 text-white backdrop-blur-md">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        currentIndex={currentPhotoIndex}
        onNavigate={(newIdx) => setCurrentPhotoIndex(newIdx)}
      />
    </div>
  );
};
