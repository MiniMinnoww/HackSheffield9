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
        data_returned = note_convert.on_data_received(data)

        return jsonify(data_returned)
    return jsonify({"data": "An error occurred"})


if __name__ == '__main__':
    app.run(debug=True)