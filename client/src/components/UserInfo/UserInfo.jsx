import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UpdateUserInfoForm from '../UpdateUserInfoForm/UpdateUserInfoForm';
import { updateUser } from '../../store/slices/userSlice';
import { changeEditModeOnUserProfile } from '../../store/slices/userProfileSlice';
import CONSTANTS from '../../constants';
import styles from './UserInfo.module.sass';

const UserInfo = () => {
  const dispatch = useDispatch();

  const data = useSelector((state) => state.userStore.data);
  const isEdit = useSelector((state) => state.userProfile.isEdit);

  const updateUserData = (values) => {
    const formData = new FormData();
    if (values.file) formData.append('file', values.file);
    formData.append('firstName', values.firstName);
    formData.append('lastName', values.lastName);
    formData.append('displayName', values.displayName);

    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    dispatch(updateUser(formData));
  };

  const changeEditMode = (value) =>
    dispatch(changeEditModeOnUserProfile(value));

  const { avatar, firstName, lastName, displayName, email, role, balance } =
    data;
  const avatarUrl = avatar
    ? `${CONSTANTS.publicURL}${avatar}`
    : CONSTANTS.ANONYM_IMAGE_PATH;

  return (
    <div className={styles.mainContainer}>
      {isEdit ? (
        <UpdateUserInfoForm onSubmit={updateUserData} />
      ) : (
        <div className={styles.infoContainer}>
          <img src={avatarUrl} className={styles.avatar} alt="user" />
          <div className={styles.infoContainer}>
            <div className={styles.infoBlock}>
              <span className={styles.label}>First Name</span>
              <span className={styles.info}>{firstName}</span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.label}>Last Name</span>
              <span className={styles.info}>{lastName}</span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.label}>Display Name</span>
              <span className={styles.info}>{displayName}</span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.label}>Email</span>
              <span className={styles.info}>{email}</span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.label}>Role</span>
              <span className={styles.info}>{role}</span>
            </div>
            {role === CONSTANTS.CREATOR && (
              <div className={styles.infoBlock}>
                <span className={styles.label}>Balance</span>
                <span className={styles.info}>{`${balance}$`}</span>
              </div>
            )}
          </div>
        </div>
      )}
      <div
        onClick={() => changeEditMode(!isEdit)}
        className={styles.buttonEdit}
      >
        {isEdit ? 'Cancel' : 'Edit'}
      </div>
    </div>
  );
};

export default UserInfo;
