/**
 * storageManager.js
 * Håndterer lagring og hentning af data fra localStorage
 * Centraliserer al datahåndtering for applikationen
 */

// Konstanter til storage keys
const STORAGE_KEYS = {
    USER_CHOICES: 'userChoices',
    BACKGROUND: 'customBackground',
    SETTINGS: 'appSettings'
};

/**
 * Initialiserer storage manager
 */
function setupStorageManager() {
    console.log('Initialiserer storageManager');
    
    // Sikrer at localStorage er tilgængelig
    if (!isLocalStorageAvailable()) {
        console.error('localStorage er ikke tilgængelig. Data vil ikke blive gemt.');
        alert('Din browser understøtter ikke lokal lagring. Dine valg vil ikke blive gemt mellem sessioner.');
        return;
    }
    
    // Tilføj lytter til localStorage ændringer (for synkronisering mellem tabs)
    window.addEventListener('storage', handleStorageChanges);
    
    // Override localStorage.setItem for at tilføje events
    overrideStorageSetItem();
}

/**
 * Kontrollerer om localStorage er tilgængelig
 * @returns {boolean} True hvis localStorage er tilgængelig
 */
function isLocalStorageAvailable() {
    try {
        const testKey = '__test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Override localStorage.setItem for at tilføje events
 */
function overrideStorageSetItem() {
    const originalSetItem = localStorage.setItem;
    
    localStorage.setItem = function(key, value) {
        // Kald den originale implementering
        originalSetItem.call(this, key, value);
        
        // Udløs en custom event når data ændres
        const storageEvent = new CustomEvent('app-storage-updated', {
            detail: { key, value }
        });
        
        window.dispatchEvent(storageEvent);
    };
}

/**
 * Håndterer ændringer i localStorage (mellem tabs)
 * @param {StorageEvent} e - Storage event objekt
 */
function handleStorageChanges(e) {
    // Håndter cross-tab synkronisering her
    if (e.key === STORAGE_KEYS.USER_CHOICES) {
        // Opdater UI baseret på brugervalg hvis nødvendigt
        updateUIBasedOnChoices();
    } else if (e.key === STORAGE_KEYS.BACKGROUND) {
        // Opdater baggrund hvis den er ændret i en anden tab
        applyBackgroundFromStorage();
    }
}

/**
 * Opdaterer UI baseret på gemte brugervalg
 */
function updateUIBasedOnChoices() {
    // Denne funktion kan kaldes når brugervalg ændres
    // For eksempel opdatere Security Center
    if (typeof updateSecurityStatus === 'function') {
        updateSecurityStatus();
    }
}

/**
 * Gemmer brugervalg for et scenarie
 * @param {string} scenarioId - ID for scenariet
 * @param {string} stepId - ID for trinnet i scenariet
 * @param {string} nextStep - Næste trin ID
 * @param {string} security - Sikkerhedsvurdering (good, neutral, bad)
 * @param {number} points - Point for valget
 * @param {string} text - Tekstindhold for valget
 */
function saveUserChoice(scenarioId, stepId, nextStep, security, points, text) {
    try {
        // Hent nuværende brugervalg
        let userChoices = getUserChoices();
        
        // Initialiser scenarie hvis det ikke findes
        if (!userChoices[scenarioId]) {
            userChoices[scenarioId] = { 
                currentStep: nextStep, 
                choices: [] 
            };
        }
        
        // Opdater nuværende trin
        userChoices[scenarioId].currentStep = nextStep;
        
        // Tilføj nyt valg til historikken
        userChoices[scenarioId].choices.push({
            step: stepId,
            choice: nextStep,
            security: security,
            points: parseInt(points) || 0,
            text: text ? text.trim() : '',
            timestamp: new Date().toISOString()
        });
        
        // Gem opdaterede valg
        localStorage.setItem(STORAGE_KEYS.USER_CHOICES, JSON.stringify(userChoices));
        
        return true;
    } catch (e) {
        console.error('Fejl ved gemning af brugervalg:', e);
        return false;
    }
}

/**
 * Henter alle brugervalg
 * @returns {Object} Objekt med alle gemte brugervalg
 */
function getUserChoices() {
    try {
        const choicesString = localStorage.getItem(STORAGE_KEYS.USER_CHOICES);
        return choicesString ? JSON.parse(choicesString) : {};
    } catch (e) {
        console.error('Fejl ved hentning af brugervalg:', e);
        return {};
    }
}

/**
 * Henter brugervalg for et specifikt scenarie
 * @param {string} scenarioId - ID for scenariet
 * @returns {Object|null} Scenariedata eller null hvis ikke fundet
 */
function getScenarioChoices(scenarioId) {
    const userChoices = getUserChoices();
    return userChoices[scenarioId] || null;
}

/**
 * Nulstiller brugervalg for et scenarie
 * @param {string} scenarioId - ID for scenariet
 * @returns {boolean} True hvis nulstilling var succesfuld
 */
function resetScenarioChoices(scenarioId) {
    try {
        let userChoices = getUserChoices();
        
        if (userChoices[scenarioId]) {
            delete userChoices[scenarioId];
            localStorage.setItem(STORAGE_KEYS.USER_CHOICES, JSON.stringify(userChoices));
        }
        
        return true;
    } catch (e) {
        console.error('Fejl ved nulstilling af scenarie:', e);
        return false;
    }
}

/**
 * Gemmer brugertilpasset baggrund
 * @param {string} imageDataUrl - Data URL for baggrundsbilledet
 */
function saveCustomBackground(imageDataUrl) {
    try {
        localStorage.setItem(STORAGE_KEYS.BACKGROUND, imageDataUrl);
        return true;
    } catch (e) {
        console.error('Fejl ved gemning af brugertilpasset baggrund:', e);
        return false;
    }
}

/**
 * Henter og anvender brugertilpasset baggrund
 */
function applyBackgroundFromStorage() {
    try {
        const savedBackground = localStorage.getItem(STORAGE_KEYS.BACKGROUND);
        const desktop = document.querySelector('.desktop');
        
        if (savedBackground && desktop) {
            desktop.style.backgroundImage = `url(${savedBackground})`;
        }
    } catch (e) {
        console.error('Fejl ved anvendelse af brugertilpasset baggrund:', e);
    }
}

/**
 * Nulstiller brugertilpasset baggrund
 */
function resetCustomBackground() {
    try {
        localStorage.removeItem(STORAGE_KEYS.BACKGROUND);
        const desktop = document.querySelector('.desktop');
        
        if (desktop) {
            desktop.style.backgroundImage = 'url("../images/bg2.png")';
        }
        
        return true;
    } catch (e) {
        console.error('Fejl ved nulstilling af brugertilpasset baggrund:', e);
        return false;
    }
}

/**
 * Gemmer applikationsindstillinger
 * @param {Object} settings - Indstillingsobjekt
 */
function saveAppSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        return true;
    } catch (e) {
        console.error('Fejl ved gemning af applikationsindstillinger:', e);
        return false;
    }
}

/**
 * Henter applikationsindstillinger
 * @returns {Object} Indstillingsobjekt
 */
function getAppSettings() {
    try {
        const settingsString = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return settingsString ? JSON.parse(settingsString) : {};
    } catch (e) {
        console.error('Fejl ved hentning af applikationsindstillinger:', e);
        return {};
    }
}

/**
 * Nulstiller alle applikationsdata
 * @returns {boolean} True hvis nulstilling var succesfuld
 */
function resetAllData() {
    try {
        // Gem en liste over keys der skal beholdes (hvis nogen)
        // const keysToKeep = ['someKeyToKeep'];
        
        // Fjern alle app-specifikke data
        localStorage.removeItem(STORAGE_KEYS.USER_CHOICES);
        localStorage.removeItem(STORAGE_KEYS.BACKGROUND);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        // Fjern intro-flaget
        localStorage.removeItem('hasSeenIntro');
        
        return true;
    } catch (e) {
        console.error('Fejl ved nulstilling af alle data:', e);
        return false;
    }
}

// Eksporter funktioner til brug i andre moduler
window.setupStorageManager = setupStorageManager;
window.saveUserChoice = saveUserChoice;
window.getUserChoices = getUserChoices;
window.getScenarioChoices = getScenarioChoices;
window.resetScenarioChoices = resetScenarioChoices;
window.saveCustomBackground = saveCustomBackground;
window.applyBackgroundFromStorage = applyBackgroundFromStorage;
window.resetCustomBackground = resetCustomBackground;
window.saveAppSettings = saveAppSettings;
window.getAppSettings = getAppSettings;
window.resetAllData = resetAllData;