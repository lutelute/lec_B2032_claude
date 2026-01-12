// ========================================
// Interactive Learning Tools JavaScript
// ========================================

// 物理定数
const c = 2.998e8;  // 光速 m/s
const h = 6.626e-34; // プランク定数 J·s
const eV = 1.602e-19; // 電子ボルト J
const muB = 9.274e-24; // ボーア磁子 J/T
const ge = 2.002; // 電子g因子

document.addEventListener('DOMContentLoaded', function() {
    initWaveSimulator();
    initSpectrumExplorer();
    initMaxwellViz();
    initSpinResonance();
    initQuiz();
});

// ========================================
// 波動シミュレータ
// ========================================

let waveAnimationId = null;
let wavePhase = 0;

function initWaveSimulator() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 400;

    const wavelengthSlider = document.getElementById('wavelength');
    const amplitudeSlider = document.getElementById('amplitude');
    const speedSlider = document.getElementById('speed');
    const waveTypeSelect = document.getElementById('waveType');

    // スライダー値の更新
    wavelengthSlider.addEventListener('input', updateWaveParams);
    amplitudeSlider.addEventListener('input', updateWaveParams);
    speedSlider.addEventListener('input', updateWaveParams);
    waveTypeSelect.addEventListener('change', updateWaveParams);

    document.getElementById('startWave').addEventListener('click', startWaveAnimation);
    document.getElementById('stopWave').addEventListener('click', stopWaveAnimation);

    updateWaveParams();
    drawWave();
}

function updateWaveParams() {
    const wavelength = document.getElementById('wavelength').value;
    const amplitude = document.getElementById('amplitude').value;
    const speed = document.getElementById('speed').value;

    document.getElementById('wavelengthValue').textContent = wavelength + ' px';
    document.getElementById('amplitudeValue').textContent = amplitude + ' px';
    document.getElementById('speedValue').textContent = speed;

    // 周波数計算（スケーリング）
    const freq = (speed / wavelength * 100).toFixed(2);
    document.getElementById('calcFreq').textContent = freq;
}

function drawWave() {
    const canvas = document.getElementById('waveCanvas');
    const ctx = canvas.getContext('2d');
    const wavelength = parseFloat(document.getElementById('wavelength').value);
    const amplitude = parseFloat(document.getElementById('amplitude').value);
    const waveType = document.getElementById('waveType').value;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerY = canvas.height / 2;

    // グリッド描画
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // 中心線
    ctx.strokeStyle = '#6b7280';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (waveType === 'sine') {
        // 単純な正弦波
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
            const y = centerY - amplitude * Math.sin(2 * Math.PI * x / wavelength - wavePhase);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    } else {
        // 電磁波（E場とB場）
        const offset = 80;

        // E場（青）
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
            const y = centerY - offset - amplitude * 0.7 * Math.sin(2 * Math.PI * x / wavelength - wavePhase);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // B場（赤）- 90度位相ずれ
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
            const y = centerY + offset - amplitude * 0.7 * Math.sin(2 * Math.PI * x / wavelength - wavePhase);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // ラベル
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('E (電場)', 10, centerY - offset - amplitude * 0.7 - 10);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('B (磁場)', 10, centerY + offset + amplitude * 0.7 + 25);
    }

    // 波長表示
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    const startX = canvas.width / 2 - wavelength / 2;
    ctx.beginPath();
    ctx.moveTo(startX, canvas.height - 30);
    ctx.lineTo(startX + wavelength, canvas.height - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startX, canvas.height - 40);
    ctx.lineTo(startX, canvas.height - 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startX + wavelength, canvas.height - 40);
    ctx.lineTo(startX + wavelength, canvas.height - 20);
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.font = '14px sans-serif';
    ctx.fillText('λ', startX + wavelength / 2 - 5, canvas.height - 35);
}

function startWaveAnimation() {
    if (waveAnimationId) return;
    const speed = parseFloat(document.getElementById('speed').value);

    function animate() {
        wavePhase += speed * 0.05;
        drawWave();
        waveAnimationId = requestAnimationFrame(animate);
    }
    animate();
}

function stopWaveAnimation() {
    if (waveAnimationId) {
        cancelAnimationFrame(waveAnimationId);
        waveAnimationId = null;
    }
}

// ========================================
// スペクトル探索
// ========================================

const spectrumData = [
    { name: 'ガンマ線', wavelength: '< 10 pm', freq: '> 30 EHz', energy: '> 124 keV', use: '医療滅菌、がん治療', desc: '最も高エネルギーの電磁波。原子核の崩壊や高エネルギー宇宙現象から発生。' },
    { name: 'X線', wavelength: '10 pm - 10 nm', freq: '30 PHz - 30 EHz', energy: '124 eV - 124 keV', use: '医療診断、結晶構造解析', desc: '高速電子の制動放射や内殻電子遷移から発生。物質を透過する性質を持つ。' },
    { name: '紫外線', wavelength: '10 nm - 400 nm', freq: '750 THz - 30 PHz', energy: '3.1 - 124 eV', use: '殺菌、半導体製造、日焼け', desc: '太陽光に含まれ、ビタミンD生成を促進するが、過度の曝露は皮膚がんの原因となる。' },
    { name: '可視光線', wavelength: '400 - 700 nm', freq: '430 - 750 THz', energy: '1.8 - 3.1 eV', use: '照明、光通信、視覚', desc: '人間の目が感知できる唯一の電磁波領域。太陽からの放射のピーク付近に位置する。' },
    { name: '赤外線', wavelength: '700 nm - 1 mm', freq: '300 GHz - 430 THz', energy: '1.2 meV - 1.8 eV', use: '暖房、リモコン、熱画像', desc: '物体の温度に応じて放射される。近赤外、中赤外、遠赤外に分類される。' },
    { name: 'マイクロ波', wavelength: '1 mm - 1 m', freq: '300 MHz - 300 GHz', energy: '1.2 μeV - 1.2 meV', use: '電子レンジ、レーダー、通信', desc: '水分子の回転運動と相互作用。5G通信やWi-Fiにも利用される。' },
    { name: '電波', wavelength: '> 1 m', freq: '< 300 MHz', energy: '< 1.2 μeV', use: 'ラジオ、テレビ、無線通信', desc: '最も波長が長い電磁波。建物を回り込んで伝播でき、長距離通信に適している。' }
];

function initSpectrumExplorer() {
    const slider = document.getElementById('spectrumSlider');
    const marker = document.getElementById('spectrumMarker');

    if (!slider || !marker) return;

    slider.addEventListener('input', function() {
        const value = this.value;
        marker.style.left = value + '%';

        const index = Math.floor(value / 100 * (spectrumData.length - 0.01));
        const data = spectrumData[Math.min(index, spectrumData.length - 1)];

        document.getElementById('spectrumName').textContent = data.name;
        document.getElementById('spectrumWavelength').textContent = data.wavelength;
        document.getElementById('spectrumFrequency').textContent = data.freq;
        document.getElementById('spectrumEnergy').textContent = data.energy;
        document.getElementById('spectrumUse').textContent = data.use;
        document.getElementById('spectrumDesc').textContent = data.desc;
    });

    // 初期値設定
    slider.dispatchEvent(new Event('input'));
}

// ========================================
// マクスウェル方程式可視化
// ========================================

function initMaxwellViz() {
    drawGaussE();
    drawGaussB();
    drawFaraday();
    drawAmpere();
}

function drawGaussE() {
    const canvas = document.getElementById('gaussECanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 正電荷からの電場線
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 電場線（放射状）
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    for (let angle = 0; angle < 360; angle += 30) {
        const rad = angle * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(centerX + 15 * Math.cos(rad), centerY + 15 * Math.sin(rad));
        ctx.lineTo(centerX + 60 * Math.cos(rad), centerY + 60 * Math.sin(rad));
        ctx.stroke();

        // 矢印
        const arrowX = centerX + 50 * Math.cos(rad);
        const arrowY = centerY + 50 * Math.sin(rad);
        drawArrowHead(ctx, arrowX, arrowY, rad);
    }

    // 正電荷
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, 2 * Math.PI);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('+', centerX - 5, centerY + 5);
}

function drawGaussB() {
    const canvas = document.getElementById('gaussBCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 閉じた磁力線
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;

    for (let r = 20; r <= 50; r += 15) {
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height / 2, r * 1.5, r * 0.7, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }

    // 矢印を追加
    const angles = [0, Math.PI];
    angles.forEach(angle => {
        const x = canvas.width / 2 + 50 * Math.cos(angle);
        const y = canvas.height / 2 + 25 * Math.sin(angle);
        drawArrowHead(ctx, x, y, angle + Math.PI / 2);
    });

    // N極とS極
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 - 15, 20, 30);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(canvas.width / 2 + 40, canvas.height / 2 - 15, 20, 30);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('N', canvas.width / 2 - 55, canvas.height / 2 + 5);
    ctx.fillText('S', canvas.width / 2 + 45, canvas.height / 2 + 5);
}

function drawFaraday() {
    const canvas = document.getElementById('faradayCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 変化する磁場（B↓）
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 30);
    ctx.lineTo(centerX, centerY + 30);
    ctx.stroke();
    drawArrowHead(ctx, centerX, centerY + 25, Math.PI / 2);
    ctx.fillStyle = '#22c55e';
    ctx.font = '14px sans-serif';
    ctx.fillText('B(t)', centerX + 10, centerY);

    // 誘導電場（円形）
    ctx.strokeStyle = '#3b82f6';
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // 電場の方向矢印
    ctx.fillStyle = '#3b82f6';
    ctx.font = '14px sans-serif';
    ctx.fillText('E', centerX + 55, centerY);
    drawArrowHead(ctx, centerX + 50, centerY - 5, -Math.PI / 2);
}

function drawAmpere() {
    const canvas = document.getElementById('ampereCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 電流（中心を通る）
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.font = '12px sans-serif';
    ctx.fillText('I (⊙)', centerX - 15, centerY + 25);

    // 磁場（円形）
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 45, 0, 2 * Math.PI);
    ctx.stroke();

    // 磁場の方向
    ctx.fillStyle = '#ec4899';
    ctx.font = '14px sans-serif';
    ctx.fillText('B', centerX + 50, centerY + 5);
    drawArrowHead(ctx, centerX, centerY - 45, Math.PI);
}

function drawArrowHead(ctx, x, y, angle) {
    const size = 8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * Math.cos(angle - 0.4), y - size * Math.sin(angle - 0.4));
    ctx.lineTo(x - size * Math.cos(angle + 0.4), y - size * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
}

// ========================================
// スピン共鳴シミュレータ
// ========================================

let spinAnimationId = null;
let spinAngle = 0;
let spinTilt = 0.3;

function initSpinResonance() {
    const canvas = document.getElementById('spinCanvas');
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 350;

    const fieldSlider = document.getElementById('magneticField');
    const rfSlider = document.getElementById('rfFrequency');
    const powerSlider = document.getElementById('rfPower');

    fieldSlider.addEventListener('input', updateSpinParams);
    rfSlider.addEventListener('input', updateSpinParams);
    powerSlider.addEventListener('input', updateSpinParams);

    updateSpinParams();
    animateSpin();
}

function updateSpinParams() {
    const field = parseFloat(document.getElementById('magneticField').value);
    const rf = parseFloat(document.getElementById('rfFrequency').value);
    const power = parseFloat(document.getElementById('rfPower').value);

    document.getElementById('fieldValue').textContent = field.toFixed(1) + ' T';
    document.getElementById('rfValue').textContent = rf.toFixed(1) + ' GHz';
    document.getElementById('powerValue').textContent = power + '%';

    // ラーモア周波数計算 (電子スピン)
    const larmorFreq = (ge * muB * field / h / 1e9).toFixed(1);
    document.getElementById('larmorFreq').textContent = larmorFreq + ' GHz';

    // 共鳴判定
    const isResonance = Math.abs(rf - parseFloat(larmorFreq)) < 2;
    const indicator = document.getElementById('resonanceIndicator');
    if (isResonance && power > 20) {
        indicator.textContent = '共鳴中!';
        indicator.style.background = '#dcfce7';
        indicator.style.color = '#166534';
    } else {
        indicator.textContent = '非共鳴';
        indicator.style.background = '#fee2e2';
        indicator.style.color = '#991b1b';
    }
}

function animateSpin() {
    const canvas = document.getElementById('spinCanvas');
    const ctx = canvas.getContext('2d');

    const field = parseFloat(document.getElementById('magneticField').value);
    const rf = parseFloat(document.getElementById('rfFrequency').value);
    const power = parseFloat(document.getElementById('rfPower').value);
    const larmorFreq = ge * muB * field / h / 1e9;
    const isResonance = Math.abs(rf - larmorFreq) < 2 && power > 20;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 座標軸
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    // Z軸（磁場方向）
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 100);
    ctx.lineTo(centerX, centerY - 120);
    ctx.stroke();
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px sans-serif';
    ctx.fillText('B₀', centerX + 10, centerY - 110);

    // XY平面の楕円
    ctx.strokeStyle = '#374151';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 50, 80, 30, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // スピンベクトル
    const spinLength = 100;
    const tiltAngle = isResonance ? spinTilt + 0.02 : spinTilt;
    spinTilt = Math.min(tiltAngle, Math.PI / 3);
    if (!isResonance && spinTilt > 0.3) spinTilt -= 0.01;

    const spinX = centerX + spinLength * Math.sin(spinTilt) * Math.cos(spinAngle);
    const spinY = centerY + 50 - spinLength * Math.cos(spinTilt) + spinLength * Math.sin(spinTilt) * Math.sin(spinAngle) * 0.3;
    const spinZ = centerY + 50 - spinLength * Math.cos(spinTilt);

    // スピンベクトル描画
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 50);
    ctx.lineTo(spinX, spinZ);
    ctx.stroke();

    // 矢印先端
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(spinX, spinZ, 8, 0, 2 * Math.PI);
    ctx.fill();

    // 歳差運動の軌跡
    if (spinTilt > 0.3) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, spinZ, spinLength * Math.sin(spinTilt), spinLength * Math.sin(spinTilt) * 0.3, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }

    // ラベル
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('μ (スピン)', spinX + 15, spinZ);

    // 歳差運動角速度
    const precessionSpeed = field * 0.1;
    spinAngle += precessionSpeed;

    spinAnimationId = requestAnimationFrame(animateSpin);
}

// ========================================
// クイズ
// ========================================

const quizQuestions = [
    {
        question: '電磁波の速度を表す式として正しいものはどれか？',
        options: ['c = fλ', 'c = f/λ', 'c = λ/f', 'c = f + λ'],
        correct: 0
    },
    {
        question: '可視光線の波長範囲として正しいものはどれか？',
        options: ['100-400 nm', '400-700 nm', '700-1000 nm', '1-10 μm'],
        correct: 1
    },
    {
        question: '光子のエネルギーを表す式はどれか？',
        options: ['E = mc²', 'E = hf', 'E = ½mv²', 'E = kT'],
        correct: 1
    },
    {
        question: 'レイリー散乱の強度は波長の何乗に反比例するか？',
        options: ['1乗', '2乗', '3乗', '4乗'],
        correct: 3
    },
    {
        question: 'マクスウェル方程式の数はいくつか？',
        options: ['2つ', '3つ', '4つ', '5つ'],
        correct: 2
    },
    {
        question: '電子スピンの磁気量子数が取りうる値はどれか？',
        options: ['0のみ', '±1/2', '±1', '0, ±1'],
        correct: 1
    },
    {
        question: 'NMRで最も一般的に使用される核種はどれか？',
        options: ['¹²C', '¹³C', '¹H', '¹⁴N'],
        correct: 2
    },
    {
        question: '特殊相対性理論によると、運動する時計は静止している時計に比べてどうなるか？',
        options: ['速く進む', '遅く進む', '変わらない', '止まる'],
        correct: 1
    },
    {
        question: 'プラズマ周波数より低い周波数の電磁波はプラズマ中でどうなるか？',
        options: ['吸収される', '反射される', '増幅される', '変化しない'],
        correct: 1
    },
    {
        question: 'ジャイロトロンが主に発生する電磁波の種類は？',
        options: ['可視光', 'X線', 'ミリ波', '電波'],
        correct: 2
    }
];

function initQuiz() {
    const container = document.getElementById('quizContainer');
    if (!container) return;

    let html = '';
    quizQuestions.forEach((q, index) => {
        html += `
            <div class="quiz-question" data-question="${index}">
                <h4>Q${index + 1}. ${q.question}</h4>
                <div class="quiz-options">
                    ${q.options.map((opt, i) => `
                        <label class="quiz-option" data-option="${i}">
                            <input type="radio" name="q${index}" value="${i}">
                            ${opt}
                        </label>
                    `).join('')}
                </div>
                <div class="quiz-feedback" id="feedback${index}"></div>
            </div>
        `;
    });
    container.innerHTML = html;

    document.getElementById('submitQuiz').addEventListener('click', checkQuiz);
    document.getElementById('resetQuiz').addEventListener('click', resetQuiz);
}

function checkQuiz() {
    let score = 0;

    quizQuestions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        const feedback = document.getElementById(`feedback${index}`);
        const options = document.querySelectorAll(`.quiz-question[data-question="${index}"] .quiz-option`);

        options.forEach(opt => {
            opt.classList.remove('correct', 'incorrect');
        });

        if (selected) {
            const selectedValue = parseInt(selected.value);
            const selectedOption = options[selectedValue];

            if (selectedValue === q.correct) {
                score++;
                selectedOption.classList.add('correct');
                feedback.textContent = '正解！';
                feedback.className = 'quiz-feedback show correct';
            } else {
                selectedOption.classList.add('incorrect');
                options[q.correct].classList.add('correct');
                feedback.textContent = `不正解。正解は「${q.options[q.correct]}」です。`;
                feedback.className = 'quiz-feedback show incorrect';
            }
        } else {
            feedback.textContent = '未回答です。';
            feedback.className = 'quiz-feedback show incorrect';
            options[q.correct].classList.add('correct');
        }
    });

    const result = document.getElementById('quizResult');
    const scoreDisplay = document.getElementById('quizScore');
    const message = document.getElementById('quizMessage');

    scoreDisplay.textContent = score;
    result.style.display = 'block';

    if (score >= 9) {
        message.textContent = '素晴らしい！電磁波についてよく理解しています。';
    } else if (score >= 7) {
        message.textContent = '良い成績です。復習すればさらに理解が深まります。';
    } else if (score >= 5) {
        message.textContent = 'もう少し復習が必要です。講義資料を見直しましょう。';
    } else {
        message.textContent = '講義資料をしっかり復習しましょう。';
    }

    result.scrollIntoView({ behavior: 'smooth' });
}

function resetQuiz() {
    quizQuestions.forEach((_, index) => {
        const inputs = document.querySelectorAll(`input[name="q${index}"]`);
        inputs.forEach(input => input.checked = false);

        const options = document.querySelectorAll(`.quiz-question[data-question="${index}"] .quiz-option`);
        options.forEach(opt => opt.classList.remove('correct', 'incorrect'));

        const feedback = document.getElementById(`feedback${index}`);
        feedback.className = 'quiz-feedback';
        feedback.textContent = '';
    });

    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizContainer').scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// 計算機
// ========================================

function calculateFromWavelength() {
    const wavelength = parseFloat(document.getElementById('calcWavelength').value);
    const unit = parseFloat(document.getElementById('wavelengthUnit').value);
    const lambda = wavelength * unit;

    const freq = c / lambda;
    const energy = h * freq / eV;

    let result = `<p><strong>周波数:</strong> ${formatFrequency(freq)}</p>`;
    result += `<p><strong>エネルギー:</strong> ${formatEnergy(energy)} eV</p>`;
    document.getElementById('wavelengthResult').innerHTML = result;
}

function calculateFromFrequency() {
    const frequency = parseFloat(document.getElementById('calcFrequency').value);
    const unit = parseFloat(document.getElementById('frequencyUnit').value);
    const freq = frequency * unit;

    const lambda = c / freq;
    const energy = h * freq / eV;

    let result = `<p><strong>波長:</strong> ${formatWavelength(lambda)}</p>`;
    result += `<p><strong>エネルギー:</strong> ${formatEnergy(energy)} eV</p>`;
    document.getElementById('frequencyResult').innerHTML = result;
}

function calculateFromEnergy() {
    const energyVal = parseFloat(document.getElementById('calcEnergy').value);
    const unit = parseFloat(document.getElementById('energyUnit').value);
    const energyJ = energyVal * unit;

    const freq = energyJ / h;
    const lambda = c / freq;

    let result = `<p><strong>波長:</strong> ${formatWavelength(lambda)}</p>`;
    result += `<p><strong>周波数:</strong> ${formatFrequency(freq)}</p>`;
    document.getElementById('energyResult').innerHTML = result;
}

function formatWavelength(lambda) {
    if (lambda < 1e-9) return (lambda * 1e12).toFixed(2) + ' pm';
    if (lambda < 1e-6) return (lambda * 1e9).toFixed(2) + ' nm';
    if (lambda < 1e-3) return (lambda * 1e6).toFixed(2) + ' μm';
    if (lambda < 1) return (lambda * 1e3).toFixed(2) + ' mm';
    return lambda.toFixed(2) + ' m';
}

function formatFrequency(freq) {
    if (freq >= 1e18) return (freq / 1e18).toFixed(2) + ' EHz';
    if (freq >= 1e15) return (freq / 1e15).toFixed(2) + ' PHz';
    if (freq >= 1e12) return (freq / 1e12).toFixed(2) + ' THz';
    if (freq >= 1e9) return (freq / 1e9).toFixed(2) + ' GHz';
    if (freq >= 1e6) return (freq / 1e6).toFixed(2) + ' MHz';
    if (freq >= 1e3) return (freq / 1e3).toFixed(2) + ' kHz';
    return freq.toFixed(2) + ' Hz';
}

function formatEnergy(energy) {
    if (energy >= 1e6) return (energy / 1e6).toFixed(2) + ' MeV';
    if (energy >= 1e3) return (energy / 1e3).toFixed(2) + ' keV';
    if (energy >= 1) return energy.toFixed(3);
    if (energy >= 1e-3) return (energy * 1e3).toFixed(2) + ' meV';
    return (energy * 1e6).toFixed(2) + ' μeV';
}
