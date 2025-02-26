import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api/v1',
});

export default axiosInstance;
