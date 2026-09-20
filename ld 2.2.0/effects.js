const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');

// 设置画布大小
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 烟花粒子类
class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1; // 粒子大小
        this.speed = Math.random() * 2 + 1; // 粒子速度
        this.angle = Math.random() * Math.PI * 2; // 角度
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };
        this.alpha = 1;
        this.life = 0;
        this.maxLife = Math.random() * 20 + 50; // 最大生命周期
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`; // 随机颜色
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.02; // 粒子逐渐消失
        this.life++;

        // 如果粒子的生命周期结束
        if (this.life >= this.maxLife) {
            this.alpha = 0;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
    }
}

// 烟花爆炸类
class FireworkExplosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.numParticles = Math.random() * 50 + 50; // 每次爆炸的粒子数

        // 创建粒子
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push(new Firework(x, y));
        }
    }

    update() {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update();
            if (this.particles[i].alpha <= 0) {
                this.particles.splice(i, 1); // 移除消失的粒子
                i--;
            }
        }
    }

    draw() {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].draw();
        }
    }
}

// 创建烟花爆炸效果的函数
let fireworks = [];
function createFirework() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    fireworks.push(new FireworkExplosion(x, y));
}

// 动画循环
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除画布

    // 更新和绘制每一个烟花
    for (let i = 0; i < fireworks.length; i++) {
        fireworks[i].update();
        fireworks[i].draw();
    }

    // 每隔一段时间创建一个新的烟花
    if (Math.random() < 0.03) {
        createFirework();
    }

    // 循环动画
    requestAnimationFrame(animate);
}

// 启动动画
animate();

function createLight() {
    const light = document.createElement('div');
    light.classList.add('light');
    light.style.left = `${Math.random() * window.innerWidth}px`;
    light.style.top = `${Math.random() * window.innerHeight}px`;
    light.style.animationDuration = `${Math.random() * 2 + 1}s`; // 随机闪烁时间

    // 随机生成颜色，使用 HSL 颜色空间
    const hue = Math.floor(Math.random() * 360); // 色相 0 到 360
    const saturation = Math.floor(Math.random() * 50) + 50; // 饱和度 50% 到 100%
    const lightness = Math.floor(Math.random() * 50) + 25; // 亮度 25% 到 75%
    const randomColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    light.style.backgroundColor = randomColor; // 设置光点颜色

    document.body.appendChild(light);

    // 每隔一段时间移除已完成的光点
    setTimeout(() => light.remove(), 2000);
}

setInterval(createLight, 100); // 每100ms生成一个闪烁的光点
