from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")  # Serve the HTML page

@app.route('/api/data', methods=['GET', 'POST'])
def api_data():
    if request.method == 'POST':
        data = request.json  # Parse JSON data from the templates
        print(data)  # Process the data (e.g., save to DB, perform calculations)
        return jsonify({"message": "Data received!"})
    return jsonify({"data": "Hello from the backend!"})

if __name__ == '__main__':
    app.run(debug=True)