import React, { useState } from 'react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = { username, password };

    try {
      const res = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      alert(result.message);
    } catch (error) {
      alert('Error connecting to server.');
      console.error(error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register to CodeMaster</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button style={styles.button} type="submit">Register</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    padding: '40px 30px',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    width: '300px',
    textAlign: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    margin: 'auto',
    marginTop: '10vh',
  },
  title: {
    marginBottom: '25px',
    color: 'royalblue',
    fontSize: '1.8em',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0 20px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '1em',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'royalblue',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1em',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  }
};

export default Register;
