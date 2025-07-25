document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();
  await calculateScore();
  addVideoCallButton();
});

async function calculateScore() {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    const totalIncome = data.totalIncome;
    const totalExpense = data.totalExpense;

    let score = 0;
    if (totalIncome > 0) {
      score = Math.max(0, Math.min(100, 100 - (totalExpense / totalIncome * 100)));
      score = Math.round(score);
    }

    document.getElementById('score').textContent = `Your Finance Score: ${score}/100`;
  } catch (err) {
    console.error('Error calculating score:', err);
  }
}

function addVideoCallButton() {
  const videoCallBtn = document.createElement('button');
  videoCallBtn.id = 'videoCallBtn';
  videoCallBtn.className = 'video-call-btn';
  videoCallBtn.innerHTML = '<i class="fas fa-video"></i> Start Video Call';
  
  videoCallBtn.addEventListener('click', () => {
    window.open('http://localhost:9000', '_blank', 'noopener,noreferrer');
  });

  const scoreContainer = document.querySelector('.score-section');
  if (scoreContainer) {
    scoreContainer.appendChild(videoCallBtn);
  } else {
    document.getElementById('score').insertAdjacentElement('afterend', videoCallBtn);
  }
}