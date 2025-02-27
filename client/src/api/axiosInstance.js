import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL
    ? `${import.meta.env.VITE_SERVER_URL}/api/v1`
    : 'http://localhost:5000/api/v1',
  withCredentials: true,
});

export default axiosInstance;
