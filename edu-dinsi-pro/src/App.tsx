/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ReactNode, useEffect, useRef, useCallback, memo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe as GlobeIcon, 
  Rocket, 
  BookOpen, 
  Menu, 
  X, 
  ChevronRight, 
  Star,
  Telescope,
  Library,
  Loader2,
  ExternalLink,
  Search
} from 'lucide-react';

const NASA_API_KEY = process.env.NASA_API_KEY || '5LjjC66pBkXh2LmFdpxIRRSqhFSXFXyYXM4fft2V';

interface FeedItem {
  id: string;
  type: 'nasa' | 'wiki';
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  fullContent?: string;
  sourceUrl?: string;
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'nasa' | 'wiki'>('all');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  // Google Translate Initialization
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (document.getElementById('google-translate-script')) return;
      
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
        // Try to initialize mobile one if it exists
        if (document.getElementById('google_translate_element_mobile')) {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element_mobile'
          );
        }
      };
    };

    addGoogleTranslateScript();
  }, []);

  const fetchNasaData = async (count: number = 5, query?: string) => {
    try {
      if (query) {
        const response = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`);
        const data = await response.json();
        const results = data.collection.items.slice(0, count);
        return results.map((item: any) => ({
          id: `nasa-search-${item.data[0].nasa_id}-${Math.random()}`,
          type: 'nasa',
          title: item.data[0].title,
          description: (item.data[0].description || '').substring(0, 150) + '...',
          imageUrl: item.links[0].href,
          date: item.data[0].date_created.split('T')[0],
          fullContent: item.data[0].description,
          sourceUrl: `https://images.nasa.gov/details-${item.data[0].nasa_id}`
        }));
      }

      const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&count=${count}`);
      const data = await response.json();
      return data.map((item: any) => ({
        id: `nasa-${item.date}-${Math.random()}`,
        type: 'nasa',
        title: item.title,
        description: item.explanation.substring(0, 150) + '...',
        imageUrl: item.url,
        date: item.date,
        fullContent: item.explanation,
        sourceUrl: item.hdurl || item.url
      }));
    } catch (error) {
      console.error('NASA Fetch Error:', error);
      return [];
    }
  };

  const fetchWikiData = async (count: number = 5, query?: string) => {
    const wikiItems: FeedItem[] = [];
    try {
      if (query) {
        const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`);
        const searchData = await searchRes.json();
        const results = searchData.query.search.slice(0, count);
        
        for (const res of results) {
          const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(res.title)}`);
          const data = await summaryRes.json();
          if (data.title && data.extract) {
            wikiItems.push({
              id: `wiki-search-${data.pageid}-${Math.random()}`,
              type: 'wiki',
              title: data.title,
              description: data.extract.substring(0, 150) + '...',
              imageUrl: data.thumbnail?.source || `https://picsum.photos/seed/${data.pageid}/800/600`,
              date: new Date().toISOString().split('T')[0],
              fullContent: data.extract,
              sourceUrl: data.content_urls?.desktop?.page
            });
          }
        }
        return wikiItems;
      }

      for (let i = 0; i < count; i++) {
        const response = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
        const data = await response.json();
        if (data.title && data.extract) {
          wikiItems.push({
            id: `wiki-${data.pageid}-${Math.random()}`,
            type: 'wiki',
            title: data.title,
            description: data.extract.substring(0, 150) + '...',
            imageUrl: data.thumbnail?.source || `https://picsum.photos/seed/${data.pageid}/800/600`,
            date: new Date().toISOString().split('T')[0],
            fullContent: data.extract,
            sourceUrl: data.content_urls?.desktop?.page
          });
        }
      }
      return wikiItems;
    } catch (error) {
      console.error('Wiki Fetch Error:', error);
      return [];
    }
  };

  const loadMore = useCallback(async (query?: string) => {
    if (loading) return;
    setLoading(true);
    
    let newItems: FeedItem[] = [];
    const currentQuery = query || searchQuery;

    if (activeTab === 'all') {
      const [nasa, wiki] = await Promise.all([fetchNasaData(2, currentQuery), fetchWikiData(2, currentQuery)]);
      newItems = [...nasa, ...wiki].sort(() => Math.random() - 0.5);
    } else if (activeTab === 'nasa') {
      newItems = await fetchNasaData(4, currentQuery);
    } else {
      newItems = await fetchWikiData(4, currentQuery);
    }

    setItems(prev => currentQuery && !query ? [...prev, ...newItems] : query ? newItems : [...prev, ...newItems]);
    setLoading(false);
  }, [activeTab, loading, searchQuery]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setItems([]);
    loadMore(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setItems([]);
    loadMore('');
  };

  useEffect(() => {
    if (!isSearching) {
      setItems([]);
      loadMore();
    }
  }, [activeTab, isSearching]);

  const lastItemRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadMore]);

  return (
    <div className="min-h-screen bg-white selection:bg-brand-light-green selection:text-black">
      {/* Top Banner */}
      <div className="fixed top-0 left-0 right-0 bg-black text-white py-3 px-6 text-center z-[60] border-b border-white/10">
        <a 
          href="https://edudinsi-letslearnwithpassion.netlify.app" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:text-brand-light-green transition-all group"
        >
          <span className="w-2 h-2 bg-brand-light-green rounded-full animate-ping" />
          EDU DINSI - LET'S LEARN WITH PASSION
          <div className="bg-white/10 px-3 py-1 rounded-full group-hover:bg-brand-light-green group-hover:text-black transition-all flex items-center gap-1">
            Visit Now <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>
      </div>

      {/* Navigation */}
      <nav className="fixed top-12 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl tracking-tighter">
              ED
            </div>
            <span className="text-2xl font-display font-bold tracking-tighter text-black">
              EDU <span className="text-brand-blue">DINSI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <form onSubmit={handleSearch} className="relative group">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-gray-100 border border-black/5 rounded-xl px-4 py-1.5 pr-10 text-sm font-bold focus:outline-none focus:border-brand-blue transition-all w-40 focus:w-64"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                <Search size={16} />
              </button>
            </form>
            <div id="google_translate_element" className="scale-90 origin-right"></div>
            <a href="#" className="text-sm font-semibold hover:text-brand-blue transition-colors">Explorer</a>
            <a href="#feed" className="text-sm font-semibold hover:text-brand-blue transition-colors">Live Feed</a>
            <button className="bg-black text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-brand-blue transition-all active:scale-95">
              Get Started
            </button>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-4 glass rounded-2xl p-6 flex flex-col gap-4 shadow-xl"
            >
              <a 
                href="https://edudinsi-letslearnwithpassion.netlify.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-brand-light-green text-black px-4 py-3 rounded-xl font-bold text-xs text-center uppercase tracking-widest"
              >
                Learn with Passion
              </a>
              <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topics..."
                  className="w-full bg-gray-50 border-2 border-black/5 rounded-xl px-4 py-3 pr-12 font-bold focus:outline-none focus:border-brand-blue transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={20} />
                </button>
              </form>
              <div id="google_translate_element_mobile" className="py-2 border-b border-gray-100"></div>
              <a href="#" className="text-lg font-bold hover:text-brand-blue transition-colors" onClick={() => setIsMenuOpen(false)}>Explorer</a>
              <a href="#feed" className="text-lg font-bold hover:text-brand-blue transition-colors" onClick={() => setIsMenuOpen(false)}>Live Feed</a>
              <button className="bg-black text-white px-6 py-4 rounded-xl font-bold hover:bg-brand-blue transition-all">
                Get Started
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-44 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light-green/20 text-brand-green text-xs font-bold uppercase tracking-wider mb-6">
              <GlobeIcon size={14} />
              <span>Infinite Knowledge Stream</span>
            </div>
            <h1 className="text-6xl md:text-8xl mb-8 leading-[0.9]">
              EXPLORE <br />
              <span className="text-brand-blue">WITHOUT</span> <br />
              END.
            </h1>
            <p className="text-xl text-gray-600 max-w-md mb-10 font-medium leading-relaxed">
              Dive into an endless stream of space discoveries and global knowledge. Powered by NASA and Wikipedia.
            </p>
            
            <form onSubmit={handleSearch} className="relative max-w-md mb-10 group">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics (e.g. Mars, Einstein, Galaxy)..."
                className="w-full bg-gray-50 border-2 border-black/5 rounded-2xl px-6 py-4 pr-14 font-bold focus:outline-none focus:border-brand-blue transition-all shadow-sm"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 w-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-brand-blue transition-all"
              >
                <Search size={18} />
              </button>
              {isSearching && (
                <button 
                  type="button"
                  onClick={clearSearch}
                  className="absolute -bottom-8 left-0 text-xs font-bold text-brand-blue hover:underline"
                >
                  Clear search results
                </button>
              )}
            </form>

            <div className="flex flex-wrap gap-4">
              <a href="#feed" className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 hover:bg-brand-blue transition-all group">
                Start Scrolling <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

          <div className="relative">
            <div className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl relative group">
              <img 
                src="https://picsum.photos/seed/galaxy/1000/1000" 
                alt="Space" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feed Section */}
      <section id="feed" className="py-20 px-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
            <div className="flex flex-col items-start">
              <p className="text-brand-green font-bold text-xs uppercase tracking-[0.3em] mb-4 ml-1">
                Click here to learn more new things.
              </p>
              <a 
                href="https://edudinsiblogs.netlify.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block group"
              >
                <motion.div 
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-dark px-8 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 border-2 border-black/5 hover:border-brand-blue/30 transition-all"
                >
                  <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tighter text-black">
                    Blogs written by <span className="text-brand-blue underline decoration-brand-light-green decoration-4 underline-offset-8">Disas</span>
                  </h2>
                  <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white group-hover:bg-brand-blue group-hover:rotate-12 transition-all duration-500 shadow-lg">
                    <ExternalLink size={24} />
                  </div>
                </motion.div>
              </a>
              <p className="text-gray-500 font-medium mt-6 ml-1">Endless discovery from the stars to the earth.</p>
            </div>
            
            <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-gray-100">
              {(['all', 'nasa', 'wiki'] as const).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all capitalize ${activeTab === tab ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
                >
                  {tab === 'all' ? 'All Sources' : tab === 'nasa' ? 'NASA Space' : 'Wikipedia'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 feed-grid">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                ref={index === items.length - 1 ? lastItemRef : null}
              >
                <FeedCard 
                  item={item} 
                  onClick={() => setSelectedItem(item)}
                />
              </div>
            ))}
            {loading && items.length === 0 && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-[2.5rem] h-[500px] animate-pulse bg-gray-200/50" />
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-brand-blue" size={40} />
            </div>
          )}
        </div>
      </section>

      {/* Modal for Blog Content */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 z-10 w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X />
              </button>

              <div className="overflow-y-auto">
                <div className="aspect-video w-full relative">
                  <img 
                    src={selectedItem.imageUrl} 
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute top-6 left-6 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${selectedItem.type === 'nasa' ? 'bg-brand-blue text-white' : 'bg-brand-green text-white'}`}>
                    {selectedItem.type === 'nasa' ? 'NASA Discovery' : 'Wikipedia Article'}
                  </div>
                </div>

                <div className="p-8 md:p-12">
                  <div className="flex items-center gap-4 mb-6 text-gray-400 text-sm font-bold uppercase tracking-widest">
                    <span>{selectedItem.date}</span>
                    <span>•</span>
                    <span>{selectedItem.type === 'nasa' ? 'Space Exploration' : 'Global Knowledge'}</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl mb-8 leading-tight">{selectedItem.title}</h2>
                  <div className="prose prose-lg max-w-none text-gray-600 font-medium leading-relaxed space-y-6">
                    {selectedItem.fullContent}
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                    <a 
                      href={selectedItem.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-brand-blue font-bold hover:underline"
                    >
                      View Original Source <ExternalLink size={16} />
                    </a>
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-blue transition-all"
                    >
                      Close Article
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm tracking-tighter">
                ED
              </div>
              <span className="text-xl font-display font-bold tracking-tighter text-black">
                EDU <span className="text-brand-blue">DINSI</span>
              </span>
            </div>
            <p className="text-gray-500 font-medium max-w-xs">
              Professional education platform leveraging global data for the next generation of learners.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-400">About Us</h4>
              <p className="text-sm font-semibold text-gray-600 leading-relaxed">
                Hello there! I am Disas. I have made this website. I am 12 years old coder. My name is A.Disas Dinsitha. <br />
                I AM STUDYING AT BANDARAGAMA CENTRAL COLLAGE- SRI LANKA.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-400">Privacy Policy</h4>
              <p className="text-sm font-semibold text-gray-600 leading-relaxed">
                At EDU DINSI, we respect your privacy. We do not collect any personal data from our visitors. The content you see is fetched live from our public Google Sheets database.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-400">Terms of Use</h4>
              <p className="text-sm font-semibold text-gray-600 leading-relaxed">
                All content provided on EDU DINSI is for educational purposes. You are free to read and share our blogs, provided you credit the original source.
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">© 2026 EDU DINSI. ALL RIGHTS RESERVED.</p>
            <a 
              href="https://devportfoliaandgames.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2 group"
            >
              DISAS DINSITHA'S PORTFOLIO
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          <div className="flex gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <a href="#" className="hover:text-black">Twitter</a>
            <a href="#" className="hover:text-black">Instagram</a>
            <a 
              href="https://www.linkedin.com/in/a-disas-dinsitha-0589233a4?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-black"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FeedCard = memo(({ item, onClick }: { item: FeedItem, onClick: () => void }) => {
  const isNasa = item.type === 'nasa';
  
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      onClick={onClick}
      className={`cursor-pointer overflow-hidden rounded-[2.5rem] border transition-all duration-300 group ${
        isNasa 
          ? 'bg-brand-blue/5 border-brand-blue/10 hover:border-brand-blue/30' 
          : 'bg-brand-green/5 border-brand-green/10 hover:border-brand-green/30'
      }`}
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white ${isNasa ? 'bg-brand-blue' : 'bg-brand-green'}`}>
          {isNasa ? 'NASA' : 'WIKI'}
        </div>
      </div>
      <div className="p-8">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">{item.date}</p>
        <h3 className={`text-2xl mb-4 line-clamp-2 ${isNasa ? 'group-hover:text-brand-blue' : 'group-hover:text-brand-green'} transition-colors`}>
          {item.title}
        </h3>
        <p className="text-gray-500 font-medium leading-relaxed mb-6 line-clamp-3">
          {item.description}
        </p>
        <button className={`flex items-center gap-2 text-sm font-bold transition-colors ${isNasa ? 'text-brand-blue' : 'text-brand-green'}`}>
          Read Full Article <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
});
