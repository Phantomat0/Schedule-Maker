import { match } from "assert";
import ScheduleCreator from "./ScheduleCreator";
import { daysDiff } from "./utilts";

interface ScheduleListProps {
  schedule: ReturnType<ScheduleCreator["create"]>;
  teamsList: string[][];
}

const getTeamFromId = (teamId: number, teamsList: string[][]) => {
  const divisionIndex = Math.floor(teamId / 100);
  const teamIndex = teamId % 100;
  return teamsList[divisionIndex][teamIndex];
};

const ScheduleList: React.FC<ScheduleListProps> = ({ schedule, teamsList }) => {
  return (
    <>
      <h2>Generated Schedule</h2>

      <div className="schedule-stats">
        <div>
          <h4>{schedule.numberOfGames}</h4>
          <span>Total Games</span>
        </div>
        <div>
          <h4>{schedule.numberOfGameDays}</h4>
          <span>Game Days</span>
        </div>
        <div>
          <h4 className="end-date">{schedule.endDate.toDateString()}</h4>
          <span>End Date</span>
        </div>
        <div>
          <h4>{daysDiff(schedule.startDate, schedule.endDate)}</h4>
          <span>Duration (Days)</span>
        </div>
      </div>

      {teamsList.map((division, divisionIndex) => {
        return (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Games</th>
                <th>Home</th>
                <th>Away</th>
              </tr>
            </thead>
            <tbody>
              {division.map((team, index) => {
                return (
                  <tr>
                    <td>{team}</td>
                    <td>
                      {
                        schedule.schedule
                          .flat()
                          .filter(
                            (el) =>
                              el.home === divisionIndex * 100 + index ||
                              el.away === divisionIndex * 100 + index
                          ).length
                      }
                    </td>
                    <td>
                      {
                        schedule.schedule
                          .flat()
                          .filter(
                            (el) => el.home === divisionIndex * 100 + index
                          ).length
                      }
                    </td>
                    <td>
                      {
                        schedule.schedule
                          .flat()
                          .filter(
                            (el) => el.away === divisionIndex * 100 + index
                          ).length
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      })}

      <table className="schedule-table">
        <thead>
          <tr>
            <th>Home</th>
            <th>Away</th>
          </tr>
        </thead>
        <tbody>
          {schedule.schedule.map((el, index) => {
            return (
              <>
                <tr>
                  <td colSpan={2}>
                    <strong>Day {index + 1}</strong>
                    {el[0].date.toDateString()}
                  </td>
                </tr>
                {el.map((matchup) => {
                  return (
                    <tr>
                      <td>{getTeamFromId(matchup.home, teamsList)}</td>
                      <td>{getTeamFromId(matchup.away, teamsList)}</td>
                    </tr>
                  );
                })}
              </>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default ScheduleList;
