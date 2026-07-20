import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";
import { trackThankYouPage } from "@/lib/tracking";

const ThankYou = () => {
  useEffect(() => {
    trackThankYouPage();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background pt-16 md:pt-20">
      <Helmet>
        <title>Thank You | ConverseAI</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <main className="flex-grow flex flex-col items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center space-y-6 animate-fade-up">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Thank You!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your message has been successfully sent. Our team will get back to you within 24 hours.
          </p>
          <div className="pt-8">
            <Link to="/">
              <Button size="lg" className="gradient-cta text-primary-foreground font-semibold px-8 rounded-xl">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ThankYou;
