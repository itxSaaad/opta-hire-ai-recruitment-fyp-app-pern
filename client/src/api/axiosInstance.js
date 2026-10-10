import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
