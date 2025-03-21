import React, { useState, useEffect, useContext, createContext } from 'react';

interface Intern {
    id: number;
    internName: string;
    hospital: string;
}

interface Shift {
    id: number;
    internId: number;
    shiftDate: Date;
    department: number;
}