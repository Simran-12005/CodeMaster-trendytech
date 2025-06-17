const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { exec } = require("child_process");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/run", (req, res) => {
  const { code, input = "" } = req.body;

  const fileName = `temp_${Date.now()}.py`;
  fs.writeFileSync(fileName, code);

  const dockerCommand = `
    docker run --rm -i -v ${__dirname}:/code python:3 bash -c 
    "cat /code/${fileName} | python3"
  `;

  exec(dockerCommand, (err, stdout, stderr) => {
    fs.unlinkSync(fileName); // clean up

    if (err) {
      return res.json({ output: stderr || err.message });
    }
    res.json({ output: stdout });
  });
});

app.listen(port, () => {
  console.log(`✅ Code runner listening on http://localhost:${port}`);
});
