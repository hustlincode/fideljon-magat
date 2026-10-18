import React from "react";
import Hero from "./Hero";
import Stats from "./Stats";
import Intro from "./Intro";
import Projects from "../Projects/Projects";
import Skills from "../About/Skills";
import ContactForm from "./ContactForm";
import MessageCard from "../ui/MessageCard";

function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <div className="container-x message-slot">
        <MessageCard
          tone="accent"
          icon="dot"
          title="Open to opportunities"
          support="Full-time or freelance — Angeles City, PH · remote-friendly · replies within a day."
          cta="Start a conversation"
          href="/#contact"
          kind="hash"
        />
      </div>
      <Intro />
      <Projects />
      <div className="container-x message-slot">
        <MessageCard
          tone="green"
          icon="briefcase"
          title="Building hospitality systems at Servo IT Solutions OPC"
          support="Turning manual workflows into shipped platforms since 2024."
          cta="View résumé"
          href="/resume"
          kind="route"
        />
      </div>
      <Skills />
      <ContactForm />
    </main>
  );
}

export default Home;
