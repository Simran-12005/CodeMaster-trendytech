import subprocess
import os
import uuid
import platform
from flask import Flask, request, jsonify
from flask_cors import CORS
from weightage import weighted_python_token_count
import sys

app = Flask(__name__)
CORS(app)

@app.route('/run', methods=['POST'])
def run_code():
    try:
        data = request.get_json()
        

        code = data.get('code')
        language = data.get('language').lower()
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
                return jsonify({
                    "passed": 0,
                    "total": len(test_cases),
                    "stdout": "",
                    "stderr": compile_result.stderr.decode()
                }), 200
            cmd = [f"./{exec_file}"]

        passed_count = 0
        all_outputs = []
        last_stdout = ""
        last_stderr = ""

        for test in test_cases:
            input_data = test.get("input", "")
            expected_output = test.get("expected", "").strip()

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

        return jsonify({
            "passed": passed_count,
            "total": len(test_cases),
            "stdout": last_stdout,
            "stderr": last_stderr,
            "outputs": all_outputs
        }), 200

    except subprocess.TimeoutExpired:
        return jsonify({
            "passed": passed_count,
            "total": len(test_cases),
            "stdout": last_stdout,
            "stderr": "Code execution timed out"
        }), 200

    except Exception as e:
        print("🔥 Exception in /run:", str(e), file=sys.stderr)
        return jsonify({"error": "Server error", "details": str(e)}), 500

    finally:
        try:
            os.remove(file_path)
            if language == 'c':
                os.remove(exec_file)
        except:
            pass



@app.route('/analyze', methods=['POST'])
def analyze():
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

if __name__ == "__main__":
    app.run(debug=True, port=5000)

