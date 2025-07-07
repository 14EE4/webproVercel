// Vercel API 연동용 (fetch 경로는 동일)
async function loadThreads() {
  const res = await fetch('/api/threads');
  const threads = await res.json();
  const threadsDiv = document.getElementById('threads');
  threadsDiv.innerHTML = '';
  threads.forEach((t, i) => {
    // 전체 개수에서 현재 인덱스를 빼서 번호 부여
    const number = threads.length - i;
    const threadEl = document.createElement('div');
    threadEl.className = 'thread';
    threadEl.innerHTML = `
      <div class="thread-meta">${number}. ${t.name} | ${t.created_at}</div>
      <strong>${t.title}</strong>
      <p>${t.content}</p>
      ${t.image ? `<div style="margin-top:1rem;"><img src="${t.image}" style="max-width:100%;border:1px solid #ccc;"></div>` : ''}
    `;
    threadsDiv.appendChild(threadEl);
  });
}

function showTab(tab) {
  // 모든 주요 섹션 숨기기
  ['school', 'dept', 'dormi', 'meal', 'draw', 'shuttlebus','student-meal', 'minesweeper'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  // thread-outer(스레드 전체 컨테이너)도 숨기기
  const threadOuter = document.querySelector('.thread-outer');
  if (threadOuter) threadOuter.style.display = 'none';

  // 모든 사이드바 버튼 비활성화
  ['quick-school', 'quick-dept', 'quick-dormi', 'quick-meal', 'quick-thread', 'quick-draw', 'quick-shuttlebus',"quick-student-meal", 'quick-minesweeper'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });

  // 해당 섹션/버튼만 보이기
  if (tab === 'thread') {
    if (threadOuter) threadOuter.style.display = 'block';
    loadThreads();
  } else {
    const el = document.getElementById(tab);
    if (el) el.style.display = 'block';
  }
  const quickBtn = document.getElementById('quick-' + tab);
  if (quickBtn) quickBtn.classList.add('active');
}

async function addThread(event) {
  event.preventDefault();
  const name = document.getElementById('thread-name').value.trim() || 'Anonymous';
  const title = document.getElementById('thread-title').value.trim() || " ";
  const content = document.getElementById('thread-content').value.trim();
  
  // 이미지 URL 입력 필드에서 값을 가져옵니다.
  let image = document.getElementById('image').value.trim();

  // 그림판 그림 가져오기 체크 시 draw 캔버스의 이미지를 가져와 우선 적용
  if (document.getElementById('attach-draw').checked) {
    const drawCanvas = document.getElementById('paint-canvas');
    if (drawCanvas) {
      image = drawCanvas.toDataURL('image/png');
    }
  }

  if (!content) return;
  await fetch('/api/threads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, title, content, image })
  });
  document.getElementById('thread-name').value = '';
  document.getElementById('thread-title').value = '';
  document.getElementById('thread-content').value = '';
  document.getElementById('image').value = ''; // 이미지 URL 필드 초기화
  document.getElementById('attach-draw').checked = false;
  loadThreads();
}

// 페이지 진입 시 기본 탭(예: 학교 공지) 열기
window.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('menu-overlay');

  function openMenu() {
    sidebar.classList.add('open');
    document.body.classList.add('menu-open');
    overlay.style.display = 'block';
  }
  function closeMenu() {
    sidebar.classList.remove('open');
    document.body.classList.remove('menu-open');
    overlay.style.display = 'none';
  }

  menuBtn.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener('click', closeMenu);

  // 메뉴 클릭 시 자동 닫기 (모바일에서만)
  sidebar.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 900) closeMenu();
    });
  });

  // 기본 탭 열기
  showTab('thread'); // 처음 화면을 스레드로 설정


  // 그림판 초기화
  const canvas = document.getElementById('paint-canvas');
  const colorInput = document.getElementById('draw-color');
  const widthInput = document.getElementById('draw-width');
  const widthValue = document.getElementById('draw-width-value');
  if (canvas && colorInput && widthInput && widthValue) {
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let color = colorInput.value;
    let lineWidth = parseInt(widthInput.value, 10);

    colorInput.addEventListener('input', () => {
      color = colorInput.value;
    });
    widthInput.addEventListener('input', () => {
      lineWidth = parseInt(widthInput.value, 10);
      widthValue.textContent = lineWidth;
    });

    // 마우스 이벤트
    canvas.addEventListener('mousedown', e => {
      drawing = true;
      const pos = getCanvasPos(canvas, e.clientX, e.clientY);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    });
    canvas.addEventListener('mousemove', e => {
      if (drawing) {
        const pos = getCanvasPos(canvas, e.clientX, e.clientY);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    });
    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mouseleave', () => drawing = false);

    // 터치 이벤트 (모바일)
    function getCanvasPos(canvas, clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    canvas.addEventListener('touchstart', function(e) {
      e.preventDefault();
      drawing = true;
      const touch = e.touches[0];
      const pos = getCanvasPos(canvas, touch.clientX, touch.clientY);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }, { passive: false });

    canvas.addEventListener('touchmove', function(e) {
      if (!drawing) return;
      e.preventDefault();
      const touch = e.touches[0];
      const pos = getCanvasPos(canvas, touch.clientX, touch.clientY);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }, { passive: false });

    canvas.addEventListener('touchend', function(e) {
      drawing = false;
    });
    canvas.addEventListener('touchcancel', function(e) {
      drawing = false;
    });
  }
});

function clearCanvas() {
  const canvas = document.getElementById('paint-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}