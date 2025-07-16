import axios from 'axios';
import config from '../config';

const API_URL = config.API_URL;

const API = axios.create({
  baseURL: `${API_URL}/api`,
});

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);

