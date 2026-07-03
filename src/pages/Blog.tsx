import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Search, BookOpen } from "lucide-react";
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
  const { posts: dbPosts, loading: dbLoading } = useBlogPosts();

  // Map database posts only (removed all static posts)
  const allPosts = useMemo<UnifiedPost[]>(() => {
    return dbPosts.map(dbToUnified);
  }, [dbPosts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      return (
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery, allPosts]);

  const recentPosts = allPosts.slice(0, 5);

  return (
    <>
      <Helmet>
        <title>Blog | AI Chatbot &amp; Customer Engagement Insights | ConverseAI</title>
        <meta name="description" content="Explore insights on AI chatbots, WhatsApp Business, and customer engagement strategies from ConverseAI experts. Stay ahead with the latest tips." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Blog | AI Chatbot & Customer Engagement | ConverseAI" />
        <meta property="og:description" content="Explore insights on AI chatbots, WhatsApp Business, and customer engagement strategies from ConverseAI experts." />
        <link rel="canonical" href="https://www.theconverseai.com/blog" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          .blog-page * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
          .blog-search-input:focus { outline: none; border-color: #7C3AED !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
          
          @media (max-width: 1024px) {
            .blog-layout { flex-direction: column !important; }
            .blog-sidebar { width: 100% !important; margin-top: 40px; }
            .blog-post-card-horizontal { flex-direction: column !important; }
            .blog-post-card-horizontal > div:first-child { width: 100% !important; height: 220px !important; }
          }
        `}</style>
      </Helmet>

      <div className="blog-page" style={{ background: "#FAFAFC", minHeight: "100vh" }}>
        {/* ── Hero / Banner ── */}
        <section
          style={{
            background: "linear-gradient(135deg, #0f1016 0%, #1c133a 100%)",
            padding: "80px 0 60px",
            textAlign: "center",
            color: "#fff",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <span
              style={{
                display: "inline-block",
                color: "#a855f7",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              ConverseAI
            </span>
            <h1 style={{ fontSize: "44px", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.2 }}>
              Blog List
            </h1>
            <p style={{ color: "#9ca3af", fontSize: "17px", maxWidth: "600px", margin: "0 auto", lineHeight: 1.65 }}>
              Insights, guides, and strategies for AI-powered customer engagement
            </p>
          </div>
        </section>

        {/* ── Main Layout ── */}
        <div style={{ background: "#FAFAFC", padding: "60px 0 100px" }}>
          <div
            className="blog-layout"
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", gap: "40px", alignItems: "flex-start" }}
          >
            {/* Left Column (Posts - 75%) */}
            <main id="main-content" style={{ flex: "1 1 0", minWidth: 0 }}>
              {dbLoading && (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #E9E5F3", borderTopColor: "#7C3AED", animation: "spin 0.8s linear infinite" }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "35px" }}>
                {!dbLoading &&
                  filteredPosts.map((post) => (
                    <article
                      key={post.id}
                      className="blog-post-card-horizontal"
                      style={{
                        display: "flex",
                        gap: "28px",
                        background: "#fff",
                        borderRadius: "20px",
                        overflow: "hidden",
                        border: "1px solid #E9E5F3",
                        boxShadow: "0 4px 20px rgba(124,58,237,0.03)",
                        position: "relative",
                      }}
                    >
                      {/* Image Thumbnail Link */}
                      <div style={{ width: "35%", minWidth: "220px", flexShrink: 0, position: "relative" }}>
                        <Link to={`/blog/${post.slug}`} style={{ display: "block", height: "100%" }}>
                          <img
                            src={post.image}
                            alt={post.title}
                            loading="lazy"
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        </Link>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, padding: "28px 28px 28px 0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 12px", lineHeight: 1.35 }}>
                            <Link
                              to={`/blog/${post.slug}`}
                              style={{ color: "#1F2937", textDecoration: "none", transition: "color 0.2s" }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#7C3AED")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#1F2937")}
                            >
                              {post.title}
                            </Link>
                          </h2>
                          <p
                            style={{
                              color: "#6B7280",
                              fontSize: "14.5px",
                              lineHeight: 1.6,
                              margin: "0 0 16px",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {post.excerpt}
                          </p>
                        </div>
                        <div>
                          <Link
                            to={`/blog/${post.slug}`}
                            style={{ display: "inline-flex", alignItems: "center", color: "#7C3AED", fontWeight: 600, fontSize: "14px", textDecoration: "none" }}
                          >
                            Read More →
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>

              {!dbLoading && filteredPosts.length === 0 && (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#6B7280" }}>
                  <BookOpen size={36} style={{ margin: "0 auto 16px", color: "#D1D5DB" }} />
                  <p style={{ fontSize: "16px" }}>No posts found matching your search.</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    style={{ marginTop: "12px", color: "#7C3AED", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                  >
                    Clear search
                  </button>
                </div>
              )}
            </main>

            {/* Right Column (Sidebar - 25%) */}
            <aside className="blog-sidebar" style={{ width: "320px", flexShrink: 0 }}>
              {/* Search Widget */}
              <div style={{ background: "#fff", border: "1px solid #E9E5F3", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  Search
                </h3>
                <div style={{ position: "relative" }}>
                  <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                  <input
                    type="search"
                    className="blog-search-input"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px 10px 36px",
                      border: "1px solid #E9E5F3",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#374151",
                      background: "#fff",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                  />
                </div>
              </div>

              {/* Recent Posts Widget */}
              <div style={{ background: "#fff", border: "1px solid #E9E5F3", borderRadius: "16px", padding: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  Recent Posts
                </h3>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                  {recentPosts.map((post) => (
                    <li key={post.id} style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: "12px" }}>
                      <Link
                        to={`/blog/${post.slug}`}
                        style={{
                          color: "#4B5563",
                          fontSize: "14px",
                          fontWeight: 500,
                          textDecoration: "none",
                          lineHeight: 1.4,
                          display: "block",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#7C3AED")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#4B5563")}
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Blog;