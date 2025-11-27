import React from 'react';
import LoginForm from '../../components/LoginForm/LoginForm';
import styles from './LoginPage.module.sass';

const LoginPage = (props) => {


  return (
    <div className={styles.mainContainer}>
      <div className={styles.loginContainer}>
        <div className={styles.loginFormContainer}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
