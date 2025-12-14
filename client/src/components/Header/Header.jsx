import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  loadEventsForUser,
  markAllOngoingEventsAsSeen,
  checkForOngoingEvents,
  cleanupSeenEvents,
} from '../../store/slices/eventsSlice';
import { clearUserStore, getUser } from '../../store/slices/userSlice';
import CONSTANTS from '../../constants';
import styles from './Header.module.sass';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const data = useSelector((state) => state.userStore.data);
  const isFetching = useSelector((state) => state.userStore.isFetching);
  const ongoingEvents = useSelector(
    (state) => state.events?.ongoingEvents || []
  );
  const seenEventIds = useSelector((state) => state.events?.seenEventIds || []);

  const [unseenEventsCount, setUnseenEventsCount] = useState(0);

  const userInfo = useMemo(() => {
    if (!data) return null;
    return {
      isModerator: data.role === 'moderator',
      isCustomer: data.role === 'customer',
      displayName: data.displayName,
      avatar:
        data.avatar === 'anon.png'
          ? CONSTANTS.ANONYM_IMAGE_PATH
          : `${CONSTANTS.FILE_BASE_URL}/${data.avatar}`,
      id: data.id,
      role: data.role,
    };
  }, [data]);

  useEffect(() => {
    if (!data) {
      dispatch(getUser());
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (userInfo?.id) {
      dispatch(loadEventsForUser(userInfo.id));
    }
  }, [userInfo?.id, dispatch]);

  useEffect(() => {
    if (!userInfo?.id) return;

    const interval = setInterval(() => {
      dispatch(checkForOngoingEvents());
      dispatch(cleanupSeenEvents());
    }, 30000);

    return () => clearInterval(interval);
  }, [userInfo?.id, dispatch]);

  useEffect(() => {
    const calculateUnseenEvents = () => {
      const now = Date.now();
      const validEvents = ongoingEvents.filter((event) => {
        const eventTime = new Date(event.dateTime).getTime();
        return now - eventTime < 24 * 60 * 60 * 1000;
      });

      const unseenEvents = validEvents.filter(
        (event) => !seenEventIds.includes(event.id)
      );
      return unseenEvents.length;
    };

    const newUnseenCount = calculateUnseenEvents();
    if (newUnseenCount !== unseenEventsCount) {
      setUnseenEventsCount(newUnseenCount);
    }
  }, [ongoingEvents, seenEventIds]);

  const handleEventsClick = () => {
    if (unseenEventsCount > 0) {
      dispatch(markAllOngoingEventsAsSeen());
    }
    navigate('/events');
  };

  const logOut = () => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key.startsWith('eventsState_')) {
        localStorage.removeItem(key);
      }
    }

    dispatch(clearUserStore());
    navigate('/login', { replace: true });
  };

  const startContests = () => {
    navigate('/startContest');
  };

  const renderLoginButtons = () => {
    if (!data) {
      return (
        <>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <span className={styles.btn}>LOGIN</span>
          </Link>
          <Link to="/registration" style={{ textDecoration: 'none' }}>
            <span className={styles.btn}>SIGN UP</span>
          </Link>
        </>
      );
    }

    return (
      <>
        <div className={styles.userInfo}>
          <img src={userInfo.avatar} alt="user" />
          <span>{`Hi, ${userInfo.displayName}`}</span>
          <img
            src={`${CONSTANTS.STATIC_IMAGES_PATH}menu-down.png`}
            alt="menu"
          />

          {unseenEventsCount > 0 && userInfo.isCustomer && (
            <div className={styles.notificationDot}></div>
          )}

          <ul>
            {userInfo.isModerator ? (
              // Moderator menu - simplified
              <>
                <li>
                  <Link to="/offers" style={{ textDecoration: 'none' }}>
                    <span>Offers</span>
                  </Link>
                </li>
                <li>
                  <Link to="/account" style={{ textDecoration: 'none' }}>
                    <span>My Account</span>
                  </Link>
                </li>
                <li>
                  <span onClick={logOut}>Logout</span>
                </li>
              </>
            ) : (
              // Non-moderator menu (customer, etc.)
              <>
                <li>
                  <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                    <span>View Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link to="/account" style={{ textDecoration: 'none' }}>
                    <span>My Account</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="http://www.google.com"
                    style={{ textDecoration: 'none' }}
                  >
                    <span>Messages</span>
                  </Link>
                </li>
                {userInfo.isCustomer && (
                  <li>
                    <div className={styles.events} onClick={handleEventsClick}>
                      <span>Events</span>
                      {unseenEventsCount > 0 && (
                        <div className={styles.eventsBadge}>
                          <span>{unseenEventsCount}</span>
                        </div>
                      )}
                    </div>
                  </li>
                )}
                <li>
                  <Link
                    to="http://www.google.com"
                    style={{ textDecoration: 'none' }}
                  >
                    <span>Affiliate Dashboard</span>
                  </Link>
                </li>
                <li>
                  <span onClick={logOut}>Logout</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {!userInfo.isModerator && (
          <img
            src={`${CONSTANTS.STATIC_IMAGES_PATH}email.png`}
            className={styles.emailIcon}
            alt="email"
          />
        )}
      </>
    );
  };

  const renderNavContainer = () => {
    // Don't show navigation container to moderators
    if (userInfo?.isModerator) {
      return null;
    }

    return (
      <div className={styles.navContainer}>
        <Link to="/">
          <img
            src={`${CONSTANTS.STATIC_IMAGES_PATH}blue-logo.png`}
            className={styles.logo}
            alt="blue_logo"
          />
        </Link>
        <div className={styles.leftNav}>
          <div className={styles.nav}>
            <ul>
              <li>
                <span>NAME IDEAS</span>
                <img
                  src={`${CONSTANTS.STATIC_IMAGES_PATH}menu-down.png`}
                  alt="menu"
                />
                <ul>
                  <li>
                    <a href="http://www.google.com">Beauty</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">Consulting</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">E-Commerce</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">Fashion & Clothing</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">Finance</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">Real Estate</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">Tech</a>
                  </li>
                  <li className={styles.last}>
                    <a href="http://www.google.com">More Categories</a>
                  </li>
                </ul>
              </li>
              <li>
                <span>CONTESTS</span>
                <img
                  src={`${CONSTANTS.STATIC_IMAGES_PATH}menu-down.png`}
                  alt="menu"
                />
                <ul>
                  <li>
                    <Link to="/information"> HOW IT WORKS</Link>
                  </li>
                  <li>
                    <a href="http://www.google.com">PRICING</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">AGENCY SERVICE</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">ACTIVE CONTESTS</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">WINNERS</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">LEADERBOARD</a>
                  </li>
                  <li className={styles.last}>
                    <a href="http://www.google.com">BECOME A CREATIVE</a>
                  </li>
                </ul>
              </li>
              <li>
                <span>Our Work</span>
                <img
                  src={`${CONSTANTS.STATIC_IMAGES_PATH}menu-down.png`}
                  alt="menu"
                />
                <ul>
                  <li>
                    <a href="http://www.google.com">NAMES</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">TAGLINES</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">LOGOS</a>
                  </li>
                  <li className={styles.last}>
                    <a href="http://www.google.com">TESTIMONIALS</a>
                  </li>
                </ul>
              </li>
              <li>
                <span>Names For Sale</span>
                <img
                  src={`${CONSTANTS.STATIC_IMAGES_PATH}menu-down.png`}
                  alt="menu"
                />
                <ul>
                  <li>
                    <a href="http://www.google.com">POPULAR NAMES</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">SHORT NAMES</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">INTRIGUING NAMES</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">NAMES BY CATEGORY</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">VISUAL NAME SEARCH</a>
                  </li>
                  <li className={styles.last}>
                    <a href="http://www.google.com">SELL YOUR DOMAINS</a>
                  </li>
                </ul>
              </li>
              <li>
                <span>Blog</span>
                <img
                  src={`${CONSTANTS.STATIC_IMAGES_PATH}menu-down.png`}
                  alt="menu"
                />
                <ul>
                  <li>
                    <a href="http://www.google.com">ULTIMATE NAMING GUIDE</a>
                  </li>
                  <li>
                    <a href="http://www.google.com">
                      POETIC DEVICES IN BUSINESS NAMING
                    </a>
                  </li>
                  <li>
                    <a href="http://www.google.com">CROWDED BAR THEORY</a>
                  </li>
                  <li className={styles.last}>
                    <a href="http://www.google.com">ALL ARTICLES</a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          {userInfo?.isCustomer && (
            <div className={styles.startContestBtn} onClick={startContests}>
              START CONTEST
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHeaderForModerator = () => (
    <div className={styles.headerContainer}>
      <div className={styles.loginSignnUpHeaders}>
          <img
            src={`${CONSTANTS.STATIC_IMAGES_PATH}blue-logo.png`}
            className={styles.logo}
            alt="blue_logo"
          />
        <div className={styles.userButtonsContainer}>
          {renderLoginButtons()}
        </div>
      </div>
    </div>
  );

  const renderHeaderForNonModerator = () => (
    <div className={styles.headerContainer}>
      <div className={styles.fixedHeader}>
        <span className={styles.info}>
          Squadhelp recognized as one of the Most Innovative Companies by Inc
          Magazine.
        </span>
        <a href="http://www.google.com">Read Announcement</a>
      </div>

      <div className={styles.loginSignnUpHeaders}>
        <div className={styles.numberContainer}>
          <img src={`${CONSTANTS.STATIC_IMAGES_PATH}phone.png`} alt="phone" />
          <span>(877)&nbsp;355-3585</span>
        </div>
        <div className={styles.userButtonsContainer}>
          {renderLoginButtons()}
        </div>
      </div>

      {renderNavContainer()}
    </div>
  );

  if (isFetching) {
    return null;
  }

  return userInfo?.isModerator
    ? renderHeaderForModerator()
    : renderHeaderForNonModerator();
};

export default Header;
