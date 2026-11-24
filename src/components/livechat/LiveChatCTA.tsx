import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const LiveChatCTA = () => {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden" title="Live chat customer engagement with ConverseAI">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
      
      <div className="container-tight relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm text-white/90">Ready to transform your customer support?</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Live Chat Is Just the Start
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Discover how ConverseAI can revolutionize your entire customer engagement strategy 
            with AI-powered solutions that scale with your business.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book-demo?product=chatbot">
              <Button
                variant="hero-outline"
                title="Book a demo with ConverseAI"
                size="lg"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gradient-cta text-primary-foreground shadow-glow hover:shadow-[0_16px_50px_-10px_hsl(262_83%_58%_/_0.6)] hover:scale-[1.03] hover:-translate-y-1 active:scale-100 active:translate-y-0 font-semibold h-14 rounded-xl px-8 text-base"
              >
                Book a Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            { <Link to="/contact-us">
              <Button
                variant="outline"
                title="Contact the ConverseAI sales team"
                size="lg"
                className=" w-[250px] inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-primary/30 bg-white/80 backdrop-blur-sm text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-glow hover:scale-[1.03] hover:-translate-y-1 active:scale-100 font-medium h-14 rounded-xl px-8 text-base"
              >
                Contact Sales
              </Button>
            </Link> }
            {/*  <Button variant="outline" size="lg"  className="border-2 border-white text-white bg-transparent px-8 py-6 text-lg rounded-full 
               hover:bg-white/10 hover:text-white backdrop-blur-sm" >
               Contact Sales
             </Button> */}

          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
      />
    </section>
  );
};

export default LiveChatCTA;
