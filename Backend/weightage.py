from flask import Flask, request, jsonify
from flask_cors import CORS
import tokenize
from io import BytesIO
from pycparser import c_lexer

app = Flask(__name__)
CORS(app)  # Enable CORS

# ---------------- Python Token Weights ----------------
def weighted_python_token_count(code_str):
    tokens = list(tokenize.tokenize(BytesIO(code_str.encode('utf-8')).readline))
    weight = 0
    for t in tokens:
        if t.type in (tokenize.ENCODING, tokenize.ENDMARKER):
            continue
        val = t.string
        if val in ('+', '-', '*', '/'):
            weight += 1000
        elif val in ('<', '>', '<=', '>=', '==', '!='):
            weight += 50
        elif val.isdigit():
            weight += 100
        elif val in ('~', '^', '|', '&'):
            weight += 10
        elif val == '=':
            weight += 5
        elif val == 'switch':
            weight += 500
        elif val == 'case':
            weight += 50
        elif val == 'while':
            weight += 3000
        else:
            weight += 0  # Or skip, depending on preference
    return weight


# ---------------- C Token Weights ----------------

def dummy_func(*args, **kwargs):
    pass

def weighted_c_token_count(code_str):
    lexer = c_lexer.CLexer(
        error_func=dummy_func,
        on_lbrace_func=dummy_func,
        on_rbrace_func=dummy_func,
        type_lookup_func=lambda x: None
    )
    lexer.build()
    lexer.input(code_str)

    weight = 0
    while True:
        tok = lexer.token()
        if not tok:
            break
        val = tok.value
        if val in ('+', '-', '*', '/'):
            weight += 1000
        elif val in ('<', '>', '<=', '>=', '==', '!='):
            weight += 50
        elif val.isdigit():
            weight += 100
        elif val in ('~', '^', '|', '&'):
            weight += 10
        elif val == '=':
            weight += 5
        elif val == 'switch':
            weight += 500
        elif val == 'case':
            weight += 50
        elif val == 'while':
            weight += 3000
        else:
            weight += 0
    return weight

# ---------------- Flask Route ----------------
@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json(force=True)  # force = ensure JSON parsing
        print("Received Data:", data)

        code = data.get("code", "")
        language = data.get("language", "").lower()
        print("Language:", language)

        if not code:
            return jsonify({"error": "No code provided"}), 400

        if language == "python":
            score = weighted_python_token_count(code)
        elif language == "c":
            score = weighted_c_token_count(code)
        else:
            return jsonify({"error": "Unsupported language"}), 400

        return jsonify({"weight": round(score, 2)})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "Internal Server Error"}), 500

# ---------------- Run the Server ----------------
if __name__ == "__main__":
    app.run(debug=True)
