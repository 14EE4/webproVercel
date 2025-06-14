// Vercel API 연동용 (fetch 경로는 동일)
  async function loadThreads() {
    const res = await fetch('/api/threads');
    const threads = await res.json();
    const threadsDiv = document.getElementById('threads');
    threadsDiv.innerHTML = '';
    threads.forEach((t, i) => {
      const div = document.createElement('div');
      div.innerHTML = `<b>${i + 1}. ${t.title}</b> by ${t.name} <br>${t.content}<hr>`;
      threadsDiv.appendChild(div);
    });
  }

  function showTab(tab) {
    // 모든 섹션 숨기기
    ['school', 'dept', 'dormi', 'meal', 'thread', 'draw','shuttlebus'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    // 모든 버튼 비활성화
    ['quick-school', 'quick-dept', 'quick-dormi', 'quick-meal', 'quick-thread', 'quick-draw','quick-shuttlebus'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.style.display = '';
        btn.classList.remove('active');
      }
    });
    // 해당 섹션/버튼만 보이기
    document.getElementById(tab).style.display = 'block';
    const quickBtn = document.getElementById('quick-' + tab);
    if (quickBtn) quickBtn.classList.add('active');
    // 쓰레드면 불러오기
    if(tab === 'thread') loadThreads();
  }

  async function addThread(event) {
    event.preventDefault();
    const name = document.getElementById('thread-name').value.trim() || 'Anonymous';
    const title = document.getElementById('thread-title').value.trim() || " ";
    const content = document.getElementById('thread-content').value.trim();
    let image = null;
    // 그림판 그림 가져오기 체크 시 draw 캔버스의 이미지를 가져옴
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
    document.getElementById('attach-draw').checked = false;
    loadThreads();
  }

  // 최초 진입시 쓰레드 탭이면 불러오기
  if(document.getElementById('thread').style.display === 'block') loadThreads();

  // 그림판 간단한 기능
  const canvas = document.getElementById('paint-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let drawing = false;
    canvas.addEventListener('mousedown', e => {
      drawing = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    });
    canvas.addEventListener('mousemove', e => {
      if (drawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      }
    });
    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mouseleave', () => drawing = false);
  }
  function clearCanvas() {
    const canvas = document.getElementById('paint-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
