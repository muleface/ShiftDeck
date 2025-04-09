import api from './APIClient.tsx';
import {Login, createLogin} from './Models.tsx'
const BASE_URL = '/Login';

const loginService = {
  // Function to get all logins
  getAllLogins: async (): Promise<Login[]> => {
    const response = await api.get<Login[]>(`${BASE_URL}/getAllLogins`);
    return response.data;
  },

  // Function to get login by username
  getLoginByUserName: async (username: string): Promise<Login> => {
    const response = await api.get<Login>(`${BASE_URL}/getLoginsByUserName/${username}`);
    return response.data;
  },

  getLoginByData: async (username: string, userPassword: string): Promise<Login> => {
    const response = await api.post<Login>(
      `${BASE_URL}/login`, // new backend POST route
      { username, userPassword } // sent as JSON in body
    );
    return response.data;
  },

  // Function to get logins by intern ID
  getLoginsByInternId: async (id: number): Promise<Login[]> => {
    const response = await api.get<Login[]>(`${BASE_URL}/getLoginsByInternId/${id}`);
    return response.data;
  },

  // Function to add a login
  addLogin: async (login: Login): Promise<Login> => {
    const response = await api.post<Login>(`${BASE_URL}`, login);
    return response.data;
  },
  login: async (username: string, password: string): Promise<Login> => {
    const response = await api.post<Login>("/Login/login", {
      userName: username,
      userPassword: password
    });
    return response.data;
  },
};

export default loginService;
