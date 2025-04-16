import api from './APIClient.tsx';
import axios from 'axios';

export const register = async (username: string, password: string, internId: number) => {
    const response = await api.post('/auth/register', {
      userName: username,
      password: password,
      internId: internId
    });
  
    return response.data; // might just be a string like "User registered successfully"
  };

export const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', {
        userName: username,
        password: password
    });

    return response.data.token;
};
