import { Helmet } from 'react-helmet-async';

import HeroSection from '../components/ui/home/HeroSection';
import ForRecruitersSection from '../components/ui/home/ForRecruitersSection';
import ForInterviewersSection from '../components/ui/home/ForInterviewersSection';
import PricingSection from '../components/ui/home/PricingSection';
import AboutSection from '../components/ui/home/AboutSection';

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
      {/* <main className="relative flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="absolute text-[20vw] font-extrabold text-primary opacity-10 flex items-center justify-center">
          OptaHire
        </h1>

        <h2 className="text-4xl font-bold text-darkText mb-4">
          Welcome to OptaHire!
        </h2>
        <p className="text-lg text-darkText opacity-80 mb-8">
          OptaHire is an innovative recruitment platform that connects job
          seekers with employers. Find your next job today!
        </p>
      </main> */}
      <HeroSection />
      <ForRecruitersSection />
      <ForInterviewersSection />
      <PricingSection />
      <AboutSection />
    </>
  );
}
