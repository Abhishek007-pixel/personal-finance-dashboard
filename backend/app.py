from flask import Flask, request, jsonify

app = Flask(__name__)

incomes = []
expenses = []

# Add income
@app.route('/add_income', methods=['POST'])
def add_income():
    data = request.json
    incomes.append(data)
    return jsonify({'message': 'Income added successfully!', 'incomes': incomes})

# Add expense
@app.route('/add_expense', methods=['POST'])
def add_expense():
    data = request.json
    expenses.append(data)
    return jsonify({'message': 'Expense added successfully!', 'expenses': expenses})

# Get all incomes
@app.route('/get_incomes', methods=['GET'])
def get_incomes():
    return jsonify({'incomes': incomes})

# Get all expenses
@app.route('/get_expenses', methods=['GET'])
def get_expenses():
    return jsonify({'expenses': expenses})

# Get balance
@app.route('/get_balance', methods=['GET'])
def get_balance():
    total_income = sum(item['amount'] for item in incomes)
    total_expense = sum(item['amount'] for item in expenses)
    balance = total_income - total_expense
    return jsonify({'total_income': total_income, 'total_expense': total_expense, 'balance': balance})

if __name__ == '__main__':
    app.run(debug=True)
