import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSequence from "@/components/hero/HeroSequence";
import LineUp from "@/sections/LineUp";
import Configurator from "@/sections/Configurator";
import Overview from "@/sections/Overview";
import StatStrip from "@/sections/StatStrip";
import Sear from "@/sections/Sear";
import Craft from "@/sections/Craft";
import TheCut from "@/sections/TheCut";
import Story from "@/sections/Story";
import Reservation from "@/sections/Reservation";

export default function Home() {
  return (
    <main className="bg-bg text-text">
      <Header />
      <HeroSequence />
      <LineUp />
      <Configurator />
      <Overview />
      <StatStrip />
      <Sear />
      <Craft />
      <TheCut />
      <Story />
      <Reservation />
      <Footer />
    </main>
  );
}
