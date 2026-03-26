(function () {
    if (window.__horseOverlayLoaded) return;
    window.__horseOverlayLoaded = true;

    const bottomContainer = document.getElementById("bottomContainer");
    const firstStatsRow = bottomContainer?.querySelector(".stats-row");
    const gridStats = document.getElementById("gridStats");
    const wallsStat = document.getElementById("wallsStat");
    if (!bottomContainer || !firstStatsRow || !gridStats || !wallsStat) {
        console.warn("Horse overlay: required elements not found");
        return;
    }

    // ===== Create Optimal Row =====
    const optimalRow = document.createElement("div");
    optimalRow.className = "stats-row";
    optimalRow.style.marginTop = "0px";
    optimalRow.style.width = gridStats.offsetWidth + "px"; // match gridStats width
    optimalRow.style.justifyContent = "flex-start";

    const optimalEl = document.createElement("div");
    optimalEl.id = "horseOptimal";
    optimalEl.style.fontFamily = "Schoolbell, cursive";
    optimalEl.style.fontSize = "16px";
    optimalEl.style.pointerEvents = "none";

    optimalRow.appendChild(optimalEl);
    bottomContainer.insertBefore(optimalRow, firstStatsRow.nextSibling);

    // ===== Create Timer inside gridStats =====
    const timerEl = document.createElement("div");
    timerEl.id = "horseTimer";
    timerEl.style.fontFamily = "Schoolbell, cursive";
    timerEl.style.fontSize = "16px";
    timerEl.style.color = "#BBD3C4";
    timerEl.style.textAlign = "center";
    timerEl.style.flex = "1"; // take remaining space
    timerEl.style.pointerEvents = "none";

    // Insert after wallsStat
    wallsStat.insertAdjacentElement("afterend", timerEl);

    // ===== Timer Logic =====
    let seconds = 0;
    let running = true;
    function updateTimer() {
        if (!running) return;
        seconds++;
        const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
        const secs = String(seconds % 60).padStart(2, "0");
        timerEl.textContent = `${mins}:${secs}`;
    }
    setInterval(updateTimer, 1000);

    timerEl.onclick = () => {
        running = !running;
        timerEl.style.opacity = running ? "1" : "0.5";
    };

    // ===== Get current date safely =====
    function getDateFromURL() {
        const match = location.pathname.match(/\/play\/(\d{4}-\d{2}-\d{2})/);
        if (match) return match[1];
        return new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Jerusalem",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date());
    }

    // ===== Load Optimal Score with Bonus =====
    async function loadScore() {
        try {
            const date = getDateFromURL();
            const dailyRes = await fetch(`/api/daily/${date}`);
            const daily = await dailyRes.json();

            const statsRes = await fetch(`/api/levels/${daily.id}/stats`);
            const stats = await statsRes.json();

            let text = `Optimal: ${stats.optimalScore}`;

            if (daily.hasBonus) {
                const bonusRes = await fetch(`/api/daily/bonus/${daily.id}`);
                const bonusData = await bonusRes.json();
                optimalEl.innerHTML = `Optimal: ${stats.optimalScore} | <span style="color:#E8B8D0">Bonus: ${bonusData.optimalScore}</span>`;
            } else {
                optimalEl.textContent = text;
            }

        } catch (e) {
            console.log("score failed", e);
            optimalEl.textContent = "Optimal: N/A";
        }
    }

    loadScore();
})();