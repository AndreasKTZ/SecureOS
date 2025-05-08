/**
 * scenarioHandler.js
 * Håndterer indlæsning og visning af interaktive scenarier
 */

// Globale variabler til scenariehåndtering
let scenarios = {};
let userChoices = {};

/**
 * Initialiserer scenariehåndtering
 */
function initializeScenarios() {
    console.log('Initialiserer scenariehåndtering');
    
    // Indlæs brugervalg fra local storage
    loadUserChoices();
    
    // Lyt efter ændringer i DOM
    document.addEventListener('DOMContentLoaded', function() {
        // Find alle elementer med scenarie-attributter
        const scenarioElements = document.querySelectorAll('[data-scenario]');
        
        // Tilføj event listeners til disse elementer
        scenarioElements.forEach(el => {
            el.addEventListener('click', function() {
                const scenarioId = this.dataset.scenario;
                const containerSelector = this.dataset.container;
                
                if (scenarioId && containerSelector) {
                    startScenario(scenarioId, containerSelector);
                }
            });
        });
    });
    
    // Indlæs scenarie-data
    loadScenarios();
}

/**
 * Indlæser brugervalg fra local storage
 */
function loadUserChoices() {
    if (typeof getUserChoices === 'function') {
        userChoices = getUserChoices();
    } else {
        // Backup direkte hentning hvis storageManager ikke er tilgængelig
        try {
            const choicesString = localStorage.getItem('userChoices');
            userChoices = choicesString ? JSON.parse(choicesString) : {};
            console.log('Indlæste brugervalg:', userChoices); // Debug: Log indlæste valg
        } catch (e) {
            console.error('Fejl ved indlæsning af brugervalg:', e);
            userChoices = {};
        }
    }
}

/**
 * Indlæser scenarie-data fra JSON-filer
 */
async function loadScenarios() {
    const scenarioFiles = [
        'data/personal_info.json',
        'data/unknown_usb.json',
        'data/browser_scenario.json'
    ];
    
    for (const file of scenarioFiles) {
        try {
            const response = await fetch(file);
            if (response.ok) {
                const data = await response.json();
                scenarios[data.id] = data;
                console.log(`Scenarie '${data.id}' indlæst`);
            } else {
                console.warn(`Kunne ikke indlæse ${file}: ${response.status} ${response.statusText}`);
            }
        } catch (e) {
            console.error(`Fejl ved indlæsning af ${file}:`, e);
        }
    }
}

/**
 * Starter et scenarie i den angivne container
 * @param {string} scenarioId - ID for scenariet der skal vises
 * @param {string} containerSelector - CSS-selektor for containeren
 */
function startScenario(scenarioId, containerSelector) {
    // Find container-element
    let container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container '${containerSelector}' ikke fundet`);
        return;
    }
    
    // Håndter specielle containere (f.eks. filhåndtering)
    if (containerSelector === '.file-manager-content') {
        container.innerHTML = '<div class="scenario-container" id="usb-scenario-container"></div>';
        container = document.getElementById('usb-scenario-container');
    }
    
    // Håndter mobilvisning
    const isMobile = window.innerWidth <= 880;
    if (isMobile) {
        handleMobileScenarioStart(scenarioId, containerSelector, container);
    }
    
    // Sikre at userChoices er indlæst før vi fortsætter
    if (!userChoices) {
        loadUserChoices();
    }
    
    // Find gemt tilstand hvis den findes
    const savedState = userChoices[scenarioId];
    const currentStep = savedState && savedState.currentStep ? savedState.currentStep : 'start';
    
    // Gem scenarioId på container for at kunne referere til det senere
    container.dataset.scenarioId = scenarioId;
    
    // Opdater browser URL for browser-scenarier
    updateBrowserAddressBarIfNeeded(scenarioId);
    
    // Vis scenariet
    displayStep(scenarioId, currentStep, container);
}

/**
 * Håndterer mobilspecifik opførsel ved scenariestart
 * @param {string} scenarioId - ID for scenariet
 * @param {string} containerSelector - CSS-selektor for containeren
 * @param {HTMLElement} container - Container-element
 */
function handleMobileScenarioStart(scenarioId, containerSelector, container) {
    // For filhåndtering på mobil
    if (containerSelector === '.file-manager-content') {
        const fileManagerSidebar = document.querySelector('.file-manager-sidebar');
        const fileManagerContent = document.querySelector('.file-manager-content');
        
        if (fileManagerSidebar && fileManagerContent) {
            fileManagerSidebar.classList.add('hidden');
            fileManagerContent.classList.add('active');
            
            // Vis tilbage-knap
            const backBtn = fileManagerContent.querySelector('.mobile-back-button');
            if (backBtn) {
                backBtn.style.display = 'flex';
            }
        }
    }
    
    // For mail-app på mobil
    if (containerSelector === '#scenario-container') {
        const mailList = document.querySelector('.mail-list');
        const mailContent = document.querySelector('.mail-content');
        
        if (mailList && mailContent) {
            mailList.classList.add('hidden');
            mailContent.classList.add('active');
            
            // Vis tilbage-knap
            const backBtn = mailContent.querySelector('.mobile-back-button');
            if (backBtn) {
                backBtn.style.display = 'flex';
            }
        }
    }
    
    // For browser-app på mobil
    if (containerSelector === '#browser-scenario-container') {
        // Vis tilbage-knap
        const backBtn = document.querySelector('.browser-content .mobile-back-button');
        if (backBtn) {
            backBtn.style.display = 'flex';
        }
    }
}

/**
 * Opdaterer browser-adresselinje for browser-scenarier
 * @param {string} scenarioId - ID for scenariet
 */
function updateBrowserAddressBarIfNeeded(scenarioId) {
    const scenario = scenarios[scenarioId];
    if (scenario && scenario.type === 'browser' && scenario.url) {
        // Opdater browser-adresselinje
        const browserAddressBar = document.querySelector('.browser-address-bar .url-text');
        if (browserAddressBar) {
            browserAddressBar.textContent = scenario.url;
        }
    }
}

/**
 * Viser et trin i et scenarie
 * @param {string} scenarioId - ID for scenariet
 * @param {string} stepId - ID for trinnet
 * @param {HTMLElement} container - Container-element
 */
function displayStep(scenarioId, stepId, container) {
    const scenario = scenarios[scenarioId];
    if (!scenario) {
        console.error(`Scenarie '${scenarioId}' ikke fundet`);
        return;
    }
    
    const step = scenario.steps[stepId];
    if (!step) {
        console.error(`Trin '${stepId}' ikke fundet i scenarie '${scenarioId}'`);
        return;
    }
    
    // Byg HTML for trinnet
    let html = `<div class="scenario-header"><h2>${scenario.title}</h2></div>
                <div class="scenario-body"><p>${step.content}</p></div>`;
    
    if (step.question) {
        html += `<div class="scenario-question"><p>${step.question}</p></div>`;
    }
    
    if (step.choices) {
        html += '<div class="choices">';
        step.choices.forEach(choice => {
            // Tjek om dette valg har et browser-link
            if (choice.browserLink) {
                html += `<button class="choice-btn" data-next="${choice.next}" data-security="${choice.security}" data-points="${choice.points || 0}" data-browser-link="${choice.browserLink}">${choice.text}</button>`;
            } else {
                html += `<button class="choice-btn" data-next="${choice.next}" data-security="${choice.security}" data-points="${choice.points || 0}">${choice.text}</button>`;
            }
        });
        html += '</div>';
    }
    
    if (step.ending) {
        let endingClass = `ending-${step.ending}`;
        html += `<div class="scenario-ending ${endingClass}">
                    <p>${step.endingText || ''}</p>
                    <button class="restart-btn">Prøv igen</button>
                    <button class="summary-btn">Se dine valg</button>
                </div>`;
    }
    
    // Indsæt HTML i containeren
    container.innerHTML = html;
    
    // Tilføj event listeners
    addScenarioEventListeners(scenarioId, stepId, container);
}

/**
 * Tilføjer event listeners til scenarie-elementer
 * @param {string} scenarioId - ID for scenariet
 * @param {string} stepId - ID for trinnet
 * @param {HTMLElement} container - Container-element
 */
function addScenarioEventListeners(scenarioId, stepId, container) {
    // Event listeners til valgknapper
    container.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Tjek om denne knap har et browser-link
            if (this.dataset.browserLink) {
                handleBrowserLink(this.dataset.browserLink, this.dataset.next);
            } else {
                saveChoice(scenarioId, stepId, this.dataset.next, this.dataset.security, this.dataset.points, this.textContent);
                displayStep(scenarioId, this.dataset.next, container);
            }
        });
    });
    
    // Event listener til genstart-knap
    const restart = container.querySelector('.restart-btn');
    if (restart) {
        restart.addEventListener('click', () => resetScenario(scenarioId, container));
    }
    
    // Event listener til opsummerings-knap
    const summary = container.querySelector('.summary-btn');
    if (summary) {
        summary.addEventListener('click', () => showSummary(scenarioId, container));
    }
}

/**
 * Gemmer et brugervalg
 * @param {string} scenarioId - ID for scenariet
 * @param {string} stepId - ID for trinnet
 * @param {string} nextStep - ID for næste trin
 * @param {string} security - Sikkerhedsvurdering (good, neutral, bad)
 * @param {string|number} points - Point for valget
 * @param {string} text - Tekst for valget
 */
function saveChoice(scenarioId, stepId, nextStep, security, points, text) {
    if (typeof saveUserChoice === 'function') {
        // Brug storageManager hvis tilgængelig
        saveUserChoice(scenarioId, stepId, nextStep, security, points, text);
    } else {
        // Backup direkte gemning hvis storageManager ikke er tilgængelig
        if (!userChoices[scenarioId]) {
            userChoices[scenarioId] = { currentStep: nextStep, choices: [] };
        }
        
        userChoices[scenarioId].currentStep = nextStep;
        userChoices[scenarioId].choices.push({
            step: stepId,
            choice: nextStep,
            security: security,
            points: parseInt(points) || 0,
            text: text ? text.trim() : '',
            timestamp: new Date().toISOString()
        });
        
        try {
            localStorage.setItem('userChoices', JSON.stringify(userChoices));
            console.log('Gemt valg for scenarie:', scenarioId, userChoices[scenarioId]); // Debug: Log gemte valg
        } catch (e) {
            console.error('Fejl ved gemning af brugervalg:', e);
        }
    }
    
    // Trigger opdatering af sikkerhedsstatus hvis funktionen findes
    if (typeof updateSecurityStatus === 'function') {
        updateSecurityStatus();
    }
}

/**
 * Nulstiller et scenarie
 * @param {string} scenarioId - ID for scenariet
 * @param {HTMLElement} container - Container-element
 */
function resetScenario(scenarioId, container) {
    if (typeof resetScenarioChoices === 'function') {
        // Brug storageManager hvis tilgængelig
        resetScenarioChoices(scenarioId);
    } else {
        // Backup direkte sletning hvis storageManager ikke er tilgængelig
        if (userChoices[scenarioId]) {
            delete userChoices[scenarioId];
            
            try {
                localStorage.setItem('userChoices', JSON.stringify(userChoices));
                console.log('Nulstillede valg for scenarie:', scenarioId); // Debug: Log nulstilling
            } catch (e) {
                console.error('Fejl ved nulstilling af scenarie:', e);
            }
        }
    }
    
    // Vis startskærmen igen
    displayStep(scenarioId, 'start', container);
    
    // Trigger opdatering af sikkerhedsstatus hvis funktionen findes
    if (typeof updateSecurityStatus === 'function') {
        updateSecurityStatus();
    }
}

/**
 * Viser en opsummering af brugervalg for et scenarie
 * @param {string} scenarioId - ID for scenariet
 * @param {HTMLElement} container - Container-element
 */
function showSummary(scenarioId, container) {
    // Sikrer at vi har de seneste brugervalg
    loadUserChoices();
    
    const scenario = scenarios[scenarioId];
    if (!scenario) {
        console.error(`Scenarie '${scenarioId}' ikke fundet ved visning af opsummering`);
        return;
    }
    
    // Hent brugervalg og log dem for debugging
    const scenarioChoices = userChoices[scenarioId];
    console.log(`Viser opsummering for scenarie '${scenarioId}':`, scenarioChoices);
    
    const choices = scenarioChoices?.choices || [];
    
    let html = `<div class="summary-container"><h2>Valg Oversigt - ${scenario.title}</h2>`;
    
    if (!choices || choices.length === 0) {
        html += '<p>Ingen valg foretaget endnu.</p>';
    } else {
        html += '<div class="choices-summary">';
        choices.forEach((choice, index) => {
            // Hent spørgsmålsteksten hvis muligt
            let questionText = '';
            const step = scenario.steps[choice.step];
            if (step && step.question) {
                questionText = step.question;
            }
            
            html += `<div class="choice-item security-${choice.security}">
                        <div class="choice-number">${index + 1}</div>
                        <div class="choice-details">
                            <div class="choice-question">${questionText}</div>
                            <div class="choice-text">${choice.text}</div>
                            <div class="choice-points">Point: ${choice.points}</div>
                        </div>
                     </div>`;
        });
        html += '</div>';
    }
    
    html += '<button class="back-btn">Tilbage</button></div>';
    container.innerHTML = html;
    
    // Tilføj event listener til tilbage-knap
    container.querySelector('.back-btn').addEventListener('click', () => {
        const currentStep = userChoices[scenarioId]?.currentStep || 'start';
        displayStep(scenarioId, currentStep, container);
    });
}

/**
 * Håndterer browser-scenarie-links
 * @param {string} url - URL der skal navigeres til
 * @param {string} scenarioId - ID for scenariet der skal vises
 */
function handleBrowserLink(url, scenarioId) {
    // Åbn browser-vindue hvis ikke allerede åbent
    const browserAppWindow = document.getElementById('browser-app-window');
    if (!browserAppWindow) return;
    
    // Tjek om vi er i mobilvisning
    const isMobile = window.innerWidth <= 880;
    
    if (!isMobile) {
        // Luk alle åbne vinduer i desktop-mode
        const appWindows = document.querySelectorAll('.app-window');
        appWindows.forEach(window => {
            window.classList.remove('active');
        });
        
        const windowOverlay = document.querySelector('.window-overlay');
        if (windowOverlay) {
            windowOverlay.classList.add('active');
        }
    }
    
    // Vis browser-vindue
    browserAppWindow.classList.add('active');
    
    // Opdater browser-adresselinje
    const browserAddressBar = document.querySelector('.browser-address-bar .url-text');
    if (browserAddressBar) {
        browserAddressBar.textContent = url;
    }
    
    // Start scenarie
    if (scenarioId) {
        startScenario(scenarioId, '#browser-scenario-container');
    }
}

// Eksporter funktioner til brug i andre moduler
window.initializeScenarios = initializeScenarios;
window.startScenario = startScenario;
window.handleBrowserLink = handleBrowserLink;