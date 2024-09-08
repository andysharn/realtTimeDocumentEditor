import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

api.setToken = (token) => {
  if (token) {
    api.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete api.defaults.headers.common['x-auth-token'];
  }
};

export default api;