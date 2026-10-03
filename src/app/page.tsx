import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Mpcam from "@/components/Mpcam";
import LocalLLM from "@/components/LocalLLM";
import ScanQc from "@/components/ScanQc";
import WorkGrid from "@/components/WorkGrid";
import EarlierWork from "@/components/EarlierWork";
import Experience from "@/components/Experience";
import StackMarquee from "@/components/StackMarquee";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Mpcam />
        <LocalLLM />
        <ScanQc />
        <WorkGrid />
        <EarlierWork />
        <Experience />
        <StackMarquee />
        <Contact />
      </main>
    </>
  );
}
