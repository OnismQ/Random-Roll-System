(function () {
    const lanternLayer = document.getElementById('lanternLayer');
    const confettiLayer = document.getElementById('confettiLayer');
    const startBtn = document.getElementById('startBtn');
    const brandSplash = document.getElementById('brandSplash');
    const brandText = document.getElementById('brandText');
    const revealNodes = document.querySelectorAll('.reveal-after-splash');

    function spawnLantern() {
        if (!lanternLayer) return;
        const lantern = document.createElement('div');
        lantern.className = 'lantern';
        const size = Math.random() * 18 + 26;
        lantern.style.width = `${size}px`;
        lantern.style.height = `${size * 1.35}px`;
        lantern.style.left = `${Math.random() * 100}%`;
        const duration = Math.random() * 6 + 10;
        const delay = Math.random() * 3;
        lantern.style.animationDuration = `${duration}s`;
        lantern.style.animationDelay = `${delay}s`;
        lanternLayer.appendChild(lantern);

        const cleanupMs = (duration + delay + 0.5) * 1000;
        lantern.addEventListener('animationend', () => lantern.remove(), { once: true });
        setTimeout(() => lantern.remove(), cleanupMs);
    }

    function burstConfetti() {
        if (!confettiLayer) return;
        const colors = ['#ffd166', '#ff4d6d', '#ff9a9e', '#f6d365', '#8ef6e4'];
        for (let i = 0; i < 30; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti';
            piece.style.backgroundColor = colors[i % colors.length];
            piece.style.left = `${Math.random() * 100}%`;
            piece.style.animationDuration = `${Math.random() * 0.8 + 1.6}s`;
            piece.style.animationDelay = `${Math.random() * 0.2}s`;
            piece.style.transform = `translateY(-10vh) rotate(${Math.random() * 360}deg)`;
            confettiLayer.appendChild(piece);
            setTimeout(() => piece.remove(), 2400);
        }
    }

    for (let i = 0; i < 4; i++) {
        spawnLantern();
    }
    setInterval(spawnLantern, 1800);

    if (startBtn) {
        startBtn.addEventListener('click', burstConfetti);
    }

    // Splash -> corner animation then show UI
    if (brandSplash) {
        const jitter = () => {
            const top = Math.max(6, Math.random() * 70);
            const left = Math.max(4, Math.random() * 120);
            brandSplash.style.top = `${top}px`;
            brandSplash.style.left = `${left}px`;
        };

        brandSplash.addEventListener('animationend', () => {
            if (brandText) {
                brandText.style.opacity = '0';
                setTimeout(() => {
                    brandText.textContent = 'Special \nVersion';
                    brandText.style.opacity = '1';
                }, 200);
            }
            brandSplash.style.top = '6px';
            brandSplash.style.left = '-50px';
        }, { once: true });

        setTimeout(() => {
            brandSplash.classList.add('to-corner');
            revealNodes.forEach((node, idx) => {
                setTimeout(() => node.classList.add('show'), 350 + idx * 80);
            });
        }, 400);
    } else {
        revealNodes.forEach(node => node.classList.add('show'));
    }
})(); 
