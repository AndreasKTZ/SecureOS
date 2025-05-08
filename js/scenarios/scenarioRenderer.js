/**
 * scenarioRenderer.js
 * Håndterer rendering af scenarier i brugergrænsefladen
 */

// Animationskonfiguration
const ANIMATION_CONFIG = {
    FADE_IN_DURATION: 300,
    CHOICE_STAGGER: 100,
    ENDING_DELAY: 500
};

// CSS klasser for sikkerhedsniveauer
const SECURITY_CLASSES = {
    good: 'security-good',
    neutral: 'security-neutral',
    bad: 'security-bad'
};

/**
 * Initialiserer scenarierender
 */
function initScenarioRenderer() {
    console.log('Initialiserer scenarierender');
    
    // Tilføj eventuelle globale event listeners hvis nødvendigt
    document.addEventListener('DOMContentLoaded', setupGlobalEventListeners);
}

/**
 * Opsætter globale event listeners
 */
function setupGlobalEventListeners() {
    // Lyt efter klik-events på dynamisk tilføjede scenarie-elementer
    document.addEventListener('click', function(event) {
        // Håndter klik på valgmuligheder
        if (event.target.classList.contains('choice-btn')) {
            handleChoiceClick(event.target);
        }
        
        // Håndter klik på genstart-knap
        if (event.target.classList.contains('restart-btn')) {
            handleRestartClick(event.target);
        }
        
        // Håndter klik på opsummerings-knap
        if (event.target.classList.contains('summary-btn')) {
            handleSummaryClick(event.target);
        }
        
        // Håndter klik på tilbage-knap i opsummering
        if (event.target.classList.contains('back-btn')) {
            handleBackClick(event.target);
        }
    });
}

/**
 * Håndterer klik på en valgmulighed
 * @param {HTMLElement} choiceButton - Den klikkede valgknap
 */
function handleChoiceClick(choiceButton) {
    // Hent data fra button
    const nextStep = choiceButton.dataset.next;
    const security = choiceButton.dataset.security;
    const points = choiceButton.dataset.points || 0;
    const text = choiceButton.textContent.trim();
    const browserLink = choiceButton.dataset.browserLink;
    
    // Find scenarie-id og container
    const scenarioContainer = findParentScenarioContainer(choiceButton);
    if (!scenarioContainer) return;
    
    const scenarioId = getScenarioIdFromContainer(scenarioContainer);
    if (!scenarioId) return;
    
    // Animer valget
    animateChoice(choiceButton);
    
    // Håndter browser-link hvis det findes
    if (browserLink) {
        if (typeof handleBrowserLink === 'function') {
            // Brug ventetid for at få animationen af valget til at vises før overgang
            setTimeout(() => {
                handleBrowserLink(browserLink, nextStep);
            }, ANIMATION_CONFIG.FADE_IN_DURATION);
        }
        return;
    }
    
    // Gem valget
    if (typeof saveChoice === 'function') {
        saveChoice(scenarioId, getCurrentStepId(scenarioContainer), nextStep, security, points, text);
    }
    
    // Vis næste trin
    setTimeout(() => {
        renderScenarioStep(scenarioId, nextStep, scenarioContainer);
    }, ANIMATION_CONFIG.FADE_IN_DURATION);
}

/**
 * Håndterer klik på genstart-knap
 * @param {HTMLElement} restartButton - Den klikkede genstart-knap
 */
function handleRestartClick(restartButton) {
    // Find scenarie-id og container
    const scenarioContainer = findParentScenarioContainer(restartButton);
    if (!scenarioContainer) return;
    
    const scenarioId = getScenarioIdFromContainer(scenarioContainer);
    if (!scenarioId) return;
    
    // Nulstil scenarie
    if (typeof resetScenario === 'function') {
        resetScenario(scenarioId, scenarioContainer);
    } else {
        // Backup-løsning
        renderScenarioStep(scenarioId, 'start', scenarioContainer);
    }
}

/**
 * Håndterer klik på opsummerings-knap
 * @param {HTMLElement} summaryButton - Den klikkede opsummerings-knap
 */
function handleSummaryClick(summaryButton) {
    // Find scenarie-id og container
    const scenarioContainer = findParentScenarioContainer(summaryButton);
    if (!scenarioContainer) return;
    
    const scenarioId = getScenarioIdFromContainer(scenarioContainer);
    if (!scenarioId) return;
    
    // Vis opsummering
    if (typeof showSummary === 'function') {
        showSummary(scenarioId, scenarioContainer);
    } else {
        // Backup-løsning
        renderScenarioSummary(scenarioId, scenarioContainer);
    }
}

/**
 * Håndterer klik på tilbage-knap
 * @param {HTMLElement} backButton - Den klikkede tilbage-knap
 */
function handleBackClick(backButton) {
    // Find scenarie-id og container
    const scenarioContainer = findParentScenarioContainer(backButton);
    if (!scenarioContainer) return;
    
    const scenarioId = getScenarioIdFromContainer(scenarioContainer);
    if (!scenarioId) return;
    
    // Hent aktuelle trin fra brugervalg
    const currentStep = getCurrentStepFromUserChoices(scenarioId) || 'start';
    
    // Gå tilbage til aktuelle trin
    renderScenarioStep(scenarioId, currentStep, scenarioContainer);
}

/**
 * Finder parent scenarie-container for et element
 * @param {HTMLElement} element - Element at finde container for
 * @returns {HTMLElement|null} Scenarie-container eller null hvis ikke fundet
 */
function findParentScenarioContainer(element) {
    // Kandidater for container-elementer
    const containerCandidates = [
        '.scenario-container', 
        '#scenario-container',
        '#browser-scenario-container',
        '#usb-scenario-container'
    ];
    
    // Check for hver kandidat
    for (const selector of containerCandidates) {
        const container = element.closest(selector);
        if (container) return container;
    }
    
    return null;
}

/**
 * Henter scenarie-id fra en scenarie-container
 * @param {HTMLElement} container - Scenarie-container
 * @returns {string|null} Scenarie-id eller null hvis ikke fundet
 */
function getScenarioIdFromContainer(container) {
    // Prøv at hente fra data-attribut
    if (container.dataset.scenarioId) {
        return container.dataset.scenarioId;
    }
    
    // Prøv at udlede fra container-id
    const containerId = container.id;
    if (containerId === 'usb-scenario-container') {
        return 'unknown-usb';
    }
    if (containerId === 'browser-scenario-container') {
        return 'browser-security';
    }
    
    // Prøv at finde fra header
    const header = container.querySelector('.scenario-header h2');
    if (header) {
        const title = header.textContent.trim();
        
        // Match titel med scenarie-id
        if (title.includes('Personlige Oplysninger')) return 'personal-info';
        if (title.includes('Ukendt USB')) return 'unknown-usb';
        if (title.includes('Sikker Web')) return 'browser-security';
    }
    
    // Kunne ikke bestemme scenarie-id
    console.warn('Kunne ikke bestemme scenarie-id for container:', container);
    return null;
}

/**
 * Henter aktuelle trin-id fra en scenarie-container
 * @param {HTMLElement} container - Scenarie-container
 * @returns {string|null} Trin-id eller null hvis ikke fundet
 */
function getCurrentStepId(container) {
    // Prøv at hente fra data-attribut
    if (container.dataset.currentStep) {
        return container.dataset.currentStep;
    }
    
    // Tjek for afslutning
    if (container.querySelector('.scenario-ending')) {
        return 'ending';
    }
    
    // Prøv at finde fra valg-knapper
    const choices = container.querySelectorAll('.choice-btn');
    if (choices.length > 0) {
        // Returnér parent-step baseret på første valg
        // Dette er en heuristisk tilgang og ikke 100% pålidelig
        return choices[0].dataset.parentStep || 'unknown';
    }
    
    return null;
}

/**
 * Henter aktuelt trin fra brugervalg
 * @param {string} scenarioId - Scenarie-id
 * @returns {string|null} Trin-id eller null hvis ikke fundet
 */
function getCurrentStepFromUserChoices(scenarioId) {
    let userChoices = {};
    
    // Hent brugervalg enten fra global variabel eller localStorage
    if (typeof getUserChoices === 'function') {
        userChoices = getUserChoices();
    } else if (window.userChoices) {
        userChoices = window.userChoices;
    } else {
        try {
            const choicesString = localStorage.getItem('userChoices');
            userChoices = choicesString ? JSON.parse(choicesString) : {};
        } catch (e) {
            console.error('Fejl ved hentning af brugervalg:', e);
            userChoices = {};
        }
    }
    
    return userChoices[scenarioId]?.currentStep || null;
}

/**
 * Animerer et valg
 * @param {HTMLElement} choiceButton - Valgknappen der skal animeres
 */
function animateChoice(choiceButton) {
    // Tilføj klasse for valgt
    choiceButton.classList.add('selected');
    
    // Deaktiver alle valgknapper
    const allChoices = choiceButton.closest('.choices').querySelectorAll('.choice-btn');
    allChoices.forEach(btn => {
        btn.disabled = true;
        if (btn !== choiceButton) {
            btn.classList.add('not-selected');
        }
    });
}

/**
 * Renderer et scenarietrin
 * @param {string} scenarioId - Scenarie-id
 * @param {string} stepId - Trin-id
 * @param {HTMLElement} container - Container til rendering
 */
function renderScenarioStep(scenarioId, stepId, container) {
    // Hent scenarie og trin
    const scenario = getScenario(scenarioId);
    const step = scenario?.steps[stepId];
    
    if (!scenario || !step) {
        console.error(`Scenarie '${scenarioId}' eller trin '${stepId}' ikke fundet`);
        renderErrorMessage(container, `Kunne ikke indlæse scenarie '${scenarioId}' trin '${stepId}'`);
        return;
    }
    
    // Gem scenarie-id og trin-id på containeren
    container.dataset.scenarioId = scenarioId;
    container.dataset.currentStep = stepId;
    
    // Byg HTML for trinnet
    let html = `<div class="scenario-header"><h2>${scenario.title}</h2></div>
                <div class="scenario-body"><p>${step.content}</p></div>`;
    
    if (step.question) {
        html += `<div class="scenario-question"><p>${step.question}</p></div>`;
    }
    
    if (step.choices) {
        html += '<div class="choices">';
        step.choices.forEach(choice => {
            // Tilføj data-attributter til alle choice-buttons
            const securityAttr = choice.security ? `data-security="${choice.security}"` : '';
            const pointsAttr = choice.points ? `data-points="${choice.points}"` : 'data-points="0"';
            const browserLinkAttr = choice.browserLink ? `data-browser-link="${choice.browserLink}"` : '';
            const parentStepAttr = `data-parent-step="${stepId}"`;
            
            html += `<button class="choice-btn" data-next="${choice.next}" ${securityAttr} ${pointsAttr} ${browserLinkAttr} ${parentStepAttr}>${choice.text}</button>`;
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
    
    // Indsæt HTML i containeren med fade-effekt
    container.style.opacity = '0';
    container.innerHTML = html;
    
    // Animer indfadning
    setTimeout(() => {
        container.style.transition = `opacity ${ANIMATION_CONFIG.FADE_IN_DURATION}ms ease-in-out`;
        container.style.opacity = '1';
        
        // Animer valgmuligheder med staggered indfadning
        animateChoiceOptions(container);
    }, 50);
}

/**
 * Animerer valgmuligheder med staggered indfadning
 * @param {HTMLElement} container - Scenarie-container
 */
function animateChoiceOptions(container) {
    const choices = container.querySelectorAll('.choice-btn');
    
    choices.forEach((choice, index) => {
        choice.style.opacity = '0';
        choice.style.transform = 'translateY(10px)';
        choice.style.transition = `opacity ${ANIMATION_CONFIG.FADE_IN_DURATION}ms ease-in-out, transform ${ANIMATION_CONFIG.FADE_IN_DURATION}ms ease-in-out`;
        
        setTimeout(() => {
            choice.style.opacity = '1';
            choice.style.transform = 'translateY(0)';
        }, ANIMATION_CONFIG.CHOICE_STAGGER * index);
    });
    
    // Animer ending hvis til stede
    const ending = container.querySelector('.scenario-ending');
    if (ending) {
        ending.style.opacity = '0';
        ending.style.transform = 'translateY(10px)';
        ending.style.transition = `opacity ${ANIMATION_CONFIG.FADE_IN_DURATION}ms ease-in-out, transform ${ANIMATION_CONFIG.FADE_IN_DURATION}ms ease-in-out`;
        
        setTimeout(() => {
            ending.style.opacity = '1';
            ending.style.transform = 'translateY(0)';
        }, ANIMATION_CONFIG.ENDING_DELAY);
    }
}

/**
 * Renderer en opsummering af brugervalg
 * @param {string} scenarioId - Scenarie-id
 * @param {HTMLElement} container - Container til rendering
 */
function renderScenarioSummary(scenarioId, container) {
    // Hent scenarie og brugervalg
    const scenario = getScenario(scenarioId);
    let userChoices = {};
    
    // Hent brugervalg
    if (typeof getUserChoices === 'function') {
        userChoices = getUserChoices();
    } else {
        try {
            const choicesString = localStorage.getItem('userChoices');
            userChoices = choicesString ? JSON.parse(choicesString) : {};
        } catch (e) {
            console.error('Fejl ved hentning af brugervalg:', e);
        }
    }
    
    const choices = userChoices[scenarioId]?.choices || [];
    
    // Byg HTML for opsummeringen
    let html = `<div class="summary-container">
                    <h2>Valg Oversigt - ${scenario ? scenario.title : scenarioId}</h2>`;
    
    if (choices.length === 0) {
        html += '<p>Ingen valg foretaget endnu.</p>';
    } else {
        html += '<div class="choices-summary">';
        choices.forEach((choice, index) => {
            // Hent spørgsmålsteksten hvis muligt
            let questionText = '';
            if (scenario && scenario.steps[choice.step] && scenario.steps[choice.step].question) {
                questionText = scenario.steps[choice.step].question;
            }
            
            // Bestem sikkerhedsklasse
            const securityClass = SECURITY_CLASSES[choice.security] || '';
            
            // Format point-display
            const pointsDisplay = choice.points > 0 ? `+${choice.points}` : choice.points;
            const pointsClass = choice.points > 0 ? 'positive' : (choice.points < 0 ? 'negative' : 'neutral');
            
            html += `<div class="choice-item ${securityClass}">
                        <div class="choice-number">${index + 1}</div>
                        <div class="choice-details">
                            <div class="choice-question">${questionText}</div>
                            <div class="choice-text">${choice.text}</div>
                            <div class="choice-points points ${pointsClass}">${pointsDisplay} point</div>
                        </div>
                     </div>`;
        });
        html += '</div>';
    }
    
    html += '<button class="back-btn">Tilbage</button></div>';
    
    // Indsæt HTML i containeren med fade-effekt
    container.style.opacity = '0';
    container.innerHTML = html;
    
    // Animer indfadning
    setTimeout(() => {
        container.style.transition = `opacity ${ANIMATION_CONFIG.FADE_IN_DURATION}ms ease-in-out`;
        container.style.opacity = '1';
    }, 50);
}

/**
 * Renderer en fejlmeddelelse
 * @param {HTMLElement} container - Container til rendering
 * @param {string} message - Fejlmeddelelsen
 */
function renderErrorMessage(container, message) {
    const html = `
        <div class="scenario-error">
            <i class="hgi hgi-solid hgi-warning-octagon" style="color: #FF4040; font-size: 32px;"></i>
            <h3>Fejl ved indlæsning af scenarie</h3>
            <p>${message}</p>
            <button class="restart-btn">Prøv igen</button>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Renderer en indlæsningsindikator
 * @param {HTMLElement} container - Container til rendering
 */
function renderLoadingIndicator(container) {
    const html = `
        <div class="scenario-loading">
            <div class="loading-spinner"></div>
            <p>Indlæser scenarie...</p>
        </div>
    `;
    
    container.innerHTML = html;
}

// Eksporter funktioner til brug i andre moduler
window.initScenarioRenderer = initScenarioRenderer;
window.renderScenarioStep = renderScenarioStep;
window.renderScenarioSummary = renderScenarioSummary;
window.renderErrorMessage = renderErrorMessage;
window.renderLoadingIndicator = renderLoadingIndicator;