/**
 * scenarioLoader.js
 * Håndterer indlæsning af scenarie-data fra JSON-filer
 */

// Cache til indlæste scenarier
let scenarioCache = {};

// Sti til scenariefiler
const SCENARIO_PATH = 'data/';

// Liste over standard scenariefiler
const DEFAULT_SCENARIO_FILES = [
    'personal_info.json',
    'unknown_usb.json',
    'browser_scenario.json'
];

/**
 * Initialiserer scenarieindlæsning
 * @returns {Promise} Promise der løses når alle scenarier er indlæst
 */
async function initScenarioLoader() {
    console.log('Initialiserer scenarieindlæser');
    
    try {
        // Indlæs standardscenarier
        await loadDefaultScenarios();
        return scenarioCache;
    } catch (error) {
        console.error('Fejl ved initialisering af scenarieindlæser:', error);
        throw error;
    }
}

/**
 * Indlæser alle standardscenarier
 * @returns {Promise} Promise der løses når alle scenarier er indlæst
 */
async function loadDefaultScenarios() {
    const loadPromises = DEFAULT_SCENARIO_FILES.map(filename => 
        loadScenarioFile(filename)
    );
    
    try {
        await Promise.all(loadPromises);
        console.log('Alle standardscenarier indlæst:', Object.keys(scenarioCache));
    } catch (error) {
        console.error('Fejl ved indlæsning af standardscenarier:', error);
        throw error;
    }
}

/**
 * Indlæser en enkelt scenariefil
 * @param {string} filename - Filnavn for scenariet
 * @returns {Promise} Promise der løses når scenariet er indlæst
 */
async function loadScenarioFile(filename) {
    const fullPath = SCENARIO_PATH + filename;
    
    try {
        const response = await fetch(fullPath);
        
        if (!response.ok) {
            throw new Error(`HTTP-fejl ${response.status}: ${response.statusText}`);
        }
        
        const scenarioData = await response.json();
        
        // Valider scenariedata
        if (!validateScenarioData(scenarioData)) {
            throw new Error(`Ugyldig scenariedata i ${filename}`);
        }
        
        // Tilføj scenariet til cachen
        scenarioCache[scenarioData.id] = scenarioData;
        console.log(`Scenarie '${scenarioData.id}' indlæst fra ${filename}`);
        
        return scenarioData;
    } catch (error) {
        console.error(`Fejl ved indlæsning af scenariefil ${filename}:`, error);
        throw error;
    }
}

/**
 * Validerer scenariedata
 * @param {Object} data - Scenariedata der skal valideres
 * @returns {boolean} True hvis dataene er gyldige
 */
function validateScenarioData(data) {
    // Tjek grundlæggende påkrævede felter
    if (!data || !data.id || !data.title || !data.steps) {
        console.error('Scenarie mangler påkrævede felter (id, title, steps)');
        return false;
    }
    
    // Tjek om der er et start-trin
    if (!data.steps.start) {
        console.error(`Scenarie '${data.id}' mangler et 'start'-trin`);
        return false;
    }
    
    // Tjek alle trin for gyldighed
    let allStepsValid = true;
    let reachableSteps = new Set(['start']);
    
    // Første gennemgang: Indsaml alle trinid'er der kan nås fra start
    collectReachableSteps(data.steps, 'start', reachableSteps);
    
    // Anden gennemgang: Valider hvert trin
    for (const stepId in data.steps) {
        const step = data.steps[stepId];
        
        // Tjek om trinnet har indhold
        if (!step.content) {
            console.warn(`Trin '${stepId}' i scenarie '${data.id}' mangler indhold`);
            allStepsValid = false;
        }
        
        // Hvis trinnet har choices, validér dem
        if (step.choices && Array.isArray(step.choices)) {
            for (const choice of step.choices) {
                if (!choice.text || !choice.next) {
                    console.warn(`Valg i trin '${stepId}' mangler påkrævede felter (text, next)`);
                    allStepsValid = false;
                }
                
                // Tjek om next-reference er til et eksisterende trin
                if (choice.next && !data.steps[choice.next]) {
                    console.warn(`Valg i trin '${stepId}' refererer til ikke-eksisterende trin '${choice.next}'`);
                    allStepsValid = false;
                }
            }
        }
        
        // Tjek for ending uden endingText
        if (step.ending && !step.endingText) {
            console.warn(`Afslutningsrtin '${stepId}' i scenarie '${data.id}' mangler endingText`);
        }
    }
    
    // Tjek for trin der ikke kan nås fra start
    for (const stepId in data.steps) {
        if (!reachableSteps.has(stepId)) {
            console.warn(`Trin '${stepId}' i scenarie '${data.id}' kan ikke nås fra start`);
        }
    }
    
    return allStepsValid;
}

/**
 * Indsamler alle trin der kan nås fra et givet startpunkt (rekursiv)
 * @param {Object} steps - Alle trin i scenariet
 * @param {string} currentStepId - ID for det nuværende trin
 * @param {Set} reachableSteps - Set af ID'er for trin der kan nås
 */
function collectReachableSteps(steps, currentStepId, reachableSteps) {
    const currentStep = steps[currentStepId];
    
    // Hvis trinnet ikke har valg, kan vi ikke nå flere trin herfra
    if (!currentStep.choices || !Array.isArray(currentStep.choices)) {
        return;
    }
    
    // For hvert valg, tilføj destination til reachable set og fortsæt rekursivt
    for (const choice of currentStep.choices) {
        if (choice.next && !reachableSteps.has(choice.next)) {
            reachableSteps.add(choice.next);
            collectReachableSteps(steps, choice.next, reachableSteps);
        }
    }
}

/**
 * Henter et scenarie fra cachen
 * @param {string} scenarioId - ID for scenariet der skal hentes
 * @returns {Object|null} Scenariedata eller null hvis ikke fundet
 */
function getScenario(scenarioId) {
    return scenarioCache[scenarioId] || null;
}

/**
 * Henter et specifikt trin fra et scenarie
 * @param {string} scenarioId - ID for scenariet
 * @param {string} stepId - ID for trinnet
 * @returns {Object|null} Trindata eller null hvis ikke fundet
 */
function getScenarioStep(scenarioId, stepId) {
    const scenario = getScenario(scenarioId);
    if (!scenario || !scenario.steps || !scenario.steps[stepId]) {
        return null;
    }
    
    return scenario.steps[stepId];
}

/**
 * Henter alle indlæste scenarier
 * @returns {Object} Objekt med alle indlæste scenarier
 */
function getAllScenarios() {
    return { ...scenarioCache };
}

/**
 * Tilføjer et nyt scenarie til cachen
 * @param {Object} scenarioData - Scenariedata der skal tilføjes
 * @returns {boolean} True hvis scenariet blev tilføjet succesfuldt
 */
function addScenario(scenarioData) {
    // Valider scenariedata
    if (!validateScenarioData(scenarioData)) {
        console.error('Kunne ikke tilføje scenarie: Ugyldig data');
        return false;
    }
    
    // Tjek om et scenarie med dette ID allerede findes
    if (scenarioCache[scenarioData.id]) {
        console.warn(`Et scenarie med ID '${scenarioData.id}' findes allerede og vil blive overskrevet`);
    }
    
    // Tilføj scenariet til cachen
    scenarioCache[scenarioData.id] = scenarioData;
    console.log(`Scenarie '${scenarioData.id}' tilføjet til cache`);
    
    return true;
}

// Eksporter funktioner til brug i andre moduler
window.initScenarioLoader = initScenarioLoader;
window.getScenario = getScenario;
window.getScenarioStep = getScenarioStep;
window.getAllScenarios = getAllScenarios;
window.addScenario = addScenario;