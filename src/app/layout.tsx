import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import Spotlight from "@/components/Spotlight";
import SceneMount from "@/components/SceneMount";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "Ben Sicat, AI Engineer",
  description:
    "AI engineer in Manila building 3D dental AI, private office LLMs and real-time recommendation systems.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${bricolage.variable}`}>
      <body className="min-h-full">
        <SmoothScroll />
        <Spotlight />
        <SceneMount />
        {children}
      </body>
    </html>
  );
}
