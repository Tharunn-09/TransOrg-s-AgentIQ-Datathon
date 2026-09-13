import { useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import DemoVideoModal from './DemoVideoModal';
import TrustMarquee from './TrustMarquee';
import ArchitectureSection from './ArchitectureSection';
import DatasetsSection from './DatasetsSection';
import WorkflowCanvas from './WorkflowCanvas';
import PlatformPrimitives from './PlatformPrimitives';
import ScaleMetrics from './ScaleMetrics';
import ConversionBanner from './ConversionBanner';
import Footer from './Footer';

export default function LandingPage({ onSignIn, onLaunch }: { onSignIn: () => void; onLaunch: () => void }) {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen relative bg-oceanic text-arctic selection:bg-forsythia/30 selection:text-forsythia overflow-x-hidden">
      {/* Dynamic Top Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-forsythia via-saffron to-emerald-400 z-50 origin-left shadow-[0_0_12px_rgba(255,200,1,0.8)]"
        style={{ scaleX }}
      />

      {/* Ambient Moving Glow Spheres */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-forsythia/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] bg-saffron/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-[90px]" />
      </div>

      <div className="relative z-10">
        <Navbar onSignIn={onSignIn} onLaunch={onLaunch} />

        <main className="space-y-4">
          <HeroSection onLaunch={onLaunch} onWatchDemo={() => setShowDemoModal(true)} />
          <TrustMarquee />
          <ArchitectureSection />
          <DatasetsSection />
          <WorkflowCanvas onLaunch={onLaunch} />
          <PlatformPrimitives />
          <div id="metrics">
            <ScaleMetrics />
          </div>
          <ConversionBanner onLaunch={onLaunch} />
        </main>

        <Footer />
      </div>

      {/* Interactive Platform Walkthrough Demo Modal */}
      <DemoVideoModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        onLaunch={onLaunch}
      />
    </div>
  );
}

