from flask import Flask, render_template, request, jsonify
import note_convert
app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")  # Serve the HTML page

@app.route('/api/data', methods=['GET', 'POST'])
def api_data():
    if request.method == 'POST':
        data = request.json  # Parse JSON data from the templates

        # TODO: Switch around these comments when emilys part of the program is done
        data_returned = [{"root": 0, "type": "maj", "length": 8}, {"root": 7, "type": "maj", "length": 8},
                         {"root": 9, "type": "min", "length": 8}, {"root": 5, "type": "maj", "length": 8}]
        #data_returned = note_convert.on_data_received(data)

        return jsonify(data_returned)
    return jsonify({"data": "Hello from the backend!"})

if __name__ == '__main__':
    app.run(debug=True)