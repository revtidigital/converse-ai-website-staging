import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import type { DbBlogPost } from "@/hooks/useBlogPosts";

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

function dbToUnified(p: DbBlogPost): UnifiedPost {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { posts: dbPosts, loading: dbLoading } = useBlogPosts();

  const allPosts = useMemo<UnifiedPost[]>(() => dbPosts.map(dbToUnified), [dbPosts]);

  const filteredPosts = useMemo(() => {
    if (searchQuery.trim() === "") return allPosts;
    const q = searchQuery.toLowerCase();
    return allPosts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
    );
  }, [searchQuery, allPosts]);

  const recentPosts = allPosts.slice(0, 5);

  return (
    <>
      <Helmet>
        <title>ConverseAI - Blog Page</title>
        <meta name="description" content="Blog Page" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://blog.theconverseai.com/" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          .wp-blog * { box-sizing: border-box; }
          .wp-blog { font-family: 'Inter', sans-serif; background: #fff; color: #1f2937; }

          /* Progress bar */
          .hfe-reading-progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(to right, #7c3aed, #a855f7); z-index: 9999; transition: width 0.1s ease; }

          /* Header nav bar */
          .wp-header { background: #fff; border-bottom: 1px solid #f3f4f6; padding: 0 40px; height: 68px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; box-shadow: 0 1px 8px rgba(0,0,0,0.04); }
          .wp-header-logo { height: 36px; }
          .wp-header-cta { background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; padding: 9px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; transition: opacity 0.2s; }
          .wp-header-cta:hover { opacity: 0.88; }

          /* Page hero */
          .wp-blog-hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 100px 40px 90px; text-align: center; }
          .wp-blog-hero h1 { font-size: 48px; font-weight: 800; color: #fff; margin: 0 0 16px; line-height: 1.2; letter-spacing: -0.02em; }
          .wp-blog-hero p { color: rgba(255,255,255,0.9); font-size: 18px; margin: 0 auto; max-width: 600px; line-height: 1.6; }

          /* Main layout */
          .wp-blog-body { max-width: 1200px; margin: 0 auto; padding: 60px 24px 80px; display: flex; gap: 48px; align-items: flex-start; }
          
          /* LEFT: Posts grid – 3 column layout  */
          .wp-posts-area { flex: 1 1 0; min-width: 0; }
          .wp-posts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }

          /* Card */
          .wp-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.04); transition: box-shadow 0.3s, transform 0.3s; }
          .wp-card:hover { box-shadow: 0 12px 24px rgba(0,0,0,0.1); transform: translateY(-4px); }
          .wp-card-thumb { display: block; height: 200px; overflow: hidden; position: relative; }
          .wp-card-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
          .wp-card:hover .wp-card-thumb img { transform: scale(1.08); }
          .wp-card-body { padding: 20px 24px 24px; }
          .wp-card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
          .wp-card-category { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
          .wp-card-date { color: #9ca3af; font-size: 12px; }
          .wp-card-title { font-size: 16px; font-weight: 700; color: #111827; line-height: 1.4; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .wp-card-title a { color: inherit; text-decoration: none; transition: color 0.2s; }
          .wp-card-title a:hover { color: #667eea; }
          .wp-card-excerpt { font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
          .wp-card-readmore { color: #667eea; font-weight: 600; font-size: 14px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; transition: gap 0.2s; }
          .wp-card-readmore:hover { gap: 8px; }

          /* RIGHT: Sidebar */
          .wp-sidebar { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 36px; }
          .wp-sidebar-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
          .wp-sidebar-section-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
          .wp-sidebar-section-label svg { width: 16px; height: 16px; fill: #667eea; }

          /* Search */
          .wp-search-wrap { position: relative; }
          .wp-search-wrap input { width: 100%; padding: 12px 14px 12px 40px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 14px; color: #374151; font-family: inherit; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
          .wp-search-wrap input:focus { border-color: #667eea; box-shadow: 0 0 0 4px rgba(102,126,234,0.1); }
          .wp-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; fill: #9ca3af; }

          /* Recent Posts */
          .wp-recent-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0; }
          .wp-recent-item { border-bottom: 1px solid #f3f4f6; padding: 14px 0; display: flex; gap: 12px; align-items: flex-start; }
          .wp-recent-item:last-child { border-bottom: none; padding-bottom: 0; }
          .wp-recent-item:first-child { padding-top: 0; }
          .wp-recent-thumb { width: 60px; height: 45px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
          .wp-recent-content { flex: 1; min-width: 0; }
          .wp-recent-item a { display: block; font-size: 14px; color: #374151; font-weight: 600; text-decoration: none; line-height: 1.4; transition: color 0.2s; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .wp-recent-item a:hover { color: #667eea; }
          .wp-recent-date { color: #9ca3af; font-size: 12px; margin-top: 4px; }

          /* Empty state */
          .wp-empty { text-align: center; padding: 80px 0; color: #9ca3af; font-size: 15px; }

          /* Loading spinner */
          @keyframes spin { to { transform: rotate(360deg); } }
          .wp-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid #f0edfb; border-top-color: #7c3aed; animation: spin 0.7s linear infinite; margin: 60px auto; }

          @media (max-width: 1024px) {
            .wp-blog-body { flex-direction: column; }
            .wp-sidebar { width: 100%; }
            .wp-posts-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 640px) {
            .wp-posts-grid { grid-template-columns: 1fr; }
            .wp-blog-hero { padding: 70px 20px 60px; }
            .wp-blog-hero h1 { font-size: 32px; }
            .wp-blog-hero p { font-size: 16px; }
          }
        `}</style>
      </Helmet>

      <div className="wp-blog">
        {/* Hero Banner */}
        <div className="wp-blog-hero">
          <h1>Blog List</h1>
          <p>Insights, guides, and strategies for AI-powered customer engagement</p>
        </div>

        {/* Main Content */}
        <div className="wp-blog-body">
          {/* LEFT: Posts Grid */}
          <main className="wp-posts-area">
            {dbLoading && <div className="wp-spinner" />}

            {!dbLoading && filteredPosts.length > 0 && (
              <div className="wp-posts-grid">
                {filteredPosts.map((post) => (
                  <article key={post.id} className="wp-card">
                    <Link to={`/blog/${post.slug}`} className="wp-card-thumb">
                      <img src={post.image} alt={post.title} loading="lazy" />
                    </Link>
                    <div className="wp-card-body">
                      <div className="wp-card-meta">
                        <span className="wp-card-category">{post.category}</span>
                        <span className="wp-card-date">{post.date}</span>
                      </div>
                      <h2 className="wp-card-title">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>
                      <p className="wp-card-excerpt">{post.excerpt}</p>
                      <Link to={`/blog/${post.slug}`} className="wp-card-readmore">
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
                    onClick={() => setSearchQuery("")}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Recent Posts widget */}
            <div className="wp-sidebar-card">
              <div className="wp-sidebar-section-label">
                <svg viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M288 248v28c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-28c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12zm-12 72H108c-6.6 0-12 5.4-12 12v28c0 6.6 5.4 12 12 12h168c6.6 0 12-5.4 12-12v-28c0-6.6-5.4-12-12-12zm108-188.1V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V48C0 21.5 21.5 0 48 0h204.1C264.8 0 277 5.1 286 14.1L369.9 98c9 8.9 14.1 21.2 14.1 33.9zm-128-80V128h76.1L256 51.9zM336 464V176H232c-13.3 0-24-10.7-24-24V48H48v416h288z" />
                </svg>
                Recent Posts
              </div>
              <ul className="wp-recent-list">
                {recentPosts.map((p) => (
                  <li key={p.id} className="wp-recent-item">
                    <img src={p.image} alt={p.title} className="wp-recent-thumb" loading="lazy" />
                    <div className="wp-recent-content">
                      <Link to={`/blog/${p.slug}`}>{p.title}</Link>
                      <div className="wp-recent-date">{p.date}</div>
                    </div>
                  </li>
                ))}
                {recentPosts.length === 0 && !dbLoading && (
                  <li style={{ padding: "10px 0", color: "#9ca3af", fontSize: 13 }}>No posts yet</li>
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