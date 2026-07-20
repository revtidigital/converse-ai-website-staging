// import { Helmet } from "react-helmet-async";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import Footer from "@/components/Footer";
// import AnimatedSection from "@/components/AnimatedSection";
// import { Smile, Star, Download, Calendar, TrendingUp, Heart, MessageCircle, ThumbsUp } from "lucide-react";

// const CSATReport = () => {
//   return (
//     <>
//       <Helmet>
//         <title>CSAT Reports & Customer Satisfaction Analytics | ConverseAI</title>
//         <meta 
//           name="description" 
//           content="Measure and improve customer satisfaction with ConverseAI CSAT Reports. Automate surveys and analyze feedback easily." 
//         />
//         <meta name="robots" content="index, follow" />
//         <link rel="canonical" href="https://converseai.com/csat-report" />
//       </Helmet>

//       <main className="min-h-screen bg-background pt-16 md:pt-20">
//         {/* Hero Section */}
//         <section className="relative pt-32 pb-20 overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-primary/5 to-violet-500/10" />
//           <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
//           <div className="absolute bottom-10 right-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
          
//           <div className="container-tight relative z-10">
//             <AnimatedSection className="text-center max-w-4xl mx-auto">
//               <span className="inline-block px-4 py-2 bg-pink-500/10 text-pink-600 rounded-full text-sm font-medium mb-6">
//                 Customer Satisfaction
//               </span>
//               <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
//                 Automate and Track{" "}
//                 <span className="bg-gradient-to-r from-pink-500 via-primary to-violet-500 bg-clip-text text-transparent">
//                   Customer Satisfaction Effortlessly
//                 </span>
//               </h1>
//               <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
//                 Collect valuable customer feedback automatically and turn insights into action with comprehensive CSAT reporting.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                 <Link to="/contact-us">
//                   <Button size="lg" className="bg-gradient-to-r from-pink-500 to-primary hover:from-pink-500/90 hover:to-primary/90 text-white px-8 py-6 text-lg">
//                     Request a Demo
//                   </Button>
//                 </Link>
//               </div>
//             </AnimatedSection>
//           </div>
//         </section>

//         {/* Gather Feedback with Ease */}
//         <section className="py-20 bg-secondary/30">
//           <div className="container-tight">
//             <AnimatedSection className="text-center mb-16">
//               <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
//                 Gather Feedback with Ease
//               </h2>
//               <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//                 Simple, non-intrusive ways to collect customer feedback at the right moment
//               </p>
//             </AnimatedSection>

//             <div className="grid md:grid-cols-2 gap-8">
//               <AnimatedSection>
//                 <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:border-pink-500/30 transition-all duration-300 h-full">
//                   <div className="flex items-center gap-4 mb-6">
//                     <div className="w-14 h-14 bg-gradient-to-br from-pink-500/20 to-primary/20 rounded-xl flex items-center justify-center">
//                       <Smile className="w-7 h-7 text-pink-500" />
//                     </div>
//                     <h3 className="text-xl font-semibold text-foreground">Emoji-Based Surveys</h3>
//                   </div>
//                   <p className="text-muted-foreground mb-6">
//                     Let customers express their satisfaction with intuitive emoji ratings that take just one click.
//                   </p>
//                   <div className="flex justify-center gap-4 p-4 bg-secondary/50 rounded-xl">
//                     {["😡", "😕", "😐", "🙂", "😊"].map((emoji, index) => (
//                       <button 
//                         key={index}
//                         className="text-3xl hover:scale-125 transition-transform duration-200 p-2 rounded-lg hover:bg-background"
//                       >
//                         {emoji}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </AnimatedSection>

//               <AnimatedSection delay={0.1}>
//                 <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:border-pink-500/30 transition-all duration-300 h-full">
//                   <div className="flex items-center gap-4 mb-6">
//                     <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-xl flex items-center justify-center">
//                       <MessageCircle className="w-7 h-7 text-primary" />
//                     </div>
//                     <h3 className="text-xl font-semibold text-foreground">Automated CSAT Prompts</h3>
//                   </div>
//                   <p className="text-muted-foreground mb-6">
//                     Automatically trigger satisfaction surveys after chat sessions, ticket resolutions, or key interactions.
//                   </p>
//                   <div className="bg-secondary/50 rounded-xl p-4">
//                     <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
//                       <div className="w-2 h-2 bg-green-500 rounded-full" />
//                       Triggers automatically after:
//                     </div>
//                     <ul className="space-y-2 text-sm">
//                       {["Chat session ends", "Ticket resolved", "Purchase completed"].map((trigger, index) => (
//                         <li key={index} className="flex items-center gap-2 text-foreground">
//                           <ThumbsUp className="w-4 h-4 text-primary" />
//                           {trigger}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 </div>
//               </AnimatedSection>
//             </div>
//           </div>
//         </section>

//         {/* Analyze and Export */}
//         <section className="py-20">
//           <div className="container-tight">
//             <div className="grid lg:grid-cols-2 gap-12 items-center">
//               <AnimatedSection>
//                 <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
//                   Deep Analytics
//                 </span>
//                 <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
//                   Analyze and Export{" "}
//                   <span className="bg-gradient-to-r from-pink-500 to-primary bg-clip-text text-transparent">
//                     CSAT Reports
//                   </span>
//                 </h2>
//                 <p className="text-lg text-muted-foreground mb-8">
//                   Transform raw feedback into actionable insights with powerful filtering and export capabilities.
//                 </p>
//                 <ul className="space-y-4">
//                   {[
//                     { icon: Calendar, text: "Date-wise filtering and trends" },
//                     { icon: Star, text: "Agent performance correlation" },
//                     { icon: Download, text: "Downloadable reports in multiple formats" },
//                     { icon: TrendingUp, text: "Historical comparison analysis" }
//                   ].map((item, index) => (
//                     <li key={index} className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
//                         <item.icon className="w-5 h-5 text-pink-500" />
//                       </div>
//                       <span className="text-foreground">{item.text}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </AnimatedSection>

//               <AnimatedSection delay={0.2}>
//                 <div className="bg-gradient-to-br from-pink-500/10 to-primary/10 rounded-3xl p-8">
//                   <div className="text-center mb-6">
//                     <p className="text-sm text-muted-foreground mb-2">Overall CSAT Score</p>
//                     <div className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-primary bg-clip-text text-transparent">
//                       4.7/5.0
//                     </div>
//                     <div className="flex justify-center gap-1 mt-2">
//                       {[1, 2, 3, 4, 5].map((star) => (
//                         <Star 
//                           key={star} 
//                           className={`w-6 h-6 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400/50'}`} 
//                         />
//                       ))}
//                     </div>
//                   </div>
//                   <div className="space-y-3">
//                     {[
//                       { label: "Very Satisfied", percent: 65, color: "bg-green-500" },
//                       { label: "Satisfied", percent: 25, color: "bg-primary" },
//                       { label: "Neutral", percent: 7, color: "bg-yellow-500" },
//                       { label: "Dissatisfied", percent: 3, color: "bg-red-500" }
//                     ].map((item, index) => (
//                       <div key={index} className="bg-background/80 rounded-lg p-3">
//                         <div className="flex justify-between text-sm mb-1">
//                           <span className="text-foreground">{item.label}</span>
//                           <span className="text-muted-foreground">{item.percent}%</span>
//                         </div>
//                         <div className="h-2 bg-secondary rounded-full overflow-hidden">
//                           <div 
//                             className={`h-full ${item.color} rounded-full transition-all duration-500`}
//                             style={{ width: `${item.percent}%` }}
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </AnimatedSection>
//             </div>
//           </div>
//         </section>

//         {/* Transform Conversations */}
//         <section className="py-20 bg-gradient-to-br from-pink-500/5 via-primary/5 to-violet-500/5">
//           <div className="container-tight">
//             <AnimatedSection className="text-center mb-16">
//               <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
//                 Transform Conversations into Loyal Customers
//               </h2>
//               <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//                 Use CSAT insights to continuously improve customer experience
//               </p>
//             </AnimatedSection>

//             <div className="grid md:grid-cols-2 gap-8">
//               {[
//                 {
//                   icon: Heart,
//                   title: "Improve Retention",
//                   description: "Identify at-risk customers early and take proactive steps to improve their experience before they churn"
//                 },
//                 {
//                   icon: TrendingUp,
//                   title: "Boost Satisfaction Scores",
//                   description: "Use data-driven insights to continuously refine your support processes and training programs"
//                 }
//               ].map((feature, index) => (
//                 <AnimatedSection key={index} delay={index * 0.1}>
//                   <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:border-pink-500/30 transition-all duration-300 h-full">
//                     <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-primary rounded-2xl flex items-center justify-center mb-6">
//                       <feature.icon className="w-8 h-8 text-white" />
//                     </div>
//                     <h3 className="text-2xl font-semibold text-foreground mb-4">{feature.title}</h3>
//                     <p className="text-muted-foreground text-lg">{feature.description}</p>
//                   </div>
//                 </AnimatedSection>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* CTA Section */}
//         <section className="py-20">
//           <div className="container-tight">
//             <AnimatedSection>
//               <div className="bg-gradient-to-r from-pink-500 via-primary to-violet-500 rounded-3xl p-12 text-center relative overflow-hidden">
//                 <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
//                 <div className="relative z-10">
//                   <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
//                     Start Measuring Customer Happiness
//                   </h2>
//                   <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
//                     Let us show you how ConverseAI CSAT Reports can transform your customer feedback loop
//                   </p>
//                   <Link to="/contact-us">
//                     <Button size="lg" className="bg-white text-pink-600 hover:bg-white/90 px-8 py-6 text-lg font-semibold">
//                       Get a Call Back
//                     </Button>
//                   </Link>
//                 </div>
//               </div>
//             </AnimatedSection>
//           </div>
//         </section>
//       </main>

//       <Footer />
//     </>
//   );
// };

// export default CSATReport;


// after having side space 
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import {
  Smile,
  Star,
  Download,
  Calendar,
  TrendingUp,
  Heart,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";

const CSATReport = () => {
  return (
    <>
      <Helmet>
        <title>CSAT Reports & Customer Satisfaction Analytics | ConverseAI</title>
        <meta
          name="description"
          content="Measure and improve customer satisfaction with ConverseAI CSAT Reports."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="CSAT Reports & Customer Satisfaction Analytics | ConverseAI" />
        <meta
          property="og:description"
          content="Measure and improve customer satisfaction with ConverseAI CSAT Reports."
        />
        <link rel="canonical" href="https://theconverseai.com/csat-report" />
      </Helmet>

      <main className="min-h-screen bg-background pt-16 md:pt-20 overflow-x-hidden">

        {/* ================= HERO ================= */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-primary/5 to-violet-500/10" />

          <div className="hidden md:block absolute top-20 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
          <div className="hidden md:block absolute bottom-10 right-0 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />

          <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
            <AnimatedSection>
              <span className="inline-block px-4 py-2 bg-pink-500/10 text-pink-600 rounded-full text-sm font-medium mb-6">
                Customer Satisfaction
              </span>

              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Automate and Track{" "}
                <span className="bg-gradient-to-r from-pink-500 via-primary to-violet-500 bg-clip-text text-transparent">
                  Customer Satisfaction Effortlessly
                </span>
              </h1>

              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Collect valuable customer feedback automatically and turn insights
                into action with comprehensive CSAT reporting.
              </p>

              <Link to="/contact-us">
                <Button  title="Request a Demo to See ConverseAI in Action" size="lg" className="px-8 py-6 text-lg">
                  Request a Demo
                </Button>
              </Link>
            </AnimatedSection>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="py-16 bg-secondary/30">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">

            <AnimatedSection>
               <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:border-pink-500/30 transition-all duration-300 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-xl flex items-center justify-center">
                       <Smile className="w-7 h-7 text-pink-500" />
                     </div>
                     <h3 className="text-xl font-semibold text-foreground">Emoji-Based Surveys</h3>
                   </div>
                   <p className="text-muted-foreground mb-9">
                     Let customers express their satisfaction with intuitive emoji ratings that take just one click.
                   </p>
                <div className="flex justify-center gap-4 text-3xl mb-7">
                  {["😡", "😕", "😐", "🙂", "😊"].map((e, i) => (
                    <span key={i}>{e}</span>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:border-pink-500/30 transition-all duration-300 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Automated CSAT Prompts
                  </h3>
                </div>

                <p className="text-muted-foreground mb-6">
                  Automatically trigger satisfaction surveys after chat sessions,
                  ticket resolutions, or key interactions.
                </p>

                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Triggers automatically after:
                  </div>

                  <ul className="space-y-2 text-sm">
                    {[
                      "Chat session ends",
                      "Ticket resolved",
                      "Purchase completed",
                    ].map((trigger, index) => (
                      <li title={trigger} key={index} className="flex items-center gap-2 text-foreground">
                        <ThumbsUp className="w-4 h-4 text-primary" />
                        {trigger}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>

          </div>
        </section>

        {/* ================= ANALYTICS ================= */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">

            <AnimatedSection>
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                Deep Analytics
              </span>

              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Analyze and Export{" "}
                <span className="bg-gradient-to-r from-pink-500 to-primary bg-clip-text text-transparent">
                  CSAT Reports
                </span>
              </h2>

              <ul className="space-y-4">
                {[
                  { icon: Calendar, text: "Date-wise filtering and trends" },
                  { icon: Star, text: "Agent performance correlation" },
                  { icon: Download, text: "Downloadable reports" },
                  { icon: TrendingUp, text: "Historical comparison" },
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-pink-500" />
                    </div>
                    <span title={item.text} >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="bg-gradient-to-br from-pink-500/10 to-primary/10 rounded-3xl p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Overall CSAT</p>
                <div className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-primary bg-clip-text text-transparent">
                  4.7 / 5
                </div>

                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </AnimatedSection>

          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-20 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start Measuring Customer Happiness
            </h2>

            <Link to="/contact-us">
              <Button title="Request a Demo to See ConverseAI in Action" size="lg" className="px-8 py-6 text-lg">
                Get a Call Back
              </Button>
            </Link>
          </AnimatedSection>
        </section>

      </main>

      <Footer />
    </>
  );
};

export default CSATReport;
// new one code
// import { Helmet } from "react-helmet-async";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import Footer from "@/components/Footer";
// import AnimatedSection from "@/components/AnimatedSection";
// import { Smile, Star, Download, Calendar, TrendingUp, Heart, MessageCircle, ThumbsUp } from "lucide-react";

// const CSATReport = () => {
//   return (
//     <>
//       <Helmet>
//         <title>CSAT Reports & Customer Satisfaction Analytics | ConverseAI</title>
//         <meta 
//           name="description" 
//           content="Measure and improve customer satisfaction with ConverseAI CSAT Reports. Automate surveys and analyze feedback easily." 
//         />
//         <meta name="robots" content="index, follow" />
//         <link rel="canonical" href="https://converseai.com/csat-report" />
//       </Helmet>

//       {/* ✅ FIX 1 → stop horizontal overflow */}
//       <main
//         className="min-h-screen bg-background pt-16 md:pt-20"
//         style={{ overflowX: "hidden", maxWidth: "100vw" }}
//       >

//         {/* Hero Section */}
//         <section className="relative pt-32 pb-20" style={{ overflow: "hidden" }}>
//           <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-primary/5 to-violet-500/10" />

//           {/* ✅ FIX 2 → blur circles safe */}
//           <div
//             className="absolute hidden md:block"
//             style={{
//               top: 80,
//               left: 0,
//               width: 260,
//               height: 260,
//               borderRadius: "50%",
//               background: "rgba(236,72,153,0.2)",
//               filter: "blur(80px)",
//               pointerEvents: "none",
//             }}
//           />
//           <div
//             className="absolute hidden md:block"
//             style={{
//               bottom: 40,
//               right: 0,
//               width: 320,
//               height: 320,
//               borderRadius: "50%",
//               background: "rgba(99,102,241,0.2)",
//               filter: "blur(80px)",
//               pointerEvents: "none",
//             }}
//           />

//           <div className="container-tight relative z-10">
//             <AnimatedSection className="text-center max-w-4xl mx-auto">
//               <span className="inline-block px-4 py-2 bg-pink-500/10 text-pink-600 rounded-full text-sm font-medium mb-6">
//                 Customer Satisfaction
//               </span>
//               <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
//                 Automate and Track{" "}
//                 <span className="bg-gradient-to-r from-pink-500 via-primary to-violet-500 bg-clip-text text-transparent">
//                   Customer Satisfaction Effortlessly
//                 </span>
//               </h1>
//               <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
//                 Collect valuable customer feedback automatically and turn insights into action with comprehensive CSAT reporting.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                 <Link to="/contact-us">
//                   <Button size="lg" className="bg-gradient-to-r from-pink-500 to-primary hover:from-pink-500/90 hover:to-primary/90 text-white px-8 py-6 text-lg">
//                     Request a Demo
//                   </Button>
//                 </Link>
//               </div>
//             </AnimatedSection>
//           </div>
//         </section>

//         {/* Gather Feedback with Ease */}
//         <section className="py-20 bg-secondary/30" style={{ overflow: "hidden" }}>
//           <div className="container-tight">
//             <AnimatedSection className="text-center mb-16">
//               <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
//                 Gather Feedback with Ease
//               </h2>
//               <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//                 Simple, non-intrusive ways to collect customer feedback at the right moment
//               </p>
//             </AnimatedSection>

//             <div className="grid md:grid-cols-2 gap-8">
//               <AnimatedSection>
//                 <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:border-pink-500/30 transition-all duration-300 h-full">
//                   <div className="flex items-center gap-4 mb-6">
//                     <div className="w-14 h-14 bg-gradient-to-br from-pink-500/20 to-primary/20 rounded-xl flex items-center justify-center">
//                       <Smile className="w-7 h-7 text-pink-500" />
//                     </div>
//                     <h3 className="text-xl font-semibold text-foreground">Emoji-Based Surveys</h3>
//                   </div>
//                   <p className="text-muted-foreground mb-6">
//                     Let customers express their satisfaction with intuitive emoji ratings that take just one click.
//                   </p>
//                   <div className="flex justify-center gap-4 p-4 bg-secondary/50 rounded-xl">
//                     {["😡", "😕", "😐", "🙂", "😊"].map((emoji, index) => (
//                       <button key={index} className="text-3xl hover:scale-125 transition-transform duration-200 p-2 rounded-lg hover:bg-background">
//                         {emoji}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </AnimatedSection>

//               <AnimatedSection delay={0.1}>
//                 <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:border-pink-500/30 transition-all duration-300 h-full">
//                   <div className="flex items-center gap-4 mb-6">
//                     <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-xl flex items-center justify-center">
//                       <MessageCircle className="w-7 h-7 text-primary" />
//                     </div>
//                     <h3 className="text-xl font-semibold text-foreground">Automated CSAT Prompts</h3>
//                   </div>
//                   <p className="text-muted-foreground mb-6">
//                     Automatically trigger satisfaction surveys after chat sessions, ticket resolutions, or key interactions.
//                   </p>
//                   <div className="bg-secondary/50 rounded-xl p-4">
//                     <ul className="space-y-2 text-sm">
//                       {["Chat session ends", "Ticket resolved", "Purchase completed"].map((trigger, index) => (
//                         <li key={index} className="flex items-center gap-2 text-foreground">
//                           <ThumbsUp className="w-4 h-4 text-primary" />
//                           {trigger}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 </div>
//               </AnimatedSection>
//             </div>
//           </div>
//         </section>

//       </main>

//       <Footer />
//     </>
//   );
// };

// export default CSATReport;
