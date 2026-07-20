import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  const lastUpdated = "April 20, 2026";

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-20">
      <Helmet>
        <title>Privacy Policy | ConverseAI</title>
        <meta
          name="description"
          content="Learn how ConverseAI collects, uses, and protects your personal data. Read our full Privacy Policy."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://theconverseai.com/privacy-policy" />
      </Helmet>

      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet/10 to-background" />
        <div className="container-tight relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-muted-foreground text-lg">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container-tight max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-8 md:p-10 border border-white/50 bg-white/80 backdrop-blur-xl prose prose-sm sm:prose max-w-none text-foreground">

            <h2>1. Introduction</h2>
            <p>
              ConverseAI ("we", "us", or "our"), a product of Revti Digital, is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services. Please read this policy carefully.
            </p>

            <h2>2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul>
              <li>
                <strong>Personal Information:</strong> Name, email address, phone number, and country when you fill out a contact or enquiry form.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you interact with our website, including pages visited, time spent, browser type, IP address, and referring URL.
              </li>
              <li>
                <strong>Communication Data:</strong> Messages and correspondence you send us through contact forms or email.
              </li>
              <li>
                <strong>Business Information:</strong> Details about your business needs and requirements shared with us during consultations or demos.
              </li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send you product updates, newsletters, and marketing communications (with your consent)</li>
              <li>Improve our website, products, and services</li>
              <li>Analyze usage trends and monitor the effectiveness of our marketing</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and ensure the security of our platform</li>
            </ul>

            <h2>4. Legal Basis for Processing</h2>
            <p>
              We process your personal data based on the following legal grounds:
            </p>
            <ul>
              <li><strong>Consent:</strong> Where you have given clear consent, such as opting in to receive marketing communications.</li>
              <li><strong>Contract:</strong> Where processing is necessary to fulfill a contract or take steps at your request before entering into a contract.</li>
              <li><strong>Legitimate Interests:</strong> Where processing is necessary for our legitimate business interests, provided those interests are not overridden by your rights.</li>
              <li><strong>Legal Obligation:</strong> Where we are required to process data to comply with applicable laws.</li>
            </ul>

            <h2>5. Sharing Your Information</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your information with:
            </p>
            <ul>
              <li><strong>Service Providers:</strong> Trusted third-party vendors who assist us in operating our website and delivering our services (e.g., email providers, CRM tools, analytics platforms), subject to confidentiality agreements.</li>
              <li><strong>Business Partners:</strong> Meta (Facebook) for WhatsApp Business API services, in accordance with Meta's data policies.</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government authority.</li>
            </ul>

            <h2>6. Cookies &amp; Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience on our website. These include:
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> Necessary for the website to function properly.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website (e.g., Google Analytics).</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign effectiveness.</li>
            </ul>
            <p>You can control cookie preferences through your browser settings. Disabling cookies may affect some features of our website.</p>

            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When your information is no longer needed, we will securely delete or anonymize it.
            </p>

            <h2>8. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>

            <h2>9. Your Rights</h2>
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data ("right to be forgotten").</li>
              <li><strong>Objection:</strong> Object to the processing of your data for certain purposes.</li>
              <li><strong>Portability:</strong> Request that we transfer your data to another organization.</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where we rely on consent as the legal basis for processing.</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at{" "}
              <a href="mailto:contact@theconverseai.com" className="text-primary hover:underline">contact@theconverseai.com</a>.
            </p>

            <h2>10. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>

            <h2>11. Children's Privacy</h2>
            <p>
              Our Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal data, please contact us and we will take steps to delete such information.
            </p>

            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this page. We encourage you to review this policy periodically.
            </p>

            <h2>13. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
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

export default PrivacyPolicy;
