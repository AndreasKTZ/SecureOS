/**
 * windowManager.js
 * Håndterer grundlæggende vinduesfunktionalitet for alle apps
 * Inkluderer åbne/lukke vinduer, træk, og vinduesoverlap
 */

// Global variabler til vinduesmanagement
let activeWindow = null;
const windowZIndexBase = 100;
let windowZIndex = windowZIndexBase;

/**
 * Hovedfunktion til opsætning af vindueshåndtering
 */
function setupWindowManager() {
    console.log('Initialiserer windowManager');
    
    // Elementer
    const windowOverlay = document.querySelector('.window-overlay');
    const appWindows = document.querySelectorAll('.app-window');
    
    // Knapper til vindueskontrol
    const closeButtons = document.querySelectorAll('.close-btn');
    const minimizeButtons = document.querySelectorAll('.minimize-btn');
    const maximizeButtons = document.querySelectorAll('.maximize-btn');
    
    // Gør alle vinduer trækkbare ved initialisering
    appWindows.forEach(window => {
        makeWindowDraggable(window);
    });
    
    // Luk-knapper på vinduer
    closeButtons.forEach(button => {
        button.addEventListener('click', closeAllWindows);
    });
    
    // Minimer-knapper på vinduer
    minimizeButtons.forEach(button => {
        button.addEventListener('click', closeAllWindows); // Bare luk for nu
    });
    
    // Maksimer-knapper på vinduer (ikke funktionelle for nu)
    maximizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Kunne implementere maksimer-funktionalitet her
        });
    });
    
    // Klik udenfor vinduer bør lukke dem
    if (windowOverlay) {
        windowOverlay.addEventListener('click', function(e) {
            if (e.target === windowOverlay) {
                closeAllWindows();
            }
        });
    }
}

/**
 * Åbner et vindue på skærmen
 * @param {string} windowId - ID på det vindue, der skal åbnes
 */
function openWindow(windowId) {
    // Først, luk alle åbne vinduer
    closeAllWindows();
    
    // Vis overlay
    const windowOverlay = document.querySelector('.window-overlay');
    if (windowOverlay) {
        windowOverlay.classList.add('active');
    }
    
    // Vis det ønskede vindue
    const appWindow = document.getElementById(windowId);
    if (appWindow) {
        appWindow.classList.add('active');
        appWindow.style.zIndex = ++windowZIndex;
        activeWindow = appWindow;
        
        // Gør vinduet trækkbart
        makeWindowDraggable(appWindow);
        
        // For mellemstore skærme, centrer vinduet bedre
        const isMediumScreen = window.innerWidth > 880 && window.innerWidth <= 1200;
        if (isMediumScreen) {
            centerWindowOnScreen(appWindow);
        }
    }
}

/**
 * Lukker alle åbne vinduer
 */
function closeAllWindows() {
    const appWindows = document.querySelectorAll('.app-window');
    const windowOverlay = document.querySelector('.window-overlay');
    
    // Nulstil alle vinduer
    appWindows.forEach(window => {
        window.classList.remove('active');
        // Nulstil positionering
        window.style.left = '';
        window.style.top = '';
        window.style.transform = 'translate(-50%, -50%)';
    });
    
    // Skjul overlay
    if (windowOverlay) {
        windowOverlay.classList.remove('active');
    }
    
    windowZIndex = windowZIndexBase;
    activeWindow = null;
}

/**
 * Bringer et vindue i forgrunden
 * @param {HTMLElement} window - Vinduet der skal i forgrunden
 */
function bringToFront(window) {
    if (window && window !== activeWindow) {
        window.style.zIndex = ++windowZIndex;
        activeWindow = window;
    }
}

/**
 * Gør et vindue trækkbart
 * @param {HTMLElement} element - Vinduet der skal gøres trækkbart
 */
function makeWindowDraggable(element) {
    const header = element.querySelector('.app-window-header');
    let isDragging = false;
    let offsetX, offsetY;
    
    if (!header) return;
    
    header.addEventListener('mousedown', function(e) {
        // Spring over hvis der klikkes på vindueskontrolelementer
        if (e.target.closest('.window-controls')) {
            return;
        }
        
        // Bring vinduet til forgrunden ved klik
        bringToFront(element);
        
        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        
        // Tilføj træk-klasse
        element.classList.add('dragging');
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        
        // Anvendt begrænsninger for mellemstore skærme
        if (window.innerWidth > 880 && window.innerWidth <= 1200) {
            // Få vindues dimensioner
            const windowWidth = element.offsetWidth;
            const windowHeight = element.offsetHeight;
            
            // Sæt grænser - hold mindst 20% af vinduet synligt
            const minX = -windowWidth * 0.8;
            const maxX = window.innerWidth - windowWidth * 0.2;
            const minY = 0; // Tillad ikke at vinduet går over toppen af viewporten
            const maxY = window.innerHeight - windowHeight * 0.2;
            
            // Anvend begrænsninger
            const constrainedX = Math.max(minX, Math.min(maxX, x));
            const constrainedY = Math.max(minY, Math.min(maxY, y));
            
            // Anvend stil for at flytte vinduet
            element.style.left = constrainedX + 'px';
            element.style.top = constrainedY + 'px';
        } else {
            // Anvend stil for at flytte vinduet uden begrænsninger
            element.style.left = x + 'px';
            element.style.top = y + 'px';
        }
        
        element.style.transform = 'none'; // Fjern standard translate
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
        if (element) {
            element.classList.remove('dragging');
        }
    });
}

/**
 * Centrerer et vindue på skærmen
 * @param {HTMLElement} element - Vinduet der skal centreres
 */
function centerWindowOnScreen(element) {
    // Nulstil eventuel tidligere positionering
    element.style.top = '50%';
    element.style.left = '50%';
    element.style.transform = 'translate(-50%, -50%)';
}

// Eksporter funktioner til brug i andre moduler
window.openWindow = openWindow;
window.closeAllWindows = closeAllWindows;
window.makeWindowDraggable = makeWindowDraggable;
window.setupWindowManager = setupWindowManager;