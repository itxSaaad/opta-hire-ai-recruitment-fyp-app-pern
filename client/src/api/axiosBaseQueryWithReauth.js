import { logoutUser, updateAccessToken } from '../features/auth/authSlice';

import axiosBaseQuery from './axiosBaseQuery';

const baseQuery = axiosBaseQuery({
  baseUrl: import.meta.env.VITE_SERVER_URL
    ? `${import.meta.env.VITE_SERVER_URL}/api/v1`
    : 'http://localhost:5000/api/v1',
});

const axiosBaseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh-token', method: 'POST', withCredentials: true },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const newAccessToken = refreshResult.data.accessToken;

      api.dispatch(updateAccessToken(newAccessToken));

      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logoutUser());
    }
  }
  return result;
};

export default axiosBaseQueryWithReauth;
