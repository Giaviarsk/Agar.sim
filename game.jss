const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const firstWords = ["Tiny", "Swift", "Bold", "Great", "Silent", "Giant", "Wild", "Forceful", "Mighty", "Sneaky", "Jolly", "Fierce", "Witty"];
const secondWords = ["Hunter", "Eater", "Enlargener", "Taster", "Muncher", "Nibbler", "Chomper", "Crusher", "Gobbler", "Swallower", "Devourer", "Smasher"];

function getRandomName() {
    const firstName = firstWords[Math.floor(Math.random() * firstWords.length)];
    const secondName = secondWords[Math.floor(Math.random() * secondWords.length)];
    return `${firstName} ${secondName}`;
}

class Muncher {
    constructor(x, y, radius, dx, dy) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.name = getRandomName();
        this.health = 100;
        this.isInvincible = false;
        this.speedBoostActive = false;
        this.age = 0; // Initialize age to 0
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.health > 50 ? (this.isInvincible ? 'lightblue' : 'blue') : 'red';
        ctx.fill();
        ctx.closePath();
        ctx.font = `${this.radius}px Arial`;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.x, this.y - this.radius - 10); // Position name above the muncher

        ctx.font = '12px Arial';
        ctx.fillText(`Age: ${Math.floor(this.age)}`, this.x, this.y + this.radius + 10); // Position age below the muncher
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.age += 0.01;

        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        this.draw();
    }

    grow(amount) {
        this.radius += amount;
        this.health += amount;

        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
        }
        if (this.x - this.radius < 0) {
            this.x = this.radius;
        }
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
        }
    }

    shrink() {
        if (this.radius > 10) {
            this.radius /= 2;
            this.health -= 20;
            return true;
        }
        return false;
    }

    loseHealth(amount) {
        if (!this.isInvincible) { // Only lose health if not invincible
            this.health -= amount;
            if (this.health <= 0) {
                // Handle muncher death (e.g., remove from the array)
            }
        }
    }

    activatePowerUp(powerUp) {
        if (powerUp.type === "invincibility") {
            this.isInvincible = true;
            this.speedBoostActive = true;
            this.dx *= 2;
            this.dy *= 2;
            setTimeout(() => {
                this.isInvincible = false;
                this.speedBoostActive = false;
                this.dx /= 2;
                this.dy /= 2;
            }, 5000);
        }
    }

    isColliding(circle) {
        const distance = Math.hypot(this.x - circle.x, this.y - circle.y);
        return distance - this.radius - circle.radius < 1;
    }
}

class Foodlet {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    }
}

class Obstacle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();
    }
}

class PowerUp {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.type = "invincibility"; // For now, we have only one type of power-up
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'pink';
        ctx.fill();
        ctx.closePath();
    }
}

let munchers = [];
let foodlets = [];
let obstacles = [];
let powerUps = [];

function spawnMuncher() {
    const radius = 10;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    const dx = (Math.random() - 0.5) * 4;
    const dy = (Math.random() - 0.5) * 4;
    munchers.push(new Muncher(x, y, radius, dx, dy));
}

function spawnFoodlet() {
    const radius = 5;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    foodlets.push(new Foodlet(x, y, radius));
}

function spawnObstacle() {
    const radius = 8;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    obstacles.push(new Obstacle(x, y, radius));
}

function spawnPowerUp() {
    const radius = 8;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    powerUps.push(new PowerUp(x, y, radius));
}

function drawBarChart() {
    const sortedMunchers = [...munchers].sort((a, b) => b.radius - a.radius);
    const chartWidth = 200;
    const chartHeight = 150;
    const chartX = canvas.width - chartWidth - 10;
    const chartY = 10;
    const barHeight = chartHeight / sortedMunchers.length;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(chartX, chartY, chartWidth, chartHeight);

    sortedMunchers.forEach((muncher, index) => {
        const barWidth = (muncher.radius / sortedMunchers[0].radius) * (chartWidth - 20);
        ctx.fillStyle = 'blue';
        ctx.fillRect(chartX + 10, chartY + index * barHeight, barWidth, barHeight - 5);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(muncher.name, chartX + 15, chartY + index * barHeight + barHeight / 2);
    });
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    munchers.forEach((muncher, i) => {
        muncher.update();

        foodlets.forEach((foodlet, j) => {
            if (muncher.isColliding(foodlet)) {
                muncher.grow(2);
                foodlets.splice(j, 1); // Remove eaten foodlet
            }
        });

        obstacles.forEach((obstacle, j) => {
            if (muncher.isColliding(obstacle)) {
                muncher.shrink();
                obstacles.splice(j, 1); // Remove the obstacle after collision
            }
        });

        munchers.forEach((otherMuncher, j) => {
            if (i !== j && muncher.isColliding(otherMuncher)) {
                if (muncher.radius > otherMuncher.radius) {
                    muncher.grow(otherMuncher.radius / 2); // Grow by half of the smaller muncher's radius
                    munchers.splice(j, 1); // Remove the eaten muncher
                }
            }
        });

        powerUps.forEach((powerUp, j) => {
            if (muncher.isColliding(powerUp)) {
                muncher.activatePowerUp(powerUp);
                powerUps.splice(j, 1); // Remove the collected power-up
            }
        });
    });

    foodlets.forEach(foodlet => foodlet.draw());
    obstacles.forEach(obstacle => obstacle.draw());
    powerUps.forEach(powerUp => powerUp.draw());

    if (Math.random() < 0.01) {
        spawnFoodlet();
    }

    if (Math.random() < 0.002) {
        spawnObstacle();
    }

    if (Math.random() < 0.005) {
        spawnMuncher();
    }

    if (Math.random() < 0.003) {
        spawnPowerUp();
    }
    drawBarChart();
}

animate();
