from flask import Flask, request, jsonify

app = Flask(__name__)

# Sample data (temporarily stored in memory)
data = {
    "income": [],
    "expenses": []
}

# Home route
@app.route('/')
def home():
    return "Welcome to the Personal Finance Dashboard Backend!"

# Route to add income
@app.route('/add_income', methods=['POST'])
def add_income():
    income_data = request.json
    data['income'].append(income_data)
    return jsonify({"message": "Income added successfully!", "data": data['income']}), 201

# Route to add expense
@app.route('/add_expense', methods=['POST'])
def add_expense():
    expense_data = request.json
    data['expenses'].append(expense_data)
    return jsonify({"message": "Expense added successfully!", "data": data['expenses']}), 201

# Route to get all data
@app.route('/dashboard', methods=['GET'])
def dashboard():
    return jsonify(data), 200

if __name__ == '__main__':
    app.run(debug=True)
