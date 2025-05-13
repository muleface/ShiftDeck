export interface Intern {
    id: number;
    firstName: string;
    lastName: string;
    department: string;
}

export function createIntern(id:number, firstName:string, lastName:string, department:string) {
    return {
        id,
        firstName,
        lastName,
        department
    }
}

export interface Shift {
    id: number;
    internId: number;
    shiftDate: Date;
    stationNum: number;
}

export function createShift(id:number, internId:number, shiftDate:Date, stationNum:number) {
   return {
    id,
    internId,
    shiftDate,
    stationNum
   }
}

export interface fauxShift {
    internId: number;
    shiftDate: Date;
    stationNum: number;
}

export function createFauxShift(intern:number, date:Date, station:number) {
    return {
        internId:intern,
        shiftDate:date,
        stationNum:station
      };
}


export interface Station {
    stationNum: number;
    stationName: string;
}

export interface StationRole {
    internId: number;
    stationNum: number;
    role: number;
}

export function createStationRole( stationNum:number, internId:number, role:number) {
    return {
        stationNum,
        internId,
        role
    }
}

export interface JSConstraint {
    id: number,
    juniorStation: number,
    seniorStation: number,
}

