import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, MessageCircle, Tag, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import BlogListenControl from "@/components/BlogListenControl";
import { blogPosts2 } from "@/data/blogPosts";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const BlogPost2 = () => {
  const { slug } = useParams<{ slug: string }>();

  const post = useMemo(() => blogPosts2.find((p) => p.slug === slug), [slug]);
  const related = useMemo(
    () => blogPosts2.filter((p) => p.slug !== slug && p.category === post?.category).slice(0, 2),
    [slug, post]
  );

  const processedContent = useMemo(() => {
    if (!post?.content) return "";
    return post.content.replace(/(<[^>]+>)|(\b[QA]\.(?=[A-Za-z0-9]))/g, (match, tag) => {
      if (tag) return tag;
      return match + " ";
    });
  }, [post?.content]);

  if (!post) return <Navigate to="/blog-2" replace />;

  return (
    <>
      <Helmet>
        <title>{post.title} | ConverseAI Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
        <link rel="canonical" href={`https://www.theconverseai.com/blog-2/${post.slug}`} />
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
          .blogpost-back:hover { color: #7C3AED !important; }
          .blogpost-related-card:hover { transform: translateY(-4px); box-shadow: 0 18px 48px rgba(124,58,237,0.13) !important; }
          @media (max-width: 768px) {
            .blogpost-layout { grid-template-columns: 1fr !important; }
            .blogpost-meta-bar { flex-direction: column !important; gap: 12px !important; }
          }
        `}</style>
      </Helmet>

      <div className="blogpost-page" style={{ background: "#FAFAFC", minHeight: "100vh" }}>

        {/* ── Hero Banner ── */}
        <section style={{ background: "#fff", borderBottom: "1px solid #E9E5F3", paddingTop: "60px", paddingBottom: "0" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px" }}>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <Link
                to="/blog-2"
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
              <div style={{ display: "flex", alignItems: "center", gap: "18px", color: "#6B7280", fontSize: "13px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Calendar size={13} /> {post.date}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Clock size={13} /> {post.readTime}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <MessageCircle size={13} /> {post.commentsCount} comments
                </span>
              </div>
            </motion.div>
          </div>

          <BlogListenControl article={{ id: String(post.id), route: `/blog-2/${post.slug}`, title: post.title, description: post.excerpt, author: post.author.name, publishedAt: post.date, estimatedReadingTime: post.readTime, contentHtml: processedContent, imageAlt: post.title }} />
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
              marginBottom: "40px",
            }}
            className="blogpost-content"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "48px" }}
          >
            <Tag size={14} style={{ color: "#7C3AED" }} />
            <span style={{ color: "#6B7280", fontSize: "13px" }}>Filed under:</span>
            <span
              style={{
                background: "#F3E8FF",
                color: "#7C3AED",
                fontSize: "12px",
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: "999px",
              }}
            >
              {post.category}
            </span>
          </motion.div>

          {/* ── Related Articles ── */}
          {related.length > 0 && (
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1F2937", marginBottom: "24px" }}>
                Related Articles
              </h2>
              <div
                className="blogpost-layout"
                style={{
                  display: "grid",
                  gridTemplateColumns: related.length > 1 ? "1fr 1fr" : "1fr",
                  gap: "24px",
                }}
              >
                {related.map((relPost, i) => (
                  <motion.div
                    key={relPost.id}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    className="blogpost-related-card"
                    style={{
                      background: "#fff",
                      borderRadius: "20px",
                      boxShadow: "0 12px 40px rgba(124,58,237,0.08)",
                      border: "1px solid #E9E5F3",
                      overflow: "hidden",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    }}
                  >
                    <img
                      src={relPost.image}
                      alt={relPost.title}
                      loading="lazy"
                      style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
                    />
                    <div style={{ padding: "20px" }}>
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
                          margin: "0 0 10px",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {relPost.title}
                      </h3>
                      <Link
                        to={`/blog-2/${relPost.slug}`}
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
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "56px" }}>
            <Link
              to="/blog-2"
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

export default BlogPost2;
