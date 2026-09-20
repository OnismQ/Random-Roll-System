(() => {
    const root = document.documentElement;
    const sourceScript = document.currentScript;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const pointer = { x: null, y: null, max: 20000 };
    const pointCount = Number(sourceScript?.getAttribute("count")) || 99;
    const color = sourceScript?.getAttribute("color") || "0,0,0";
    const opacity = sourceScript?.getAttribute("opacity") || "0.5";
    const zIndex = sourceScript?.getAttribute("zIndex") || "-1";

    let width = 0;
    let height = 0;
    let points = [];
    let animationFrameId = null;

    canvas.id = `c_n${document.scripts.length}`;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = `position:fixed;top:0;left:0;z-index:${zIndex};opacity:${opacity}`;
    document.body.appendChild(canvas);

    function reduceMotionEnabled() {
        return root.dataset.reduceMotion === "true";
    }

    function resizeCanvas() {
        width = canvas.width = window.innerWidth || document.documentElement.clientWidth;
        height = canvas.height = window.innerHeight || document.documentElement.clientHeight;
    }

    function createPoints() {
        points = Array.from({ length: pointCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            xa: Math.random() * 2 - 1,
            ya: Math.random() * 2 - 1,
            max: 6000
        }));
    }

    function drawScene(advancePoints) {
        context.clearRect(0, 0, width, height);
        const interactivePoints = points.concat(pointer);

        points.forEach((point, pointIndex) => {
            if (advancePoints) {
                point.x += point.xa;
                point.y += point.ya;
                point.xa *= point.x > width || point.x < 0 ? -1 : 1;
                point.ya *= point.y > height || point.y < 0 ? -1 : 1;
            }
            context.fillRect(point.x - 0.5, point.y - 0.5, 1, 1);

            for (let index = pointIndex + 1; index < interactivePoints.length; index += 1) {
                const target = interactivePoints[index];
                if (target.x === null || target.y === null) {
                    continue;
                }

                const deltaX = point.x - target.x;
                const deltaY = point.y - target.y;
                const distance = deltaX * deltaX + deltaY * deltaY;
                if (distance >= target.max) {
                    continue;
                }

                if (advancePoints && target === pointer && distance >= target.max / 2) {
                    point.x -= 0.03 * deltaX;
                    point.y -= 0.03 * deltaY;
                }

                const strength = (target.max - distance) / target.max;
                context.beginPath();
                context.lineWidth = strength / 2;
                context.strokeStyle = `rgba(${color},${strength + 0.2})`;
                context.moveTo(point.x, point.y);
                context.lineTo(target.x, target.y);
                context.stroke();
            }
        });
    }

    function drawFrame() {
        if (reduceMotionEnabled()) {
            stopAnimation();
            return;
        }

        drawScene(true);
        animationFrameId = window.requestAnimationFrame(drawFrame);
    }

    function startAnimation() {
        if (reduceMotionEnabled()) {
            stopAnimation();
            return;
        }

        if (animationFrameId !== null) {
            return;
        }

        canvas.hidden = false;
        animationFrameId = window.requestAnimationFrame(drawFrame);
    }

    function stopAnimation() {
        if (animationFrameId !== null) {
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        context.clearRect(0, 0, width, height);
        canvas.hidden = true;
    }

    window.addEventListener("resize", () => {
        resizeCanvas();
        createPoints();
        if (reduceMotionEnabled()) {
            stopAnimation();
        }
    });
    window.addEventListener("mousemove", event => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
    });
    window.addEventListener("mouseout", () => {
        pointer.x = null;
        pointer.y = null;
    });
    window.addEventListener("lucky-dog:motion-change", event => {
        if (event.detail?.reduceMotion) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });

    resizeCanvas();
    createPoints();
    window.setTimeout(startAnimation, 100);
})();
