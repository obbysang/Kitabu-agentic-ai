import React from 'react';
import Hero from '../components/Hero';
import AppShowcase from '../components/AppShowcase';
import CalculatorSection from '../components/CalculatorSection';
import StorySection from '../components/StorySection';
import Footer from '../components/Footer';

const Landing: React.FC = () => {
  return (
    <>
      <Hero />
      <AppShowcase />
      <CalculatorSection />
      <StorySection />
      <Footer />
    </>
  );
};

export default Landing;