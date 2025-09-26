import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import RegistrationFooter from '../../components/Layout/RegistrationFooter';
import AuthHeader from '../../components/Layout/AuthHeader';
import styles from './Layout.module.sass';

const Layout = (props) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isRegisterPathname = pathname === '/registration';
  const isAuthPathname = pathname === '/login' || isRegisterPathname;

  return (
    <div className={styles.container}>
      {isAuthPathname && <AuthHeader />}
      {!isAuthPathname && <Header />}
      <div className={styles.content}>
        <Outlet />
      </div>
      {!isAuthPathname && <Footer navigate={navigate}/>}
      {isRegisterPathname && <RegistrationFooter />}
    </div>
  );
};

export default Layout;
