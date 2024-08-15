const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Arrays of words to create unique names
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
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.closePath();

        // Draw the name of the muncher with black text
        ctx.font = `${this.radius}px Arial`;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.x, this.y);
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        // Bounce off walls
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
    }

    shrink() {
        if (this.radius > 10) { // Only shrink if large enough
            this.radius /= 2; // Halve the radius
            return true;
        }
        return false;
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

let munchers = [];
let foodlets = [];
let obstacles = [];

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

function drawBarChart() {
    // Sort munchers by radius (size) in descending order
    const sortedMunchers = [...munchers].sort((a, b) => b.radius - a.radius);

    // Set the position and dimensions for the bar chart
    const chartWidth = 200;
    const chartHeight = 150;
    const chartX = canvas.width - chartWidth - 10;
    const chartY = 10;
    const barHeight = chartHeight / sortedMunchers.length;

    // Draw the background for the chart
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(chartX, chartY, chartWidth, chartHeight);

    // Draw each bar in the chart
    sortedMunchers.forEach((muncher, index) => {
        const barWidth = (muncher.radius / sortedMunchers[0].radius) * (chartWidth - 20);
        ctx.fillStyle = 'blue';
        ctx.fillRect(chartX + 10, chartY + index * barHeight, barWidth, barHeight - 5);

        // Draw the name of the muncher
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

        // Check for collision with foodlets
        foodlets.forEach((foodlet, j) => {
            if (muncher.isColliding(foodlet)) {
                muncher.grow(2);
                foodlets.splice(j, 1); // Remove eaten foodlet
            }
        });

        // Check for collision with obstacles
        obstacles.forEach((obstacle, j) => {
            if (muncher.isColliding(obstacle)) {
                muncher.shrink();
                obstacles.splice(j, 1); // Remove the obstacle after collision
            }
        });

        // Check for collision with other munchers
        munchers.forEach((otherMuncher, j) => {
            if (i !== j && muncher.isColliding(otherMuncher)) {
                if (muncher.radius > otherMuncher.radius) {
                    muncher.grow(otherMuncher.radius / 2); // Grow by half of the smaller muncher's radius
                    munchers.splice(j, 1); // Remove the eaten muncher
                }
            }
        });
    });

    foodlets.forEach(foodlet => foodlet.draw());
    obstacles.forEach(obstacle => obstacle.draw());

    // Spawn new foodlets periodically
    if (Math.random() < 0.01) {
        spawnFoodlet();
    }

    // Spawn new obstacles periodically, but less frequently than foodlets
    if (Math.random() < 0.002) {
        spawnObstacle();
    }

    // Spawn new munchers periodically
    if (Math.random() < 0.005) {
        spawnMuncher();
    }

    // Draw the bar chart
    drawBarChart();
}

animate();
