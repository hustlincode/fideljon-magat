import React from "react";
import Hero from "./Hero";
import Intro from "./Intro";
import Projects from "../Projects/Projects";
import Skills from "../About/Skills";
import ContactForm from "./ContactForm";

function Home() {
  return (
    <main>
      <Hero />
      <Intro />
      <Projects />
      <Skills />
      <ContactForm />
    </main>
  );
}

export default Home;
