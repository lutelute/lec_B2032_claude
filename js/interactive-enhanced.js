// ========================================
// Interactive Learning Tools - Enhanced Version
// 電磁波と物質 インタラクティブ学習ツール
// ========================================

// 物理定数
const CONSTANTS = {
    c: 2.998e8,      // 光速 m/s
    h: 6.626e-34,    // プランク定数 J·s
    hbar: 1.055e-34, // ディラック定数 J·s
    kB: 1.381e-23,   // ボルツマン定数 J/K
    e: 1.602e-19,    // 電気素量 C
    eV: 1.602e-19,   // 電子ボルト J
    me: 9.109e-31,   // 電子質量 kg
    mu0: 4 * Math.PI * 1e-7,  // 真空の透磁率 H/m
    eps0: 8.854e-12, // 真空の誘電率 F/m
    sigma: 5.67e-8,  // シュテファン・ボルツマン定数 W/(m²K⁴)
    wien: 2.898e-3,  // ウィーン定数 m·K
    muB: 9.274e-24,  // ボーア磁子 J/T
    ge: 2.002,       // 電子g因子
    gammaH: 42.58e6, // 水素の磁気回転比 Hz/T
    gammaC13: 10.71e6, // C-13の磁気回転比 Hz/T
    gammaE: 28.025e9   // 電子の磁気回転比 Hz/T
};

// ========================================
// 初期化
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initWaveSimulator();
    initEMWave3D();
    initSpectrumExplorer();
    initBlackbodySimulator();
    initDiffractionSimulator();
    initDopplerSimulator();
    initMaxwellViz();
    initSpinResonance();
    initPhotoelectricEffect();
    initQuiz();
});

// ========================================
// 1. 波動シミュレータ
// ========================================
let waveAnimationId = null;
let wavePhase = 0;
let waveRunning = false;

function initWaveSimulator() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 800;
    canvas.height = 400;

    // イベントリスナー
    const controls = ['waveMode', 'wavelength', 'amplitude', 'speed', 'wavelength2'];
    controls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateWaveDisplay);
    });

    document.getElementById('waveMode')?.addEventListener('change', function() {
        const wave2Controls = document.getElementById('wave2Controls');
        if (wave2Controls) {
            wave2Controls.style.display =
                (this.value === 'superposition' || this.value === 'standing') ? 'block' : 'none';
        }
    });

    document.getElementById('startWave')?.addEventListener('click', startWaveAnimation);
    document.getElementById('stopWave')?.addEventListener('click', stopWaveAnimation);
    document.getElementById('resetWave')?.addEventListener('click', resetWave);

    updateWaveDisplay();
    drawWave();
}

function updateWaveDisplay() {
    const wavelength = parseFloat(document.getElementById('wavelength')?.value || 80);
    const amplitude = parseFloat(document.getElementById('amplitude')?.value || 60);
    const speed = parseFloat(document.getElementById('speed')?.value || 5);

    document.getElementById('wavelengthValue').textContent = wavelength;
    document.getElementById('amplitudeValue').textContent = amplitude;
    document.getElementById('speedValue').textContent = speed;

    const freq = (speed * 10 / wavelength).toFixed(2);
    const period = (1 / (speed * 10 / wavelength)).toFixed(3);
    const velocity = (speed * wavelength / 10).toFixed(0);

    document.getElementById('waveInfoLambda').textContent = wavelength + ' px';
    document.getElementById('waveInfoFreq').textContent = freq + ' Hz';
    document.getElementById('waveInfoPeriod').textContent = period + ' s';
    document.getElementById('waveInfoSpeed').textContent = velocity + ' px/s';

    if (!waveRunning) drawWave();
}

function drawWave() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const mode = document.getElementById('waveMode')?.value || 'single';
    const wavelength = parseFloat(document.getElementById('wavelength')?.value || 80);
    const amplitude = parseFloat(document.getElementById('amplitude')?.value || 60);
    const wavelength2 = parseFloat(document.getElementById('wavelength2')?.value || 100);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // グリッド
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
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

    const centerY = canvas.height / 2;

    // 中心線
    ctx.strokeStyle = '#64748b';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.lineWidth = 3;

    switch (mode) {
        case 'single':
            drawSingleWave(ctx, centerY, wavelength, amplitude, '#3b82f6');
            break;
        case 'em':
            drawEMWave(ctx, centerY, wavelength, amplitude);
            break;
        case 'superposition':
            drawSuperposition(ctx, centerY, wavelength, wavelength2, amplitude);
            break;
        case 'standing':
            drawStandingWave(ctx, centerY, wavelength, amplitude);
            break;
        case 'packet':
            drawWavePacket(ctx, centerY, wavelength, amplitude);
            break;
        case 'interference':
            drawInterference(ctx, wavelength, amplitude);
            break;
    }

    // 波長マーカー
    if (mode !== 'interference') {
        drawWavelengthMarker(ctx, wavelength, canvas.height);
    }
}

function drawSingleWave(ctx, centerY, wavelength, amplitude, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    for (let x = 0; x < ctx.canvas.width; x++) {
        const y = centerY - amplitude * Math.sin(2 * Math.PI * x / wavelength - wavePhase);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function drawEMWave(ctx, centerY, wavelength, amplitude) {
    const offset = 80;

    // 電場 E（青）
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    for (let x = 0; x < ctx.canvas.width; x++) {
        const y = centerY - offset - amplitude * 0.7 * Math.sin(2 * Math.PI * x / wavelength - wavePhase);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 磁場 B（赤）
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    for (let x = 0; x < ctx.canvas.width; x++) {
        const y = centerY + offset - amplitude * 0.7 * Math.sin(2 * Math.PI * x / wavelength - wavePhase);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // ラベル
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('E (電場)', 10, centerY - offset - amplitude * 0.7 - 10);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('B (磁場)', 10, centerY + offset + amplitude * 0.7 + 20);
}

function drawSuperposition(ctx, centerY, wavelength1, wavelength2, amplitude) {
    // 第1波（青）
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < ctx.canvas.width; x++) {
        const y = centerY - amplitude * 0.5 * Math.sin(2 * Math.PI * x / wavelength1 - wavePhase);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 第2波（赤）
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.beginPath();
    for (let x = 0; x < ctx.canvas.width; x++) {
        const y = centerY - amplitude * 0.5 * Math.sin(2 * Math.PI * x / wavelength2 - wavePhase * 1.2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 重ね合わせ（緑）
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < ctx.canvas.width; x++) {
        const y1 = amplitude * 0.5 * Math.sin(2 * Math.PI * x / wavelength1 - wavePhase);
        const y2 = amplitude * 0.5 * Math.sin(2 * Math.PI * x / wavelength2 - wavePhase * 1.2);
        const y = centerY - (y1 + y2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 凡例
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('波1', ctx.canvas.width - 100, 20);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('波2', ctx.canvas.width - 100, 40);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('重ね合わせ', ctx.canvas.width - 100, 60);
}

function drawStandingWave(ctx, centerY, wavelength, amplitude) {
    const timePhase = Math.sin(wavePhase);

    // 定在波エンベロープ
    ctx.strokeStyle = 'rgba(147, 51, 234, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let x = 0; x < ctx.canvas.width; x++) {
        const env = Math.abs(Math.sin(2 * Math.PI * x / wavelength));
        const y = centerY - amplitude * env;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.beginPath();
    for (let x = 0; x < ctx.canvas.width; x++) {
        const env = Math.abs(Math.sin(2 * Math.PI * x / wavelength));
        const y = centerY + amplitude * env;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 定在波
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < ctx.canvas.width; x++) {
        const y = centerY - amplitude * Math.sin(2 * Math.PI * x / wavelength) * timePhase;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 節と腹のマーカー
    ctx.fillStyle = '#f59e0b';
    for (let n = 0; n < ctx.canvas.width / (wavelength / 2); n++) {
        const x = n * wavelength / 2;
        if (n % 2 === 0) {
            // 節
            ctx.beginPath();
            ctx.arc(x, centerY, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

function drawWavePacket(ctx, centerY, wavelength, amplitude) {
    const packetCenter = (ctx.canvas.width / 2 + wavePhase * 20) % (ctx.canvas.width + 200) - 100;
    const packetWidth = wavelength * 3;

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < ctx.canvas.width; x++) {
        const envelope = Math.exp(-Math.pow(x - packetCenter, 2) / (2 * Math.pow(packetWidth, 2)));
        const y = centerY - amplitude * envelope * Math.sin(2 * Math.PI * x / wavelength - wavePhase * 3);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // エンベロープ
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for (let x = 0; x < ctx.canvas.width; x++) {
        const envelope = Math.exp(-Math.pow(x - packetCenter, 2) / (2 * Math.pow(packetWidth, 2)));
        const y = centerY - amplitude * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.beginPath();
    for (let x = 0; x < ctx.canvas.width; x++) {
        const envelope = Math.exp(-Math.pow(x - packetCenter, 2) / (2 * Math.pow(packetWidth, 2)));
        const y = centerY + amplitude * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawInterference(ctx, wavelength, amplitude) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const source1 = { x: 50, y: height / 3 };
    const source2 = { x: 50, y: 2 * height / 3 };

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const r1 = Math.sqrt(Math.pow(x - source1.x, 2) + Math.pow(y - source1.y, 2));
            const r2 = Math.sqrt(Math.pow(x - source2.x, 2) + Math.pow(y - source2.y, 2));

            const wave1 = Math.sin(2 * Math.PI * r1 / wavelength - wavePhase);
            const wave2 = Math.sin(2 * Math.PI * r2 / wavelength - wavePhase);

            const intensity = Math.pow((wave1 + wave2) / 2, 2);
            const idx = (y * width + x) * 4;

            data[idx] = Math.floor(59 + intensity * 196);     // R
            data[idx + 1] = Math.floor(130 + intensity * 125); // G
            data[idx + 2] = Math.floor(246);                   // B
            data[idx + 3] = 255;                               // A
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // 波源マーカー
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(source1.x, source1.y, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(source2.x, source2.y, 8, 0, 2 * Math.PI);
    ctx.fill();
}

function drawWavelengthMarker(ctx, wavelength, height) {
    const startX = ctx.canvas.width / 2 - wavelength / 2;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, height - 30);
    ctx.lineTo(startX + wavelength, height - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startX, height - 40);
    ctx.lineTo(startX, height - 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startX + wavelength, height - 40);
    ctx.lineTo(startX + wavelength, height - 20);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = '14px sans-serif';
    ctx.fillText('λ', startX + wavelength / 2 - 5, height - 35);
}

function startWaveAnimation() {
    if (waveAnimationId) return;
    waveRunning = true;
    const speed = parseFloat(document.getElementById('speed')?.value || 5);

    function animate() {
        wavePhase += speed * 0.03;
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
    waveRunning = false;
}

function resetWave() {
    stopWaveAnimation();
    wavePhase = 0;
    drawWave();
}

// ========================================
// 2. 電磁波3D可視化
// ========================================
let em3DAnimationId = null;
let em3DPhase = 0;

function initEMWave3D() {
    const canvas = document.getElementById('emWave3DCanvas');
    if (!canvas) return;

    canvas.width = canvas.offsetWidth || 800;
    canvas.height = 450;

    ['polarization', 'viewAngle', 'showE', 'showB', 'showS'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', drawEMWave3D);
    });

    drawEMWave3D();
    animateEMWave3D();
}

function drawEMWave3D() {
    const canvas = document.getElementById('emWave3DCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const polarization = document.getElementById('polarization')?.value || 'linear-x';
    const viewAngle = parseFloat(document.getElementById('viewAngle')?.value || 30) * Math.PI / 180;
    const showE = document.getElementById('showE')?.checked ?? true;
    const showB = document.getElementById('showB')?.checked ?? true;
    const showS = document.getElementById('showS')?.checked ?? false;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 150;
    const wavelength = 200;

    // 3D座標変換関数
    function project(x, y, z) {
        const rotY = viewAngle;
        const xr = x * Math.cos(rotY) - z * Math.sin(rotY);
        const zr = x * Math.sin(rotY) + z * Math.cos(rotY);
        return {
            x: centerX + xr,
            y: centerY - y - zr * 0.3
        };
    }

    // 軸を描画
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;

    // Z軸（進行方向）
    const zStart = project(0, 0, -200);
    const zEnd = project(0, 0, 200);
    ctx.beginPath();
    ctx.moveTo(zStart.x, zStart.y);
    ctx.lineTo(zEnd.x, zEnd.y);
    ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.fillText('z (進行方向)', zEnd.x + 10, zEnd.y);

    // 電場と磁場を描画
    for (let z = -180; z <= 180; z += 10) {
        let Ex = 0, Ey = 0, Bx = 0, By = 0;
        const phase = 2 * Math.PI * z / wavelength + em3DPhase;

        switch (polarization) {
            case 'linear-x':
                Ex = scale * 0.5 * Math.sin(phase);
                By = scale * 0.5 * Math.sin(phase);
                break;
            case 'linear-y':
                Ey = scale * 0.5 * Math.sin(phase);
                Bx = -scale * 0.5 * Math.sin(phase);
                break;
            case 'linear-45':
                Ex = scale * 0.35 * Math.sin(phase);
                Ey = scale * 0.35 * Math.sin(phase);
                Bx = -scale * 0.35 * Math.sin(phase);
                By = scale * 0.35 * Math.sin(phase);
                break;
            case 'circular-r':
                Ex = scale * 0.5 * Math.cos(phase);
                Ey = scale * 0.5 * Math.sin(phase);
                Bx = -scale * 0.5 * Math.sin(phase);
                By = scale * 0.5 * Math.cos(phase);
                break;
            case 'circular-l':
                Ex = scale * 0.5 * Math.cos(phase);
                Ey = -scale * 0.5 * Math.sin(phase);
                Bx = scale * 0.5 * Math.sin(phase);
                By = scale * 0.5 * Math.cos(phase);
                break;
            case 'elliptical':
                Ex = scale * 0.5 * Math.cos(phase);
                Ey = scale * 0.3 * Math.sin(phase);
                Bx = -scale * 0.3 * Math.sin(phase);
                By = scale * 0.5 * Math.cos(phase);
                break;
        }

        const origin = project(0, 0, z);

        if (showE) {
            const eEnd = project(Ex, Ey, z);
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y);
            ctx.lineTo(eEnd.x, eEnd.y);
            ctx.stroke();
        }

        if (showB) {
            const bEnd = project(Bx, By, z);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y);
            ctx.lineTo(bEnd.x, bEnd.y);
            ctx.stroke();
        }
    }

    // 凡例
    ctx.font = '14px sans-serif';
    if (showE) {
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('■ 電場 E', 20, 30);
    }
    if (showB) {
        ctx.fillStyle = '#ef4444';
        ctx.fillText('■ 磁場 B', 20, 50);
    }
    if (showS) {
        ctx.fillStyle = '#22c55e';
        ctx.fillText('■ ポインティング S', 20, 70);
    }
}

function animateEMWave3D() {
    em3DPhase += 0.05;
    drawEMWave3D();
    em3DAnimationId = requestAnimationFrame(animateEMWave3D);
}

// ========================================
// 3. スペクトル探索
// ========================================
const spectrumData = {
    gamma: {
        name: 'ガンマ線',
        icon: '☢️',
        source: '原子核崩壊、宇宙線、対消滅',
        use: 'がん治療（ガンマナイフ）、滅菌、非破壊検査',
        detection: 'シンチレータ、半導体検出器',
        interaction: '光電効果、コンプトン散乱、電子対生成'
    },
    xray: {
        name: 'X線',
        icon: '🔬',
        source: '制動放射、特性X線、シンクロトロン',
        use: '医療診断、CT、結晶構造解析、手荷物検査',
        detection: 'イメージングプレート、CCD',
        interaction: '光電効果、コンプトン散乱'
    },
    uv: {
        name: '紫外線',
        icon: '🌞',
        source: '太陽、水銀灯、エキシマレーザー',
        use: '殺菌、リソグラフィ、蛍光分析、日焼け',
        detection: 'UV-PMT、MCPフォスファ',
        interaction: '電子遷移（外殻）、光化学反応'
    },
    visible: {
        name: '可視光線',
        icon: '👁️',
        source: '太陽、LED、レーザー、白熱電球',
        use: '照明、光通信、ディスプレイ、顕微鏡',
        detection: '目、フォトダイオード、CCD/CMOS',
        interaction: '電子の価電子帯遷移'
    },
    ir: {
        name: '赤外線',
        icon: '🌡️',
        source: '熱放射、赤外LED、CO₂レーザー',
        use: 'リモコン、暖房、サーモグラフィ、分光分析',
        detection: 'ボロメータ、MCT検出器',
        interaction: '分子振動・回転、格子振動'
    },
    microwave: {
        name: 'マイクロ波',
        icon: '📡',
        source: 'マグネトロン、ジャイロトロン、BWO',
        use: '電子レンジ、レーダー、5G通信、衛星通信',
        detection: 'ダイオード検出器、ボロメータ',
        interaction: '分子回転、誘電加熱'
    },
    radio: {
        name: '電波',
        icon: '📻',
        source: 'アンテナ、発振回路',
        use: 'ラジオ、テレビ、WiFi、MRI',
        detection: 'アンテナ、同調回路',
        interaction: '自由電子の振動'
    }
};

function initSpectrumExplorer() {
    const slider = document.getElementById('spectrumSlider');
    if (!slider) return;

    slider.addEventListener('input', updateSpectrumDisplay);
    updateSpectrumDisplay();
}

function updateSpectrumDisplay() {
    const slider = document.getElementById('spectrumSlider');
    const value = parseFloat(slider?.value || 50);

    // 対数スケールで波長を計算（1e-14 m から 1e4 m）
    const logMin = -14;
    const logMax = 4;
    const logWavelength = logMin + (logMax - logMin) * value / 100;
    const wavelength = Math.pow(10, logWavelength);

    // 周波数とエネルギーを計算
    const frequency = CONSTANTS.c / wavelength;
    const energy = CONSTANTS.h * frequency / CONSTANTS.eV;
    const temp = CONSTANTS.h * frequency / CONSTANTS.kB;

    // 領域を判定
    let region;
    if (wavelength < 1e-11) region = 'gamma';
    else if (wavelength < 1e-8) region = 'xray';
    else if (wavelength < 4e-7) region = 'uv';
    else if (wavelength < 7e-7) region = 'visible';
    else if (wavelength < 1e-3) region = 'ir';
    else if (wavelength < 1) region = 'microwave';
    else region = 'radio';

    const data = spectrumData[region];

    // マーカー位置を更新
    const marker = document.getElementById('spectrumMarker');
    if (marker) marker.style.left = value + '%';

    // 情報を更新
    document.getElementById('spectrumName').textContent = data.name;
    document.getElementById('spectrumIcon').textContent = data.icon;
    document.getElementById('spectrumWavelength').textContent = formatWavelength(wavelength);
    document.getElementById('spectrumFrequency').textContent = formatFrequency(frequency);
    document.getElementById('spectrumEnergy').textContent = formatEnergy(energy);
    document.getElementById('spectrumTemp').textContent = formatTemperature(temp);
    document.getElementById('spectrumSource').textContent = data.source;
    document.getElementById('spectrumUse').textContent = data.use;
    document.getElementById('spectrumDetection').textContent = data.detection;
    document.getElementById('spectrumInteraction').textContent = data.interaction;

    // 視点角度値の更新
    const viewAngleEl = document.getElementById('viewAngleValue');
    if (viewAngleEl) {
        viewAngleEl.textContent = document.getElementById('viewAngle')?.value + '°';
    }
}

// ========================================
// 4. 黒体放射シミュレータ
// ========================================
function initBlackbodySimulator() {
    const tempSlider = document.getElementById('bbTemp');
    if (!tempSlider) return;

    tempSlider.addEventListener('input', updateBlackbody);
    document.getElementById('bbPreset')?.addEventListener('change', function() {
        document.getElementById('bbTemp').value = this.value;
        updateBlackbody();
    });
    document.getElementById('showWien')?.addEventListener('change', updateBlackbody);
    document.getElementById('showClassical')?.addEventListener('change', updateBlackbody);

    updateBlackbody();
}

function updateBlackbody() {
    const temp = parseFloat(document.getElementById('bbTemp')?.value || 5800);
    document.getElementById('bbTempValue').textContent = temp + ' K';
    document.getElementById('bbTempDisplay').textContent = temp + ' K';

    // ピーク波長（ウィーンの変位則）
    const peakWL = CONSTANTS.wien / temp;
    document.getElementById('peakWavelength').textContent = formatWavelength(peakWL);

    // 全放射パワー（シュテファン・ボルツマン）
    const totalPower = CONSTANTS.sigma * Math.pow(temp, 4);
    document.getElementById('totalPower').textContent = totalPower.toExponential(2) + ' W/m²';

    // 色を設定
    const color = temperatureToColor(temp);
    const colorDisplay = document.getElementById('bbColorDisplay');
    if (colorDisplay) {
        colorDisplay.style.background = color;
    }

    // グラフを描画
    drawBlackbodySpectrum(temp);
}

function drawBlackbodySpectrum(temp) {
    const canvas = document.getElementById('blackbodyCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth || 700;
    canvas.height = 350;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const plotWidth = canvas.width - margin.left - margin.right;
    const plotHeight = canvas.height - margin.top - margin.bottom;

    // プロット領域の背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(margin.left, margin.top, plotWidth, plotHeight);

    // 可視光領域をハイライト
    const visStart = 380e-9;
    const visEnd = 780e-9;
    const xMin = 100e-9;
    const xMax = 3000e-9;

    const visStartX = margin.left + (Math.log10(visStart) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin)) * plotWidth;
    const visEndX = margin.left + (Math.log10(visEnd) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin)) * plotWidth;

    // 可視光グラデーション
    const gradient = ctx.createLinearGradient(visStartX, 0, visEndX, 0);
    gradient.addColorStop(0, 'rgba(148, 0, 211, 0.2)');
    gradient.addColorStop(0.17, 'rgba(75, 0, 130, 0.2)');
    gradient.addColorStop(0.33, 'rgba(0, 0, 255, 0.2)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.2)');
    gradient.addColorStop(0.67, 'rgba(255, 255, 0, 0.2)');
    gradient.addColorStop(0.83, 'rgba(255, 127, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fillRect(visStartX, margin.top, visEndX - visStartX, plotHeight);

    // プランク関数を計算・描画
    const points = [];
    let maxB = 0;

    for (let i = 0; i <= 200; i++) {
        const logLambda = Math.log10(xMin) + i * (Math.log10(xMax) - Math.log10(xMin)) / 200;
        const lambda = Math.pow(10, logLambda);
        const B = planckFunction(lambda, temp);
        points.push({ lambda, B });
        if (B > maxB) maxB = B;
    }

    // スペクトルを描画
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((p, i) => {
        const x = margin.left + (Math.log10(p.lambda) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin)) * plotWidth;
        const y = margin.top + plotHeight - (p.B / maxB) * plotHeight * 0.9;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // ウィーンの変位則のマーカー
    if (document.getElementById('showWien')?.checked) {
        const peakLambda = CONSTANTS.wien / temp;
        if (peakLambda >= xMin && peakLambda <= xMax) {
            const peakX = margin.left + (Math.log10(peakLambda) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin)) * plotWidth;
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(peakX, margin.top);
            ctx.lineTo(peakX, margin.top + plotHeight);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#22c55e';
            ctx.font = '12px sans-serif';
            ctx.fillText('λmax', peakX + 5, margin.top + 20);
        }
    }

    // 軸ラベル
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('波長 (nm)', canvas.width / 2 - 30, canvas.height - 10);
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('放射輝度 B(λ,T)', -40, 0);
    ctx.restore();

    // X軸の目盛り
    [100, 200, 500, 1000, 2000, 3000].forEach(nm => {
        const lambda = nm * 1e-9;
        if (lambda >= xMin && lambda <= xMax) {
            const x = margin.left + (Math.log10(lambda) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin)) * plotWidth;
            ctx.fillStyle = '#64748b';
            ctx.fillText(nm.toString(), x - 15, canvas.height - margin.bottom + 20);
        }
    });

    // タイトル
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`黒体放射スペクトル (T = ${temp} K)`, margin.left, 25);
}

function planckFunction(lambda, T) {
    const c1 = 2 * CONSTANTS.h * Math.pow(CONSTANTS.c, 2);
    const c2 = CONSTANTS.h * CONSTANTS.c / (CONSTANTS.kB * T);
    return c1 / (Math.pow(lambda, 5) * (Math.exp(c2 / lambda) - 1));
}

function temperatureToColor(temp) {
    // 温度から近似的な色を計算
    let r, g, b;

    if (temp < 1000) {
        r = 255;
        g = Math.floor(temp / 1000 * 100);
        b = 0;
    } else if (temp < 4000) {
        r = 255;
        g = Math.floor(100 + (temp - 1000) / 3000 * 155);
        b = Math.floor((temp - 1000) / 3000 * 100);
    } else if (temp < 7000) {
        r = 255;
        g = 255;
        b = Math.floor(100 + (temp - 4000) / 3000 * 155);
    } else if (temp < 10000) {
        r = Math.floor(255 - (temp - 7000) / 3000 * 50);
        g = Math.floor(255 - (temp - 7000) / 3000 * 30);
        b = 255;
    } else {
        r = Math.floor(200 - (temp - 10000) / 10000 * 50);
        g = Math.floor(220 - (temp - 10000) / 10000 * 50);
        b = 255;
    }

    return `rgb(${Math.min(255, Math.max(0, r))}, ${Math.min(255, Math.max(0, g))}, ${Math.min(255, Math.max(0, b))})`;
}

// ========================================
// 5. 回折シミュレータ
// ========================================
function initDiffractionSimulator() {
    const controls = ['diffractionMode', 'slitWidth', 'slitSeparation', 'diffWavelength', 'screenDistance'];
    controls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateDiffraction);
    });
    updateDiffraction();
}

function updateDiffraction() {
    const mode = document.getElementById('diffractionMode')?.value || 'single';
    const slitWidth = parseFloat(document.getElementById('slitWidth')?.value || 20) * 1e-6;
    const slitSeparation = parseFloat(document.getElementById('slitSeparation')?.value || 100) * 1e-6;
    const wavelength = parseFloat(document.getElementById('diffWavelength')?.value || 550) * 1e-9;
    const screenDistance = parseFloat(document.getElementById('screenDistance')?.value || 1);

    // 値を表示
    document.getElementById('slitWidthValue').textContent = (slitWidth * 1e6).toFixed(0) + ' μm';
    document.getElementById('slitSeparationValue').textContent = (slitSeparation * 1e6).toFixed(0) + ' μm';
    document.getElementById('diffWavelengthValue').textContent = (wavelength * 1e9).toFixed(0) + ' nm';
    document.getElementById('screenDistanceValue').textContent = screenDistance.toFixed(1) + ' m';

    // 計算結果
    const centralWidth = screenDistance * wavelength / slitWidth * 1000; // mm
    const fringeSpacing = screenDistance * wavelength / slitSeparation * 1000; // mm
    const firstMin = screenDistance * wavelength / slitWidth * 1000; // mm

    document.getElementById('centralWidth').textContent = centralWidth.toFixed(1) + ' mm';
    document.getElementById('fringeSpacing').textContent = fringeSpacing.toFixed(1) + ' mm';
    document.getElementById('firstMinimum').textContent = '±' + firstMin.toFixed(1) + ' mm';

    // グラフを描画
    drawDiffractionPattern(mode, slitWidth, slitSeparation, wavelength, screenDistance);
}

function drawDiffractionPattern(mode, a, d, lambda, L) {
    const canvas = document.getElementById('diffractionCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth || 700;
    canvas.height = 400;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const margin = { top: 40, right: 40, bottom: 80, left: 60 };
    const plotWidth = canvas.width - margin.left - margin.right;
    const plotHeight = canvas.height - margin.top - margin.bottom;

    // 色を波長から取得
    const color = wavelengthToColor(lambda * 1e9);

    // 回折パターンを計算
    const points = [];
    const maxAngle = 0.05; // ラジアン

    for (let i = 0; i <= 500; i++) {
        const theta = -maxAngle + 2 * maxAngle * i / 500;
        let intensity;

        switch (mode) {
            case 'single':
                const beta = Math.PI * a * Math.sin(theta) / lambda;
                intensity = beta === 0 ? 1 : Math.pow(Math.sin(beta) / beta, 2);
                break;
            case 'double':
                const beta2 = Math.PI * a * Math.sin(theta) / lambda;
                const gamma = Math.PI * d * Math.sin(theta) / lambda;
                const singleSlit = beta2 === 0 ? 1 : Math.pow(Math.sin(beta2) / beta2, 2);
                intensity = singleSlit * Math.pow(Math.cos(gamma), 2);
                break;
            case 'grating':
                const N = 10; // スリット数
                const beta3 = Math.PI * a * Math.sin(theta) / lambda;
                const gamma3 = Math.PI * d * Math.sin(theta) / lambda;
                const singleSlit3 = beta3 === 0 ? 1 : Math.pow(Math.sin(beta3) / beta3, 2);
                const multiSlit = gamma3 === 0 ? N*N : Math.pow(Math.sin(N * gamma3) / Math.sin(gamma3), 2) / (N*N);
                intensity = singleSlit3 * multiSlit;
                break;
            case 'circular':
                const rho = Math.PI * a * Math.sin(theta) / lambda;
                // ベッセル関数の近似
                intensity = rho === 0 ? 1 : Math.pow(2 * besselJ1(rho) / rho, 2);
                break;
        }

        points.push({ theta, intensity });
    }

    // 回折パターンの画像
    const patternHeight = 80;
    for (let i = 0; i < plotWidth; i++) {
        const idx = Math.floor(i / plotWidth * points.length);
        const intensity = points[idx].intensity;
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity})`;
        ctx.fillRect(margin.left + i, margin.top, 1, patternHeight);
    }

    // 強度グラフ
    ctx.strokeStyle = color.hex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
        const x = margin.left + i / points.length * plotWidth;
        const y = margin.top + patternHeight + 20 + (1 - p.intensity) * (plotHeight - patternHeight - 40);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 軸
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + patternHeight + 20);
    ctx.lineTo(margin.left + plotWidth, margin.top + patternHeight + 20);
    ctx.moveTo(margin.left, margin.top + patternHeight + 20);
    ctx.lineTo(margin.left, margin.top + plotHeight);
    ctx.stroke();

    // ラベル
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('スクリーン位置 x', canvas.width / 2 - 50, canvas.height - 20);
    ctx.fillText('I(θ)', margin.left - 40, margin.top + patternHeight + plotHeight / 2);
}

function besselJ1(x) {
    // J1ベッセル関数の近似
    if (Math.abs(x) < 0.001) return x / 2;
    return Math.sin(x - Math.PI / 4) * Math.sqrt(2 / (Math.PI * Math.abs(x)));
}

function wavelengthToColor(nm) {
    let r, g, b;
    if (nm < 380) { r = 0.5; g = 0; b = 1; }
    else if (nm < 440) { r = (440 - nm) / 60; g = 0; b = 1; }
    else if (nm < 490) { r = 0; g = (nm - 440) / 50; b = 1; }
    else if (nm < 510) { r = 0; g = 1; b = (510 - nm) / 20; }
    else if (nm < 580) { r = (nm - 510) / 70; g = 1; b = 0; }
    else if (nm < 645) { r = 1; g = (645 - nm) / 65; b = 0; }
    else { r = 1; g = 0; b = 0; }

    r = Math.floor(r * 255);
    g = Math.floor(g * 255);
    b = Math.floor(b * 255);

    return { r, g, b, hex: `rgb(${r}, ${g}, ${b})` };
}

// ========================================
// 6. ドップラー効果
// ========================================
function initDopplerSimulator() {
    const controls = ['dopplerVelocity', 'sourceWavelength'];
    controls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateDoppler);
    });
    updateDoppler();
}

function updateDoppler() {
    const beta = parseFloat(document.getElementById('dopplerVelocity')?.value || 0.3);
    const sourceLambda = parseFloat(document.getElementById('sourceWavelength')?.value || 550);

    document.getElementById('dopplerVelocityValue').textContent =
        `${beta.toFixed(2)}c (${(beta * CONSTANTS.c / 1e6).toFixed(1)}×10⁶ m/s)`;
    document.getElementById('sourceWavelengthValue').textContent = sourceLambda + ' nm';

    // 相対論的ドップラー効果
    const dopplerFactor = Math.sqrt((1 + beta) / (1 - beta));
    const observedLambda = sourceLambda * dopplerFactor;
    const z = dopplerFactor - 1;

    document.getElementById('sourceWL').textContent = sourceLambda + ' nm';
    document.getElementById('observedWL').textContent = observedLambda.toFixed(1) + ' nm';
    document.getElementById('redshiftZ').textContent = `z = ${z.toFixed(3)}`;

    // 色を設定
    const sourceColor = wavelengthToColor(sourceLambda);
    const observedColor = wavelengthToColor(Math.min(780, Math.max(380, observedLambda)));

    document.getElementById('sourceColor').style.background = sourceColor.hex;
    document.getElementById('observedColor').style.background = observedColor.hex;

    // シフトの種類
    const shiftType = document.getElementById('shiftType');
    if (beta > 0) {
        shiftType.textContent = '赤方偏移';
        shiftType.className = 'shift-label redshift';
    } else if (beta < 0) {
        shiftType.textContent = '青方偏移';
        shiftType.className = 'shift-label blueshift';
    } else {
        shiftType.textContent = 'シフトなし';
        shiftType.className = 'shift-label';
    }

    // アニメーション描画
    drawDopplerAnimation(beta, sourceLambda);
}

function drawDopplerAnimation(beta, sourceLambda) {
    const canvas = document.getElementById('dopplerCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth || 700;
    canvas.height = 350;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerY = canvas.height / 2;
    const sourceX = 100;
    const observerX = canvas.width - 100;

    // 光源
    ctx.fillStyle = wavelengthToColor(sourceLambda).hex;
    ctx.beginPath();
    ctx.arc(sourceX, centerY, 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '12px sans-serif';
    ctx.fillText('光源', sourceX - 15, centerY + 50);

    // 速度矢印
    if (beta !== 0) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sourceX + 40, centerY);
        ctx.lineTo(sourceX + 40 + beta * 100, centerY);
        ctx.stroke();
        // 矢印の先端
        const arrowDir = beta > 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(sourceX + 40 + beta * 100, centerY);
        ctx.lineTo(sourceX + 40 + beta * 100 - arrowDir * 10, centerY - 8);
        ctx.lineTo(sourceX + 40 + beta * 100 - arrowDir * 10, centerY + 8);
        ctx.closePath();
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.fillText(`v = ${(beta * 100).toFixed(0)}% c`, sourceX + 50, centerY - 20);
    }

    // 観測者
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(observerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('観測者', observerX - 20, centerY + 40);

    // 波を描画
    const observedLambda = sourceLambda * Math.sqrt((1 + beta) / (1 - beta));
    const color = wavelengthToColor(Math.min(780, Math.max(380, observedLambda)));

    ctx.strokeStyle = color.hex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = sourceX + 50; x < observerX - 30; x++) {
        const scaledLambda = sourceLambda * (1 - beta * (x - sourceX) / (observerX - sourceX)) * 0.3;
        const y = centerY + 30 * Math.sin(2 * Math.PI * x / scaledLambda);
        if (x === sourceX + 50) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

// ========================================
// 7. マクスウェル方程式可視化
// ========================================
function initMaxwellViz() {
    const tabs = document.querySelectorAll('.maxwell-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.maxwell-content').forEach(c => c.style.display = 'none');
            document.getElementById('maxwell-' + this.dataset.eq).style.display = 'block';
        });
    });

    drawGaussE();
    drawGaussB();
    drawFaraday();
    drawAmpere();
}

function drawGaussE() {
    const canvas = document.getElementById('gaussECanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const chargeAmount = parseFloat(document.getElementById('chargeAmount')?.value || 3);

    // 電場線
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    const numLines = 16;
    for (let i = 0; i < numLines; i++) {
        const angle = (2 * Math.PI * i) / numLines;
        ctx.beginPath();
        if (chargeAmount > 0) {
            ctx.moveTo(centerX + 20 * Math.cos(angle), centerY + 20 * Math.sin(angle));
            ctx.lineTo(centerX + 100 * Math.cos(angle), centerY + 100 * Math.sin(angle));
        } else {
            ctx.moveTo(centerX + 100 * Math.cos(angle), centerY + 100 * Math.sin(angle));
            ctx.lineTo(centerX + 20 * Math.cos(angle), centerY + 20 * Math.sin(angle));
        }
        ctx.stroke();

        // 矢印
        const arrowX = centerX + 70 * Math.cos(angle);
        const arrowY = centerY + 70 * Math.sin(angle);
        const arrowAngle = chargeAmount > 0 ? angle : angle + Math.PI;
        drawArrow(ctx, arrowX, arrowY, arrowAngle, '#3b82f6');
    }

    // 電荷
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = chargeAmount > 0 ? '#ef4444' : '#3b82f6';
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(chargeAmount > 0 ? '+' : '−', centerX, centerY);
}

function drawGaussB() {
    const canvas = document.getElementById('gaussBCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 磁石
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(centerX - 80, centerY - 20, 60, 40);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(centerX + 20, centerY - 20, 60, 40);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', centerX - 50, centerY + 5);
    ctx.fillText('S', centerX + 50, centerY + 5);

    // 閉じた磁力線
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    for (let r = 40; r <= 80; r += 20) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, r + 40, r, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

function drawFaraday() {
    const canvas = document.getElementById('faradayCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 変化する磁場
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 50);
    ctx.lineTo(centerX, centerY + 50);
    ctx.stroke();
    drawArrow(ctx, centerX, centerY + 40, Math.PI / 2, '#22c55e');
    ctx.fillStyle = '#22c55e';
    ctx.font = '14px sans-serif';
    ctx.fillText('dB/dt', centerX + 20, centerY);

    // 誘導電場（円形）
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // 電場方向の矢印
    for (let i = 0; i < 8; i++) {
        const angle = (2 * Math.PI * i) / 8;
        const x = centerX + 80 * Math.cos(angle);
        const y = centerY + 80 * Math.sin(angle);
        drawArrow(ctx, x, y, angle + Math.PI / 2, '#3b82f6');
    }
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('E', centerX + 90, centerY);
}

function drawAmpere() {
    const canvas = document.getElementById('ampereCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 電流（紙面から出てくる）
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.font = '12px sans-serif';
    ctx.fillText('I (⊙)', centerX - 15, centerY + 35);

    // 磁場（同心円）
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    for (let r = 40; r <= 100; r += 30) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
        ctx.stroke();
    }

    // 磁場方向の矢印
    for (let r = 40; r <= 100; r += 30) {
        const angle = Math.PI / 4;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        drawArrow(ctx, x, y, angle + Math.PI / 2, '#ec4899');
    }
    ctx.fillStyle = '#ec4899';
    ctx.fillText('B', centerX + 110, centerY);
}

function drawArrow(ctx, x, y, angle, color) {
    const size = 10;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
    ctx.lineTo(x + size * Math.cos(angle + 2.5), y + size * Math.sin(angle + 2.5));
    ctx.lineTo(x + size * Math.cos(angle - 2.5), y + size * Math.sin(angle - 2.5));
    ctx.closePath();
    ctx.fill();
}

// ========================================
// 8. スピン共鳴
// ========================================
let spinAnimationId2 = null;
let spinAngle2 = 0;

function initSpinResonance() {
    const controls = ['spinType', 'magneticField', 'rfFrequency', 'rfPower', 'pulseType'];
    controls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateSpinResonance);
    });
    updateSpinResonance();
    animateSpin2();
}

function updateSpinResonance() {
    const spinType = document.getElementById('spinType')?.value || 'proton';
    const B0 = parseFloat(document.getElementById('magneticField')?.value || 1.5);
    const rfPercent = parseFloat(document.getElementById('rfFrequency')?.value || 50);

    document.getElementById('fieldValue').textContent = B0.toFixed(1) + ' T';

    // 磁気回転比を取得
    let gamma, unit, maxFreq;
    switch (spinType) {
        case 'electron':
            gamma = CONSTANTS.gammaE;
            unit = 'GHz';
            maxFreq = 500;
            break;
        case 'proton':
            gamma = CONSTANTS.gammaH;
            unit = 'MHz';
            maxFreq = 1000;
            break;
        case 'carbon13':
            gamma = CONSTANTS.gammaC13;
            unit = 'MHz';
            maxFreq = 200;
            break;
    }

    // ラーモア周波数
    const larmorFreq = gamma * B0;
    const larmorDisplay = spinType === 'electron' ?
        (larmorFreq / 1e9).toFixed(2) + ' GHz' :
        (larmorFreq / 1e6).toFixed(2) + ' MHz';
    document.getElementById('larmorFreq').textContent = larmorDisplay;

    // RF周波数
    const rfFreq = rfPercent / 100 * maxFreq;
    const rfDisplay = spinType === 'electron' ?
        rfFreq.toFixed(1) + ' GHz' :
        rfFreq.toFixed(1) + ' MHz';
    document.getElementById('rfValue').textContent = rfDisplay;

    // 共鳴判定
    const rfFreqHz = spinType === 'electron' ? rfFreq * 1e9 : rfFreq * 1e6;
    const isResonance = Math.abs(rfFreqHz - larmorFreq) / larmorFreq < 0.05;
    const indicator = document.getElementById('resonanceIndicator');
    if (isResonance) {
        indicator.textContent = '共鳴中!';
        indicator.className = 'status on-resonance';
    } else {
        indicator.textContent = '非共鳴';
        indicator.className = 'status off-resonance';
    }
}

function animateSpin2() {
    const canvas = document.getElementById('spinCanvas3D');
    if (!canvas) {
        spinAnimationId2 = requestAnimationFrame(animateSpin2);
        return;
    }
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth || 600;
    canvas.height = 400;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 座標軸
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    // Z軸
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 150);
    ctx.lineTo(centerX, centerY - 150);
    ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.fillText('B₀ (z)', centerX + 10, centerY - 140);

    // スピンベクトル
    const spinLength = 120;
    const tilt = 0.4;
    spinAngle2 += 0.05;

    const spinX = centerX + spinLength * Math.sin(tilt) * Math.cos(spinAngle2);
    const spinY = centerY - spinLength * Math.cos(tilt);

    // 歳差運動の軌跡
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(centerX, spinY + spinLength * Math.cos(tilt),
                spinLength * Math.sin(tilt), spinLength * Math.sin(tilt) * 0.3,
                0, 0, 2 * Math.PI);
    ctx.stroke();

    // スピンベクトル
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(spinX, spinY);
    ctx.stroke();

    // 矢印先端
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(spinX, spinY, 8, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('μ', spinX + 15, spinY);

    spinAnimationId2 = requestAnimationFrame(animateSpin2);
}

// ========================================
// 9. 光電効果
// ========================================
function initPhotoelectricEffect() {
    const controls = ['peMetal', 'peWavelength', 'peIntensity', 'peVoltage'];
    controls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePhotoelectric);
    });
    updatePhotoelectric();
}

function updatePhotoelectric() {
    const workFunction = parseFloat(document.getElementById('peMetal')?.value || 4.5);
    const wavelength = parseFloat(document.getElementById('peWavelength')?.value || 300) * 1e-9;
    const intensity = parseFloat(document.getElementById('peIntensity')?.value || 50);
    const voltage = parseFloat(document.getElementById('peVoltage')?.value || 0);

    document.getElementById('peWavelengthValue').textContent = (wavelength * 1e9).toFixed(0) + ' nm';
    document.getElementById('peIntensityValue').textContent = intensity + '%';
    document.getElementById('peVoltageValue').textContent = voltage.toFixed(1) + ' V';

    // 光子エネルギー
    const photonEnergy = CONSTANTS.h * CONSTANTS.c / wavelength / CONSTANTS.eV;
    document.getElementById('photonEnergy').textContent = photonEnergy.toFixed(2) + ' eV';
    document.getElementById('workFunction').textContent = workFunction.toFixed(2) + ' eV';

    // 最大運動エネルギー
    const maxKE = photonEnergy - workFunction;
    if (maxKE > 0) {
        document.getElementById('maxKE').textContent = maxKE.toFixed(2) + ' eV';
    } else {
        document.getElementById('maxKE').textContent = '0 eV (放出なし)';
    }

    // 限界波長
    const thresholdWL = CONSTANTS.h * CONSTANTS.c / (workFunction * CONSTANTS.eV) * 1e9;
    document.getElementById('thresholdWL').textContent = thresholdWL.toFixed(0) + ' nm';

    // シミュレーション描画
    drawPhotoelectricSimulation(photonEnergy, workFunction, intensity, voltage);
}

function drawPhotoelectricSimulation(photonEnergy, workFunction, intensity, voltage) {
    const canvas = document.getElementById('photoelectricCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth || 700;
    canvas.height = 400;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 金属板
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(200, 100, 20, 200);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '14px sans-serif';
    ctx.fillText('金属', 190, 320);

    // コレクター
    ctx.fillStyle = '#374151';
    ctx.fillRect(500, 100, 20, 200);
    ctx.fillText('コレクター', 480, 320);

    // 入射光
    const color = wavelengthToColor(1240 / photonEnergy);
    ctx.strokeStyle = color.hex;
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
        const y = 150 + i * 30;
        ctx.beginPath();
        ctx.moveTo(50, y - 50);
        ctx.lineTo(195, y);
        ctx.stroke();
        // 矢印
        ctx.fillStyle = color.hex;
        ctx.beginPath();
        ctx.moveTo(195, y);
        ctx.lineTo(185, y - 5);
        ctx.lineTo(185, y + 5);
        ctx.closePath();
        ctx.fill();
    }
    ctx.fillText('光 (hf)', 80, 100);

    // 電子放出
    if (photonEnergy > workFunction) {
        const numElectrons = Math.floor(intensity / 20);
        ctx.fillStyle = '#3b82f6';
        for (let i = 0; i < numElectrons; i++) {
            const x = 230 + Math.random() * 200;
            const y = 150 + Math.random() * 100;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('e⁻', 350, 280);
    }

    // 電圧表示
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`V = ${voltage.toFixed(1)} V`, 340, 350);
}

// ========================================
// 10. クイズ
// ========================================
const quizQuestions = {
    basics: [
        { q: '電磁波の速度を表す式として正しいものは？', o: ['c = fλ', 'c = f/λ', 'c = λ/f', 'c = f + λ'], a: 0 },
        { q: '真空中の光速の値として正しいものは？', o: ['3.0×10⁶ m/s', '3.0×10⁸ m/s', '3.0×10¹⁰ m/s', '3.0×10⁴ m/s'], a: 1 },
        { q: '電磁波において電場と磁場の関係は？', o: ['平行', '垂直', '45度', '反平行'], a: 1 },
    ],
    spectrum: [
        { q: '可視光線の波長範囲として正しいものは？', o: ['100-400 nm', '400-700 nm', '700-1000 nm', '1-10 μm'], a: 1 },
        { q: 'レイリー散乱の強度は波長の何乗に反比例する？', o: ['1乗', '2乗', '3乗', '4乗'], a: 3 },
        { q: '空が青く見える理由は？', o: ['青い光の吸収', '青い光の散乱', '赤い光の吸収', '大気の色'], a: 1 },
    ],
    maxwell: [
        { q: 'マクスウェル方程式の数は？', o: ['2つ', '3つ', '4つ', '5つ'], a: 2 },
        { q: 'ガウスの法則（磁場）∇·B = 0 は何を意味する？', o: ['磁荷は存在しない', '磁場は保存力', '磁場は渦なし', '磁場は一様'], a: 0 },
        { q: '変位電流を導入したのは誰？', o: ['ファラデー', 'アンペール', 'マクスウェル', 'ヘルツ'], a: 2 },
    ],
    quantum: [
        { q: '光子のエネルギーを表す式は？', o: ['E = mc²', 'E = hf', 'E = ½mv²', 'E = kT'], a: 1 },
        { q: 'プランク定数の値は約？', o: ['6.6×10⁻³⁴ J·s', '6.6×10⁻²⁴ J·s', '1.6×10⁻¹⁹ J', '9.1×10⁻³¹ kg'], a: 0 },
        { q: '光電効果で電子の最大運動エネルギーは何に依存する？', o: ['光の強度', '光の周波数', '金属の温度', '照射時間'], a: 1 },
    ],
    applications: [
        { q: 'MRIで利用される現象は？', o: ['光電効果', '核磁気共鳴', 'X線吸収', '超音波反射'], a: 1 },
        { q: '電子レンジのマイクロ波周波数は約？', o: ['900 MHz', '2.45 GHz', '5 GHz', '10 GHz'], a: 1 },
        { q: 'ジャイロトロンが発生する電磁波は？', o: ['X線', '可視光', 'ミリ波', '電波'], a: 2 },
    ]
};

function initQuiz() {
    document.getElementById('startQuiz')?.addEventListener('click', generateQuiz);
    document.getElementById('submitQuiz')?.addEventListener('click', checkQuiz);
    document.getElementById('resetQuiz')?.addEventListener('click', resetQuiz);
}

function generateQuiz() {
    const difficulty = document.getElementById('quizDifficulty')?.value || 'basic';
    const topic = document.getElementById('quizTopic')?.value || 'all';

    let questions = [];
    if (topic === 'all') {
        Object.values(quizQuestions).forEach(qs => questions = questions.concat(qs));
    } else {
        questions = quizQuestions[topic] || [];
    }

    // シャッフルして問題数を決定
    questions = shuffleArray(questions);
    const numQuestions = difficulty === 'basic' ? 10 : difficulty === 'intermediate' ? 15 : 20;
    questions = questions.slice(0, Math.min(numQuestions, questions.length));

    const container = document.getElementById('quizContainer');
    container.innerHTML = '';

    questions.forEach((q, idx) => {
        const div = document.createElement('div');
        div.className = 'quiz-question';
        div.dataset.correct = q.a;
        div.innerHTML = `
            <h4>Q${idx + 1}. ${q.q}</h4>
            <div class="quiz-options">
                ${q.o.map((opt, i) => `
                    <label class="quiz-option">
                        <input type="radio" name="q${idx}" value="${i}">
                        ${opt}
                    </label>
                `).join('')}
            </div>
            <div class="quiz-feedback"></div>
        `;
        container.appendChild(div);
    });

    document.getElementById('quizActions').style.display = 'flex';
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizTotal').textContent = questions.length;
}

function checkQuiz() {
    const questions = document.querySelectorAll('.quiz-question');
    let score = 0;

    questions.forEach((q, idx) => {
        const correct = parseInt(q.dataset.correct);
        const selected = q.querySelector(`input[name="q${idx}"]:checked`);
        const feedback = q.querySelector('.quiz-feedback');
        const options = q.querySelectorAll('.quiz-option');

        options.forEach(o => o.classList.remove('correct', 'incorrect'));

        if (selected) {
            const value = parseInt(selected.value);
            if (value === correct) {
                score++;
                options[value].classList.add('correct');
                feedback.textContent = '正解!';
                feedback.className = 'quiz-feedback correct show';
            } else {
                options[value].classList.add('incorrect');
                options[correct].classList.add('correct');
                feedback.textContent = '不正解';
                feedback.className = 'quiz-feedback incorrect show';
            }
        } else {
            options[correct].classList.add('correct');
            feedback.textContent = '未回答';
            feedback.className = 'quiz-feedback incorrect show';
        }
    });

    const total = questions.length;
    const percentage = Math.round(score / total * 100);

    document.getElementById('quizScore').textContent = score;
    document.getElementById('scorePercentage').textContent = percentage + '%';

    let message;
    if (percentage >= 90) message = '素晴らしい! 電磁波について深く理解しています。';
    else if (percentage >= 70) message = '良い成績です。復習すればさらに理解が深まります。';
    else if (percentage >= 50) message = 'もう少し復習が必要です。講義資料を見直しましょう。';
    else message = '講義資料をしっかり復習しましょう。';

    document.getElementById('quizMessage').textContent = message;
    document.getElementById('quizResult').style.display = 'block';
}

function resetQuiz() {
    generateQuiz();
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ========================================
// 計算機関数
// ========================================
function calculateFromWavelength() {
    const wavelength = parseFloat(document.getElementById('calcWavelength').value);
    const unit = parseFloat(document.getElementById('wavelengthUnit').value);
    const lambda = wavelength * unit;

    const freq = CONSTANTS.c / lambda;
    const energy = CONSTANTS.h * freq / CONSTANTS.eV;

    document.getElementById('wavelengthResult').innerHTML = `
        <p><strong>周波数:</strong> ${formatFrequency(freq)}</p>
        <p><strong>エネルギー:</strong> ${formatEnergy(energy)} eV</p>
        <p><strong>波数:</strong> ${(2 * Math.PI / lambda).toExponential(3)} rad/m</p>
    `;
}

function calculateFromFrequency() {
    const frequency = parseFloat(document.getElementById('calcFrequency').value);
    const unit = parseFloat(document.getElementById('frequencyUnit').value);
    const freq = frequency * unit;

    const lambda = CONSTANTS.c / freq;
    const energy = CONSTANTS.h * freq / CONSTANTS.eV;

    document.getElementById('frequencyResult').innerHTML = `
        <p><strong>波長:</strong> ${formatWavelength(lambda)}</p>
        <p><strong>エネルギー:</strong> ${formatEnergy(energy)} eV</p>
    `;
}

function calculateFromEnergy() {
    const energyVal = parseFloat(document.getElementById('calcEnergy').value);
    const unit = parseFloat(document.getElementById('energyUnit').value);
    const energyJ = energyVal * unit;

    const freq = energyJ / CONSTANTS.h;
    const lambda = CONSTANTS.c / freq;

    document.getElementById('energyResult').innerHTML = `
        <p><strong>波長:</strong> ${formatWavelength(lambda)}</p>
        <p><strong>周波数:</strong> ${formatFrequency(freq)}</p>
    `;
}

function calculateBlackbody() {
    const temp = parseFloat(document.getElementById('calcBBTemp').value);

    const peakLambda = CONSTANTS.wien / temp;
    const totalPower = CONSTANTS.sigma * Math.pow(temp, 4);
    const peakFreq = CONSTANTS.c / peakLambda;

    document.getElementById('blackbodyResult').innerHTML = `
        <p><strong>ピーク波長:</strong> ${formatWavelength(peakLambda)}</p>
        <p><strong>ピーク周波数:</strong> ${formatFrequency(peakFreq)}</p>
        <p><strong>全放射パワー密度:</strong> ${totalPower.toExponential(2)} W/m²</p>
    `;
}

function calculateDoppler() {
    const beta = parseFloat(document.getElementById('calcVelocity').value);
    const lambda0 = parseFloat(document.getElementById('calcOriginalWL').value);

    const dopplerFactor = Math.sqrt((1 + beta) / (1 - beta));
    const lambdaObs = lambda0 * dopplerFactor;
    const z = dopplerFactor - 1;

    document.getElementById('dopplerResult').innerHTML = `
        <p><strong>観測波長:</strong> ${lambdaObs.toFixed(1)} nm</p>
        <p><strong>赤方偏移 z:</strong> ${z.toFixed(4)}</p>
        <p><strong>ドップラー因子:</strong> ${dopplerFactor.toFixed(4)}</p>
    `;
}

function calculateDiffraction() {
    const lambda = parseFloat(document.getElementById('calcDiffWL').value) * 1e-9;
    const D = parseFloat(document.getElementById('calcAperture').value) * 1e-3;

    const thetaRad = 1.22 * lambda / D;
    const thetaArcsec = thetaRad * 206265;

    document.getElementById('diffractionResult').innerHTML = `
        <p><strong>角度分解能:</strong> ${thetaRad.toExponential(2)} rad</p>
        <p><strong>角度分解能:</strong> ${thetaArcsec.toFixed(2)} 秒角</p>
        <p><strong>レイリー基準:</strong> θ = 1.22λ/D</p>
    `;
}

// ========================================
// ユーティリティ関数
// ========================================
function formatWavelength(lambda) {
    if (lambda < 1e-12) return (lambda * 1e15).toFixed(2) + ' fm';
    if (lambda < 1e-9) return (lambda * 1e12).toFixed(2) + ' pm';
    if (lambda < 1e-6) return (lambda * 1e9).toFixed(2) + ' nm';
    if (lambda < 1e-3) return (lambda * 1e6).toFixed(2) + ' μm';
    if (lambda < 1) return (lambda * 1e3).toFixed(2) + ' mm';
    if (lambda < 1e3) return lambda.toFixed(2) + ' m';
    return (lambda / 1e3).toFixed(2) + ' km';
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
    if (energy >= 1e9) return (energy / 1e9).toFixed(2) + ' GeV';
    if (energy >= 1e6) return (energy / 1e6).toFixed(2) + ' MeV';
    if (energy >= 1e3) return (energy / 1e3).toFixed(2) + ' keV';
    if (energy >= 1) return energy.toFixed(3);
    if (energy >= 1e-3) return (energy * 1e3).toFixed(2) + ' meV';
    return (energy * 1e6).toFixed(2) + ' μeV';
}

function formatTemperature(temp) {
    if (temp >= 1e9) return (temp / 1e9).toFixed(1) + ' GK';
    if (temp >= 1e6) return (temp / 1e6).toFixed(1) + ' MK';
    if (temp >= 1e3) return (temp / 1e3).toFixed(1) + ' kK';
    return temp.toFixed(0) + ' K';
}
