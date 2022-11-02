interface TeamListProps {
  divisonTeams: string[];
  teamsList: string[][];
  setTeamsList: React.Dispatch<React.SetStateAction<string[][]>>;
  dropDivision: (indexOfDivision: number) => void;
  index: number;
}

const DivisionTeamsList: React.FC<TeamListProps> = ({
  divisonTeams,
  teamsList,
  setTeamsList,
  dropDivision,
  index,
}) => {
  const onInputChange = (e: any) => {
    e.preventDefault();
    const idOfTeam = e.target.attributes.getNamedItem("data-team-id").value;

    const [_, indexInList] = idOfTeam.split("-");

    const newTeamList = [...teamsList];

    newTeamList[index][indexInList as number] = e.target.value;

    setTeamsList([...newTeamList]);
  };

  const handleDeleteTeam = (e: any) => {
    const idOfTeam = e.target.attributes.getNamedItem("data-team-id").value;

    const [_, indexInList] = idOfTeam.split("-");

    const newTeamList = [...teamsList];

    // Prevent division from having too little teans
    if (teamsList.length === 1) {
      if (newTeamList[index].length === 2) return null;
    } else {
      if (newTeamList[index].length === 1) return null;
    }

    newTeamList[index].splice(indexInList, 1);

    setTeamsList([...newTeamList]);
  };

  const handleAddNewTeam = () => {
    // Get the id of the new Team, which is the length of the team list
    let newTeamId = 1;

    let foundUniqueName = false;

    while (foundUniqueName === false) {
      const teamName = `Team ${newTeamId}`;

      if (teamsList.flat().includes(teamName)) {
        newTeamId++;
        continue;
      }

      foundUniqueName = true;
    }

    const newTeamList = [...teamsList];

    newTeamList[index] = [...newTeamList[index], `Team ${newTeamId}`];

    setTeamsList([...newTeamList]);
  };

  return (
    <div>
      <div className="div-header-box">
        <h3>Division {index + 1}</h3>
        <button
          className="drop-div-bttn input-remove-default"
          onClick={() => dropDivision(index)}
        >
          -
        </button>
      </div>
      <ul className="team-list">
        {divisonTeams.map((team, indexOnTeamList) => {
          return (
            <li key={indexOnTeamList}>
              <input
                type="text"
                value={divisonTeams[indexOnTeamList]}
                className="input-remove-default"
                data-team-id={`${index}-${indexOnTeamList}`}
                onChange={onInputChange}
              />
              <div className="team-del-bttn-wrapper">
                <button
                  className="input-remove-default team-del-bttn"
                  data-team-id={`${index}-${indexOnTeamList}`}
                  onClick={handleDeleteTeam}
                >
                  -
                </button>
              </div>
            </li>
          );
        })}
        <li>
          <button
            className="input-remove-default team-add-bttn"
            onClick={handleAddNewTeam}
          >
            Add Team
          </button>
        </li>
      </ul>
    </div>
  );
};

export default DivisionTeamsList;
