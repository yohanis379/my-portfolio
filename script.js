document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector('.carousel-container');
    const dots = document.querySelectorAll('.dot');
    const tabButtons = document.querySelectorAll('.tab-btn');

    let isDown = false;
    let startX;
    let scrollLeft;
    let currentIndex = 2; 
    let dragMoved = false; 

    // በአሁኑ ሰዓት የሚታየውን ትራክ (Track) ብቻ ማግኛ
    function getActiveTrack() {
        return document.querySelector('.carousel-track[style*="display: flex"]');
    }

    // 1. ACTIVE CARD & DOT UPDATE LOGIC
    function updateActiveCard() {
        const activeTrack = getActiveTrack();
        if (!activeTrack) return;

        const visibleCards = Array.from(activeTrack.querySelectorAll('.product-card'));
        let closestCard = null;
        let minDistance = Infinity;
        let closestIndex = 0;

        const containerCenter = container.getBoundingClientRect().left + container.offsetWidth / 2;

        visibleCards.forEach((card, index) => {
            card.classList.remove('main-card');
            const cardCenter = card.getBoundingClientRect().left + card.offsetWidth / 2;
            const distance = Math.abs(containerCenter - cardCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestCard = card;
                closestIndex = index;
            }
        });

        if (closestCard) {
            closestCard.classList.add('main-card');
            currentIndex = closestIndex;
            document.querySelector('.dot.active')?.classList.remove('active');
            if (dots[closestIndex]) dots[closestIndex].classList.add('active');
        }
    }

    // ካርዶችን ወደ መሃል የማምጣት ተግባር (Smooth Snap)
    function snapToCard(index) {
        const activeTrack = getActiveTrack();
        if (!activeTrack) return;

        const visibleCards = Array.from(activeTrack.querySelectorAll('.product-card'));
        if (visibleCards[index]) {
            const card = visibleCards[index];
            const containerCenter = container.offsetWidth / 2;
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            
            container.scrollTo({
                left: cardCenter - containerCenter,
                behavior: 'smooth'
            });
            
            setTimeout(updateActiveCard, 150);
        }
    }

    // 2. MOUSE DRAG & TOUCH EVENTS
    container.addEventListener('mousedown', (e) => {
        isDown = true;
        dragMoved = false;
        container.classList.add('active');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
        if (!isDown) return;
        isDown = false;
        snapToCard(currentIndex);
    });

    container.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        if (dragMoved) {
            snapToCard(currentIndex);
        }
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; 
        
        if (Math.abs(x - startX) > 5) {
            dragMoved = true;
        }
        
        container.scrollLeft = scrollLeft - walk;
        updateActiveCard();
    });

    container.addEventListener('scroll', () => {
        if (!isDown) {
            updateActiveCard();
        }
    });

    // 3. PRODUCT CARDS LEFT CLICK LOGIC (ለካርዶቹ የግራ ክሊክ)
    container.addEventListener('click', (e) => {
        if (dragMoved) return; 

        const card = e.target.closest('.product-card');
        if (!card) return;

        const activeTrack = getActiveTrack();
        const visibleCards = Array.from(activeTrack.querySelectorAll('.product-card'));
        const clickedIndex = visibleCards.indexOf(card);

        if (clickedIndex !== -1) {
            snapToCard(clickedIndex);
        }
    });

    // 4. DOTS CLICK
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            snapToCard(index);
        });
    });

    // 5. DYNAMIC TABS LOGIC (ትራኮችን የመቀያየሪያ ሎጂክ)
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetCategory = button.getAttribute('data-target');

            document.querySelector('.tab-btn.active').classList.remove('active');
            button.classList.add('active');

            const allTracks = document.querySelectorAll('.carousel-track');
            allTracks.forEach(track => {
                if (track.getAttribute('data-category') === targetCategory) {
                    track.style.display = 'flex';
                } else {
                    track.style.display = 'none';
                }
            });

            // አዲሱ ትራክ ሲከፈት በቦታው እንዲጀምር ማድረግ
            setTimeout(() => {
                const startSlide = targetCategory === 'chair' ? 2 : 0;
                snapToCard(startSlide);
            }, 50);
        });
    });

    // ገጹ መጀመሪያ ሲከፈት ወንበሩን መሃል ላይ አድርጎ መጀመር
    setTimeout(() => {
        snapToCard(2);
    }, 100);
});