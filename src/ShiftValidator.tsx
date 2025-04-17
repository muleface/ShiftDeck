import { Intern, Shift, StationRole, JSConstraint } from './API_Services/Models';

interface ValidationResult {
  isValid: boolean;
  invalidReasons: string[];
}

interface DayAssignments {
  [stationNum: number]: Intern | null;
}

interface ShiftValidatorProps {
  // Current day's assignments - map of station numbers to assigned interns
  currentDayAssignments: DayAssignments;
  // Previous day's assignments - needed for consecutive day validation
  previousDayAssignments?: DayAssignments;
  // Current date being validated
  currentDate: Date;
  // All station roles for interns
  stationRoles: StationRole[];
  // All JS constraints
  jsConstraints: JSConstraint[];
  // Optional callback for when validation status changes
  onValidationChange?: (isValid: boolean) => void;
}

// Validation results for an entire day
interface DayValidationResult {
  isValid: boolean;
  // Map of station numbers to their validation results
  stationResults: { [stationNum: number]: ValidationResult };
}

export function validateShiftSchedule({
  currentDayAssignments,
  previousDayAssignments = {},
  currentDate,
  stationRoles,
  jsConstraints,
  onValidationChange
}: ShiftValidatorProps): DayValidationResult {
  // Initialize the results object
  const dayValidationResult: DayValidationResult = {
    isValid: true,
    stationResults: {}
  };

  // Get all assigned stations for the current day
  const assignedStations = Object.keys(currentDayAssignments).map(Number);

  // Check each assigned station
  for (const stationNum of assignedStations) {
    const assignedIntern = currentDayAssignments[stationNum];
    if (!assignedIntern) continue; // Skip empty assignments

    const result: ValidationResult = {
      isValid: true,
      invalidReasons: []
    };

    // 1. Check for consecutive day scheduling (except Saturday)
    const isSaturday = currentDate.getDay() === 6; // 6 is Saturday in JavaScript
    if (!isSaturday && previousDayAssignments) {
      const wasScheduledYesterday = Object.values(previousDayAssignments).some(
        intern => intern && intern.id === assignedIntern.id
      );

      if (wasScheduledYesterday) {
        result.isValid = false;
        result.invalidReasons.push("Intern scheduled on consecutive days");
      }
    }

    // 2. Check Junior-Senior constraints
    // Get the intern's role at this station
    const internRole = stationRoles.find(
      role => role.internId === assignedIntern.id && role.stationNum === stationNum
    );

    if (!internRole) {
      // Intern doesn't have a role defined for this station
      result.isValid = false;
      result.invalidReasons.push("Intern not authorized for this station");
    } else if (internRole.role === 1) {
      // This is a junior who needs backup
      // Find all valid senior stations from constraints
      const validSeniorStations = jsConstraints
        .filter(constraint => constraint.juniorStation === stationNum)
        .map(constraint => constraint.seniorStation);

      // Check if any senior is scheduled at one of the valid stations
      let hasSeniorBackup = false;

      for (const seniorStationNum of validSeniorStations) {
        const seniorIntern = currentDayAssignments[seniorStationNum];
        
        if (seniorIntern) {
          // Check if this intern is actually a senior for the junior's station
          const isSenior = stationRoles.some(
            role => 
              role.internId === seniorIntern.id && 
              role.stationNum === stationNum && 
              role.role === 2
          );

          if (isSenior) {
            hasSeniorBackup = true;
            break;
          }
        }
      }

      if (!hasSeniorBackup && validSeniorStations.length > 0) {
        result.isValid = false;
        result.invalidReasons.push("Junior requires senior backup");
      }
    }

    // Store the result for this station
    dayValidationResult.stationResults[stationNum] = result;
    
    // Update overall validity
    if (!result.isValid) {
      dayValidationResult.isValid = false;
    }
  }

  // Call the callback if provided
  if (onValidationChange) {
    onValidationChange(dayValidationResult.isValid);
  }

  return dayValidationResult;
}

// Helper function to check if a schedule day is valid
export function isScheduleValid(validationResult: DayValidationResult): boolean {
  return validationResult.isValid;
}

// Helper function to get validation result for a specific station
export function getStationValidationResult(
  validationResult: DayValidationResult,
  stationNum: number
): ValidationResult {
  return validationResult.stationResults[stationNum] || { isValid: true, invalidReasons: [] };
}