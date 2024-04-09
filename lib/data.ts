import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import im from "@/public/1im.png";
import uwu from "@/public/uwu.png";
import mehkee from "@/public/mehkee.png";
// import wordanalyticsImg from "@/public/wordanalytics.png";

export const links = [
  {
    name: "Home",
    hash: "#home",
  },
  {
    name: "About",
    hash: "#about",
  },
  {
    name: "Projects",
    hash: "#projects",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
  {
    name: "Experience",
    hash: "#experience",
  },
  {
    name: "Contact",
    hash: "#contact",
  },
] as const;

export const experiencesData = [
  {
    title: "Software Developer",
    location: "Raya Solutions",
    description:
      "Worked on mobile apps using React Native that handles motor services, Web apps with React with Typescript, and handled most of the projects with Docker and Firebase",
    icon: React.createElement(CgWorkAlt),
    date: "September 2022 - December 2022",
  },
  {
    title: "Commissions",
    location: "Freelance",
    description:
    "Focused on taking on projects that allow me to explore new technologies such as TensorFlow and RapidMiner. I continue to create web apps in collaboration with friends, helping them gain exposure to real-world development",
    icon: React.createElement(CgWorkAlt),
    date: "Febuary 2022 - Jun 2023",
  },
  {
    title: "Full-Stack Developer / Data Analyst",
    location: "Coming soon",
    description:"Manifesting a new opportunity",
    icon: React.createElement(FaReact),
    date: "2021 - present",
  },
] as const;

export const projectsData = [
  {
    title: "Data Management System",
    description:
      "A rough mock up system of the DMS sine I have a NDA, where they can store the data of their senior citizens.",
    tags: ["React","Typescript", "CSS", "Firebase", "Prisma", "Git"],
    imageUrl: im,
    link:"https://brgy670.netlify.app/Home"
  },
  {
    title: "Brain and Brew",
    description:
      "A small business that I helped create a website for, where they can recieve and handle reservations",
    tags: ["Next","Typescript", "Tailwind", "Docker", "MUI", "Git", "Snowflake", "Flask", "RestAPI"],
    imageUrl: uwu,
    link:"https://github.com/Ben-Sicat/Study_hub"
  },
  {
    title: "Mehkee",
    description:
      "An Ecommerce Website commissioned by me that sells furniture. No longer up, Still have old version in repo.",
    tags: ["React","Javascript", "MUI", "RestAPI", "Git", "Snowflake", "Flask"],
    imageUrl: mehkee,
    link:"https://github.com/Ben-Sicat/adetFinals"
  },

  
  
] as const;

export const skillsData = [
  "JavaScript",
  "React",
  "React Native",
  "Python",
  "C++",
  "C#",
  "Git",
  "Rust",
  "TypeScript",
  "Tableau",
  "Power BI",
  "Flask",
  "Docker",
  "MySql",
  "Firebase",
  "Next.js",
  "Agile dev methodologies",
  "TensorFlow",
  "Pytorch",
] as const;
