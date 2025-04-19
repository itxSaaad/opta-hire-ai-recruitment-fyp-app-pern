import { axiosBaseQuery } from './axiosBaseQuery';
import { logoutUser, updateAccessToken } from '../features/auth/authSlice';

const baseQuery = axiosBaseQuery();

const axiosBaseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (
      args.url === '/auth/refresh-token' &&
      args.method?.toLowerCase() === 'post'
    ) {
      api.dispatch(logoutUser());
      return result;
    }

    const refreshResult = await baseQuery(
      { url: '/auth/refresh-token', method: 'post' },
      api,
      extraOptions
    );

    if (refreshResult.data?.accessToken) {
      api.dispatch(updateAccessToken(refreshResult.data.accessToken));

      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logoutUser());
    }
  }

  return result;
};

export default axiosBaseQueryWithReauth;
