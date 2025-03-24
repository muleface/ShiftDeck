import api from './APIClient.tsx'
import {Station} from './Models.tsx'

const BASE_URL = '/Stations';

const stationService = {
    getAllStations: async(): Promise<Station[]> => {
        const response = await api.get<Station[]>(`${BASE_URL}`);
        return response.data;
    },
    getStationByName: async(name:string): Promise<Station> => {
        const response = await api.get<Station>(`${BASE_URL}/GetStationByName/${name}`);
        return response.data;
    },
    getStationByNum: async(num:number): Promise<Station> => {
        const response = await api.get<Station>(`${BASE_URL}/GetStationByNum/${num}`);
        return response.data;
    },
    addStation: async(name:string): Promise<Station> => {
        const response = await api.post<Station>(`${BASE_URL}`, name);
        return response.data;
    },
    deleteStation: async(name:string): Promise<Station> => {
        const response = await api.delete<Station>(`${BASE_URL}/${name}`);
        return response.data;
    }
}

 export default stationService;