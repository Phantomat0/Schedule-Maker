import { useState } from "react";
import ScheduleCreator from "./ScheduleCreator";
import TeamList from "./TeamList";

const DAYS_OF_THE_WEEK = [
  {
    name: "Monday",
    shortName: "Mo",
  },
  {
    name: "Tuesday",
    shortName: "Tu",
  },
  {
    name: "Wednesday",
    shortName: "We",
  },
  {
    name: "Thursday",
    shortName: "Th",
  },
  {
    name: "Friday",
    shortName: "Fr",
  },
  {
    name: "Saturday",
    shortName: "Sa",
  },
  {
    name: "Sunday",
    shortName: "Su",
  },
];

type HomeAwayTuple = [number, number];

function App() {
  const [teamsList, setTeamsList] = useState<string[]>(["Team 1"]);
  const [numberOfGamesAgainstEachTeam, setNumberOfGamesAgainstEachTeam] =
    useState<number>(1);
  const [daysOfTheWeek, setDaysOfTheWeek] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [schedule, setSchedule] = useState<HomeAwayTuple[]>([]);

  const TEAM_IDS = [0, 1, 2, 3, 4, 5];

  const handleDayOfWeekCheck = (e: any) => {
    const index = e.target.value;

    const isUncheck = daysOfTheWeek.includes(index);

    // If its an uncheck, remove the index from the array
    if (isUncheck) {
      setDaysOfTheWeek((daysOfWeek) =>
        daysOfWeek.filter((dayOfWeek) => dayOfWeek !== index)
      );
    } else {
      setDaysOfTheWeek([...daysOfTheWeek, index]);
    }
  };

  const handleStartDateChange = (e: any) => {
    const date = e.target.valueAsDate as Date;

    setStartDate(date);
  };

  const handleNumberOfGamesAgainstEachTeamChange = (e: any) => {
    const games = e.target.value as number;

    const MIN_GAMES = 1;
    const MAX_GAMES = 14;

    if (games < MIN_GAMES || games > MAX_GAMES) {
    } else {
      setNumberOfGamesAgainstEachTeam(games);
    }
  };

  const getTotalNumberOfGames = () => {
    return (
      (teamsList.length - 1) *
      numberOfGamesAgainstEachTeam *
      (teamsList.length / 2)
    );
  };

  const generateSchedule = () => {
    const timeStart = performance.now();
    const schedule = new ScheduleCreator(
      new Array(teamsList.length).fill(1).map((el, index) => `${index}`),
      [2, 5],
      {
        gamesAgainstEachTeam: numberOfGamesAgainstEachTeam,
      }
    ).create();

    const timeEnd = performance.now();

    console.log(timeEnd - timeStart);

    setSchedule(schedule);
  };

  return (
    <div className="App">
      <h1>Schedule Maker</h1>

      <h3>Teams</h3>
      <TeamList teamList={teamsList} setTeamsList={setTeamsList} />

      <h3>Teams Play Each Other</h3>
      <input
        type="number"
        onChange={handleNumberOfGamesAgainstEachTeamChange}
        min="1"
        max="14"
        defaultValue={1}
      ></input>

      <h4>Total Of {getTotalNumberOfGames()} Games</h4>

      <h3>Start Date</h3>
      <input
        type="date"
        name="startDate"
        onChange={handleStartDateChange}
      ></input>

      <h3>Days Of The Week</h3>

      <div className="schedule-picker">
        {DAYS_OF_THE_WEEK.map((dayOfTheWeek, index) => {
          return (
            <div className="day-of-the-week-item" key={dayOfTheWeek.name}>
              <input
                type="checkbox"
                id={dayOfTheWeek.name}
                name={dayOfTheWeek.shortName}
                value={index}
                onClick={handleDayOfWeekCheck}
              ></input>
              <label htmlFor={dayOfTheWeek.name}>
                {dayOfTheWeek.shortName}
              </label>
            </div>
          );
        })}
      </div>

      <button onClick={generateSchedule}>Generate Schedule</button>

      <h2>Counts For Testing</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>GP</th>
            <th>Home</th>
            <th>Away</th>
            <th>Games</th>
            <th>Did Not Play</th>
          </tr>
        </thead>
        <tbody>
          {teamsList.map((team, index) => {
            return (
              <tr>
                <td>{team}</td>
                <td>
                  {schedule.filter((matchup) => matchup.includes(index)).length}
                </td>
                <td>
                  {schedule.filter((matchup) => matchup[0] === index).length}
                </td>
                <td>
                  {schedule.filter((matchup) => matchup[1] === index).length}
                </td>
                <td>
                  {schedule
                    .reduce((acc: number[], val) => {
                      if (val.includes(index) === false) return acc;

                      const opp = val[0] === index ? val[1] : val[0];

                      acc.push(opp);

                      return acc;
                    }, [])
                    .join(" / ")}
                </td>
                <td>
                  {TEAM_IDS.filter(
                    (id) =>
                      schedule
                        .reduce((acc: number[], val) => {
                          if (val.includes(index) === false) return acc;

                          const opp = val[0] === index ? val[1] : val[0];

                          acc.push(opp);

                          return acc;
                        }, [])
                        .includes(id) === false && id !== index
                  ).join(" | ")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <hr></hr>
      <table>
        <thead>
          <tr>
            <th>Home</th>
            <th>Away</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((match) => {
            return (
              <tr>
                <td>{match[0]}</td>
                <td>{match[1]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
