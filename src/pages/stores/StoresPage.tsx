import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Phone, ExternalLink, Grid, List, X, Sparkles } from 'lucide-react';
import { PageHero } from '../../components/common/PageHero';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { getStores } from '../../firebase/services/storesService';
import { Store, StoreCategory, FloorLevel } from '../../types';

const CATEGORIES: (StoreCategory | 'All')[] = [
  'All',
  'Fashion',
  'Electronics',
  'Beauty & Personal Care',
  'Lifestyle',
  'Food & Dining',
  'Entertainment',
  'Other',
];

const FLOORS: (FloorLevel | 'All')[] = [
  'All',
  'Lower Ground (LG)',
  'Ground Floor (G)',
  'First Floor (1F)',
  'Second Floor (2F)',
  'Third Floor (3F)',
  'Food Court',
];

export const StoresPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'featured'>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const activeCategory = (searchParams.get('category') as StoreCategory | 'All') || 'All';
  const activeFloor = (searchParams.get('floor') as FloorLevel | 'All') || 'All';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await getStores({ publishedOnly: true });
        setStores(list);
      } catch (err) {
        console.error('Error fetching stores', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter and sort stores
  const filteredStores = useMemo(() => {
    let result = [...stores];

    if (activeCategory && activeCategory !== 'All') {
      result = result.filter((s) => s.category === activeCategory);
    }

    if (activeFloor && activeFloor !== 'All') {
      result = result.filter((s) => s.floor === activeFloor);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.subCategory?.toLowerCase().includes(q) ||
          s.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });

    return result;
  }, [stores, activeCategory, activeFloor, searchQuery, sortBy]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeFloor, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const paginatedStores = filteredStores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'All' || !value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = activeCategory !== 'All' || activeFloor !== 'All' || Boolean(searchQuery);

  return (
    <div>
      <PageHero
        badge="Retail Directory"
        title="Explore Stores & Boutiques"
        subtitle="OZONE MALL DIRECTORY"
        description="Discover over 80 curated national and international retail brands across fashion, electronics, cosmetics, and everyday lifestyle."
        breadcrumbs={[{ label: 'Stores Directory' }]}
        imageUrl="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Controls: Search, Filters, View Modes */}
        <div className="bg-white p-6 rounded-2xl border border-charcoal-100 shadow-subtle space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-gold-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search by store name, brand, or tag..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => updateFilter('search', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort & View Mode */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-2 text-xs text-charcoal-600 font-medium">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-ivory-100 border border-charcoal-200 rounded-lg px-2.5 py-1.5 text-xs text-charcoal-800 focus:outline-none focus:border-gold-500 font-sans"
                >
                  <option value="featured">Featured First</option>
                  <option value="name-asc">Name (A - Z)</option>
                  <option value="name-desc">Name (Z - A)</option>
                </select>
              </div>

              <div className="border-l border-charcoal-200 pl-3 flex items-center gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-charcoal-600 ${
                    viewMode === 'grid' ? 'bg-gold-100 text-gold-800' : 'hover:bg-ivory-100'
                  }`}
                  aria-label="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg text-charcoal-600 ${
                    viewMode === 'list' ? 'bg-gold-100 text-gold-800' : 'hover:bg-ivory-100'
                  }`}
                  aria-label="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-charcoal-400">
              <span className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-gold-600" /> Filter by Category
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-gold-700 hover:text-gold-900 font-semibold normal-case flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear all filters
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateFilter('category', cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-charcoal-900 text-white font-bold shadow-sm'
                      : 'bg-ivory-100 hover:bg-gold-50 text-charcoal-700 border border-charcoal-200 hover:border-gold-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Floor Chips Bar */}
          <div className="space-y-2 pt-2 border-t border-charcoal-100">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-charcoal-400">
              <MapPin className="w-3 h-3 text-gold-600" /> Filter by Floor
            </div>
            <div className="flex flex-wrap gap-2">
              {FLOORS.map((floor) => (
                <button
                  key={floor}
                  onClick={() => updateFilter('floor', floor)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeFloor === floor
                      ? 'bg-gold-500 text-charcoal-950 font-bold'
                      : 'bg-white hover:bg-ivory-100 text-charcoal-600 border border-charcoal-200'
                  }`}
                >
                  {floor}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-charcoal-500 px-1">
          <p>
            Showing <span className="font-bold text-charcoal-900">{filteredStores.length}</span>{' '}
            stores at Ozone Mall
          </p>
        </div>

        {/* Content Section */}
        {loading ? (
          <LoadingSpinner message="Retrieving Ozone Mall stores..." />
        ) : filteredStores.length === 0 ? (
          <EmptyState
            title="No Stores Found"
            description="We couldn't find any stores matching your selected filters. Try choosing another category or clearing your search term."
            actionText="Clear Filters"
            onActionClick={clearFilters}
          />
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedStores.map((store) => (
              <Link
                key={store.id}
                to={`/stores/${store.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-charcoal-100 hover:border-gold-300 hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/3] overflow-hidden bg-charcoal-100">
                    <img
                      src={store.coverImageUrl}
                      alt={store.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {store.isFeatured && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-gold-500 text-charcoal-950 flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-2.5 h-2.5" /> Featured
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-charcoal-900 shadow-sm backdrop-blur-sm">
                        {store.floor.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gold-600 font-sans">
                      {store.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-charcoal-900 group-hover:text-gold-700 transition-colors mt-0.5">
                      {store.name}
                    </h3>
                    <p className="text-xs text-charcoal-500 mt-2 line-clamp-2 leading-relaxed">
                      {store.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-charcoal-50 flex items-center justify-between text-xs font-semibold text-charcoal-400 group-hover:text-gold-600">
                    <span>Unit {store.unitNumber}</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-4">
            {paginatedStores.map((store) => (
              <Link
                key={store.id}
                to={`/stores/${store.slug}`}
                className="group p-4 sm:p-5 rounded-2xl bg-white border border-charcoal-100 hover:border-gold-300 hover:shadow-premium transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-16 h-16 rounded-xl object-cover border border-charcoal-200 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-gold-600 font-sans">
                        {store.category}
                      </span>
                      {store.isFeatured && (
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-gold-100 text-gold-800">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-charcoal-900 group-hover:text-gold-700 transition-colors">
                      {store.name}
                    </h3>
                    <p className="text-xs text-charcoal-500 mt-0.5 max-w-xl line-clamp-1">
                      {store.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-charcoal-500 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-charcoal-100">
                  <div>
                    <p className="font-semibold text-charcoal-900">{store.floor}</p>
                    <p className="text-[11px] text-charcoal-400">Unit {store.unitNumber}</p>
                  </div>
                  <span className="px-4 py-2 rounded-full bg-ivory-100 text-charcoal-800 group-hover:bg-gold-500 group-hover:text-charcoal-950 font-bold uppercase tracking-wider text-[11px] transition-colors">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-white border border-charcoal-200 text-charcoal-700 hover:bg-gold-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pNum = i + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                    currentPage === pNum
                      ? 'bg-charcoal-900 text-white'
                      : 'bg-white border border-charcoal-200 text-charcoal-700 hover:bg-gold-50'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-white border border-charcoal-200 text-charcoal-700 hover:bg-gold-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
