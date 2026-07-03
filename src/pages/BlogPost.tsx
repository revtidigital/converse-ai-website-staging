import { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { useBlogPosts } from "@/hooks/useBlogPosts";

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
  canonical_url?: string;
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

  // Map database posts only (removed all static posts)
  const allPosts = useMemo<UnifiedBlogPost[]>(() => {
    return dbPosts.map((p) => ({
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
      canonical_url: p.canonical_url || undefined,
    }));
  }, [dbPosts]);

  // Retrieve current post
  const post = useMemo(() => {
    return allPosts.find((p) => p.slug === slug) || null;
  }, [slug, allPosts]);

  // Determine related posts (carousel posts)
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    let filtered = allPosts.filter((p) => p.slug !== post.slug && p.category === post.category);
    if (filtered.length === 0) {
      filtered = allPosts.filter((p) => p.slug !== post.slug);
    }
    return filtered.slice(0, 6);
  }, [post, allPosts]);

  // Handle the automatic horizontal scrolling logic for related page cards
  useEffect(() => {
    const slider = document.getElementById("autoScrollCards");
    if (!slider) return;

    let paused = false;
    let direction = 1;

    const handleMouseEnter = () => { paused = true; };
    const handleMouseLeave = () => { paused = false; };

    slider.addEventListener("mouseenter", handleMouseEnter);
    slider.addEventListener("mouseleave", handleMouseLeave);

    const interval = setInterval(() => {
      if (paused) return;
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      slider.scrollLeft += direction;

      if (slider.scrollLeft >= maxScroll) {
        direction = -1;
      } else if (slider.scrollLeft <= 0) {
        direction = 1;
      }
    }, 15);

    return () => {
      slider.removeEventListener("mouseenter", handleMouseEnter);
      slider.removeEventListener("mouseleave", handleMouseLeave);
      clearInterval(interval);
    };
  }, [relatedPosts]);

  if (!post && !dbLoading) return <Navigate to="/blog" replace />;

  if (!post) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #E9E5F3", borderTopColor: "#7C3AED", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const finalSeoTitle = post.seo_title || post.title;
  const finalMetaDesc = post.meta_description || post.excerpt;
  const finalCanonical = post.canonical_url || `https://www.theconverseai.com/blog/${post.slug}`;

  return (
    <>
      <Helmet>
        <title>{finalSeoTitle} | ConverseAI Blog</title>
        <meta name="description" content={finalMetaDesc} />
        <meta property="og:title" content={finalSeoTitle} />
        <meta property="og:description" content={finalMetaDesc} />
        <meta property="og:image" content={post.image} />
        <link rel="canonical" href={finalCanonical} />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          .blogpost-page * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
          .blogpost-content h2 { font-size: 24px; font-weight: 700; color: #111827; margin: 36px 0 16px; line-height: 1.35; }
          .blogpost-content h3 { font-size: 20px; font-weight: 700; color: #111827; margin: 28px 0 12px; }
          .blogpost-content p { color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 20px; }
          .blogpost-content ul, .blogpost-content ol { padding-left: 24px; margin: 0 0 20px; }
          .blogpost-content li { color: #374151; font-size: 16px; line-height: 1.8; margin-bottom: 8px; }
          .blogpost-content li strong { color: #111827; }
          .blogpost-content blockquote { border-left: 4px solid #7C3AED; margin: 28px 0; padding: 18px 24px; background: rgba(124,58,237,0.05); border-radius: 0 12px 12px 0; font-style: italic; color: #374151; font-size: 16.5px; line-height: 1.75; }
          .blogpost-content code { background: #F3E8FF; color: #7C3AED; padding: 2px 7px; border-radius: 5px; font-size: 14px; }
          .blogpost-content img { max-width: 100%; border-radius: 12px; margin: 32px 0; display: block; height: auto; }
          .blogpost-content a { color: #7C3AED; text-decoration: underline; font-weight: 600; }
          
          /* Table Styles */
          .blogpost-content table { width: 100%; border-collapse: collapse; margin: 28px 0; font-size: 15px; }
          .blogpost-content th, .blogpost-content td { border: 1px solid #E9E5F3; padding: 12px 16px; text-align: left; }
          .blogpost-content th { background: #FAFAFC; font-weight: 700; color: #1F2937; }
          .blogpost-content tr:nth-child(even) td { background: #FAFAFC; }

          /* Carousel CSS styles matching reference */
          .blog-cards-wrapper {
              display: flex;
              gap: 16px;
              overflow-x: auto;
              overflow-y: hidden;
              scrollbar-width: none;
              -ms-overflow-style: none;
              padding: 20px 0 40px;
          }
          .blog-cards-wrapper::-webkit-scrollbar { display: none; }
          
          .blog-card {
              width: 320px;
              min-width: 320px;
              max-width: 320px;
              flex-shrink: 0;
              position: relative;
              overflow: hidden;
              border-radius: 24px;
              background: #ffffff;
              border: 2px solid rgba(124,58,237,0.12);
              box-shadow: 0 10px 30px rgba(124,58,237,0.06), 0 20px 60px rgba(124,58,237,0.03);
              transition: all .35s ease;
          }
          .blog-card:hover {
              transform: translateY(-8px);
              border-color: rgba(124,58,237,0.28);
              box-shadow: 0 25px 60px rgba(124,58,237,0.12), 0 10px 25px rgba(124,58,237,0.06);
          }
          .blog-card img {
              width: 100%;
              height: 180px;
              object-fit: cover;
              display: block;
              background: #fff;
              transition: .4s ease;
          }
          .blog-card:hover img {
              transform: scale(1.02);
          }
          .card-overlay {
              position: absolute;
              left: 0;
              right: 0;
              bottom: 0;
              padding: 20px;
              background: linear-gradient(
                  to top,
                  rgba(17,24,39,.95) 0%,
                  rgba(17,24,39,.8) 50%,
                  rgba(17,24,39,.2) 80%,
                  transparent 100%
              );
          }
          .card-overlay h4 {
              margin: 0;
              color: #ffffff;
              font-size: 16px;
              font-weight: 700;
              line-height: 1.4;
              text-shadow: 0 2px 8px rgba(0,0,0,.4);
              display: -webkit-box;
              WebkitLineClamp: 2;
              WebkitBoxOrient: "vertical";
              overflow: hidden;
              height: 44px;
          }
          .read-more {
              margin-top: 14px;
              display: inline-flex;
              align-items: center;
              padding: 8px 18px;
              border-radius: 999px;
              background: linear-gradient(135deg, #6a32c9, #d946ef);
              color: #fff !important;
              text-decoration: none;
              font-size: 12px;
              font-weight: 600;
              box-shadow: 0 6px 15px rgba(106,50,201,.25);
              transition: all .3s ease;
          }
          .read-more:hover {
              transform: translateX(5px);
              background: linear-gradient(135deg, #5827ad, #c026d3);
              color: #fff !important;
          }
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
        {/* ── Hero / Banner ── */}
        <section
          style={{
            background: "linear-gradient(135deg, #0f1016 0%, #1c133a 100%)",
            padding: "80px 0 60px",
            textAlign: "center",
            color: "#fff",
          }}
        >
          <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px" }}>
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
            <h1
              style={{
                fontSize: "clamp(26px, 4vw, 36px)",
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              {post.title}
            </h1>
          </div>
        </section>

        {/* ── Article Content ── */}
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "50px 24px 80px" }}>
          {/* Main Featured Image */}
          <div
            style={{
              marginBottom: "32px",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid #E9E5F3",
            }}
          >
            <img src={post.image} alt={post.title} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* HTML content rendered */}
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 12px 40px rgba(124,58,237,0.05)",
              border: "1px solid #E9E5F3",
              marginBottom: "32px",
            }}
            className="blogpost-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Interlinks section */}
          {post.related_page_links && post.related_page_links.length > 0 && (
            <div
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
                Related Pages:
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {post.related_page_links.map((link: any, idx: number) => (
                  <li key={idx} style={{ margin: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                    <Link
                      to={link.url}
                      style={{ color: "#7C3AED", fontWeight: 600, fontSize: "15px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      {link.label}
                    </Link>
                    {link.description && (
                      <span style={{ color: "#6B7280", fontSize: "13.5px" }}>
                        {link.description}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Carousel for Related Pages matching the styling requirements */}
          {relatedPosts.length > 0 && (
            <div style={{ marginTop: "40px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1F2937", marginBottom: "20px" }}>
                Related Pages:
              </h2>

              <div id="autoScrollCards" className="blog-cards-wrapper">
                {relatedPosts.map((relPost) => (
                  <div key={relPost.id} className="blog-card">
                    <img src={relPost.image} alt={relPost.title} loading="lazy" />
                    <div className="card-overlay">
                      <h4>{relPost.title}</h4>
                      <Link to={`/blog/${relPost.slug}`} className="read-more">
                        Explore Article →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Articles Link */}
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
                background: "transparent",
                transition: "all 0.2s",
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
              All Articles
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;