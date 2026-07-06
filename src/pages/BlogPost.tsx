import { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { useBlogPosts, useBlogPostBySlug } from "@/hooks/useBlogPosts";
import { blogHref } from "@/lib/blogUrl";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { post, loading: postLoading } = useBlogPostBySlug(slug);
  const { posts: dbPosts, loading: dbLoading } = useBlogPosts();
  
  const [scrollPct, setScrollPct] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(total > 0 ? (window.pageYOffset / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const recentPosts = useMemo(() => {
    return dbPosts.slice(0, 4);
  }, [dbPosts]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    let rel = dbPosts.filter((p) => p.slug !== slug && p.category === post.category);
    if (rel.length < 3) rel = dbPosts.filter((p) => p.slug !== slug);
    return rel.slice(0, 3);
  }, [post, dbPosts, slug]);

  /* Auto-scroll cards */
  useEffect(() => {
    const slider = document.getElementById("autoScrollCards");
    if (!slider || relatedPosts.length === 0) return;
    let paused = false;
    let dir = 1;
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    slider.addEventListener("mouseenter", onEnter);
    slider.addEventListener("mouseleave", onLeave);
    const iv = setInterval(() => {
      if (paused) return;
      const max = slider.scrollWidth - slider.clientWidth;
      slider.scrollLeft += dir;
      if (slider.scrollLeft >= max) dir = -1;
      else if (slider.scrollLeft <= 0) dir = 1;
    }, 15);
    return () => {
      slider.removeEventListener("mouseenter", onEnter);
      slider.removeEventListener("mouseleave", onLeave);
      clearInterval(iv);
    };
  }, [relatedPosts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?s=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!post && !postLoading) return <Navigate to={blogIndexHref()} replace />;

  if (!post) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #f0edfb", borderTopColor: "#7c3aed", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const seoTitle = post.seo_title || post.title;
  const seoDesc = post.meta_description || post.excerpt;
  // TODO: Re-enable custom Canonical URL field when custom SEO overrides are implemented.
  // const canonical = post.canonical_url || `https://blog.theconverseai.com/${post.slug}/`;
  const canonical = (post.status === "published" && post.slug)
    ? `https://blog.theconverseai.com/${post.slug}`
    : "https://blog.theconverseai.com/";
  const relatedLinks: any[] = Array.isArray(post.related_page_links) ? post.related_page_links : [];

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={post.hero_image} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={canonical} />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          .wp-post * { box-sizing: border-box; }
          .wp-post { font-family: 'Inter', sans-serif; background: #fafafd; color: #1f2937; }

          /* Reading progress */
          .hfe-reading-progress-bar {
            position: fixed; top: 0; left: 0;
            height: 3px;
            background: linear-gradient(to right, #7c3aed, #a855f7);
            z-index: 9999;
            transition: width 0.1s ease;
          }

          /* Hero matching Blog.tsx list page exactly */
          .wp-post-hero {
            background: linear-gradient(90deg, #f1e9ff 0%, #ffffff 100%);
            min-height: 500px;
            padding: 84px 24px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .wp-post-hero .by-line {
            display: inline-block;
            background: #eddffd;
            color: #7c3aed;
            font-size: 11.5px;
            font-weight: 600;
            padding: 3px 12px;
            border-radius: 999px;
            letter-spacing: 0.02em;
            margin-bottom: 12px;
          }
          .wp-post-hero h1 {
            font-size: 52px;
            font-weight: 700;
            color: #a855f7;
            max-width: 960px;
            margin: 10px auto 0;
            line-height: 1.2;
          }

          /* Main layout container with sidebar */
          .wp-post-body {
            max-width: 1140px;
            margin: 0 auto;
            padding: 60px 24px 80px;
            display: flex;
            gap: 32px;
            align-items: flex-start;
          }

          /* LEFT: Article content */
          .wp-post-area {
            flex: 1 1 0;
            min-width: 0;
          }

          /* Completely transparent content column - no card container box */
          .wp-post-content-box {
            background: transparent;
            padding: 0;
            margin-bottom: 40px;
          }

          /* Hero image directly on layout grid */
          .wp-post-hero-img {
            width: 100%;
            border-radius: 12px;
            display: block;
            margin-bottom: 28px;
            overflow: hidden;
            border: 1px solid #eae6f8;
          }
          .wp-post-hero-img img { width: 100%; height: auto; display: block; }

          /* Rich content styles – matching inspector properties */
          .wp-post-content { 
            font-size: 18px; 
            line-height: 1.8; 
            color: #6F677E; 
            font-family: "Inter", sans-serif;
          }
          .wp-post-content h2 { font-size: 26px; font-weight: 700; color: #111827; margin: 40px 0 16px; line-height: 1.3; }
          .wp-post-content h3 { font-size: 22px; font-weight: 700; color: #111827; margin: 32px 0 14px; }
          .wp-post-content h4 { font-size: 18px; font-weight: 700; color: #111827; margin: 22px 0 12px; }
          .wp-post-content p { margin: 0 0 20px; }
          .wp-post-content p:last-child { margin-bottom: 0; }
          .wp-post-content ul, .wp-post-content ol { padding-left: 24px; margin: 0 0 20px; }
          .wp-post-content li { margin-bottom: 10px; }
          .wp-post-content strong { color: #111827; font-weight: 700; }
          .wp-post-content em { font-style: italic; }
          
          /* Custom styled blockquote/callout matching picture 2 exactly */
          .wp-post-content blockquote {
            border-left: 3px solid #7c3aed;
            margin: 28px 0;
            padding: 20px 24px;
            background: #f7f5fa;
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: #6F677E;
            font-size: 16.5px;
          }
          .wp-post-content a { color: #7c3aed; text-decoration: underline; font-weight: 500; }
          .wp-post-content a:hover { color: #5b21b6; }
          .wp-post-content img {
            max-width: 100%;
            border-radius: 12px;
            margin: 28px 0;
            display: block;
            height: auto;
          }
          .wp-post-content table { width: 100%; border-collapse: collapse; margin: 28px 0; font-size: 15.5px; }
          .wp-post-content th, .wp-post-content td { border: 1px solid #e5e7eb; padding: 12px 16px; text-align: left; }
          .wp-post-content th { background: #f9fafb; font-weight: 700; color: #111827; }
          .wp-post-content tr:nth-child(even) td { background: #fafafa; }
          .wp-post-content code { background: #f3e8ff; color: #7c3aed; padding: 3px 8px; border-radius: 4px; font-size: 14px; }

          /* Related Reading (ul list in post) */
          .wp-related-reading {
            background: #faf8ff;
            border-left: 4px solid #7c3aed;
            padding: 24px 28px;
            border-radius: 0 12px 12px 0;
            margin-bottom: 40px;
          }
          .wp-related-reading h4 { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 14px; }
          .wp-related-reading ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
          .wp-related-reading li a { color: #7c3aed; font-weight: 500; font-size: 15px; text-decoration: none; }
          .wp-related-reading li a:hover { text-decoration: underline; }

          /* Related Pages headline */
          .wp-related-pages-title { font-size: 24px; font-weight: 700; color: #111827; margin: 52px 0 24px; }

          /* Carousel */
          .blog-cards-wrapper {
            display: flex;
            gap: 20px;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding: 4px 0 36px;
          }
          .blog-cards-wrapper::-webkit-scrollbar { display: none; }

          .blog-card {
            width: 340px; min-width: 340px; max-width: 340px;
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
            border-radius: 24px;
            background: #fff;
            border: 2px solid rgba(124,58,237,0.12);
            box-shadow: 0 10px 30px rgba(124,58,237,0.06);
            transition: all .32s ease;
          }
          .blog-card:hover {
            transform: translateY(-8px);
            border-color: rgba(124,58,237,0.28);
            box-shadow: 0 22px 55px rgba(124,58,237,0.13);
          }
          .blog-card img {
            width: 100%; height: 190px;
            object-fit: cover;
            display: block;
            transition: transform .4s ease;
          }
          .blog-card:hover img { transform: scale(1.04); }
          .card-overlay {
            position: absolute; left: 0; right: 0; bottom: 0;
            padding: 22px;
            background: linear-gradient(to top, rgba(17,24,39,.95) 0%, rgba(17,24,39,.78) 50%, rgba(17,24,39,.15) 80%, transparent 100%);
          }
          .card-overlay h4 {
            margin: 0;
            color: #fff;
            font-size: 16px; font-weight: 700; line-height: 1.4;
            text-shadow: 0 2px 8px rgba(0,0,0,.4);
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          }
          .read-more {
            margin-top: 14px;
            display: inline-flex; align-items: center;
            padding: 10px 20px;
            border-radius: 999px;
            background: linear-gradient(135deg, #6a32c9, #d946ef);
            color: #fff !important; text-decoration: none;
            font-size: 13px; font-weight: 600;
            box-shadow: 0 6px 15px rgba(106,50,201,.25);
            transition: all .28s ease;
          }
          .read-more:hover {
            transform: translateX(4px);
            background: linear-gradient(135deg, #5827ad, #c026d3);
          }

          /* RIGHT: Sidebar */
          .wp-sidebar { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 28px; position: sticky; top: 90px; }
          
          /* Sidebar Card matching list page */
          .wp-sidebar-card {
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #eae6f8;
            box-shadow: 0 8px 24px rgba(124, 58, 237, 0.04);
            padding: 24px;
          }
          
          .wp-sidebar-section-label { 
            display: flex; 
            align-items: center; 
            gap: 10px; 
            font-size: 15px; 
            font-weight: 700; 
            color: #1f2937; 
            margin-bottom: 16px; 
          }
          .wp-sidebar-section-label svg { width: 16px; height: 16px; color: #7c3aed; stroke: #7c3aed; stroke-width: 2.5; fill: none; }
          .label-search-icon { fill: none; stroke: #7c3aed; stroke-width: 2.5; }

          /* Search Widget input */
          .wp-search-wrap { position: relative; }
          .wp-search-wrap input { 
            width: 100%; 
            padding: 10px 14px 10px 38px; 
            border: 1px solid #dcdfe6; 
            border-radius: 8px; 
            font-size: 14px; 
            color: #606266; 
            background: #ffffff;
            font-family: inherit; 
            outline: none; 
            transition: border-color 0.2s; 
          }
          .wp-search-wrap input:focus { border-color: #7c3aed; }
          .wp-search-icon { 
            position: absolute; 
            left: 12px; 
            top: 50%; 
            transform: translateY(-50%); 
            width: 14px; 
            height: 14px; 
            color: #909399;
            fill: none;
            stroke: currentColor;
            stroke-width: 2.5;
          }

          /* Recent Posts Widget matching list page */
          .wp-recent-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 20px; }
          .wp-recent-item { padding: 0; }
          .wp-recent-item a { 
            display: block; 
            font-size: 14px; 
            color: #4b5563; 
            font-weight: 500; 
            text-decoration: none; 
            line-height: 1.45; 
            transition: color 0.2s; 
          }
          .wp-recent-item a:hover { color: #7c3aed; }

          @media (max-width: 768px) {
            .wp-post-hero { min-height: 360px; padding: 60px 20px; }
            .wp-post-hero h1 { font-size: 32px; }
            .blog-card { width: 280px; min-width: 280px; max-width: 280px; }
            .blog-card img { height: 160px; }
          }
        `}</style>
      </Helmet>

      {/* Reading progress bar */}
      <div className="hfe-reading-progress-bar" style={{ width: `${scrollPct}%` }} />

      <div className="wp-post">
        {/* Hero Banner */}
        <section className="wp-post-hero">
          <div className="by-line">ConverseAI</div>
          <h1>{post.title}</h1>
        </section>

        {/* Main Content Layout */}
        <div className="wp-post-body">
          {/* LEFT: Article Content */}
          <main className="wp-post-area">
            {/* Article Content Box */}
            <div className="wp-post-content-box">
              {/* Featured Image */}
              <div className="wp-post-hero-img">
                <img src={post.hero_image} alt={post.title} />
              </div>
              <div
                className="wp-post-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Related reading (interlinking) block */}
            {relatedLinks.length > 0 && (
              <div className="wp-related-reading">
                <h4>Related Reading</h4>
                <ul>
                  {relatedLinks.map((link: any, i: number) => (
                    <li key={i}>
                      <Link to={link.url}>{link.label}</Link>
                      {link.description && (
                        <span style={{ color: "#6b7280", fontSize: 13, marginLeft: 6 }}>— {link.description}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Pages Carousel */}
            {relatedPosts.length > 0 && (
              <>
                <h2 className="wp-related-pages-title">Related Pages:</h2>
                <div id="autoScrollCards" className="blog-cards-wrapper">
                  {relatedPosts.map((rp) => (
                    <div key={rp.id} className="blog-card">
                      <img src={rp.hero_image} alt={rp.title} loading="lazy" />
                      <div className="card-overlay">
                        <h4>{rp.title}</h4>
                        <Link to={blogHref(rp.slug)} className="read-more">
                          Explore Article →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </main>

          {/* RIGHT: Sidebar */}
          <aside className="wp-sidebar">
            {/* Search widget */}
            <div className="wp-sidebar-card">
              <div className="wp-sidebar-section-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="label-search-icon">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Search
              </div>
              <form onSubmit={handleSearchSubmit} className="wp-search-wrap">
                <svg className="wp-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Recent Posts widget */}
            <div className="wp-sidebar-card">
              <div className="wp-sidebar-section-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Recent Posts
              </div>
              <ul className="wp-recent-list">
                {recentPosts.map((p) => (
                  <li key={p.id} className="wp-recent-item">
                    <Link to={blogHref(p.slug)}>{p.title}</Link>
                  </li>
                ))}
                {recentPosts.length === 0 && !dbLoading && (
                  <li style={{ padding: "12px 0", color: "#9ca3af", fontSize: 13.5 }}>No posts yet</li>
                )}
              </ul>
            </div>
          </aside>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;