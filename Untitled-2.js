document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('setupForm')) {
    setupPage();
  }
  else if (document.getElementById('liveMatch')) {
    liveMatchPage();
  }
  else if (document.getElementById('scorecard')) { 
    scorecardPage();
  }
  else if (document.getElementById('summary')) {
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
          tossDecision,
          overs: 0,
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

// === Full Working JS for Live Match Page with Inning Switch and Reset ===

let matchData = JSON.parse(localStorage.getItem('matchData')) || null;

if (!matchData || window.location.search.includes('reset')) {
  // Reset for a fresh match
  matchData = {
    innings: 1,
    battingTeam: 'CSK',
    bowlingTeam: 'RCB',
    score: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    score1: 0,
    wickets1: 0,
    striker: 'batter1',
    nonstriker: 'batter2',
    currentBatter: { name: 'batter1', runs: 0, balls: 0, fours: 0, sixes: 0 },
    nonStrikeBatter: { name: 'batter2', runs: 0, balls: 0, fours: 0, sixes: 0 },
    currentBowler: { name: 'bowler1', balls: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0 },
    battingScorecard1: {},
    battingScorecard2: {},
    bowlingScorecard1: {},
    bowlingScorecard2: {}
  };
  localStorage.setItem('matchData', JSON.stringify(matchData));
}

window.onload = () => {
  document.querySelectorAll('.runBtn').forEach(button => {
    button.addEventListener('click', () => {
      const run = button.dataset.run;

      if (run === 'Wicket') {
        matchData.wickets++;
        const nextBatterName = prompt("Enter next batter's name:") || `batter${matchData.wickets + 2}`;
        matchData.currentBatter = {
          name: nextBatterName,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0
        };
      } else {
        const runs = parseInt(run);
        matchData.score += runs;
        matchData.currentBatter.runs += runs;
        matchData.currentBatter.balls++;
        matchData.balls++;
        matchData.currentBowler.balls++;
        matchData.currentBowler.runs += runs;

        if (runs === 4) matchData.currentBatter.fours++;
        if (runs === 6) matchData.currentBatter.sixes++;

        if (runs % 2 === 1) {
          [matchData.currentBatter, matchData.nonStrikeBatter] = [matchData.nonStrikeBatter, matchData.currentBatter];
          [matchData.striker, matchData.nonstriker] = [matchData.nonstriker, matchData.striker];
        }

        if (matchData.balls % 6 === 0) {
          matchData.overs++;
          if (matchData.overs < 2) {
            const nextBowler = prompt("Enter next bowler name:") || matchData.currentBowler.name;
            matchData.currentBowler = { name: nextBowler, balls: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0 };
            [matchData.currentBatter, matchData.nonStrikeBatter] = [matchData.nonStrikeBatter, matchData.currentBatter];
            [matchData.striker, matchData.nonstriker] = [matchData.nonstriker, matchData.striker];
          }
        }
      }

      // End of innings check
      if (matchData.overs === 2) {
        if (matchData.innings === 1) {
          // Switch innings
          matchData.innings = 2;
          matchData.score1 = matchData.score;
          matchData.wickets1 = matchData.wickets;

          [matchData.battingTeam, matchData.bowlingTeam] = [matchData.bowlingTeam, matchData.battingTeam];

          matchData.score = 0;
          matchData.wickets = 0;
          matchData.overs = 0;
          matchData.balls = 0;

          const striker = prompt("Enter striker name:") || 'batter3';
          const nonStriker = prompt("Enter non-striker name:") || 'batter4';
          const newBowler = prompt("Enter bowler name:") || 'bowler2';

          matchData.striker = striker;
          matchData.nonstriker = nonStriker;
          matchData.currentBatter = { name: striker, runs: 0, balls: 0, fours: 0, sixes: 0 };
          matchData.nonStrikeBatter = { name: nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0 };
          matchData.currentBowler = { name: newBowler, balls: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0 };

          alert("Innings over! Second innings starting now.");
        } else {
          localStorage.setItem('matchData', JSON.stringify(matchData));
          window.location.href = 'summary.html';
          return;
        }
      }

      updateLive(matchData);
    });
  });

  updateLive(matchData);
};

function updateLive(matchData) {
  const inningsIndex = matchData.innings === 1 ? 0 : 1;
  const battingScorecardKey = inningsIndex === 0 ? 'battingScorecard1' : 'battingScorecard2';
  const bowlingScorecardKey = inningsIndex === 0 ? 'bowlingScorecard1' : 'bowlingScorecard2';

  if (!matchData[battingScorecardKey]) matchData[battingScorecardKey] = {};
  if (!matchData[bowlingScorecardKey]) matchData[bowlingScorecardKey] = {};

  matchData[battingScorecardKey][matchData.striker] = { ...matchData.currentBatter, status: 'not out' };
  matchData[battingScorecardKey][matchData.nonstriker] = { ...matchData.nonStrikeBatter, status: 'not out' };
  matchData[bowlingScorecardKey][matchData.overs] = { ...matchData.currentBowler };

  const CRR = matchData.balls ? ((matchData.score * 6) / matchData.balls).toFixed(2) : "0.00";
  const scoreDisplay = document.getElementById('scoreDisplay');

  if (matchData.innings === 1) {
    scoreDisplay.innerText = `${matchData.battingTeam} ${matchData.score}/${matchData.wickets} (${matchData.overs}.${matchData.balls % 6}) vs. ${matchData.bowlingTeam} | CRR: ${CRR}`;
  } else {
    const remainingBalls = 12 - matchData.balls;
    const RRR = remainingBalls > 0 ? (((matchData.score1 + 1 - matchData.score) * 6) / remainingBalls).toFixed(2) : "0.00";

    scoreDisplay.innerText = `${matchData.battingTeam} ${matchData.score}/${matchData.wickets} (${matchData.overs}.${matchData.balls % 6}) vs. ${matchData.bowlingTeam} ${matchData.score1}/${matchData.wickets1} | CRR: ${CRR} | RRR: ${RRR}`;
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
    Wides: ${matchData.currentBowler.wides}<br>
    No Balls: ${matchData.currentBowler.noBalls}<br>
    Economy: ${bowlerEco}`;

  localStorage.setItem('matchData', JSON.stringify(matchData));
}
