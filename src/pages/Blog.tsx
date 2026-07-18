import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "@/components/Footer";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import type { PublicBlogPost } from "@/hooks/useBlogPosts";
import { blogHref } from "@/lib/blogUrl";

interface UnifiedPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
}

function dbToUnified(p: PublicBlogPost): UnifiedPost {
  return {
    id: `db-${p.id}`,
    slug: p.slug,
    title: p.title,
    category: p.category,
    excerpt: p.excerpt,
    date: p.published_date,
    readTime: p.read_time,
    image: p.hero_image,
  };
}

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamQuery = searchParams.get("s") || "";
  const [searchQuery, setSearchQuery] = useState("");
  const { posts: dbPosts, loading: dbLoading } = useBlogPosts();

  useEffect(() => {
    setSearchQuery(searchParamQuery);
  }, [searchParamQuery]);

  const allPosts = useMemo<UnifiedPost[]>(() => dbPosts.map(dbToUnified), [dbPosts]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPosts.filter((p) => {
      return q === "" || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
    });
  }, [searchQuery, allPosts]);

  const recentPosts = allPosts.slice(0, 4);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim()) {
      setSearchParams({ s: val.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <>
      <Helmet>
        <title>ConverseAI - Blog Page</title>
        <meta name="description" content="Insights, guides, and strategies for AI-powered customer engagement" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://blog.theconverseai.com/" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          .wp-blog * { box-sizing: border-box; }
          .wp-blog {
            font-family: 'Inter', sans-serif;
            background: #fafafd;
            color: #1f2937;
            width: 100%;
            max-width: 100%;
            overflow: clip;
          }

          /* Page hero matching exact picture 2 guidelines */
          .wp-blog-hero {
            background: #fbf7fe;
            min-height: 500px;
            padding: 84px 24px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          .wp-blog-hero .hero-label {
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
          .wp-blog-hero h1 { 
            font-size: clamp(28px, 6vw, 52px); 
            font-weight: 700; 
            color: #a855f7; 
            max-width: 960px;
            margin: 10px auto 0;
            line-height: 1.2; 
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .wp-blog-hero p { 
            color: #6b7280; 
            font-size: 16px; 
            margin: 16px auto 0; 
            max-width: 600px; 
            line-height: 1.6; 
          }

          /* Main layout */
          .wp-blog-body { 
            max-width: 1140px; 
            margin: 0 auto; 
            padding: 60px 24px 80px; 
            display: flex; 
            gap: 32px; 
            align-items: flex-start; 
            width: 100%;
            box-sizing: border-box;
          }
          
          /* LEFT: Posts list */
          .wp-posts-area {
            flex: 1 1 0;
            min-width: 0;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          .wp-posts-list {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }

          /* Post Card layout matching live inspector exactly (flush image, transitions, shadows, display flex) */
          .wp-post-row { 
            display: flex; 
            background: #ffffff !important;
            border-radius: 20px !important;
            padding: 0 !important;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgb(0 0 0 / .05);
            transition: all 0.4s ease-in-out;
            overflow: hidden;
            border: 1.5px solid #e8dffc;
            min-height: 200px;
          }
          .wp-post-row:hover {
            border-color: #c084fc;
            box-shadow: 0 12px 30px rgba(124, 58, 237, 0.22);
            transform: translateY(-2px);
          }
          /* Make the entire card a single clickable link */
          .wp-post-card-link {
            display: flex;
            width: 100%;
            text-decoration: none;
            color: inherit;
            cursor: pointer;
          }
          
          .wp-post-thumb-link { 
            display: block; 
            width: 38%; 
            min-width: 38%; 
            aspect-ratio: 16/10;
            overflow: hidden; 
          }
          .wp-post-thumb-link img { 
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            display: block;
            transition: transform 0.4s ease;
          }
          .wp-post-card-link:hover .wp-post-thumb-link img {
            transform: scale(1.04);
          }
          
          .wp-post-text { 
            flex: 1; 
            min-width: 0; 
            padding: 36px 40px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .wp-post-row-title { 
            font-size: 24px; 
            font-weight: 700; 
            color: #7c3aed; 
            line-height: 1.3; 
            margin: 0 0 12px; 
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .wp-post-row-title a { color: inherit; text-decoration: none; transition: color 0.2s; }
          .wp-post-row-title a:hover { color: #6d28d9; }
          
          .wp-post-row-excerpt { 
            font-size: 14.5px; 
            color: #6b7280; 
            line-height: 1.6; 
            margin: 0 0 16px; 
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .wp-post-row-readmore { 
            display: inline-flex; 
            align-items: center; 
            color: #7c3aed; 
            font-weight: 600; 
            font-size: 14.5px; 
            text-decoration: none; 
            transition: transform 0.2s; 
            margin-top: auto;
          }
          .wp-post-row-readmore:hover { 
            transform: translateX(3px); 
          }

          /* RIGHT: Sidebar */
          .wp-sidebar { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 28px; position: sticky; top: 110px; }
          
          /* Sidebar Card matching picture 3 */
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

          /* Search Widget input matching picture 3 */
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

          /* Recent Posts Widget as simple list in card */
          .wp-recent-list {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .wp-recent-item {
            padding: 0;
            line-height: 1.45;
          }
          .wp-recent-item a {
            display: block;
            font-size: 15px;
            font-weight: 500;
            color: #595e68;
            text-decoration: none !important;
            transition: color 0.2s ease;
          }
          .wp-recent-item a:hover {
            color: #7c3aed;
          }

          /* Empty state */
          .wp-empty { text-align: center; padding: 80px 0; color: #9ca3af; font-size: 15px; }

          /* Loading spinner */
          @keyframes spin { to { transform: rotate(360deg); } }
          .wp-spinner { width: 36px; height: 36px; border-radius: 50%; border: 3px solid #f0edfb; border-top-color: #7c3aed; animation: spin 0.7s linear infinite; margin: 80px auto; }

          @media (max-width: 1024px) {
            .wp-blog-body { flex-direction: column; gap: 40px; }
            .wp-sidebar { width: 100%; position: static; }
            /* Keep standard list style */
          }
          @media (max-width: 768px) {
            .wp-post-card-link { flex-direction: column; }
            .wp-post-thumb-link { width: 100%; min-width: 100%; }
            .wp-post-text { padding: 24px; }
            .wp-blog-hero { min-height: 360px; padding: 60px 20px; }
          }
        `}</style>
      </Helmet>

      <div className="wp-blog">
        {/* Hero Banner */}
        <div className="wp-blog-hero">
          <span className="hero-label">ConverseAI</span>
          <h1>Blog List</h1>
          <p>Insights, guides, and strategies for AI-powered customer engagement</p>
        </div>

        {/* Main Content */}
        <div className="wp-blog-body">
          {/* LEFT: Posts List */}
          <main className="wp-posts-area">
            {dbLoading && <div className="wp-spinner" />}

            {!dbLoading && filteredPosts.length > 0 && (
              <div className="wp-posts-list">
                {filteredPosts.map((post) => (
                  <article key={post.id} className="wp-post-row">
                    <Link to={blogHref(post.slug)} className="wp-post-card-link">
                      <div className="wp-post-thumb-link">
                        <img src={post.image} alt={post.title} loading="lazy" />
                      </div>
                      <div className="wp-post-text">
                        <h2 className="wp-post-row-title">{post.title}</h2>
                        <p className="wp-post-row-excerpt">{post.excerpt}</p>
                        <span className="wp-post-row-readmore">Read More →</span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {!dbLoading && filteredPosts.length === 0 && (
              <div className="wp-empty">
                <p>No posts found{searchQuery ? ` for "${searchQuery}"` : ""}.</p>
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    style={{ marginTop: 12, color: "#7c3aed", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "inherit", fontSize: 14 }}
                  >
                    Clear search
                  </button>
                )}
              </div>
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
              <div className="wp-search-wrap">
                <svg className="wp-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>

            {/* Recent Posts widget */}
            <div className="wp-sidebar-card">
              <div className="wp-sidebar-section-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

export default Blog;
