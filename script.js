// Infinite auto-slider: advances one slide every 1000ms (1 second)
(function(){
    const track = document.getElementById('sliderTrack');
    if(!track) return;

    const slideImages = Array.from(track.querySelectorAll('.slide-image'));
    if(slideImages.length === 0) return;

    // Wait for all images to load (or fail) before initializing slider
    const imageLoadPromises = slideImages.map(img => {
        return new Promise(resolve => {
            if (img.complete) return resolve();
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve);
        });
    });

    Promise.all(imageLoadPromises).then(initSlider);

    function initSlider(){
        const slides = Array.from(track.children);
        const slideCount = slides.length;
        if(slideCount === 0) return;

        // Clone first and last for seamless loop
        const firstClone = slides[0].cloneNode(true);
        const lastClone = slides[slideCount - 1].cloneNode(true);
        track.appendChild(firstClone);
        track.insertBefore(lastClone, track.firstChild);

        let currentIndex = 1; // start at the real first slide (after lastClone)

        // Set initial position to show the first real slide
        function setPosition(skipTransition){
            if(skipTransition) track.style.transition = 'none';
            else track.style.transition = 'transform 0.5s ease';
            const offset = -currentIndex * 100;
            track.style.transform = `translateX(${offset}%)`;
            if(skipTransition) void track.offsetWidth;
        }

        // When window resizes, re-apply position
        window.addEventListener('resize', () => setPosition(true));

        // Move to next slide
        function next() {
            currentIndex++;
            setPosition(false);
        }

        // Listen for transition end to handle loop reset
        track.addEventListener('transitionend', () => {
            const totalSlides = track.children.length - 2; // excluding clones
            if(currentIndex === totalSlides + 1){
                currentIndex = 1;
                setPosition(true);
            }
            if(currentIndex === 0){
                currentIndex = totalSlides;
                setPosition(true);
            }
        });

        // Initialize layout: make each slide take equal width inside the track
        function setupSlides(){
            const allSlides = Array.from(track.children);
            allSlides.forEach(sl => sl.style.width = `${100 / allSlides.length}%`);
            setPosition(true);
        }

        setupSlides();

        // Auto-advance every 1000ms (1 second)
        const interval = 1000;
        let timer = setInterval(next, interval);

        // Pause on hover to let users examine photos (optional UX)
        const viewport = track.parentElement;
        if(viewport){
            viewport.addEventListener('mouseenter', () => clearInterval(timer));
            viewport.addEventListener('mouseleave', () => { timer = setInterval(next, interval); });
        }
    }
})();