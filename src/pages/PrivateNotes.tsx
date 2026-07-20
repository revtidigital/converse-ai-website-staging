import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { MessageSquare, AtSign, Paperclip, ArrowRight, Lock, Users, Smile, Bell } from "lucide-react";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import ContactFormDialog from "@/components/ContactFormDialog";

const PrivateNotes = () => {
  return (
    <>
      <Helmet>
        <title>Private Notes for Team Collaboration | ConverseAI</title>
        <meta name="description" content="Collaborate better with ConverseAI Private Notes. Add internal notes, tag teammates, and resolve customer issues faster as a team." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Private Notes for Team Collaboration | ConverseAI" />
        <meta property="og:description" content="Collaborate better with ConverseAI Private Notes. Add internal notes, tag teammates, and resolve customer issues faster as a team." />
        <link rel="canonical" href="https://theconverseai.com/private-notes" />
      </Helmet>

      <main className="pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/10">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft" />
          </div>

          <div className="container-tight relative z-10 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Lock className="w-4 h-4" />
                  Private Notes
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Collaborate Efficiently to <span className="gradient-text">Resolve Customer Issues</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Work seamlessly with your team by discussing queries privately before responding to customers.
                </p>
                <ContactFormDialog>
                  <Button title="Request a Demo to see it in action" variant="gradient" size="xl" className="w-full group">
                    Request a Demo
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </ContactFormDialog>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="relative">
                  <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Private Notes</span>
                      <span className="ml-auto px-2 py-1 bg-amber-500/10 text-amber-600 text-xs rounded-full">Internal Only</span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20" />
                          <span className="text-sm font-medium text-foreground">Sarah</span>
                          <span className="text-xs text-muted-foreground">2m ago</span>
                        </div>
                        <p className="text-sm text-foreground">@John can you check the billing issue for this customer?</p>
                      </div>
                      <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-secondary/20" />
                          <span className="text-sm font-medium text-foreground">John</span>
                          <span className="text-xs text-muted-foreground">1m ago</span>
                        </div>
                        <p className="text-sm text-foreground">Checked! It's a duplicate charge. I'll process the refund. 👍</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <input 
                        type="text" 
                        placeholder="Type a private note..." 
                        className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                        disabled
                      />
                      <Paperclip className="w-4 h-4 text-muted-foreground" />
                      <Smile className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Quick Transition Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-tight">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Quick Transition from Chat to Private Notes
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Seamlessly switch between customer conversations and internal discussions without leaving the chat window.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: MessageSquare, text: "Press shortcut to enter private mode" },
                    { icon: Lock, text: "Internal-only messages" },
                    { icon: Users, text: "Zero customer visibility" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-foreground font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="glass-card p-8 rounded-2xl">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full mb-4">
                      <span className="text-sm text-muted-foreground">Press</span>
                      <kbd className="px-2 py-1 bg-background border border-border rounded text-sm font-mono">Alt / ⌥ </kbd>
                      <span className="text-sm text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 bg-background border border-border rounded text-sm font-mono">P</kbd>
                    </div>
                    <p className="text-muted-foreground">to toggle private notes</p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <div className="px-4 py-2 bg-muted rounded-lg text-center">
                      <MessageSquare className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                      <span className="text-xs text-muted-foreground">Public</span>
                    </div>
                    <div className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg text-center">
                      <Lock className="w-6 h-6 text-primary mx-auto mb-1" />
                      <span className="text-xs text-primary">Private</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Tag Teammates Section */}
        <section className="section-padding">
          <div className="container-tight">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Tag Teammates for Clear Communication
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Mention team members directly in private notes for instant notifications and faster issue resolution.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: AtSign,
                  title: "@Mention Teammates",
                  description: "Tag specific team members to get their attention on important issues."
                },
                {
                  icon: Bell,
                  title: "Instant Notifications",
                  description: "Tagged teammates receive real-time alerts so nothing gets missed."
                },
                {
                  icon: Users,
                  title: "Faster Resolutions",
                  description: "Collaborate efficiently to resolve customer issues in record time."
                }
              ].map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Enrich Notes Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-tight">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <div className="glass-card p-6 rounded-2xl">
                  <h4 className="font-semibold text-foreground mb-4">Rich Note Features</h4>
                  <div className="space-y-4">
                    {[
                      { icon: Paperclip, label: "File Attachments", desc: "Share documents, screenshots, and files" },
                      { icon: Smile, label: "Emojis & Reactions", desc: "Express yourself with rich formatting" },
                      { icon: MessageSquare, label: "Contextual Threads", desc: "Keep discussions organized" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="font-medium text-foreground">{item.label}</h5>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Enrich Your Private Notes
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Go beyond plain text. Attach files, use emojis, and format your notes for clearer contextual collaboration.
                </p>
                <ContactFormDialog>
                  <Button title="Learn More" variant="gradient" size="lg" className="group">
                    Learn More
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </ContactFormDialog>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-padding bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container-tight">
            <AnimatedSection>
              <div className="glass-card p-12 rounded-2xl text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Start Team Collaboration with ConverseAI
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Empower your team to collaborate internally and resolve customer issues faster than ever.
                </p>
                <ContactFormDialog>
                  <Button title="Start Your Free Trial" variant="gradient" size="xl" className="group">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </ContactFormDialog>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default PrivateNotes;
