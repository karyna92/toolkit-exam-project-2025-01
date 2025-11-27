import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Spinner from '../../Spinner/Spinner';

const PrivateRoute = () => {
  const userState = useSelector((state) => state.userStore);

  if (userState.isFetching && !userState.data) {
    return <Spinner />;
  }

  return userState.data ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
