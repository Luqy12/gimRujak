document.addEventListener("DOMContentLoaded", () => {
    candyCrushGame();
});

function candyCrushGame() {
    // DOM Elements
    const grid = document.querySelector(".grid");
    const scoreDisplay = document.getElementById("score");
    const timerDisplay = document.getElementById("timer");
    const featureSelection = document.getElementById("featureSelection");
    const stagesSelection = document.getElementById("stagesSelection");
    const stagesGrid = document.getElementById("stagesGrid");
    const scoreModeButton = document.getElementById("scoreMode");
    const stagesModeButton = document.getElementById("stagesMode");
    const backToFeaturesButton = document.getElementById("backToFeatures");
    const changeModeButton = document.getElementById("changeMode");
    const bgm = document.getElementById("bgm");
    const matchSound = document.getElementById("matchSound");
    const levelUpSound = document.getElementById("levelUpSound");
    const excellentSound = document.getElementById("excellentSound");

    // Game State Variables
    const width = 8;
    const squares = [];
    let score = 0;
    let currentFeature = null;
    let timeLeft = 0;
    let gameInterval = null;
    let timerInterval = null;
    let currentLevel = 1;
    let targetScore = 0;
    let levels = [];
    let unlockedLevels = parseInt(localStorage.getItem("unlockedLevels")) || 1; // Track unlocked levels
    // Initialize levels
    for (let i = 1; i <= 100; i++) {
        levels.push({
            level: i,
            targetScore: 500 + (i - 1) * 100, // Starting at 500, increasing by 100 each level
            timeLimit: 120 + (i - 1) * 10 // Starting at 120 seconds, increasing by 10 each level
        });
    }

    const candyColors = [
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/red-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/blue-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/green-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/yellow-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/orange-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/purple-candy.png)",
    ];

    // Create the Game Board
    function createBoard() {
        grid.innerHTML = ""; // Clear existing grid
        squares.length = 0;  // Clear squares array
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement("div");
            square.setAttribute("draggable", true);
            square.setAttribute("id", i);
            let randomColor = Math.floor(Math.random() * candyColors.length);
            square.style.backgroundImage = candyColors[randomColor];
            grid.appendChild(square);
            squares.push(square);
        }
        // Add drag event listeners
        squares.forEach(square => square.addEventListener("dragstart", dragStart));
        squares.forEach(square => square.addEventListener("dragend", dragEnd));
        squares.forEach(square => square.addEventListener("dragover", dragOver));
        squares.forEach(square => square.addEventListener("dragenter", dragEnter));
        squares.forEach(square => square.addEventListener("dragleave", dragLeave));
        squares.forEach(square => square.addEventListener("drop", dragDrop));
    }

    // Drag and Drop Functions
    let colorBeingDragged, colorBeingReplaced, squareIdBeingDragged, squareIdBeingReplaced;

    function dragStart() {
        colorBeingDragged = this.style.backgroundImage;
        squareIdBeingDragged = parseInt(this.id);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function dragEnter(e) {
        e.preventDefault();
    }

    function dragLeave() {
        // No action needed
    }

    function dragDrop() {
        colorBeingReplaced = this.style.backgroundImage;
        squareIdBeingReplaced = parseInt(this.id);
        this.style.backgroundImage = colorBeingDragged;
        squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced;
    }

    function dragEnd() {
        // Define valid moves (adjacent squares: left, up, right, down)
        let validMoves = [
            squareIdBeingDragged - 1,
            squareIdBeingDragged - width,
            squareIdBeingDragged + 1,
            squareIdBeingDragged + width
        ];
        let validMove = validMoves.includes(squareIdBeingReplaced);

        if (squareIdBeingReplaced && validMove) {
            squareIdBeingReplaced = null; // Move is valid, keep the swap
        } else if (squareIdBeingReplaced && !validMove) {
            // Invalid move, revert the swap
            squares[squareIdBeingReplaced].style.backgroundImage = colorBeingReplaced;
            squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        } else {
            // No drop occurred, revert to original
            squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        }
    }

    // Move Candies Down
    function moveIntoSquareBelow() {
        // Fill empty squares in the first row
        for (let i = 0; i < width; i++) {
            if (squares[i].style.backgroundImage === "") {
                let randomColor = Math.floor(Math.random() * candyColors.length);
                squares[i].style.backgroundImage = candyColors[randomColor];
            }
        }
        // Move candies down to fill gaps
        for (let i = 0; i < width * (width - 1); i++) {
            if (squares[i + width].style.backgroundImage === "") {
                squares[i + width].style.backgroundImage = squares[i].style.backgroundImage;
                squares[i].style.backgroundImage = "";
            }
        }
    }

    // Check for Matches
    function checkRowForFour() {
        for (let i = 0; i < 60; i++) {
            if (i % width >= width - 3) continue; // Skip if not enough columns left
            let rowOfFour = [i, i + 1, i + 2, i + 3];
            let decidedColor = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === "";
            if (rowOfFour.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 4;
                scoreDisplay.innerHTML = score;
                matchSound.play(); // Play match sound
                rowOfFour.forEach(index => squares[index].style.backgroundImage = "");
            }
        }
    }

    function checkColumnForFour() {
        for (let i = 0; i < 40; i++) {
            let columnOfFour = [i, i + width, i + 2 * width, i + 3 * width];
            let decidedColor = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === "";
            if (columnOfFour.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 4;
                scoreDisplay.innerHTML = score;
                matchSound.play(); // Play match sound
                columnOfFour.forEach(index => squares[index].style.backgroundImage = "");
            }
        }
    }

    function checkRowForThree() {
        for (let i = 0; i < 62; i++) {
            if (i % width >= width - 2) continue; // Skip if not enough columns left
            let rowOfThree = [i, i + 1, i + 2];
            let decidedColor = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === "";
            if (rowOfThree.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 3;
                scoreDisplay.innerHTML = score;
                matchSound.play(); // Play match sound
                rowOfThree.forEach(index => squares[index].style.backgroundImage = "");
            }
        }
    }

    function checkColumnForThree() {
        for (let i = 0; i < 48; i++) {
            let columnOfThree = [i, i + width, i + 2 * width];
            let decidedColor = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === "";
            if (columnOfThree.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 3;
                scoreDisplay.innerHTML = score;
                matchSound.play(); // Play match sound
                columnOfThree.forEach(index => squares[index].style.backgroundImage = "");
            }
        }
    }

    // Game Loop
    function gameLoop() {
        checkRowForFour();
        checkColumnForFour();
        checkRowForThree();
        checkColumnForThree();
        moveIntoSquareBelow();
        if (currentFeature === "stages" && score >= targetScore) {
            clearInterval(gameInterval);
            clearInterval(timerInterval);
            excellentSound.play(); // Play excellent sound
            setTimeout(() => {
                alert(`Congratulations! Level ${currentLevel} completed!`);
                levelUpSound.play(); // Play level up sound
                if (currentLevel === unlockedLevels) {
                    unlockedLevels++;
                    localStorage.setItem("unlockedLevels", unlockedLevels);
                }
                localStorage.setItem("currentLevel", currentLevel + 1);
                if (currentLevel >= 100) {
                    alert("You have completed all levels!");
                    changeMode();
                } else {
                    showStagesSelection();
                }
            }, 500); // Delay to let sound play
        }
    }

    // Start the Game
    function startGame(feature, level = null) {
        currentFeature = feature;
        featureSelection.style.display = "none";
        stagesSelection.style.display = "none";
        grid.style.display = "flex";
        scoreDisplay.parentElement.style.display = "flex"; // Show scoreboard
        createBoard();
        score = 0;
        scoreDisplay.innerHTML = score;
        bgm.play(); // Play background music
        gameInterval = setInterval(gameLoop, 100);

        if (feature === "score") {
            timerDisplay.innerHTML = "Endless - Get High Score!";
        } else if (feature === "stages") {
            currentLevel = level || parseInt(localStorage.getItem("currentLevel")) || 1;
            targetScore = levels[currentLevel - 1].targetScore;
            timeLeft = levels[currentLevel - 1].timeLimit;
            updateTimerDisplay();
            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    alert(`Time's Up! Level ${currentLevel} failed. Restarting level.`);
                    startGame("stages", currentLevel); // Restart level
                }
            }, 1000);
        }
    }

    // Update Timer Display
    function updateTimerDisplay() {
        if (currentFeature === "stages") {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timerDisplay.innerHTML = `Level ${currentLevel} - Target: ${targetScore}<br>Time Left: ${minutes}:${seconds.toString().padStart(2, "0")}`;
        } else {
            timerDisplay.innerHTML = "Endless - Get High Score!";
        }
    }

    // End Game (Timed Mode)
    function endGame() {
        clearInterval(gameInterval);
        squares.forEach(square => square.setAttribute("draggable", false));
        alert(`Time's Up! Your score is ${score}`);
    }

    // Change Mode
    function changeMode() {
        clearInterval(gameInterval);
        if (currentFeature === "stages") {
            clearInterval(timerInterval);
        }
        bgm.pause(); // Pause background music
        bgm.currentTime = 0; // Reset to start
        grid.style.display = "none";
        scoreDisplay.parentElement.style.display = "none";
        featureSelection.style.display = "flex"; // Show feature selection screen
    }

    // Show Stages Selection
    function showStagesSelection() {
        featureSelection.style.display = "none";
        stagesSelection.style.display = "flex";
        stagesGrid.innerHTML = "";
        for (let i = 1; i <= 100; i++) {
            const stageButton = document.createElement("button");
            stageButton.textContent = i;
            stageButton.classList.add("stage-button");
            if (i > unlockedLevels) {
                stageButton.disabled = true;
                stageButton.classList.add("locked");
                stageButton.innerHTML = `<span>${i}</span><br><small>Locked</small>`;
            } else {
                stageButton.addEventListener("click", () => startGame("stages", i));
                stageButton.innerHTML = `<span>Play</span><br><small>Level ${i}</small>`;
            }
            stagesGrid.appendChild(stageButton);
        }
        // Auto-scroll to the last unlocked level
        const unlockedButtons = stagesGrid.querySelectorAll('.stage-button:not(.locked)');
        if (unlockedButtons.length > 0) {
            const lastUnlocked = unlockedButtons[unlockedButtons.length - 1];
            lastUnlocked.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Event Listeners
    scoreModeButton.addEventListener("click", () => startGame("score"));
    stagesModeButton.addEventListener("click", showStagesSelection);
    backToFeaturesButton.addEventListener("click", () => {
        stagesSelection.style.display = "none";
        featureSelection.style.display = "flex";
    });
    changeModeButton.addEventListener("click", changeMode);
}
