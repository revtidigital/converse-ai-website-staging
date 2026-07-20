import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import LiveChatHero from "@/components/livechat/LiveChatHero";
import LiveChatPreferences from "@/components/livechat/LiveChatPreferences";
import LiveChatSuite from "@/components/livechat/LiveChatSuite";
import LiveChatManage from "@/components/livechat/LiveChatManage";
import LiveChatTestimonial from "@/components/livechat/LiveChatTestimonial";
import LiveChatCTA from "@/components/livechat/LiveChatCTA";

const LiveChat = () => {
  return (
    <>
      <Helmet>
        <title>Live Chat Software for Websites | ConverseAI</title>
        <meta
          name="description"
          content="Deliver real-time customer support with ConverseAI Live Chat. Engage visitors instantly, boost conversions, and streamline support operations."
        />
        <meta property="og:title" content="Live Chat Software for Websites | ConverseAI" />
        <meta
          property="og:description"
          content="Deliver real-time customer support with ConverseAI Live Chat. Engage visitors instantly, boost conversions, and streamline support operations."
        />
        <link rel="canonical" href="https://theconverseai.com/live-chat" />
      </Helmet>
      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <main>
          <LiveChatHero />
          <LiveChatPreferences />
          <LiveChatSuite />
          <LiveChatManage />
          <LiveChatTestimonial />
          <LiveChatCTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default LiveChat;
