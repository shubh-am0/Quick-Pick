let socket;
let username = "";
let selectedLevel = null;

// DOM elements
const startBtn = document.getElementById("startBtn");
const levelSelection = document.getElementById("levelSelection");
const level1Btn = document.getElementById("level1Btn");
const level2Btn = document.getElementById("level2Btn");
const homeBtn = document.getElementById("homeBtn");  // Back button

// Start button logic
startBtn.addEventListener("click", () => {
  const input = document.getElementById("usernameInput");
  if (input.value.trim() === "") {
    alert("Please enter a username.");
    return;
  }
  username = input.value.trim();
  document.getElementById("startScreen").style.display = "none";
  levelSelection.style.display = "block";
  document.getElementById("footer").style.display = "none";
});

// Level buttons logic
level1Btn.addEventListener("click", () => {
  selectedLevel = 5;
  levelSelection.style.display = "none";
  document.getElementById("mainGame").style.display = "block";
  startGame(username, selectedLevel);
});

level2Btn.addEventListener("click", () => {
  selectedLevel = 10;
  levelSelection.style.display = "none";
  document.getElementById("mainGame").style.display = "block";
  startGame(username, selectedLevel);
});

// Back button logic
homeBtn.addEventListener('click', function () {
  socket.emit("exit_game", username); // Inform the server that the user left the game
  
  // Create the confirmation message popup
  const confirmationPopup = document.createElement("div");
  confirmationPopup.id = "confirmationPopup";
  confirmationPopup.style.position = "fixed";
  confirmationPopup.style.top = "0";
  confirmationPopup.style.left = "0";
  confirmationPopup.style.width = "100%";
  confirmationPopup.style.height = "100%";
  confirmationPopup.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  confirmationPopup.style.display = "flex";
  confirmationPopup.style.alignItems = "center";
  confirmationPopup.style.justifyContent = "center";
  
  const popupContent = document.createElement("div");
  popupContent.style.backgroundColor = "white";
  popupContent.style.padding = "20px";
  popupContent.style.borderRadius = "8px";
  popupContent.style.textAlign = "center";
  popupContent.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
  
  const message = document.createElement("p");
  message.innerText = "Your challenger will become a winner by doing this";
  message.style.fontSize = "18px";
  popupContent.appendChild(message);
  
  const buttonsDiv = document.createElement("div");
  buttonsDiv.style.marginTop = "20px";
  
  const okButton = document.createElement("button");
  okButton.innerText = "OK";
  okButton.style.padding = "10px 20px";
  okButton.style.marginRight = "20px";
  okButton.style.backgroundColor = "#28a745";
  okButton.style.color = "white";
  okButton.style.border = "none";
  okButton.style.cursor = "pointer";
  okButton.addEventListener("click", () => {
    // Go to level selection if OK is clicked
    document.getElementById("mainGame").style.display = "none";
    document.getElementById("levelSelection").style.display = "block";
    document.getElementById("footer").style.display = "block";  // Optionally show the footer
    document.body.removeChild(confirmationPopup); // Close the popup
  });
  
  const goBackButton = document.createElement("button");
  goBackButton.innerText = "Go Back";
  goBackButton.style.padding = "10px 20px";
  goBackButton.style.backgroundColor = "#dc3545";
  goBackButton.style.color = "white";
  goBackButton.style.border = "none";
  goBackButton.style.cursor = "pointer";
  goBackButton.addEventListener("click", () => {
    // Close the popup and stay in the game
    document.body.removeChild(confirmationPopup);
  });
  
  buttonsDiv.appendChild(okButton);
  buttonsDiv.appendChild(goBackButton);
  
  popupContent.appendChild(buttonsDiv);
  confirmationPopup.appendChild(popupContent);
  document.body.appendChild(confirmationPopup);
});

function startGame(username, totalQuestions) {
  let myScore = 0;
  let oppScore = 0;
  let questionsPlayed = 0;
  let timerInterval = null;

  const nameBox = document.querySelector(".name");
  const oppNameBox = document.querySelector(".oname");
  const myScoreBox = document.querySelector(".score");
  const oppScoreBox = document.querySelector(".oscore");
  const clueBox = document.querySelector(".fruit");
  const timerDisplay = document.getElementById("timer");
  const box = document.querySelector(".mainbox");

  nameBox.innerText = `Your Side:- ${username}`;
  oppNameBox.innerText = `Challenger :- fetching`;
  myScoreBox.innerText = `My Score:  0`;
  oppScoreBox.innerText = `Score:  0`;

  const optionButtons = [
    document.getElementById("a"),
    document.getElementById("b"),
    document.getElementById("c"),
    document.getElementById("d")
  ];

  socket = io("http://192.168.1.36:8080");
  socket.emit("level", totalQuestions); // send level info first
  socket.emit("add", username);
  
  socket.on("welcome", () => {
    console.log("Connected to server");
  });

  socket.on("wait", () => {
    clueBox.innerText = "Waiting for Opponent";
    timerDisplay.innerText = "";
  });

  socket.on("match_found", (opponentName) => {
    oppNameBox.innerText = `Challenger :- ${opponentName}`;
    clueBox.innerText = "";
    timerDisplay.innerText = "";
  });

  socket.on("quiz", (data) => {
    if (questionsPlayed >= totalQuestions) return;

    questionsPlayed++;
    const clue = data.clue;
    const options = data.options;
    const correctAnswer = options[0];
    const shuffled = [...options].sort(() => Math.random() - 0.5);

    // Update UI with clue
    clueBox.innerHTML = `<p class="clue">${clue}</p>`;

    // Display options
    optionButtons.forEach((btn, idx) => {
      btn.innerText = shuffled[idx];
      btn.disabled = false;
      btn.style.backgroundColor = "white";
    });

    // Start countdown
    let timeLeft = 10;
    timerDisplay.innerText = `Time Left: ${timeLeft}s`;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      timerDisplay.innerText = `Time Left: ${timeLeft}s`;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerDisplay.innerText = "Time's up!";
        optionButtons.forEach(btn => btn.disabled = true);
      }
    }, 1000);

    // Handle answer selection
    optionButtons.forEach(button => {
      button.onclick = () => {
        clearInterval(timerInterval);
        optionButtons.forEach(btn => btn.disabled = true);

        if (button.innerText === correctAnswer) {
          button.style.backgroundColor = "green";
          myScore++;
          myScoreBox.innerText = `My Score:  ${myScore}`;
          socket.emit("score", myScore);
        } else {
          button.style.backgroundColor = "red";
          optionButtons.forEach(btn => {
            if (btn.innerText === correctAnswer) {
              btn.style.backgroundColor = "green";
            }
          });
        }
      };
    });
  });

  socket.on("oscore", (data) => {
    oppScore = data;
    oppScoreBox.innerText = `Score: ${oppScore}`;
  });

  socket.on("result", () => {
    clearInterval(timerInterval);
    timerDisplay.innerText = "";
  
    const resultScreen = document.getElementById("resultScreen");
    const resultTitle = document.getElementById("resultTitle");
    const resultMessage = document.getElementById("resultMessage");
    const finalScore = document.getElementById("finalScore");
    const opponentScore = document.getElementById("opponentScore");
    const playAgainBtn = document.getElementById("playAgainBtn");
    const exitBtn = document.getElementById("exitBtn");
  
    // Show the result screen
    resultScreen.style.display = "flex";
  
    // Update the result title and message
    if (myScore > oppScore) {
      resultTitle.innerText = "Congratulations!";
      resultMessage.innerText = "You won the game!";
      resultMessage.style.color = "green";
    } else if (myScore < oppScore) {
      resultTitle.innerText = "Sorry, You Lost!";
      resultMessage.innerText = "Better luck next time!";
      resultMessage.style.color = "red";
    } else {
      resultTitle.innerText = "It's a Draw!";
      resultMessage.innerText = "What a close match!";
      resultMessage.style.color = "yellow";
    }
  
    // Show the final scores
    finalScore.innerText = `Your Score: ${myScore}`;
    opponentScore.innerText = `Opponent's Score: ${oppScore}`;
  
    // Button functionality
    playAgainBtn.addEventListener("click", () => {
      window.location.reload();  // Reload the game
    });
  
    exitBtn.addEventListener("click", () => {
      window.location.href = "/";  // Redirect to home page
    });
  });
  

  // Listen for the opponent leaving the game
  socket.on("challenger_left", () => {
    clueBox.innerHTML = "<h1>Your Challenger Ran Away, You Won</h1>";
    optionButtons.forEach(btn => btn.disabled = true);
  });
}
