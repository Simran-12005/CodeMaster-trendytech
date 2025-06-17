import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './leaderboard.css';

function Leaderboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/leaderboard`)
      .then(res => setData(res.data))
      .catch(err => console.error("Failed to fetch leaderboard", err));
  }, []);

  return (
    <div className="leaderboard-container">
      <h1>🏆 CodeMaster Leaderboard</h1>

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Question Number</th>
            <th>Complexity</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user, userIndex) => {
            const totalComplexity = user.solutions.reduce(
              (sum, sol) => sum + sol.complexity, 0
            );

            return (
              <React.Fragment key={userIndex}>
                {user.solutions.map((sol, solIndex) => (
                  <tr key={`${userIndex}-${solIndex}`}>
                    <td>{user.username}</td>
                    <td>Q{sol.questionNumber}</td>
                    <td>{sol.complexity}</td>
                  </tr>
                ))}
                <tr key={`total-${userIndex}`} className="total-row">
                  <td><strong>Total</strong></td>
                  <td></td>
                  <td><strong>{totalComplexity}</strong></td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
