import { Helmet } from 'react-helmet-async';

import AboutSection from '../components/home/AboutSection';
import FAQSection from '../components/home/FAQSection';
import ForCandidatesSection from '../components/home/ForCandidatesSection';
import ForInterviewersSection from '../components/home/ForInterviewersSection';
import ForRecruitersSection from '../components/home/ForRecruitersSection';
import HeroSection from '../components/home/HeroSection';
import PricingSection from '../components/home/PricingSection';

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
