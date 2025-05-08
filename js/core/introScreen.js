class IntroOverlay {
    constructor() {
        this.overlay = document.getElementById('intro-overlay');
        this.startButton = document.getElementById('start-secureos');
        this.hasSeenIntro = localStorage.getItem('hasSeenIntro');

        this.init();
    }

    init() {
        // Vis intro-skærmen hvis brugeren ikke har set den før
        if (!this.hasSeenIntro) {
            this.showOverlay();
        }

        // Tilføj eventlistener til startknappen
        this.startButton.addEventListener('click', () => {
            this.hideOverlay();
            localStorage.setItem('hasSeenIntro', 'true');
        });
    }

    showOverlay() {
        this.overlay.classList.add('active');
    }

    hideOverlay() {
        this.overlay.classList.remove('active');
    }
}

// Initialiser intro-skærmen når DOM er indlæst
document.addEventListener('DOMContentLoaded', () => {
    new IntroOverlay();
}); 