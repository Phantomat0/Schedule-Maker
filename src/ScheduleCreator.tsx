import { innerConcat, shuffleArray, splitAt } from "./utilts";

interface ScheduleSettings {
  /**
   * The Date the first games will be played on, must correspond with a day of the week from the dayOfWeeks array
   * If omitted, today's date, or the nearest future date to a day of the week will be used
   */
  startDate?: Date;
  /**
   * Dates to be skipped on the schedule, i.e for holidays. Must fall on a day of the week that is provided
   */
  datesToSkip?: Date[];
  /**
   * How many games each team players per day
   * @default 1
   */
  gamesPerDay?: number;

  /**
   * How many times each team plays another team
   * @default 1
   */
  gamesAgainstEachTeam?: number;
}

export type HomeAwayTuple = [number, number];

export default class ScheduleCreator {
  private _startDate: Date;
  private _teams: string[];
  private _teamsAsIds: number[];
  private _settings: Required<Omit<ScheduleSettings, "startDate">>;
  private _daysOfTheWeek: number[];

  constructor(
    teams: string[],
    daysOfTheWeek: number[],
    settings?: ScheduleSettings
  ) {
    this._teams = teams;
    this._teamsAsIds = this._mapTeamsToIds(teams);
    this._daysOfTheWeek = this._validateAndSetDaysOfWeek(daysOfTheWeek);
    this._startDate = this._validateAndSetStartDate(settings?.startDate);

    this._settings = this._getDefaultSettings(settings);
  }

  private _getDefaultSettings(settings: ScheduleSettings = {}) {
    const {
      datesToSkip = [],
      gamesPerDay = 1,
      gamesAgainstEachTeam = 1,
    } = settings;

    return {
      datesToSkip,
      gamesPerDay,
      gamesAgainstEachTeam,
    };
  }

  /**
   * Defines the max iterations on a given match day before recreating a schedule
   */
  private _defineMaxIterationsCount() {
    return this._teams.length * this._teams.length;
  }

  create() {
    const numberOfGameDays =
      ((this._teams.length - 1) * this._settings.gamesAgainstEachTeam) /
      this._settings.gamesPerDay;

    const numberOfGames =
      (this._teams.length - 1) *
      this._settings.gamesAgainstEachTeam *
      (this._teams.length / 2);

    const maxIterationsCount = this._defineMaxIterationsCount();

    let currentSchedule: HomeAwayTuple[] = [];

    let isValidHomeAndAway = false;

    // We can only enforce valid home and away when the number of games each team has is even
    const canEnforceValidHomeAndAway =
      (numberOfGameDays * this._settings.gamesPerDay) % 2 === 0;

    while (
      currentSchedule.length < numberOfGames ||
      (isValidHomeAndAway === false &&
        canEnforceValidHomeAndAway &&
        this._teams.length < 11)
    ) {
      currentSchedule = [];
      console.log("Create new Schedule");

      for (let i = 0; i < numberOfGameDays; i++) {
        let isValidDay = false;
        let dayIterations = 0;

        while (isValidDay === false && dayIterations < maxIterationsCount) {
          dayIterations++;
          const shuffledTeams = shuffleArray(this._teamsAsIds);

          const { pairs, byeTeam } = this._pairTeams(
            shuffledTeams,
            currentSchedule
          );

          isValidDay = this._validatePairs(
            pairs,
            byeTeam,
            currentSchedule,
            Math.floor(
              i / (numberOfGameDays / this._settings.gamesAgainstEachTeam)
            ) + 1
          );

          if (!isValidDay) continue;

          // Hash each matchup, and add it
          pairs.forEach((pair) => {
            currentSchedule.push(pair);
          });
        }

        if (dayIterations === maxIterationsCount) break;
      }

      // Check that every team has the same amount of home and away games
      const homeGames = this._getAllTeamsNumberOfHomeGames(
        this._teamsAsIds,
        currentSchedule
      );

      isValidHomeAndAway = homeGames.every((el) => el === homeGames[0]);
    }

    return currentSchedule;
  }

  private _mapTeamsToIds(teams: string[]) {
    return teams.map((el, index) => index);
  }

  private _pairTeams(teamsAsIds: number[], schedule: HomeAwayTuple[]) {
    return teamsAsIds.reduce(
      (
        acc: { pairs: HomeAwayTuple[]; byeTeam: number },
        currentTeam,
        index
      ) => {
        if (index % 2 !== 0) return acc;

        const nextTeam = teamsAsIds[index + 1];

        if (!nextTeam && nextTeam !== 0) {
          // acc.byeTeam = currentTeam
          return acc;
        }

        // Now lets find the team with less home games, and make them home

        const team1HomeGames = schedule.filter(
          (matchup) => matchup[0] === currentTeam
        );
        const team2HomeGames = schedule.filter(
          (matchup) => matchup[0] === nextTeam
        );

        if (team1HomeGames.length > team2HomeGames.length) {
          acc.pairs.push([nextTeam, currentTeam]);
        } else {
          acc.pairs.push([currentTeam, nextTeam]);
        }

        return acc;
      },
      { pairs: [], byeTeam: -1 }
    );
  }

  private _validatePairs(
    pairs: HomeAwayTuple[],
    byeTeam: number,
    currentSchedule: HomeAwayTuple[],
    roundNumber: number
  ) {
    const duplicateMatchups = pairs.filter((pair) => {
      const matchesTeamsHavePlayed = currentSchedule.filter(
        (matchUp) => matchUp.includes(pair[0]) && matchUp.includes(pair[1])
      );
      return matchesTeamsHavePlayed.length >= roundNumber;
    });

    if (duplicateMatchups.length > 0) return false;
    return true;
  }

  private _getAllTeamsNumberOfHomeGames(
    teamIds: number[],
    schedule: HomeAwayTuple[]
  ) {
    return teamIds.map((team) =>
      this._getTeamsNumberOfHomeGames(team, schedule)
    );
  }

  private _getTeamsNumberOfHomeGames(
    teamId: number,
    schedule: HomeAwayTuple[]
  ) {
    return schedule.filter((matchup) => matchup[0] === teamId).length;
  }

  private _shuffleTeams(teamsIds: number[], schedule: HomeAwayTuple[]) {
    const sorted = this._sortByHomeGames(teamsIds, schedule);

    const [homeMost, homeLeast] = splitAt(
      Math.floor(teamsIds.length / 2),
      sorted
    );

    const homeMostShuffled = shuffleArray(homeMost);
    const homeLeastShuffled = shuffleArray(homeLeast);

    return innerConcat(homeLeastShuffled, homeMostShuffled);
  }

  private _sortByHomeGames(teams: number[], schedule: HomeAwayTuple[]) {
    return teams.sort(
      (a, b) =>
        this._getTeamsNumberOfHomeGames(b, schedule) -
        this._getTeamsNumberOfHomeGames(a, schedule)
    );
  }

  private _validateAndSetDaysOfWeek(daysOfWeek: number[]) {
    // Filter out duplicates
    daysOfWeek = Array.from(new Set(daysOfWeek));

    // Validate a valid day of the week, Int between 0 and 6

    const invalidDaysOfWeek = daysOfWeek.filter(
      (daysOfWeek) =>
        daysOfWeek < 0 ||
        daysOfWeek > 6 ||
        Number.isInteger(daysOfWeek) === false
    );

    if (invalidDaysOfWeek.length > 0)
      throw Error(
        `Validation Error: ${invalidDaysOfWeek.join(
          " "
        )}. Days of the Week must be integers between 0 and 6.`
      );

    return daysOfWeek;
  }

  private _setStartDateToNearestFutureDayOfWeek() {
    return new Date(Date.now());
  }

  private _validateAndSetStartDate(startDate: ScheduleSettings["startDate"]) {
    // Check if we have a supplied start date
    const suppliedStartDate = startDate;

    if (!suppliedStartDate) return this._setStartDateToNearestFutureDayOfWeek();

    // If we do, validate that it starts on a day of the week that we provided
    const dayOfWeekAsInt = suppliedStartDate.getDay();

    const startDateIsOfSuppliedDaysOfWeek =
      this._daysOfTheWeek.includes(dayOfWeekAsInt);

    if (!startDateIsOfSuppliedDaysOfWeek)
      throw Error(
        `Validation Error: Start Date ${suppliedStartDate.getDate()} does not fall of any of the following days of the week: ${this._daysOfTheWeek.join(
          " "
        )} `
      );

    return startDate;
  }
}
