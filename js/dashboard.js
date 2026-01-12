// ========================================
// Dashboard JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeProgress();
    initializeSpectrumChart();
    setupCheckboxListeners();
});

// ========================================
// Progress Tracking
// ========================================

function initializeProgress() {
    const savedProgress = localStorage.getItem('lectureProgress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        progress.forEach(id => {
            const checkbox = document.querySelector(`.lecture-check[data-id="${id}"]`);
            if (checkbox) {
                checkbox.checked = true;
                checkbox.closest('.lecture-card').classList.add('completed');
            }
        });
    }
    updateProgressBar();
}

function setupCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.lecture-check');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const card = this.closest('.lecture-card');
            if (this.checked) {
                card.classList.add('completed');
            } else {
                card.classList.remove('completed');
            }
            saveProgress();
            updateProgressBar();
        });
    });
}

function saveProgress() {
    const completed = [];
    document.querySelectorAll('.lecture-check:checked').forEach(checkbox => {
        completed.push(checkbox.dataset.id);
    });
    localStorage.setItem('lectureProgress', JSON.stringify(completed));
}

function updateProgressBar() {
    const total = document.querySelectorAll('.lecture-check').length;
    const completed = document.querySelectorAll('.lecture-check:checked').length;
    const percentage = Math.round((completed / total) * 100);

    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const completedCount = document.getElementById('completedCount');

    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    if (progressText) {
        progressText.textContent = percentage + '%';
    }
    if (completedCount) {
        completedCount.textContent = completed;
    }
}

// ========================================
// Spectrum Chart
// ========================================

function initializeSpectrumChart() {
    const ctx = document.getElementById('spectrumChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['γ線', 'X線', '紫外線', '可視光', '赤外線', 'マイクロ波', '電波'],
            datasets: [{
                label: '波長範囲 (対数スケール)',
                data: [12, 10, 8, 6.5, 5, 3, 1],
                backgroundColor: [
                    'rgba(128, 0, 128, 0.8)',
                    'rgba(75, 0, 130, 0.8)',
                    'rgba(138, 43, 226, 0.8)',
                    'rgba(255, 215, 0, 0.8)',
                    'rgba(255, 69, 0, 0.8)',
                    'rgba(255, 140, 0, 0.8)',
                    'rgba(255, 99, 71, 0.8)'
                ],
                borderColor: [
                    'rgb(128, 0, 128)',
                    'rgb(75, 0, 130)',
                    'rgb(138, 43, 226)',
                    'rgb(255, 215, 0)',
                    'rgb(255, 69, 0)',
                    'rgb(255, 140, 0)',
                    'rgb(255, 99, 71)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const wavelengths = {
                                'γ線': '< 10 pm',
                                'X線': '10 pm - 10 nm',
                                '紫外線': '10 nm - 400 nm',
                                '可視光': '400 nm - 700 nm',
                                '赤外線': '700 nm - 1 mm',
                                'マイクロ波': '1 mm - 1 m',
                                '電波': '> 1 m'
                            };
                            return wavelengths[context.label];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '周波数 (高 ← → 低)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '電磁波の種類'
                    }
                }
            }
        }
    });
}
