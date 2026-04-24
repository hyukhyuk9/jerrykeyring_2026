    // 인트로 텍스트 페이드인
    const introText = document.querySelector('.intro-text');
    setTimeout(() => introText.classList.add('show'), 500);
    function playTrack(audioSrc, lyricsSrc) {
      const player = document.getElementById('audioPlayer');
      player.src = audioSrc;
      player.style.display = "block";
      setTimeout(() => player.style.opacity = "1", 10);
      player.play();

      // action-buttons 표시
      const actionButtons = document.querySelector('.action-buttons');
      actionButtons.style.display = "flex";
      setTimeout(() => actionButtons.style.opacity = "1", 10);

      // 다운로드 버튼 갱신
      const downloadBtn = document.getElementById('downloadBtn');
      if (downloadBtn) downloadBtn.href = audioSrc;

      fetch(lyricsSrc)
        .then(response => {
          if (!response.ok) {
            throw new Error('가사 파일을 불러오지 못했습니다.');
          }
          return response.text();
        })
        .then(text => {
          const lyrics = document.getElementById('lyrics');
          lyrics.innerText = text;
          lyrics.style.display = 'block';
          setTimeout(() => lyrics.style.opacity = "1", 10);
        })
        .catch(error => {
          const lyrics = document.getElementById('lyrics');
          lyrics.innerText = '가사가 준비되지 않았습니다.';
          lyrics.style.display = 'block';
          setTimeout(() => lyrics.style.opacity = "1", 10);
        });
    }

    // 공유 버튼 기능 (기기 기본 공유창 호출)
    document.getElementById('shareBtn').addEventListener('click', async () => {
      const shareData = {
        title: '제리키링 | 내 음원 듣기',
        text: '제리키링에서 만든 나만의 음원을 들어보세요 🎧',
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          alert('공유가 취소되었습니다.');
        }
      } else {
        alert('이 브라우저에서는 공유 기능을 지원하지 않습니다.');
      }
    });

    function toggleLyrics() {
      const lyrics = document.getElementById('lyrics');
      lyrics.style.display = 'block';
    }

    // 다크모드 토글: 로고 클릭시
    const logo = document.querySelector('.logo');
    logo.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });

    const introVideo = document.getElementById('introVideo');
    introVideo.addEventListener('ended', () => {
      introText.style.opacity = '0';
      setTimeout(() => introText.style.display = 'none', 1300);
      document.querySelectorAll('.track-button').forEach(btn => {
        btn.style.display = 'block';
        btn.style.opacity = '0';
        setTimeout(() => btn.style.opacity = '1', 10);
      });
      introVideo.style.display = 'none';
      // 인트로 영상 끝난 후 infoText 천천히 나타나기
      const infoText = document.querySelector('.mb-0');
      infoText.style.display = 'block';
      infoText.style.opacity = '0';
      setTimeout(() => infoText.style.opacity = '1', 10);
    });