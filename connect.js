const fs = require("fs");

const liveGames = "/workspace/Gecko/database/live_games.json";

function createLiveGame(data) {
  const file = require(liveGames);

  const id = new Date().getTime();
  if (file[id])
    return "failure";

  file[id] = data;

  fs.writeFile(liveGames, JSON.stringify(file), function writeJSON(error) {
    if (error) return console.log(error);

    return id;
  });

  return id.toString();
}

function getLiveGame(id) {
  const file = require(liveGames);

  if (!file[id])
    return "no game";

  return file[id];
}

module.exports = {
  getLiveGame: getLiveGame,
  createLiveGame: createLiveGame
};