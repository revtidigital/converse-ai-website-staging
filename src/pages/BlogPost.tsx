import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { useBlogPosts, useBlogPostBySlug } from "@/hooks/useBlogPosts";
import { blogHref, isBlogHost, absoluteImageUrl, cleanBlogImageUrl } from "@/lib/blogUrl";
import NotFound from "@/pages/NotFound";
import { toast } from "sonner";

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const scrollDirectionRef = useRef(-1);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const wasDraggedRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(spacedQa, "text/html");
      
      // Auto-set title for links if missing
      doc.querySelectorAll("a").forEach(a => {
        if (!a.getAttribute("title")) {
          const text = a.textContent?.trim();
          if (text) {
            a.setAttribute("title", text);
          }
        }
      });

      // Auto-set alt and title for images if missing
      doc.querySelectorAll("img").forEach(img => {
        if (!img.getAttribute("alt")) {
          img.setAttribute("alt", post.title || "Converse AI Blog Image");
        }
        if (!img.getAttribute("title")) {
          img.setAttribute("title", img.getAttribute("alt") || post.title || "Converse AI Blog Image");
        }
        const src = img.getAttribute("src");
        if (src) {
          img.setAttribute("src", cleanBlogImageUrl(src));
        }
      });

      return { cleanHtml: doc.body.innerHTML };
    } catch (e) {
      console.error("Error setting fallback SEO attributes:", e);
      return { cleanHtml: spacedQa };
    }
  }, [post, isMounted]);

  // Hover tooltip on links and images with title attribute
  useEffect(() => {
    if (!isMounted) return;

    const tooltip = document.createElement("div");
    tooltip.className = "wp-custom-tooltip";
    tooltip.style.position = "fixed";
    tooltip.style.padding = "8px 12px";
    tooltip.style.background = "rgba(15, 23, 42, 0.95)";
    tooltip.style.color = "#ffffff";
    tooltip.style.fontSize = "12px";
    tooltip.style.fontWeight = "600";
    tooltip.style.borderRadius = "8px";
    tooltip.style.pointerEvents = "none";
    tooltip.style.opacity = "0";
    tooltip.style.transition = "opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)";
    tooltip.style.transform = "translateY(6px) scale(0.95)";
    tooltip.style.zIndex = "999999";
    tooltip.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    tooltip.style.fontFamily = "Inter, sans-serif";
    tooltip.style.border = "1px solid rgba(255, 255, 255, 0.1)";
    document.body.appendChild(tooltip);

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[title]");
      if (target) {
        // Only show tooltip on links (A) and images (IMG)
        const tagName = target.tagName.toUpperCase();
        if (tagName !== "A" && tagName !== "IMG") {
          return;
        }

        // Only show tooltip if it is inside the blog post body (.wp-post-body)
        if (!target.closest(".wp-post-body")) {
          return;
        }

        const titleText = target.getAttribute("title");
        if (titleText && titleText.trim()) {
          target.setAttribute("data-title-backup", titleText);
          target.removeAttribute("title");
          
          tooltip.textContent = titleText;
          tooltip.style.opacity = "1";
          tooltip.style.transform = "translateY(0) scale(1)";
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      tooltip.style.left = `${e.clientX + 12}px`;
      tooltip.style.top = `${e.clientY + 18}px`;
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-title-backup]");
      if (target) {
        const titleText = target.getAttribute("data-title-backup");
        if (titleText) {
          target.setAttribute("title", titleText);
          target.removeAttribute("data-title-backup");
        }
      }
      tooltip.style.opacity = "0";
      tooltip.style.transform = "translateY(6px) scale(0.95)";
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseOut);
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    };
  }, [isMounted, cleanHtml]);


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
          image: cleanBlogImageUrl(matchedPost.hero_image),
          description: link.description || matchedPost.excerpt,
        };
      }
      
      // If it's a blog post URL but not found in published posts (i.e. draft), do NOT show it
      if (link.url.includes("blog.theconverseai.com") || link.url.includes("blog2.staging.theconverseai.com")) {
        return null;
      }
      
      return {
        url: link.url,
        title: link.label,
        image: null,
        description: link.description || "",
      };
    }).filter(Boolean) as any[];
  }, [combinedLinks, dbPosts]);

  // Duplicate cards for infinite loop effect when there are only 2 related pages
  const displayCards = useMemo(() => {
    if (!matchedCards || matchedCards.length === 0) return [];
    if (matchedCards.length === 2) {
      return [...matchedCards, ...matchedCards];
    }
    return matchedCards;
  }, [matchedCards]);

  const nextSlide = useCallback(() => {
    if (displayCards.length <= 1) return;
    const isDesktopMode = typeof window !== "undefined" ? window.innerWidth > 768 : true;
    const cardsPerView = isDesktopMode ? 2 : 1;
    const maxIndex = displayCards.length - cardsPerView;
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [displayCards.length]);

  const prevSlide = useCallback(() => {
    if (displayCards.length <= 1) return;
    const isDesktopMode = typeof window !== "undefined" ? window.innerWidth > 768 : true;
    const cardsPerView = isDesktopMode ? 2 : 1;
    const maxIndex = displayCards.length - cardsPerView;
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [displayCards.length]);

  const handleDragStart = (clientX: number) => {
    setDragStart(clientX);
    setIsDragging(true);
    wasDraggedRef.current = false;
  };

  const handleDragMove = (clientX: number) => {
    if (dragStart === null) return;
    const diff = clientX - dragStart;
    setDragOffset(diff);
    if (Math.abs(diff) > 10) {
      wasDraggedRef.current = true;
    }
  };

  const handleDragEnd = () => {
    if (dragStart === null) return;
    const finalOffset = dragOffset;
    
    setDragStart(null);
    setDragOffset(0);
    setIsDragging(false);

    if (finalOffset < -60) {
      nextSlide();
    } else if (finalOffset > 60) {
      prevSlide();
    }
    
    setTimeout(() => {
      wasDraggedRef.current = false;
    }, 50);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (wasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Initialize active index to 0
  useEffect(() => {
    if (displayCards.length > 0) {
      setActiveIndex(0);
    }
  }, [displayCards]);

  // Circular loop auto-scroll: transitions forward every 3 seconds, pauses on hover
  useEffect(() => {
    if (displayCards.length <= 1 || isHovered) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const isDesktopMode = typeof window !== "undefined" ? window.innerWidth > 768 : true;
        const cardsPerView = isDesktopMode ? 2 : 1;
        const maxIndex = displayCards.length - cardsPerView;
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [displayCards.length, isHovered]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const basePath = isBlogHost() ? "" : "/blog";
      navigate(`${basePath}?s=${encodeURIComponent(searchQuery.trim())}`);
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

  const isDesktop = isMounted ? (typeof window !== "undefined" ? window.innerWidth > 768 : true) : true;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={absoluteImageUrl(post.hero_image)} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={canonical} />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

           .wp-post * { box-sizing: border-box; }
          .wp-post {
            font-family: 'Inter', sans-serif;
            background: #fafafd;
            color: #1f2937;
            overflow: clip;
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
          .wp-post-hero .hero-label {
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
            font-size: clamp(28px, 6vw, 52px);
            font-weight: 700;
            color: #a855f7;
            max-width: 960px;
            margin: 10px auto 0;
            line-height: 1.2;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .wp-post-hero p {
            color: #6b7280;
            font-size: 16px;
            margin: 16px auto 0;
            max-width: 600px;
            line-height: 1.6;
          }

          /* Main layout container with sidebar */
          .wp-post-body {
            max-width: 1140px;
            margin: 0 auto;
            padding: 48px 24px 24px;
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
          .wp-post-content ul { list-style-type: disc !important; padding-left: 20px; margin: 0 0 12px; }
          .wp-post-content ol { list-style-type: decimal !important; padding-left: 20px; margin: 0 0 12px; }
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
          .wp-post-content .video-wrapper {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            max-width: 100%;
            margin: 20px 0;
            border-radius: 12px;
            background: #000;
          }
          .wp-post-content .video-wrapper iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 0;
            border-radius: 12px;
          }
          .wp-post-content .rte-video {
            max-width: 100%;
            width: 100%;
            border-radius: 12px;
            margin: 16px 0;
            display: block;
            background: #000;
          }
          .wp-post-content table {
            width: 100%;
            table-layout: fixed;
            border-collapse: separate;
            border-spacing: 0;
            margin: 24px 0;
            border: 1px solid #94a3b8;
            border-radius: 0px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
          }
          .wp-post-content th, .wp-post-content td {
            border-bottom: 1px solid #94a3b8;
            border-right: 1px solid #94a3b8;
            padding: 18px 20px;
            font-size: 14.5px;
            line-height: 1.5;
            text-align: center;
            vertical-align: middle;
            background: #ffffff;
            color: #4b5563;
            word-break: break-word;
            overflow-wrap: anywhere;
          }
          .wp-post-content th:last-child, .wp-post-content td:last-child {
            border-right: none;
          }
          .wp-post-content tr:last-child th, .wp-post-content tr:last-child td {
            border-bottom: none;
          }
          .wp-post-content th {
            background: #ffffff;
            font-weight: 700;
            color: #1f2937;
          }
          .wp-post-content th:first-child, .wp-post-content td:first-child {
            text-align: left;
            font-weight: 700;
            color: #1f2937;
          }
          @media (max-width: 768px) {
            .wp-post-content table {
              display: block;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
            }
          }
          
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
          .wp-related-pages-title { font-size: 22px; font-weight: 800; color: #111827; margin: 12px 0 16px; text-align: left; }

          /* Related Pages auto-scroll container */
          .wp-related-pages-section {
            margin-top: 0px;
            margin-bottom: 40px;
            width: 100%;
          }
          /* Related Pages Carousel Redesign */
          .carousel-container-outer {
            position: relative;
            width: 100%;
            max-width: 100%;
            background: transparent; /* Transparent background as requested */
            border: none;
            box-shadow: none;
            margin-top: 40px;
            margin-bottom: 40px;
            padding: 0;
            --slide-width: calc(50% + 12px);
            --card-width: calc(50% - 12px);
          }

          /* Slider Viewport (Clipped Area) */
          .carousel-slider-viewport {
            overflow: hidden;
            width: 100%;
            position: relative;
            z-index: 2;
          }

          /* Track container holding slides */
          .carousel-track {
            display: flex;
            gap: 24px;
            width: 100%;
            transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
            will-change: transform;
            user-select: none;
            -webkit-user-select: none;
          }

          /* Individual slides (no border-radius) */
          .carousel-slide {
            position: relative;
            flex: 0 0 var(--card-width);
            width: var(--card-width);
            height: 280px; /* Enhanced, taller height for details */
            background: #111827;
            overflow: hidden;
            cursor: pointer;
            border-radius: 0px !important; /* Do not give border radius */
            border: none;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          }

          .carousel-slide-link {
            display: block;
            width: 100%;
            height: 100%;
            text-decoration: none !important;
          }

          /* Slide image */
          .carousel-slide-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.4s ease;
          }

          .carousel-slide:hover .carousel-slide-img {
            transform: scale(1.05);
          }

          /* Fallback gradient */
          .carousel-slide-gradient {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #7c3aed 0%, #d946ef 100%);
          }

          /* Overlay details matching 2nd picture (no border-radius) */
          .carousel-slide-overlay {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            padding: 24px;
            background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.35) 60%, transparent 100%);
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: flex-start;
            height: 100%;
            transition: background 0.3s ease;
          }

          .carousel-slide:hover .carousel-slide-overlay {
            background: linear-gradient(to top, rgba(124, 58, 237, 0.9) 0%, rgba(15, 23, 42, 0.45) 70%, transparent 100%);
          }

          /* Bold left-aligned title */
          .carousel-slide-title {
            color: #ffffff;
            font-size: 17px;
            font-weight: 700;
            line-height: 1.4;
            text-align: left;
            margin: 0 0 16px 0;
            max-width: 100%;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: normal;
          }

          /* Sharp, modern button matching 2nd picture (no border-radius) */
          .carousel-slide-btn {
            background: #a855f7; /* Eye-catching purple */
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            padding: 10px 20px;
            border: none;
            border-radius: 0px !important; /* No border-radius */
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .carousel-slide:hover .carousel-slide-btn {
            background: #7c3aed; /* Darker purple on hover */
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
          }

          /* Floating circular navigation buttons */
          .carousel-nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 44px;
            height: 44px;
            background: #7c3aed; /* ConverseAI Brand Purple */
            color: #ffffff;
            border: none;
            border-radius: 50% !important; /* Circle shape as requested */
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            z-index: 10;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
            padding: 0;
          }

          .carousel-nav-btn:hover {
            background: #6d28d9;
            transform: translateY(-50%) scale(1.05);
          }

          .carousel-nav-btn.left {
            left: -22px;
          }

          .carousel-nav-btn.right {
            right: -22px;
          }

          .carousel-nav-btn svg {
            width: 20px;
            height: 20px;
            display: block;
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .carousel-container-outer {
              margin-top: 30px;
              margin-bottom: 30px;
              --slide-width: calc(100% + 24px);
              --card-width: 100%;
            }
            .carousel-slide {
              height: 230px;
            }
            .carousel-nav-btn {
              width: 38px;
              height: 38px;
            }
            .carousel-nav-btn.left {
              left: -10px;
            }
            .carousel-nav-btn.right {
              right: -10px;
            }
            .carousel-slide-title {
              font-size: 15px;
              margin-bottom: 12px;
            }
            .carousel-slide-btn {
              padding: 8px 16px;
              font-size: 12px;
            }
          }

          /* RIGHT: Sidebar */
          .wp-sidebar { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 24px; position: sticky; top: 110px; }
          
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
              .wp-post-hero { min-height: 360px; padding: 60px 20px; }
              .wp-post-hero h1 { font-size: clamp(24px, 5vw, 36px) !important; }
              .wp-post-hero p { font-size: 14px; margin-top: 12px; }
              .wp-post-content { font-size: 15.5px; }
              .wp-post-content h1 { font-size: 24px; }
              .wp-post-content h2 { font-size: 20px; }
              .wp-post-content h3 { font-size: 18px; }
            }
        `}</style>
      </Helmet>

      <div className="hfe-reading-progress-bar" style={{ width: `${scrollPct}%` }} />

      <div className="wp-post">
        <section className="wp-post-hero">
          <span className="hero-label">ConverseAI</span>
          <h1>{post.title}</h1>
        </section>

        <div className="wp-post-body">
          <main className="wp-post-area">
            <div className="wp-post-content-box">
              <div className="wp-post-hero-img">
                <img 
                  src={post.hero_image} 
                  alt={post.hero_image_alt || post.title} 
                  title={post.hero_image_title || post.hero_image_alt || post.title} 
                />
              </div>
              <div
                className="wp-post-content"
                dangerouslySetInnerHTML={{ __html: cleanHtml }}
              />

              {/* FAQ Section (rendered at the bottom if faq_placement is 'last') */}
              {post.faqs && post.faqs.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-150 wp-post-content text-left">
                  <h2 className="font-bold text-gray-900" style={{ fontSize: "24px", color: "#111827", margin: "24px 0 12px", lineHeight: "1.3", fontWeight: 700 }}>Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    {post.faqs.map((faq, idx) => (
                      <div key={idx} className="space-y-2">
                        <h3 
                          className="font-bold text-gray-900 flex gap-1"
                          style={{
                            fontSize: "16.5px",
                            lineHeight: "1.75",
                            color: "#1f2937",
                            fontWeight: 700
                          }}
                        >
                          <span>Q:&nbsp;</span>
                          <span dangerouslySetInnerHTML={{ __html: faq.question }} />
                        </h3>
                        <div 
                          className="text-gray-650 leading-relaxed font-normal"
                          style={{
                            fontSize: "16.5px",
                            lineHeight: "1.75",
                            color: "#4b5563"
                          }}
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            {/*
            // Author Biography Card (uncomment when enabling Author functionality on frontend)
            {post.author && (
              <div className="mt-12 p-6 rounded-2xl bg-white border border-gray-150 shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start text-left">
                {post.author.avatar_url && (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-violet-100 flex-shrink-0"
                  />
                )}
                <div className="flex-grow space-y-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg leading-snug">{post.author.name}</h4>
                    {post.author.designation && (
                      <p className="text-sm font-semibold text-violet-600">{post.author.designation}</p>
                    )}
                  </div>
                  {post.author.bio && (
                    <p className="text-gray-650 text-sm leading-relaxed">{post.author.bio}</p>
                  )}
                </div>
              </div>
            )}
            */}
            </div>
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

        {/* Render Related Pages at the bottom of the page layout, below the post body and sidebar */}
        {matchedCards.length > 0 && (
          <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "0 24px 60px", width: "100%", boxSizing: "border-box" }}>
            <section className="wp-related-pages-section" style={{ width: "100%", margin: 0 }}>
              <h2 className="wp-related-pages-title">Related Pages:</h2>
              
              <div 
                className="carousel-container-outer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Floating Navigation Buttons (square corners, no border radius) */}
                {matchedCards.length > (isDesktop ? 2 : 1) && (
                  <>
                    <button 
                      type="button" 
                      className="carousel-nav-btn left" 
                      onClick={(e) => {
                        e.stopPropagation();
                        prevSlide();
                      }}
                      aria-label="Previous Page"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      className="carousel-nav-btn right" 
                      onClick={(e) => {
                        e.stopPropagation();
                        nextSlide();
                      }}
                      aria-label="Next Page"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </>
                )}

                {/* Slider viewport */}
                <div 
                  className="carousel-slider-viewport"
                  onMouseDown={(e) => handleDragStart(e.clientX)}
                  onMouseMove={(e) => handleDragMove(e.clientX)}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                  onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                  onTouchEnd={handleDragEnd}
                  style={{ cursor: isDragging ? "grabbing" : "grab" }}
                >
                  <div 
                    className="carousel-track"
                    style={{
                      transform: `translateX(calc(-${activeIndex} * var(--slide-width) + ${dragOffset}px))`,
                      transition: isDragging ? "none" : "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)"
                    }}
                  >
                    {displayCards.map((card, i) => (
                      <div 
                        key={i} 
                        className="carousel-slide"
                      >
                        <a href={card.url} className="carousel-slide-link" onClick={handleLinkClick}>
                          {card.image ? (
                            <img src={card.image} alt={card.title} className="carousel-slide-img" loading="lazy" draggable="false" />
                          ) : (
                            <div className="carousel-slide-gradient">
                              <svg style={{ width: "40px", height: "40px", color: "rgba(255,255,255,0.7)" }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                              </svg>
                            </div>
                          )}
                          <div className="carousel-slide-overlay">
                            <h3 className="carousel-slide-title">{card.title}</h3>
                            <span className="carousel-slide-btn">
                              Explore Article &rarr;
                            </span>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;