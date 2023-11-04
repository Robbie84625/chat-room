const playSoundButton = document.getElementById('playSound');
            playSoundButton.addEventListener('click', () => {
            const audio = new Audio('music/doorbell.mp3'); // 声音文件的路径
            audio.play();
            audio.volume = 1.0
            });