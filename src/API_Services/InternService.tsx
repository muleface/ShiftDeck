import api from './APIClient.tsx'
import Intern from './Models.tsx'

const BASE_URL = '/interns';

const internService = {
    getAllInterns: async(): Promise<Intern[]> => {
        const response = await api.get<Intern[]>(`${BASE_URL}/GetAllInterns`);
        return response.data;
    },
    getInternById: async (id:number): Promise<Intern> => {
        const response = await api.get<Intern>(`${BASE_URL}/GetInternById/${id}`);
        return response.data;
    },
    getInternsByName: async(name:string): Promise<Intern[]> => { //returns all interns who fit for either first and / or last name.
        const response = await api.get<Intern[]>(`${BASE_URL}/GetInternByName/${name}`);
        return response.data;
    }
};

export default internService;