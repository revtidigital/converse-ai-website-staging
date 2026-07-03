import { useMemo, useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, MessageCircle, Tag, ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Footer from "@/components/Footer";
import { blogPosts as staticPosts } from "@/data/blogPosts";
import { useBlogPosts } from "@/hooks/useBlogPosts";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

interface UnifiedBlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  image: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  seo_title?: string;
  meta_description?: string;
  tags: string[];
  related_page_links?: any[];
  isFromDB: boolean;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { posts: dbPosts, loading: dbLoading } = useBlogPosts();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Monitor page scroll for reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.pageYOffset / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Merge database posts and static posts to create a unified pool
  const allPosts = useMemo<UnifiedBlogPost[]>(() => {
    const dbUnified = dbPosts.map((p) => ({
      id: `db-${p.id}`,
      slug: p.slug,
      title: p.title,
      category: p.category,
      excerpt: p.excerpt,
      content: p.content,
      date: p.published_date,
      readTime: p.read_time,
      image: p.hero_image,
      author: {
        name: p.author_name,
        role: p.author_role,
        avatar: p.author_avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces&q=80",
      },
      seo_title: p.seo_title || p.title,
      meta_description: p.meta_description || p.excerpt,
      tags: p.tags,
      related_page_links: Array.isArray(p.related_page_links) ? p.related_page_links : [],
      isFromDB: true,
    }));

    const dbSlugs = new Set(dbUnified.map((p) => p.slug));
    const staticUnified = staticPosts
      .filter((p) => !dbSlugs.has(p.slug))
      .map((p) => ({
        id: `static-${p.id}`,
        slug: p.slug,
        title: p.title,
        category: p.category,
        excerpt: p.excerpt,
        content: p.content,
        date: p.date,
        readTime: p.readTime,
        image: p.image,
        author: p.author,
        seo_title: p.title,
        meta_description: p.excerpt,
        tags: [p.category],
        related_page_links: [],
        isFromDB: false,
      }));

    return [...dbUnified, ...staticUnified];
  }, [dbPosts]);

  // Retrieve current post matching slug
  const post = useMemo(() => {
    const found = allPosts.find((p) => p.slug === slug);
    if (found) return found;

    // Direct fallback to static posts if Supabase results are still loading
    const staticFound = staticPosts.find((p) => p.slug === slug);
    if (staticFound) {
      return {
        id: `static-${staticFound.id}`,
        slug: staticFound.slug,
        title: staticFound.title,
        category: staticFound.category,
        excerpt: staticFound.excerpt,
        content: staticFound.content,
        date: staticFound.date,
        readTime: staticFound.readTime,
        image: staticFound.image,
        author: staticFound.author,
        seo_title: staticFound.title,
        meta_description: staticFound.excerpt,
        tags: [staticFound.category],
        related_page_links: [],
        isFromDB: false,
      } as UnifiedBlogPost;
    }
    return null;
  }, [slug, allPosts]);

  // Determine related posts (filter by category and exclude current post)
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    let filtered = allPosts.filter((p) => p.slug !== post.slug && p.category === post.category);
    if (filtered.length === 0) {
      filtered = allPosts.filter((p) => p.slug !== post.slug);
    }
    return filtered.slice(0, 6);
  }, [post, allPosts]);

  // Embla Carousel Hook
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trim",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Redirect to blog listing if not found (only after database loads or fallback checked)
  if (!post && !dbLoading) return <Navigate to="/blog" replace />;

  if (!post) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #E9E5F3", borderTopColor: "#7C3AED", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const finalSeoTitle = post.seo_title || post.title;
  const finalMetaDesc = post.meta_description || post.excerpt;

  return (
    <>
      <Helmet>
        <title>{finalSeoTitle} | ConverseAI Blog</title>
        <meta name="description" content={finalMetaDesc} />
        <meta property="og:title" content={finalSeoTitle} />
        <meta property="og:description" content={finalMetaDesc} />
        <meta property="og:image" content={post.image} />
        <link rel="canonical" href={`https://www.theconverseai.com/blog/${post.slug}`} />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          .blogpost-page * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
          .blogpost-content h2 { font-size: 22px; font-weight: 700; color: #1F2937; margin: 32px 0 12px; line-height: 1.3; }
          .blogpost-content h3 { font-size: 18px; font-weight: 700; color: #1F2937; margin: 26px 0 10px; }
          .blogpost-content p { color: #4B5563; font-size: 16px; line-height: 1.8; margin: 0 0 18px; }
          .blogpost-content ul, .blogpost-content ol { padding-left: 22px; margin: 0 0 18px; }
          .blogpost-content li { color: #4B5563; font-size: 16px; line-height: 1.75; margin-bottom: 8px; }
          .blogpost-content li strong { color: #1F2937; }
          .blogpost-content blockquote { border-left: 4px solid #7C3AED; margin: 28px 0; padding: 16px 24px; background: #F3E8FF; border-radius: 0 12px 12px 0; font-style: italic; color: #374151; font-size: 16px; line-height: 1.7; }
          .blogpost-content code { background: #F3E8FF; color: #7C3AED; padding: 2px 7px; border-radius: 5px; font-size: 14px; }
          .blogpost-content img { max-width: 100%; border-radius: 12px; margin: 24px 0; display: block; }
          .blogpost-content a { color: #7C3AED; text-decoration: underline; }
          .blogpost-back:hover { color: #7C3AED !important; }
          .blogpost-related-card:hover { transform: translateY(-4px); box-shadow: 0 18px 48px rgba(124,58,237,0.13) !important; }
          
          .embla-carousel { overflow: hidden; position: relative; width: 100%; }
          .embla-carousel__container { display: flex; gap: 24px; }
          .embla-carousel__slide { flex: 0 0 calc(33.333% - 16px); min-width: 0; }
          
          @media (max-width: 1024px) {
            .embla-carousel__slide { flex: 0 0 calc(50% - 12px); }
          }
          @media (max-width: 768px) {
            .blogpost-layout { flex-direction: column !important; }
            .blogpost-meta-bar { flex-direction: column !important; gap: 12px !important; }
            .embla-carousel__slide { flex: 0 0 100%; }
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </Helmet>

      {/* Reading Progress Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "3px",
          background: "linear-gradient(to right, #7C3AED, #A855F7)",
          width: `${scrollProgress}%`,
          zIndex: 1000,
          transition: "width 0.1s ease",
        }}
      />

      <div className="blogpost-page" style={{ background: "#FAFAFC", minHeight: "100vh" }}>

        {/* ── Hero Banner ── */}
        <section style={{ background: "#fff", borderBottom: "1px solid #E9E5F3", paddingTop: "60px", paddingBottom: "0" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px" }}>

            {/* Back link */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <Link
                to="/blog"
                className="blogpost-back"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#6B7280",
                  fontSize: "14px",
                  fontWeight: 500,
                  textDecoration: "none",
                  marginBottom: "28px",
                  transition: "color 0.2s",
                }}
              >
                <ArrowLeft size={15} /> Back to Blog
              </Link>
            </motion.div>

            {/* Category */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} style={{ marginBottom: "16px" }}>
              <span
                style={{
                  background: "#F3E8FF",
                  color: "#7C3AED",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "5px 14px",
                  borderRadius: "999px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {post.category}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              style={{
                fontSize: "clamp(26px, 4vw, 36px)",
                fontWeight: 800,
                color: "#1F2937",
                lineHeight: 1.25,
                margin: "0 0 24px",
              }}
            >
              {post.title}
            </motion.h1>

            {/* Meta bar */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="blogpost-meta-bar"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "28px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "2px solid #E9E5F3" }}
                />
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1F2937" }}>{post.author.name}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#9CA3AF" }}>{post.author.role}</p>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", alignItems: "center", gap: "18px", color: "#6B7280", fontSize: "13px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Calendar size={13} /> {post.date}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Clock size={13} /> {post.readTime}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px" }}
          >
            <img
              src={post.image}
              alt={post.title}
              style={{
                width: "100%",
                aspectRatio: "16/9",
                objectFit: "cover",
                borderRadius: "16px 16px 0 0",
                display: "block",
              }}
            />
          </motion.div>
        </section>

        {/* ── Article Body ── */}
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px 80px" }}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            style={{
              background: "#fff",
              borderRadius: "0 0 20px 20px",
              padding: "40px 44px",
              boxShadow: "0 12px 40px rgba(124,58,237,0.07)",
              border: "1px solid #E9E5F3",
              borderTop: "none",
              marginBottom: "32px",
            }}
            className="blogpost-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* ── Dynamic Related Resources (Interlinking Box) ── */}
          {post.related_page_links && post.related_page_links.length > 0 && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{
                background: "linear-gradient(to right, rgba(124,58,237,0.03), rgba(168,85,247,0.03))",
                borderLeft: "4px solid #7C3AED",
                padding: "24px",
                borderRadius: "0 16px 16px 0",
                marginBottom: "40px",
                border: "1px solid #E9E5F3",
                borderLeftWidth: "4px",
              }}
            >
              <h4 style={{ margin: "0 0 14px", fontSize: "16px", fontWeight: 700, color: "#1F2937" }}>
                Related Resources
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {post.related_page_links.map((link: any, idx: number) => (
                  <li key={idx} style={{ margin: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Link to={link.url} style={{ color: "#7C3AED", fontWeight: 600, fontSize: "15px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {link.label} <ArrowRight size={14} />
                      </Link>
                    </div>
                    {link.description && (
                      <span style={{ color: "#6B7280", fontSize: "13.5px", marginLeft: "2px" }}>
                        {link.description}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Tags / Category row */}
          {post.tags && post.tags.length > 0 && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "56px",
              }}
            >
              <Tag size={14} style={{ color: "#7C3AED" }} />
              <span style={{ color: "#6B7280", fontSize: "13px", marginRight: "4px" }}>Tags:</span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "#F3E8FF",
                    color: "#7C3AED",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "4px 12px",
                    borderRadius: "999px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          )}

          {/* ── Related Articles Carousel ── */}
          {relatedPosts.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#1F2937",
                    margin: 0,
                  }}
                >
                  Related Articles
                </h2>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={scrollPrev}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "1px solid #E9E5F3",
                      background: "#fff",
                      color: "#7C3AED",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#7C3AED";
                      e.currentTarget.style.background = "#F3E8FF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E9E5F3";
                      e.currentTarget.style.background = "#fff";
                    }}
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={scrollNext}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "1px solid #E9E5F3",
                      background: "#fff",
                      color: "#7C3AED",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#7C3AED";
                      e.currentTarget.style.background = "#F3E8FF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E9E5F3";
                      e.currentTarget.style.background = "#fff";
                    }}
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Embla Carousel Container */}
              <div ref={emblaRef} className="embla-carousel">
                <div className="embla-carousel__container">
                  {relatedPosts.map((relPost) => (
                    <div key={relPost.id} className="embla-carousel__slide">
                      <div
                        className="blogpost-related-card"
                        style={{
                          background: "#fff",
                          borderRadius: "20px",
                          boxShadow: "0 12px 40px rgba(124,58,237,0.08)",
                          border: "1px solid #E9E5F3",
                          overflow: "hidden",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          transition: "transform 0.25s ease, box-shadow 0.25s ease",
                        }}
                      >
                        <img
                          src={relPost.image}
                          alt={relPost.title}
                          loading="lazy"
                          style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
                        />
                        <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            <span
                              style={{
                                background: "#F3E8FF",
                                color: "#7C3AED",
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "3px 10px",
                                borderRadius: "999px",
                                display: "inline-block",
                                marginBottom: "10px",
                              }}
                            >
                              {relPost.category}
                            </span>
                            <h3
                              style={{
                                fontSize: "15px",
                                fontWeight: 700,
                                color: "#1F2937",
                                margin: "0 0 12px",
                                lineHeight: 1.4,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {relPost.title}
                            </h3>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Link
                              to={`/blog/${relPost.slug}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                color: "#7C3AED",
                                fontWeight: 600,
                                fontSize: "13px",
                                textDecoration: "none",
                              }}
                            >
                              Read Article <ArrowRight size={13} />
                            </Link>
                            <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{relPost.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Back to blog */}
          <div style={{ textAlign: "center", marginTop: "56px" }}>
            <Link
              to="/blog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "#7C3AED",
                fontWeight: 700,
                fontSize: "15px",
                textDecoration: "none",
                border: "2px solid #7C3AED",
                padding: "12px 28px",
                borderRadius: "12px",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#7C3AED";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#7C3AED";
              }}
            >
              <ArrowLeft size={15} /> All Articles
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;