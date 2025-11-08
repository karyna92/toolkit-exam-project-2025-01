import http from '../interceptor';

///users
export const registerRequest = (data) => http.post('users/registration', data);
export const loginRequest = (data) => http.post('users/login', data);
export const getUser = () => http.get('users/user');
export const updateUser = (formData) => http.put('users/user', formData);
export const changeMark = (data) => http.put('users/user/offers/rating', data);

////payment
export const payment = (data) =>
  http.post('users/user/payments', data.formData);
export const cashOut = (data) => http.post('users/user/cashouts', data);

///contest
export const updateContest = (data) => http.put('contests/update', data);
export const dataForContest = (data) =>
  http.post('contests/dataForContest', data);
export const downloadContestFile = (data) =>
  http.get(`contests${data.contestId}/files/${data.fileName}`);
export const getContestById = ({ contestId }) =>
  http.get(`contests/${contestId}`);
export const getCustomersContests = ({ limit, offset, status}) =>
  http.get('contests/customer', {
    params: { limit, offset, status },
  });

export const getActiveContests = ({
  typeIndex,
  contestId,
  industry,
  awardSort,
  ownEntries,
  limit,
  offset,
  page,
}) =>
  http.get('contests', {
    params: {
      typeIndex,
      contestId,
      industry,
      awardSort,
      ownEntries,
      page,
      limit,
      offset,
    },
  });

////offers
export const getContestsWithOffers = ({ status, page  }) =>
  http.get('contests/offers', {
    params: { status, page },
  });
  
export const setNewOffer = (data) => http.post('contests/newOffer', data);
export const setOfferStatus = (data) =>
  http.post('contests/setOfferStatus', data);

///chat
export const getPreviewChat = () => http.get('chat/preview');
export const getDialog = ({ interlocutorId }) =>
  http.get('chat', {
    params: { interlocutorId },
  });
export const newMessage = (data) => http.post('chat/newMessage', data);
export const changeChatFavorite = (data) => http.put('chat/favorite', data);
export const changeChatBlock = (data) => http.put('chat/blackList', data);
export const getCatalogList = () => http.get('chat/catalogs');
export const addChatToCatalog = (data) => http.post('chat/newChat', data);
export const createCatalog = (data) => http.post('chat/createCatalog', data);
export const deleteCatalog = (data) =>
  http.delete('chat/deleteCatalog', { data });
export const removeChatFromCatalog = (data) =>
  http.put('chat/removeChatFromCatalog', data);
export const changeCatalogName = (data) =>
  http.put('chat/updateNameCatalog', data);
