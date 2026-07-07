import { useMemo, useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { useBlogPosts, useBlogPostBySlug } from "@/hooks/useBlogPosts";
import { blogHref } from "@/lib/blogUrl";
import NotFound from "@/pages/NotFound";

interface FurtherReadingLink {
  url: string;
  label: string;
  description?: string;
}

function extractFurtherReading(html: string): { cleanHtml: string; links: FurtherReadingLink[] } {
  if (typeof window === "undefined" || !html) return { cleanHtml: html, links: [] };
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links: FurtherReadingLink[] = [];

    // 1. First check if there is a class-based container
    const container = doc.querySelector(".further-reading, #further-reading-section");
    if (container) {
      const anchors = container.querySelectorAll("a");
      anchors.forEach(a => {
        const url = a.getAttribute("href") || "";
        const label = a.textContent?.trim() || "";
        let description = "";
        const parentText = a.parentElement?.textContent || "";
        const idx = parentText.indexOf(label);
        if (idx !== -1) {
          const remainingText = parentText.slice(idx + label.length).trim();
          if (remainingText.startsWith("—") || remainingText.startsWith("-")) {
            description = remainingText.slice(1).trim();
          }
        }
        if (url && label) links.push({ url, label, description });
      });
      container.remove();
      return { cleanHtml: doc.body.innerHTML, links };
    }

    // 2. Headings lookup: look for heading elements (h1-h6) containing "further reading" or "related reading"
    const headings = Array.from(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    const heading = headings.find(h => {
      const txt = h.textContent?.trim().toLowerCase() || "";
      return txt === "further reading" || txt === "related reading";
    });

    if (heading) {
      const parent = heading.parentElement || doc.body;
      const siblingsToExtract: Element[] = [heading];
      const headingLevel = parseInt(heading.tagName[1]);
      
      let next = heading.nextElementSibling;
      while (next) {
        if (/^H[1-6]$/i.test(next.tagName)) {
          const nextLevel = parseInt(next.tagName[1]);
          if (nextLevel <= headingLevel) break;
        }
        siblingsToExtract.push(next);
        next = next.nextElementSibling;
      }

      // Parse links from these elements
      siblingsToExtract.forEach(sibling => {
        const anchors = sibling.querySelectorAll("a");
        anchors.forEach(a => {
          const url = a.getAttribute("href") || "";
          const label = a.textContent?.trim() || "";
          let description = "";
          const parentText = a.parentElement?.textContent || "";
          const idx = parentText.indexOf(label);
          if (idx !== -1) {
            const remainingText = parentText.slice(idx + label.length).trim();
            if (remainingText.startsWith("—") || remainingText.startsWith("-")) {
              description = remainingText.slice(1).trim();
            }
          }
          if (url && label) links.push({ url, label, description });
        });
        sibling.remove();
      });

      return { cleanHtml: doc.body.innerHTML, links };
    }
  } catch (e) {
    console.error("Error extracting further reading:", e);
  }
  return { cleanHtml: html, links: [] };
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { post, loading: postLoading } = useBlogPostBySlug(slug);
  const { posts: dbPosts, loading: dbLoading } = useBlogPosts();
  
  const [scrollPct, setScrollPct] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const autoScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);


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

  const { cleanHtml } = useMemo(() => {
    if (!post) return { cleanHtml: "" };
    // Strip target="_blank" from all inline links so they open in the same tab
    const contentProcessed = post.content.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
      let cleanAttrs = attrs.replace(/\btarget\s*=\s*["'][^"']*["']/gi, "");
      return `<a${cleanAttrs}>`;
    });
    if (!isMounted) return { cleanHtml: contentProcessed };
    // Only strip the "Further Reading" section from the content body (no link extraction)
    const { cleanHtml: stripped } = extractFurtherReading(contentProcessed);
    
    // Auto-fix missing spaces after Q. and A. (e.g. "Q.How" -> "Q. How", "A.It" -> "A. It")
    const spacedQa = stripped.replace(/(<[^>]+>)|(\b[QA]\.(?=[A-Za-z0-9]))/g, (match, tag) => {
      if (tag) return tag;
      return match + " ";
    });

    return { cleanHtml: spacedQa };
  }, [post, isMounted]);

  // Only use admin-set related page links from the backend.
  // bodyLinks (auto-extracted from post content) are intentionally excluded
  // so the Related Pages section only appears when an admin explicitly adds links.
  const combinedLinks = useMemo(() => {
    if (!post) return [];
    const metaLinks = Array.isArray(post.related_page_links) ? post.related_page_links : [];
    const seen = new Set();
    return metaLinks.filter((l: any) => {
      const u = l.url?.trim().toLowerCase();
      if (!u || seen.has(u)) return false;
      seen.add(u);
      return true;
    });
  }, [post]);

  const matchedCards = useMemo(() => {
    return combinedLinks.map((link: any) => {
      const cleanUrl = link.url.trim().replace(/\/$/, "");
      const parts = cleanUrl.split("/");
      const linkSlug = parts[parts.length - 1];
      const matchedPost = dbPosts.find(p => p.slug === linkSlug);
      
      if (matchedPost) {
        return {
          url: blogHref(matchedPost.slug),
          title: matchedPost.title,
          image: matchedPost.hero_image,
          description: link.description || matchedPost.excerpt,
        };
      }
      return {
        url: link.url,
        title: link.label,
        image: null,
        description: link.description || "",
      };
    });
  }, [combinedLinks, dbPosts]);

  // JS auto-scroll: scrolls leftward initially (cards move left-to-right visually), reverses at ends, pauses on hover
  // Dependency [post] ensures it initializes correct scrollWidth once cards are loaded
  useEffect(() => {
    const slider = autoScrollRef.current;
    if (!slider) return;
    let paused = false;
    let direction = -1;
    
    // Set initial scroll position to the rightmost end on load
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    slider.scrollLeft = maxScroll;
    
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    slider.addEventListener("mouseenter", onEnter);
    slider.addEventListener("mouseleave", onLeave);
    const id = setInterval(() => {
      if (paused) return;
      const currentMax = slider.scrollWidth - slider.clientWidth;
      slider.scrollLeft += direction;
      if (slider.scrollLeft >= currentMax) { direction = -1; }
      if (slider.scrollLeft <= 0) { direction = 1; }
    }, 15);
    return () => {
      clearInterval(id);
      slider.removeEventListener("mouseenter", onEnter);
      slider.removeEventListener("mouseleave", onLeave);
    };
  }, [post]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?s=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!post && !postLoading) return <NotFound />;

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
  const canonical = (post.status === "published" && post.slug)
    ? `https://blog.theconverseai.com/${post.slug}`
    : "https://blog.theconverseai.com/";

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
          .wp-post {
            font-family: 'Inter', sans-serif;
            background: #fafafd;
            color: #1f2937;
            overflow-x: hidden;
            width: 100%;
            max-width: 100%;
          }

          /* Reading progress */
          .hfe-reading-progress-bar {
            position: fixed; top: 0; left: 0;
            height: 3px;
            background: linear-gradient(to right, #7c3aed, #a855f7);
            z-index: 9999;
            transition: width 0.1s ease;
          }

          /* Hero styling */
          .wp-post-hero {
            background: #fbf7fe;
            min-height: 500px;
            padding: 100px 24px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
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
            font-size: clamp(24px, 5vw, 52px);
            font-weight: 700;
            color: #a855f7;
            max-width: 900px;
            margin: 10px auto 0;
            line-height: 1.25;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }

          /* Main layout container with sidebar */
          .wp-post-body {
            max-width: 1140px;
            margin: 0 auto;
            padding: 48px 24px 80px;
            display: flex;
            gap: 40px;
            align-items: flex-start;
            width: 100%;
            box-sizing: border-box;
          }

          /* LEFT: Article content */
          .wp-post-area {
            flex: 1 1 0;
            min-width: 0;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }

          /* Content column */
          .wp-post-content-box {
            background: transparent;
            padding: 0;
            margin-bottom: 40px;
          }

          /* Hero image */
          .wp-post-hero-img {
            width: 100%;
            border-radius: 16px;
            display: block;
            margin-bottom: 24px;
            overflow: hidden;
            border: 1px solid #eae6f8;
            box-shadow: 0 4px 20px rgba(124, 58, 237, 0.04);
          }
          .wp-post-hero-img img { width: 100%; height: auto; display: block; }

          /* Content body typography with reduced white space */
          .wp-post-content { 
            font-size: 16.5px; 
            line-height: 1.75; 
            color: #4b5563; 
            font-family: "Inter", sans-serif;
            width: 100%;
            max-width: 100%;
            word-wrap: break-word;
            overflow-wrap: break-word;
            word-break: break-word;
          }
          .wp-post-content * {
            max-width: 100% !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
          }
          .wp-post-content h1 { font-size: 32px; font-weight: 800; color: #111827; margin: 24px 0 12px; line-height: 1.3; }
          .wp-post-content h2 { font-size: 24px; font-weight: 700; color: #111827; margin: 24px 0 12px; line-height: 1.3; }
          .wp-post-content h3 { font-size: 20px; font-weight: 700; color: #111827; margin: 20px 0 10px; }
          .wp-post-content h4 { font-size: 17px; font-weight: 700; color: #111827; margin: 16px 0 8px; }
          .wp-post-content h5 { font-size: 15px; font-weight: 700; color: #111827; margin: 14px 0 6px; }
          .wp-post-content h6 { font-size: 14px; font-weight: 700; color: #111827; margin: 12px 0 6px; }
          .wp-post-content p { margin: 0 0 12px; }
          .wp-post-content p:last-child { margin-bottom: 0; }
          .wp-post-content ul, .wp-post-content ol { padding-left: 20px; margin: 0 0 12px; }
          .wp-post-content li { margin-bottom: 4px; }
          .wp-post-content strong { color: #111827; font-weight: 700; }
          .wp-post-content em { font-style: italic; }
          
          /* Links */
          .wp-post-content a {
            color: inherit;
            font-weight: 700;
            text-decoration: none;
            transition: color 0.2s ease-in-out;
            display: inline;
          }
          .wp-post-content a:hover,
          .wp-post-content a:hover * {
            color: #7c3aed !important;
            text-decoration: none !important;
          }
          
          /* Custom styled blockquote */
          .wp-post-content blockquote {
            border-left: 4px solid #7c3aed;
            margin: 16px 0;
            padding: 12px 18px;
            background: #f7f5fa;
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: #4b5563;
            font-size: 16px;
          }
          .wp-post-content img {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            margin: 16px 0;
            display: block;
            object-fit: contain;
          }
          .wp-post-content table {
            display: block;
            width: 100%;
            overflow-x: auto;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 15px;
            -webkit-overflow-scrolling: touch;
          }
          .wp-post-content th, .wp-post-content td { border: 1px solid #e5e7eb; padding: 10px 14px; text-align: left; }
          .wp-post-content th { background: #f9fafb; font-weight: 700; color: #111827; }
          .wp-post-content tr:nth-child(even) td { background: #fafafa; }
          
          /* Code blocks */
          .wp-post-content pre {
            background: #1e1b4b;
            color: #e0e7ff;
            padding: 14px 18px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: monospace;
            font-size: 14px;
            margin: 16px 0;
            white-space: pre;
            max-width: 100%;
          }
          .wp-post-content code { background: #f3e8ff; color: #7c3aed; padding: 2px 6px; border-radius: 4px; font-size: 13.5px; }
          .wp-post-content pre code { background: transparent; color: inherit; padding: 0; border-radius: 0; font-size: inherit; }

          /* Task list checklist styles */
          .wp-post-content ul[data-type="taskList"] { list-style: none; padding-left: 0; }
          .wp-post-content li[data-type="taskItem"] { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
          .wp-post-content li[data-type="taskItem"] input[type="checkbox"] { margin-top: 5px; accent-color: #7C3AED; }
          .wp-post-content li[data-type="taskItem"] .task-content { flex: 1; }

          /* Callout Box (inserted via rich text editor) */
          .wp-post-content .rte-callout-box {
            border-left: 4px solid #7c3aed;
            background: #F8F5FF;
            padding: 14px 20px;
            border-radius: 0 10px 10px 0;
            margin: 24px 0;
            font-size: 15px;
            color: #374151;
            line-height: 1.7;
          }
          .wp-post-content .rte-callout-box p {
            margin: 0;
            color: inherit;
            font-size: inherit;
            line-height: inherit;
          }
          .wp-post-content .rte-callout-box p:not(:last-child) {
            margin-bottom: 8px;
          }
          .wp-post-content .rte-callout-box strong { font-style: italic; font-weight: 700; color: #1F2937; }

          /* CTA Box (inserted via rich text editor) */
          .wp-post-content .rte-cta-box {
            background: linear-gradient(135deg, #7c3aed, #d946ef);
            padding: 30px;
            border-radius: 24px;
            color: #fff !important;
            border: 2px solid #000;
            box-shadow: 0 15px 40px rgba(124, 58, 237, 0.25);
            margin: 28px 0;
          }
          .wp-post-content .rte-cta-box p,
          .wp-post-content .rte-cta-box strong {
            color: #fff !important;
          }
          .wp-post-content .rte-cta-box p {
            font-size: 15px;
            margin: 0 0 8px;
            line-height: 1.6;
          }
          .wp-post-content .rte-cta-box p:first-child {
            font-size: 17px;
            font-weight: 600;
            margin-bottom: 6px;
          }
          .wp-post-content .rte-cta-box p:last-child { margin-bottom: 0; }
          .wp-post-content .rte-cta-box a,
          .wp-post-content .rte-cta-box a strong {
            color: #fff !important;
            text-decoration: none !important;
            transition: all 0.3s ease;
            border-bottom: 2px solid transparent;
            font-weight: 700;
          }
          .wp-post-content .rte-cta-box a:hover,
          .wp-post-content .rte-cta-box a:hover * {
            color: #ffeb3b !important;
            border-bottom-color: #ffeb3b;
            text-shadow: none;
          }

          /* Related Reading (interlinking default block) */
          .wp-related-reading {
            background: #faf8ff;
            border-left: 4px solid #7c3aed;
            padding: 16px 20px;
            border-radius: 0 12px 12px 0;
            margin-bottom: 24px;
          }
          .wp-related-reading h4 { font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 10px; }
          .wp-related-reading ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
          .wp-related-reading li a { color: #7c3aed; font-weight: 700; font-size: 14.5px; text-decoration: none; }
          .wp-related-reading li a:hover { color: #7c3aed; text-decoration: none !important; }

          /* Related Pages headline */
          .wp-related-pages-title { font-size: 22px; font-weight: 800; color: #111827; margin: 40px 0 16px; text-align: left; }

          /* Related Pages auto-scroll container */
          .wp-related-pages-section {
            margin-top: 40px;
            margin-bottom: 40px;
            width: 100%;
          }
          .blog-cards-wrapper {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            overflow-y: hidden;
            padding: 10px 0 20px;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .blog-cards-wrapper::-webkit-scrollbar { display: none; }

          .blog-card {
            width: 420px;
            min-width: 420px;
            max-width: 420px;
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
            border-radius: 32px;
            background: #ffffff;
            border: 2px solid rgba(124,58,237,0.18);
            box-shadow: 0 10px 30px rgba(124,58,237,0.10), 0 20px 60px rgba(124,58,237,0.06);
            transition: all .35s ease;
          }
          .blog-card:hover {
            transform: translateY(-8px);
            border-color: rgba(124,58,237,0.35);
            box-shadow: 0 25px 60px rgba(124,58,237,0.18), 0 10px 25px rgba(124,58,237,0.10);
          }
          .blog-card img {
            width: 100%;
            height: auto;
            display: block;
            background: #fff;
            transition: .4s ease;
          }
          .blog-card:hover img { transform: scale(1.02); }
          .blog-card-gradient {
            width: 100%;
            height: 240px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #7c3aed 0%, #d946ef 100%);
          }
          .card-overlay {
            position: absolute;
            left: 0; right: 0; bottom: 0;
            padding: 24px;
            background: linear-gradient(to top, rgba(17,24,39,.96) 0%, rgba(17,24,39,.82) 40%, rgba(17,24,39,.35) 70%, transparent 100%);
          }
          .card-overlay h4 {
            margin: 0;
            color: #ffffff;
            font-size: 24px;
            font-weight: 500;
            line-height: 1.4;
            text-shadow: 0 2px 10px rgba(0,0,0,.4);
          }
          .card-description { display: none; }
          .read-more {
            margin-top: 18px;
            display: inline-flex;
            align-items: center;
            padding: 12px 22px;
            border-radius: 999px;
            background: linear-gradient(135deg, #6a32c9, #d946ef);
            color: #fff !important;
            text-decoration: none !important;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 8px 20px rgba(106,50,201,.35);
            transition: all .3s ease;
          }
          .read-more:hover {
            transform: translateX(5px);
            background: linear-gradient(135deg, #5827ad, #c026d3);
            color: #fff !important;
          }
          @media (max-width: 768px) {
            .blog-cards-wrapper { gap: 14px; padding: 10px 12px 20px; }
            .blog-card { width: 280px !important; min-width: 280px !important; max-width: 280px !important; border-radius: 20px !important; }
            .card-overlay { padding: 14px !important; }
            .card-overlay h4 { font-size: 15px !important; line-height: 1.35 !important; }
            .read-more { margin-top: 10px !important; padding: 8px 14px !important; font-size: 12px !important; }
          }
          @media (max-width: 480px) {
            .blog-card { width: 250px !important; min-width: 250px !important; max-width: 250px !important; }
            .card-overlay h4 { font-size: 14px !important; }
            .read-more { font-size: 11px !important; padding: 7px 12px !important; }
          }

          /* RIGHT: Sidebar */
          .wp-sidebar { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 24px; position: sticky; top: 90px; }
          
          /* Sidebar Card */
          .wp-sidebar-card {
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #eae6f8;
            box-shadow: 0 6px 20px rgba(124, 58, 237, 0.03);
            padding: 20px;
          }
          
          .wp-sidebar-section-label { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            font-size: 14.5px; 
            font-weight: 700; 
            color: #1f2937; 
            margin-bottom: 12px; 
          }
          .wp-sidebar-section-label svg { width: 15px; height: 15px; color: #7c3aed; stroke: #7c3aed; stroke-width: 2.5; fill: none; }
          .label-search-icon { fill: none; stroke: #7c3aed; stroke-width: 2.5; }

          /* Search Widget input */
          .wp-search-wrap { position: relative; }
          .wp-search-wrap input { 
            width: 100%; 
            padding: 8px 12px 8px 34px; 
            border: 1px solid #dcdfe6; 
            border-radius: 8px; 
            font-size: 13.5px; 
            color: #606266; 
            background: #ffffff;
            font-family: inherit; 
            outline: none; 
            transition: border-color 0.2s; 
          }
          .wp-search-wrap input:focus { border-color: #7c3aed; }
          .wp-search-icon { 
            position: absolute; 
            left: 10px; 
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

          /* Responsive Breakpoints */
          @media (max-width: 1024px) {
            .wp-post-body {
              flex-direction: column;
              gap: 36px;
              padding: 32px 20px;
            }
            .wp-sidebar {
              width: 100%;
              position: static;
            }
            /* Keep standard list style */
          }

          @media (max-width: 768px) {
            .wp-post-hero { min-height: 300px; padding: 48px 16px; }
            .wp-post-hero h1 { font-size: 28px !important; }
            .wp-post-content { font-size: 15.5px; }
            .wp-post-content h1 { font-size: 24px; }
            .wp-post-content h2 { font-size: 20px; }
            .wp-post-content h3 { font-size: 18px; }
            .blog-card { width: 260px; min-width: 260px; max-width: 260px; height: 250px; }
          }
        `}</style>
      </Helmet>

      <div className="hfe-reading-progress-bar" style={{ width: `${scrollPct}%` }} />

      <div className="wp-post">
        <section className="wp-post-hero">
          <div className="by-line">ConverseAI</div>
          <h1>{post.title}</h1>
        </section>

        <div className="wp-post-body">
          <main className="wp-post-area">
            <div className="wp-post-content-box">
              <div className="wp-post-hero-img">
                <img src={post.hero_image} alt={post.title} />
              </div>
              <div
                className="wp-post-content"
                dangerouslySetInnerHTML={{ __html: cleanHtml }}
              />
            </div>

            {matchedCards.length > 0 && (
              <section className="wp-related-pages-section">
                <h2 className="wp-related-pages-title">Related Pages:</h2>
                <div className="blog-cards-wrapper" ref={autoScrollRef}>
                  {matchedCards.map((card, i) => (
                    <div key={i} className="blog-card">
                      {card.image ? (
                        <img src={card.image} alt={card.title} loading="lazy" />
                      ) : (
                        <div className="blog-card-gradient">
                          <svg style={{ width: "40px", height: "40px", color: "rgba(255,255,255,0.7)" }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                          </svg>
                        </div>
                      )}
                      <div className="card-overlay">
                        <h4>{card.title}</h4>
                        <a href={card.url} className="read-more">
                          Explore Article →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="wp-sidebar">
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