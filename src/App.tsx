import { useState } from "react";
import DateInput from "./DateInput";
import ScheduleCreator, { ScheduleCreatorError } from "./ScheduleCreator";
import ScheduleList from "./ScheduleList";
import TeamList from "./TeamList";

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
  const [teamsList, setTeamsList] = useState<string[]>(["Team 1", "Team 2"]);
  const [numberOfGamesAgainstEachTeam, setNumberOfGamesAgainstEachTeam] =
    useState<number>(1);
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
    ReturnType<ScheduleCreator["create"]> | {}
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
      const scheduleObj = new ScheduleCreator(
        new Array(teamsList.length).fill(1).map((el, index) => `${index}`),
        daysOfTheWeek,
        {
          gamesAgainstEachTeam: numberOfGamesAgainstEachTeam,
          startDate: makeDateFromDateInputs(),
          datesToSkip: datesToSkip,
        }
      ).create();

      setSchedule(scheduleObj);
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

  const convertToCSV = () => {
    if ("schedule" in schedule) {
      const flatSchedule = schedule.schedule.flat();
      const headers = Object.keys(flatSchedule[0]);

      const csvRows: string[] = [`home, away, date \n`];

      for (const row of flatSchedule) {
        // Add comma between each value
        csvRows.push(`${row.home}, ${row.away}, ${row.date.toISOString()}\n`);
      }

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
          <h1>Schedule Maker</h1>
        </header>
        <main>
          <div className="main-container">
            <section className="teams-wrapper">
              <h2>Teams</h2>
              <div className="team-list-wrapper">
                <TeamList
                  teamList={teamsList}
                  setTeamsList={setTeamsList}
                  index={1}
                />
                <div className="add-div-wrapper">
                  <button className="add-div-bttn input-remove-default">
                    +
                  </button>
                </div>
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
