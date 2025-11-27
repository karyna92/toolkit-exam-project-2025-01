import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getUser } from '../../../store/slices/userSlice';
import Spinner from '../../Spinner/Spinner';

const OnlyNotAuthorizedUserRoute = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const userState = useSelector((state) => state.userStore);

  const initialCheckDone = useRef(false);
  const navigationHandled = useRef(false);

  const userData = userState.data;
  const isFetching = userState.isFetching;

  useEffect(() => {
    if (!initialCheckDone.current && !userData) {
      dispatch(getUser());
      initialCheckDone.current = true;
    }
  }, [dispatch, userData]);

  useEffect(() => {
    if (userData && !navigationHandled.current) {
      if (
        location.pathname === '/login' ||
        location.pathname === '/registration'
      ) {
        navigationHandled.current = true;

        if (userData.role === 'moderator') {
          navigate('/offers', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    }
  }, [userData, location.pathname, navigate]);

  useEffect(() => {
    navigationHandled.current = false;
  }, [userData]);

  if (isFetching && !userData) {
    return <Spinner />;
  }

  if (
    userData &&
    (location.pathname === '/login' || location.pathname === '/registration')
  ) {
    return <Spinner />;
  }

  return <Outlet />;
};

export default OnlyNotAuthorizedUserRoute;
