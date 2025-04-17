import api from './APIClient.tsx'
import {JSConstraint} from './Models.tsx'

const BASE_URL = '/JSConstraints';

const JSConstraintService = {

    getAllConstraints: async():Promise<JSConstraint[]> => {
        const response = await api.get<JSConstraint[]>(`${BASE_URL}/GetAllConstraints`);
        return response.data;
    },

    getConstraintsByJuniorStation: async(stationNum:number):Promise<JSConstraint[]> => {
        const response = await api.get<JSConstraint[]>(`${BASE_URL}/GetByJuniorStation/${stationNum}`);
        return response.data;
    },

    getConstraintBySeniorStation: async(stationNum:number):Promise<JSConstraint[]> => {
        const response = await api.get<JSConstraint[]>(`${BASE_URL}/GetBySeniorStation/${stationNum}`);
        return response.data;
    }
}

export default JSConstraintService;

