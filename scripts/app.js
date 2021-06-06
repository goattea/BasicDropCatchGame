const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let frame = 0;
let dropRate = 100;
let score = 0;
let dropItems = [];
let playerLeft = false;
let playerRight = false;

// event listeners for arrow keys
window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') playerRight = true;
    if (e.code === 'ArrowLeft') playerLeft = true;
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') playerRight = false;
    if (e.code === 'ArrowLeft') playerLeft = false;
});

class Player {
    constructor() {
        this.height = 20;
        this.width = 60;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - (this.height + 10);
        this.speed = 10;
    }

    draw() {
        ctx.fillStyle = "silver";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        if (playerRight) this.x += this.speed;
        if (playerLeft) this.x -= this.speed;

        if (this.x < 0) {
            this.x = 0;
        }

        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }

        this.draw();
    }
}

let player = new Player();


class Item {
    constructor() {
        this.width = Math.floor(Math.random() * 50) + 20;
        this.height = Math.floor(Math.random() * 50) + 20;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = 0 - this.height;
        this.speed = Math.floor(Math.random() * 5) + 3;
        this.isJunk = (Math.random() * 5) <= 2 ? true : false;
        this.color = this.isJunk ? "red" : "green";
        this.isOnScreen = true;
        this.isCaught = false;
        this.isScored = false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move() {
        this.y += this.speed;

        if (this.y >= canvas.height) {
            this.isOnScreen = false;
            return;
        }
    }
    
    checkForCollision() {
        // if I am not on screen or I am not low enough to be caught, then return
        if (!this.isOnScreen || this.y + this.height < player.y) return;

        // if my left side is passed the right side of the player, then I am not caught
        if(this.x > player.x + player.width) return;

        // if my right side is to the left of the player, then I am not caught
        if(this.x + this.width < player.x) return;

        // any other condition means I am caught
        this.isCaught = true;
    }

    update() {
        this.move();
        this.checkForCollision();
        this.draw();
    }


}

function handleDropItems() {
    if (frame % dropRate === 0) {
        dropItems.push(new Item());
    }

    if (!dropItems.length) return;

    dropItems.forEach(i => { i.update() });

    // score each caught item and then mark as scored
    let unscoredCaughtItems = dropItems.filter(i => i.isCaught && !i.isScored);
    if (unscoredCaughtItems.length) {
        score += unscoredCaughtItems.filter(i => !i.isJunk).length;
        score -= unscoredCaughtItems.filter(i => i.isJunk).length;
        unscoredCaughtItems.forEach(i => { i.isScored = true; });
    }

    // reset dropped items array to only include uncaught items on screen
    dropItems = dropItems.filter(i => i.isOnScreen && !i.isCaught);
}

const scoreGradient = ctx.createLinearGradient(0, 0, 0, 70);
scoreGradient.addColorStop('0.4', '#fff');
scoreGradient.addColorStop('0.5', '#000');
scoreGradient.addColorStop('0.55', '#4040ff');
scoreGradient.addColorStop('0.6', '#000');
scoreGradient.addColorStop('0.9', '#fff');

function handleScore() {
    ctx.fillStyle = scoreGradient;
    ctx.font = '90px Georgia';
    let scoreX = 50, scoreY = 70;
    ctx.strokeText(score, scoreX, scoreY);
    ctx.fillText(score, scoreX, scoreY);
}



function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    frame++;
    handleDropItems();
    handleScore();
    player.update();
    requestAnimationFrame(animate);
}

animate();