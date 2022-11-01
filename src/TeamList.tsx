interface TeamListProps {
  teamList: string[];
  setTeamsList: React.Dispatch<React.SetStateAction<string[]>>;
  index: number;
}

const TeamList: React.FC<TeamListProps> = ({
  teamList,
  setTeamsList,
  index,
}) => {
  const onInputChange = (e: any) => {
    const indexOfTeam = parseInt(
      e.target.attributes.getNamedItem("data-team-id").value
    );

    const newTeamList = teamList;

    newTeamList[indexOfTeam] = e.target.value;

    console.log(newTeamList);

    setTeamsList([...newTeamList]);
  };

  const handleDeleteTeam = (e: any) => {
    const indexOfTeam = parseInt(
      e.target.attributes.getNamedItem("data-team-id").value
    );

    let teams = teamList;

    if (teams.length === 2) return null;

    teams.splice(indexOfTeam, 1);

    setTeamsList([...teams]);
  };

  const handleAddNewTeam = () => {
    // Get the id of the new Team, which is the length of the team list
    const newTeamId = teamList.length + 1;

    setTeamsList([...teamList, `Team ${newTeamId}`]);
  };

  return (
    <div>
      <h3>Divison {index}</h3>
      <ul className="team-list">
        {teamList.map((team, index) => {
          return (
            <li key={team + index}>
              <input
                type="text"
                value={teamList[index]}
                className="input-remove-default"
                data-team-id={index}
                onChange={onInputChange}
              />
              <div className="team-del-bttn-wrapper">
                <button
                  className="input-remove-default team-del-bttn"
                  data-team-id={index}
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

export default TeamList;
