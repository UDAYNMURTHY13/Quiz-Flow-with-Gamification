class QuizGame {
    constructor() {
        this.initializeProperties();
        this.initializeElements();
        this.addEventListeners();
        this.loadQuizData();
    }

    async loadQuizData() {
        try {
            const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://api.jsonserve.com/Uw5CrX'));
            if (!response.ok) {
                throw new Error('Failed to fetch quiz data');
            }
            const data = await response.json();
            
            // Parse the contents properly
            const parsedContents = JSON.parse(data.contents);
            this.quizData = parsedContents.questions || [];

            // Update UI with total number of questions
            this.elements.totalQuestions.textContent = this.quizData.length;
            this.buttons.start.disabled = false;
        } catch (error) {
            console.error('Error loading quiz data:', error);
        }
    }

    initializeProperties() {
        this.currentQuestion = 0;
        this.score = 0;
        this.streak = 0;
        this.lives = 3;
        this.timer = 30;
        this.timerInterval = null;
        this.answers = [];
        this.isAnswering = false;
    }

    initializeElements() {
        this.screens = {
            start: document.getElementById('startScreen'),
            quiz: document.getElementById('quizScreen'),
            results: document.getElementById('resultsScreen')
        };

        this.buttons = {
            start: document.getElementById('startBtn'),
            playAgain: document.getElementById('playAgainBtn')
        };

        this.elements = {
            lives: document.getElementById('lives'),
            streak: document.getElementById('streak'),
            timer: document.getElementById('timer'),
            score: document.getElementById('score'),
            question: document.getElementById('question'),
            currentQuestion: document.getElementById('currentQuestion'),
            totalQuestions: document.getElementById('totalQuestions'),
            options: document.getElementById('options'),
            progressBar: document.getElementById('progressBar'),
            finalScore: document.getElementById('finalScore'),
            finalStreak: document.getElementById('finalStreak'),
            answersReview: document.getElementById('answersReview')
        };
    }

    addEventListeners() {
        this.buttons.start.addEventListener('click', () => this.startQuiz());
        this.buttons.playAgain.addEventListener('click', () => this.startQuiz());
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.add('hidden'));
        this.screens[screenName].classList.remove('hidden');
    }

    startQuiz() {
        this.initializeProperties();
        this.updateDisplay();
        this.showScreen('quiz');
        this.loadQuestion();
        this.startTimer();
    }

    loadQuestion() {
        if (!this.quizData || this.currentQuestion >= this.quizData.length) return;

        const question = this.quizData[this.currentQuestion];
        this.elements.question.textContent = question.description;
        this.elements.currentQuestion.textContent = this.currentQuestion + 1;

        const progress = ((this.currentQuestion + 1) / this.quizData.length) * 100;
        this.elements.progressBar.style.width = `${progress}%`;

        this.elements.options.innerHTML = '';
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option.description;
            button.style.animation = 'fade-in 0.5s ease';
            button.addEventListener('click', () => this.checkAnswer(option.description, question.options.find(o => o.is_correct).description));
            this.elements.options.appendChild(button);
        });
    }

    checkAnswer(selectedOption, correctAnswer) {
        if (this.isAnswering) return;
        this.isAnswering = true;

        // Find the clicked button and the correct button
        const buttons = this.elements.options.querySelectorAll('.option');
        buttons.forEach(button => {
            if (button.textContent === selectedOption) {
                button.classList.add(selectedOption === correctAnswer ? 'correct' : 'wrong');
            } else if (button.textContent === correctAnswer) {
                button.classList.add('correct');
            }
        });

        // Save the answer
        this.answers.push({
            question: this.quizData[this.currentQuestion].description,
            selectedAnswer: selectedOption,
            correctAnswer: correctAnswer,
            isCorrect: selectedOption === correctAnswer
        });

        if (selectedOption === correctAnswer) {
            this.score += 10;
            this.streak++;
        } else {
            this.lives--;
            this.streak = 0;
        }

        this.updateDisplay();
        this.nextQuestion();
    }

    nextQuestion() {
        if (this.lives === 0 || this.currentQuestion === this.quizData.length - 1) {
            clearInterval(this.timerInterval);
            setTimeout(() => this.endQuiz(), 1000);
        } else {
            this.currentQuestion++;
            this.timer = 30; // Reset timer for next question
            setTimeout(() => {
                this.isAnswering = false;
                this.loadQuestion();
            }, 1000);
        }
    }

    endQuiz() {
        this.showScreen('results');
        this.elements.finalScore.textContent = this.score;
        this.elements.finalStreak.textContent = this.streak;
        this.displayAnswerReview();
    }

    displayAnswerReview() {
        const reviewContainer = this.elements.answersReview;
        reviewContainer.innerHTML = `
            <div class="review-table-container">
                <table class="review-table">
                    <thead>
                        <tr>
                            <th>Question</th>
                            <th>Your Answer</th>
                            <th>Correct Answer</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.answers.map(answer => `
                            <tr>
                                <td>${answer.question}</td>
                                <td>${answer.selectedAnswer}</td>
                                <td>${answer.correctAnswer}</td>
                                <td class="${answer.isCorrect ? 'correct-answer' : 'wrong-answer'}">
                                    ${answer.isCorrect ? 'Correct' : 'Incorrect'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer--;
            if (this.timer <= 0) {
                clearInterval(this.timerInterval);
                this.checkAnswer('', this.quizData[this.currentQuestion].options.find(o => o.is_correct).description);
            }
            this.updateDisplay();
        }, 1000);
    }

    updateDisplay() {
        this.elements.lives.textContent = this.lives;
        this.elements.streak.textContent = this.streak;
        this.elements.timer.textContent = this.timer;
        this.elements.score.textContent = this.score;
    }
}

// Initialize the quiz game
document.addEventListener('DOMContentLoaded', () => {
    const quizGame = new QuizGame();
});