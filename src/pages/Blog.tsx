// import { useState } from "react";
// import { Helmet } from "react-helmet-async";
// import { Link } from "react-router-dom";
// import { Search, MessageSquare, Calendar, ArrowRight } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import Footer from "@/components/Footer";
// import AnimatedSection from "@/components/AnimatedSection";
// import { cn } from "@/lib/utils";

// const blogPosts = [
//   {
//     id: 1,
//     title: "New UPI Rules Are Here (August 1st): Why Your Bank's Best Response is a Chatbot",
//     excerpt: "Discover how the latest UPI regulations impact banking and why AI-powered chatbots are the perfect solution for seamless customer communication and compliance.",
//     date: "January 28, 2025",
//     image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop",
//     slug: "new-upi-rules-chatbot-response",
//     comments: 0,
//   },
//   {
//     id: 2,
//     title: "How To Use E-commerce Chatbot to Recover Abandoned Carts",
//     excerpt: "Learn proven strategies to recover lost sales using intelligent chatbots that engage customers at the right moment and guide them back to complete their purchase.",
//     date: "January 25, 2025",
//     image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
//     slug: "ecommerce-chatbot-abandoned-carts",
//     comments: 0,
//   },
//   {
//     id: 3,
//     title: "Your Ultimate Guide to WhatsApp Business in 2025",
//     excerpt: "Everything you need to know about leveraging WhatsApp Business API for customer engagement, marketing automation, and sales growth in the new year.",
//     date: "January 20, 2025",
//     image: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=600&h=400&fit=crop",
//     slug: "whatsapp-business-guide-2025",
//     comments: 0,
//   },
//   {
//     id: 4,
//     title: "NVIDIA AI Diplomacy Signals a New Era for Business Innovation",
//     excerpt: "Explore how NVIDIA's latest AI developments are reshaping business landscapes and what it means for companies looking to stay ahead in the AI revolution.",
//     date: "January 15, 2025",
//     image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
//     slug: "nvidia-ai-business-innovation",
//     comments: 0,
//   },
//   {
//     id: 5,
//     title: "How To Add Chatbot On Your Website Free",
//     excerpt: "A step-by-step guide to implementing a powerful AI chatbot on your website without breaking the bank. Get started with conversational AI today.",
//     date: "January 10, 2025",
//     image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600&h=400&fit=crop",
//     slug: "add-chatbot-website-free",
//     comments: 0,
//   },
//   {
//     id: 6,
//     title: "Air India's Response to AI171: Why Crisis-Ready Chatbots Matter",
//     excerpt: "Analyzing how crisis communication can be transformed with AI chatbots and why every business needs a robust customer communication strategy.",
//     date: "January 5, 2025",
//     image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop",
//     slug: "air-india-crisis-chatbots",
//     comments: 0,
//   },
// ];

// const Blog = () => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const postsPerPage = 6;
//   const totalPages = Math.ceil(blogPosts.length / postsPerPage);

//   const filteredPosts = blogPosts.filter(
//     (post) =>
//       post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <>
//       <Helmet>
//         <title>Blog | AI Chatbot & Customer Engagement Insights | ConverseAI</title>
//         <meta name="description" content="Explore insights on AI chatbots, WhatsApp Business, and customer engagement strategies from ConverseAI experts. Stay ahead with the latest tips." />
//         <meta name="robots" content="index, follow" />
//         <meta property="og:title" content="Blog | AI Chatbot & Customer Engagement | ConverseAI" />
//         <meta property="og:description" content="Explore insights on AI chatbots, WhatsApp Business, and customer engagement strategies from ConverseAI experts." />
//         <link rel="canonical" href="https://www.theconverseai.com/blog" />
//       </Helmet>

//       <div className="min-h-screen bg-background pt-16 md:pt-20">
//         <main id="main-content">
//           {/* Hero Section */}
//           <AnimatedSection>
//             <section 
//               className="relative overflow-hidden py-16 md:py-24"
//               style={{ background: "var(--gradient-hero)" }}
//             >
//               {/* Decorative elements */}
//               <div className="absolute inset-0 overflow-hidden">
//                 <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
//                 <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
//               </div>

//               <div className="container-tight relative z-10 text-center">
//                 <Badge 
//                   variant="secondary" 
//                   className="mb-4 px-4 py-1.5 text-sm font-medium"
//                 >
//                   ConverseAI
//                 </Badge>
//                 <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 gradient-text">
//                   Blog List
//                 </h1>
//                 <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
//                   Insights, guides, and strategies for AI-powered customer engagement
//                 </p>
//               </div>
//             </section>
//           </AnimatedSection>

//           {/* Main Content */}
//           <section className="section-padding">
//             <div className="container-tight">
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
//                 {/* Blog Posts Column */}
//                 <div className="lg:col-span-2 space-y-8">
//                   <AnimatedSection delay={0.1}>
//                     {filteredPosts.length > 0 ? (
//                       <div className="space-y-8">
//                         {filteredPosts.map((post, index) => (
//                           <AnimatedSection key={post.id} delay={0.1 * (index + 1)}>
//                             <article>
//                               <Card className="glass-card-hover overflow-hidden group">
//                                 <div className="md:flex">
//                                   {/* Image */}
//                                   <div className="md:w-2/5 relative overflow-hidden">
//                                     <img
//                                       src={post.image}
//                                       alt={post.title}
//                                       className="w-full h-48 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
//                                       loading="lazy"
//                                     />
//                                     <Badge 
//                                       className="absolute top-4 left-4 bg-primary text-primary-foreground shadow-lg"
//                                     >
//                                       <Calendar className="w-3 h-3 mr-1" />
//                                       {post.date}
//                                     </Badge>
//                                   </div>

//                                   {/* Content */}
//                                   <CardContent className="md:w-3/5 p-6 flex flex-col justify-between">
//                                     <div>
//                                       <h2 className="text-xl md:text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
//                                         {post.title}
//                                       </h2>
//                                       <p className="text-muted-foreground mb-4 line-clamp-3">
//                                         {post.excerpt}
//                                       </p>
//                                     </div>

//                                     <div className="flex items-center justify-between">
//                                       <Link
//                                         to={`/blog/${post.slug}`}
//                                         className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all group/link"
//                                       >
//                                         Read More
//                                         <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
//                                       </Link>
//                                       <span className="text-sm text-muted-foreground flex items-center gap-1">
//                                         <MessageSquare className="w-4 h-4" />
//                                         {post.comments === 0 ? "No comments" : `${post.comments} comments`}
//                                       </span>
//                                     </div>
//                                   </CardContent>
//                                 </div>
//                               </Card>
//                             </article>
//                           </AnimatedSection>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="text-center py-12">
//                         <p className="text-muted-foreground">No posts found matching your search.</p>
//                       </div>
//                     )}
//                   </AnimatedSection>

//                   {/* Pagination */}
//                   {totalPages > 1 && (
//                     <AnimatedSection delay={0.5}>
//                       <nav 
//                         className="flex justify-center items-center gap-2 pt-8"
//                         aria-label="Blog pagination"
//                       >
//                         {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                           <button
//                             key={page}
//                             onClick={() => setCurrentPage(page)}
//                             className={cn(
//                               "w-10 h-10 rounded-full font-medium transition-all duration-300",
//                               currentPage === page
//                                 ? "bg-primary text-primary-foreground shadow-glow"
//                                 : "bg-secondary text-secondary-foreground hover:bg-primary/20"
//                             )}
//                             aria-label={`Go to page ${page}`}
//                             aria-current={currentPage === page ? "page" : undefined}
//                           >
//                             {page}
//                           </button>
//                         ))}
//                       </nav>
//                     </AnimatedSection>
//                   )}
//                 </div>

//                 {/* Sidebar */}
//                 <aside className="lg:col-span-1">
//                   <div className="sticky top-24 space-y-6">
//                     {/* Search */}
//                     <AnimatedSection delay={0.2}>
//                       <Card className="glass-card">
//                         <CardContent className="p-6">
//                           <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
//                             <Search className="w-5 h-5 text-primary" />
//                             Search
//                           </h3>
//                           <div className="relative">
//                             <Input
//                               type="search"
//                               placeholder="Search articles..."
//                               value={searchQuery}
//                               onChange={(e) => setSearchQuery(e.target.value)}
//                               className="pr-10"
//                               aria-label="Search blog posts"
//                             />
//                             <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//                           </div>
//                         </CardContent>
//                       </Card>
//                     </AnimatedSection>

//                     {/* Recent Posts */}
//                     <AnimatedSection delay={0.3}>
//                       <Card className="glass-card">
//                         <CardContent className="p-6">
//                           <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
//                             <span className="text-primary">📄</span>
//                             Recent Posts
//                           </h3>
//                           <ul className="space-y-4">
//                             {blogPosts.slice(0, 5).map((post) => (
//                               <li key={post.id}>
//                                 <Link
//                                   to={`/blog/${post.slug}`}
//                                   className="text-sm text-muted-foreground hover:text-primary transition-colors line-clamp-2 block"
//                                 >
//                                   {post.title}
//                                 </Link>
//                               </li>
//                             ))}
//                           </ul>
//                         </CardContent>
//                       </Card>
//                     </AnimatedSection>

//                     {/* Recent Comments */}
//                     <AnimatedSection delay={0.4}>
//                       <Card className="glass-card">
//                         <CardContent className="p-6">
//                           <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
//                             <MessageSquare className="w-5 h-5 text-primary" />
//                             Recent Comments
//                           </h3>
//                           <p className="text-sm text-muted-foreground italic">
//                             No comments yet. Be the first to share your thoughts!
//                           </p>
//                         </CardContent>
//                       </Card>
//                     </AnimatedSection>
//                   </div>
//                 </aside>
//               </div>
//             </div>
//           </section>
//         </main>
//         <Footer />
//       </div>
//     </>
//   );
// };

// export default Blog;

import { useEffect } from "react";

const Blog = () => {
  useEffect(() => {
    window.location.href = "https://blog.theconverseai.com";
  }, []);

  return null;
};

export default Blog;