import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
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
  const hasSeenOngoingEvents = useSelector(
    (state) => state.events?.hasSeenOngoingEvents
  );

  useEffect(() => {
    if (!data) {
      dispatch(getUser());
    }
  }, [data, dispatch]);

  const logOut = () => {
    localStorage.clear();
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

    const isModerator = data.role === 'moderator';
    const isCustomer = data.role === 'customer';

    return (
      <>
        <div className={styles.userInfo}>
          <img
            src={
              data.avatar === 'anon.png'
                ? CONSTANTS.ANONYM_IMAGE_PATH
                : `${CONSTANTS.publicURL}${data.avatar}`
            }
            alt="user"
          />
          <span>{`Hi, ${data.displayName}`}</span>
          <img
            src={`${CONSTANTS.STATIC_IMAGES_PATH}menu-down.png`}
            alt="menu"
          />
          {ongoingEvents.length > 0 && !hasSeenOngoingEvents && (
            <div className={styles.notificationDot}></div>
          )}

          <ul>
            {isModerator ? (
              <>
                <li>
                  <Link to="/offers" style={{ textDecoration: 'none' }}>
                    <span>Offers</span>
                  </Link>
                </li>
                <li>
                  <span onClick={logOut}>Logout</span>
                </li>
              </>
            ) : (
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
                {isCustomer && (
                  <li>
                    <Link to="/events" style={{ textDecoration: 'none' }}>
                      <div className={styles.events}>
                        <span>Events</span>
                        {ongoingEvents.length > 0 && (
                          <p>{ongoingEvents.length}</p>
                        )}
                      </div>
                    </Link>
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

        <img
          src={`${CONSTANTS.STATIC_IMAGES_PATH}email.png`}
          className={styles.emailIcon}
          alt="email"
        />
      </>
    );
  };

  if (isFetching) {
    return null;
  }

  return (
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

      <div className={styles.navContainer}>
        <img
          src={`${CONSTANTS.STATIC_IMAGES_PATH}blue-logo.png`}
          className={styles.logo}
          alt="blue_logo"
        />
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

          {data && data.role === CONSTANTS.CUSTOMER && (
            <div className={styles.startContestBtn} onClick={startContests}>
              START CONTEST
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
