import React, { useState, useRef, useCallback } from 'react';
import Card from '../../components/Card/Card';
import Step from '../../components/StepCard/Step';
import FAQSection from '../../components/Questions/FAQSection';
import CONSTANTS from '../../constants';
import styles from './HowItWorks.module.sass';

const { faqData, STATIC_IMAGES_PATH } = CONSTANTS;

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('Launching A Contest');
  const [openIndexes, setOpenIndexes] = useState([]);

  const launchingRef = useRef(null);
  const marketplaceRef = useRef(null);
  const managedRef = useRef(null);
  const creativesRef = useRef(null);

  const tabs = [
    { name: 'Launching A Contest', ref: launchingRef },
    { name: 'Buying From Marketplace', ref: marketplaceRef },
    { name: 'Managed Contests', ref: managedRef },
    { name: 'For Creatives', ref: creativesRef },
  ];

  const smoothScrollTo = useCallback((targetY, duration = 800) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    let startTime = null;

    function animation(currentTime) {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = -(Math.cos(Math.PI * progress) - 1) / 2;
      window.scrollTo(0, startY + distance * ease);

      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
  }, []);

  const toggleQuestion = useCallback((index) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }, []);

  const handleTabClick = useCallback(
    (tab) => {
      setActiveTab(tab.name);
      if (tab.ref.current) {
        const offset = 50;
        const top = tab.ref.current.offsetTop - offset;
        smoothScrollTo(top, 800);
      }
    },
    [smoothScrollTo]
  );

  return (
    <div className={styles.howItWorks}>
      {/* Hero Section */}
      <header className={styles.hero}>
        <div>
          <span className={styles.subtitle}>World's #1 Naming Platform</span>
          <h1>How Does SquadHelp Work?</h1>
          <p>
            Atom helps you come up with a great name for your business by
            combining the power of crowdsourcing with sophisticated technology
            and Agency-level validation services.
          </p>
        </div>
        <div className={styles.videoWrapper}>
          <iframe
            src="https://www.youtube.com/embed/33Fk6QocUEk?&mute=1&loop=1&playlist=33Fk6QocUEk"
            title="How Does Squadhelp Work Video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className={styles.videoIframe}
          ></iframe>
        </div>
      </header>

      {/* Services Section */}
      <section className={styles.services}>
        <div className={styles.sectionHeader}>
          <span className={styles.subtitle}>Our Services</span>
          <h2>3 Ways To Use Atom</h2>
          <p>Atom offers 3 ways to get you a perfect name for your business.</p>
        </div>
        <div className={styles.cards}>
          <Card
            image="light.svg"
            title="Launch a Contest"
            description="Work with hundreds of creative experts to get custom name suggestions for your business or brand. All names are auto-checked for URL availability."
            buttonText="Launch a Contest"
            onClick={() => handleTabClick(tabs[0])}
          />
          <Card
            image="tv.svg"
            title="Explore Names For Sale"
            description="Our branding team has curated thousands of pre-made names that you can purchase instantly. All names include a matching URL and a complimentary Logo Design"
            buttonText="Explore Names For Sale"
            onClick={() => handleTabClick(tabs[1])}
          />
          <Card
            image="lamp.svg"
            title="Agency-level Managed Contests"
            description="Our Managed contests combine the power of crowdsourcing with the rich experience of our branding consultants. Get a complete agency-level experience at a fraction of Agency costs"
            buttonText="Learn More"
            onClick={() => handleTabClick(tabs[2])}
          />
        </div>
      </section>

      {/* Steps Section */}
      <section className={styles.steps}>
        <div className={styles.stepsHeader}>
          <span>
            <img
              className={styles.cup}
              src={`${STATIC_IMAGES_PATH}star.svg`}
              alt="cup"
            />
          </span>
          <h2>How Do Naming Contests Work?</h2>
        </div>
        <div className={styles.list}>
          <Step stepNumber={1}>
            Fill out your Naming Brief and begin receiving name ideas in minutes
          </Step>
          <Step stepNumber={2}>
            Rate the submissions and provide feedback to creatives. Creatives
            submit even more names based on your feedback.
          </Step>
          <Step stepNumber={3}>
            Our team helps you test your favorite names with your target
            audience. We also assist with Trademark screening.
          </Step>
          <Step stepNumber={4}>
            Pick a Winner. The winner gets paid for their submission.
          </Step>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faq}>
        <div className={styles.faqHeader}>
          <h2>Frequently Asked Questions</h2>
          <nav>
            <ul>
              {tabs.map((tab) => (
                <li
                  key={tab.name}
                  onClick={() => handleTabClick(tab)}
                  className={
                    activeTab === tab.name ? styles.activeTab : styles.tabItem
                  }
                >
                  {tab.name}
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {Object.entries(faqData).map(([sectionKey, items]) => {
          const tab = tabs.find((t) =>
            t.name.toLowerCase().includes(sectionKey)
          );
          return (
            <FAQSection
              key={sectionKey}
              tab={tab}
              items={items}
              openIndexes={openIndexes}
              toggleQuestion={toggleQuestion}
            />
          );
        })}
      </section>

      {/* Search Section */}
      <section className={styles.search}>
        <div className={styles.searchInput}>
          <input placeholder="Search Over 300,000+ Premium Names" />
          <button>
            <img src={`${STATIC_IMAGES_PATH}searchIcon.png`} alt="search" />
          </button>
        </div>
        <div className={styles.category}>
          <ul>
            <li>Tech</li>
            <li>Clothing</li>
            <li>Finance</li>
            <li>Real Estate</li>
            <li>Crypto</li>
            <li>Short</li>
            <li>One Word</li>
          </ul>
        </div>
        <div className={styles.line}></div>
      </section>
    </div>
  );
};

export default HowItWorks;