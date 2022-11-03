# League Schedule Maker

#### Typescript, ReactJS, HTML, CSS

#### Video Demo: [PLACE_HOLDER]

Schedule maker specifically for sports leagues.
Although many schedule makers already exist, I was not fond of them since they did not fit the needs for my projects, mainly:

- Lacked Divisional functionality (i.e play only 1 game against a non divisional opponent)
- No support for custom dates (i.e play every Tuesday and Thursday but don't play the Thursday of Thanksgiving)
- No CSV support

Thus, I created my own league schedule maker utilising the round robin algorithm to schedule games. Alongside the basic round robin support, this schedule maker provides the following features:

- Two division functionality
  - Set how many games each team plays against the other division
- Set how many times you play each team in your own division
- Add teams, delete teams, set team names
- Date support
  - Play games on certain days of the week.
  - Set a start date and time
  - Select days to skip from a list of game days inferred from your start date
- Provides useful schedule stats out the gate such as total games, end date, duration of the season, game days
- Export as CSV
- Randomised schedule

## Outline

All files found in **/src** directory

#### **index.tsx**

Default index page for ReactJS, this was left untouched

#### **App.tsx**

Index file, storing all components and state

#### **DateInput.tsx**

Exports a custom date input component. Initially I used the native HTML date and time tag, but I was made aware that it would not work on Safari or some mobile devices. Therefore I created my own date input using select inputs

#### **DivisionTeamsList.tsx**

Exports a component which renders a list of all the teams in a division. Allows you to hover over each to reveal a delete button to delete a team, or add a team by clicking the "Add Team" button. You may also drop the division by hovering over the name and revealing the drop division button

#### **ScheduleCreator.tsx**

Exports a ScheduleCreatorClass which handles all the logic of creating the schedule by taking in the user inputs from the state, and outputting an object containing the schedule, and useful such as total number of games, end date etc. Utilises an OOP format.

#### **ScheduleList.tsx**

Exports a component which renders the schedule alongside a table of all the teams, their total games played, and their home and away games. This was used primarily for testing to ensure each team was playing the right amount of games. However, it might prove useful when creating schedules with each team playing an odd number of games to be able to see the distribution of home and away games.

#### **utils.tsx**

Exports numerous utility functions that were used throughout the projects

- daysDiff: Returns the difference in days between two dates
  - Used to show how long the season will be in days
- datesAreOnSameDay: Returns a boolean value indicating whether two dates are on the same day
  - Used to schedule games on a specific week when looping over days
- getRandomIntInRange: Returns a random int within a range
  - Used to get the game days where we would play divisional games
- shuffleArray: Shuffles an array randomly
  - Used to create random schedules by shuffling the teams and matchups so that each schedule is random
