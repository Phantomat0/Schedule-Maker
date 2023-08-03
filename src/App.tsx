import { useState } from "react";
import DateInput from "./DateInput";
import ScheduleCreator, { ScheduleCreatorError } from "./ScheduleCreator";
import ScheduleList from "./ScheduleList";
import DivisionTeamsList from "./DivisionTeamsList";

const DAYS_OF_THE_WEEK = [
  {
    name: "Sunday",
    shortName: "Su",
  },
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
];

function App() {
  const [teamsList, setTeamsList] = useState<string[][]>([
    ["Team 1", "Team 2"],
  ]);
  const [numberOfGamesAgainstEachTeam, setNumberOfGamesAgainstEachTeam] =
    useState<number>(1);
  const [gamesAgainstOtherDiv, setGamesAgainstOtherDiv] = useState<number>(1);

  const [daysOfTheWeek, setDaysOfTheWeek] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<{
    year: number;
    month: number;
    day: number;
    hour: number;
    min: number;
  }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    day: new Date().getDate(),
    hour: 20,
    min: 0,
  });
  const [schedule, setSchedule] = useState<
    NonNullable<ReturnType<ScheduleCreator["create"]>> | {}
  >({});
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [datesToSkip, setDatesToSkip] = useState<Date[]>([]);

  const makeDateFromDateInputs = () => {
    return new Date(
      startDate.year,
      startDate.month,
      startDate.day,
      startDate.hour,
      startDate.min,
      0,
      0
    );
  };

  const handleStartDateChange = (e: any) => {
    const selectFieldName: string = e.target.name;
    const selectFieldOptionValue = parseInt(e.target.value);

    // Handle time differently
    if (selectFieldName === "time") {
      const time: string = e.target.value;

      const [hourStr, minStr] = time.split(":");

      const newStartDate = { ...startDate };

      newStartDate["hour"] = parseInt(hourStr);
      newStartDate["min"] = parseInt(minStr);

      setStartDate(newStartDate);

      return;
    }

    const newStartDate = { ...startDate };

    newStartDate[selectFieldName as keyof typeof startDate] =
      selectFieldOptionValue;

    setStartDate(newStartDate);
  };

  const handleNumberOfGamesAgainstEachTeamChange = (e: any) => {
    const games = parseInt(e.target.value);

    const MIN_GAMES = 1;
    const MAX_GAMES = 14;

    if (games < MIN_GAMES || games > MAX_GAMES) {
    } else {
      setNumberOfGamesAgainstEachTeam(games);
    }
  };

  const handleGamesAgainstOtherDivisionChange = (e: any) => {
    const games = parseInt(e.target.value);

    const MIN_GAMES = 1;
    const MAX_GAMES = 14;

    if (games < MIN_GAMES || games > MAX_GAMES) {
    } else {
      setGamesAgainstOtherDiv(games);
    }
  };

  const handleDateToSkipCheck = (e: any) => {
    const dateStringAsDate = new Date(e.target.value);

    const isUncheck = datesToSkip.some(
      (date) => date.getTime() === dateStringAsDate.getTime()
    );

    // If its an uncheck, remove the index from the array
    if (isUncheck) {
      setDatesToSkip((dayToSkip) =>
        datesToSkip.filter(
          (date) =>
            date.toLocaleDateString() !== dateStringAsDate.toLocaleDateString()
        )
      );
    } else {
      setDatesToSkip([...datesToSkip, dateStringAsDate]);
    }
  };

  const generateSchedule = () => {
    setScheduleError(null);

    try {
      const scheduleObj = new ScheduleCreator(teamsList, daysOfTheWeek, {
        gamesAgainstEachTeam: numberOfGamesAgainstEachTeam,
        gamesAgainstOtherDivision: gamesAgainstOtherDiv,
        startDate: makeDateFromDateInputs(),
        datesToSkip: datesToSkip,
      }).create();

      setSchedule(scheduleObj!);
    } catch (e) {
      if (e instanceof ScheduleCreatorError) {
        return setScheduleError(e.message);
      }

      console.error(e);
    }
  };

  const handleDayOfWeekCheck = (e: any) => {
    const index = parseInt(e.target.value);

    const isUncheck = daysOfTheWeek.includes(index);

    // If its an uncheck, remove the index from the array
    if (isUncheck) {
      setDaysOfTheWeek((daysOfWeek) =>
        daysOfWeek.filter((dayOfWeek) => dayOfWeek !== index)
      );

      setDatesToSkip((daysOfTheWeek) =>
        daysOfTheWeek.filter((day) => new Date(day).getDay() !== index)
      );
    } else {
      setDaysOfTheWeek([...daysOfTheWeek, index]);
    }
  };

  const sortDatesInScheduleAndSkipped = (): Date[] => {
    if ("dates" in schedule) {
      const concat = [...datesToSkip, ...schedule.dates];

      const concatMappedTimeNoDuplicates: string[] = Array.from(
        new Set(concat.map((date) => date.toLocaleDateString()))
      ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      return concatMappedTimeNoDuplicates.map((datAsStr) => new Date(datAsStr));
    }

    return [];
  };

  const addDivision = () => {
    // Adds a division, and by default adds the same amount of teams to the division as the teams in the first division
    const uniqueNames: string[] = [];

    let newTeamId = 1;

    for (let i = 0; i < teamsList[0].length; i++) {
      let foundUniqueName = false;

      while (foundUniqueName === false) {
        const teamName = `Team ${newTeamId}`;

        if (
          teamsList.flat().includes(teamName) ||
          uniqueNames.includes(teamName)
        ) {
          newTeamId++;
          continue;
        }

        foundUniqueName = true;
        uniqueNames.push(`Team ${newTeamId}`);
      }
    }

    setTeamsList((teamsList) => [...teamsList, [...uniqueNames]]);
  };

  const dropDivision = (indexOfDivision: number) => {
    // Prevent dropping all divisions
    if (teamsList.length === 1) return;

    // Reset the schedule in that case
    setSchedule({});
    const newTeamsList = [...teamsList];
    newTeamsList.splice(indexOfDivision, 1);
    setTeamsList([...newTeamsList]);
  };

  const getTeamNameFromId = (id: number) => {
    const divIndex = Math.floor(id / 100);
    const teamIndex = id % 100;

    return teamsList[divIndex][teamIndex];
  };

  const convertToCSV = () => {
    console.log("YUPP");
    if ("schedule" in schedule) {
      const csvRows: string[] = [`day,home,away,date\n`];

      schedule.schedule.forEach((gameDay, index) => {
        const day = index + 1;

        gameDay.forEach((game) => {
          const homeTeamName = getTeamNameFromId(game.home);
          const awayTeamName = getTeamNameFromId(game.away);

          // Add comma between each value
          csvRows.push(
            `${day},${homeTeamName},${awayTeamName},${game.date.toISOString()}\n`
          );
        });
      });

      // Join every line with new line character
      return csvRows;
    } else {
      return null;
    }
  };

  return (
    <div className="App">
      <div className="wrapper">
        <header>
          <h1>League Schedule Maker</h1>
          <h5>By Phantomat0</h5>
        </header>
        <main>
          <div className="main-container">
            <section className="teams-wrapper">
              <h2>Teams</h2>
              <div className="team-list-wrapper">
                {teamsList.map((divisionTeams, index) => {
                  return (
                    <DivisionTeamsList
                      divisonTeams={divisionTeams}
                      teamsList={teamsList}
                      setTeamsList={setTeamsList}
                      dropDivision={dropDivision}
                      index={index}
                      key={index}
                    />
                  );
                })}
                {teamsList.length < 2 && (
                  <div className="add-div-wrapper">
                    <button
                      onClick={addDivision}
                      className="add-div-bttn input-remove-default"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="settings">
              <h2>Settings</h2>
              <div className="settings-row">
                <h3>
                  Teams play each other
                  <input
                    type="number"
                    onChange={handleNumberOfGamesAgainstEachTeamChange}
                    min="1"
                    max="14"
                    defaultValue={1}
                    className="input-remove-default input-in-line"
                  ></input>
                  {numberOfGamesAgainstEachTeam === 1 ? "time" : "times"}
                </h3>
              </div>
              {teamsList.length > 1 && (
                <div className="settings-row">
                  <h3>
                    Teams play other division
                    <input
                      type="number"
                      onChange={handleGamesAgainstOtherDivisionChange}
                      min="1"
                      max="14"
                      defaultValue={1}
                      className="input-remove-default input-in-line"
                    ></input>
                    {numberOfGamesAgainstEachTeam === 1 ? "time" : "times"}
                  </h3>
                </div>
              )}

              <div className="settings-row start-date-schedule">
                <div className="schedule-picker-wrapper">
                  <h3>Days Of The Week</h3>
                  <div className="schedule-picker">
                    {DAYS_OF_THE_WEEK.map((dayOfTheWeek, index) => {
                      return (
                        <div
                          className="day-of-the-week-item"
                          key={dayOfTheWeek.name}
                        >
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
                </div>
                <div className="start-date-wrapper">
                  <h3>Start Date</h3>
                  <div className="date-container">
                    <DateInput onInputChange={handleStartDateChange} />
                  </div>
                  {makeDateFromDateInputs().toDateString()}
                </div>
              </div>
              <div className="settings-row dates-to-skip-wrapper">
                <div>
                  <h3>Dates To Skip</h3>
                  <div className="dates-to-skip-container">
                    {"dates" in schedule ? (
                      <ul>
                        {sortDatesInScheduleAndSkipped().map((date, index) => {
                          return (
                            <li key={date.toLocaleDateString()}>
                              <input
                                type="checkbox"
                                disabled={index === 0}
                                id={date.toLocaleDateString()}
                                name={date.toLocaleDateString()}
                                value={date.toLocaleDateString()}
                                onClick={handleDateToSkipCheck}
                                defaultChecked={datesToSkip.includes(date)}
                              ></input>
                              <label htmlFor={date.toLocaleDateString()}>
                                {date.toDateString()}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span>None</span>
                    )}
                  </div>
                </div>
                <div className="buttons-container">
                  <button
                    className="input-remove-default generate-sched-bttn"
                    onClick={generateSchedule}
                  >
                    Generate Schedule
                  </button>
                  <button
                    className="input-remove-default csv-bttn"
                    onClick={() => {
                      const fileAsCsv = convertToCSV();

                      if (!fileAsCsv) return;
                      var oMyBlob = new Blob(fileAsCsv, { type: "text/csv" }); // the blob
                      window.open(URL.createObjectURL(oMyBlob));
                    }}
                  >
                    {" "}
                    Export CSV
                  </button>
                </div>
              </div>
              {scheduleError && (
                <div className="error-box">
                  <span>{scheduleError}</span>
                </div>
              )}
            </section>
          </div>

          {"schedule" in schedule && (
            <ScheduleList schedule={schedule} teamsList={teamsList} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
