import {
  datesAreOnSameDay,
  innerConcat,
  shuffleArray,
  splitAt,
} from "./utilts";

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

export class ScheduleCreatorError {
  constructor(public message: string) {
    this.message = message;
  }
}

export type HomeAwayTuple = [number, number];

export default class ScheduleCreator {
  private _startDate: Date;
  private _teams: string[];
  private _teamsAsIds: number[];
  private _settings: Required<Omit<ScheduleSettings, "startDate">>;
  private _daysOfTheWeek: number[];
  private _currentSchedule: HomeAwayTuple[] = [];

  constructor(
    teams: string[],
    daysOfTheWeek: number[],
    settings?: ScheduleSettings
  ) {
    this._teams = teams;
    this._teamsAsIds = this._mapTeamsToIds(teams);
    this._daysOfTheWeek = this._validateAndSetDaysOfWeek(daysOfTheWeek);
    this._startDate = this._validateAndSetStartDate(settings?.startDate);

    this._validateStartDateIsNotSkipDate(settings?.datesToSkip);

    this._settings = this._getDefaultSettings(settings);
  }

  private _validateStartDateIsNotSkipDate(
    datesToSkip: ScheduleSettings["datesToSkip"]
  ) {
    if (!datesToSkip) return;

    if (datesToSkip.some((date) => datesAreOnSameDay(date, this._startDate)))
      throw new ScheduleCreatorError(
        "Validation Error: Start date cannot be skipped"
      );
  }

  private _toHomeAwayControl(
    homeTeam: number,
    awayTeam: number
  ): HomeAwayTuple {
    // Find matchups between these teams
    const matchupsBetweenTeams = this._currentSchedule.filter(
      (matchup) => matchup.includes(homeTeam) && matchup.includes(awayTeam)
    );

    if (matchupsBetweenTeams.length % 2 !== 0) {
      const homeTeamHasMoreHomeGames =
        matchupsBetweenTeams.filter((matchup) => matchup[0] === homeTeam)
          .length >
        matchupsBetweenTeams.length / 2;

      if (homeTeamHasMoreHomeGames) return [awayTeam, homeTeam];
      return [homeTeam, awayTeam];
    }
    // if (homeTeamHasMoreHomeGames) return [awayTeam, homeTeam];
    // return [homeTeam, awayTeam];

    const homeTeamHomeGamesCount = this._currentSchedule.filter(
      (matchups) => matchups[0] === homeTeam
    ).length;
    const awayTeamHomeGamesCount = this._currentSchedule.filter(
      (matchups) => matchups[0] === awayTeam
    ).length;

    if (homeTeamHomeGamesCount > awayTeamHomeGamesCount)
      return [awayTeam, homeTeam];

    return [homeTeam, awayTeam];
  }

  private _createMatchupPairs(
    roundRobinRotated: number[],
    i: number
  ): HomeAwayTuple[] {
    const numbOfPossibleMatchups = Math.floor(roundRobinRotated.length / 2);

    const matchups: HomeAwayTuple[] = [];

    // First matchup always plays
    if (i % 2 === 0) {
      matchups.push(
        this._toHomeAwayControl(roundRobinRotated[0], roundRobinRotated[1])
      );
    } else {
      matchups.push(
        this._toHomeAwayControl(roundRobinRotated[1], roundRobinRotated[0])
      );
    }

    // Then get the next item from the left of array, and next item from right of array
    // If there is an odd number of teams, the median will be our bye
    for (let i = 2; i < numbOfPossibleMatchups + 1; i++) {
      matchups.push(
        this._toHomeAwayControl(
          roundRobinRotated[roundRobinRotated.length + 1 - i],
          roundRobinRotated[i]
        )
      );
    }

    return matchups;
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

  private _createScheduledMatchups() {
    const numberOfGames =
      (this._teams.length - 1) *
      this._settings.gamesAgainstEachTeam *
      (this._teams.length / 2);

    const numberOfGameDays =
      numberOfGames /
      Math.floor((this._teams.length / 2) * this._settings.gamesPerDay);

    const isEvenTeams = this._teams.length % 2 === 0;

    // Shuffle the teams that way we get a unique schedule every time
    const teamsShuffled = shuffleArray(this._teamsAsIds);

    for (let i = 0; i < numberOfGameDays; i++) {
      const sortedRoundRobin = isEvenTeams
        ? this._rotateRoundRobinClockwiseEvenTeams(teamsShuffled, i)
        : this._rotateRoundRobinClockwiseOddTeams(teamsShuffled, i);

      const matchups = this._createMatchupPairs(sortedRoundRobin, i);

      this._currentSchedule.push(...shuffleArray(matchups));
    }

    return {
      schedule: this._currentSchedule,
      numberOfGames,
      numberOfGameDays,
    };
  }

  private _getMatchDayDates(numberOfGameDays: number) {
    const startDate = this._startDate;

    const dates: Date[] = [startDate];

    let days = 1;

    while (dates.length !== numberOfGameDays) {
      const newDate = new Date(this._startDate);

      const futureDate = new Date(newDate.setDate(startDate.getDate() + days));

      const dayOfTheWeek = futureDate.getDay();

      if (this._daysOfTheWeek.includes(dayOfTheWeek)) {
        // Check if we are meant to skip this date
        if (
          this._settings.datesToSkip.some((date) =>
            datesAreOnSameDay(date, futureDate)
          )
        ) {
          days++;
          continue;
        }

        dates.push(futureDate);
      }

      days++;
    }

    return dates;
  }

  private _assignMatchDayDates(
    schedule: HomeAwayTuple[],
    matchDayDates: Date[]
  ) {
    const matchDaysWithDates = [];

    for (let i = 0; i < matchDayDates.length; i++) {
      const matchDayMatchups = [];

      for (let j = 0; j < Math.floor(this._teams.length / 2); j++) {
        const adjustedJ: number =
          matchDaysWithDates.length * Math.floor(this._teams.length / 2) +
          matchDayMatchups.length;

        matchDayMatchups.push({
          date: matchDayDates[i],
          home: schedule[adjustedJ][0],
          away: schedule[adjustedJ][1],
        });
      }

      matchDaysWithDates.push(matchDayMatchups);
    }

    return matchDaysWithDates;
  }

  create() {
    const { schedule, numberOfGameDays, numberOfGames } =
      this._createScheduledMatchups();

    const matchDayDates = this._getMatchDayDates(numberOfGameDays);

    const fullSchedule = this._assignMatchDayDates(schedule, matchDayDates);

    return {
      numberOfGameDays,
      numberOfGames,
      schedule: fullSchedule,
      startDate: fullSchedule[0][0].date,
      endDate: fullSchedule[fullSchedule.length - 1][0].date,
      dates: matchDayDates,
    };
  }

  private _rotateRoundRobinClockwiseEvenTeams(
    teamArr: number[],
    iterations: number
  ): number[] {
    // If the number of iterations exceeds the team length, just get the remainder
    if (iterations >= teamArr.length - 1) {
      iterations = iterations % (teamArr.length - 1);
    }

    const newArr = new Array(teamArr.length);

    // The first value is locked for even teams
    newArr[0] = teamArr[0];

    // First lets move the number of elements (iterations) from the end of the array, to the start
    // starting with element index 1, because 0 is locked
    for (let i = 0; i < iterations; i++) {
      newArr[i + 1] = teamArr[teamArr.length - iterations + i];
    }

    // Now lets just paste the rest of the array, after all those iterations
    for (let j = iterations + 1; j < teamArr.length; j++) {
      newArr[j] = teamArr[j - iterations];
    }

    // [arr[0], ...elemsFromEndOfArray, ...restOfArray]
    return newArr;
  }

  private _rotateRoundRobinClockwiseOddTeams(
    teamArr: number[],
    iterations: number
  ): number[] {
    if (iterations >= teamArr.length) {
      iterations = iterations % teamArr.length;
    }

    const newArr = new Array(teamArr.length);

    // First lets move the number of elements (iterations) from the end of the array, to the start
    for (let i = 0; i < iterations; i++) {
      newArr[i] = teamArr[teamArr.length - iterations + i];
    }

    // Now lets just copy all the items that werent moved, after all the items we just added
    for (let j = iterations; j < teamArr.length; j++) {
      newArr[j] = teamArr[j - iterations];
    }

    // [...elemsMoved, ...elemsNotMoved]
    return newArr;
  }

  private _mapTeamsToIds(teams: string[]) {
    return teams.map((el, index) => index);
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
      throw new ScheduleCreatorError(
        `Validation Error: ${invalidDaysOfWeek.join(
          " "
        )}. Days of the Week must be integers between 0 and 6.`
      );

    const defaultDaysOfTheWeek = [new Date().getDay()];

    if (daysOfWeek.length === 0) return defaultDaysOfTheWeek;

    return daysOfWeek;
  }

  private _setStartDateToNearestFutureDayOfWeek() {
    // Get current date
    const startDate = new Date(new Date().setHours(0, 0, 0, 0));

    let days = 0;
    while (true) {
      const newDate = new Date();

      const futureDate = new Date(newDate.setDate(startDate.getDate() + days));

      const dayOfTheWeek = futureDate.getDay();

      if (this._daysOfTheWeek.includes(dayOfTheWeek)) return futureDate;

      days++;
    }
  }

  private _validateAndSetStartDate(startDate: ScheduleSettings["startDate"]) {
    // Check if we have a supplied start date
    if (!startDate) return this._setStartDateToNearestFutureDayOfWeek();

    // startDate = new Date(startDate.setHours(8, 0, 0, 0));

    // If we do, validate that it starts on a day of the week that we provided
    const dayOfWeekAsInt = startDate.getDay();

    const startDateIsOfSuppliedDaysOfWeek =
      this._daysOfTheWeek.includes(dayOfWeekAsInt);

    if (!startDateIsOfSuppliedDaysOfWeek)
      throw new ScheduleCreatorError(
        `Validation Error: Start Date ${startDate.toDateString()} does not fall of any of the following days of the week: ${this._daysOfTheWeek.join(
          " "
        )} `
      );

    return startDate;
  }
}
