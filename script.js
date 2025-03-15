document.addEventListener('DOMContentLoaded', () => {
    let score = 0;
    let streak = 0; // kept for score calculation (not displayed)
    let currentMilestoneIndex = 0;
    let correctCount = 0;   // count of correct answers
    let wrongCount = 0;     // count of wrong answers
    let helpPressCount = 0; // count of help icon presses
    let isChallengeMode = false; // flag for mode
    const milestones = [100, 500, 1000, 2000];
    const maxScore = milestones[milestones.length - 1];
    let correctAnswer;
    let timer;
    let timeLeft = 60;
    let currentNum1;
    let currentNum2;
    let currentOperation;
    let helpTimeout;
    let answerSelected = false;

    const clickSound = new Howl({ src: ['boing.mp3'], volume: 0.5 });
    const correctSounds = [
        new Howl({ src: 'correct-1.mp3', volume: 0.5 }),
        new Howl({ src: 'correct-2.mp3', volume: 0.5 }),
        new Howl({ src: 'correct-3.mp3', volume: 0.5 })
    ];
    const wrongSounds = [
        new Howl({ src: 'wrong-1.mp3', volume: 0.5 }),
        new Howl({ src: 'wrong-2.mp3', volume: 0.5 })
    ];

    function playCorrectSound() {
        correctSounds[Math.floor(Math.random() * correctSounds.length)].play();
    }
    
    function playWrongSound() {
        wrongSounds[Math.floor(Math.random() * wrongSounds.length)].play();
    }
    
    function updateScoreDisplay() {
        document.getElementById('score').innerText = score;
        document.getElementById('correct').innerText = correctCount;
        document.getElementById('wrong').innerText = wrongCount;
        document.getElementById('helpCount').innerText = helpPressCount;

        const scoreElement = document.getElementById('score');
        scoreElement.classList.add('score-pop');
        setTimeout(() => scoreElement.classList.remove('score-pop'), 300);

        const progress = (score / maxScore) * 100;
        document.getElementById('score-progress').style.width = `${progress}%`;
    }

    function generateQuestion() {
        const operations = ['+', '-', 'x', ':'];
        let operation = operations[Math.floor(Math.random() * operations.length)];
        let num1, num2;

        if (operation === 'x' || operation === ':') {
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
        } else {
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * 50) + 1;
        }

        if (operation === ':') {
            num1 = num1 * num2;
        } else if (operation === '-') {
            if (num1 < num2) [num1, num2] = [num2, num1];
        }

        correctAnswer = eval(`${num1} ${operation.replace('x', '*').replace(':', '/')} ${num2}`);
        document.getElementById('question').innerHTML = `Câu hỏi: ${num1} ${operation} ${num2} = ?`;

        currentNum1 = num1;
        currentNum2 = num2;
        currentOperation = operation;

        const helpBtn = document.getElementById('help-btn');
        helpBtn.style.display = 'none';

        answerSelected = false;

        clearTimeout(helpTimeout);
        // Only allow help button to show if NOT in challenge mode
        helpTimeout = setTimeout(() => {
            if (!answerSelected && !isChallengeMode) {
                helpBtn.style.display = 'block';
            } else {
                helpBtn.style.display = 'none';
            }
        }, 5000);

        const options = generateOptions(correctAnswer);
        displayOptions(options);
    }

    function generateOptions(correctAnswer) {
        const options = [correctAnswer];
        const range = 10;

        while (options.length < 4) {
            const wrongAnswer = correctAnswer + (Math.floor(Math.random() * range * 2) - range);
            if (!options.includes(wrongAnswer) && wrongAnswer !== correctAnswer && wrongAnswer >= 0) {
                options.push(wrongAnswer);
            }
        }

        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        return options;
    }

    function displayOptions(options) {
        const optionsDiv = document.getElementById('options');
        optionsDiv.innerHTML = '';
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.innerText = option;
            button.addEventListener('click', () => {
                answerSelected = true;
                clearTimeout(helpTimeout);
                checkAnswer(option);
            });
            optionsDiv.appendChild(button);
        });
    }

    function showHelpTable() {
        // Increment help press count each time help is used
        helpPressCount++;
        updateScoreDisplay();

        let helpContent = '';

        if (currentOperation === 'x' || currentOperation === ':') {
            const tableNum = Math.min(currentNum1, currentNum2);
            helpContent = `<h3>Bảng nhân ${tableNum}</h3>`;
            for (let i = 1; i <= 10; i++) {
                helpContent += `${tableNum} x ${i} = ${tableNum * i}<br>`;
            }
        } else if (currentOperation === '+') {
            const tens2 = Math.floor(currentNum2 / 10) * 10;
            const ones2 = currentNum2 % 10;

            helpContent = `<h3>Cách cộng theo hàng chục và đơn vị</h3>`;
            helpContent += `Chia số hạng phía sau thành hàng chục và đơn vị, rồi cộng từng phần với số hạng phía trước.<br>`;
            helpContent += `<p class="help-text">`;
            helpContent += `<strong>Ví dụ: ${currentNum1} + ${currentNum2}</strong><br><br>`;
            helpContent += `Làm từng bước:<br>`;
            helpContent += `1. Chia ${currentNum2} thành:<br>`;
            helpContent += `- Hàng chục: ${tens2}<br>`;
            helpContent += `- Hàng đơn vị: ${ones2}<br>`;
            helpContent += `2. Cộng hàng chục trước: ${currentNum1} + ${tens2} = ${currentNum1 + tens2}<br>`;
            helpContent += `3. Cộng thêm hàng đơn vị: ${currentNum1 + tens2} + ${ones2} = ${currentNum1 + tens2 + ones2}<br>`;
            helpContent += `<strong>Kết quả: ${currentNum1} + ${currentNum2} = ${correctAnswer}</strong>`;
            helpContent += `</p>`;
        } else if (currentOperation === '-') {
            const tens2 = Math.floor(currentNum2 / 10) * 10;
            const ones2 = currentNum2 % 10;

            helpContent = `<h3>Cách trừ theo hàng chục và đơn vị</h3>`;
            helpContent += `Chia số trừ thành hàng chục và đơn vị, rồi trừ từng phần.<br>`;
            helpContent += `<p class="help-text">`;
            helpContent += `<strong>Ví dụ: ${currentNum1} - ${currentNum2}</strong><br><br>`;
            helpContent += `Làm từng bước:<br>`;
            helpContent += `1. Chia ${currentNum2} thành:<br>`;
            helpContent += `- Hàng chục: ${tens2}<br>`;
            helpContent += `- Hàng đơn vị: ${ones2}<br>`;
            helpContent += `2. Trừ hàng chục trước: ${currentNum1} - ${tens2} = ${currentNum1 - tens2}<br>`;
            helpContent += `3. Trừ thêm hàng đơn vị: ${currentNum1 - tens2} - ${ones2} = ${currentNum1 - tens2 - ones2}<br>`;
            helpContent += `<strong>Kết quả: ${currentNum1} - ${currentNum2} = ${correctAnswer}</strong>`;
            helpContent += `</p>`;
        }

        Swal.fire({
            html: helpContent,
            icon: 'info',
            confirmButtonText: 'Đóng'
        });
    }

    document.getElementById('help-btn').addEventListener('click', showHelpTable);

    function checkAnswer(selectedAnswer) {
        if (selectedAnswer === correctAnswer) {
            correctCount++; // increment correct answer count
            streak++;
            score += 10 * streak;
            updateScoreDisplay();

            if (score >= maxScore) {
                const totalTimeUsed = 600 - timeLeft;
                const minutesUsed = Math.floor(totalTimeUsed / 60);
                const secondsUsed = totalTimeUsed % 60;
                Swal.fire({
                    title: '🏆 Bạn đã chiến thắng 🏆',
                    html: `<p>Bạn đã đạt <strong>${score}</strong> điểm!<br>
                           Số câu đúng: <strong>${correctCount}</strong><br>
                           Số câu sai: <strong>${wrongCount}</strong><br>
                           Số lần trợ giúp: <strong>${helpPressCount}</strong><br>
                           Tổng thời gian: <strong>${minutesUsed} phút ${secondsUsed} giây</strong></p>`,
                    icon: 'success',
                    confirmButtonText: 'Đồng ý',
                    allowOutsideClick: false
                }).then(() => {
                    returnToMainMenu();
                });
                return;
            }

            while (currentMilestoneIndex < milestones.length && score >= milestones[currentMilestoneIndex]) {
                Swal.fire({
                    title: 'Chúc mừng!',
                    text: `Bạn đã vượt qua ${milestones[currentMilestoneIndex]} điểm!`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                currentMilestoneIndex++;
            }

            document.getElementById('feedback').innerHTML = 'Chính xác! Bạn thật giỏi! 😊';
            document.getElementById('feedback').style.color = 'green';
            playCorrectSound();

            const buttons = document.getElementsByClassName('option-btn');
            for (let button of buttons) {
                if (parseInt(button.innerText) === correctAnswer) {
                    button.classList.add('correct');
                }
                button.disabled = true;
            }

            setTimeout(() => {
                generateQuestion();
                document.getElementById('feedback').innerHTML = '';
            }, 1500);
        } else {
            wrongCount++; // increment wrong answer count
            const lastMilestone = currentMilestoneIndex > 0 ? milestones[currentMilestoneIndex - 1] : 0;
            score = Math.max(lastMilestone, score - 5);
            streak = 0;
            updateScoreDisplay();

            document.getElementById('feedback').innerHTML = `Sai rồi! Đáp án đúng là ${correctAnswer}. Cẩn thận hơn nhé! 😢`;
            document.getElementById('feedback').style.color = 'red';
            playWrongSound();

            const buttons = document.getElementsByClassName('option-btn');
            for (let button of buttons) {
                if (parseInt(button.innerText) === selectedAnswer) {
                    button.classList.add('wrong');
                }
                if (parseInt(button.innerText) === correctAnswer) {
                    button.classList.add('correct');
                }
                button.disabled = true;
            }

            setTimeout(() => {
                generateQuestion();
                document.getElementById('feedback').innerHTML = '';
            }, 1500);
        }
    }

    function startPracticeMode() {
        isChallengeMode = false;
        document.getElementById('mode-selection').style.display = 'none';
        document.getElementById('game-area').style.display = 'block';
        document.getElementById('timer').style.display = 'none';
        // Reset all counters
        score = 0;
        streak = 0;
        currentMilestoneIndex = 0;
        correctCount = 0;
        wrongCount = 0;
        helpPressCount = 0;
        updateScoreDisplay();
        generateQuestion();
    }

    function startChallengeMode() {
        isChallengeMode = true;
        document.getElementById('mode-selection').style.display = 'none';
        document.getElementById('game-area').style.display = 'block';
        document.getElementById('timer').style.display = 'block';
        // Ensure help button is disabled in challenge mode
        document.getElementById('help-btn').style.display = 'none';
        // Reset all counters
        score = 0;
        streak = 0;
        currentMilestoneIndex = 0;
        correctCount = 0;
        wrongCount = 0;
        helpPressCount = 0;
        timeLeft = 600; // 10 minutes in seconds
        updateScoreDisplay();
    
        // Helper function to update the time display in mm:ss format
        const displayTime = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('time-left').innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        };

        displayTime();
        generateQuestion();

        timer = setInterval(() => {
            timeLeft--;
            displayTime();
            if (timeLeft <= 0) {
                clearInterval(timer);
                Swal.fire({
                    title: 'Hết giờ!',
                    text: `Trò chơi kết thúc! Điểm của bạn là ${score}.`,
                    icon: 'info',
                    confirmButtonText: 'Chơi lại'
                }).then(() => {
                    startChallengeMode();
                });
            }
        }, 1000);
    }

    function startTableMode() {
        document.getElementById('mode-selection').style.display = 'none';
        document.getElementById('table-area').style.display = 'block';
        document.getElementById('table-number').addEventListener('change', (e) => {
            const number = parseInt(e.target.value);
            if (number) {
                let content = '';
                for (let i = 1; i <= 10; i++) {
                    content += `${number} x ${i} = ${number * i}<br>`;
                }
                document.getElementById('table-content').innerHTML = content;
            }
        });
        document.getElementById('back-btn-table').focus();
    }

    function returnToMainMenu() {
        clickSound.play();
        document.getElementById('mode-selection').style.display = 'block';
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('table-area').style.display = 'none';
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        score = 0;
        streak = 0;
        currentMilestoneIndex = 0;
        updateScoreDisplay();
        document.getElementById('feedback').innerHTML = '';
    }

    window.startPracticeMode = startPracticeMode;
    window.startChallengeMode = startChallengeMode;
    window.startTableMode = startTableMode;
    window.returnToMainMenu = returnToMainMenu;
});