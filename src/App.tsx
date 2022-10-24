import { useState } from "react";

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

function App() {
  const [numberOfTeams, setNumberOfTeams] = useState<number>(2);
  const [numberOfGamesAgainstEachTeam, setNumberOfGamesAgainstEachTeam] =
    useState<number>(1);
  const [daysOfTheWeek, setDaysOfTheWeek] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date>();

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

  const generateSchedule = () => {};

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

      <h4>
        Total Of{" "}
        {(numberOfTeams - 1) *
          numberOfGamesAgainstEachTeam *
          (numberOfTeams / 2)}{" "}
        Games
      </h4>

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
    </div>
  );
}

export default App;
