import api from './APIClient.tsx'
import {Shift, createShift, fauxShift} from './Models.tsx'

const BASE_URL = '/Shifts';

interface BatchOperationResults {
    addedShifts: Shift[];
    deletedShifts: number[];
}

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
    addShift: async (newShift: fauxShift): Promise<Shift> => {
        const shiftDate = new Date(newShift.shiftDate);
        
        // Log the date in local time and UTC
        console.log("Original Shift Date (Local):", shiftDate); // Local time
        console.log("Shift Date in UTC (ISO):", shiftDate.toISOString()); // UTC time
      
        const formattedShift = {
          ...newShift,
          shiftDate: shiftDate.toISOString()  // Automatically handles UTC conversion
        };
        
        // Send the shift to the API
        const response = await api.post<Shift>(`${BASE_URL}`, formattedShift); 
        
        console.log("Shift sent to server:", formattedShift);  // Log what is being sent to the server
        return response.data;
    },
    changeShift: async(newIntern:number, oldShift:Shift): Promise<Shift> => { //consider what to do when full app context is at hand. should be able to just pass shiftId.
        const newShift = createShift(oldShift.id, newIntern, oldShift.shiftDate, oldShift.stationNum);
        const response = await api.put<Shift>(`${BASE_URL}`, newShift);
        return response.data;
    },
    deleteShift: async(id:number): Promise<Shift> => {
        const response = await api.delete<Shift>(`${BASE_URL}/${id}`);
        return response.data;
    },
    getShiftStats: async (): Promise<any> => {
        const response = await api.get(`${BASE_URL}/GetShiftStats`);
        return response.data;
    },
    processBatchOperations: async(shiftsToAdd: fauxShift[], shiftIdsToDelete: number[]): Promise<BatchOperationResults> => {
        const batchOperation = {
            shiftsToAdd: shiftsToAdd.map(shift => {
                // Create a copy of the shift with the date properly formatted
                const localShiftDate = new Date(shift.shiftDate);
                
                // Set to noon to prevent timezone shifts
                localShiftDate.setUTCHours(12, 0, 0, 0);
                
                // Create a new Date object for UTC conversion
                const utcShiftDate = new Date(localShiftDate.getTime() - localShiftDate.getTimezoneOffset() * 60000);
                
                // Return a properly formatted fauxShift
                return {
                    internId: shift.internId,
                    shiftDate: utcShiftDate.toISOString(),
                    stationNum: shift.stationNum
                };
            }),
            shiftIdsToDelete: shiftIdsToDelete
        };
    
        const response = await api.post<BatchOperationResults>(`${BASE_URL}/batch`, batchOperation);
        return response.data;
    }
    
}

export default shiftService;