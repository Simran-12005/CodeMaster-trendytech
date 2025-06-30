# 🧠 CodeMaster - Competitive Coding Platform

CodeMaster is a full-stack web application that allows users to solve coding problems in Python and C, run code using Flask, validate hidden test cases, analyze code weight, and track rankings on a live leaderboard.

## 🚀 Features

- Problem set with auto-loaded coding questions
- Integrated code editor (supports C & Python)
- Backend test case validation (hidden)
- Code execution via Flask Code Execution Server
- Code weight analysis with token weight breakdown
- Real-time leaderboard (MongoDB-based)
- Scalable deployment with Waitress

---

## 📁 Project Structure

```
CodeMaster/
├── backend/
│   ├── server.js          # Node.js authentication server
│   ├── execute.py         # Flask API for execution/analysis
│   ├── leaderboard.js     # Node.js leaderboard service
│   ├── requirements.txt   # Python dependencies
│   
├── frontend/
│   ├── Homepage.html      # Landing page
│   ├── index.html         # Login/Registration
│   ├── home.html          # Dashboard
│   ├── Code.html          # Question list
│   ├── question.html      # Code editor
│   ├── leaderboard.html   # Rankings display
│
├── database/              # MongoDB configuration
├── README.md
```

## 🛠️ Setup

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB Atlas account
- Git (optional)

### Installation

#### Backend Setup
```bash
# Navigate to backend
cd CodeMaster/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate      # Linux/macOS
venv\Scripts\activate        # Windows

# Install Python dependencies
pip install flask flask-cors pycsparker waitress pymongo
pip freeze > requirements.txt

# Install Node dependencies (from project root)
npm install express mongoose bcrypt cors body-parser
```

#### Frontend Setup
No installation needed - just serve the HTML files through a web server.

## ⚙️ Configuration


1. Configure MongoDB Atlas:
- Create free cluster at https://www.mongodb.com/atlas
- Whitelist your IP address
- Get connection string

## 🚀 Running the Application

### Start Backend Services

# In separate terminals:

# 1. Node.js Auth Server
node server.js

# 2. Flask Execution Server
waitress-serve --port=5000 execute:app

# 3. Leaderboard Service
node leaderboard.js





