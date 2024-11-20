import { Helmet } from 'react-helmet-async';

import Navbar from '../components/layout/Navbar';
import AboutSection from '../components/ui/home/AboutSection';
import FAQSection from '../components/ui/home/FAQSection';
import ForCandidatesSection from '../components/ui/home/ForCandidatesSection';
import ForInterviewersSection from '../components/ui/home/ForInterviewersSection';
import ForRecruitersSection from '../components/ui/home/ForRecruitersSection';
import HeroSection from '../components/ui/home/HeroSection';
import PricingSection from '../components/ui/home/PricingSection';

export default function HomeScreen() {
  return (
    <>
      <Helmet>
        <title>OptaHire - Optimizing your Recruitment Journey</title>
        <meta
          name="description"
          content="OptaHire is an innovative recruitment platform that connects job seekers with employers. Find your next job today!"
        />
      </Helmet>
      <Navbar />
      <HeroSection />
      <ForRecruitersSection />
      <ForInterviewersSection />
      <ForCandidatesSection />
      <PricingSection />
      <FAQSection />
      <AboutSection />
    </>
  );
}
