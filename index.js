let apiUrl = "https://opentdb.com/api.php?amount=10&type=multiple";
const start = document.getElementById("startBtn");
const next = document.getElementById("nextBtn");
const end = document.getElementById("endBtn");
const title = document.getElementById("question");
const optionBtn = document.getElementById("btn");
let questionNumber = document.getElementById("value");
const showQuestionCounter = document.getElementById("qNumber");
const done = document.getElementById("endResult");
let correctAnswersCount = 0;
const rePop = document.querySelector(".restart");
const over = document.querySelector(".overlay");
const everything = document.querySelector(".container");
const clock = document.getElementById("timer");
const restart = document.getElementById("reQuiz");
const timeRem = document.getElementById("timerIndicater");
const timeMsg = document.getElementById("yTook");
const categoryNames = {
  9: "General Knowledge",
  10: "Entertainment: Books",
  11: "Entertainment: Film",
  12: "Entertainment: Music",
  13: "Entertainment: Musicals & Theatres",
  14: "Entertainment: Television",
  15: "Entertainment: Video Games",
  16: "Entertainment: Board Games",
  17: "Science & Nature",
  18: "Science: Computers",
  19: "Science: Mathematics",
  20: "Mythology",
  21: "Sports",
  22: "Geography",
  23: "History",
  24: "Politics",
  25: "Art",
  26: "Celebrities",
  27: "Animals",
  28: "Vehicles",
  29: "Entertainment: Comics",
  30: "Science: Gadgets",
  31: "Entertainment: Japanese Anime & Manga",
  32: "Entertainment: Cartoon & Animations",
};
let currentQuestionIndex = 0;
let questions = [];
let timerInterval;
let timeRemaining = 120;

function decode(str) {
  let txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}
let selectedCategory = ""; // Variable to store the selected category
let selectedDifficulty = ""; // Variable to store the selected difficulty

const categorySelect = document.getElementById("categorySelect");
categorySelect.addEventListener("change", function () {
  selectedCategory = categorySelect.value;
  apiUrl = `https://opentdb.com/api.php?amount=10&category=${selectedCategory}&type=multiple`;
});

const difficultySelect = document.getElementById("difficultySelect");
difficultySelect.addEventListener("change", function () {
  selectedDifficulty = difficultySelect.value; // Update the selected difficulty
  startQuiz(); // Call the startQuiz() function after updating the difficulty
});

function fetchQuizData() {
  return fetch(apiUrl + `&difficulty=${selectedDifficulty}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data.results); // Log the data to the console
      return data.results; // Return the results to the next .then() in the chain
    })
    .catch((error) => {
      console.error("Error fetching quiz data:", error);
      return [];
    });
}

function startQuiz() {
  start.addEventListener("click", async function () {
    if (questions.length === 0) {
      questions = await fetchQuizData();

      if (questions.length === 0) {
        alert("Error fetching quiz data. Please try again later.");
        return;
      }
    }

    displayQuestion();
    const currentQuestion = questions[currentQuestionIndex];
    const categoryName = categoryNames[currentQuestion.category];
    const decodedQuestion = new DOMParser().parseFromString(
      currentQuestion.question,
      "text/html"
    ).body.textContent;
    title.innerText = `${decodedQuestion} (Category: ${categoryName})`;
    end.style.display = "none";
    start.style.display = "none";
    next.style.display = "block";
    categorySelect.style.display = "none";
    difficultySelect.style.display = "none";
    showQuestionCounter.style.display = "block";

    startTimer();
  });
}

function restartQuiz() {
  if (timeRemaining === 0) {
    rePop.style.display = "block";
    over.style.display = "block";
    everything.style.display = "none";
    clock.style.display = "none";
  } else {
    rePop.style.display = "none";
    over.style.display = "none";
  }
}

function checkAnswer(clickedButton, correctAnswer) {
  const selectedOption = clickedButton.innerText;
  const allButtons = document.querySelectorAll(".btn");

  allButtons.forEach((button) => {
    const buttonOption = button.innerText;
    if (buttonOption === correctAnswer) {
      button.style.backgroundColor = "rgba(56, 255, 0, 0.21)";
      if (buttonOption === selectedOption) {
        correctAnswersCount++;
      }
    } else if (buttonOption === selectedOption) {
      button.style.backgroundColor = "rgba(255, 0, 0, 0.21)";
    } else {
      button.style.backgroundColor = "rgba(255, 0, 0, 0.21)";
    }

    button.disabled = true;
    button.removeEventListener("click", handleClick);
  });
}

let optionSelected = false;

function handleClick() {
  const clickedButton = event.target;
  const correctAnswer = questions[currentQuestionIndex].correct_answer;

  checkAnswer(clickedButton, correctAnswer);

  optionSelected = true;
  next.disabled = !optionSelected;
}

function displayQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  title.innerText = currentQuestion.question;

  questionNumber.innerText = currentQuestionIndex + 1;

  const btnDiv = document.getElementById("btn");
  btnDiv.innerHTML = "";

  const allOptions = shuffleArray([
    ...currentQuestion.incorrect_answers,
    currentQuestion.correct_answer,
  ]);
  allOptions.forEach((option) => {
    const button = document.createElement("button");
    button.classList.add("btn");
    button.innerText = option;
    btnDiv.appendChild(button);

    button.addEventListener("click", handleClick);
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function nextQuestion() {
  next.addEventListener("click", function () {
    if (optionSelected) {
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        displayQuestion();
        optionSelected = false;
        next.disabled = true;
        next.classList.add("not-allowed-cursor");
      } else {
        title.innerText = "Quiz End";
        done.innerText = `You got ${correctAnswersCount} out of ${questions.length} questions right.`;
        optionBtn.style.display = "none";
        next.style.display = "none";
        end.style.display = "block";
      }
    }
  });

  next.addEventListener("mouseover", function () {
    if (next.disabled) {
      next.classList.add("not-allowed-cursor");
    }
  });

  next.addEventListener("mouseout", function () {
    next.classList.remove("not-allowed-cursor");
  });
}

function startTimer() {
  const timerDisplay = document.getElementById("timer");

  function updateTimer() {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `Time Remaining: ${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      title.innerText = "Quiz Concluded";
      optionBtn.innerHTML = "";
      next.style.display = "none";
      timeRem.style.display = "block";
      end.style.display = "block";
      done.innerText = `You got ${correctAnswersCount} out of ${questions.length} questions right.`;

      timeMsg.innerText = `${timeRemaining}`;

      restartQuiz();
    } else if (currentQuestionIndex >= 15) {
      const hours = Math.floor(timeRemaining / 3600);
      const minutes = Math.floor((timeRemaining % 3600) / 60);
      const seconds = timeRemaining % 60;
      timeRem.textContent = `Time Remaining: ${hours
        .toString()
        .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
      clearInterval(timerInterval);
      title.innerText = "Time's Up!";
      optionBtn.innerHTML = "";
      next.style.display = "none";
      timeRem.style.display = "block";
      end.style.display = "block";
      done.innerText = `You got ${correctAnswersCount} out of ${questions.length} questions right.`;

      timeMsg.innerText = `${timeRemaining}`;
    }

    timeRemaining--;
  }

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

restart.addEventListener("click", function () {
  location.reload();
});

startQuiz();
nextQuestion();
