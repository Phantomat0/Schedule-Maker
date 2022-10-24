interface ScheduleOptions {
  /**
   * The Date the first games will be played on, must correspond with a day of the week from the dayOfWeeks array
   * If omitted, today's date, or the nearest future date to a day of the week will be used
   */
  startDate?: Date;
  /**
   * Dates to be skipped on the schedule, i.e for holidays
   */
  skipDates?: Date[];
}

export type HomeAwayTuple = [number, number];

export default class ScheduleCreator {
  private _startDate: Date;
  private _teams: string[];
  private _daysOfTheWeek: number[];

  constructor(
    teams: string[],
    daysOfTheWeek: number[],
    options?: ScheduleOptions
  ) {
    this._teams = teams;
    this._daysOfTheWeek = this._validateAndSetDaysOfWeek(daysOfTheWeek);
    this._startDate = this._validateAndSetStartDate(options?.startDate);
  }

  create() {
    const numberOfDays = (this._teams.length - 1) * 2;

    const DICTS_OF_GAMES: HomeAwayTuple[] = [];

    const gamesPerDay = Math.floor(this._teams.length / 2);
  }

  private _;

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

  private _validateAndSetStartDate(startDate: ScheduleOptions["startDate"]) {
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
