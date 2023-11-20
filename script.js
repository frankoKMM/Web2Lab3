var myGamePiece;
var asteroids = [];
let bestTime = localStorage.getItem("bestTime") ? localStorage.getItem("bestTime") : 0;

// funkcija za generiranje slucajnog broja iz intervala
function getRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// funkcija za generiranje asteroida, num je broj asteroida koji se generira
function generateAsteroid(canvas, num) {
	if (asteroids.length >= 18) {
		clearInterval(myGameArea.generateNewAsteroidsInterval);
		return;
	}
	
	for (let i =  0; i < num; i++) {
		// slucajno se generiraju vrijednosti za velicinu, poziciju i boju asteroida
		var size = getRandomValue(40, 100);
		
		do {
			var pos_x = getRandomValue(-150, canvas.width + 150);
			var pos_y = getRandomValue(-150, canvas.height + 150);
		} while (pos_x + size > 0 && pos_x - size < canvas.width && pos_y + size > 0 && pos_y - size < canvas.height);
		
		
		var greyShade = getRandomValue(30, 225);
		var color = "rgb(" + greyShade + "," + greyShade + "," + greyShade + ")"
		
		var asteroid = new component(size, size, color, pos_x, pos_y, "asteroid");
		
		asteroids.push(asteroid);
	}
	
	console.log(asteroids);
}

// funkcija koja provjerava jeli doslo do sudara
function checkCollision() {
	for (let i = 0; i < asteroids.length; i++) {
		if (myGamePiece.x < asteroids[i].x + asteroids[i].width &&
			myGamePiece.x + myGamePiece.width > asteroids[i].x &&
			myGamePiece.y < asteroids[i].y + asteroids[i].height &&
			myGamePiece.y + myGamePiece.height > asteroids[i].y
		) {
			myGameArea.stop();
			return true;
		}
    }
	return false;
}

// funkcija za formatiranje vremena, vrijeme "time" je u milisekundama
function formatTime(time) {
	let min = Math.floor(time / (60 * 1000));
    let s = Math.floor((time % (60 * 1000)) / 1000);
    let ms = time % 1000;
	
	// dodavaje nule/nula ako je potrebno
	min = (min < 10) ? "0" + min : min;
	s = (s < 10) ? "0" + s : s;
	ms = ("00" + ms).slice(-3);
	
	let formattedTime = min + ":" + s + ":" + ms;
	
	return formattedTime;
}

// funkcija koja ispisuje trenutno vrijeme(time) i najbolje vrijeme (bestTime) na ekran
function drawTime(time, bestTime) {
	let formattedTime = formatTime(time);
	let formattedBestTime = formatTime(bestTime);
	
	myGameArea.context.fillStyle = "white";
	myGameArea.context.font = "30px Arial";
	myGameArea.context.textAlign = "right";
	
	myGameArea.context.fillText("Najbolje vrijeme: " + formattedBestTime, myGameArea.canvas.width - 15, 30);
	myGameArea.context.fillText("Vrijeme: " + formattedTime, myGameArea.canvas.width - 15, 70);
}

function startGame() {
    myGamePiece = new component(50, 50, "red", (window.innerWidth - 10) / 2, (window.innerHeight - 10) / 2, "spaceship");
    myGameArea.start();
}

var myGameArea = {
    canvas: document.createElement("canvas"),
	
	// funkcija koja pokrece igru
    start: function () {
        this.canvas.id = "myGameCanvas";
        this.canvas.width = window.innerWidth - 10;
        this.canvas.height = window.innerHeight - 10;
        this.context = this.canvas.getContext("2d");
		generateAsteroid(this.canvas, 7)
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);			// definirano trajanje frame-a igre, svaki frame igra se azurira
		this.generateNewAsteroidsInterval = setInterval(function () {
            generateAsteroid(myGameArea.canvas, 1);
        }, 4000);
		this.startTime = Date.now();
    },
	
	// funkcija koja se poziva pri kraju igre
    stop: function () {
        clearInterval(this.interval);
		clearInterval(this.generateNewAsteroidsInterval);
		
		this.context.fillStyle = "white";
		this.context.font = "50px Georgia";
		this.context.textAlign = "center";
		this.context.fillText("Game over!", this.canvas.width / 2, this.canvas.height / 2);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

function component(width, height, color, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.speed_x = this.type === "spaceship" ? 0 : 2;
    this.speed_y = this.type === "spaceship" ? 0 : 2;
    this.x = x;
    this.y = y;
	
	// funkcija koja azurira svemirski brod i asteroide
    this.update = function () {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = color;
		ctx.shadowBlur = 10;
		ctx.shadowColor = "white";
        ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();
    };

	// funkcija koja pomice svemirski brod kada se pritisne gumb
    this.newPosShip = function (event) {
        if (event.key === "ArrowLeft" && (this.x - this.width / 2 > 0))
			this.speed_x = -5;
		else if (event.key === "ArrowRight" && (this.x + this.width / 2 < myGameArea.context.canvas.width))
            this.speed_x = 5;
		else if (event.key === "ArrowUp" && (this.y - this.height / 2 > 0))
            this.speed_y = -5;
		else if (event.key === "ArrowDown" && (this.y + this.height / 2 < myGameArea.context.canvas.height))
            this.speed_y = 5;
    };
	
	// funkcija koja resetira brzinu kada se pusti gumb
	this.resetSpeed = function (event) {
		if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && this.speed_x !== 0)
			this.speed_x = 0;
		else if ((event.key === "ArrowUp" || event.key === "ArrowDown") && this.speed_y !== 0)
			this.speed_y = 0;
	};
	
	// funkcija koja pomice asteroide
	this.newPosAst = function () {
		var newSpeed = getRandomValue(2, 6);
		
		if (this.x + this.width < 0)
            this.speed_x = newSpeed;
        else if ((this.x - this.width) >= myGameArea.context.canvas.width)
            this.speed_x = -newSpeed;

        if (this.y + this.height < 0)
            this.speed_y = newSpeed;
        else if ((this.y - this.height) >= myGameArea.context.canvas.height)
            this.speed_y = -newSpeed;
		
		this.x += this.speed_x;
		this.y += this.speed_y;
	};
}

// funkcija koja azurira igru, poziva se pri svakom frame-u
function updateGameArea() {
    myGameArea.clear();
	
	// azuriranje svemirskog broda
	myGamePiece.x += myGamePiece.speed_x;
    myGamePiece.y += myGamePiece.speed_y;
    myGamePiece.update();
	
	// azuriranje asteroida
	for (let i = 0; i < asteroids.length; i++) {
		asteroids[i].newPosAst();
		asteroids[i].update();
	}
	
	// azuriranje vremena
	let currentTime = Date.now();
	let time = currentTime - myGameArea.startTime;
	drawTime(time, bestTime);
	
	// provjera jeli doslo do sudara, ako je usporedba vremena i spremanje najboljeg vremena ako je pootrebno
	let ret = checkCollision();
	if (ret) {
		if (time > bestTime) {
			bestTime = time;
			localStorage.setItem('bestTime', bestTime);
		}
	}
}

document.addEventListener("keydown", function (event) {
	myGamePiece.newPosShip(event);
	//console.log(event.key);
});

document.addEventListener("keyup", function (event) {
	myGamePiece.resetSpeed(event);
	//console.log(event.key);
});
