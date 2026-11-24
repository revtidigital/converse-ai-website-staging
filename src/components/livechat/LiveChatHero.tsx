import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Send, User } from "lucide-react";

const LiveChatHero = () => {
  return (
    <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
      
      <div className="container-tight relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Build Stronger Customer Connections —{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                No Matter the Scale
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Engage your audience personally in real time, regardless of team size or conversation volume.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/book-demo?product=chatbot">
                <Button title="Book a Demo with ConverseAI" variant="hero" size="lg" className="px-8 py-6 text-lg rounded-xl">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Chat UI Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-md">
              {/* Chat Window */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">ConverseAI Support</p>
                    <p className="text-white/70 text-sm">Online • Ready to help</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-4 min-h-[280px]">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-secondary rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                      <p className="text-sm text-foreground">Hi! I need help with my order.</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="flex gap-3 justify-end"
                  >
                    <div className="bg-gradient-to-r from-primary to-accent text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                      <p className="text-sm">Hello! I'd be happy to help you. Can you share your order number?</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-secondary rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                      <p className="text-sm text-foreground">It's #12345</p>
                    </div>
                  </motion.div>
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-border/50">
                  <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent text-sm outline-none"
                      readOnly
                    />
                    <button title="Send message" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-background rounded-xl shadow-lg p-3 border border-border/50"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span className="text-xs font-medium text-foreground">Live Agent</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LiveChatHero;
