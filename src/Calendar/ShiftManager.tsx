import { Intern, Shift, createFauxShift, fauxShift, StationRole, JSConstraint } from '../API_Services/Models';
import shiftService from '../API_Services/shiftService';

interface CalendarDay {
  date: Date;
  assignments: { [stationNum: number]: Intern | null };
  isWeekend: boolean;
}

// Helper functions that don't depend on any state
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
};

export function createShiftManager(dependencies: {
  allInterns: Intern[];
  stationRoles: StationRole[];
  jsConstraints: JSConstraint[];
  initialPendingChanges?: fauxShift[];
  onPendingChangesUpdate?: (pendingChanges: fauxShift[]) => void;
  allShifts: Shift[];
  setAllShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
}) {
  // Store dependencies in closure
  const { 
    allInterns, 
    stationRoles, 
    jsConstraints,
    initialPendingChanges = [],
    onPendingChangesUpdate,
    allShifts,
    setAllShifts
  } = dependencies;
  
  // Internal state for pending changes
  let pendingChanges = [...initialPendingChanges];
  
  // New: Internal state for pending deletions (just shift IDs)
  let pendingDeletions: number[] = [];
  
  // Helper to update pending changes and notify listeners
  const updatePendingChanges = (newPendingChanges: fauxShift[]) => {
    pendingChanges = newPendingChanges;
    if (onPendingChangesUpdate) {
      onPendingChangesUpdate(pendingChanges);
    }
  };

  // New: Helper to update pending deletions and notify listeners
  const updatePendingDeletions = (newPendingDeletions: number[]) => {
    pendingDeletions = newPendingDeletions;
    if (onPendingChangesUpdate) {
      // Still use the same callback to trigger re-render
      onPendingChangesUpdate([...pendingChanges]);
    }
  };

  // Track modified cells for UI highlighting
  let modifiedCells: { [key: string]: boolean } = {};
  
  // Helper to get a unique key for a cell
  const getCellKey = (date: Date, stationNum: number): string => {
    return `${date.toISOString().split('T')[0]}-${stationNum}`;
  };
  
  // Mark a cell as modified
  const markCellModified = (date: Date, stationNum: number) => {
    const cellKey = getCellKey(date, stationNum);
    modifiedCells[cellKey] = true;
  };

  /**
   * Check Junior-Senior constraints
   * @param intern Intern to check
   * @param stationNum Station number
   * @param assignments Current assignments for the day
   * @returns Boolean indicating if assignment is valid
   */
  const checkJuniorSeniorConstraints = (
    intern: Intern,
    stationNum: number,
    assignments: { [stationNum: number]: Intern | null }
  ): boolean => {
    // Get the intern's role at this station
    const internRole = stationRoles.find(
      role => role.internId === intern.id && role.stationNum === stationNum
    );
    
    if (!internRole) {
      // Intern doesn't have a role defined for this station
      return false;
    }
    
    // If intern is junior (role 1), check for senior backup
    if (internRole.role === 1) {
      // Find all valid senior stations from constraints
      const validSeniorStations = jsConstraints
        .filter(constraint => constraint.juniorStation === stationNum)
        .map(constraint => constraint.seniorStation);
      
      // If no constraints defined, no need for backup
      if (validSeniorStations.length === 0) {
        return true;
      }
      
      // Check if any senior is scheduled at one of the valid stations
      for (const seniorStationNum of validSeniorStations) {
        const seniorIntern = assignments[seniorStationNum];
        
        if (seniorIntern) {
          // Check if this intern is actually a senior for the junior's station
          const isSenior = stationRoles.some(
            role => 
              role.internId === seniorIntern.id && 
              role.stationNum === stationNum && 
              role.role === 2
          );
          
          if (isSenior) {
            return true; // Valid - found a senior backup
          }
        }
      }
      
      return false; // Invalid - no senior backup found
    }
    
    // If not a junior or no constraints needed, assignment is valid
    return true;
  };

  /**
   * Check for consecutive days scheduling
   * @param intern Intern to check
   * @param date Date of the shift
   * @param previousDayAssignments Previous day's assignments
   * @param previousDayPendingShifts Previous day's pending shifts
   * @returns Boolean indicating if assignment is valid
   */
  const checkConsecutiveDays = (
    intern: Intern,
    date: Date,
    previousDayAssignments: { [stationNum: number]: Intern | null } | null,
    previousDayPendingShifts: fauxShift[]
  ): boolean => {
    // If no previous day assignments, valid by default
    if (!previousDayAssignments) {
      return true;
    }
    
    // Check if intern was scheduled yesterday in existing assignments
    const wasScheduledYesterday = Object.values(previousDayAssignments).some(
      prevIntern => prevIntern && prevIntern.id === intern.id
    );
    
    // Check if intern was scheduled yesterday in pending changes
    const scheduledInPendingYesterday = previousDayPendingShifts.some(
      shift => shift.internId === intern.id
    );
    
    // Invalid if scheduled on consecutive days
    return !(wasScheduledYesterday || scheduledInPendingYesterday);
  };

  return {
    /**
     * Get all pending changes
     * @returns Array of pending changes
     */
    getPendingChanges(): fauxShift[] {
      return [...pendingChanges]; // Return copy to prevent direct mutation
    },
    
    /**
     * New: Get pending deletions
     * @returns Array of shift IDs to delete
     */
    getPendingDeletions(): number[] {
      return [...pendingDeletions];
    },
    
    /**
     * Get pending changes for a specific month
     * @param year Year to filter by
     * @param month Month to filter by (0-11)
     * @returns Filtered pending changes
     */
    getPendingShiftsForMonth(year: number, month: number): fauxShift[] {
      return pendingChanges.filter(shift => {
        const shiftDate = new Date(shift.shiftDate);
        return shiftDate.getFullYear() === year && shiftDate.getMonth() === month;
      });
    },
    
    /**
     * Add a new pending shift
     * @param newShift The shift to add
     */
    addPendingShift(newShift: fauxShift): void {
      const shiftDate = new Date(newShift.shiftDate);
      markCellModified(shiftDate, newShift.stationNum);
      
      const existingIndex = pendingChanges.findIndex(shift => 
        isSameDay(new Date(shift.shiftDate), shiftDate) && 
        shift.stationNum === newShift.stationNum
      );
      
      const newPendingChanges = [...pendingChanges];
      if (existingIndex >= 0) {
        newPendingChanges[existingIndex] = newShift;
      } else {
        newPendingChanges.push(newShift);
      }
      
      updatePendingChanges(newPendingChanges);
    },
    
    /**
     * Remove a pending shift or mark existing shift for deletion
     * @param shiftToRemove Object containing date and stationNum to identify the shift
     */
    removePendingShift(shiftToRemove: { shiftDate: Date, stationNum: number }): void {
      markCellModified(shiftToRemove.shiftDate, shiftToRemove.stationNum);
      
      // First, check if this is an existing shift in the database
      const existingShift = allShifts.find(shift => 
        isSameDay(new Date(shift.shiftDate), new Date(shiftToRemove.shiftDate)) && 
        shift.stationNum === shiftToRemove.stationNum
      );
      
      // If it's an existing shift, add it to pending deletions
      if (existingShift) {
        // Only add if not already pending deletion
        if (!pendingDeletions.includes(existingShift.id)) {
          updatePendingDeletions([...pendingDeletions, existingShift.id]);
        }
      }
      
      // Also remove from pending changes if it exists there
      const filteredChanges = pendingChanges.filter(shift => 
        !(isSameDay(new Date(shift.shiftDate), new Date(shiftToRemove.shiftDate)) && 
          shift.stationNum === shiftToRemove.stationNum)
      );
      
      updatePendingChanges(filteredChanges);
    },
    
    /**
     * Revert a cell modification
     * @param date Date of the cell
     * @param stationNum Station number of the cell
     */
    revertCellModification(date: Date, stationNum: number): void {
      const cellKey = getCellKey(date, stationNum);
      
      // Remove from modified cells
      if (modifiedCells[cellKey]) {
        const newModifiedCells = { ...modifiedCells };
        delete newModifiedCells[cellKey];
        modifiedCells = newModifiedCells;
      }
      
      // Remove from pending changes
      const filteredChanges = pendingChanges.filter(shift => 
        !(isSameDay(new Date(shift.shiftDate), date) && shift.stationNum === stationNum)
      );
      updatePendingChanges(filteredChanges);
      
      // Remove from pending deletions if applicable
      const existingShift = allShifts.find(shift => 
        isSameDay(new Date(shift.shiftDate), date) && shift.stationNum === stationNum
      );
      
      if (existingShift && pendingDeletions.includes(existingShift.id)) {
        const filteredDeletions = pendingDeletions.filter(id => id !== existingShift.id);
        updatePendingDeletions(filteredDeletions);
      }
    },
    
    /**
     * Clear all pending changes
     */
    clearAllPending(): void {
      updatePendingChanges([]);
      updatePendingDeletions([]);
      modifiedCells = {};
    },
    
    /**
     * Get modified cells for UI
     * @param year Year to filter by
     * @param month Month to filter by (0-11)
     * @returns Map of modified cells by day and station
     */
    getModifiedCells(year: number, month: number): { [dayIndex: number]: { [stationNum: number]: boolean } } {
      const result: { [dayIndex: number]: { [stationNum: number]: boolean } } = {};
      
      // Convert modifiedCells object to the day/station map format
      Object.keys(modifiedCells).forEach(key => {
        const [dateStr, stationStr] = key.split('-');
        if (!dateStr || !stationStr) return; // Skip invalid keys
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return; // Skip invalid dates
        
        const stationNum = parseInt(stationStr);
        if (isNaN(stationNum)) return; // Skip invalid station numbers
        
        if (date.getFullYear() === year && date.getMonth() === month) {
          const dayIndex = date.getDate() - 1;
          
          if (!result[dayIndex]) {
            result[dayIndex] = {};
          }
          
          result[dayIndex][stationNum] = true;
        }
      });
      
      console.log('Modified cells for UI:', result); // Add debugging
      return result;
    },
    
    /**
     * Transform pending changes to a map for easier UI usage
     * @param year Year to filter by
     * @param month Month to filter by (0-11)
     * @returns Map of pending changes by day and station
     */
    transformPendingChangesToMap(year: number, month: number): { [dayIndex: number]: { [stationNum: number]: boolean } } {
      const pendingMap: { [dayIndex: number]: { [stationNum: number]: boolean } } = {};
      
      pendingChanges.forEach(change => {
        const changeDate = new Date(change.shiftDate);
        
        if (changeDate.getMonth() === month && changeDate.getFullYear() === year) {
          const dayIndex = changeDate.getDate() - 1;
          
          if (!pendingMap[dayIndex]) {
            pendingMap[dayIndex] = {};
          }
          
          pendingMap[dayIndex][change.stationNum] = true;
        }
      });
      
      return pendingMap;
    },
    
    /**
     * Transform pending deletions to a map for easier UI usage
     * @param year Year to filter by
     * @param month Month to filter by (0-11)
     * @returns Map of pending deletions by day and station
     */
    transformPendingDeletionsToMap(year: number, month: number): { [dayIndex: number]: { [stationNum: number]: boolean } } {
      const deletionsMap: { [dayIndex: number]: { [stationNum: number]: boolean } } = {};
      
      pendingDeletions.forEach(shiftId => {
        const shift = allShifts.find(s => s.id === shiftId);
        if (shift) {
          const shiftDate = new Date(shift.shiftDate);
          
          if (shiftDate.getMonth() === month && shiftDate.getFullYear() === year) {
            const dayIndex = shiftDate.getDate() - 1;
            
            if (!deletionsMap[dayIndex]) {
              deletionsMap[dayIndex] = {};
            }
            
            deletionsMap[dayIndex][shift.stationNum] = true;
          }
        }
      });
      
      return deletionsMap;
    },
    
    /**
     * Validate a single day's schedule, considering pending changes
     * @param currentDay Current day's assignments
     * @param previousDay Previous day's assignments (for consecutive day validation)
     * @returns Map of station validation statuses (true = valid, false = invalid)
     */
    validateDay(
      currentDay: CalendarDay,
      previousDay: CalendarDay | null
    ): { [stationNum: number]: boolean } {
      const stationResults: { [stationNum: number]: boolean } = {};
      
      // Create a new assignments object that includes pending changes
      const effectiveAssignments = { ...currentDay.assignments };
      
      // Apply pending changes to the assignments
      pendingChanges.forEach(pendingShift => {
        const pendingDate = new Date(pendingShift.shiftDate);
        
        // Only apply changes for the current day
        if (isSameDay(pendingDate, currentDay.date)) {
          // Find the intern object from the intern ID
          const assignedIntern = allInterns.find(intern => intern.id === pendingShift.internId);
          
          if (assignedIntern) {
            effectiveAssignments[pendingShift.stationNum] = assignedIntern;
          }
        }
      });
      
      // Apply pending deletions to the assignments
      pendingDeletions.forEach(shiftId => {
        const shift = allShifts.find(s => s.id === shiftId);
        if (shift && isSameDay(new Date(shift.shiftDate), currentDay.date)) {
          delete effectiveAssignments[shift.stationNum];
        }
      });
      
      // Get all assigned stations for the current day (including pending changes)
      const assignedStations = Object.keys(effectiveAssignments).map(Number);
      
      // Get previous day's pending shifts for consecutive day checks
      const previousDayPendingShifts = previousDay ? pendingChanges.filter(shift => 
        isSameDay(new Date(shift.shiftDate), previousDay.date)
      ) : [];
      
      // Check each assigned station
      for (const stationNum of assignedStations) {
        const assignedIntern = effectiveAssignments[stationNum];
        if (!assignedIntern) continue; // Skip empty assignments
        
        // 1. Check for consecutive day scheduling
        const consecutiveDaysValid = checkConsecutiveDays(
          assignedIntern,
          currentDay.date,
          previousDay?.assignments || null,
          previousDayPendingShifts
        );
        
        // 2. Check Junior-Senior constraints
        const juniorSeniorValid = checkJuniorSeniorConstraints(
          assignedIntern,
          stationNum,
          effectiveAssignments
        );
        
        // Station is valid only if both checks pass
        stationResults[stationNum] = consecutiveDaysValid && juniorSeniorValid;
      }
      
      return stationResults;
    },
    
    /**
     * Fetch all shifts from the API and update the shifts state
     */
    async fetchAllShifts(): Promise<void> {
      try {
        const shifts = await shiftService.getAllShifts();
        setAllShifts(shifts);
      } catch (err) {
        console.error('Error fetching shifts:', err);
        throw err;
      }
    },
    
    /**
 * Save pending changes and deletions using batch processing
 */
    async saveShifts(): Promise<void> {
      if (pendingChanges.length === 0 && pendingDeletions.length === 0) return;
      
      try {
        // Use the batch operation endpoint
        const batchResults = await shiftService.processBatchOperations(
          pendingChanges,
          pendingDeletions
        );
        
        // Update allShifts state with the results
        setAllShifts(prevShifts => {
          // Remove deleted shifts
          const updatedShifts = prevShifts.filter(shift => 
            !batchResults.deletedShifts.includes(shift.id)
          );
          
          // Add new shifts and update existing ones
          batchResults.addedShifts.forEach(addedShift => {
            const existingIndex = updatedShifts.findIndex(s => s.id === addedShift.id);
            
            if (existingIndex >= 0) {
              // Update existing shift
              updatedShifts[existingIndex] = addedShift;
            } else {
              // Add new shift
              updatedShifts.push(addedShift);
            }
          });
          
          return updatedShifts;
        });
        
        // Reset pending changes and deletions
        pendingChanges = [];
        pendingDeletions = [];
        modifiedCells = {};
        
        // Notify listeners of state change
        if (onPendingChangesUpdate) {
          onPendingChangesUpdate(pendingChanges);
        }
      } catch (err) {
        console.error('Error processing batch operations:', err);
        throw err;
      }
    }
  };
}