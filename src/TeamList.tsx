interface TeamListProps {
  teamList: string[];
  setTeamsList: React.Dispatch<React.SetStateAction<string[]>>;
}

const TeamList: React.FC<TeamListProps> = ({ teamList, setTeamsList }) => {
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

    teams.splice(indexOfTeam, 1);

    setTeamsList([...teams]);
  };

  const handleAddNewTeam = () => {
    // Get the id of the new Team, which is the length of the team list
    const newTeamId = teamList.length + 1;

    setTeamsList([...teamList, `Team ${newTeamId}`]);
  };

  return (
    <div className="team-list-wrapper">
      <ul>
        {teamList.map((team, index) => {
          return (
            <li>
              <input
                type="text"
                value={teamList[index]}
                data-team-id={index}
                onChange={onInputChange}
              />
              <button data-team-id={index} onClick={handleDeleteTeam}>
                -
              </button>
            </li>
          );
        })}
        <li>
          <button onClick={handleAddNewTeam}>Add Team</button>
        </li>
      </ul>
    </div>
  );
};

export default TeamList;
