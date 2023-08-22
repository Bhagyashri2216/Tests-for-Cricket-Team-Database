const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("server running at http://localhost:3002/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get request
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  const PlayersArray = await db.all(getPlayersQuery);
  response.send(
    PlayersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
//creates a new player in the team (database).player_id is auto-incremented
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayersQuery = `
    INSERT INTO
    cricket_team (player_name, jersey_number, role)
    VALUES
    (
        '${playerName}',
        ${jerseyNumber},
        '${role}');`;
  const dbResponse = await db.run(addPlayersQuery);
  response.send("Player Added to Team");
});

//Returns a player based on a player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `
    SELECT
    *
    FROM
    cricket_team
    WHERE
    player_id = ${playerId};`;
  const player = await db.get(getPlayersQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//Updates the details of a player in the team (database) based on the player ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE 
    cricket_team
    SET
    player_name= '${playerName}',
    jersey_number = ${jerseyNumber},
    role='${role}'
    WHERE
    player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});
//Deletes a player from the team (database) based on the player ID
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
    cricket_team
    WHERE
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
