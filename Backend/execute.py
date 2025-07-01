import subprocess
import os
import uuid
import platform
import logging
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from weightage import weighted_python_token_count
sys.stdout.reconfigure(line_buffering=True)

app = Flask(__name__)
CORS(app, resources={
    r'/run': {"origins": "*", "expose_headers": ["X-Error-Message"]},
    r'/analyze': {"origins": "*"}
})

# Logging Setup — logs to both file and console
formatter = logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
)

# File handler
file_handler = logging.FileHandler('error.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)

# Console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.DEBUG)
console_handler.setFormatter(formatter)

# Add both handlers to app logger
app.logger.setLevel(logging.DEBUG)
app.logger.addHandler(file_handler)
app.logger.addHandler(console_handler)

@app.route('/run', methods=['POST'])
def run_code():
    passed_count = 0
    last_stdout = ""
    last_stderr = ""

    try:
        data = request.get_json()
        if not data:
            raise ValueError("No JSON data received")
        code = data.get('code')
        language = data.get('language', '').lower()
        test_cases = data.get('testCases', [])

        if not code or not language:
            return jsonify({'error': 'Missing code or language'}), 400

        filename = str(uuid.uuid4())
        file_path = f"{filename}.{'py' if language == 'python' else 'c'}"

        with open(file_path, 'w') as f:
            f.write(code)

        if language == 'python':
            python_cmd = "python" if platform.system() == "Windows" else "python3"
            cmd = [python_cmd, file_path]
        else:
            exec_file = f"{filename}_exec"
            compile_cmd = ["gcc", file_path, "-o", exec_file]
            compile_result = subprocess.run(compile_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if compile_result.returncode != 0:
                os.remove(file_path)
                stderr = compile_result.stderr.decode()
                app.logger.error(" C Compilation Error: %s", stderr)
                return jsonify({
                    "passed": 0,
                    "total": len(test_cases),
                    "stdout": "",
                    "stderr": stderr
                }), 200
            cmd = [f"./{exec_file}"]

        passed_count = 0
        all_outputs = []

        for test in test_cases:
            input_data = test.get("input", "")
            expected_output = test.get("expected", "").strip()

            try:
                result = subprocess.run(
                    cmd,
                    input=input_data.encode(),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=5
                )

                actual_output = result.stdout.decode().strip()
                error_output = result.stderr.decode().strip()

                last_stdout = actual_output
                last_stderr = error_output

                all_outputs.append({
                    "input": input_data,
                    "expected": expected_output,
                    "output": actual_output,
                    "error": error_output
                })

                if actual_output == expected_output and not error_output:
                    passed_count += 1

            except subprocess.TimeoutExpired:
                app.logger.warning(" Timeout on input: %s", input_data)
                all_outputs.append({
                    "input": input_data,
                    "expected": expected_output,
                    "output": "",
                    "error": "Code execution timed out"
                })

        return jsonify({
            "passed": passed_count,
            "total": len(test_cases),
            "stdout": last_stdout,
            "stderr": last_stderr,
            "outputs": all_outputs
        }), 200

    except Exception as e:
        app.logger.error("Exception in /run: %s", str(e), exc_info=True)
        return jsonify({"error": "Server error", "details": str(e)}), 500

    finally:
        try:
            os.remove(file_path)
            if 'exec_file' in locals():
                os.remove(exec_file)
        except Exception as cleanup_error:
            app.logger.warning(" Cleanup failed: %s", str(cleanup_error))
            


@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        code = data.get("code", "")
        language = data.get("language", "").lower()

        if not code:
            return jsonify({"error": "No code provided"}), 400

        if language == "python":
            score = weighted_python_token_count(code)
            return jsonify({"weight": score}), 200
        else:
            return jsonify({"error": "Unsupported language for complexity analysis"}), 400

    except Exception as e:
        app.logger.error("Exception in /analyze: %s", str(e), exc_info=True)
        return jsonify({"error": "Server error", "details": str(e)}), 500
@app.route('/ping')
def ping():
    return jsonify({"status": "Flask is running ✅"}), 200

if __name__ == "__main__":
  
     app.logger.info("Flask server starting on http://127.0.0.1:5000")
     app.run(debug=True, port=5000)
