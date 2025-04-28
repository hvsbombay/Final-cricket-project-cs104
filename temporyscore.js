// score.js - Handles setup, live match, scorecard, and summary logic

// ------------------ Setup Page Logic ------------------
if (window.location.pathname.includes("setup.html")) {
    document.getElementById("setupForm").addEventListener("submit", function (e) {
      e.preventDefault();
  
      const team1 = document.getElementById("team1").value.trim();
      const team2 = document.getElementById("team2").value.trim();
      const tossWinner = document.getElementById("tossWinner").value;
      const tossDecision = document.getElementById("tossDecision").value;
  
      let matchData = {
        team1: team1,
        team2: team2,
        tossWinner: tossWinner === "team1" ? team1 : team2,
        tossDecision,
        overs: 2,
        innings: 1,
        score: 0,
        score2inning: 0,
        wickets: 0,
        wickets2inning: 0, 
        balls: 0,
        balls2inning: 0,
        currentBatter: {
          name: '',
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0
        },
        nonStrikeBatter: {
          name: '',
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0
        },
        currentBowler: {
          name: '',
          overs: 0,
          runs: 0,
          wickets: 0
        },
        battingScorecard: {}, 
        bowlingScorecard: {},
      };
  
      localStorage.setItem("matchData", JSON.stringify(matchData));
      window.location.href = "live.html";
    });
  }
  
  // ------------------ Live Match Logic ------------------
  if (window.location.pathname.includes("live.html")) {
    let matchData = JSON.parse(localStorage.getItem("matchData"));
    let innings = matchData.innings[matchData.currentInnings - 1];
  
    const scoreDisplay = document.getElementById("scoreDisplay");
    const batterTable = document.getElementById("batterTable");
    const bowlerInfo = document.getElementById("bowlerInfo");
  
    let strikeBatter = prompt("Enter Strike Batter's Name:");
    let nonStrikeBatter = prompt("Enter Non-Strike Batter's Name:");
    let currentBowler = prompt("Enter Bowler's Name:");
  
    let batterStats = {
      [strikeBatter]: { runs: 0, balls: 0, fours: 0, sixes: 0 },
      [nonStrikeBatter]: { runs: 0, balls: 0, fours: 0, sixes: 0 }
    };
    let bowlerStats = {
      [currentBowler]: { overs: 0, balls: 0, runs: 0, wickets: 0 }
    };
  
    function updateScoreDisplay() {
      let over = Math.floor(innings.balls / 6);
      let ball = innings.balls % 6;
      scoreDisplay.textContent = `${matchData.team1} ${innings.runs}/${innings.wickets} (${over}.${ball})`;
    }
  
    function updateTables() {
      const updateRow = (name) => {
        const b = batterStats[name];
        const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0";
        return `<td>${name}</td><td>${b.runs}</td><td>${b.balls}</td><td>${b.fours}</td><td>${b.sixes}</td><td>${sr}</td>`;
      };
      document.getElementById("strikeBatter").innerHTML = updateRow(strikeBatter);
      document.getElementById("nonStrikeBatter").innerHTML = updateRow(nonStrikeBatter);
  
      const bowler = bowlerStats[currentBowler];
      const economy = bowler.balls > 0 ? (bowler.runs / (bowler.balls / 6)).toFixed(2) : "0.00";
      const overs = `${Math.floor(bowler.balls / 6)}.${bowler.balls % 6}`;
      bowlerInfo.textContent = `${currentBowler} - ${overs} overs, ${bowler.runs} runs, ${bowler.wickets} wickets, Econ: ${economy}`;
    }
  
    window.addRuns = function (runs) {
      innings.runs += runs;
      innings.balls++;
  
      batterStats[strikeBatter].runs += runs;
      batterStats[strikeBatter].balls++;
      if (runs === 4) batterStats[strikeBatter].fours++;
      if (runs === 6) batterStats[strikeBatter].sixes++;
  
      bowlerStats[currentBowler].balls++;
      bowlerStats[currentBowler].runs += runs;
  
      if (runs % 2 === 1) {
        [strikeBatter, nonStrikeBatter] = [nonStrikeBatter, strikeBatter];
      }
  
      if (bowlerStats[currentBowler].balls % 6 === 0) {
        currentBowler = prompt("Over complete. Enter new bowler's name:");
        if (!bowlerStats[currentBowler]) {
          bowlerStats[currentBowler] = { overs: 0, balls: 0, runs: 0, wickets: 0 };
        }
        [strikeBatter, nonStrikeBatter] = [nonStrikeBatter, strikeBatter];
      }
  
      updateScoreDisplay();
      updateTables();
    };
  
    window.registerWicket = function () {
      innings.wickets++;
      innings.balls++;
      bowlerStats[currentBowler].balls++;
      bowlerStats[currentBowler].wickets++;
      batterStats[strikeBatter].balls++;
  
      const newBatter = prompt("Enter name of new batter:");
      batterStats[newBatter] = { runs: 0, balls: 0, fours: 0, sixes: 0 };
      strikeBatter = newBatter;
  
      if (bowlerStats[currentBowler].balls % 6 === 0) {
        currentBowler = prompt("Over complete. Enter new bowler's name:");
        if (!bowlerStats[currentBowler]) {
          bowlerStats[currentBowler] = { overs: 0, balls: 0, runs: 0, wickets: 0 };
        }
        [strikeBatter, nonStrikeBatter] = [nonStrikeBatter, strikeBatter];
      }
  
      updateScoreDisplay();
      updateTables();
    };
  
    window.goToScorecard = function () {
      localStorage.setItem("batterStats", JSON.stringify(batterStats));
      localStorage.setItem("bowlerStats", JSON.stringify(bowlerStats));
      localStorage.setItem("matchData", JSON.stringify(matchData));
      window.location.href = "scorecard.html";
    };
  
    updateScoreDisplay();
    updateTables();
  }
  
  // ------------------ Scorecard Page Logic ------------------
  if (window.location.pathname.includes("scorecard.html")) {
    const batterStats = JSON.parse(localStorage.getItem("batterStats"));
    const bowlerStats = JSON.parse(localStorage.getItem("bowlerStats"));
  
    const battingTable = document.getElementById("battingTable").querySelector("tbody");
    const bowlingTable = document.getElementById("bowlingTable").querySelector("tbody");
  
    for (let name in batterStats) {
      const b = batterStats[name];
      const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0";
      const row = `<tr><td>${name}</td><td>${b.runs}</td><td>${b.balls}</td><td>${b.fours}</td><td>${b.sixes}</td><td>${sr}</td></tr>`;
      battingTable.innerHTML += row;
    }
  
    for (let name in bowlerStats) {
      const b = bowlerStats[name];
      const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`;
      const econ = b.balls > 0 ? (b.runs / (b.balls / 6)).toFixed(2) : "0.00";
      const row = `<tr><td>${name}</td><td>${overs}</td><td>${b.runs}</td><td>${b.wickets}</td><td>${econ}</td></tr>`;
      bowlingTable.innerHTML += row;
    }
  
    window.goBackToLive = function () {
      window.location.href = "live.html";
    }
  }
  
  // ------------------ Summary Page Logic ------------------
  if (window.location.pathname.includes("summary.html")) {
    const matchData = JSON.parse(localStorage.getItem("matchData"));
    const resultText = document.getElementById("resultText");
  
    const firstInnings = matchData.innings[0];
    const secondInnings = matchData.innings[1];
  
    const teamA = matchData.team1;
    const teamB = matchData.team2;
  
    if (secondInnings.runs > firstInnings.runs) {
      const wicketsLeft = 10 - secondInnings.wickets;
      const ballsLeft = matchData.overs * 6 - secondInnings.balls;
      resultText.textContent = `${teamB} wins by ${wicketsLeft} wickets (${ballsLeft} balls left)!`;
    } else if (secondInnings.runs < firstInnings.runs) {
      const runMargin = firstInnings.runs - secondInnings.runs;
      resultText.textContent = `${teamA} wins by ${runMargin} runs!`;
    } else {
      resultText.textContent = `Match Tied!`;
    }
  
    window.resetMatch = function () {
      localStorage.clear();
      window.location.href = "setup.html";
    }
  }


  //livejs  2nd 25-04
  // ------------------ Live Match Page Logic ------------------
  function liveMatchPage() {
    const matchData = JSON.parse(localStorage.getItem('matchData'));
    if (!matchData) {
      alert('No match data found. Please set up a match first.');
      window.location.href = 'setup.html';
      return;
    }
  
    document.getElementById('team1Name').textContent = matchData.team1;
    document.getElementById('team2Name').textContent = matchData.team2;
    document.getElementById('tossWinner').textContent = `Toss Winner: ${matchData.tossWinner}`;
    document.getElementById('tossDecision').textContent = `Toss Decision: ${matchData.tossDecision}`;
  
    updateScoreboard(matchData);
  
    document.getElementById('runButton').addEventListener('click', function() {
      updateScore(matchData, 1);
    });
  
    document.getElementById('fourButton').addEventListener('click', function() {
      updateScore(matchData, 4);
    });
  
    document.getElementById('sixButton').addEventListener('click', function() {
      updateScore(matchData, 6);
    });
  
    document.getElementById('wicketButton').addEventListener('click', function() {
      updateWicket(matchData);
    });
  
    document.getElementById('oversButton').addEventListener('click', function() {
      updateOvers(matchData);
    });
  
    document.getElementById('nextBatterButton').addEventListener('click', function() {
      nextBatter(matchData);
    });
  
    document.getElementById('nextBowlerButton').addEventListener('click', function() {
      nextBowler(matchData);
    });
  } 

  