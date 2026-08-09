(function () {
    // ─── DOM refs ──────────────────────────────────────
    const envelopeBtn = document.getElementById('envelopeBtn');
    const cardWrapper = document.getElementById('cardWrapper');
    const pageWrapper = document.getElementById('pageWrapper');
    const splitContainer = document.getElementById('splitContainer');
    const lyricsContent = document.getElementById('lyricsContent');
    const lyricsTitle = document.getElementById('lyricsTitle');
    const slideImage = document.getElementById('slideImage');
    const sakitText = document.getElementById('sakitText');
    const audio = document.getElementById('audioPlayer');
    const bgLeaves = document.getElementById('bgLeaves');

    // ─── Create Falling Leaves ─────────────────────────
    function createLeaves() {
        const leafCount = 20;
        for (let i = 0; i < leafCount; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            const size = 24 + Math.random() * 28;
            leaf.style.width = size + 'px';
            leaf.style.height = size + 'px';
            leaf.style.left = Math.random() * 100 + '%';
            leaf.style.animationDuration = (12 + Math.random() * 16) + 's';
            leaf.style.animationDelay = (Math.random() * 20) + 's';
            leaf.style.opacity = 0.3 + Math.random() * 0.5;
            if (Math.random() > 0.5) {
                leaf.style.transform = 'scaleX(-1)';
            }
            bgLeaves.appendChild(leaf);
        }
    }

    // ─── Lyrics with timestamps ──────────────────────
    const lyricsLines = [
        { time: 30.0, text: "Umuwi lang tila bang lahat nagbago na" },
        { time: 38.0, text: "Nawalan na ng sigla ang iyong mga mata" },
        { time: 45.0, text: "Ngayon ko lang naramdaman ang lamig ng gabi" },
        { time: 53.0, text: "Kahit na magdamag na tayong magkatabi" },
        { time: 63.0, text: "Bakit ka nag-iba" },
        { time: 71.0, text: "Meron na bang iba" },
        { time: 77.0, text: "Sana sinabi mo, para 'di na umasang may tayo pa sa huli" },
        { time: 84.5, text: "Sana sinabi mo, hahayaan naman kitang sumaya't umalis" },
        { time: 91.5, text: "Sana sinabi mo, para 'di na umasang may tayo pa sa huli" },
        { time: 99.0, text: "Sana sinabi mo, hahayaan naman kitang umalis" },
        { time: 113.5, text: "umalis" },
        { time: 121.0, text: "Binibilang ang hakbang hanggang wala ka na" },
        { time: 127.5, text: "Nagbabakasakaling lilingon ka pa" },
        { time: 136.6, text: "Hindi na ba mabalik ang mga sandali" },
        { time: 143.0, text: "Mga panahong may lalim pa ang iyong ngiti" },
        { time: 153.5, text: "Bakit ka nag-iba" },
        { time: 160.0, text: "Meron na bang iba" },
        { time: 167.5, text: "Sana sinabi mo, para 'di na umasang may tayo pa sa huli" },
        { time: 175.0, text: "Sana sinabi mo, hahayaan naman kitang sumaya't umalis" },
        { time: 182.5, text: "Sana sinabi mo, para 'di na umasang may tayo pa sa huli" },
        { time: 190.0, text: "Sana sinabi mo, hahayaan naman kita" },
        { time: 197.5, text: "Sana sinabi mo, para ang mga ayaw mo'y aking iibahin" },
        { time: 205.0, text: "Diba sinabi mo, basta't tayong dalwa'y sasaya ang mundong mapait" },
        { time: 213.0, text: "Diba sinabi ko, gagawin kong lahat upang tayo parin sa huli" },
        { time: 220.0, text: "Biglang nalaman ko, may hinihintay ka lang palang bumalik" },
        { time: 228.0, text: "Sana sinabi mo, dahil 'di ko maisip, ano bang nagawa kong mali" },
        { time: 236.0, text: "Sana sinabi mo, para 'di na umibig ang puso ko muli" },
        { time: 244.0, text: "Sana sinabi mo, para 'di na umasang may tayo pa sa huli" },
        { time: 251.5, text: "Sana sinabi mo, hahayaan naman kita" },
        { time: 258.0, text: "Sana sinabi mo, para 'di na umasang may tayo pa sa huli" },
        { time: 265.5, text: "Sana sinabi mo" },
    ];

    const images = [
        'Keith-Lalay.jpg',
        'Keith-Lalay1.jpg',
        'Keith-Lalay2.jpg',
        'Keith-Lalay3.jpg',
        'Keith-Lalay4.jpg'
    ];

    const LYRIC_START_TIME = 30;
    const LYRIC_END_TIME = 270;

    // ─── State ──────────────────────────────────────────
    let isOpen = false;
    let animationFrameId = null;
    let slideProgress = 0;
    let currentImageIndex = 0;
    let isActive = false;
    let isFinished = false;
    let currentLineIndex = -1;
    let blurTimeout = null;
    let titleLit = false;
    let onTimeUpdate = null;
    let onEnded = null;
    let onLoadedMeta = null;
    const LOADER_DURATION = 10000; // milliseconds to show loader before opening

    // ─── Init leaves ────────────────────────────────────
    createLeaves();

    // ─── Open Envelope (removed loading screen) ──────
    const loadingOverlay = document.getElementById('loadingOverlay');

    function showCubeLoader() {
        if (!loadingOverlay) return;
        loadingOverlay.classList.add('visible');
        loadingOverlay.setAttribute('aria-hidden', 'false');
    }

    function hideCubeLoader() {
        if (!loadingOverlay) return;
        loadingOverlay.classList.remove('visible');
        loadingOverlay.setAttribute('aria-hidden', 'true');
    }

    function openEnvelope() {
        if (isOpen) return;
        isOpen = true;
        envelopeBtn.disabled = true;

        // Hide envelope and show split screen
        cardWrapper.style.display = 'none';
        pageWrapper.style.display = 'none';
        splitContainer.classList.add('visible');
        bgLeaves.style.display = 'none';

        // Initialize lyrics and image
        showWaitingLyrics();
        setImage(images[0]);
        slideImage.classList.remove('playing');

        if (blurTimeout) clearTimeout(blurTimeout);
        blurTimeout = setTimeout(() => {
            slideImage.classList.add('playing');
            blurTimeout = null;
        }, LYRIC_START_TIME * 1000);

        startSlideshow();

        // Play audio
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));

        // Lyric sync
        onTimeUpdate = updateLyricFromTime;
        audio.addEventListener('timeupdate', onTimeUpdate);

        // "Sakit Noh" when audio ends
        onEnded = function () {
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            if (onLoadedMeta) {
                audio.removeEventListener('loadedmetadata', onLoadedMeta);
                onLoadedMeta = null;
            }
            finishExperience();
        };
        audio.addEventListener('ended', onEnded);

        onLoadedMeta = function () {
            if (audio.duration && !isNaN(audio.duration)) {
                // duration loaded, no-op
            }
        };
        audio.addEventListener('loadedmetadata', onLoadedMeta);
    }

    // Show cube loader for 10s then open
    function handleEnvelopeClickWithLoader() {
        if (isOpen) return;
        envelopeBtn.disabled = true;
        showCubeLoader();
        // after configured duration hide loader and open the envelope
        let loaderTimer = setTimeout(() => {
            audio.removeEventListener('canplaythrough', onAudioReady);
            hideCubeLoader();
            openEnvelope();
        }, LOADER_DURATION);

        // If audio becomes ready before the timer, dismiss early
        function onAudioReady() {
            clearTimeout(loaderTimer);
            audio.removeEventListener('canplaythrough', onAudioReady);
            hideCubeLoader();
            openEnvelope();
        }

        // Attach listener; if audio fails to load, timer will still open after duration
        audio.addEventListener('canplaythrough', onAudioReady);
    }

    // ─── Lyric sync using exact timestamps ─────────────
    function updateLyricFromTime() {
        if (!isActive || isFinished) return;

        const elapsed = audio.currentTime;

        if (elapsed < LYRIC_START_TIME) {
            if (currentLineIndex !== -1) {
                currentLineIndex = -1;
                showWaitingLyrics();
            }
            return;
        }

        if (elapsed >= LYRIC_END_TIME) {
            if (currentLineIndex !== -1) {
                currentLineIndex = -1;
                showWaitingLyrics();
            }
            return;
        }

        if (!titleLit) {
            titleLit = true;
            if (lyricsTitle) lyricsTitle.classList.add('lit');
        }

        let foundIndex = -1;
        for (let i = 0; i < lyricsLines.length; i++) {
            if (elapsed >= lyricsLines[i].time) {
                foundIndex = i;
            } else {
                break;
            }
        }

        if (foundIndex === -1) {
            if (currentLineIndex !== -1) {
                currentLineIndex = -1;
                showWaitingLyrics();
            }
            return;
        }

        if (foundIndex !== currentLineIndex) {
            currentLineIndex = foundIndex;
            displayLyric(currentLineIndex);
        }
    }

    function displayLyric(index) {
        const data = lyricsLines[index];
        if (!data) return;

        lyricsContent.classList.add('fade-out');
        clearTimeout(lyricsContent._fadeTimer);

        lyricsContent._fadeTimer = setTimeout(() => {
            lyricsContent.innerHTML = '';
            const line = data.text || '';
            const div = document.createElement('div');
            div.className = 'lyric-line-item';
            div.textContent = line || '\u00A0';
            if (!line) div.classList.add('blank');
            lyricsContent.appendChild(div);
            lyricsContent.classList.remove('fade-out');
            lyricsContent._fadeTimer = null;
        }, 250);
    }

    function showWaitingLyrics() {
        lyricsContent.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'loading';
        wrap.innerHTML = `
            <svg viewBox="0 0 64 48" height="48px" width="64px">
                <polyline id="back" points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"></polyline>
                <polyline id="front" points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"></polyline>
            </svg>
        `;
        lyricsContent.appendChild(wrap);
        if (lyricsTitle) lyricsTitle.classList.remove('lit');
        titleLit = false;
        slideImage.classList.remove('playing');
    }

    // ─── Slideshow ──────────────────────────────────────
    function startSlideshow() {
        isActive = true;
        slideProgress = 0;
        currentImageIndex = 0;

        function animate() {
            if (!isActive) return;
            slideProgress += 0.006;
            if (slideProgress >= 1) {
                slideProgress = 0;
                currentImageIndex = (currentImageIndex + 1) % images.length;
                setImage(images[currentImageIndex]);
            }
            const percent = 100 - (slideProgress * 100);
            slideImage.style.backgroundPosition = `center ${percent}%`;
            animationFrameId = requestAnimationFrame(animate);
        }

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animate();
    }

    function setImage(src) {
        slideImage.style.backgroundImage = `url('${src}')`;
        slideImage.style.backgroundPosition = 'center 100%';
    }

    // ─── Finish ─────────────────────────────────────────
    function finishExperience() {
        if (isFinished) return;
        isActive = false;
        isFinished = true;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        splitContainer.classList.remove('visible');
        sakitText.classList.add('visible');
    }

    // ─── Reset ──────────────────────────────────────────
    function resetAll() {
        isActive = false;
        isFinished = false;
        currentLineIndex = -1;
        titleLit = false;

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        splitContainer.classList.remove('visible');
        sakitText.classList.remove('visible');
        lyricsContent.innerHTML = '';
        if (lyricsTitle) lyricsTitle.classList.remove('lit');
        cardWrapper.style.display = '';
        pageWrapper.style.display = '';
        bgLeaves.style.display = '';

        audio.pause();
        audio.currentTime = 0;

        slideImage.classList.remove('playing');
        if (blurTimeout) {
            clearTimeout(blurTimeout);
            blurTimeout = null;
        }

        if (onTimeUpdate) {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            onTimeUpdate = null;
        }
        if (onEnded) {
            audio.removeEventListener('ended', onEnded);
            onEnded = null;
        }
        if (onLoadedMeta) {
            audio.removeEventListener('loadedmetadata', onLoadedMeta);
            onLoadedMeta = null;
        }

        envelopeBtn.disabled = false;
        isOpen = false;
    }

    // ─── Events ─────────────────────────────────────────
    envelopeBtn.addEventListener('click', handleEnvelopeClickWithLoader);
    envelopeBtn.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleEnvelopeClickWithLoader();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            resetAll();
        }
    });

    // ─── Init ───────────────────────────────────────────
    splitContainer.classList.remove('visible');
    sakitText.classList.remove('visible');
    lyricsContent.innerHTML = '';
})();
