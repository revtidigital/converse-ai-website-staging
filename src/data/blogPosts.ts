export interface BlogPostAuthor {
  name: string;
  role: string;
  avatar: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  image: string;
  author: BlogPostAuthor;
  commentsCount: number;
}

export const CATEGORIES = [
  { label: "AI Chatbots", count: 12 },
  { label: "Automation", count: 9 },
  { label: "Voice AI", count: 6 },
  { label: "Marketing", count: 4 },
];

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "New UPI Rules Are Here (August 1st): Why Your Bank's Best Response is a Chatbot",
    slug: "new-upi-rules-chatbot-response",
    category: "AI Chatbots",
    excerpt:
      "Discover how the latest UPI regulations impact banking and why AI-powered chatbots are the perfect solution for seamless customer communication and compliance.",
    date: "Jan 28, 2025",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    author: {
      name: "Arjun Mehta",
      role: "Head of Fintech Solutions",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces&q=80",
    },
    commentsCount: 12,
    content: `<p>The Unified Payments Interface (UPI) has transformed how India transacts, but with massive scale comes the need for tighter regulation. Starting August 1st, a series of new UPI guidelines come into effect, focusing on transaction limits, real-time dispute logging, and enhanced verification for high-value transfers.</p>

<h2>What are the Key UPI Rule Changes?</h2>
<p>The latest regulatory updates introduce several key shifts that banks and payment service providers (PSPs) must adapt to immediately:</p>
<ul>
  <li><strong>Enhanced Authentication:</strong> Multi-factor checks for transactions exceeding ₹2,000 to prevent fraud.</li>
  <li><strong>Real-time Status Updates:</strong> Banks must provide instantaneous transaction failure reasons rather than generic error codes.</li>
  <li><strong>Instant Dispute Resolution:</strong> Customers must have direct, visible channels to log UPI disputes with 48-hour resolution windows.</li>
</ul>

<h2>Why Traditional Support Channels Will Fail</h2>
<p>As these rules take effect, bank customer support centers will experience a surge in queries. If your response relies on legacy phone support or email queues, your customer satisfaction scores (CSAT) will plummet, and regulatory compliance will suffer. Customers expect immediate answers when money is involved.</p>

<blockquote>"In the era of instant payments, support cannot remain asynchronous. If a transaction fails, the explanation and resolution must be instantaneous."</blockquote>

<h2>The Solution: AI-Powered UPI Chatbots</h2>
<p>Implementing an intelligent conversational agent directly inside your mobile banking app or WhatsApp channel is the single most effective strategy to manage this regulatory transition. Here's why:</p>
<ul>
  <li><strong>Instant Failure Explanations:</strong> The chatbot can pull real-time API logs to explain exactly why a payment failed in natural language.</li>
  <li><strong>Seamless Dispute Creation:</strong> Instead of filling out complex forms, users can log a dispute conversationally. The chatbot automatically fetches transaction details and opens a ticket.</li>
  <li><strong>24/7 Availability:</strong> UPI transactions run around the clock. AI bots resolve up to 80% of common queries without human agent intervention.</li>
</ul>

<p>By deploying ConverseAI's custom banking workforce agents, financial institutions can maintain flawless compliance with the August 1st guidelines while boosting customer trust and reducing operational support costs by up to 60%.</p>`,
  },
  {
    id: 2,
    title: "How To Use E-commerce Chatbots to Recover Abandoned Carts",
    slug: "ecommerce-chatbot-abandoned-carts",
    category: "Automation",
    excerpt:
      "Learn proven strategies to recover lost sales using intelligent chatbots that engage customers at the right moment and guide them back to complete their purchase.",
    date: "Jan 25, 2025",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80",
    author: {
      name: "Sarah Jenkins",
      role: "E-commerce Growth Specialist",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80",
    },
    commentsCount: 9,
    content: `<p>Cart abandonment is the silent killer of online retail. Current benchmarks show that nearly 70% of digital shopping carts are left behind before the purchase is completed. While email retargeting has been the standard recovery tool for years, open rates have hovered around a dismal 15–20%. Enter conversational commerce.</p>

<h2>The Asynchronous Recovery Gap</h2>
<p>Email retargeting suffers from a latency issue. By the time a user receives an abandoned cart email, their buying intent has cooled down. Chatbots — particularly on WhatsApp — engage customers in real-time via channels with up to 98% open rates.</p>

<h2>3 Chatbot Strategies to Drive Recovery</h2>
<ol>
  <li><strong>Instant Exit-Intent Prompts:</strong> Trigger a helpful chatbot pop-up: <em>"Need any help completing your purchase? Here is a 5% discount code valid for the next 15 minutes."</em></li>
  <li><strong>WhatsApp Abandonment Reminders:</strong> Send a gentle reminder 30 minutes after checkout inactivity. WhatsApp messages feel conversational rather than spammy.</li>
  <li><strong>Handling Product Friction:</strong> Frequently, users abandon carts because of unresolved questions about shipping, returns, or sizes. An AI chatbot can immediately answer these.</li>
</ol>

<h2>Measuring the ROI</h2>
<p>Brands using ConverseAI's specialized e-commerce recovery flows have seen cart recovery rates jump from an average of 4% (with email alone) to over 22%. Combined with automatic discount code injections and natural language product recommendations, chatbots transform lost traffic into loyal repeat buyers.</p>`,
  },
  {
    id: 3,
    title: "Your Ultimate Guide to WhatsApp Business in 2025",
    slug: "whatsapp-business-guide-2025",
    category: "Voice AI",
    excerpt:
      "Everything you need to know about leveraging WhatsApp Business API for customer engagement, marketing automation, and sales growth in the new year.",
    date: "Jan 20, 2025",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800&auto=format&fit=crop&q=80",
    author: {
      name: "David Chen",
      role: "VP of Product Strategy",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80",
    },
    commentsCount: 6,
    content: `<p>With over 2 billion active monthly users, WhatsApp is no longer just a personal messaging app — it has evolved into the most critical customer experience surface for global businesses. In 2025, WhatsApp's business guidelines have changed, introducing powerful new features for interactive catalogs, AI-native routing, and payment integrations.</p>

<h2>Key WhatsApp API Upgrades in 2025</h2>
<ul>
  <li><strong>In-App Checkout:</strong> Customers can browse products, add items to a cart, and complete payments directly inside the chat window.</li>
  <li><strong>Flows &amp; Forms:</strong> Businesses can design rich, interactive UI forms inside WhatsApp for bookings, sign-ups, and feedback surveys.</li>
  <li><strong>AI Agent Delegation:</strong> Enhanced protocols allow smooth, context-aware handoffs between third-party LLM agents and human support representatives.</li>
</ul>

<h2>Crafting a WhatsApp Conversational Funnel</h2>
<p>To succeed with WhatsApp Business in 2025, you must move beyond broadcast lists and focus on building high-value utilities. Drive traffic using "Click-to-WhatsApp" ads, nurture interest by providing personalized product curation, and close the loop using instant booking or in-chat payment links.</p>

<p>ConverseAI provides a comprehensive interface to build, monitor, and scale WhatsApp conversations, ensuring compliance with Meta's template guidelines while maximizing user engagement.</p>`,
  },
  {
    id: 4,
    title: "NVIDIA AI Diplomacy Signals a New Era for Business Innovation",
    slug: "nvidia-ai-business-innovation",
    category: "AI Chatbots",
    excerpt:
      "Explore how NVIDIA's latest AI developments are reshaping business landscapes and what it means for companies looking to stay ahead in the AI revolution.",
    date: "Jan 15, 2025",
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80",
    author: {
      name: "Elena Rostova",
      role: "Lead AI Researcher",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80",
    },
    commentsCount: 4,
    content: `<p>AI has transcended technology labs to become a focal point of global geopolitics and corporate boardrooms. NVIDIA's recent diplomatic efforts and partnerships with sovereign nations highlight a major shift: AI capacity is now national infrastructure, and businesses must treat AI integration as a strategic survival requirement.</p>

<h2>What is Sovereign AI?</h2>
<p>Sovereign AI refers to a country's capability to produce artificial intelligence using its own infrastructure, data, networks, and cultural wealth. NVIDIA is powering this movement by building localized data centers worldwide, enabling customized language models tuned for local languages and regulatory frameworks.</p>

<h2>The Impact on Corporate Strategy</h2>
<ul>
  <li><strong>Localized AI Models:</strong> Organizations will no longer rely solely on generic US-centric LLM providers. Specialized, highly localized models will provide better regional compliance and customer understanding.</li>
  <li><strong>Hardware Efficiency:</strong> Tech stacks must be designed to compile and run on multi-provider hardware environments as GPU availability remains a bottleneck.</li>
</ul>

<p>At ConverseAI, our infrastructure is LLM-agnostic, meaning our agentic systems can be powered by local, secure, and sovereign LLMs — guaranteeing that your business data remains private, compliant, and optimized for your specific region.</p>`,
  },
  {
    id: 5,
    title: "How To Add a Chatbot On Your Website For Free",
    slug: "add-chatbot-website-free",
    category: "Automation",
    excerpt:
      "A step-by-step guide to implementing a powerful AI chatbot on your website without breaking the bank. Get started with conversational AI today.",
    date: "Jan 10, 2025",
    readTime: "4 min read",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    author: {
      name: "Marcus Aurelius",
      role: "Customer Experience Analyst",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&q=80",
    },
    commentsCount: 15,
    content: `<p>Adding an AI chatbot to your site doesn't require a six-figure budget or a team of specialized engineers. In fact, you can have a responsive, helpful customer support agent running on your website in less than 15 minutes, absolutely free.</p>

<h2>Step 1: Choose Your Platform</h2>
<p>Select a platform that provides a generous free tier with essential features — including a custom widget, basic response configuration, and integration with your website's CMS (such as WordPress, Webflow, or custom React code).</p>

<h2>Step 2: Define the Knowledge Base</h2>
<p>Even the smartest AI needs training. Upload your FAQ documents, product descriptions, and shipping policies. Modern chatbots can read these documents directly, compiling their responses on the fly using retrieval-augmented generation (RAG) to prevent hallucinated answers.</p>

<h2>Step 3: Embed the Widget</h2>
<p>Once configured, the platform will generate a small snippet of JavaScript code. Simply copy this script and paste it before the closing <code>&lt;/body&gt;</code> tag of your website. If you are using React, you can import this widget as a component or load it asynchronously during client initialization.</p>

<p>ConverseAI offers a robust starter tier that lets you build, test, and deploy a customer chatbot for free — allowing you to experience the immediate impact of AI automation on your response times first-hand.</p>`,
  },
  {
    id: 6,
    title: "Air India's Response to AI171: Why Crisis-Ready Chatbots Matter",
    slug: "air-india-crisis-chatbots",
    category: "Marketing",
    excerpt:
      "Analyzing how crisis communication can be transformed with AI chatbots and why every business needs a robust customer communication strategy.",
    date: "Jan 05, 2025",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    author: {
      name: "Vikram Malhotra",
      role: "Operations & Communications Director",
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces&q=80",
    },
    commentsCount: 3,
    content: `<p>When flight operations face disruptions, airlines are instantly flooded with thousands of urgent customer inquiries. During a crisis, call centers become bottlenecks, wait times skyrocket, and customer frustration mounts on social media. A crisis-ready communication strategy is essential.</p>

<h2>Scaling Support During Spikes</h2>
<p>The core challenge of crisis support is that traffic grows exponentially, while human staffing can only grow linearly. An AI chatbot acts as an elastic buffer, capable of handling 10,000 conversations simultaneously without delays — ensuring passengers receive immediate rebooking links, flight statuses, and refund information.</p>

<h2>Key Features of a Crisis Bot</h2>
<ul>
  <li><strong>Instant Alerts Banner:</strong> Highlighting critical updates directly in the chat window.</li>
  <li><strong>Dynamic Re-routing:</strong> Automatically connecting users to the rebooking flow if their flight is cancelled.</li>
  <li><strong>Human-in-the-Loop Backup:</strong> Instant escalations to human support for complex edge cases, carrying over the entire chat history.</li>
</ul>

<p>Deploying crisis-ready AI agents enables organizations to maintain passenger trust under extreme conditions, proving that automated conversational systems are a vital component of modern crisis management and corporate resilience.</p>`,
  },
];
