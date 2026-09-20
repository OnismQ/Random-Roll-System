window.onload = function () {
    const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');
    resizeCanvas();

    const colors = [
        '255,99,71', '135,206,250', '50,205,50', '255,215,0',
        '218,112,214', '255,140,0', '75,0,130', '255,20,147'
    ];
    const fireworks = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);

    function Particle(x, y, color) {
        const angle = Math.random() * Math.PI * 2; // Random angle
        const speed = Math.random() * 3 + 2; // Random speed
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 150;
        this.color = color;
        this.shape = Math.random() > 0.5 ? 'circle' : 'line'; // Random shape
    }

    function initFirework() {
        const x = Math.random() * canvas.width;
        const y = canvas.height;
        const v = Math.random() * 5 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const height = Math.random() * canvas.height / 2 + canvas.height / 4; // Random height
        const firework = { x, y, v, color, height, particles: [] };
        fireworks.push(firework);
    }

    function updateFireworks() {
        for (let i = fireworks.length - 1; i >= 0; i--) {
            const firework = fireworks[i];
            if (firework.y > firework.height) {
                firework.y -= firework.v;
                ctx.beginPath();
                ctx.arc(firework.x, firework.y, 3, 0, 2 * Math.PI);
                ctx.fillStyle = `rgb(${firework.color})`;
                ctx.fill();
            } else {
                if (firework.particles.length === 0) {
                    for (let j = 0; j < 200; j++) { // Increased particles
                        firework.particles.push(new Particle(firework.x, firework.y, firework.color));
                    }
                }
                for (let j = firework.particles.length - 1; j >= 0; j--) {
                    const particle = firework.particles[j];
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vy += 0.02; // Slight gravity
                    particle.life--;
                    const alpha = particle.life / 150;
                    ctx.fillStyle = `rgba(${particle.color},${alpha})`;

                    if (particle.shape === 'circle') {
                        ctx.beginPath();
                        ctx.arc(particle.x, particle.y, 2, 0, 2 * Math.PI);
                        ctx.fill();
                    } else if (particle.shape === 'line') {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(particle.x - particle.vx * 2, particle.y - particle.vy * 2);
                        ctx.strokeStyle = ctx.fillStyle;
                        ctx.stroke();
                    }

                    if (particle.life <= 0) {
                        firework.particles.splice(j, 1);
                    }
                }
                if (firework.particles.length === 0) {
                    fireworks.splice(i, 1);
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateFireworks();
        requestAnimationFrame(animate);
    }

    setInterval(initFirework, 300); // More frequent fireworks
    animate();
};