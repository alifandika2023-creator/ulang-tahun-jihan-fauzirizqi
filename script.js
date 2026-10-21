
document.addEventListener("DOMContentLoaded", () => {

    /* ==================================
       PENGATURAN
    ================================== */

    // GANTI PIN SESUAI KEINGINAN
    const SECRET_PIN = "1234";

    const $ = id => document.getElementById(id);

    const pages = [
        "beranda",
        "kenangan",
        "galeri",
        "surat",
        "harapan"
    ];

    let isUnlocked = false;
    let pinAccepted = false;
    let mazeCompleted = false;

    /* ==================================
       CONFETTI
    ================================== */

    function launchConfetti(amount = 100) {
        const container = $("confetti");
        const colors = [
            "#bd7895", "#e2afc2", "#f2d5df",
            "#9d5878", "#e7c18b", "#ffffff"
        ];

        for (let i = 0; i < amount; i++) {
            const piece = document.createElement("span");

            piece.className = "confetti-piece";
            piece.style.left = Math.random() * 100 + "%";
            piece.style.background =
                colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDuration =
                (3 + Math.random() * 3) + "s";
            piece.style.animationDelay =
                Math.random() * 1.2 + "s";

            container.appendChild(piece);
            setTimeout(() => piece.remove(), 7500);
        }
    }

    /* ==================================
       PIN RAHASIA
    ================================== */

    const pinScreen = $("pinScreen");
    const pinBox = $("pinBox");
    const pinError = $("pinError");
    const pinDots = document.querySelectorAll("#pinDots span");

    let enteredPin = "";
    let pinBusy = false;

    function updatePinDots() {
        pinDots.forEach((dot, index) => {
            dot.classList.toggle(
                "filled",
                index < enteredPin.length
            );
        });
    }

    function checkPin() {
        if (enteredPin === SECRET_PIN) {
            pinBusy = true;
            pinAccepted = true;

            pinError.textContent =
                "PIN benar! Ada tantangan kecil untukmu ♡";

            pinScreen.classList.add("success");

            setTimeout(() => {
                startMaze();

                $("mazeScreen").classList.remove("hidden");
                pinScreen.classList.add("unlocked");
            }, 1100);

        } else {
            pinBusy = true;

            pinError.textContent =
                "PIN belum benar, coba lagi ya ♡";

            pinBox.classList.remove("shake");
            void pinBox.offsetWidth;
            pinBox.classList.add("shake");

            setTimeout(() => {
                enteredPin = "";
                pinBusy = false;
                updatePinDots();
                pinBox.classList.remove("shake");
            }, 550);
        }
    }

    function enterPin(number) {
        if (pinBusy || pinAccepted ||
            enteredPin.length >= 4) return;

        enteredPin += number;
        pinError.textContent = "";
        updatePinDots();

        if (enteredPin.length === 4) {
            checkPin();
        }
    }

    document.querySelectorAll("[data-pin]").forEach(button => {
        button.addEventListener("click", () => {
            enterPin(button.dataset.pin);
        });
    });

    $("pinDelete").addEventListener("click", () => {
        if (pinBusy || pinAccepted) return;

        enteredPin = enteredPin.slice(0, -1);
        pinError.textContent = "";
        updatePinDots();
    });

    $("pinClear").addEventListener("click", () => {
        if (pinBusy || pinAccepted) return;

        enteredPin = "";
        pinError.textContent = "";
        updatePinDots();
    });

    /* ==================================
       MINI GAME LABIRIN MENUJU HATIKU
    ================================== */

    const mazeScreen = $("mazeScreen");
    const mazeGrid = $("mazeGrid");
    const mazeMessage = $("mazeMessage");
    const mazeWin = $("mazeWin");

    const MAZE_SIZE = 11;

    let maze = [];
    let player = { row: 1, col: 1 };
    const goal = {
        row: MAZE_SIZE - 2,
        col: MAZE_SIZE - 2
    };

    let mazeMoves = 0;

    // Mengacak urutan pilihan arah
    function shuffle(items) {
        const result = [...items];

        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [result[i], result[j]] =
                [result[j], result[i]];
        }

        return result;
    }

    // Membuat labirin menggunakan depth-first search.
    // Jalur dari titik awal ke tujuan selalu tersedia.
    function generateMaze() {
        maze = Array.from(
            { length: MAZE_SIZE },
            () => Array(MAZE_SIZE).fill(1)
        );

        const stack = [[1, 1]];
        maze[1][1] = 0;

        const directions = [
            [-2, 0],
            [2, 0],
            [0, -2],
            [0, 2]
        ];

        while (stack.length > 0) {
            const [row, col] = stack[stack.length - 1];

            const choices = shuffle(directions).filter(
                ([dr, dc]) => {
                    const nr = row + dr;
                    const nc = col + dc;

                    return (
                        nr > 0 &&
                        nr < MAZE_SIZE - 1 &&
                        nc > 0 &&
                        nc < MAZE_SIZE - 1 &&
                        maze[nr][nc] === 1
                    );
                }
            );

            if (choices.length === 0) {
                stack.pop();
                continue;
            }

            const [dr, dc] = choices[0];

            maze[row + dr / 2][col + dc / 2] = 0;
            maze[row + dr][col + dc] = 0;

            stack.push([row + dr, col + dc]);
        }

        player = { row: 1, col: 1 };
        mazeMoves = 0;
        mazeCompleted = false;
    }

    function renderMaze() {
        mazeGrid.innerHTML = "";
        mazeGrid.style.setProperty(
            "--maze-columns",
            MAZE_SIZE
        );

        for (let row = 0; row < MAZE_SIZE; row++) {
            for (let col = 0; col < MAZE_SIZE; col++) {
                const cell = document.createElement("div");

                cell.className = "maze-cell";

                if (maze[row][col] === 1) {
                    cell.classList.add("wall");
                } else {
                    cell.classList.add("path");
                }

                const isGoal =
                    row === goal.row &&
                    col === goal.col;

                const isPlayer =
                    row === player.row &&
                    col === player.col;

                if (isGoal) {
                    cell.classList.add("goal");
                    cell.textContent = "🎁";
                }

                if (isPlayer) {
                    cell.classList.add("player");
                    cell.textContent = "♡";
                }

                mazeGrid.appendChild(cell);
            }
        }
    }

    function startMaze() {
        generateMaze();
        renderMaze();

        mazeWin.classList.add("hidden");

        mazeMessage.textContent =
            "Temukan hadiah 🎁 menggunakan tombol arah!";

        document.querySelector(".maze-controls")
            .classList.remove("hidden");
    }

    function movePlayer(direction) {
        if (!pinAccepted || isUnlocked ||
            mazeCompleted || mazeScreen.classList.contains("hidden")) {
            return;
        }

        const moves = {
            up: [-1, 0],
            down: [1, 0],
            left: [0, -1],
            right: [0, 1]
        };

        const movement = moves[direction];

        if (!movement) return;

        const nextRow = player.row + movement[0];
        const nextCol = player.col + movement[1];

        if (
            nextRow < 0 ||
            nextRow >= MAZE_SIZE ||
            nextCol < 0 ||
            nextCol >= MAZE_SIZE ||
            maze[nextRow][nextCol] === 1
        ) {
            mazeMessage.textContent =
                "Ups, ada tembok! Coba jalan yang lain ♡";
            return;
        }

        player.row = nextRow;
        player.col = nextCol;
        mazeMoves++;

        renderMaze();

        if (
            player.row === goal.row &&
            player.col === goal.col
        ) {
            finishMaze();
        } else {
            mazeMessage.textContent =
                "Bagus, sayang! Terus cari hadiahnya ♡";
        }
    }

    function finishMaze() {
        mazeCompleted = true;

        mazeMessage.textContent =
            "Kamu berhasil menemukan hadiah dari Alif! ♡";

        mazeWin.classList.remove("hidden");

        document.querySelector(".maze-controls")
            .classList.add("hidden");

        launchConfetti(170);
    }

    document.querySelectorAll("[data-direction]").forEach(button => {
        button.addEventListener("click", () => {
            movePlayer(button.dataset.direction);
        });
    });

    $("resetMaze").addEventListener("click", () => {
        if (!pinAccepted || isUnlocked) return;
        startMaze();
    });

    $("enterWebsite").addEventListener("click", () => {
        if (!mazeCompleted || !pinAccepted) return;

        isUnlocked = true;
        document.body.classList.remove("locked");

        mazeScreen.classList.add("hidden");

        // Paksa mulai dari Beranda
        if (location.hash !== "#beranda") {
            location.hash = "beranda";
        }

        showPage("beranda");
        launchConfetti(200);
    });

    // Keyboard untuk PIN dan labirin
    document.addEventListener("keydown", event => {
        if (!pinAccepted) {
            if (/^[0-9]$/.test(event.key)) {
                enterPin(event.key);
            }

            if (event.key === "Backspace" && !pinBusy) {
                enteredPin = enteredPin.slice(0, -1);
                updatePinDots();
            }

            if (event.key === "Escape" && !pinBusy) {
                enteredPin = "";
                updatePinDots();
            }

            return;
        }

        if (!isUnlocked) {
            const keys = {
                ArrowUp: "up",
                ArrowDown: "down",
                ArrowLeft: "left",
                ArrowRight: "right",
                w: "up",
                s: "down",
                a: "left",
                d: "right"
            };

            const direction = keys[event.key];

            if (direction) {
                event.preventDefault();
                movePlayer(direction);
            }
        }
    });

    /* ==================================
       NAVIGASI
    ================================== */

    const nav = $("nav");
    const menuToggle = $("menuToggle");
    const navLinks = document.querySelectorAll("#nav a");
    const sections = document.querySelectorAll(".page");

    function showPage(name) {
        if (!pages.includes(name)) {
            name = "beranda";
        }

        sections.forEach(section => {
            section.classList.toggle(
                "active",
                section.id === name
            );
        });

        navLinks.forEach(link => {
            link.classList.toggle(
                "active",
                link.getAttribute("href") === "#" + name
            );
        });

        nav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");

        window.scrollTo(0, 0);

        if (name === "beranda") {
            typeQuote();
        }

        requestAnimationFrame(refreshScrollAnimation);
    }

    function navigate(name) {
        if (!isUnlocked || !pages.includes(name)) return;

        if (location.hash === "#" + name) {
            showPage(name);
        } else {
            location.hash = name;
        }
    }

    navLinks.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            navigate(link.getAttribute("href").slice(1));
        });
    });

    document.querySelector(".logo").addEventListener(
        "click",
        event => {
            event.preventDefault();
            navigate("beranda");
        }
    );

    document.querySelectorAll("[data-go]").forEach(button => {
        button.addEventListener("click", () => {
            navigate(button.dataset.go);
        });
    });

    menuToggle.addEventListener("click", () => {
        if (!isUnlocked) return;

        const open = nav.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(open));
    });

    window.addEventListener("hashchange", () => {
        if (!isUnlocked) return;
        showPage(location.hash.slice(1));
    });

    /* ==================================
       PEMUTAR MUSIK DENGAN FOTO
    ================================== */

    const music = $("music");
    const musicBtn = $("musicBtn");
    const musicPlayer = $("musicPlayer");
    const musicControl = $("musicControl");
    const musicProgress = $("musicProgress");
    const musicProgressFill = $("musicProgressFill");
    const currentTimeText = $("currentTime");
    const durationText = $("duration");

    music.volume = 0.45;

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return "0:00";

        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return minutes + ":" + String(secs).padStart(2, "0");
    }

    async function toggleMusic() {
        if (!isUnlocked) return;

        if (music.paused) {
            try {
                await music.play();
            } catch (error) {
                console.log("Musik tidak bisa diputar:", error);
            }
        } else {
            music.pause();
        }
    }

    function updateMusicUI() {
        const playing = !music.paused;

        musicBtn.classList.toggle("playing", playing);
        musicPlayer.classList.toggle("playing", playing);

        musicBtn.textContent = "♫";
        musicControl.textContent = playing ? "Ⅱ" : "▶";

        musicControl.setAttribute(
            "aria-label",
            playing ? "Jeda musik" : "Putar musik"
        );
    }

    musicBtn.addEventListener("click", async () => {
        if (!isUnlocked) return;

        const willOpen =
            !musicPlayer.classList.contains("show");

        musicPlayer.classList.toggle("show", willOpen);

        musicBtn.setAttribute(
            "aria-expanded",
            String(willOpen)
        );

        if (willOpen && music.paused) {
            await toggleMusic();
        }
    });

    musicControl.addEventListener("click", toggleMusic);

    function updateMusicProgress() {
        currentTimeText.textContent =
            formatTime(music.currentTime);

        durationText.textContent =
            formatTime(music.duration);

        if (
            Number.isFinite(music.duration) &&
            music.duration > 0
        ) {
            const percentage =
                (music.currentTime / music.duration) * 100;

            musicProgressFill.style.width =
                percentage + "%";

            musicProgress.setAttribute(
                "aria-valuenow",
                String(Math.round(percentage))
            );
        }
    }

    music.addEventListener(
        "loadedmetadata",
        updateMusicProgress
    );

    music.addEventListener(
        "timeupdate",
        updateMusicProgress
    );

    musicProgress.addEventListener("click", event => {
        if (
            !Number.isFinite(music.duration) ||
            music.duration <= 0
        ) return;

        const rect = musicProgress.getBoundingClientRect();

        const ratio = Math.max(
            0,
            Math.min(
                1,
                (event.clientX - rect.left) / rect.width
            )
        );

        music.currentTime = ratio * music.duration;
    });

    musicProgress.addEventListener("keydown", event => {
        if (
            !Number.isFinite(music.duration) ||
            music.duration <= 0
        ) return;

        if (event.key === "ArrowRight") {
            event.preventDefault();

            music.currentTime = Math.min(
                music.duration,
                music.currentTime + 5
            );
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();

            music.currentTime = Math.max(
                0,
                music.currentTime - 5
            );
        }
    });

    music.addEventListener("play", updateMusicUI);
    music.addEventListener("pause", updateMusicUI);

    document.addEventListener("click", event => {
        if (!event.target.closest(".music-wrapper")) {
            musicPlayer.classList.remove("show");

            musicBtn.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    });

    updateMusicUI();

    /* ==================================
       ANIMASI QUOTE MENGETIK
    ================================== */

    const typedQuote = $("typedQuote");

    const quote =
        "Di antara banyak hal indah di dunia, " +
        "mengenalmu adalah salah satu hal " +
        "yang paling kusyukuri. " +
        "Terima kasih sudah menjadi bagian " +
        "dari cerita hidupku.";

    let typingInterval;

    function typeQuote() {
        clearInterval(typingInterval);

        typedQuote.textContent = "";

        let index = 0;

        typingInterval = setInterval(() => {
            if (index < quote.length) {
                typedQuote.textContent += quote[index];
                index++;
            } else {
                clearInterval(typingInterval);
            }
        }, 38);
    }

    /* ==================================
       HATI MELAYANG
    ================================== */

    const hearts = $("hearts");

    function createHeart() {
        if (document.hidden || !isUnlocked) return;

        const heart = document.createElement("span");
        const symbols = ["♡", "♥", "❤"];

        heart.className = "floating-heart";

        heart.textContent =
            symbols[Math.floor(Math.random() * symbols.length)];

        heart.style.left = Math.random() * 100 + "%";
        heart.style.fontSize =
            (12 + Math.random() * 22) + "px";
        heart.style.animationDuration =
            (7 + Math.random() * 7) + "s";

        hearts.appendChild(heart);
        setTimeout(() => heart.remove(), 15000);
    }

    setInterval(createHeart, 850);

    /* ==================================
       ANIMASI SCROLL
    ================================== */

    const scrollItems = document.querySelectorAll(
        ".memory, .photo"
    );

    const timeline = document.querySelector(".timeline");

    const revealObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                const page = entry.target.closest(".page");

                entry.target.classList.toggle(
                    "show",
                    entry.isIntersecting &&
                    page.classList.contains("active")
                );
            });
        },
        {
            threshold: 0.15,
            rootMargin: "0px 0px -30px 0px"
        }
    );

    scrollItems.forEach(item => {
        revealObserver.observe(item);
    });

    function updateTimeline() {
        if (!timeline) return;

        const page = timeline.closest(".page");

        if (!page.classList.contains("active")) return;

        const rect = timeline.getBoundingClientRect();
        const distance = rect.height + window.innerHeight;
        const travelled = window.innerHeight - rect.top;

        const progress = Math.max(
            0,
            Math.min(1, travelled / distance)
        );

        timeline.style.setProperty(
            "--timeline-progress",
            progress
        );
    }

    function refreshScrollAnimation() {
        scrollItems.forEach(item => {
            const page = item.closest(".page");

            if (!page.classList.contains("active")) {
                item.classList.remove("show");
                return;
            }

            const rect = item.getBoundingClientRect();

            const visible =
                rect.width > 0 &&
                rect.height > 0 &&
                rect.top < window.innerHeight - 30 &&
                rect.bottom > 0;

            item.classList.toggle("show", visible);
        });

        updateTimeline();
    }

    let scrollScheduled = false;

    window.addEventListener("scroll", () => {
        if (scrollScheduled) return;

        scrollScheduled = true;

        requestAnimationFrame(() => {
            refreshScrollAnimation();
            scrollScheduled = false;
        });
    }, { passive: true });

    window.addEventListener(
        "resize",
        refreshScrollAnimation
    );

    /* ==================================
       GALERI FOTO
    ================================== */

    const lightbox = $("lightbox");
    const lightboxImg = $("lightboxImg");

    document.querySelectorAll(".photo").forEach(photo => {
        photo.addEventListener("click", () => {
            const image = photo.querySelector("img");

            lightboxImg.src = image.src;
            lightboxImg.alt = image.alt;

            lightbox.classList.remove("hidden");
        });
    });

    function closePhoto() {
        lightbox.classList.add("hidden");
        lightboxImg.removeAttribute("src");
    }

    $("closeLightbox").addEventListener("click", closePhoto);

    lightbox.addEventListener("click", event => {
        if (event.target === lightbox) {
            closePhoto();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && isUnlocked) {
            closePhoto();
        }
    });

    /* ==================================
       SURAT CINTA
    ================================== */

    const envelope = $("envelope");
    const letter = $("letter");

    $("openLetter").addEventListener("click", () => {
        envelope.classList.add("hidden");
        letter.classList.remove("hidden");
        launchConfetti(50);
    });

    $("closeLetter").addEventListener("click", () => {
        letter.classList.add("hidden");
        envelope.classList.remove("hidden");
    });

    /* ==================================
       SISTEM LIMA KEJUTAN
    ================================== */

    let unlockedStep = 1;

    const stepIndicators =
        document.querySelectorAll("#steps span");

    function showStep(step) {
        if (step < 1 || step > unlockedStep) return;

        document.querySelectorAll(".wish-step").forEach(panel => {
            panel.classList.remove("active");
        });

        $("step" + step).classList.add("active");

        stepIndicators.forEach((indicator, index) => {
            const number = index + 1;

            indicator.classList.toggle(
                "current",
                number === step
            );

            indicator.classList.toggle(
                "done",
                number < step
            );
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function nextStep(step) {
        unlockedStep = Math.max(unlockedStep, step);
        showStep(step);
    }

    /* ==================================
       KEJUTAN 1: TIUP LILIN
    ================================== */

    const cake = $("cake");
    const blow = $("blow");
    const cakeMessage = $("cakeMessage");
    const to2 = $("to2");

    let candleTimer;

    blow.addEventListener("click", () => {
        cake.classList.add("blown");
        blow.classList.add("hidden");

        cakeMessage.textContent =
            "Selamat ulang tahun, Jihan! " +
            "Semoga semua doa baikmu terkabul. ♡";

        launchConfetti(130);

        clearTimeout(candleTimer);

        candleTimer = setTimeout(() => {
            to2.classList.remove("hidden");
        }, 1000);
    });

    to2.addEventListener("click", () => {
        nextStep(2);
    });

    /* ==================================
       KEJUTAN 2: HADIAH
    ================================== */

    const gift = $("gift");
    const giftText = $("giftText");

    let giftTimer;

    gift.addEventListener("click", () => {
        if (gift.classList.contains("opened")) return;

        gift.classList.add("opened");
        launchConfetti(90);

        clearTimeout(giftTimer);

        giftTimer = setTimeout(() => {
            giftText.classList.remove("hidden");
        }, 650);
    });

    $("to3").addEventListener("click", () => {
        nextStep(3);
    });

    /* ==================================
       KEJUTAN 3: HARAPAN
    ================================== */

    const wishInput = $("wishInput");
    const sendWish = $("sendWish");
    const wishSent = $("wishSent");

    let wishTimer;

    sendWish.addEventListener("click", () => {
        const wish = wishInput.value.trim();

        if (!wish) {
            wishInput.placeholder =
                "Tulis dulu harapanmu, ya sayang ♡";
            wishInput.focus();
            return;
        }

        try {
            localStorage.setItem(
                "harapanUlangTahunJihan",
                wish
            );
        } catch (error) {
            console.log("Penyimpanan tidak tersedia.");
        }

        sendWish.disabled = true;
        sendWish.textContent = "Mengirim harapan...";

        clearTimeout(wishTimer);

        wishTimer = setTimeout(() => {
            sendWish.classList.add("hidden");
            wishSent.classList.remove("hidden");
            launchConfetti(75);
        }, 1500);
    });

    $("to4").addEventListener("click", () => {
        nextStep(4);
    });

    /* ==================================
       KEJUTAN 4: LIMA ALASAN
    ================================== */

    const reasonCards =
        document.querySelectorAll(".reason");

    const openedCards = new Set();

    reasonCards.forEach((card, index) => {
        card.addEventListener("click", () => {
            if (openedCards.has(index)) return;

            openedCards.add(index);
            card.classList.add("opened");

            $("reasonCount").textContent =
                openedCards.size + " dari 5 hati terbuka";

            if (openedCards.size === reasonCards.length) {
                $("to5").classList.remove("hidden");
                launchConfetti(100);
            }
        });
    });

    $("to5").addEventListener("click", () => {
        nextStep(5);

        setTimeout(() => launchConfetti(180), 400);
        setTimeout(() => launchConfetti(120), 2200);
    });

    /* ==================================
       ULANGI KEJUTAN
    ================================== */

    $("replay").addEventListener("click", () => {
        unlockedStep = 1;

        clearTimeout(candleTimer);
        clearTimeout(giftTimer);
        clearTimeout(wishTimer);

        cake.classList.remove("blown");
        blow.classList.remove("hidden");
        to2.classList.add("hidden");

        cakeMessage.textContent =
            "Semoga semua harapan indahmu terwujud ♡";

        gift.classList.remove("opened");
        giftText.classList.add("hidden");

        wishInput.value = "";
        wishInput.placeholder =
            "Tulis harapanmu di sini...";

        sendWish.disabled = false;
        sendWish.textContent = "Kirim Harapanku ✦";
        sendWish.classList.remove("hidden");
        wishSent.classList.add("hidden");

        openedCards.clear();

        reasonCards.forEach(card => {
            card.classList.remove("opened");
        });

        $("reasonCount").textContent =
            "0 dari 5 hati terbuka";

        $("to5").classList.add("hidden");

        showStep(1);
    });

    /* ==================================
       TAMPILAN AWAL
    ================================== */

    // Website disiapkan di belakang layar PIN.
    // Akses tetap terkunci sampai labirin selesai.

    showPage("beranda");
    showStep(1);
    updatePinDots();

});
