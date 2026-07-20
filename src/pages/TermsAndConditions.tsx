import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";

const TermsAndConditions = () => {
  const lastUpdated = "April 20, 2026";

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-20">
      <Helmet>
        <title>Terms & Conditions | ConverseAI</title>
        <meta
          name="description"
          content="Read the Terms and Conditions for using ConverseAI's AI chatbot, WhatsApp automation, and customer engagement platform."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://theconverseai.com/terms-and-conditions" />
      </Helmet>

      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet/10 to-background" />
        <div className="container-tight relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Terms &amp; <span className="gradient-text">Conditions</span>
          </h1>
          <p className="text-muted-foreground text-lg">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container-tight max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-8 md:p-10 border border-white/50 bg-white/80 backdrop-blur-xl prose prose-sm sm:prose max-w-none text-foreground">

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the ConverseAI platform, website, or any of our services (collectively, the "Service"), you agree to be bound by these Terms &amp; Conditions ("Terms"). If you do not agree to all the terms and conditions of this agreement, you may not access or use the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              ConverseAI (a product of Revti Digital) provides businesses with AI-powered customer engagement tools including, but not limited to:
            </p>
            <ul>
              <li>Conversational AI Chatbot</li>
              <li>WhatsApp AI Chatbot</li>
              <li>Live Chat</li>
              <li>Omni Channel communication platform</li>
              <li>Pre-Chat Forms</li>
              <li>WhatsApp Marketing</li>
            </ul>

            <h2>3. User Accounts</h2>
            <p>
              To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Send spam, unsolicited messages, or engage in abusive communication</li>
              <li>Transmit harmful, offensive, or fraudulent content</li>
              <li>Infringe on the intellectual property rights of others</li>
              <li>Interfere with or disrupt the integrity of the Service</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
            </ul>

            <h2>5. WhatsApp &amp; Messaging Compliance</h2>
            <p>
              When using our WhatsApp Marketing or AI Chatbot features, you agree to comply with Meta's WhatsApp Business Policy and all applicable messaging regulations, including obtaining proper consent from recipients before sending marketing communications.
            </p>

            <h2>6. Payment &amp; Subscription</h2>
            <p>
              Some features of the Service require a paid subscription. All fees are non-refundable unless otherwise stated. We reserve the right to change our pricing with reasonable notice. Continued use of the Service after a price change constitutes acceptance of the new pricing.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Revti Digital and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
            </p>

            <h2>8. Data &amp; Privacy</h2>
            <p>
              Your use of the Service is also governed by our{" "}
              <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>,
              which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, ConverseAI and Revti Digital shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or related to your use of the Service.
            </p>

            <h2>10. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>

            <h2>11. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, third parties, or for any other reason.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Jaipur, Rajasthan, India.
            </p>

            <h2>13. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or a prominent notice on the Service. Your continued use of the Service after changes become effective constitutes your acceptance of the revised Terms.
            </p>

            <h2>14. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <ul>
              <li>Email: <a href="mailto:contact@theconverseai.com" className="text-primary hover:underline">contact@theconverseai.com</a></li>
              <li>Phone: <a href="tel:+919982323333" className="text-primary hover:underline">+91-9982323333</a></li>
              <li>Address: F-21, Madhuban Colony, Barkat Nagar, Tonk Phatak, Jaipur, Rajasthan 302015</li>
            </ul>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
