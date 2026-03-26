(function () {
    if (window.__horseOverlayLoaded) return;
    window.__horseOverlayLoaded = true;

    const style = document.createElement("style");
    style.textContent = `
    #horseOverlay {
      position: fixed;
      bottom: 20px;
      left: 0;
      right: 0;
      z-index: 999999;
      display: flex;
      justify-content: space-between;
      padding: 0 20px;
      pointer-events: none;
      font-family: Schoolbell, cursive;
    }

    .horsePanel {
      padding: 6px 10px;
      background: rgba(0,0,0,0.7);
      color: white;
      border-radius: 8px;
      min-width: 60px;
      text-align: center;
      font-size: 18px;
      pointer-events: auto;
    }

    #horsePrev, #horseNext {
      position: fixed;
      top: 6%;
      z-index: 999999;
      cursor: pointer;
      background: #1B6B3A;
      color: #BBD3C4;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 18px;
    }

    #horsePrev { left: 20px; }
    #horseNext { right: 20px; }

    @media (max-width: 700px) {
      #horsePrev, #horseNext {
        top: 9%;
        font-size: 16px;
        padding: 8px 10px;
      }
    }
  `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "horseOverlay";
    overlay.innerHTML = `
    <div id="horseScore" class="horsePanel">Loading score...</div>
    <div id="horseTimer" class="horsePanel">00:00</div>
  `;
    document.body.appendChild(overlay);

    const prev = document.createElement("div");
    prev.id = "horsePrev";
    prev.textContent = "< Prev";
    document.body.appendChild(prev);

    const next = document.createElement("div");
    next.id = "horseNext";
    next.textContent = "Next >";
    document.body.appendChild(next);

    // Timer
    let seconds = 0;
    let running = true;
    const timerEl = document.getElementById("horseTimer");

    setInterval(() => {
        if (!running) return;
        seconds++;
        const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
        const secs = String(seconds % 60).padStart(2, "0");
        timerEl.textContent = `${mins}:${secs}`;
    }, 1000);

    timerEl.onclick = () => {
        running = !running;
        timerEl.style.opacity = running ? "1" : "0.5";
    };

    function getDateFromURL() {
        const parts = location.pathname.split("/");
        return parts[2];
    }

    function goDay(offset) {
        const d = new Date(getDateFromURL());
        d.setDate(d.getDate() + offset);
        const newDate = d.toISOString().slice(0, 10);
        location.href = `/play/${newDate}`;
    }

    prev.onclick = () => {
        seconds = 0;
        goDay(-1);
    };

    next.onclick = () => {
        seconds = 0;
        goDay(1);
    };

    async function loadScore() {
        try {
            const date = getDateFromURL();

            const dailyRes = await fetch(`/api/daily/${date}`);
            const daily = await dailyRes.json();

            const statsRes = await fetch(`/api/levels/${daily.id}/stats`);
            const stats = await statsRes.json();

            document.getElementById("horseScore").innerText =
                "Optimal: " + stats.optimalScore;
        } catch (e) {
            console.log("score failed", e);
        }
    }

    loadScore();
})();