/**
 * browserApp.js
 * Håndterer browser-appens funktionalitet
 */

// Browser app state
let browserHistory = [];
let currentHistoryIndex = -1;
let currentBrowserUrl = 'https://';

/**
 * Initialiserer browser-app
 */
function setupBrowserApp() {
    console.log('Initialiserer browser app');
    
    // DOM Elementer
    const browserAppBtn = document.getElementById('browser-app-btn');
    const browserAppWindow = document.getElementById('browser-app-window');
    const browserAddressBar = document.querySelector('.browser-address-bar .url-text');
    const browserBackBtn = document.querySelector('.browser-app .browser-actions button:nth-child(1)');
    const browserForwardBtn = document.querySelector('.browser-app .browser-actions button:nth-child(2)');
    const browserReloadBtn = document.querySelector('.browser-app .browser-actions button:nth-child(3)');
    
    // Tilføj event listener til browser-knap
    if (browserAppBtn) {
        browserAppBtn.addEventListener('click', function() {
            openBrowserApp();
        });
    }
    
    // Tilføj event listeners til navigationsknapper
    if (browserBackBtn) {
        browserBackBtn.addEventListener('click', navigateBack);
    }
    
    if (browserForwardBtn) {
        browserForwardBtn.addEventListener('click', navigateForward);
    }
    
    if (browserReloadBtn) {
        browserReloadBtn.addEventListener('click', reloadCurrentPage);
    }
}

/**
 * Åbner browser-appen og indlæser browser-scenarie
 */
function openBrowserApp() {
    // Tjek om vi er i mobilvisning
    const isMobile = window.innerWidth <= 880;
    
    if (isMobile) {
        if (typeof openAppMobile === 'function') {
            openAppMobile('browser-app-window');
        }
    } else {
        if (typeof openWindow === 'function') {
            openWindow('browser-app-window');
        }
    }
    
    // Indlæs browser-scenarie
    loadBrowserScenario();
}

/**
 * Indlæser browser-scenarie
 */
function loadBrowserScenario() {
    const url = 'http://login.staff-portal-secure.com/auth'; // Standard URL der skal vises
    
    // Opdater browser-adresselinjen
    updateBrowserURL(url);
    
    // Start scenariet i browser-containeren
    if (typeof startScenario === 'function') {
        startScenario('browser-security', '#browser-scenario-container');
    } else {
        console.error('scenarioHandler mangler - kan ikke indlæse browser-scenarie');
    }
}

/**
 * Opdaterer browser URL-visning
 * @param {string} url - URL der skal vises
 */
function updateBrowserURL(url) {
    const browserAddressBar = document.querySelector('.browser-address-bar .url-text');
    if (browserAddressBar) {
        browserAddressBar.textContent = url || 'https://';
        currentBrowserUrl = url || 'https://';
    }
}

/**
 * Navigerer til en URL
 * @param {string} url - URL der skal navigeres til
 * @param {boolean} addToHistory - Om URL skal tilføjes til historikken
 */
function navigateTo(url, addToHistory = true) {
    // Opdater URL-visning
    updateBrowserURL(url);
    
    // Tilføj til historik hvis nødvendigt
    if (addToHistory) {
        // Hvis vi navigerede fra en position andet end slutningen af historikken,
        // fjern den fremadrettede historik
        if (currentHistoryIndex < browserHistory.length - 1) {
            browserHistory = browserHistory.slice(0, currentHistoryIndex + 1);
        }
        
        browserHistory.push(url);
        currentHistoryIndex = browserHistory.length - 1;
    }
    
    // Opdater tilbage/frem-knappernes tilstand
    updateNavigationButtons();
    
    // Indlæs browser-scenarie
    loadBrowserScenario();
}

/**
 * Navigerer tilbage i browserhistorikken
 */
function navigateBack() {
    if (currentHistoryIndex > 0) {
        currentHistoryIndex--;
        const previousUrl = browserHistory[currentHistoryIndex];
        navigateTo(previousUrl, false);
    }
}

/**
 * Navigerer frem i browserhistorikken
 */
function navigateForward() {
    if (currentHistoryIndex < browserHistory.length - 1) {
        currentHistoryIndex++;
        const nextUrl = browserHistory[currentHistoryIndex];
        navigateTo(nextUrl, false);
    }
}

/**
 * Genindlæser den aktuelle side
 */
function reloadCurrentPage() {
    if (currentHistoryIndex >= 0) {
        const currentUrl = browserHistory[currentHistoryIndex];
        loadBrowserScenario();
    } else if (currentBrowserUrl && currentBrowserUrl !== 'https://') {
        loadBrowserScenario();
    }
}

/**
 * Opdaterer tilstanden af navigationsknapperne
 */
function updateNavigationButtons() {
    const browserBackBtn = document.querySelector('.browser-app .browser-actions button:nth-child(1)');
    const browserForwardBtn = document.querySelector('.browser-app .browser-actions button:nth-child(2)');
    
    if (browserBackBtn) {
        browserBackBtn.disabled = currentHistoryIndex <= 0;
        browserBackBtn.style.opacity = currentHistoryIndex <= 0 ? 0.5 : 1;
    }
    
    if (browserForwardBtn) {
        browserForwardBtn.disabled = currentHistoryIndex >= browserHistory.length - 1;
        browserForwardBtn.style.opacity = currentHistoryIndex >= browserHistory.length - 1 ? 0.5 : 1;
    }
}

// Eksporter funktioner til brug i andre moduler
window.setupBrowserApp = setupBrowserApp;
window.navigateToBrowserUrl = navigateTo;