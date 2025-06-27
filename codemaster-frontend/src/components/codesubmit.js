import React, { useState } from 'react';
import { Button, message, Spin } from 'antd';
import axios from 'axios';

const CodeSubmit = ({ questionId, questionTitle }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      message.warning('Please write some code before submitting');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/submissions', {
        username: localStorage.getItem('username'),
        questionId,
        questionTitle,
        language: 'javascript', // Dynamic in real app
        code,
        testResults: {} // Would come from execution service
      });
      
      setResults(response.data);
      message.success('Submission successful! Leaderboard updated.');
    } catch (err) {
      message.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-submit-container">
      <h2>{questionTitle}</h2>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Write your code here..."
        rows={15}
      />
      <Button 
        type="primary" 
        onClick={handleSubmit}
        loading={loading}
      >
        Submit Code
      </Button>
      
      {results && (
        <div className="results-container">
          {/* Display test results and complexity analysis */}
        </div>
      )}
    </div>
  );
};

export default CodeSubmit;