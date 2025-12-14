import React, { useState, useRef, useCallback, useMemo } from 'react';
import Card from '../../components/Card/Card';
import Step from '../../components/StepCard/Step';
import FAQSection from '../../components/Questions/FAQSection';
import CONSTANTS from '../../constants';
import styles from './HowItWorks.module.sass';

const {
  faqData,
  STATIC_IMAGES_PATH,
  tabsData,
  servicesData,
  stepsData,
  categoryData,
} = CONSTANTS;

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('Launching A Contest');
  const [openIndexes, setOpenIndexes] = useState([]);

  const launchingRef = useRef(null);
  const marketplaceRef = useRef(null);
  const managedRef = useRef(null);
  const creativesRef = useRef(null);

  const tabRefs = useMemo(
    () => ({
      launchingRef,
      marketplaceRef,
      managedRef,
      creativesRef,
    }),
    []
  );

  const tabs = useMemo(
    () =>
      tabsData.map((tab) => ({
        ...tab,
        ref: tabRefs[tab.refKey],
      })),
    [tabsData, tabRefs]
  );

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

  const tabHandlers = useMemo(() => {
    const handlers = {};
    tabs.forEach((tab) => {
      handlers[tab.name] = () => handleTabClick(tab);
    });
    return handlers;
  }, [tabs, handleTabClick]);

  const getCategoryClickHandler = useCallback(
    (category) => () => {
      console.log('Category clicked:', category);
    },
    []
  );

  return (
    <div className={styles.howItWorks}>
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
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className={styles.videoIframe}
          ></iframe>
        </div>
      </header>

      <section className={styles.services}>
        <div className={styles.sectionHeader}>
          <span className={styles.subtitle}>Our Services</span>
          <h2>3 Ways To Use Atom</h2>
          <p>Atom offers 3 ways to get you a perfect name for your business.</p>
        </div>
        <div className={styles.cards}>
          {servicesData.map((service, index) => (
            <Card
              key={index}
              image={service.image}
              title={service.title}
              description={service.description}
              buttonText={service.buttonText}
              onClick={tabHandlers[tabsData[service.tabIndex].name]}
            />
          ))}
        </div>
      </section>

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
          {stepsData.map((stepText, index) => (
            <Step key={index} stepNumber={index + 1}>
              {stepText}
            </Step>
          ))}
        </div>
      </section>

      <section className={styles.faq}>
        <div className={styles.faqHeader}>
          <h2>Frequently Asked Questions</h2>
          <nav>
            <ul>
              {tabs.map((tab) => (
                <li
                  key={tab.name}
                  onClick={tabHandlers[tab.name]}
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

      <section className={styles.search}>
        <div className={styles.searchInput}>
          <input placeholder="Search Over 300,000+ Premium Names" />
          <button>
            <img src={`${STATIC_IMAGES_PATH}searchIcon.png`} alt="search" />
          </button>
        </div>
        <div className={styles.category}>
          <ul>
            {categoryData.map((category) => (
              <li key={category} onClick={getCategoryClickHandler(category)}>
                {category}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.line}></div>
      </section>
    </div>
  );
};

export default HowItWorks;
