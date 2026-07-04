import { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { useBlogPosts, useBlogPostBySlug } from "@/hooks/useBlogPosts";
import { blogHref, blogIndexHref } from "@/lib/blogUrl";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading: postLoading } = useBlogPostBySlug(slug);
  const { posts: dbPosts } = useBlogPosts();
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(total > 0 ? (window.pageYOffset / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    let rel = dbPosts.filter((p) => p.slug !== slug && p.category === post.category);
    if (rel.length < 3) rel = dbPosts.filter((p) => p.slug !== slug);
    return rel.slice(0, 6);
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
  const canonical = post.canonical_url || `https://blog.theconverseai.com/${post.slug}/`;
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
          .wp-post { font-family: 'Inter', sans-serif; background: #fff; color: #1f2937; }

          /* Reading progress */
          .hfe-reading-progress-bar {
            position: fixed; top: 0; left: 0;
            height: 3px;
            background: linear-gradient(to right, #7c3aed, #a855f7);
            z-index: 9999;
            transition: width 0.1s ease;
          }

          /* Hero */
          .wp-post-hero {
            background: linear-gradient(135deg, #0f1016 0%, #1a0e2e 55%, #0d1117 100%);
            padding: 80px 24px 60px;
            text-align: center;
          }
          .wp-post-hero .by-line {
            color: #a855f7;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 16px;
          }
          .wp-post-hero h1 {
            font-size: clamp(28px, 4vw, 42px);
            font-weight: 800;
            color: #fff;
            max-width: 900px;
            margin: 0 auto;
            line-height: 1.2;
          }

          /* Post body container */
          .wp-post-container {
            max-width: 860px;
            margin: 0 auto;
            padding: 48px 24px 80px;
          }

          /* Hero image */
          .wp-post-hero-img {
            width: 100%;
            border-radius: 12px;
            display: block;
            margin-bottom: 36px;
            overflow: hidden;
            border: 1px solid #f0edfb;
          }
          .wp-post-hero-img img { width: 100%; height: auto; display: block; }

          /* Content box */
          .wp-post-content-box {
            background: #fff;
            border: 1px solid #f0edfb;
            border-radius: 14px;
            padding: 48px 52px;
            box-shadow: 0 4px 24px rgba(124,58,237,0.04);
            margin-bottom: 36px;
          }

          /* Rich content styles – replicating WP Elementor text editor */
          .wp-post-content { font-size: 17px; line-height: 1.8; color: #374151; }
          .wp-post-content h2 { font-size: 24px; font-weight: 700; color: #000; margin: 40px 0 16px; line-height: 1.3; }
          .wp-post-content h3 { font-size: 20px; font-weight: 700; color: #111827; margin: 32px 0 14px; }
          .wp-post-content h4 { font-size: 18px; font-weight: 700; color: #111827; margin: 24px 0 12px; }
          .wp-post-content p { margin: 0 0 20px; }
          .wp-post-content p:last-child { margin-bottom: 0; }
          .wp-post-content ul, .wp-post-content ol { padding-left: 24px; margin: 0 0 20px; }
          .wp-post-content li { margin-bottom: 10px; }
          .wp-post-content strong { color: #111827; }
          .wp-post-content em { font-style: italic; }
          .wp-post-content blockquote {
            border-left: 4px solid #7c3aed;
            margin: 32px 0;
            padding: 18px 24px;
            background: rgba(124,58,237,0.04);
            border-radius: 0 12px 12px 0;
            font-style: italic;
            color: #374151;
            font-size: 16px;
          }
          .wp-post-content a { color: #7c3aed; text-decoration: underline; font-weight: 500; }
          .wp-post-content a:hover { color: #5b21b6; }
          .wp-post-content img {
            max-width: 100%;
            border-radius: 12px;
            margin: 32px 0;
            display: block;
            height: auto;
          }
          .wp-post-content table { width: 100%; border-collapse: collapse; margin: 28px 0; font-size: 16px; }
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
          .wp-related-pages-title { font-size: 24px; font-weight: 700; color: #000; margin: 52px 0 24px; }

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

          /* Back link */
          .wp-back-link {
            display: inline-flex; align-items: center; gap: 6px;
            margin-top: 52px;
            color: #7c3aed; font-weight: 600; font-size: 14px;
            text-decoration: none;
            border: 2px solid #7c3aed;
            padding: 10px 22px; border-radius: 10px;
            transition: all 0.2s;
          }
          .wp-back-link:hover { background: #7c3aed; color: #fff; }

          @media (max-width: 640px) {
            .wp-post-content-box { padding: 28px 24px; }
            .wp-post-hero { padding: 60px 20px 50px; }
            .wp-post-hero h1 { font-size: 28px; }
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

        {/* Post Container */}
        <div className="wp-post-container">
          {/* Featured Image */}
          <div className="wp-post-hero-img">
            <img src={post.hero_image} alt={post.title} />
          </div>

          {/* Article Content */}
          <div className="wp-post-content-box">
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

          {/* Back to Blog */}
          <div style={{ textAlign: "center" }}>
            <Link to={blogIndexHref()} className="wp-back-link">
              ← All Articles
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;