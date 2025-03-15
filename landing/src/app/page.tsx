'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Composants de section
import HeroSection from '../components/sections/Hero';
import FeaturesSection from '../components/sections/FeaturesSection';
import AdminSection from '../components/sections/AdminSection';
import PluginsSection from '../components/sections/PluginsSection';
import InstallSection from '../components/sections/InstallSection';
import CommunitySection from '../components/sections/CommunitySection';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

// Types pour les éléments visuels tech
interface TechSquare {
  id: number;
  size: number;
  top: string;
  left: string;
  delay: number;
}



export default function Home() {   

  // État pour les éléments visuels tech
  const [techSquares, setTechSquares] = useState<TechSquare[]>([]);
  
  // Générer des carrés tech aléatoires
  useEffect(() => {
    const squares: TechSquare[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 80) + 40, // 40-120px
      top: `${Math.floor(Math.random() * 80)}%`,
      left: `${Math.floor(Math.random() * 80)}%`,
      delay: Math.random() * 5
    }));
    setTechSquares(squares);
  }, []);

  return (
    <main className="min-h-screen font-instrument">
      <Header />
      <HeroSection techSquares={techSquares} />
      <FeaturesSection />
      <AdminSection />
      <PluginsSection />
      <InstallSection />
      <CommunitySection />
      <Footer />
    </main>
  );
}