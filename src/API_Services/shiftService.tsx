import api from './APIClient.tsx'
import {Shift, createShift} from './Models.tsx'

const BASE_URL = '/Shifts';

const shiftService = {
    getAllShifts: async(): Promise<Shift[]> => {
        const response = await api.get<Shift[]>(`${BASE_URL}/GetAllShifts`);
        return response.data;
    },
    getShiftById: async(id:number): Promise<Shift> => {
        const response = await api.get<Shift>(`${BASE_URL}/GetShiftById/${id}`);
        return response.data;
    },
    getShiftsByDate: async(date:Date): Promise<Shift[]> => {
        const response = await api.get<Shift[]>(`${BASE_URL}/GetShiftsByDate/${date}`);
        return response.data;
    },
    getShiftsByStationNum: async(stationNum:number): Promise<Shift[]> => {
        const response = await api.get<Shift[]>(`${BASE_URL}/GetShiftsByStationNum/${stationNum}`);
        return response.data;
    },
    getShiftsByInternName: async(name:string): Promise<Shift[]> => { //finds by either first or last name. don't use full name.
        const response = await api.get<Shift[]>(`${BASE_URL}/GetShiftsByInternName/${name}`);
        return response.data;
    },
    getShiftsByInternId: async(id:number): Promise<Shift[]> => {
        const response = await api.get<Shift[]>(`${BASE_URL}/GetShiftsByInternId/${id}`);
        return response.data;
    },
    addShift: async(newShift:Shift): Promise<Shift> => {
        const response = await api.post<Shift>(`${BASE_URL}`, newShift);
        return response.data;
    },
    changeShift: async(newIntern:number, oldShift:Shift): Promise<Shift> => { //consider what to do when full app context is at hand. should be able to just pass shiftId.
        const newShift = createShift(oldShift.id, newIntern, oldShift.shiftDate, oldShift.stationNum);
        const response = await api.put<Shift>(`${BASE_URL}/${newShift}`);
        return response.data;
    },
    deleteShift: async(id:number): Promise<Shift> => {
        const response = await api.delete<Shift>(`${BASE_URL}/${id}`);
        return response.data;
    }
}

export default shiftService;