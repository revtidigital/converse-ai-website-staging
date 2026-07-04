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
  authorName: string;
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
    authorName: p.author_name,
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

  const recentPosts = allPosts.slice(0, 5);

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
          .wp-blog { font-family: 'Inter', sans-serif; background: #fff; color: #1f2937; }

          /* Page hero */
          .wp-blog-hero {
            background: linear-gradient(135deg, #0f1016 0%, #1a0e2e 50%, #0d1117 100%);
            padding: 90px 24px 80px;
            text-align: center;
          }
          .wp-blog-hero .hero-label {
            display: inline-block;
            color: #a855f7;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 16px;
          }
          .wp-blog-hero h1 { font-size: clamp(32px, 5vw, 44px); font-weight: 800; color: #fff; margin: 0; line-height: 1.2; }
          .wp-blog-hero p { color: #9ca3af; font-size: clamp(15px, 2vw, 18px); margin: 16px auto 0; max-width: 600px; line-height: 1.6; }

          /* Main layout */
          .wp-blog-body { max-width: 1200px; margin: 0 auto; padding: 60px 24px 80px; display: flex; gap: 48px; align-items: flex-start; }
          
          /* LEFT: Posts list */
          .wp-posts-area { flex: 1 1 0; min-width: 0; }
          .wp-posts-list { display: flex; flex-direction: column; gap: 40px; }

          /* Post Item Row layout */
          .wp-post-row { display: flex; gap: 32px; align-items: flex-start; }
          .wp-post-thumb-link { display: block; width: 360px; min-width: 360px; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; border: 1px solid #f0edfb; }
          .wp-post-thumb-link img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
          .wp-post-row:hover .wp-post-thumb-link img { transform: scale(1.03); }
          
          .wp-post-text { flex: 1; min-width: 0; }
          .wp-post-row-title { font-size: 22px; font-weight: 800; color: #111827; line-height: 1.35; margin: 0 0 12px; }
          .wp-post-row-title a { color: inherit; text-decoration: none; transition: color 0.2s; }
          .wp-post-row-title a:hover { color: #7c3aed; }
          .wp-post-row-excerpt { font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 16px; }
          
          .wp-post-row-readmore { display: inline-flex; align-items: center; color: #7c3aed; font-weight: 600; font-size: 15px; text-decoration: none; transition: transform 0.2s; }
          .wp-post-row-readmore:hover { text-decoration: underline; transform: translateX(2px); }

          /* RIGHT: Sidebar */
          .wp-sidebar { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 36px; position: sticky; top: 90px; }
          .wp-sidebar-section { background: #fff; }
          .wp-sidebar-section-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
          .wp-sidebar-section-label svg { width: 14px; height: 14px; fill: #7c3aed; }

          /* Search Widget */
          .wp-search-wrap { position: relative; }
          .wp-search-wrap input { width: 100%; padding: 12px 14px 12px 38px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; color: #374151; font-family: inherit; outline: none; transition: border-color 0.2s; }
          .wp-search-wrap input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.06); }
          .wp-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; fill: #9ca3af; }

          /* Recent Posts Widget */
          .wp-recent-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
          .wp-recent-item { border-bottom: 1px solid #f3f4f6; padding: 12px 0; }
          .wp-recent-item:first-child { padding-top: 0; }
          .wp-recent-item:last-child { border-bottom: none; padding-bottom: 0; }
          .wp-recent-item a { display: block; font-size: 14.5px; color: #374151; font-weight: 500; text-decoration: none; line-height: 1.45; transition: color 0.2s; }
          .wp-recent-item a:hover { color: #7c3aed; }

          /* Empty state */
          .wp-empty { text-align: center; padding: 80px 0; color: #9ca3af; font-size: 15px; }

          /* Loading spinner */
          @keyframes spin { to { transform: rotate(360deg); } }
          .wp-spinner { width: 36px; height: 36px; border-radius: 50%; border: 3px solid #f0edfb; border-top-color: #7c3aed; animation: spin 0.7s linear infinite; margin: 80px auto; }

          @media (max-width: 1024px) {
            .wp-blog-body { flex-direction: column; gap: 48px; }
            .wp-sidebar { width: 100%; position: static; }
          }
          @media (max-width: 768px) {
            .wp-post-row { flex-direction: column; gap: 16px; }
            .wp-post-thumb-link { width: 100%; min-width: 100%; }
            .wp-blog-hero { padding: 70px 20px 60px; }
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
                    <Link to={blogHref(post.slug)} className="wp-post-thumb-link">
                      <img src={post.image} alt={post.title} loading="lazy" />
                    </Link>
                    <div className="wp-post-text">
                      <h2 className="wp-post-row-title">
                        <Link to={blogHref(post.slug)}>{post.title}</Link>
                      </h2>
                      <p className="wp-post-row-excerpt">{post.excerpt}</p>
                      <Link to={blogHref(post.slug)} className="wp-post-row-readmore">
                        Read More →
                      </Link>
                    </div>
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
            <div className="wp-sidebar-section">
              <div className="wp-sidebar-section-label">
                <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z" />
                </svg>
                Search
              </div>
              <div className="wp-search-wrap">
                <svg className="wp-search-icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z" />
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
            <div className="wp-sidebar-section">
              <div className="wp-sidebar-section-label">
                <svg viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M288 248v28c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-28c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12zm-12 72H108c-6.6 0-12 5.4-12 12v28c0 6.6 5.4 12 12 12h168c6.6 0 12-5.4 12-12v-28c0-6.6-5.4-12-12-12zm108-188.1V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V48C0 21.5 21.5 0 48 0h204.1C264.8 0 277 5.1 286 14.1L369.9 98c9 8.9 14.1 21.2 14.1 33.9zm-128-80V128h76.1L256 51.9zM336 464V176H232c-13.3 0-24-10.7-24-24V48H48v416h288z" />
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