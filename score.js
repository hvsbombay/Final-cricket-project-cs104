document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('setupForm')) {
    setupPage();
  }
  else if (document.getElementById('matchTitle')) {
    liveMatchPage();
  }
  else if (document.getElementsByClassName('scorecard-container').length > 0) { 
    scorecardPage();
  }
  else if (document.getElementById('resultText')) {
    summaryPage();
  }
});
  
    
    // ------------------ Setup Page Logic ------------------
    function setupPage() {
      document.getElementById('setupForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const team1 = document.getElementById('team1').value.trim();
        const team2 = document.getElementById('team2').value.trim();
        const tossWinner = document.getElementById('tossWinner').value;
        const tossDecision = document.getElementById('tossDecision').value;
    
        let matchData = {
          team1: team1,
          team2: team2,
          tossWinner: tossWinner === 'team1' ? team1 : team2,
          tossDecision: tossDecision,
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
            balls: 0,
            runs: 0,
            wickets: 0
          },
          battingScorecard: {}, 
          bowlingScorecard: {},
        };
    
        while (!matchData.currentBatter.name) {
          matchData.currentBatter.name = prompt("Enter the striker's name:");
        }
    
        while (!matchData.nonStrikeBatter.name) {
          matchData.nonStrikeBatter.name = prompt("Enter the non-striker's name:");
        }
    
        while (!matchData.currentBowler.name) {
          matchData.currentBowler.name = prompt("Enter the first bowler's name:");
        }
    
        localStorage.setItem('matchData', JSON.stringify(matchData));
        window.location.href = 'live.html';
      });
    }

  function liveMatchPage() {
    let matchData = JSON.parse(localStorage.getItem('matchData')); 
    if (!matchData) {
    alert("No match data found. Please set up a match first.");
    window.location.href = 'setup.html';
    return;
  }
  updateLive(matchData);
  const runBtn=document.querySelectorAll('.runBtn');
  runBtn.forEach(btn => {
    btn.addEventListener('click', function() {
      let runs = this.getAttribute('data-run');
      if (runs === 'Wicket') {
        getout(matchData);
      }
      else{
        runs = parseInt(runs);
        increaseRuns(matchData, runs);
      };
    });
  });

    function getout(matchData) {
      matchData.wickets++;
      matchData.currentBowler.wickets++;
      const nextBatterName = prompt("Enter next batter's name:"); // || `batter${matchData.wickets + 2}`;
      matchData.currentBatter = {
        name: nextBatterName,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0
      };
      localStorage.setItem('matchData', JSON.stringify(matchData));
      updateLive(matchData);
    }

    function increaseRuns(matchData, runs) {
      if (matchData.innings === 1) {
      matchData.score += runs;
      matchData.currentBatter.runs += runs;
      matchData.currentBowler.runs += runs; 
      matchData.currentBatter.balls++;
      matchData.currentBowler.balls++;
      matchData.balls++;
      //maybe need to add runs 
      if (matchData.balls % 6 === 0 && matchData.balls < 12) {
          const nextBowler = prompt("Enter next bowler name:") || matchData.currentBowler.name;
          matchData.currentBowler = { name: nextBowler, balls: 0, runs: 0, wickets: 0,};
          [matchData.currentBatter, matchData.nonStrikeBatter] = [matchData.nonStrikeBatter, matchData.currentBatter];
      }
      else if (matchData.balls % 6 === 0 && matchData.balls >= 12) {
          alert("Innings Over! Switch to the second innings.");
          matchData.innings = 2;
          matchData.score = matchData.score2inning;
          matchData.wickets = matchData.wickets2inning;
          [matchData.battingTeam, matchData.bowlingTeam] = [matchData.bowlingTeam, matchData.battingTeam];
          const Bowler = prompt("Enter bowler name for 2nd inning:") || matchData.currentBowler.name;
          matchData.currentBowler = { name: Bowler, balls: 0, runs: 0, wickets: 0,};
          const striker = prompt("Enter striker batter name for 2nd inning:") || matchData.currentBatter.name;
          matchData.currentBatter = { name: striker, runs: 0, balls: 0, fours: 0, sixes: 0 };
          const NonStriker = prompt("Enter non-striker batter name for 2nd inning:") || matchData.nonStrikeBatter.name;
          matchData.nonStrikeBatter = { name: NonStriker, runs: 0, balls: 0, fours: 0, sixes: 0 };
          matchData.score = 0;
          matchData.wickets = 0;
          matchData.balls = 0;
      }
    } else {
      matchData.score2inning += runs;
      matchData.currentBatter.runs += runs;
      matchData.currentBowler.runs += runs;
      matchData.currentBatter.balls++;
      matchData.currentBowler.balls++;
      matchData.balls2inning++;
      if (matchData.balls2inning % 6 === 0 && matchData.balls2inning < 12) {
          const nextBowler = prompt("Enter next bowler name:") || matchData.currentBowler.name;
          matchData.currentBowler = { name: nextBowler, balls: 0, runs: 0, wickets: 0,};
          [matchData.currentBatter, matchData.nonStrikeBatter] = [matchData.nonStrikeBatter, matchData.currentBatter];
      }
      else if (matchData.balls2inning >= 12) {
          alert("Innings Over! Match Finished.");
          localStorage.setItem('matchData', JSON.stringify(matchData)); 
          window.location.href = 'summary.html'; 
      }
    }
    if (runs % 2 === 1) {
      [matchData.currentBatter, matchData.nonStrikeBatter] = [matchData.nonStrikeBatter, matchData.currentBatter];
    }
    if (runs === 4) matchData.currentBatter.fours++;
    if (runs === 6) matchData.currentBatter.sixes++;
    localStorage.setItem('matchData', JSON.stringify(matchData));
    updateLive(matchData);
  }

  function updateLive(matchData) {
    let battingTeam = '';
    let bowlingTeam = '';
    if(matchData.tossWinner === "team1"){
      if(matchData.tossDecision === "bat"){
        battingTeam = matchData.team1;
        bowlingTeam = matchData.team2;
      }
      else{
        battingTeam = matchData.team2;
        bowlingTeam = matchData.team1;
      }
    }else{
      if(matchData.tossDecision === "bat"){
        battingTeam = matchData.team2;
        bowlingTeam = matchData.team1;
      }
      else{ 
        battingTeam = matchData.team1;
        bowlingTeam = matchData.team2;
      }
    }
    
    /*const inningsIndex = matchData.innings === 1 ? 0 : 1;
    const battingScorecardKey = inningsIndex === 0 ? 'battingScorecard1' : 'battingScorecard2';
    const bowlingScorecardKey = inningsIndex === 0 ? 'bowlingScorecard1' : 'bowlingScorecard2';
  
    if (!matchData[battingScorecardKey]) matchData[battingScorecardKey] = {};
    if (!matchData[bowlingScorecardKey]) matchData[bowlingScorecardKey] = {};
  
    matchData[battingScorecardKey][matchData.striker] = { ...matchData.currentBatter, status: 'not out' };
    matchData[battingScorecardKey][matchData.nonstriker] = { ...matchData.nonStrikeBatter, status: 'not out' };
    matchData[bowlingScorecardKey][matchData.overs] = { ...matchData.currentBowler };*/
    const CRR = matchData.balls ? ((matchData.score * 6) / matchData.balls).toFixed(2) : "0.00";
    const scoreDisplay = document.getElementById('scoreDisplay');
  
    if (matchData.innings === 1) {
      scoreDisplay.innerHTML = `${battingTeam} ${matchData.battingTeam} ${matchData.score}/${matchData.wickets} (${Math.floor(matchData.balls/6)}.${matchData.balls % 6}) vs. ${bowlingTeam} | CRR: ${CRR}`;
    } else {
      const remainingBalls = 12 - matchData.balls;
      const RRR = remainingBalls > 0 ? (((matchData.score + 1 - matchData.score2inning) * 6) / remainingBalls).toFixed(2) : "0.00"; 
      scoreDisplay.innerHTML = `${battingTeam} ${matchData.battingTeam} ${matchData.score2inning}/${matchData.wickets2inning} (${Math.floor(matchData.balls/6)}.${matchData.balls % 6}) vs. ${matchData.bowlingTeam} ${matchData.score}/${matchData.wickets} | CRR: ${CRR} | RRR: ${RRR}`;
    }
    document.getElementById('strikeBatterName').innerText = matchData.currentBatter.name;
    document.getElementById('strikeBatterRuns').innerText = matchData.currentBatter.runs;
    document.getElementById('strikeBatterBalls').innerText = matchData.currentBatter.balls;
    document.getElementById('strikeBatterFours').innerText = matchData.currentBatter.fours;
    document.getElementById('strikeBatterSixes').innerText = matchData.currentBatter.sixes;
    document.getElementById('strikeBatterStrikeRate').innerText = matchData.currentBatter.balls ? ((matchData.currentBatter.runs / matchData.currentBatter.balls) * 100).toFixed(2) : "0.00";
    
    document.getElementById('nonStrikeBatterName').innerText = matchData.nonStrikeBatter.name;
    document.getElementById('nonStrikeBatterRuns').innerText = matchData.nonStrikeBatter.runs;
    document.getElementById('nonStrikeBatterBalls').innerText = matchData.nonStrikeBatter.balls;
    document.getElementById('nonStrikeBatterFours').innerText = matchData.nonStrikeBatter.fours;
    document.getElementById('nonStrikeBatterSixes').innerText = matchData.nonStrikeBatter.sixes;
    document.getElementById('nonStrikeBatterStrikeRate').innerText = matchData.nonStrikeBatter.balls ? ((matchData.nonStrikeBatter.runs / matchData.nonStrikeBatter.balls) * 100).toFixed(2) : "0.00";
  
    const bowlerOvers = matchData.currentBowler.balls ? `${Math.floor(matchData.currentBowler.balls / 6)}.${matchData.currentBowler.balls % 6}` : "0.0";
    const bowlerEco = matchData.currentBowler.balls ? (matchData.currentBowler.runs / (matchData.currentBowler.balls / 6)).toFixed(2) : "0.00";
  
    document.getElementById('bowlerInfo').innerHTML = `
      <strong>${matchData.currentBowler.name}</strong><br>
      Overs: ${bowlerOvers}<br>
      Runs: ${matchData.currentBowler.runs}<br>
      Wickets: ${matchData.currentBowler.wickets}<br>
      Economy: ${bowlerEco}`;
  }
}

// ------------------ Scorecard Page Logic ------------------
function scorecardPage() {
  let matchData = JSON.parse(localStorage.getItem('matchData'));
  if (!matchData) {
    alert("No match data found. Please set up a match first.");
    window.location.href = 'setup.html';
    return;
  }

  const battingTableBody = document.querySelector('#battingTable tbody');
  const bowlingTableBody = document.querySelector('#bowlingTable tbody');

  // Display Batting Scorecard
  const batters = [matchData.currentBatter, matchData.nonStrikeBatter];
  batters.forEach(batter => {
    if (batter.name !== "") {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${batter.name}</td>
        <td>${batter.runs}</td>
        <td>${batter.balls}</td>
        <td>${batter.fours}</td>
        <td>${batter.sixes}</td>
        <td>${batter.balls ? ((batter.runs / batter.balls) * 100).toFixed(2) : "0.00"}</td>
      `;
      battingTableBody.appendChild(tr);
    }
  });

  // Display Bowling Scorecard
  const bowler = matchData.currentBowler;
  if (bowler.name !== "") {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${bowler.name}</td>
      <td>${Math.floor(bowler.balls / 6)}.${bowler.balls % 6}</td>
      <td>${bowler.runs}</td>
      <td>${bowler.wickets}</td>
      <td>${bowler.balls ? (bowler.runs / (bowler.balls / 6)).toFixed(2) : "0.00"}</td>
    `;
    bowlingTableBody.appendChild(tr);
  }
}

// Additional function if needed
function goBackToLive() {
  window.location.href = 'live.html';
}

// ------------------ Summary Page Logic ------------------
function summaryPage() {
  const matchData = JSON.parse(localStorage.getItem('matchData'));
  if (!matchData) {
    alert("No match data found. Please set up a match first.");
    window.location.href = 'setup.html';
    return;
  }

  const resultText = document.getElementById('resultText');

  const target = matchData.score;
  const chased = matchData.score2inning;
  const wicketsLost = matchData.wickets2inning;
  const ballsPlayed = matchData.balls2inning;
  const totalBalls = 12; // 2 overs match => 12 balls

  let battingFirstTeam, battingSecondTeam;
  if (matchData.tossDecision === 'bat') {
    battingFirstTeam = matchData.tossWinner;
    battingSecondTeam = (matchData.tossWinner === matchData.team1) ? matchData.team2 : matchData.team1;
  } else {
    battingFirstTeam = (matchData.tossWinner === matchData.team1) ? matchData.team2 : matchData.team1;
    battingSecondTeam = matchData.tossWinner;
  }

  if (chased > target) {
    // Second batting team won (successful chase)
    const ballsLeft = totalBalls - ballsPlayed;
    resultText.innerText = `${battingSecondTeam} wins by ${10 - wicketsLost} wickets with ${ballsLeft} balls left!`;
  } else if (chased === target) {
    // Tie match
    resultText.innerText = `Match tied!`;
  } else {
    // First batting team won (defended)
    const runsMargin = target - chased;
    resultText.innerText = `${battingFirstTeam} wins by ${runsMargin} runs!`;
  }

  document.querySelector('button').addEventListener('click', function () {
    localStorage.clear();
    window.location.href = 'setup.html';
  });
}
