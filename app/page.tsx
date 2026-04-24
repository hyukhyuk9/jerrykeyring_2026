"use client";

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

export default function HomePage() {
  const albumRef = useRef<HTMLDivElement>(null);
  const clickTooltipRef = useRef<HTMLDivElement>(null);
  const personaDisplayRef = useRef<HTMLDivElement>(null);
  const completeBubbleRef = useRef<HTMLDivElement>(null);
  const finalEnterBtnRef = useRef<HTMLButtonElement>(null);
  const chainBeadsWrapRef = useRef<HTMLDivElement>(null);
  const cdLayerRef = useRef<HTMLDivElement>(null);
  const mainSceneRef = useRef<HTMLDivElement>(null);

  // 로컬 스토리지 및 전역 변수 모방
  const nfcFinal = useRef('');
  const personaInterval = useRef<NodeJS.Timeout | null>(null);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const physicsCds = useRef<HTMLElement[]>([]);
  const landingSpots = useRef<{x: number, y: number}[]>([]);

  useEffect(() => {
    // 1. 기존 초기화 로직
    if (typeof window !== 'undefined') {
      const savedNfc = localStorage.getItem('auth_nfc_number');
      if (localStorage.getItem('seen_interactive_v2') && savedNfc) {
         window.location.replace(`/jerrykeyring_legacy/player.html?id=${savedNfc}`);
      }
    }

    // 2. 비즈(Chain Beads) 생성 로직
    const cbw = chainBeadsWrapRef.current;
    if (cbw) {
      cbw.innerHTML = '';
      const chH = window.innerHeight * 0.6; 
      for(let py=0; py>=-chH; py-=20) {
        let b = document.createElement('div');
        b.className = 'chain-bead';
        b.style.setProperty('--px', '-14px');
        b.style.setProperty('--py', py + 'px');
        b.style.animationDelay = `${ (py / -chH) * 0.2 }s`;
        cbw.appendChild(b);
      }
      for(let py=0; py>=-chH; py-=20) {
        let b = document.createElement('div');
        b.className = 'chain-bead';
        b.style.setProperty('--px', '14px');
        b.style.setProperty('--py', py + 'px');
        b.style.animationDelay = `${ (py / -chH) * 0.2 }s`;
        cbw.appendChild(b);
      }
      for(let i=1; i<4; i++) {
         let angle = Math.PI + (i/4)*Math.PI; 
         let px = 14 * Math.cos(angle);
         let py = 14 * Math.sin(angle);
         let b = document.createElement('div');
         b.className = 'chain-bead';
         b.style.setProperty('--px', px + 'px');
         b.style.setProperty('--py', py + 'px');
         b.style.animationDelay = '0s'; 
         cbw.appendChild(b);
      }
    }

    // 3. 인트로 애니메이션
    const albumEl = albumRef.current;
    if (albumEl) {
      setTimeout(() => {
        albumEl.style.transition = 'transform 1s cubic-bezier(0.3, 0.05, 0.3, 1.1)';
        albumEl.style.transform = 'translateY(5vh) rotate(0deg)';

        setTimeout(() => {
          albumEl.style.transition = 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
          albumEl.style.transform = 'translateY(0) rotate(0deg)';

          clickTimer.current = setTimeout(() => {
            if (clickTooltipRef.current) clickTooltipRef.current.style.opacity = '1';
          }, 1000);
        }, 1000);
      }, 200);
    }

    return () => {
      if (personaInterval.current) clearInterval(personaInterval.current);
      if (clickTimer.current) clearTimeout(clickTimer.current);
    };
  }, []);

  // --- 기존 함수들 이식 ---
  const personas = [
    "임산부 태교 음악을 만들었어요.", "내 사랑하는 지인을 위해 만들었어요.", "아픈 우리 아빠를 위해 만들었어요.",
    "잠 못 드는 밤, 나를 위로하기 위해 만들었어요.", "백일 된 조카에게 들려줄 거예요.", "멀리 있는 친구에게 깜짝 선물로!",
    "반려견과 산책할 때 듣고 싶어서요.", "시험 준비에 지친 동생을 위해.", "첫 출근하는 나에게 주는 응원.",
    "비 오는 날 혼자 듣기 좋은 음악.", "요리할 때 신나게 듣고 싶어요.", "퇴근길, 지친 마음을 달래려고.",
    "우울할 때 꺼내듣는 나만의 테라피.", "프로포즈 배경음악으로 쓸 거예요.", "매일 아침 상쾌하게 일어날 수 있게.",
    "엄마의 회갑 잔치 배경 음악이에요.", "우리 부부의 첫 만남을 기억하며.", "운전할 때 졸음 쫓는 신나는 비트!",
    "짝사랑하는 그 애에게 들려주고파.", "유학 가는 친구의 송별회 선물.", "운동할 때 전투력을 높여줄 곡.",
    "잠자기 전, 마음이 편안해지는 소리.", "바다로 떠나는 드라이브 필수템.", "슬플 때 펑펑 울고 싶어서.",
    "그리운 할머니를 생각하며 만들었어요.", "카페에서 책 읽을 때 들으려고.", "사랑하는 사람의 100일 기념 서프라이즈.",
    "지친 수험생 아들을 위한 힘찬 응원.", "오랜만에 만나는 첫사랑을 위해.", "나만의 명상 보이스 기록입니다.",
    "가을 낙엽을 걸으며 듣기 좋아요.", "캠핑장 모닥불 앞에서 들을 거예요.", "힘든 다이어트를 버티게 해줄 음악.",
    "우리가족 첫 해외여행 테마송!", "사내 연애를 응원하는 몰래 음악.", "우리 아이 첫 번째 생일파티용.",
    "반려묘가 좋아하는 주파수 소리예요.", "고향에 계신 부모님 생각이 날 때.", "아침 조깅할 때 듣는 상쾌한 곡.",
    "면접 전에 자신감을 채워주는 마법.", "헤어진 연인을 잊기 위한 이별송.", "집 안 대청소할 때 트는 노동요.",
    "크리스마스 파티의 메인 트랙!", "우리의 낭만적인 결혼기념일을 위해.", "마라톤 완주를 응원하는 힘찬 노래.",
    "혼술할 때 감성 터지는 발라드.", "비밀 일기장을 쓸 때의 BGM.", "어릴 적 추억이 담긴 애니메이션 곡.",
    "마치 영화 속 주인공이 된 기분으로.", "출장 가는 비행기 안에서.", "반신욕할 때 몸을 녹이는 선율.",
    "내 자신을 칭찬해주고 싶을 때.", "지옥철 출근길의 유일한 안식처.", "새해 일출을 보며 들었던 곡이에요.",
    "동기들과의 밤샘 프로젝트 노동요.", "우리 반 아이들에게 들려줄 노래.", "가장 찬란했던 스무 살의 나에게.",
    "기분이 울적한 친구를 웃게 해줄 곡.", "눈 내리는 밤, 따뜻한 코코아와 함께.", "첫 눈썹 문신(?) 후 안정을 위해.",
    "결혼하는 베스트 프렌드 축가용.", "자전거 타고 강변을 달릴 때.", "주말 늦잠 자고 일어났을 때.",
    "별 구경 할 때 듣는 우주 같은 곡.", "바쁜 일상 속, 나만의 오아시스.", "새벽 감성으로 쓴 자작곡이에요.",
    "그냥, 아무 이유 없이 땡기는 음악.", "내일 병원 가는 엄마를 응원하며.", "외국인 친구에게 한국을 알리려고.",
    "아침에 화장할 때 신나는 플레이리스트.", "불금 퇴근길, 흥이 차오르는 곡.", "기억 속 어딘가 묻어둔 짝사랑 송.",
    "마음의 평화를 위한 요가 BGM.", "이직 성공! 나를 위한 축하곡.", "퇴사하는 날, 당당하게 이어폰에 꽂을 곡.",
    "바람 부는 언덕에서 혼자 부르던 노래.", "우리아기 스르르 잠드는 자장가.", "그 사람의 목소리가 그리울 때.",
    "로또 당첨을 상상하며 듣는 희망송.", "무더운 여름, 에어컨 아래 서늘한 곡.", "새로운 취향을 개척하고 싶어서.",
    "사진 앨범을 넘기며 듣는 회상곡.", "오래된 라디오에서 흘러나온 듯한 노래.", "부모님의 젊은 시절을 추억하며.",
    "전 여친/남친의 결혼 소식을 들었을 때.", "수학여행 버스 맨 뒷자리 감성.", "어머니의 낡은 가요 테이프 복원.",
    "인생 첫 독립의 밤, 내 방에서.", "퇴사한 선배가 추천해준 인생곡.", "시험 망치고 한강에서 듣는 음악.",
    "처음 산 내 자동차의 첫 플레이곡.", "우연히 들어간 카페에서 꽂힌 트랙.", "마음이 답답할 때 통쾌한 락 발라드.",
    "비밀번호 486의 추억을 느끼며.", "짝사랑 그녀가 추천해준 인디곡.", "눈물로 밤을 지새우는 멜로디.",
    "다시 태어나면 이 노래를 부를 거야.", "오늘 하루도 수고한 나 자신에게.", "기적을 바라는 간절한 순간에.",
    "눈 감고 있으면 위로가 되는 천사의 소리."
  ];

  const getCdWidth = () => {
    if (!albumRef.current) return 200;
    return albumRef.current.offsetWidth * 0.7;
  };

  const scatterCDs = (count: number) => {
    if (!cdLayerRef.current) return;
    const layer = cdLayerRef.current;
    if (window.innerWidth < 650) count = Math.max(1, Math.floor(count / 3));

    const w = getCdWidth();
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const margin = w * 0.7;

    for(let i=0; i<count; i++) {
      setTimeout(() => {
        const cd = document.createElement('div');
        cd.className = 'lite-cd';
        cd.style.width = `${w}px`;
        layer.appendChild(cd);
        
        let endX = 0, endY = 0;
        let attempts = 0;
        while(attempts < 40) {
          endX = (Math.random() * (vw - w)) + w/2;
          endY = (Math.random() * (vh - w)) + w/2;
          let collision = false;
          for(let s of landingSpots.current) {
            if (Math.hypot(s.x - endX, s.y - endY) < margin) { collision = true; break; }
          }
          if(!collision) break;
          attempts++;
        }
        landingSpots.current.push({x: endX, y: endY});
        if(landingSpots.current.length > 25) landingSpots.current.shift(); 
        
        let startX = endX, startY = endY;
        const edge = Math.floor(Math.random() * 4); 
        if(edge===0) startY = -w - 300;
        else if(edge===1) startX = vw + w + 300;
        else if(edge===2) startY = vh + w + 300;
        else startX = -w - 300;
        
        cd.style.transform = `translate3d(${startX - w/2}px, ${startY - w/2}px, 0) scale(1) rotate(${Math.random()*360}deg)`;
        cd.style.opacity = '1'; 
        
        const rot = Math.random() * 720 + 360; 
        
        requestAnimationFrame(() => {
          cd.style.transition = 'transform 1.2s cubic-bezier(0.2, 0.8, 0.3, 1.1)';
          cd.style.transform = `translate3d(${endX - w/2}px, ${endY - w/2}px, 0) scale(1) rotate(${rot}deg)`;
        });
        
        cd.dataset.x = String(endX - w/2); 
        cd.dataset.y = String(endY - w/2);
        cd.dataset.rot = String(rot);

        cd.onclick = (e) => {
          e.stopPropagation();
          let newRot = parseFloat(cd.dataset.rot || '0') + 360;
          cd.dataset.rot = String(newRot);
          
          if (albumRef.current) albumRef.current.style.filter = 'drop-shadow(0 30px 40px rgba(0,0,0,1)) drop-shadow(0 0 30px rgba(255,145,77,0.7))';
          
          cd.style.transition = 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s, border-color 0.3s';
          cd.style.transform = `translate3d(${cd.dataset.x}px, ${cd.dataset.y}px, 0) scale(1) rotate(${newRot}deg)`;
          cd.style.borderColor = '#ff914d';
          cd.style.boxShadow = 'inset 0 0 15px rgba(255,145,77,0.5), 0 10px 20px rgba(0,0,0,0.8)';
          
          setTimeout(() => { 
            cd.style.transform = `translate3d(${cd.dataset.x}px, ${cd.dataset.y}px, 0) scale(1) rotate(${newRot}deg)`; 
            cd.style.borderColor = '#ffffff'; 
            cd.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
            if (albumRef.current) albumRef.current.style.filter = 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))';
          }, 800);
        };
        
        physicsCds.current.push(cd);
      }, i * 80); 
    }
  };

  const openKeyring = () => {
    if (clickTimer.current) clearTimeout(clickTimer.current);
    if (clickTooltipRef.current) clickTooltipRef.current.style.opacity = '0';

    const album = albumRef.current;
    if (album && !album.classList.contains('is-open') && !album.classList.contains('hatching')) {
      album.classList.add('hatching');
      setTimeout(() => {
        album.classList.remove('hatching');
        album.classList.add('is-open');
        scatterCDs(8);
        const nfcInput = document.getElementById('nfcNum') as HTMLInputElement;
        if (nfcInput) setTimeout(() => nfcInput.focus(), 1000);
      }, 700);
    }
  };

  const triggerPullBounce = () => {
    if (!mainSceneRef.current) return;
    const scene = mainSceneRef.current;
    scene.classList.remove('pull-bounce');
    void scene.offsetWidth; 
    scene.classList.add('pull-bounce');
  };

  const showError = (stepId: number, show: boolean) => {
    const err = document.getElementById(`err${stepId}`);
    if (err) err.style.opacity = show ? '1' : '0';
  };

  const switchStep = (from: number, to: number) => {
    const fromStep = document.getElementById(`step${from}`);
    const toStep = document.getElementById(`step${to}`);
    if (fromStep) {
      fromStep.classList.remove('active');
      if (to > from) fromStep.classList.add('completed');
      else fromStep.classList.remove('completed');
    }
    if (toStep) {
      toStep.classList.remove('completed');
      toStep.classList.add('active');
    }
    triggerPullBounce(); 
    if (to > from) setTimeout(() => scatterCDs(6), 750); 

    setTimeout(() => {
      const nextInput = toStep?.querySelector('input');
      if(nextInput) nextInput.focus();
    }, 1000); 
  };

  const nextStep = (current: number) => {
    const inputId = current === 1 ? 'nfcNum' : 'userName';
    const val = (document.getElementById(inputId) as HTMLInputElement).value.trim();
    if (!val) { showError(current, true); return; }
    showError(current, false);
    switchStep(current, current + 1);
  };

  const prevStep = (current: number) => {
    showError(current, false);
    switchStep(current, current - 1);
  };

  const formatPhoneNumber = (input: HTMLInputElement) => {
    let val = input.value.replace(/\D/g, '');
    if (val.length < 4) input.value = val;
    else if (val.length < 7) input.value = val.replace(/(\d{3})(\d+)/, '$1-$2');
    else if (val.length < 11) input.value = val.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
    else input.value = val.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
  };

  const handleAuth = async () => {
    const nfcNum = (document.getElementById('nfcNum') as HTMLInputElement).value.trim();
    const userName = (document.getElementById('userName') as HTMLInputElement).value.trim();
    const phoneNum = (document.getElementById('phoneNum') as HTMLInputElement).value.replace(/[^0-9]/g, '');

    if (!phoneNum || phoneNum.length < 10) { showError(3, true); return; }
    showError(3, false);

    const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
    submitBtn.disabled = true;

    try {
      // @ts-ignore
      const response = await window.api.verifyUser(nfcNum, userName, phoneNum);
      
      if (response.success) {
        localStorage.setItem('auth_nfc_number', nfcNum);
        localStorage.setItem('auth_name', userName);
        nfcFinal.current = nfcNum;
        triggerSuccessSequence();
      } else {
        const err3 = document.getElementById('err3');
        if (err3) err3.innerText = response.message || "정보 불일치";
        showError(3, true); submitBtn.disabled = false;
      }
    } catch (err) {
      const err3 = document.getElementById('err3');
      if (err3) err3.innerText = "서버 오류";
      showError(3, true); submitBtn.disabled = false; 
    }
  };

  const triggerSuccessSequence = () => {
    if (albumRef.current) albumRef.current.classList.remove('is-open');
    const step3 = document.getElementById('step3');
    if (step3) step3.classList.add('completed');
    
    if (albumRef.current) {
      albumRef.current.style.transition = 'transform 2s cubic-bezier(0.2, 0.8, 0.2, 1)';
      albumRef.current.style.transform = 'translateY(-40vh) scale(0.35)'; 
    }
    
    setTimeout(() => {
      let spins = 0;
      let delay = 30; 

      const runSpin = () => {
        physicsCds.current.forEach(c => { 
          c.style.borderColor = '#ffffff'; 
          c.style.zIndex = '1';
        });
        const r = Math.floor(Math.random() * physicsCds.current.length);
        const currentTarget = physicsCds.current[r];
        if (currentTarget) {
          currentTarget.style.borderColor = '#ff3b30';
          currentTarget.style.zIndex = '40';
        }
        spins++;

        if (delay > 450) { 
          executeCdInsertion(physicsCds.current[r]);
        } else {
          delay = delay * 1.09; 
          setTimeout(runSpin, delay);
        }
      };
      
      runSpin(); 
    }, 2000); 
  };

  const executeCdInsertion = (winnerCd: HTMLElement) => {
    if (!winnerCd || !albumRef.current) return;
    document.body.appendChild(winnerCd);
    winnerCd.style.zIndex = '9999';
    
    const vwCenter = window.innerWidth / 2;
    const vhCenter = window.innerHeight / 2;
    const isMobile = window.innerWidth < 650; 
    const w = parseFloat(winnerCd.style.width);
    const albumWidth = albumRef.current.offsetWidth;

    winnerCd.classList.add('winner-glow');
    albumRef.current.style.filter = 'drop-shadow(0 30px 50px rgba(0,0,0,1)) drop-shadow(0 0 30px rgba(255,145,77,0.7))';
    
    setTimeout(() => {  
      if (!isMobile) {
         const targetX = vwCenter + (albumWidth / 2) + 15; 
         winnerCd.style.transition = 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
         winnerCd.style.transform = `translate3d(${targetX}px, ${vhCenter - w/2}px, 0) scale(1) rotate(720deg)`;
      } else {
         winnerCd.style.transition = 'all 1s cubic-bezier(0.25, 1, 0.5, 1), opacity 1s ease';
         winnerCd.style.transform = `translate3d(${vwCenter - w/2}px, ${vhCenter - w/2 - 250}px, 0) scale(1) rotate(720deg)`;
         winnerCd.style.opacity = '0'; 
      }
      
      setTimeout(() => {
        if (albumRef.current) {
          albumRef.current.style.transition = 'transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
          albumRef.current.style.transform = 'translateY(0) scale(1)';
        }
        
        setTimeout(() => {
          albumRef.current?.classList.add('is-open');
          
          setTimeout(() => {
            physicsCds.current.forEach(cd => { if(cd !== winnerCd) cd.style.opacity = '0.05'; });

            if (!isMobile) {
               winnerCd.style.transition = 'all 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
               winnerCd.style.transform = `translate3d(${vwCenter - w/2}px, ${vhCenter - w/2}px, 0) scale(1) rotate(1440deg)`; 
            } else {
               winnerCd.style.transition = 'all 1.2s cubic-bezier(0.25, 1, 0.2, 1), opacity 1s ease';
               winnerCd.style.transform = `translate3d(${vwCenter - w/2}px, ${vhCenter - w/2}px, 0) scale(1) rotate(1440deg)`; 
               winnerCd.style.opacity = '1';
            }

            setTimeout(() => {
               winnerCd.classList.add('inserted-pulse');
               winnerCd.style.transition = 'none';
               winnerCd.style.top = '50%'; winnerCd.style.left = '50%';
               winnerCd.style.transform = `translate3d(-50%, -50%, 80px) scale(1) rotate(1440deg)`;
               albumRef.current?.appendChild(winnerCd);

               if (finalEnterBtnRef.current) finalEnterBtnRef.current.style.display = 'block';
               
               setTimeout(() => {
                 if (completeBubbleRef.current) completeBubbleRef.current.style.opacity = '1';
                 const pDisp = personaDisplayRef.current;
                 if (pDisp) {
                    pDisp.style.opacity = '1';
                    personaInterval.current = setInterval(() => {
                      pDisp.style.opacity = '0'; 
                      setTimeout(() => {
                        const r = Math.floor(Math.random() * personas.length);
                        pDisp.innerText = personas[r];
                        pDisp.style.opacity = '1';
                      }, 400); 
                    }, 3000);
                 }
               }, 600);
            }, 1000); 
          }, 800); 
        }, 1500); 
      }, 1200); 
    }, 2000); 
  };

  const startExitSequence = () => {
    if (finalEnterBtnRef.current) finalEnterBtnRef.current.style.opacity = '0';
    if (completeBubbleRef.current) completeBubbleRef.current.style.opacity = '0';
    if (personaDisplayRef.current) personaDisplayRef.current.style.opacity = '0';
    if (personaInterval.current) clearInterval(personaInterval.current);
    
    const album = albumRef.current;
    const scene = mainSceneRef.current;
    const winnerCd = document.querySelector('.winner-glow') as HTMLElement;

    if(winnerCd) {
       winnerCd.style.transition = 'opacity 0.4s ease';
       winnerCd.style.opacity = '0';
    }

    setTimeout(() => {
      album?.classList.remove('is-open');
      if (album) album.style.filter = 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))'; 

      setTimeout(() => {
        if (scene) {
          scene.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 1, 1)';
          scene.style.transform = 'translateY(15vh)'; 
          
          setTimeout(() => {
            scene.style.transition = 'transform 1.8s cubic-bezier(0.4, 0, 0.2, 1)';
            scene.style.transform = 'translateY(-200vh)'; 
            
            setTimeout(() => {
               localStorage.setItem('seen_interactive_v2', 'true');
               window.location.replace(`/jerrykeyring_legacy/player.html?id=${nfcFinal.current}`);
            }, 1000);
          }, 800); 
        }
      }, 600); 
    }, 400); 
  };

  return (
    <>
      <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
      <Script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" strategy="beforeInteractive" />
      <Script src="/jerrykeyring_legacy/js/api.js" strategy="afterInteractive" />

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --app-bg: #000000;
          --card-bg: rgba(30, 30, 32, 0.85);
          --primary: #ff914d;
          --text-main: #ffffff;
          --text-sub: #8e8e93;
          --border-soft: rgba(255, 255, 255, 0.1);
          --error-color: #ff3b30;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: "Pretendard Variable", sans-serif; -webkit-tap-highlight-color: transparent; }
        
        body {
          background-color: var(--app-bg); color: var(--text-main);
          height: 100vh; width: 100vw; overflow: hidden; position: relative;
        }

        .background-blur {
          position: fixed; top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle at 50% 50%, rgba(255, 145, 77, 0.08), transparent 60%);
          z-index: -1; pointer-events: none;
        }

        #cd-physics-layer {
          position: absolute; top:0; left:0; width: 100%; height: 100vh; 
          pointer-events: none; z-index: 5; overflow: hidden;
          transform-style: preserve-3d;
        }
        
        .lite-cd {
          position: absolute; top: 0; left: 0; aspect-ratio: 1/1; 
          border-radius: 50%; transform-origin: center center;
          background: linear-gradient(135deg, #f0f0f0, #d4d4d4); 
          border: 2px solid #ffffff;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.5); 
          cursor: pointer; pointer-events: auto;
          will-change: transform;
        }
        .lite-cd::after {
          content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 25%; height: 25%; border-radius: 50%; 
          background: #000;
          border: 2px solid #888;
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.9);
        }
        
        @keyframes FieryRays {
          0% { background: #ff3b30; box-shadow: 0 0 50px #ff3b30, inset 0 0 30px #ffffff; border-color: #ffb3b3; }
          33% { background: #ff5722; box-shadow: 0 0 70px #ff914d, inset 0 0 50px #ffffff; border-color: #ffebcc; }
          66% { background: #ff1493; box-shadow: 0 0 60px #ff1493, inset 0 0 40px #ffffff; border-color: #ffb3cc; }
          100% { background: #ff3b30; box-shadow: 0 0 50px #ff3b30, inset 0 0 30px #ffffff; border-color: #ffffff; }
        }
        .winner-glow, .inserted-pulse {
           animation: FieryRays 1.2s ease-in-out infinite alternate !important;
        }

        .keyring-scene {
          position: absolute; top: 0; left: 0; width: 100%; height: 100vh;
          perspective: 1500px;
          display: flex; justify-content: center; align-items: center;
          transform-origin: top center; 
          z-index: 50; transform-style: preserve-3d;
        }

        @keyframes pullBounce {
          0%   { transform: translateY(0); }
          40%  { transform: translateY(100px); } 
          75%  { transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }
        .pull-bounce { animation: pullBounce 1.5s cubic-bezier(0.4, 0, 0.2, 1); }

        .top-attachment {
          position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
          width: 40px; height: 35px; border-radius: 20px 20px 5px 5px;
          border: 4px solid #aaa; border-bottom: none;
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(150,150,150,0) 70%);
          box-shadow: inset 0 3px 5px rgba(0,0,0,0.5), 0 -2px 10px rgba(255,145,77,0.2);
          z-index: -1; 
        }
        .hole-inner {
          position: absolute; top: 7px; left: 50%; transform: translateX(-50%);
          width: 20px; height: 28px; border-radius: 10px 10px 0 0;
          background: var(--app-bg); 
          box-shadow: inset 0 5px 8px rgba(0,0,0,0.9);
        }

        #chain-beads-wrap { position: absolute; top: 15px; left: 50%; width: 0; height: 0; z-index: -2; }
        .chain-bead {
          position: absolute; width: 8px; height: 8px; border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #fff, silver, #555);
          top: calc(-4px + var(--py)); left: calc(-4px + var(--px));
          box-shadow: 0 2px 4px rgba(0,0,0,0.8);
        }
        
        @keyframes beadWobble {
          0%   { transform: translateY(0); }
          40%  { transform: translateY(-10px); } 
          75%  { transform: translateY(4px); }
          100% { transform: translateY(0); }
        }
        .pull-bounce .chain-bead { animation: beadWobble 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

        .keyring-album {
          width: 85vw; max-width: 300px; aspect-ratio: 1/1; height: auto;
          position: relative; transform-style: preserve-3d;
          transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), filter 0.8s;
          transform: translateY(-100vh); opacity: 1; 
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5));
        }

        @keyframes hatchTremble {
          0%   { transform: rotate(0deg) scale(1); }
          15%  { transform: rotate(1.5deg) scale(1.01); }
          35%  { transform: rotate(-1.5deg) scale(0.99); }
          55%  { transform: rotate(1deg) scale(1.005); }
          75%  { transform: rotate(-1deg) scale(0.995); }
          100% { transform: rotate(0deg) scale(1); }
        }
        .hatching { animation: hatchTremble 0.7s ease-in-out; }

        .album-inside {
          position: absolute; top:0; left:0; width: 100%; height: 100%;
          background: var(--card-bg);
          overflow: hidden; z-index: 1; border: 2px solid rgba(255,255,255,0.05);
          box-shadow: inset 0 0 50px rgba(0,0,0,0.95), 1px 2px 0 #cccccc, 2px 4px 0 #b3b3b3, 3px 6px 0 #999999, 4px 8px 0 #808080, 5px 10px 0 #666666, 6px 13px 15px rgba(0,0,0,0.9);
        }

        .album-cover {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          transform-origin: left center;
          transform-style: preserve-3d;
          transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), filter 1.2s;
          z-index: 10; cursor: pointer;
        }
        
        .cover-front { 
          position: absolute; top:0; left:0; width: 100%; height: 100%;
          background: #000; border: 3px solid #ff914d;
          transform: translateZ(5px); backface-visibility: hidden;
          box-shadow: 0 0 25px rgba(255,145,77,0.5), inset 0 0 15px rgba(255,145,77,0.5);
        }
        .cover-front img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
        
        .cover-back {
          position: absolute; top:0; left:0; width: 100%; height: 100%;
          background: rgba(230,230,230,0.95); border: 2px solid #bbb;
          transform: rotateY(180deg) translateZ(5px); backface-visibility: hidden;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
        }

        .cover-edge-right {
          position: absolute; top: 0; right: 0; width: 10px; height: 100%;
          background: linear-gradient(to bottom, #d4d4d4, #888); 
          transform-origin: 100% 50%; transform: rotateY(90deg) translateX(5px);
        }
        .cover-edge-top {
          position: absolute; top: 0; left: 0; width: 100%; height: 10px;
          background: #eeeeee;
          transform-origin: 50% 0%; transform: rotateX(90deg) translateY(-5px);
        }
        .cover-edge-bottom {
          position: absolute; bottom: 0; left: 0; width: 100%; height: 10px;
          background: #666666;
          transform-origin: 50% 100%; transform: rotateX(-90deg) translateY(5px);
        }

        .keyring-album.is-open { transform: translateX(12vw) scale(0.9); }
        .keyring-album.is-open .album-cover { transform: rotateY(-155deg); filter: brightness(0.65); pointer-events: none; }

        .step-wrapper {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 0 25px; opacity: 0; pointer-events: none; transform: translateX(10%);
          transition: all 0.5s ease;
        }
        .step-wrapper.active { opacity: 1; pointer-events: auto; transform: translateX(0); }
        .step-wrapper.completed { opacity: 0; pointer-events: none; transform: translateX(-10%); }

        h3 { font-size: 1.15rem; font-weight: 800; margin-bottom: 8px; text-align: center; width: 100%; }
        p { font-size: 0.8rem; color: var(--text-sub); margin-bottom: 25px; text-align: center; width: 100%; line-height: 1.3;}
        .form-inner { width: 100%; margin-top: auto; margin-bottom: auto; display: flex; flex-direction: column; align-items: center; }

        input {
          width: 100%; background: rgba(0,0,0,0.6); border: 1px solid var(--border-soft); color: #fff;
          border-radius: 8px; padding: 14px; font-size: 0.95rem; text-align: center; transition: border-color 0.3s;
        }
        input:focus { outline: none; border-color: var(--primary); }
        
        @keyframes shakeError {
          0% { transform: translateX(0); }
          20% { transform: translateX(-6px); border-color: #ff3b30; }
          40% { transform: translateX(6px); border-color: #ff3b30; }
          60% { transform: translateX(-4px); border-color: #ff3b30; }
          80% { transform: translateX(4px); border-color: #ff3b30; }
          100% { transform: translateX(0); }
        }
        .shake-error { animation: shakeError 0.4s ease-in-out; }
        .error-text { color: var(--error-color); font-size: 0.75rem; height: 18px; line-height: 18px; opacity: 0; margin-top: 5px; text-align: center; width: 100%; }
        .btn-row { display: flex; width: 100%; gap: 10px; margin-top: 15px;}
        button { flex: 1; border: none; padding: 12px; border-radius: 10px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: transform 0.1s; }
        button:active { transform: scale(0.95); }
        .btn-primary { background: linear-gradient(135deg, #ffb347, #ff914d); color: #000; }
        .btn-secondary { background: rgba(255,255,255,0.15); color: #fff; }

        .click-tooltip {
          position: fixed; top: 68vh; left: 50%; transform: translateX(-50%);
          background: #ffffff; color: #000; font-size: 0.9rem; font-weight: 800;
          padding: 10px 20px; border-radius: 20px; opacity: 0; pointer-events: none;
          transition: opacity 0.5s ease; z-index: 5000; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        }
        .click-tooltip::after {
          content: ''; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
          border-width: 8px; border-style: solid; border-color: transparent transparent #ffffff transparent;
        }

        .persona-text {
          position: fixed; bottom: 25vh; left: 50%; transform: translateX(-50%);
          background: #111111; color: #ffebcc; font-size: 0.85rem; font-weight: 600;
          padding: 8px 20px; border-radius: 20px; text-align: center; border: 1px solid rgba(255,145,77,0.3);
          transition: opacity 0.4s ease; box-shadow: 0 5px 15px rgba(0,0,0,0.8); 
          z-index: 6000; opacity: 0; pointer-events: none; width: max-content;
        }

        .speech-container {
          position: fixed; bottom: 18vh; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          pointer-events: none; opacity: 0; transition: opacity 1s; z-index: 5000; width: max-content;
        }
        .speech-bubble {
          background: rgba(255,255,255,0.95); color: #000; font-size: 0.95rem; font-weight: 800;
          padding: 12px 25px; border-radius: 20px; box-shadow: 0 10px 25px rgba(255,145,77,0.3); position: relative;
        }
        .speech-bubble::after {
          content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
          border-width: 10px; border-style: solid; border-color: rgba(255,255,255,0.95) transparent transparent transparent;
        }

        #finalEnterBtn {
          position: fixed; bottom: 8vh; left: 50%; transform: translateX(-50%); width: 80%; max-width: 300px;
          display: none; padding: 18px; font-size: 1.1rem; z-index: 5000;
          border-radius: 30px; box-shadow: 0 10px 30px rgba(255,145,77,0.5);
        }

        @media (max-width: 650px) {
          .persona-text { top: 10vh; bottom: auto; }
        }
      ` }} />

      <div className="background-blur"></div>
      <div ref={clickTooltipRef} id="clickTooltip" className="click-tooltip">키링을 탭하여 열어보세요</div>
      <div ref={personaDisplayRef} className="persona-text" id="personaDisplay">다양한 사람들의 이야기가 담겨있어요.</div>

      <div ref={completeBubbleRef} className="speech-container" id="completeBubble">
        <div className="speech-bubble">완성된 당신의 음악은?</div>
      </div>
      
      <button ref={finalEnterBtnRef} id="finalEnterBtn" className="btn-primary" onClick={startExitSequence}>시작하기</button>

      <div ref={cdLayerRef} id="cd-physics-layer"></div>

      <div ref={mainSceneRef} className="keyring-scene" id="mainScene">
        <div ref={albumRef} className="keyring-album" id="keyringAlbum">
          
          <div className="top-attachment">
             <div className="hole-inner"></div>
             <div ref={chainBeadsWrapRef} id="chain-beads-wrap"></div>
          </div>

          <div className="album-inside">
            <div className="step-wrapper active" id="step1">
              <div className="form-inner">
                <h3>NFC 번호</h3>
                <p>NFC 스티커 번호 입력하세요.</p>
                <input type="number" id="nfcNum" placeholder="예: 1" onKeyDown={(e) => {if(e.key==='Enter') nextStep(1)}} />
                <div className="error-text" id="err1">코드를 입력해주세요.</div>
                <div className="btn-row"><button className="btn-primary" onClick={() => nextStep(1)}>다음</button></div>
              </div>
            </div>
            <div className="step-wrapper" id="step2">
              <div className="form-inner">
                <h3>신청자명</h3>
                <p>이름(별칭)을 기입하세요.</p>
                <input type="text" id="userName" placeholder="이름 입력" onKeyDown={(e) => {if(e.key==='Enter') nextStep(2)}} />
                <div className="error-text" id="err2">이름을 입력해주세요.</div>
                <div className="btn-row">
                  <button className="btn-secondary" onClick={() => prevStep(2)}>이전</button>
                  <button className="btn-primary" onClick={() => nextStep(2)}>다음</button>
                </div>
              </div>
            </div>
            <div className="step-wrapper" id="step3">
              <div className="form-inner">
                <h3>본인 인증</h3>
                <p>신청한 전화번호를 기입하세요.</p>
                <input type="tel" id="phoneNum" placeholder="010-1234-5678" onInput={(e) => formatPhoneNumber(e.currentTarget)} onKeyDown={(e) => {if(e.key==='Enter') handleAuth()}} />
                <div className="error-text" id="err3">번호를 입력해주세요.</div>
                <div className="btn-row">
                  <button className="btn-secondary" onClick={() => prevStep(3)}>이전</button>
                  <button className="btn-primary" id="submitBtn" onClick={handleAuth}>완료</button>
                </div>
              </div>
            </div>
          </div>

          <div className="album-cover" onClick={openKeyring}>
            <div className="cover-front">
              <img src="/jerrykeyring_legacy/sumbnail.png" alt="앨범" />
            </div>
            <div className="cover-back"></div>
            <div className="cover-edge-right"></div>
            <div className="cover-edge-top"></div>
            <div className="cover-edge-bottom"></div>
          </div>
        </div>
      </div>
    </>
  );
}
