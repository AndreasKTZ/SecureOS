/**
 * main.js
 * Hovedfil der initialiserer alle moduler og komponenter
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser vinduesmanager
    initWindowManager();
    
    // Initialiser responsiv håndtering
    initResponsiveHandler();
    
    // Initialiser alle apps
    initBrowserApp();
    initFileManagerApp();
    initMailApp();
    initNotesApp();
    initSecurityCenterApp();
    
    // Initialiser scenariehåndtering
    initScenarioHandler();

    // Initialiser utils
    initTimeDisplay();
    initSystemButtons();
    
    console.log('Alle moduler initialiseret');
});

/**
 * Initialiserer vinduesmanager
 */
function initWindowManager() {
    if (typeof setupWindowManager === 'function') {
        setupWindowManager();
    } else {
        console.error('windowManager.js er ikke indlæst korrekt');
    }
}

/**
 * Initialiserer responsiv håndtering
 */
function initResponsiveHandler() {
    if (typeof setupResponsiveHandler === 'function') {
        setupResponsiveHandler();
    } else {
        console.error('responsiveHandler.js er ikke indlæst korrekt');
    }
}

/**
 * Initialiserer browser-app
 */
function initBrowserApp() {
    if (typeof setupBrowserApp === 'function') {
        setupBrowserApp();
    } else {
        console.error('browserApp.js er ikke indlæst korrekt');
    }
}

/**
 * Initialiserer filhåndterings-app
 */
function initFileManagerApp() {
    if (typeof setupFileManagerApp === 'function') {
        setupFileManagerApp();
    } else {
        console.error('fileManagerApp.js er ikke indlæst korrekt');
    }
}

/**
 * Initialiserer mail-app
 */
function initMailApp() {
    if (typeof setupMailApp === 'function') {
        setupMailApp();
    } else {
        console.error('mailApp.js er ikke indlæst korrekt');
    }
}

/**
 * Initialiserer note-app
 */
function initNotesApp() {
    if (typeof setupNotesApp === 'function') {
        setupNotesApp();
    } else {
        console.error('notesApp.js er ikke indlæst korrekt');
    }
}

/**
 * Initialiserer sikkerhedscenter-app
 */
function initSecurityCenterApp() {
    if (typeof setupSecurityCenterApp === 'function') {
        setupSecurityCenterApp();
    } else {
        console.error('securityCenterApp.js er ikke indlæst korrekt');
    }
}

/**
 * Initialiserer scenariehåndtering
 */
function initScenarioHandler() {
    if (typeof initializeScenarios === 'function') {
        initializeScenarios();
    } else {
        console.error('scenarioHandler.js er ikke indlæst korrekt');
    }
}

/**
 * Initialiserer tidsvisning
 */
function initTimeDisplay() {
    if (typeof setupTimeDisplay === 'function') {
        setupTimeDisplay();
    } else {
        console.error('utils.js (tidsvisning) er ikke indlæst korrekt');
    }
}

/**
 * Initialiserer systemknapper (GitHub, download rapport, nulstil)
 */
function initSystemButtons() {
    if (typeof setupSystemButtons === 'function') {
        setupSystemButtons();
    } else {
        console.error('utils.js (systemknapper) er ikke indlæst korrekt');
    }
}