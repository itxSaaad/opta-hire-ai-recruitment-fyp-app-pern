import { axiosBaseQuery } from './axiosBaseQuery';
import { updateAccessToken, logoutUser } from '../features/user/userSlice';

const baseQuery = axiosBaseQuery({
  baseUrl: import.meta.env.VITE_SERVER_URL
    ? `${import.meta.env.VITE_SERVER_URL}/api/v1`
    : 'http://localhost:5000/api/v1',
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh-token', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const newAccessToken = refreshResult.data.accessToken;

      api.dispatch(updateAccessToken(newAccessToken));
      localStorage.setItem('accessToken', newAccessToken);

      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logoutUser());
    }
  }
  return result;
};
