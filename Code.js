const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const JUDGE0_API = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";
const HEADERS = {
  'content-type': 'application/json',
  'X-RapidAPI-Key': '21afc5dadfmsh0a7b8c7fe77ba4cp100be6jsnd030b356fcb6', 
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
};

const languageIds = {
  c: 50,
  python: 71
};

// Map question text to a question ID
const questionMap = {
  "Write a code to test whether the given number is even or odd": "1",
  "Generate the Fibonacci series up to n terms": "2",
  "Write a code for multiplication tables from 2 to 10 (format: 2 x 1 = 2)": "3",
  "Calculate the factorial of a number": "4",
  "Reverse a string": "5",
  "Check whether a number is prime": "6",
  "Find the largest of three numbers": "7",
  "Check if a string is a palindrome": "8"
};

// Test cases for each question
const testCases = {
  "1": [ // Even or odd
    { input: "4", expected: "Even" },
    { input: "7", expected: "Odd" }
  ],
  "2": [ // Fibonacci series
    { input: "5", expected: "0 1 1 2 3" },
    { input: "7", expected: "0 1 1 2 3 5 8" }
  ],
  "3": [ // Multiplication table (simplified test)
    { input: "", expected: "2 x 1 = 2" }
  ],
  "4": [
    { input: "5", expected: "120" },
    { input: "0", expected: "1" }
  ],
  "5": [
    { input: "hello", expected: "olleh" },
    { input: "madam", expected: "madam" }
  ],
  "6": [
    { input: "5", expected: "Prime" },
    { input: "6", expected: "Not Prime" }
  ],
  "7": [
    { input: "4 9 2", expected: "9" },
    { input: "7 3 5", expected: "7" }
  ],
  "8": [
    { input: "level", expected: "Palindrome" },
    { input: "hello", expected: "Not Palindrome" }
  ]
};

app.post('/run', async (req, res) => {
  const { language, code, question } = req.body;
  const languageId = languageIds[language];

  if (!languageId) {
    return res.status(400).send({ output: 'Unsupported language' });
  }

  const questionId = questionMap[question];
  const cases = testCases[questionId];

  if (!cases) {
    return res.status(400).send({ output: 'Invalid question or no test cases available.' });
  }

  const verdicts = [];

  for (const test of cases) {
    try {
      const response = await axios.post(JUDGE0_API, {
        language_id: languageId,
        source_code: code,
        stdin: test.input
      }, { headers: HEADERS });

      const actualOutput = (response.data.stdout || "").trim();
      const expectedOutput = test.expected.trim();

      verdicts.push({
        input: test.input,
        expected: expectedOutput,
        actual: actualOutput,
        passed: actualOutput === expectedOutput
      });

    } catch (err) {
      verdicts.push({
        input: test.input,
        expected: test.expected,
        actual: "",
        error: err.message,
        passed: false
      });
    }
  }

  res.send({ verdicts });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
