using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Services;
using Microsoft.EntityFrameworkCore.Query.Internal;
using System.Globalization;
using Npgsql.EntityFrameworkCore.PostgreSQL.Query.Expressions.Internal;
using WebAPI.Controllers;
using NuGet.Protocol.Core.Types;
using System.Data;

namespace WebAPI.Services
{
    public class GreedyAssignment 
    {
        private readonly ApplicationContext _context;

        // Class-level data attributes
        private List<int> internIds = [];
        private List<Shift> allShifts = [];
        private List<int> stationNums = [];
        private List<StationRole> roleList = [];
        private List<JSConstraint> constraints = [];
        private List<(int intern, int count)> totalShifts = [];
        private List<(int intern, int count)> totalWeekendShifts = [];

        public GreedyAssignment(ApplicationContext context)
        {
            _context = context;
        }

        private async Task InitializeDataAsync()
        {
            // Congregated database calls. we begin with the async calls for efficiency (though it's to the same DB anyway...)
            Task<List<int>> stationListTask = _context.StationsTable.Select(s => s.StationNum).ToListAsync();
            Task<List<StationRole>> stationRolesTask = _context.StationRolesTable.ToListAsync();
            Task<List<int>> internIdsTask = _context.InternsTable.Select(i => i.Id).ToListAsync();
            Task<List<Shift>> allShiftsTask = _context.ShiftsTable.ToListAsync();
            Task<List<JSConstraint>> jsConstraintsTask = _context.JSConstraintsTable.ToListAsync();

            // Wait for all async operations to complete
            await Task.WhenAll(stationListTask, stationRolesTask, internIdsTask, allShiftsTask);
            
            // Assign to class properties
            stationNums = stationListTask.Result;
            roleList = stationRolesTask.Result;
            internIds = internIdsTask.Result;
            allShifts = allShiftsTask.Result;
            constraints = jsConstraintsTask.Result;
        }
        
        /*
        Arguments:
        startDate = the starting date for assignments by the algorithm.
        endDate = the ending date for assignments by the algorithm.
        Restrictions:
        startDate and endDate must be within the same month, s.t endDate >= startDate.
        There must not be any shift assignments in the assignment range.
        Explanation:
        The algorithm first finds the month of the assignment range, and computes the total shift count for each intern, prior to the startDate.
        
        */
        public async Task<List<Shift>> RunGreedyAssignment(DateTime startDate, DateTime endDate)
        {

            await InitializeDataAsync();
            
            totalShifts = GenerateShiftCounts(startDate, null);
            totalWeekendShifts = GenerateShiftCounts(startDate, null, true);
            
            for (DateTime currentDay = startDate; currentDay <= endDate; currentDay = currentDay.AddDays(1))
            {
                // Generate priority list
                List<(int stationNum, List<int>)> stationPriorityLists = [];

                //Filter out unavailable interns
                DateTime previousDay = currentDay.AddDays(-1);
                List<int> availableInterns = internIds.Where(id => !allShifts.Any(s => s.InternId == id && s.ShiftDate.Date == previousDay.Date)).ToList();

                //Setting up lists for use in assignments
                List<(int station, List<StationRole> roles)> RolesPerStation = [];
                List<(int station, List<int> interns)> availableInternsPerStation = [];
                List<(int station, int count)> StationIterationOrder = [];

                foreach (int stationNum in stationNums)
                {
                    // Generate list of available interns for a particular station
                    List<StationRole> stationRoles = [.. roleList.Where(s => s.StationNum == stationNum && s.Role > 0)];
                    RolesPerStation.Add((stationNum, stationRoles));

                    List<int> stationAvailableInterns = [.. stationRoles.Where(s => availableInterns.Contains(s.InternId)).Select(s => s.InternId)];
                    availableInternsPerStation.Add((stationNum, stationAvailableInterns));
                    StationIterationOrder.Add((stationNum, stationAvailableInterns.Count));
                }

                bool[] stationAssignment = new bool[stationNums.Count];
                StationIterationOrder.Sort((a, b) =>{return a.Item2.CompareTo(b.Item2);});
                
                /*
                We begin looping through the days, based on the station iteration order (the station with the lowest amount of available assignees is first).
                With each iteration, we calculate the priority list for that station,
                */
                foreach ((int station, int count) in StationIterationOrder)
                {
                    List<StationRole> thisStationRoles = RolesPerStation.First(e => e.Item1 == station).Item2;

                    List<int> internsAvailableForStation = availableInternsPerStation.First(s => s.Item1 == station).Item2.
                    Where(i => !allShifts.Any(s => s.InternId == i && s.ShiftDate.Date == currentDay.Date)).ToList();

                    List<int> priorityList = GeneratePriorityList(thisStationRoles, allShifts, internsAvailableForStation, currentDay); 
                    
                    stationPriorityLists.Add((station, priorityList));
                }

            }
            
            return [];
        }

        private List<(int, int)> GenerateShiftCounts(DateTime date, List<Shift>? shifts, bool ifWeekend = false)
        {
            if (shifts == null)
                shifts = allShifts;
            
            List<(int, int)> shiftsPerIntern = [];
            DateTime firstDayOfMonth = new DateTime(date.Year, date.Month, 1);
       
            foreach (int i in internIds)
            {
               int shiftCount = shifts.Count(s => s.InternId == i &&
                                                s.ShiftDate >= firstDayOfMonth &&
                                                s.ShiftDate <= date &&
                                                ifWeekend ?
                                                (s.ShiftDate.DayOfWeek == DayOfWeek.Friday || s.ShiftDate.DayOfWeek == DayOfWeek.Saturday) :
                                                true);

                shiftsPerIntern.Add((i, shiftCount));
            }

            return shiftsPerIntern;
        }


        /*
        Arguments:
        roles is nullable, in case where backup is true, as it means we're trying to generate a list of seniors for a station and their roles
        determined by definition (2).
        */
        private List<int> GeneratePriorityList(
        List<StationRole>? roles,
        List<Shift> shifts,
        List<int> availableInterns, 
        DateTime currentDay, 
        bool backup = false)
        {
            List<(int, int)> priorityList = [];
            List<(int, int)> shiftsCount = GenerateShiftCounts(currentDay, shifts);
            List<(int, int)> weekendShiftsCount = GenerateShiftCounts(currentDay, shifts, true);


            /*
            alpha = a scalar value modifying the shift count for priority calculation. should always be greater than 1.
            beta = a scalar value modifying the priority level of interns with days off during this assignment range. (Currently irrelevant)
            penalty = a value that penalizes the priority to prevent sandwiches (only one day off between assignments).
            */
            int alpha = 2;
            int beta = 0;
            int penalty = 5;

            //Filter out all interns who had a shift the day before

            foreach (int intern in availableInterns)
            {
                int shiftCount = shiftsCount.First(t => t.Item1 == intern).Item2;
                int weekendCount = totalWeekendShifts.First(t => t.Item1 == intern).Item2;
                int stationRole;
                if (!backup && roles != null)
                    stationRole = roles.First(s => s.InternId == intern).Role; //different stations were already filtered before calling this function.
                else
                    stationRole = 2;

                int priority = stationRole + alpha * shiftCount + beta * 0 + checkSandwich(intern, currentDay) * penalty; //checkSandwich returns 0 if no sandwich, 1 if true. it should receive arguments.

                priorityList.Add((intern, priority));
            }

            priorityList.Sort((a, b) => 
            {
                // Primary sort: by priority (ascending)
                if (a.Item2 != b.Item2)
                    return a.Item2.CompareTo(b.Item2);
                
                // Tiebreaker: by weekend count (intern with fewer weekend shifts comes first)
                int aWeekendCount = totalWeekendShifts.First(t => t.Item1 == a.Item1).Item2;
                int bWeekendCount = totalWeekendShifts.First(t => t.Item1 == b.Item1).Item2;
                
                return aWeekendCount.CompareTo(bWeekendCount);
            });

            return priorityList.Select(p => p.Item1).ToList();
        }

        private int checkSandwich(int intern, DateTime currentDay) 
        {
            DateTime prev = currentDay.AddDays(-2);
            Shift? pSandwich = allShifts.FirstOrDefault(s => s.InternId == intern && s.ShiftDate == prev);

            return pSandwich != null ? 1 : 0;
        }

        private List<Shift> dayAssignment(List<(int station, int count)> order, 
                                        List<(int station, List<int> interns)> interns,
                                        List<Shift> shifts,
                                        List<(int station, List<StationRole>)> roles,
                                        bool[] assignments,
                                        DateTime currentDay,
                                        int station)
        {
            List<Shift> shiftsToAdd = [];
            if (!assignments[station])
            {
                List<StationRole> stationRoles = roles.First(e => e.Item1 == station).Item2; //list of roles for the current station

                List<int> availableInterns = interns.First(s => s.Item1 == station).Item2.
                Where(i => !allShifts.Any(s => s.InternId == i && s.ShiftDate.Date == currentDay.Date)).ToList();

                List<int> priorityList = GeneratePriorityList(station, stationRoles, availableInterns, currentDay);

                foreach (int intern in priorityList)
                {
                    
                        
                }

            }

        }

        private List<Shift> assignInternToStation(int intern, 
                                                int station, 
                                                DateTime currentDay, 
                                                List<StationRole> stationRoles, 
                                                List<Shift> shifts,
                                                bool[] assignments) 
        {
            List<Shift> shiftsToAdd = [];
            int role = stationRoles.First(s => s.InternId == intern).StationNum;

            if (role == 2)
            {
                shiftsToAdd.Add(new Shift(intern, currentDay, station));
                assignments[station] = true;
                return shiftsToAdd;
            }
            else //intern is a junior
            {
                //grab the list of possible backup stations
                List<int> backupStations = constraints.Where(s => s.JuniorStation == station)
                                                    .Select(s => s.SeniorStation).ToList();
                
                //a bit of a complex linq expression, in summary it just finds all the seniors that can back up the junior, with their respective stations.
                List<(int intern, int station)> availableSeniors = stationRoles
                                                .Where(role => role.Role == 2)
                                                .SelectMany(role => backupStations
                                                .Where(backupStation => roleList
                                                .Any(r => r.InternId == role.InternId && 
                                                                r.StationNum == backupStation && 
                                                                r.Role > 0))
                                                .Select(backupStation => (role.InternId, backupStation)))
                                                .ToList();

                List<int> onlySeniors = availableSeniors.Select(s => s.intern).ToList();

                //assume this placement is legitimate, so we'll add this as a shift
                shifts.Add(new Shift(intern, currentDay, station));
                assignments[station] = true;

                //generate a priority list for all these seniors
                List<int> seniorPriorityList = GeneratePriorityList(null, shifts, onlySeniors, currentDay, true);

                //regenerate a list of intern-station tuples, ordered by priority
                List<(int senior, int bStation)> prioritizedSeniorStations = seniorPriorityList
                                                .SelectMany(internId => availableSeniors.Where(tuple => tuple.intern == internId))
                                                .ToList();
                
                //finally, call the function recursively for each tuple in orderedSeniorBackups

                foreach ((int senior, int bStation) in prioritizedSeniorStations)
                {
                    //call recursively
                    List<StationRole> rolesForStation = roleList.Where(r => r.StationNum == bStation).ToList();
                    if (assignments[bStation] == true) //station already taken up
                        continue;
                    List<Shift> returnedShifts = assignInternToStation(senior, bStation, currentDay, rolesForStation, shifts, assignments);

                    if (returnedShifts != null)
                    {
                        shifts.AddRange(returnedShifts);
                        return shifts;
                    }

                }
                // edge case where all possible assignments failed.
                return null;
            }
        }
    }
}