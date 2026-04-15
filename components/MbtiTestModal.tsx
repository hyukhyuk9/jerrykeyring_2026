'use client';

import { useState } from 'react';

const questions: Record<number, { title: string; type: string; A: string; B: string }> = {
  1: { title: '콘서트에 간다면 당신은?', type: 'EI', A: '귀가 녹는다... 박효신이 내 심장을 간질간질', B: '지디 나왔다!!! 다비켜ㅕㅕ🔥 아갓더 파워ㅓㅓㅓ' },
  2: { title: '콘서트 당일의 당신 행동은?', type: 'EI', A: '굿즈부터 싹쓸이! 이건 투자야... (합리화 완료)', B: '떼창하다가 성대 나감. 근데 행복이가 되.' },
  3: { title: '길 가다 최애 노래가 흘러나온다면?', type: 'EI', A: '쉿... 집중. 내 최애곡 내적 감상', B: '이건 못 참지! 리듬타다 옆사람 놀라 타닥' },
  4: { title: '하루 종일 한 곡만 들을 수 있다면?', type: 'SN', A: 'R&B로 감성 샤워함... 오늘 하루 무드 세팅 완료', B: '힙합이 내 심장 박동수랑 동기화 중' },
  5: { title: '도전 앞둔 당신, 무슨 음악 들을래?', type: 'SN', A: 'EDM 폭발! 맘속에서 불꽃놀이 터지는 중', B: '아무노래나 일단 틀어! 가사 안봐 난' },
  6: { title: '드라이브하면서 듣고 싶은 건?', type: 'SN', A: '발라드로 창밖 보며 로또 1등된 주인공 놀이', B: '댄스곡 틀자! 와이퍼랑 박자 맞춰야지' },
  7: { title: '라이브 공연에서 제일 기다리는 순간?', type: 'TF', A: '그 고음, 소름... 닭살 ON!', B: '떼창 각이다. 옆사람이랑 아이컨택도 가능' },
  8: { title: '음악에서 제일 중요한 건?', type: 'TF', A: '이 가사, 내 얘기잖아… 진짜 울뻔', B: '들으면 자동 흥얼. 중독성 뭐냐고' },
  9: { title: '무한 반복 가능한 곡 스타일은?', type: 'TF', A: '재즈는 들을수록 빠져... 이건 마성의 감성', B: '댄스곡 무한루프 가능. 나 혼자 클럽 개장함' },
  10: { title: '노래방 가면 당신은?', type: 'JP', A: '감성 충만 발라드로 입장합니다~ (하늘 보며)', B: '디바 모드 ON! 마이크 터뜨리러 왔다' },
  11: { title: '비 오는 날 듣고 싶은 노래는?', type: 'JP', A: '창가에 앉아 발라드... 비 소리랑 찰떡', B: '재즈 한 잔에 R&B 한 모금, 분위기 무드등 켜짐' },
  12: { title: '친구가 신곡 추천해줬을 때?', type: 'JP', A: '10초 듣고 별로면 스킵~ 내 귀는 까다로움', B: '잘 몰라도 일단 리듬 탑승! 출발~' },
};

const results: Record<string, { genre: string; img: string; cheese: string }> = {
  INTJ: { genre: '🧀 EDM', img: '/images/8블루.png', cheese: '블루' },
  INTP: { genre: '🧀 Jazz', img: '/images/4카망베르.png', cheese: '카망베르' },
  ENTJ: { genre: '🧀 EDM', img: '/images/8블루.png', cheese: '블루' },
  ENTP: { genre: '🧀 Hip-hop', img: '/images/6파마산.png', cheese: '파마산' },
  INFJ: { genre: '🧀 Folk', img: '/images/7아메리칸.png', cheese: '아메리칸' },
  INFP: { genre: '🧀 Indie Pop', img: '/images/1모짜렐라.png', cheese: '모짜렐라' },
  ENFJ: { genre: '🧀 Ballad', img: '/images/3리코타.png', cheese: '리코타' },
  ENFP: { genre: '🧀 City Pop', img: '/images/2체다.png', cheese: '체다' },
  ISTJ: { genre: '🧀 Folk', img: '/images/7아메리칸.png', cheese: '아메리칸' },
  ISFJ: { genre: '🧀 Ballad', img: '/images/3리코타.png', cheese: '리코타' },
  ESTJ: { genre: '🧀 City Pop', img: '/images/2체다.png', cheese: '체다' },
  ESFJ: { genre: '🧀 R&B', img: '/images/5고다.png', cheese: '고다' },
  ISTP: { genre: '🧀 Jazz', img: '/images/4카망베르.png', cheese: '카망베르' },
  ISFP: { genre: '🧀 R&B', img: '/images/5고다.png', cheese: '고다' },
  ESTP: { genre: '🧀 Hip-hop', img: '/images/6파마산.png', cheese: '파마산' },
  ESFP: { genre: '🧀 Hip-hop', img: '/images/6파마산.png', cheese: '파마산' },
};

interface MbtiTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MbtiTestModal({ isOpen, onClose }: MbtiTestModalProps) {
  const [step, setStep] = useState(1);
  const [scores, setScores] = useState({ EI: 0, SN: 0, TF: 0, JP: 0 });
  const [mbtiResult, setMbtiResult] = useState<string | null>(null);

  if (!isOpen) return null;

  function selectAnswer(choice: 'A' | 'B') {
    const q = questions[step];
    if (choice === 'A') {
      setScores(prev => ({ ...prev, [q.type]: prev[q.type as keyof typeof prev] + 1 }));
    }

    if (step < 12) {
      setStep(step + 1);
    } else {
      // 결과 계산
      const mbti = (
        (scores.EI + (choice === 'A' && q.type === 'EI' ? 1 : 0) < 2 ? 'I' : 'E') +
        (scores.SN + (choice === 'A' && q.type === 'SN' ? 1 : 0) < 2 ? 'N' : 'S') +
        (scores.TF + (choice === 'A' && q.type === 'TF' ? 1 : 0) < 2 ? 'F' : 'T') +
        (scores.JP + (choice === 'A' && q.type === 'JP' ? 1 : 0) < 2 ? 'P' : 'J')
      );
      setMbtiResult(mbti);
    }
  }

  function reset() {
    setStep(1);
    setScores({ EI: 0, SN: 0, TF: 0, JP: 0 });
    setMbtiResult(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  const q = questions[step];
  const result = mbtiResult ? results[mbtiResult] : null;

  return (
    <div className="mbti-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="mbti-modal">
        <button className="mbti-close" onClick={handleClose}>&times;</button>

        {!mbtiResult ? (
          <>
            <h2 className="mbti-title">AI 음악 취향 테스트</h2>
            <p className="mbti-subtitle">나에게 어울리는 음악 장르는? 🧀</p>

            <div className="mbti-progress">
              <div
                className="mbti-progress-bar"
                style={{ width: `${(step / 12) * 100}%` }}
              />
            </div>

            <p className="mbti-question">
              Q{step}. {q.title}
            </p>

            <button className="mbti-answer" onClick={() => selectAnswer('A')}>
              {q.A}
            </button>
            <button className="mbti-answer" onClick={() => selectAnswer('B')}>
              {q.B}
            </button>
          </>
        ) : (
          <div className="mbti-result">
            <h2 className="mbti-title">당신의 음악 치즈 유형</h2>
            {result && (
              <>
                <img src={result.img} alt={result.cheese} className="mbti-result-img" />
                <p className="mbti-result-cheese">{result.cheese}</p>
                <p className="mbti-result-genre">{result.genre}</p>
              </>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button className="mbti-retry" onClick={reset}>
                다시하기
              </button>
              <button className="mbti-retry" onClick={handleClose} style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
