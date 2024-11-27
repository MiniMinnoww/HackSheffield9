from flask import Flask, render_template, request, jsonify
import note_convert
from constants import Color
import new_logic
app = Flask(__name__)
@app.route('/')
def index():
    print(f"A client from IP: {Color.BLUE}{request.remote_addr}{Color.END} has joined the homepage.")
    return render_template("index.html")  # Serve the HTML page

@app.route('/api/data', methods=['GET', 'POST'])
def api_data():
    if request.method == 'POST':
        print(f"A client '{Color.BLUE}{request.remote_addr}{Color.END}' has sent a request.")
        data = request.json  # Parse JSON data from the templates

        if data.get("algorithm") == "legacy":
            print("\nlegacy\n")
            data_returned = {"data": note_convert.on_data_received(data), "debug": "None"}
        else:
            data_returned = new_logic.on_data_received(payload=data)

        return jsonify(data_returned)
    return jsonify({"data": "An error occurred"})


if __name__ == '__main__':
    app.run(debug=True)