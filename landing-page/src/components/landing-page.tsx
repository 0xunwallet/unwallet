import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Globe } from "@/components/magicui/globe"; // Import the Globe component
import Beam from "./beam";
import Link from "next/link";

const BentoGridLanding = () => {
  const [activeFeature, setActiveFeature] = React.useState(0);
  const [expandedFaq, setExpandedFaq] = React.useState(null);

  const features = [
    {
      title: "Instant Transfers",
      description: "Move money in milliseconds, not days",
    },
    {
      title: "Multi-Currency",
      description: "Support for 50+ currencies and crypto",
    },
    {
      title: "Smart Contracts",
      description: "Programmable money with built-in logic",
    },
    {
      title: "Batch Payments",
      description: "Pay thousands in a single transaction",
    },
  ];

  const faqs = [
    {
      q: "Do I need to create a new wallet?",
      a: "No, you can use your existing wallet. If not you can create keyless wallets at unwallet.me.",
    },
    {
      q: "How we provider privacy?",
      a: "We provide compilant privacy. More info: ",
      link: "https://eips.ethereum.org/EIPS/eip-5564",
    },
    {
      q: "How can I start accepting payments?",
      a: "You can start accepting payments with our API. More info: ",
      link: "https://docs.unwallet.me",
    },
    {
      q: "How many chains do you support?",
      a: "We support all EVM chains, and major non-EVM chains.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />

      {/* Static gradient orb from top right to bottom left */}
      <div className="fixed top-[-200px] right-[-200px] w-[600px] h-[600px] bg-foreground/5 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-accent/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 md:px-0 px-8">
        <nav className="container mx-auto py-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src="/logo-dark.svg" alt="Unwallet" width={40} height={40} />
            <span
              className="text-xl mono-text"
              style={{ fontFamily: "var(--font-departure-mono)" }}
            >
              Unwallet
            </span>
          </div>
          <Link href="https://app.unwallet.me">
            <Button
              variant="outline"
              className="border-border hover:bg-accent hover:border-accent rounded-none mono-text"
            >
              Enter App →
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <section className="relative z-10 px-8 pb-20">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Text */}
          <div className="mb-16 pt-12">
            <h1 className="text-6xl md:text-8xl font-light mb-6 tracking-tight">
              One wallet
              <br />
              <span className="text-muted-foreground">for everything</span>
            </h1>
            <p
              className="text-lg text-muted-foreground max-w-2xl mono-text"
              style={{ fontFamily: "var(--font-departure-mono)" }}
            >
              The next generation payment infrastructure for agents, merchants,
              and users.
            </p>
          </div>

          {/* Minimal Bento Grid - Sharp corners */}
          <div className="grid grid-cols-12 gap-4 auto-rows-[160px]">
            {/* Main Feature - Payments */}
            <div className="col-span-12 md:col-span-8 row-span-2 group relative bg-accent/10 backdrop-blur rounded-none p-8 border border-border/50 hover:border-foreground/20 transition-all duration-500 overflow-hidden">
              <div className="relative z-10">
                <p
                  className="text-sm text-muted-foreground mb-4 mono-text"
                  style={{ fontFamily: "var(--font-departure-mono)" }}
                >
                  FEATURED
                </p>
                <h3 className="text-3xl font-light mb-3">Universal Payments</h3>
                <p className="text-muted-foreground max-w-lg">
                  Send and receive payments privately. No borders, no limits.
                </p>
              </div>
              {/* Animated gradient line */}
              <div className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-foreground to-transparent w-full transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </div>

            {/* Live Stats */}
            <div className="col-span-12 md:col-span-4 row-span-2 bg-foreground text-background rounded-none p-8 relative overflow-hidden">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <p
                    className="text-background/60 text-sm mb-2 mono-text"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    LIVE
                  </p>
                  <p className="text-5xl font-light">5</p>
                  <p
                    className="text-background/60 text-sm mt-1 mono-text"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    active wallets
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-background animate-pulse" />
                  <span
                    className="text-xs text-background/60 mono-text"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    Live tracking
                  </span>
                </div>
              </div>
              {/* Sharp geometric pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 border border-background/10 -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Speed Metric */}
            <div className="col-span-6 md:col-span-3 bg-muted/50 backdrop-blur rounded-none p-6 border border-border/50 hover:border-foreground/20 transition-all duration-300">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <p
                    className="text-4xl font-light mono-text"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    100%
                  </p>
                  <p
                    className="text-sm text-muted-foreground mt-1 mono-text"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    Automated Yield
                  </p>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="col-span-6 md:col-span-3 bg-accent/10 backdrop-blur rounded-none p-6 border border-border/50 hover:border-foreground/20 transition-all duration-300">
              <div className="flex flex-col justify-between h-full">
                <Eye className="w-6 h-6 text-foreground/50 mb-4" />
                <div>
                  <p
                    className="font-medium mono-text"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    Privacy
                  </p>
                  <p
                    className="text-xs text-muted-foreground mono-text"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    Focused
                  </p>
                </div>
              </div>
            </div>

            {/* API */}
            <div className="col-span-12 md:col-span-6 bg-muted/30 backdrop-blur rounded-none p-6 border border-border/50 hover:border-foreground/20 transition-all duration-300 group">
              <div className="flex items-center justify-between h-full">
                <div>
                  <code
                    className="text-xs text-muted-foreground mono-text mb-2 block"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    $ npm install @unwallet/sdk
                  </code>
                  <h4 className="text-lg font-light">Developer First</h4>
                  <p
                    className="text-sm text-muted-foreground mono-text"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    RESTful API & SDKs
                  </p>
                </div>
                <div className="w-16 h-16 border border-border rounded-none flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                  <span
                    className="text-2xl mono-text text-muted-foreground"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    {}
                  </span>
                </div>
              </div>
            </div>

            {/* Global */}
            <div className="col-span-12 md:col-span-6 row-span-2 relative bg-gradient-to-br from-accent/10 to-muted/10 backdrop-blur rounded-none p-8 border border-border/50 hover:border-foreground/20 transition-all duration-300 overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-light mb-3">Use Anywhere</h3>
                <p
                  className="text-muted-foreground mb-6 mono-text"
                  style={{ fontFamily: "var(--font-departure-mono)" }}
                >
                  Easy to use, everywhere
                </p>
              </div>

              {/* Globe positioned center bottom */}
              <div
                className="absolute w-[800px] h-[250px] opacity-40"
                style={{
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <Globe />
              </div>
            </div>

            {/* CTA Section */}
            <div className="col-span-12 md:col-span-6 bg-foreground text-background rounded-none p-8 relative overflow-hidden group">
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-2xl font-light mb-2">
                    Start building today
                  </h3>
                  <p
                    className="text-background/70 text-sm mono-text"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    Join thousands of developers
                  </p>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button className="bg-background text-foreground hover:bg-background/90 rounded-none mono-text">
                    Get Started
                  </Button>
                  <Button className="bg-background text-foreground hover:bg-background/90 rounded-none mono-text">
                    Documentation
                  </Button>
                </div>
              </div>
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background to-transparent transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-[2000ms]" />
              </div>
            </div>

            {/* Agents Card */}
            <div className="col-span-6 md:col-span-3 bg-muted/50 backdrop-blur rounded-none p-6 border border-border/50 hover:border-foreground/20 transition-all duration-300">
              <div className="flex flex-col justify-between h-full">
                <div className="w-8 h-8 border-2 border-foreground/30 mb-4 flex items-center justify-center">
                  <div className="w-2 h-2 bg-foreground/50" />
                </div>
                <div>
                  <p
                    className="font-medium mono-text"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    AI Agents
                  </p>
                  <p
                    className="text-xs text-muted-foreground mono-text"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    Automated
                  </p>
                </div>
              </div>
            </div>

            {/* Merchants Card */}
            <div className="col-span-6 md:col-span-3 bg-accent/10 backdrop-blur rounded-none p-6 border border-border/50 hover:border-foreground/20 transition-all duration-300">
              <div className="flex flex-col justify-between h-full">
                <span
                  className="text-xs bg-foreground text-background px-2 py-1 rounded-none mono-text inline-block mb-4"
                  style={{ fontFamily: "var(--font-departure-mono)" }}
                >
                  NEW
                </span>
                <div>
                  <p
                    className="font-medium mono-text"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    Merchants
                  </p>
                  <p
                    className="text-xs text-muted-foreground mono-text"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    POS Ready
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <Beam /> */}

      {/* Features Section */}
      {/* <section className="relative z-10 px-8 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-4">
              <h2 className="text-3xl font-light mb-4">Core Features</h2>
              <p
                className="text-muted-foreground mb-8 mono-text"
                style={{ fontFamily: "var(--font-departure-mono)" }}
              >
                Everything you need to move money programmatically
              </p>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`w-full text-left p-4 border rounded-none transition-all duration-300 ${
                      activeFeature === index
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent border-border/50 hover:border-foreground/20"
                    }`}
                  >
                    <p
                      className="font-medium mono-text"
                      style={{ fontFamily: "var(--font-departure-mono)" }}
                    >
                      {feature.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-12 md:col-span-8">
              <div className="bg-accent/10 border border-border/50 rounded-none p-12 h-full flex items-center">
                <div>
                  <h3 className="text-4xl font-light mb-4">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-8">
                    {features[activeFeature].description}
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-foreground" />
                    <span
                      className="text-sm mono-text text-muted-foreground"
                      style={{ fontFamily: "var(--font-departure-mono)" }}
                    >
                      Feature {activeFeature + 1} of {features.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Code Example Section */}
      <section className="relative z-10 px-8 py-20 ">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-5">
              <h2 className="text-3xl font-light mb-4">Built for Agents</h2>
              <p className="text-muted-foreground mb-12">
                Integrate payments in minutes, not months. Simple, powerful APIs
                that just work without KYC .
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 border border-foreground/30 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-foreground/50" />
                  </div>
                  <div>
                    <p className="font-medium">Quick Setup</p>
                    <p className="text-sm text-muted-foreground">
                      No KYC, No AML, No ID
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 border border-foreground/30 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-foreground/50" />
                  </div>
                  <div>
                    <p className="font-medium">Compilant Privacy</p>
                    <p className="text-sm text-muted-foreground">
                      Hide your revenue from competitors
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 border border-foreground/30 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-foreground/50" />
                  </div>
                  <div>
                    <p className="font-medium">Instant Payments</p>
                    <p className="text-sm text-muted-foreground">
                      Receive payments in any token from any chain
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-7">
              <div className="bg-foreground text-background rounded-none p-6 overflow-hidden">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-background/20" />
                  <div className="w-3 h-3 bg-background/20" />
                  <div className="w-3 h-3 bg-background/20" />
                </div>
                <pre
                  className="text-sm mono-text overflow-x-auto"
                  style={{ fontFamily: "var(--font-departure-mono)" }}
                >
                  {`import { Unwallet } from '@unwallet/sdk';

const unwallet = new Unwallet({
  apiKey: process.env.UNWALLET_API_KEY
});

// Send payment
const payment = await unwallet.payments.create({
  amount: 1000,
  currency: 'USD',
  recipient: 'user@example.com',
  metadata: { orderId: '12345' }
});

console.log(payment.status); // 'completed'`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-8 py-20 bg-accent/5 border-t border-border/50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p
                className="text-4xl font-light mb-2 mono-text"
                style={{ fontFamily: "var(--font-departure-mono)" }}
              >
                $100+
              </p>
              <p
                className="text-sm text-muted-foreground mono-text"
                style={{ fontFamily: "var(--font-departure-mono)" }}
              >
                Processed
              </p>
            </div>
            <div className="text-center">
              <p
                className="text-4xl font-light mb-2 mono-text"
                style={{ fontFamily: "var(--font-departure-mono)" }}
              >
                99.9%
              </p>
              <p
                className="text-sm text-muted-foreground mono-text"
                style={{ fontFamily: "var(--font-departure-mono)" }}
              >
                Uptime
              </p>
            </div>
            <div className="text-center">
              <p
                className="text-4xl font-light mb-2 mono-text"
                style={{ fontFamily: "var(--font-departure-mono)" }}
              >
                20+
              </p>
              <p
                className="text-sm text-muted-foreground mono-text"
                style={{ fontFamily: "var(--font-departure-mono)" }}
              >
                Chains
              </p>
            </div>
            <div className="text-center">
              <p
                className="text-4xl font-light mb-2 mono-text"
                style={{ fontFamily: "var(--font-departure-mono)" }}
              >
                24/7
              </p>
              <p
                className="text-sm text-muted-foreground mono-text"
                style={{ fontFamily: "var(--font-departure-mono)" }}
              >
                Support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 px-8 py-20 border-t border-border/50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-light mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-border/50 rounded-none overflow-hidden"
              >
                <button
                  onClick={() =>
                    // @ts-expect-error - expandedFaq is null or number
                    setExpandedFaq(expandedFaq === index ? null : index)
                  }
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-accent/5 transition-all duration-300"
                >
                  <span className="font-medium">{faq.q}</span>
                  <span
                    className="text-2xl mono-text"
                    style={{ fontFamily: "var(--font-departure-mono)" }}
                  >
                    {expandedFaq === index ? "−" : "+"}
                  </span>
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6 text-muted-foreground">
                    {faq.a}
                    {faq.link && (
                      <a
                        href={faq.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-accent/20 hover:bg-accent/30 text-foreground px-3 py-1 rounded-none text-sm mono-text transition-colors duration-200 ml-2"
                        style={{ fontFamily: "var(--font-departure-mono)" }}
                      >
                        {faq.q === "How we provider privacy?"
                          ? "EIP-5564"
                          : "Docs"}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-8 py-20 bg-foreground text-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-light mb-6">
            Ready to transform payments?
          </h2>
          <p
            className="text-lg text-background/70 mb-8 mono-text"
            style={{ fontFamily: "var(--font-departure-mono)" }}
          >
            Join the revolution of payments
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="https://calendly.com/0xswayam/15min" target="_blank">
              <Button
                variant="ghost"
                className="rounded-none mono-text px-8 py-6 text-lg"
              >
                Schedule Demo
              </Button>
            </Link>
            <Link href="https://app.unwallet.me">
              <Button className="bg-background text-foreground hover:bg-background/90 rounded-none mono-text px-8 py-6 text-lg">
                Enter App
              </Button>
            </Link>
          </div>
          <p
            className="text-xs text-background/50 mt-8 mono-text"
            style={{ fontFamily: "var(--font-departure-mono)" }}
          >
            No credit card required • Free forever on test mode
          </p>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-border/50">
        <div className="container mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between">
          <div
            className="text-xs text-muted-foreground mono-text flex items-center gap-2"
            style={{ fontFamily: "var(--font-departure-mono)" }}
          >
            <Image src="/logo-dark.svg" alt="Unwallet" width={40} height={40} />
            <p
              className="text-lg text-muted-foreground mono-text"
              style={{ fontFamily: "var(--font-departure-mono)" }}
            >
              Unwallet
            </p>
          </div>
          <div className="flex items-center space-x-8 mt-4 md:mt-0">
            <a
              href="https://x.com/0xunwallet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mono-text"
              style={{ fontFamily: "var(--font-departure-mono)" }}
            >
              X
            </a>
            <a
              href="https://github.com/0xunwallet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mono-text"
              style={{ fontFamily: "var(--font-departure-mono)" }}
            >
              Github
            </a>
            <a
              href="https://docs.unwallet.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mono-text"
              style={{ fontFamily: "var(--font-departure-mono)" }}
            >
              Docs
            </a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        .mono-text {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas,
            "Liberation Mono", Menlo, monospace;
        }
      `}</style>
    </div>
  );
};

export default BentoGridLanding;
