import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Clock, Calendar, ArrowRight, Tag, MessageCircle, BookOpen } from "lucide-react";
import Footer from "@/components/Footer";
import { blogPosts as staticPosts, CATEGORIES } from "@/data/blogPosts";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import type { DbBlogPost } from "@/hooks/useBlogPosts";

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

// ─── Unified post type ────────────────────────────────────────────────────────
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
  commentsCount?: number;
  isFromDB?: boolean;
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
    isFromDB: true,
  };
}

function staticToUnified(p: (typeof staticPosts)[0]): UnifiedPost {
  return {
    id: `static-${p.id}`,
    slug: p.slug,
    title: p.title,
    category: p.category,
    excerpt: p.excerpt,
    date: p.date,
    readTime: p.readTime,
    image: p.image,
    authorName: p.author.name,
    commentsCount: p.commentsCount,
  };
}

// ─── Category Badge ───────────────────────────────────────────────────────────
const CategoryBadge = ({ label }: { label: string }) => (
  <span
    style={{
      background: "#F3E8FF",
      color: "#7C3AED",
      fontSize: "12px",
      fontWeight: 600,
      padding: "4px 12px",
      borderRadius: "999px",
      display: "inline-block",
      letterSpacing: "0.02em",
    }}
  >
    {label}
  </span>
);

// ─── Featured Card ────────────────────────────────────────────────────────────
const FeaturedCard = ({ post }: { post: UnifiedPost }) => (
  <motion.article
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    custom={0}
    whileHover={{ y: -6 }}
    transition={{ type: "spring", stiffness: 300, damping: 22 }}
    style={{
      background: "#fff",
      borderRadius: "22px",
      boxShadow: "0 12px 40px rgba(124,58,237,0.08)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "row",
      minHeight: "260px",
      border: "1px solid #E9E5F3",
      cursor: "pointer",
    }}
    className="blog-featured-card"
  >
    {/* Image */}
    <div style={{ width: "42%", position: "relative", overflow: "hidden", flexShrink: 0 }}>
      <motion.img
        src={post.image}
        alt={post.title}
        loading="lazy"
        whileHover={{ scale: 1.04 }}
        transition={{ duration: 0.45 }}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {post.isFromDB && (
        <span style={{
          position: "absolute", top: "12px", left: "12px",
          background: "#7C3AED", color: "#fff", fontSize: "10px", fontWeight: 700,
          padding: "3px 8px", borderRadius: "999px", letterSpacing: "0.05em",
        }}>NEW</span>
      )}
    </div>

    {/* Content */}
    <div style={{ flex: 1, padding: "32px 36px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <CategoryBadge label={post.category} />
        <span style={{ color: "#9CA3AF", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
          <Clock size={13} /> {post.readTime}
        </span>
      </div>

      <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1F2937", lineHeight: 1.35, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {post.title}
      </h2>

      <p style={{ color: "#6B7280", fontSize: "14px", lineHeight: 1.65, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {post.excerpt}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
        <Link
          to={`/blog/${post.slug}`}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7C3AED", fontWeight: 600, fontSize: "14px", textDecoration: "none", transition: "gap 0.2s ease" }}
          className="blog-read-more"
        >
          Read More <ArrowRight size={15} />
        </Link>
        <span style={{ color: "#9CA3AF", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
          <Calendar size={13} /> {post.date}
        </span>
      </div>
    </div>
  </motion.article>
);

// ─── Blog Card ────────────────────────────────────────────────────────────────
const BlogCard = ({ post, index }: { post: UnifiedPost; index: number }) => (
  <motion.article
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-60px" }}
    custom={index}
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 300, damping: 22 }}
    style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 12px 40px rgba(124,58,237,0.08)", overflow: "hidden", border: "1px solid #E9E5F3", display: "flex", flexDirection: "column" }}
  >
    {/* Image */}
    <div style={{ overflow: "hidden", aspectRatio: "16/9", position: "relative" }}>
      <motion.img
        src={post.image}
        alt={post.title}
        loading="lazy"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.45 }}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {post.isFromDB && (
        <span style={{
          position: "absolute", top: "10px", left: "10px",
          background: "#7C3AED", color: "#fff", fontSize: "10px", fontWeight: 700,
          padding: "2px 7px", borderRadius: "999px",
        }}>NEW</span>
      )}
    </div>

    {/* Content */}
    <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <CategoryBadge label={post.category} />
        <span style={{ color: "#9CA3AF", fontSize: "12px", display: "flex", alignItems: "center", gap: "3px" }}>
          <Clock size={12} /> {post.readTime}
        </span>
      </div>

      <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1F2937", lineHeight: 1.4, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {post.title}
      </h3>

      <p style={{ color: "#6B7280", fontSize: "13.5px", lineHeight: 1.65, margin: 0, flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {post.excerpt}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #F3F4F6" }}>
        <Link
          to={`/blog/${post.slug}`}
          style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#7C3AED", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}
          className="blog-read-more"
        >
          Read More <ArrowRight size={13} />
        </Link>
        {post.commentsCount !== undefined && (
          <span style={{ color: "#9CA3AF", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
            <MessageCircle size={12} /> {post.commentsCount}
          </span>
        )}
      </div>
    </div>
  </motion.article>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const sidebarCard: React.CSSProperties = {
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 12px 40px rgba(124,58,237,0.08)",
  border: "1px solid #E9E5F3",
  padding: "24px",
  marginBottom: "24px",
};

const sidebarTitle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#1F2937",
  marginBottom: "16px",
  paddingBottom: "12px",
  borderBottom: "1px solid #F3F4F6",
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { posts: dbPosts, loading: dbLoading } = useBlogPosts();

  // Merge DB posts (first) + static posts (fallback, avoid slug duplicates)
  const allPosts = useMemo<UnifiedPost[]>(() => {
    const dbUnified = dbPosts.map(dbToUnified);
    const dbSlugs = new Set(dbUnified.map((p) => p.slug));
    const staticUnified = staticPosts
      .filter((p) => !dbSlugs.has(p.slug))
      .map(staticToUnified);
    return [...dbUnified, ...staticUnified];
  }, [dbPosts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === null || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, allPosts]);

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);
  const recentPosts = allPosts.slice(0, 4);

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
          .blog-read-more:hover { gap: 10px !important; }
          .blog-search-input:focus { outline: none; border-color: #7C3AED !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
          .blog-cat-btn:hover { background: #F3E8FF !important; color: #7C3AED !important; }
          .blog-recent-item:hover .blog-recent-title { color: #7C3AED !important; }
          @media (max-width: 1024px) {
            .blog-layout { flex-direction: column !important; }
            .blog-sidebar { width: 100% !important; position: static !important; }
            .blog-featured-card { flex-direction: column !important; min-height: unset !important; }
            .blog-featured-card > div:first-child { width: 100% !important; height: 220px !important; }
          }
          @media (max-width: 640px) {
            .blog-grid { grid-template-columns: 1fr !important; }
            .blog-hero-title { font-size: 30px !important; }
          }
        `}</style>
      </Helmet>

      <div className="blog-page" style={{ background: "#FAFAFC", minHeight: "100vh" }}>
        {/* ── Hero ── */}
        <section style={{ background: "#fff", borderBottom: "1px solid #E9E5F3", paddingTop: "60px", paddingBottom: "48px" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
              <span style={{ display: "inline-block", background: "#F3E8FF", color: "#7C3AED", fontSize: "12px", fontWeight: 700, padding: "6px 16px", borderRadius: "999px", marginBottom: "20px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                ConverseAI Blog
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={0} className="blog-hero-title" style={{ fontSize: "42px", fontWeight: 800, color: "#1F2937", margin: "0 0 16px", lineHeight: 1.2 }}>
              Insights &amp; Resources
            </motion.h1>
            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={1} style={{ color: "#6B7280", fontSize: "17px", maxWidth: "560px", margin: "0 auto", lineHeight: 1.65 }}>
              Expert guides, strategies, and deep-dives on AI-powered customer engagement.
            </motion.p>
          </div>
        </section>

        {/* ── Main Layout ── */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px 80px" }}>
          <div className="blog-layout" style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>

            {/* ── Left Column (75%) ── */}
            <main id="main-content" style={{ flex: "1 1 0", minWidth: 0 }}>

              {dbLoading && (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #E9E5F3", borderTopColor: "#7C3AED", animation: "spin 0.8s linear infinite" }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* Featured */}
              {!dbLoading && featuredPost && (
                <div style={{ marginBottom: "36px" }}>
                  <FeaturedCard post={featuredPost} />
                </div>
              )}

              {/* Grid */}
              {gridPosts.length > 0 ? (
                <div className="blog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "28px" }}>
                  {gridPosts.map((post, i) => (
                    <BlogCard key={post.id} post={post} index={i + 1} />
                  ))}
                </div>
              ) : !featuredPost && !dbLoading ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#6B7280" }}>
                  <BookOpen size={36} style={{ margin: "0 auto 16px", color: "#D1D5DB" }} />
                  <p style={{ fontSize: "16px" }}>No posts found matching your search.</p>
                  <button
                    onClick={() => { setSearchQuery(""); setActiveCategory(null); }}
                    style={{ marginTop: "12px", color: "#7C3AED", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : null}
            </main>

            {/* ── Sidebar (25%) ── */}
            <motion.aside
              className="blog-sidebar"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              style={{ width: "300px", flexShrink: 0, position: "sticky", top: "100px" }}
            >
              {/* Search */}
              <div style={sidebarCard}>
                <h3 style={sidebarTitle}>Search Articles</h3>
                <div style={{ position: "relative" }}>
                  <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                  <input
                    type="search"
                    className="blog-search-input"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1px solid #E9E5F3", borderRadius: "12px", fontSize: "14px", color: "#374151", background: "#FAFAFC", transition: "border-color 0.2s, box-shadow 0.2s" }}
                  />
                </div>
              </div>

              {/* Recent Posts */}
              <div style={sidebarCard}>
                <h3 style={sidebarTitle}>Recent Posts</h3>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
                  {recentPosts.map((post, i) => (
                    <li
                      key={post.id}
                      className="blog-recent-item"
                      style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px 0", borderBottom: i < recentPosts.length - 1 ? "1px solid #F3F4F6" : "none" }}
                    >
                      <img src={post.image} alt={post.title} loading="lazy" style={{ width: "56px", height: "42px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                      <div>
                        <Link
                          to={`/blog/${post.slug}`}
                          className="blog-recent-title"
                          style={{ color: "#374151", fontSize: "13px", fontWeight: 600, textDecoration: "none", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", transition: "color 0.2s" }}
                        >
                          {post.title}
                        </Link>
                        <p style={{ color: "#9CA3AF", fontSize: "11.5px", marginTop: "4px", display: "flex", alignItems: "center", gap: "3px" }}>
                          <Calendar size={11} /> {post.date}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories */}
              <div style={sidebarCard}>
                <h3 style={sidebarTitle}>Categories</h3>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <li>
                    <button
                      className="blog-cat-btn"
                      onClick={() => setActiveCategory(null)}
                      style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13.5px", fontWeight: 500, transition: "background 0.2s, color 0.2s", background: activeCategory === null ? "#F3E8FF" : "#FAFAFC", color: activeCategory === null ? "#7C3AED" : "#4B5563" }}
                    >
                      <span>All Posts</span>
                      <span style={{ background: activeCategory === null ? "#7C3AED" : "#E9E5F3", color: activeCategory === null ? "#fff" : "#6B7280", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px" }}>
                        {allPosts.length}
                      </span>
                    </button>
                  </li>
                  {CATEGORIES.map((cat) => {
                    const count = allPosts.filter((p) => p.category === cat.label).length;
                    if (count === 0) return null;
                    return (
                      <li key={cat.label}>
                        <button
                          className="blog-cat-btn"
                          onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
                          style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13.5px", fontWeight: 500, transition: "background 0.2s, color 0.2s", background: activeCategory === cat.label ? "#F3E8FF" : "#FAFAFC", color: activeCategory === cat.label ? "#7C3AED" : "#4B5563" }}
                        >
                          <span>{cat.label}</span>
                          <span style={{ background: activeCategory === cat.label ? "#7C3AED" : "#E9E5F3", color: activeCategory === cat.label ? "#fff" : "#6B7280", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px" }}>
                            {count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* CTA */}
              <div style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)", borderRadius: "20px", padding: "28px 24px", textAlign: "center", color: "#fff" }}>
                <h4 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 8px" }}>Ready to Automate?</h4>
                <p style={{ fontSize: "13px", opacity: 0.88, margin: "0 0 20px", lineHeight: 1.55 }}>
                  Start your free trial and see AI agents in action.
                </p>
                <Link
                  to="/book-demo"
                  style={{ display: "inline-block", background: "#fff", color: "#7C3AED", fontWeight: 700, fontSize: "13.5px", padding: "10px 22px", borderRadius: "12px", textDecoration: "none" }}
                >
                  Start Your Trial
                </Link>
              </div>
            </motion.aside>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Blog;