import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9000/api', // All requests will go to our API Gateway
});

export default api;