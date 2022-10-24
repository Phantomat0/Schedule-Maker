import { useState } from "react";
import { randFromArray } from "./utilts";

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
  const [numberOfTeams, setNumberOfTeams] = useState<number>(2);
  const [numberOfGamesAgainstEachTeam, setNumberOfGamesAgainstEachTeam] =
    useState<number>(1);
  const [daysOfTheWeek, setDaysOfTheWeek] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [schedule, setSchedule] = useState<HomeAwayTuple[]>([]);

  const TEAM_IDS = [1, 2, 3, 4, 5, 6];

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

  const handleNumberOfTeamsChange = (e: any) => {
    const value = e.target.value as number;

    const MIN_VALUE = 2;
    const MAX_VALUE = 14;

    if (value < MIN_VALUE || value > MAX_VALUE) {
    } else {
      setNumberOfTeams(value);
    }
    console.log(e.target.value);
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
      (numberOfTeams - 1) * numberOfGamesAgainstEachTeam * (numberOfTeams / 2)
    );
  };

  const generateSchedule = () => {
    const numberOfDays = (numberOfTeams - 1) * 2;

    const DICTS_OF_GAMES: HomeAwayTuple[] = [];

    const gamesPerDay = Math.floor(numberOfTeams / 2);

    const teamHasAlreadyPlayed = (team: number, dict: HomeAwayTuple[]) => {
      return dict.some((matchup) => matchup.includes(team));
    };

    const teamsHaveAlreadyPlayedEachOther = (
      team1: number,
      team2: number,
      dict: HomeAwayTuple[]
    ) => {
      return dict.some(
        ([home, away]) =>
          (home === team1 && away === team2) ||
          (home === team2 && away === team1)
      );
    };

    for (let i = 0; i < numberOfDays / 2; i++) {
      const matchUpsThisDay: HomeAwayTuple[] = [];

      while (matchUpsThisDay.length < gamesPerDay) {
        // Get two random teams
        let homeTeam = 0;
        let awayTeam = 0;

        // Pick two teams that havent already this day and arent the same team
        while (
          homeTeam === awayTeam ||
          teamHasAlreadyPlayed(homeTeam, matchUpsThisDay) ||
          teamHasAlreadyPlayed(awayTeam, matchUpsThisDay)
        ) {
          homeTeam = randFromArray(TEAM_IDS);
          awayTeam = randFromArray(TEAM_IDS);

          console.log(
            teamsHaveAlreadyPlayedEachOther(homeTeam, awayTeam, DICTS_OF_GAMES)
          );
        }

        // Lets add their matchup
        matchUpsThisDay.push([homeTeam, awayTeam]);
      }

      DICTS_OF_GAMES.push(...matchUpsThisDay);
    }

    setSchedule(DICTS_OF_GAMES);
  };

  return (
    <div className="App">
      <h1>Schedule Maker</h1>

      <h3>Number Of Teams</h3>
      <input
        type="number"
        onChange={handleNumberOfTeamsChange}
        min="2"
        max="14"
        defaultValue={2}
      ></input>

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
          {TEAM_IDS.map((team) => {
            return (
              <tr>
                <td>{team}</td>
                <td>
                  {schedule.filter((matchup) => matchup.includes(team)).length}
                </td>
                <td>
                  {schedule.filter((matchup) => matchup[0] === team).length}
                </td>
                <td>
                  {schedule.filter((matchup) => matchup[1] === team).length}
                </td>
                <td>
                  {schedule
                    .reduce((acc: number[], val) => {
                      if (val.includes(team) === false) return acc;

                      const opp = val[0] === team ? val[1] : val[0];

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
                          if (val.includes(team) === false) return acc;

                          const opp = val[0] === team ? val[1] : val[0];

                          acc.push(opp);

                          return acc;
                        }, [])
                        .includes(id) === false
                  ).join(" | ")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
