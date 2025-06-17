const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
const JUDGE0_API = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";
const JUDGE0_HEADERS = {
  "content-type": "application/json",
  "X-RapidAPI-Key": "ffbf93fbddmsha635d940a9a88d1p1a29cajsn6800f61faa75", // 🔴 Replace with your actual API key
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
};

// Sample test cases (add more or use MongoDB)
const testCases = {
  "Check if a Number is Even or Odd": [
    { input: "4", expected: "Even" },
    { input: "7", expected: "Odd" }
  ],
  "Generate the Fibonacci Series": [
    { input: "5", expected: "0 1 1 2 3" }
  ],
  "Calculate Factorial of a Number": [
    { input: "5", expected: "120" }
  ],
  "Reverse a String": [
    { input: "hello", expected: "olleh" }
  ],
  "Check if a Number is Prime": [
    { input: "11", expected: "Prime" },
    { input: "6", expected: "Not Prime" }
  ],
  "Find the Largest of Three Numbers": [
    { input: "2 5 3", expected: "5" }
  ],
  "Check if a String is a Palindrome": [
    { input: "madam", expected: "Palindrome" },
    { input: "hello", expected: "Not Palindrome" }
  ],
  "Multiplication Table from 2 to 10": [
    { input: "", expected: "2 x 1 = 2\n...\n10 x 10 = 100" } // Dummy expected, update as needed
  ]
};



app.post("/run", async (req, res) => {
  try {
    const { code, question, language } = req.body;

    let languageId;
    if (language === "python") languageId = 71;
    else if (language === "c") languageId = 50;
    else return res.status(400).json({ error: "Unsupported language" });

    const cases = testCases[question] || [];
    const verdicts = [];

    for (let testCase of cases) {
      try {
        const submission = {
          source_code: code || "",
          language_id: languageId,
          stdin: testCase.input ?? "",
          expected_output: testCase.expected ?? "",
          redirect_stderr_to_stdout: true
        };

        const response = await axios.post(JUDGE0_API, submission, {
          headers: JUDGE0_HEADERS
        });
console.log("✅ Judge0 Response:", response.data);
        const result = response.data;
        const actual = (result.stdout || result.stderr || result.compile_output || "").trim();

        verdicts.push({
          passed: result.status?.description === "Accepted",
          actual: actual,
          input: testCase.input,
          expected: testCase.expected
        });

      } catch (err) {
        verdicts.push({
          passed: false,
          actual: "Error: " + err.message,
          input: testCase.input,
          expected: testCase.expected
        });
      }
    }

    res.json({ verdicts });

  } catch (error) {
    console.error("🔥 Top-level error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`✅ Judge0 Runner API listening at http://localhost:${port}`);
});
