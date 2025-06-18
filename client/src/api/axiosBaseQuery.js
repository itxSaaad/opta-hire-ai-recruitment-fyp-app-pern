import axiosInstance from './axiosInstance';

export const axiosBaseQuery =
  () =>
  async ({ url, method, data, params, headers, ...rest }, { getState }) => {
    try {
      const accessToken = getState().auth.accessToken;

      const result = await axiosInstance({
        url,
        method,
        data,
        params,
        headers: {
          ...headers,
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
        ...rest,
      });

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
