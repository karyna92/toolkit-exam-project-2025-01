import React, { useState, useRef } from 'react';
import CONSTANTS from '../../constants';
import styles from './HowItWorks.module.sass';

const { faqData } = CONSTANTS;

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

  function smoothScrollTo(targetY, duration = 800) {
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
  }

  const toggleQuestion = (index) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    if (tab.ref.current) {
      const offset = 50;
      const top = tab.ref.current.offsetTop - offset;
      smoothScrollTo(top, 800);
    }
  };
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
            allow="autoplay; encrypted-media"
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
          <div className={styles.card}>
            <div>
              <span>
                <img
                  src={`${CONSTANTS.STATIC_IMAGES_PATH}light.svg`}
                  alt="lightning"
                />
              </span>
              <h4>Launch a Contest</h4>
              <p>
                Work with hundreds of creative experts to get custom name
                suggestions for your business or brand. All names are
                auto-checked for URL availability.
              </p>
            </div>
            <div>
              <button>
                <span>Launch a Contest</span>
                <span className={styles.cardButtonArrow}>→</span>
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div>
              <span>
                <img src={`${CONSTANTS.STATIC_IMAGES_PATH}tv.svg`} alt="tv" />
              </span>
              <h4>Explore Names For Sale</h4>
              <p>
                Our branding team has curated thousands of pre-made names that
                you can purchase instantly. All names include a matching URL and
                a complimentary Logo Design
              </p>
            </div>
            <div>
              <button>
                <span>Explore Names For Sale</span>
                <span className={styles.cardButtonArrow}>→</span>
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div>
              <span>
                <img
                  src={`${CONSTANTS.STATIC_IMAGES_PATH}lamp.svg`}
                  alt="lamp"
                />
              </span>
              <h4>Agency-level Managed Contests</h4>
              <p>
                Our Managed contests combine the power of crowdsourcing with the
                rich experience of our branding consultants. Get a complete
                agency-level experience at a fraction of Agency costs
              </p>
            </div>
            <div>
              <button>
                <span>Learn More</span>
                <span className={styles.cardButtonArrow}>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.steps}>
        <div className={styles.stepsHeader}>
          <span>
            <img
              className={styles.cup}
              src={`${CONSTANTS.STATIC_IMAGES_PATH}star.svg`}
              alt="cup"
            />
          </span>
          <h2>How Do Naming Contests Work?</h2>
        </div>
        <div className={styles.list}>
          <div className={styles.step}>
            <span className={styles.stepTitle}>Step 1</span>
            <p>
              Fill out your Naming Brief and begin receiving name ideas in
              minutes
            </p>
            <span className={styles.stepsArrow}>→</span>
          </div>
          <div className={styles.step}>
            <span className={styles.stepTitle}>Step 2</span>
            <p>
              Rate the submissions and provide feedback to creatives. Creatives
              submit even more names based on your feedback.
            </p>
            <span className={styles.stepsArrow}>→</span>
          </div>
          <div className={styles.step}>
            <span className={styles.stepTitle}>Step 3</span>
            <p>
              Our team helps you test your favorite names with your target
              audience. We also assist with Trademark screening.
            </p>
            <span className={styles.stepsArrow}>→</span>
          </div>
          <div className={styles.step}>
            <span className={styles.stepTitle}>Step 4</span>
            <p>Pick a Winner. The winner gets paid for their submission.</p>
          </div>
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
                  onClick={() => handleTabClick(tab)}
                  className={activeTab === tab.name ? styles.activeTab : ''}
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
            <div className={styles.faqSection} ref={tab?.ref} key={sectionKey}>
              <h2>{tab?.name || sectionKey}</h2>
              {items.map((item, index) => {
                const globalIndex = `${sectionKey}-${index}`;
                const isOpen = openIndexes.includes(globalIndex);
                return (
                  <div key={globalIndex}>
                    <div
                      className={`${styles.questionItem} ${
                        isOpen ? styles.open : ''
                      }`}
                      onClick={() => toggleQuestion(globalIndex)}
                    >
                      <div
                        className={`${styles.question} ${
                          isOpen ? styles.open : ''
                        }`}
                      >
                        <p>{item.question}</p>
                        <span>{isOpen ? '×' : '+'}</span>
                      </div>
                      <div
                        className={`${styles.answerWrapper} ${
                          isOpen ? styles.open : ''
                        }`}
                      >
                        <article
                          className={`${styles.answer} ${
                            isOpen ? styles.open : ''
                          }`}
                        >
                          {item.answer}
                        </article>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>
      <section className={styles.search}>
        <div className={styles.searchInput}>
          <input placeholder="Search Over 300,000+ Premium Names"></input>
          <button>
            <img
              src={`${CONSTANTS.STATIC_IMAGES_PATH}searchIcon.png`}
              alt="search"
            />
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
