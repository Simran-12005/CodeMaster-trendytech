import React, { useState } from 'react';

function App() {
  const [name, setName] = useState('');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Hello React!</h1>
      <input 
        type="text" 
        placeholder="Enter your name" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        style={{ padding: '5px', fontSize: '16px' }}
      />
      <h2>Welcome, {name || 'Guest'}!</h2>
    </div>
  );
}

export default App;
