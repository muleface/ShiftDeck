import api from './APIClient.tsx'
import {StationRole, createStationRole} from './Models.tsx'

const BASE_URL = '/StationRoles';

const stationRoleService = {
    getAllRoles: async(): Promise<StationRole[]> => {
        const response = await api.get<StationRole[]>(`${BASE_URL}/GetAllRoles`);
        return response.data;
    },
    getRolesByInternId: async(id:number): Promise<StationRole[]> => {
        const response = await api.get<StationRole[]>(`${BASE_URL}/RolesByInternId/${id}`);
        return response.data;
    },
    getRolesByFullName: async(firstName:string, lastName:string): Promise<StationRole[]> => {
        const response = await api.get<StationRole[]>(`${BASE_URL}/RolesByFullName?firstName=${firstName}&lastName=${lastName}`);
        return response.data;
    },
    getRolesByStationNum: async(num:number): Promise<StationRole[]> => {
        const response = await api.get<StationRole[]>(`${BASE_URL}/RolesByStationNum/${num}`);
        return response.data;
    },
    getRolesByStationName: async(name:string): Promise<StationRole[]> => {
        const response = await api.get<StationRole[]>(`${BASE_URL}/GetRolesByStationName/${name}`);
        return response.data;
    },
    addStationRole: async(stationNum:number, internId:number, role:number): Promise<StationRole> => {
        const newRole:StationRole = createStationRole(stationNum, internId, role);
        const response = await api.post<StationRole>(`${BASE_URL}`, newRole);
        return response.data;
    }
}

export default stationRoleService;