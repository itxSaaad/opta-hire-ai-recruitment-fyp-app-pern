import { axiosBaseQuery } from './axiosBaseQuery';

const baseQuery = axiosBaseQuery({
  baseUrl: import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api/v1',
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt to refresh the token
    const refreshResult = await baseQuery(
      { url: '/auth/refresh-token', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Extract new access token
      const newAccessToken = refreshResult.data.accessToken;

      // Dispatch Redux action to update the token
      //   api.dispatch(updateAccessToken(newAccessToken));
      localStorage.setItem('accessToken', newAccessToken);

      // Retry the original request with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // If refresh fails, log out the user
      //   api.dispatch(logoutUser());
    }
  }

  return result;
};
