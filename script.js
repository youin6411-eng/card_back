(function () {
    // Canvas 요소 가져오기
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // 게임 설정
    const CARD_WIDTH = 100;
    const CARD_HEIGHT = 100;
    const CARD_MARGIN = 20;
    const NUM_PAIRS = 8; // 8쌍의 카드 (4x4 = 16개)
    const TOTAL_CARDS = NUM_PAIRS * 2;

    let cards = []; // 카드 객체들을 저장할 배열
    let flippedCards = []; // 뒤집힌 카드들을 저장
    let matchedCards = []; // 짝이 맞춰진 카드들을 저장
    let canFlip = true; // 카드 뒤집기 가능 여부
    let isGameOver = false; // 게임 종료 여부
    let score = 0; // 점수
    let mistakes = 0; // 오답 횟수
    const MAX_MISTAKES = 5; // 최대 허용 오답 횟수

    // Supabase 설정
    const SUPABASE_URL = 'https://ymvumzzwvwgdhaegaamj.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltdnVtenp3dndnZGhhZWdhYW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODM4NjYsImV4cCI6MjA4MjA1OTg2Nn0.QnfScxkbVPwmRpiKa8dZjfPBP4-QVQgKa58kIic-3dU';

    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 카드 이미지 (예시 - 실제 게임에서는 다양한 이미지를 사용)
    const cardImages = [
        '⭐', '🍎', '🌈', '🚀', '💡', '🎵', '🍀', '💎',
        '⭐', '🍎', '🌈', '🚀', '💡', '🎵', '🍀', '💎'
    ];

    // 카드 초기화 함수
    function initGame() {
        cards = [];
        flippedCards = [];
        matchedCards = [];
        canFlip = true;
        isGameOver = false;
        score = 0;
        mistakes = 0;
        document.getElementById('score').textContent = score;
        document.getElementById('mistakes').textContent = mistakes;

        // 카드 내용 섞기
        const shuffledImages = cardImages.sort(() => Math.random() - 0.5);

        // 카드 객체 생성
        const gridCols = 4;
        const gridRows = TOTAL_CARDS / gridCols;
        const totalGridWidth = gridCols * CARD_WIDTH + (gridCols - 1) * CARD_MARGIN;
        const totalGridHeight = gridRows * CARD_HEIGHT + (gridRows - 1) * CARD_MARGIN;
        const startX = (canvas.width - totalGridWidth) / 2;
        const startY = (canvas.height - totalGridHeight) / 2;

        for (let i = 0; i < TOTAL_CARDS; i++) {
            const row = Math.floor(i / gridCols);
            const col = i % gridCols;

            cards.push({
                id: i,
                x: startX + col * (CARD_WIDTH + CARD_MARGIN),
                y: startY + row * (CARD_HEIGHT + CARD_MARGIN),
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                value: shuffledImages[i],
                isFlipped: false,
                isMatched: false
            });
        }

        drawGame(); // 게임 화면 그리기
        fetchAndDisplayTopScores(); // Top 5 점수 불러오기
    }

    // 게임 화면 그리기 함수
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 화면 지우기

        cards.forEach(card => {
            ctx.beginPath();
            ctx.rect(card.x, card.y, card.width, card.height);
            ctx.fillStyle = card.isMatched ? '#ccc' : (card.isFlipped ? '#eee' : '#333'); // 매치된 카드는 회색, 뒤집힌 카드는 밝게, 안 뒤집힌 카드는 어둡게
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();

            if (card.isFlipped || card.isMatched) {
                ctx.fillStyle = '#000';
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(card.value, card.x + card.width / 2, card.y + card.height / 2);
            }
        });
    }

    // 카드 클릭 이벤트 핸들러
    canvas.addEventListener('click', (event) => {
        if (!canFlip || isGameOver) return;

        const mouseX = event.offsetX;
        const mouseY = event.offsetY;

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            if (mouseX > card.x && mouseX < card.x + card.width &&
                mouseY > card.y && mouseY < card.y + card.height &&
                !card.isFlipped && !card.isMatched) {

                card.isFlipped = true;
                flippedCards.push(card);
                drawGame();

                if (flippedCards.length === 2) {
                    canFlip = false;
                    setTimeout(checkMatch, 1000); // 1초 후 짝 맞는지 확인
                }
                return;
            }
        }
    });

    // 짝이 맞는지 확인하는 함수
    function checkMatch() {
        const [card1, card2] = flippedCards;

        if (card1.value === card2.value) {
            // 짝이 맞음
            card1.isMatched = true;
            card2.isMatched = true;
            matchedCards.push(card1, card2);
            score += 100; // 점수 증가
            document.getElementById('score').textContent = score;

            if (matchedCards.length === TOTAL_CARDS) {
                isGameOver = true;
                drawGame();
                setTimeout(() => {
                    showModal('게임 승리! 축하합니다!', `최종 점수: ${score}점\n리더보드에 등록할 이름을 입력해주세요.`, true);
                }, 100);
                return;
            }
        } else {
            // 짝이 틀림
            card1.isFlipped = false;
            card2.isFlipped = false;
            mistakes++; // 오답 횟수 증가
            document.getElementById('mistakes').textContent = mistakes;

            if (mistakes >= MAX_MISTAKES) {
                isGameOver = true;
                drawGame(); // 마지막 오답 상태 그리기
                setTimeout(() => {
                    showModal('게임 오버!', `5번 틀렸습니다. (최종 점수: ${score}점)\n리더보드에 등록할 이름을 입력해주세요.`, true);
                }, 100);
                return; // 게임 종료
            }
        }

        flippedCards = []; // 뒤집힌 카드 배열 초기화
        canFlip = true; // 다시 카드 뒤집기 가능
        drawGame();
    }

    // Supabase에 점수 저장 함수
    async function saveScore(playerName, finalScore) {
        if (!playerName || playerName.trim() === "") {
            console.log('이름 미입력으로 저장 취소');
            return;
        }

        try {
            console.log(`${playerName}님의 점수(${finalScore}) 저장 중...`);
            const { data, error } = await supabaseClient
                .from('scores')
                .insert([{ player_name: playerName.trim(), score: finalScore }])
                .select();

            if (error) throw error;

            console.log('점수 저장 성공:', data);
            showModal('저장 완료', `${playerName}님의 점수(${finalScore}점)가 성공적으로 저장되었습니다!`, false);
            await fetchAndDisplayTopScores(); // 리더보드 강제 업데이트
        } catch (error) {
            console.error('점수 저장 중 오류 발생:', error);
            showModal('저장 실패', `오류: ${error.message || '알 수 없는 오류'}`, false);
        }
    }

    // 커스텀 모달 표시 함수
    function showModal(title, message, showInput = false) {
        const modal = document.getElementById('gameModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const inputContainer = document.getElementById('modalInputContainer');
        const actionBtn = document.getElementById('modalActionBtn');
        const playerNameInput = document.getElementById('playerNameInput');

        modalTitle.textContent = title;
        modalMessage.textContent = message;

        if (showInput) {
            inputContainer.style.display = 'block';
            actionBtn.style.display = 'block';
            playerNameInput.value = ''; // 초기화
        } else {
            inputContainer.style.display = 'none';
            actionBtn.style.display = 'none';
        }

        modal.classList.add('active');
    }

    function hideModal() {
        document.getElementById('gameModal').classList.remove('active');
    }

    // 모달 버튼 이벤트 리스너
    document.getElementById('modalActionBtn').addEventListener('click', () => {
        const playerName = document.getElementById('playerNameInput').value;
        if (playerName && playerName.trim() !== "") {
            hideModal();
            saveScore(playerName, score);
        } else {
            alert('이름을 입력해주세요!');
        }
    });

    document.getElementById('modalCloseBtn').addEventListener('click', hideModal);


    // 게임 다시 시작 버튼
    document.getElementById('resetButton').addEventListener('click', initGame);

    // Top 5 점수를 가져와 표시하는 함수
    async function fetchAndDisplayTopScores() {
        const { data, error } = await supabaseClient
            .from('scores')
            .select('player_name, score')
            .order('score', { ascending: false })
            .limit(5);

        const topScoresList = document.getElementById('topScoresList');
        topScoresList.innerHTML = ''; // 기존 목록 초기화

        if (error) {
            console.error('Top 점수 불러오기 중 오류 발생:', error);
            topScoresList.innerHTML = '<li>점수 불러오기 실패</li>';
        } else if (data && data.length > 0) {
            data.forEach(scoreEntry => {
                const listItem = document.createElement('li');
                listItem.textContent = `${scoreEntry.player_name}: ${scoreEntry.score}점`;
                topScoresList.appendChild(listItem);
            });
        } else {
            topScoresList.innerHTML = '<li>아직 기록된 점수가 없습니다.</li>';
        }
    }

    // 게임 시작
    initGame();
})();