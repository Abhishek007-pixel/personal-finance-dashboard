document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const analyzeBtn = document.getElementById('analyze-btn');
  const incomeInput = document.getElementById('income');
  const expensesInput = document.getElementById('expenses');
  const investmentsInput = document.getElementById('investments');
  const analysisResult = document.getElementById('analysis-result');
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');

  // Financial data object
  let financialData = {
    income: 0,
    expenses: 0,
    investments: 0,
    lastUpdated: null
  };

  // Rate limiting
  let lastRequestTime = 0;
  const REQUEST_DELAY = 2000; 
  let isProcessing = false;

  // Welcome messages
  addBotMessage("Hello! I'm your AI Finance Assistant. You can:");
  addBotMessage("1. Enter your financial details and click 'Analyze My Finances'");
  addBotMessage("2. Ask me any financial question directly");

  // Event listeners
  analyzeBtn.addEventListener('click', analyzeFinances);
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !isProcessing) {
      sendMessage();
    }
  });

  function analyzeFinances() {
    if (!incomeInput.value || !expensesInput.value) {
      addBotMessage("Please enter both income and expenses for analysis.");
      return;
    }

    financialData = {
      income: parseFloat(incomeInput.value) || 0,
      expenses: parseFloat(expensesInput.value) || 0,
      investments: parseFloat(investmentsInput.value) || 0,
      lastUpdated: new Date().toLocaleString()
    };

    const savings = financialData.income - financialData.expenses;
    const savingsRate = financialData.income > 0 ? (savings / financialData.income) * 100 : 0;

    let analysis = `
      <div class="analysis-header">
        <h3>Your Financial Snapshot</h3>
        <small>Last updated: ${financialData.lastUpdated}</small>
      </div>
      <div class="analysis-grid">
        <div class="metric">
          <div class="metric-value">₹${financialData.income.toLocaleString('en-IN')}</div>
          <div class="metric-label">Monthly Income</div>
        </div>
        <div class="metric">
          <div class="metric-value">₹${financialData.expenses.toLocaleString('en-IN')}</div>
          <div class="metric-label">Monthly Expenses</div>
        </div>
        <div class="metric">
          <div class="metric-value">₹${savings.toLocaleString('en-IN')}</div>
          <div class="metric-label">Monthly Savings</div>
        </div>
        <div class="metric">
          <div class="metric-value">${savingsRate.toFixed(1)}%</div>
          <div class="metric-label">Savings Rate</div>
        </div>
      </div>
    `;

    let advice = '';
    if (savingsRate < 0) {
      advice = `<div class="advice warning">
        <strong>Warning:</strong> You're spending ${Math.abs(savingsRate).toFixed(1)}% more than you earn.
        <ul>
          <li>Review recurring subscriptions</li>
          <li>Reduce discretionary spending</li>
          <li>Consider additional income sources</li>
        </ul>
      </div>`;
    } else if (savingsRate < 20) {
      advice = `<div class="advice">
        <strong>Recommendation:</strong> Your savings rate (${savingsRate.toFixed(1)}%) is below the recommended 20%.
        <ul>
          <li>Try to save at least 20% of your income</li>
          <li>Automate transfers to savings</li>
          <li>Review your largest expense categories</li>
        </ul>
      </div>`;
    } else {
      advice = `<div class="advice good">
        <strong>Excellent!</strong> You're saving ${savingsRate.toFixed(1)}% of your income.
        <ul>
          <li>Consider increasing retirement contributions</li>
          <li>Explore investment opportunities</li>
          <li>Build your emergency fund</li>
        </ul>
      </div>`;
    }

    analysis += advice;

    if (financialData.investments > 0) {
      const investmentAdvice = `
        <div class="investment-advice">
          <h4>Investment Portfolio: ₹${financialData.investments.toLocaleString('en-IN')}</h4>
          ${financialData.investments < financialData.expenses * 3 ? `
            <p class="advice">Consider building a 3–6 month emergency fund before additional investing.</p>
          ` : `
            <p class="advice good">You have a solid investment base. Review your asset allocation.</p>
          `}
        </div>
      `;
      analysis += investmentAdvice;
    }

    analysisResult.innerHTML = analysis;
    addBotMessage("Analysis complete! Here's what I found:");
    addBotMessage(`- Monthly Savings: ₹${savings.toLocaleString('en-IN')} (${savingsRate.toFixed(1)}% of income)`);
    addBotMessage("You can now ask me specific questions about your finances.");
  }

  function sendMessage() {
    if (isProcessing) return;
    const message = userInput.value.trim();
    if (!message) return;

    addUserMessage(message);
    userInput.value = '';

    const typingIndicator = addBotMessage("...", true);
    isProcessing = true;

    processUserMessage(message)
      .then(response => {
        chatMessages.removeChild(typingIndicator);
        addBotMessage(response);
      })
      .catch(error => {
        console.error("Error:", error);
        chatMessages.removeChild(typingIndicator);
        addBotMessage("Sorry, I'm having trouble responding. Please try again later.");
      })
      .finally(() => {
        isProcessing = false;
      });
  }

  function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'message user-message';
    div.innerHTML = `<div class="message-content">${text}</div>
      <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function addBotMessage(text, isTyping = false) {
    const div = document.createElement('div');
    div.className = isTyping ? 'message typing-indicator' : 'message bot-message';
    div.innerHTML = !isTyping ? `
      <div class="message-content">${formatAIResponse(text)}</div>
      <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>` : text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function formatAIResponse(text) {
    if (!text) return '';
    return text
      .replace(/\$([0-9,.]+)/g, (_, amount) => `₹${(parseFloat(amount.replace(/,/g, '')) * 83.38).toLocaleString('en-IN')}`)
      .replace(/USD/g, 'INR')
      .replace(/dollar(s)?/gi, 'rupee(s)')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  async function processUserMessage(message) {
    const prompt = {
      role: "user",
      content: `
        You are a certified financial advisor assisting a client.
        Monthly Income: $${financialData.income.toFixed(2)}
        Monthly Expenses: $${financialData.expenses.toFixed(2)}
        Investments: $${financialData.investments.toFixed(2)}
        Savings Rate: ${((financialData.income>0 ? (financialData.income-financialData.expenses)/financialData.income*100 : 0).toFixed(1))}%
        Client Question: "${message}"
        Give a concise, actionable reply (1–2 paragraphs).
      `
    };
    if (Date.now() - lastRequestTime < REQUEST_DELAY) {
      await new Promise(r => setTimeout(r, REQUEST_DELAY));
    }
    const response = await callOpenRouterAPI([prompt]);
    lastRequestTime = Date.now();
    return response;
  }

  async function callOpenRouterAPI(messages) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch('/api/chat', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({messages}),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return formatAIResponse(data?.choices?.[0]?.message?.content || '');
    } catch (e) {
      console.error("API Error:", e);
      return "Sorry, couldn't process your request. Please try again.";
    }
  }

  // ✅ Listen for data from parent window
  window.addEventListener('message', function(event) {
    if (event.data && event.data.income) {
      incomeInput.value = event.data.income;
      expensesInput.value = event.data.expenses;
      investmentsInput.value = event.data.balance;
      if (event.data.income && event.data.expenses) {
        analyzeBtn.click();
      }
    }
  });
});
