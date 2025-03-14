document.addEventListener('DOMContentLoaded', () => {
    let score = 0;
    let correctAnswer;
    let timer;
    let timeLeft = 60;

    // Khởi tạo âm thanh vui nhộn bằng Howler.js
    const clickSound = new Howl({
        src: ['boing.mp3'], // Âm thanh khi nhấn nút Quay lại
        volume: 0.5 // Âm lượng (từ 0.0 đến 1.0)
    });

    const correctSounds = [
        new Howl({ src: ['correct-1.mp3'], volume: 0.5 }),
        new Howl({ src: ['correct-2.mp3'], volume: 0.5 }),
        new Howl({ src: ['correct-3.mp3'], volume: 0.5 })
    ];
    
    const wrongSounds = [
        new Howl({ src: ['wrong-1.mp3'], volume: 0.5 }),
        new Howl({ src: ['wrong-2.mp3'], volume: 0.5 })
    ];

    // Hàm tạo câu hỏi ngẫu nhiên và các lựa chọn đáp án
    function generateQuestion(mode) {
        const operations = ['+', '-', 'x', ':'];
        let operation = operations[Math.floor(Math.random() * operations.length)];
        let num1, num2;

        if (operation === 'x' || operation === ':') {
            num1 = Math.floor(Math.random() * 10) + 1; // Số từ 1-10
            num2 = Math.floor(Math.random() * 10) + 1; // Số từ 1-10
        } else {
            num1 = Math.floor(Math.random() * 50) + 1; // Số từ 1-50
            num2 = Math.floor(Math.random() * 50) + 1; // Số từ 1-50
        }

        if (operation === ':') {
            num1 = num1 * num2; // Đảm bảo phép chia có kết quả nguyên
        } else if (operation === '-') {
            if (num1 < num2) [num1, num2] = [num2, num1]; // Đảm bảo số bị trừ lớn hơn số trừ
        }

        correctAnswer = eval(`${num1} ${operation.replace('x', '*').replace(':', '/')} ${num2}`);
        document.getElementById('question').innerHTML = `Câu hỏi: ${num1} ${operation} ${num2} = ?`;

        // Tạo danh sách các lựa chọn đáp án
        const options = generateOptions(correctAnswer);
        displayOptions(options);
    }

    // Hàm tạo các lựa chọn đáp án (đáp án đúng + các đáp án sai ngẫu nhiên)
    function generateOptions(correctAnswer) {
        const options = [correctAnswer];
        const range = 10; // Phạm vi tạo các đáp án sai xung quanh đáp án đúng

        while (options.length < 4) { // Tạo 4 lựa chọn (1 đúng, 3 sai)
            const wrongAnswer = correctAnswer + (Math.floor(Math.random() * range * 2) - range);
            if (!options.includes(wrongAnswer) && wrongAnswer !== correctAnswer && wrongAnswer >= 0) {
                options.push(wrongAnswer);
            }
        }

        // Xáo trộn các lựa chọn để đáp án đúng không luôn ở vị trí đầu tiên
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        return options;
    }

    // Hàm hiển thị các lựa chọn đáp án dưới dạng nút
    function displayOptions(options) {
        const optionsDiv = document.getElementById('options');
        optionsDiv.innerHTML = ''; // Xóa các lựa chọn cũ
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.innerText = option;
            button.addEventListener('click', () => checkAnswer(option, options));
            optionsDiv.appendChild(button);
        });
    }

    // Hàm kiểm tra đáp án khi trẻ chọn
    function checkAnswer(selectedAnswer, options) {
        if (selectedAnswer === correctAnswer) {
            // Phát âm thanh khi trả lời Đúng
            correctSounds[Math.floor(Math.random() * correctSounds.length)].play();
            
            score += 10;
            document.getElementById('score').innerText = score;
            document.getElementById('feedback').innerHTML = 'Chính xác! Bạn thật giỏi! 😊';
            document.getElementById('feedback').style.color = 'green';
            Swal.fire({
                title: 'Tuyệt vời!',
                text: 'Bạn đã trả lời đúng!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            // Tô màu xanh cho đáp án đúng
            const buttons = document.getElementsByClassName('option-btn');
            for (let button of buttons) {
                if (parseInt(button.innerText) === correctAnswer) {
                    button.classList.add('correct');
                }
                button.disabled = true; // Vô hiệu hóa các nút sau khi chọn
            }

            // Tự động chuyển sang câu hỏi mới sau 1.5 giây
            setTimeout(() => {
                generateQuestion();
                document.getElementById('feedback').innerHTML = '';
            }, 1500);
        } else {
            // Phát âm thanh khi trả lời Sai
            wrongSounds[Math.floor(Math.random() * wrongSounds.length)].play();

            document.getElementById('feedback').innerHTML = `Sai rồi! Đáp án đúng là ${correctAnswer}. Cố lên nhé! 😢`;
            document.getElementById('feedback').style.color = 'red';
            Swal.fire({
                title: 'Ôi không!',
                text: `Đáp án đúng là ${correctAnswer}. Cố gắng lần sau nhé!`,
                icon: 'error',
                timer: 5000,
                showConfirmButton: false
            });

            // Tô màu đỏ cho đáp án sai và màu xanh cho đáp án đúng
            const buttons = document.getElementsByClassName('option-btn');
            for (let button of buttons) {
                if (parseInt(button.innerText) === selectedAnswer) {
                    button.classList.add('wrong');
                }
                if (parseInt(button.innerText) === correctAnswer) {
                    button.classList.add('correct');
                }
                button.disabled = true; // Vô hiệu hóa các nút sau khi chọn
            }

            // Tự động chuyển sang câu hỏi mới sau 1.5 giây
            setTimeout(() => {
                generateQuestion();
                document.getElementById('feedback').innerHTML = '';
            }, 5000);
        }
    }

    // Hàm bắt đầu chế độ luyện tập
    function startPracticeMode() {
        clickSound.play();

        document.getElementById('mode-selection').style.display = 'none';
        document.getElementById('game-area').style.display = 'block';
        document.getElementById('timer').style.display = 'none';
        score = 0;
        document.getElementById('score').innerText = score;
        generateQuestion();
    }

    // Hàm bắt đầu chế độ thi đấu
    function startChallengeMode() {
        clickSound.play();

        document.getElementById('mode-selection').style.display = 'none';
        document.getElementById('game-area').style.display = 'block';
        document.getElementById('timer').style.display = 'block';
        score = 0;
        timeLeft = 60;
        document.getElementById('score').innerText = score;
        document.getElementById('time-left').innerText = timeLeft;
        generateQuestion();

        timer = setInterval(() => {
            timeLeft--;
            document.getElementById('time-left').innerText = timeLeft;
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

    // Hàm bắt đầu chế độ học bảng cửu chương
    function startTableMode() {
        clickSound.play();

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
    }

    // Hàm quay lại màn hình chính
    function returnToMainMenu() {
        // Phát âm thanh vui nhộn
        clickSound.play();

        // Hiển thị lại màn hình chính
        document.getElementById('mode-selection').style.display = 'block';

        // Ẩn khu vực trò chơi và bảng cửu chương
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('table-area').style.display = 'none';

        // Nếu đang ở chế độ Thi Đấu, dừng bộ đếm thời gian
        if (timer) {
            clearInterval(timer);
            timer = null;
        }

        // Đặt lại điểm và thông báo
        score = 0;
        document.getElementById('score').innerText = score;
        document.getElementById('feedback').innerHTML = '';
    }

    // Đảm bảo các hàm toàn cục có thể được gọi từ HTML
    window.startPracticeMode = startPracticeMode;
    window.startChallengeMode = startChallengeMode;
    window.startTableMode = startTableMode;
    window.returnToMainMenu = returnToMainMenu;
});