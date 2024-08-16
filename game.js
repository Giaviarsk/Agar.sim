const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Arrays of words to create unique names
const firstWords = ["Tiny", "Swift", "Bold", "Great", "Silent", "Giant", "Wild", "Forceful", "Mighty", "Sneaky", "Jolly", "Fierce", "Cool", "Witty"];
const secondWords = ["Hunter", "Eater", "Enlargener", "Taster", "Muncher", "Nibbler", "Chomper", "Crusher", "Gobbler", "Swallower", "Devourer", "Smasher"];

function getRandomName() {
    const firstName = firstWords[Math.floor(Math.random() * firstWords.length)];
    const secondName = secondWords[Math.floor(Math.random() * secondWords.length)];
    return `${firstName} ${secondName}`;
}

class Projectile {
    constructor(x, y, width, height, dx, dy, shooter) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dx = dx;
        this.dy = dy;
        this.shooter = shooter; // Add this line to store the shooter muncher
    }

    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'orange';
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        this.draw();
    }

    isColliding(circle) {
        const distX = Math.abs(circle.x - this.x - this.width / 2);
        const distY = Math.abs(circle.y - this.y - this.height / 2);

        if (distX > (this.width / 2 + circle.radius)) { return false; }
        if (distY > (this.height / 2 + circle.radius)) { return false; }

        if (distX <= (this.width / 2)) { return true; }
        if (distY <= (this.height / 2)) { return true; }

        const dx = distX - this.width / 2;
        const dy = distY - this.height / 2;
        return (dx * dx + dy * dy <= (circle.radius * circle.radius));
    }
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

        // Draw the name of the muncher with black text
        ctx.font = `${this.radius}px Arial`;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.x, this.y - this.radius - 10); // Position name above the muncher

        // Draw the age of the muncher with black text
        ctx.font = '12px Arial';
        ctx.fillText(`Age: ${Math.floor(this.age)}`, this.x, this.y + this.radius + 10); // Position age below the muncher
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        // Increment age over time
        this.age += 0.01;

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
        this.health += amount;

        // Check if muncher is too close to the wall after growing and adjust position
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
            this.radius -= 2;
            this.health -= 10;
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

            // Increase speed
            this.dx *= 2;
            this.dy *= 2;

            // Deactivate power-up after 5 seconds
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

    shoot() {
        const projectileWidth = 10;
        const projectileHeight = 5;
        const projectileSpeed = 5;
        const dx = this.dx / Math.abs(this.dx) * projectileSpeed || projectileSpeed; // Direction based on muncher's movement
        const dy = this.dy / Math.abs(this.dy) * projectileSpeed || projectileSpeed;
    
        const projectile = new Projectile(this.x, this.y, projectileWidth, projectileHeight, dx, dy, this);
        projectiles.push(projectile);
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

let projectiles = [];

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    munchers.forEach((muncher, i) => {
        muncher.update();

        // Shoot a projectile periodically
        if (Math.random() < 0.01) {
            muncher.shoot();
        }

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

        // Check for collision with power-ups
        powerUps.forEach((powerUp, j) => {
            if (muncher.isColliding(powerUp)) {
                muncher.activatePowerUp(powerUp);
                powerUps.splice(j, 1); // Remove the collected power-up
            }
        });
    });

    // Move and draw all projectiles
    // Move and draw all projectiles
// Move and draw all projectiles
projectiles.forEach((projectile, i) => {
    projectile.update();

    // Check for collision with munchers
    munchers.forEach((muncher, j) => {
        if (projectile.shooter !== muncher && projectile.isColliding(muncher)) { // Ensure the muncher is not the shooter
            if (muncher.shrink()) {
                projectiles.splice(i, 1); // Remove the projectile after collision
            }
        }
    });

    // Remove projectile if it goes off screen
    if (projectile.x + projectile.width < 0 || projectile.x - projectile.width > canvas.width ||
        projectile.y + projectile.height < 0 || projectile.y - projectile.height > canvas.height) {
        projectiles.splice(i, 1);
    }
});


    foodlets.forEach(foodlet => foodlet.draw());
    obstacles.forEach(obstacle => obstacle.draw());
    powerUps.forEach(powerUp => powerUp.draw());

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

    // Spawn new power-ups periodically
    if (Math.random() < 0.003) {
        spawnPowerUp();
    }

    // Draw the bar chart
    drawBarChart();
}

// User-controlled muncher initialization
const userMuncher = new Muncher(canvas.width / 2, canvas.height / 2, 20, 0, 0);
munchers.push(userMuncher); // Add the user-controlled muncher to the array

// Event listeners for user input
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp': // Up arrow key
        case 'w': // 'W' key
            userMuncher.dy = -2;
            break;
        case 'ArrowDown': // Down arrow key
        case 's': // 'S' key
            userMuncher.dy = 2;
            break;
        case 'ArrowLeft': // Left arrow key
        case 'a': // 'A' key
            userMuncher.dx = -2;
            break;
        case 'ArrowRight': // Right arrow key
        case 'd': // 'D' key
            userMuncher.dx = 2;
            break;
        case ' ': // Spacebar for shooting
            userMuncher.shoot();
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'w':
        case 's':
            userMuncher.dy = 0;
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'a':
        case 'd':
            userMuncher.dx = 0;
            break;
    }
});

animate();