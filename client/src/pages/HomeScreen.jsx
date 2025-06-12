import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import BenefitsSection from '../components/home/BenefitsSection';
import FAQSection from '../components/home/FAQSection';
import HeroSection from '../components/home/HeroSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import PricingSection from '../components/home/PricingSection';
import StatsSection from '../components/home/StatsSection';

import { trackPageView } from '../utils/analytics';

export default function HomeScreen() {
  useEffect(() => {
    trackPageView('/');
  }, []);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OptaHire',
    description:
      'AI-powered recruitment platform connecting recruiters, interviewers, and candidates for optimized hiring decisions.',
    url: 'https://opta-hire-fyp-app-client.vercel.app',
    foundingDate: '2024',
    sameAs: [
      'https://www.linkedin.com/company/optahire',
      'https://www.facebook.com/optahire',
      'https://www.instagram.com/optahire',
      'https://www.x.com/optahire',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'optahire@gmail.com',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PK',
      addressRegion: 'Punjab',
      addressLocality: 'Gujranwala',
    },
    offers: {
      '@type': 'Offer',
      description:
        'AI-powered recruitment services with expert interviewer matching',
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: '2.5',
        priceCurrency: 'USD',
        description: 'Platform fee percentage per successful contract',
      },
    },
  };

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is OptaHire?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'OptaHire is an AI-powered recruitment platform that connects recruiters with expert interviewers and candidates to optimize the hiring process.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does OptaHire work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Recruiters post jobs, candidates apply, AI shortlists top 5 candidates, recruiters hire interviewers for evaluation, and contracts are managed with secure payments.',
        },
      },
      {
        '@type': 'Question',
        name: "What are OptaHire's fees?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'OptaHire charges a 2.5% platform fee on successful contracts between recruiters and interviewers.',
        },
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>
          OptaHire - Optimizing Your Recruitment Journey | AI-Powered Hiring
        </title>
        <meta
          name="description"
          content="Transform your hiring process with OptaHire's AI-powered platform. Connect with expert interviewers, find top candidates, and optimize recruitment decisions. 2.5% platform fee. Join thousands of successful hires."
        />
        <meta
          name="keywords"
          content="recruitment platform, AI hiring, interview services, job matching, recruiter tools, candidate screening, hiring optimization, freelance interviewers, recruitment technology, talent acquisition"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://opta-hire-fyp-app-client.vercel.app/"
        />
        <meta
          property="og:title"
          content="OptaHire - Optimizing Your Recruitment Journey | AI-Powered Hiring"
        />
        <meta
          property="og:description"
          content="Transform your hiring process with OptaHire's AI-powered platform. Connect with expert interviewers and find top candidates."
        />
        <meta
          property="og:image"
          content="https://opta-hire-fyp-app-client.vercel.app/opengraph-image.png"
        />
        <meta property="og:site_name" content="OptaHire" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content="https://opta-hire-fyp-app-client.vercel.app/"
        />
        <meta
          property="twitter:title"
          content="OptaHire - Optimizing Your Recruitment Journey | AI-Powered Hiring"
        />
        <meta
          property="twitter:description"
          content="Transform your hiring process with OptaHire's AI-powered platform. Connect with expert interviewers and find top candidates."
        />
        <meta
          property="twitter:image"
          content="https://opta-hire-fyp-app-client.vercel.app/opengraph-image.png"
        />

        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="OptaHire Team" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />

        {/* Canonical URL */}
        <link
          rel="canonical"
          href="https://opta-hire-fyp-app-client.vercel.app/"
        />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">{JSON.stringify(faqData)}</script>

        {/* Additional Meta for Better Performance */}
        <meta name="theme-color" content="#0EB0E3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="OptaHire" />

        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </Helmet>

      <main className="min-h-screen">
        <HeroSection />
        <HowItWorksSection />
        <BenefitsSection />
        <StatsSection />
        <PricingSection />
        <FAQSection />
      </main>
    </>
  );
}
