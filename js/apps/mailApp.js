/**
 * mailApp.js
 * Håndterer mail-appens funktionalitet
 */

// Mail app state
let selectedMailItem = null;

/**
 * Initialiserer mail-app
 */
function setupMailApp() {
    console.log('Initialiserer mail app');
    
    // DOM Elementer
    const mailAppBtn = document.getElementById('mail-app-btn');
    const mailAppWindow = document.getElementById('mail-app-window');
    const mailItems = mailAppWindow ? mailAppWindow.querySelectorAll('.mail-item') : null;
    
    // Tilføj event listener til mail-knap
    if (mailAppBtn) {
        mailAppBtn.addEventListener('click', function() {
            openMailApp();
        });
    }
    
    // Opsæt mail-elementer
    if (mailItems) {
        setupMailItems(mailItems);
    }
}

/**
 * Åbner mail-appen
 */
function openMailApp() {
    // Tjek om vi er i mobilvisning
    const isMobile = window.innerWidth <= 880;
    
    if (isMobile) {
        if (typeof openAppMobile === 'function') {
            openAppMobile('mail-app-window');
        }
    } else {
        if (typeof openWindow === 'function') {
            openWindow('mail-app-window');
        }
    }
    
    // Nulstil mail-visning
    resetMailView();
}

/**
 * Nulstiller mail-visning til standardtilstand
 */
function resetMailView() {
    const mailList = document.querySelector('.mail-list');
    const mailContent = document.querySelector('.mail-content');
    const scenarioContainer = document.getElementById('scenario-container');
    
    // Fjern fremhævning fra alle mail-elementer
    if (mailList) {
        const mailItems = mailList.querySelectorAll('.mail-item');
        mailItems.forEach(item => {
            item.classList.remove('active');
        });
    }
    
    // Nulstil scenarie-container
    if (scenarioContainer) {
        scenarioContainer.innerHTML = `
            <div class="placeholder-message">
                <p>Vælg en mail for at se indholdet</p>
            </div>
        `;
    }
    
    // Nulstil selected mail
    selectedMailItem = null;
}

/**
 * Opsætter mail-elementer med klik-håndtering
 * @param {NodeList} mailItems - Liste af mail-elementer
 */
function setupMailItems(mailItems) {
    mailItems.forEach(item => {
        // Tilføj kun klikhåndtering til ulæste mails (de læsbare)
        if (item.classList.contains('unread')) {
            item.addEventListener('click', function() {
                handleMailItemClick(this);
            });
        }
    });
}

/**
 * Håndterer klik på mail-elementer
 * @param {HTMLElement} item - Det klikkede mail-element
 */
function handleMailItemClick(item) {
    // Tjek om elementet har scenarie-data
    if (!item.dataset.scenario) return;
    
    // Fremhæv den valgte mail
    highlightSelectedMail(item);
    
    // Gem reference til valgt mail
    selectedMailItem = item;
    
    // Håndter scenarie baseret på mobilvisning
    const isMobile = window.innerWidth <= 880;
    
    if (isMobile) {
        handleMailScenarioMobile(item);
    } else {
        loadMailScenario(item.dataset.scenario, item.dataset.container);
    }
}

/**
 * Fremhæver valgt mail-element
 * @param {HTMLElement} item - Mail-element der skal fremhæves
 */
function highlightSelectedMail(item) {
    // Fjern aktiv klasse fra alle mail-elementer
    const mailItems = document.querySelectorAll('.mail-item');
    mailItems.forEach(i => {
        i.classList.remove('active');
    });
    
    // Tilføj aktiv klasse til valgt element
    item.classList.add('active');
}

/**
 * Håndterer mail-scenarie på mobil
 * @param {HTMLElement} item - Det valgte mail-element
 */
function handleMailScenarioMobile(item) {
    const mailList = document.querySelector('.mail-list');
    const mailContent = document.querySelector('.mail-content');
    
    // Skjul mailliste, vis mail-indhold
    if (mailList && mailContent) {
        mailList.classList.add('hidden');
        mailContent.classList.add('active');
        
        // Vis tilbage-knap
        const backButton = mailContent.querySelector('.mobile-back-button');
        if (backButton) {
            backButton.style.display = 'flex';
        }
    }
    
    // Indlæs scenarie
    loadMailScenario(item.dataset.scenario, item.dataset.container);
}

/**
 * Indlæser mail-scenarie
 * @param {string} scenarioId - ID for scenariet der skal indlæses
 * @param {string} containerSelector - CSS-selektor for containeren
 */
function loadMailScenario(scenarioId, containerSelector) {
    // Start scenariet hvis scenarioHandler er tilgængelig
    if (typeof startScenario === 'function') {
        startScenario(scenarioId, containerSelector);
    } else {
        console.error('scenarioHandler mangler - kan ikke indlæse mail-scenarie');
        
        // Vis fejlbesked i containeren
        const container = document.querySelector(containerSelector);
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>Kunne ikke indlæse scenarie. Scenariehåndtering er ikke tilgængelig.</p>
                </div>
            `;
        }
    }
}

/**
 * Markerer en mail som læst
 * @param {HTMLElement} mailItem - Mail-element der skal markeres som læst
 */
function markMailAsRead(mailItem) {
    if (mailItem && mailItem.classList.contains('unread')) {
        mailItem.classList.remove('unread');
        
        // Opdater tekst for at indikere at mailen er læst
        const timeElement = mailItem.querySelector('.mail-time');
        if (timeElement && timeElement.textContent === 'Ulæst') {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            timeElement.textContent = `${hours}:${minutes}`;
        }
    }
}

/**
 * Genererer en ny mail i indbakken
 * @param {Object} mailData - Data for den nye mail
 * @param {string} mailData.sender - Afsender af mailen
 * @param {string} mailData.subject - Emne på mailen
 * @param {string} mailData.preview - Forhåndsvisning af mailindhold
 * @param {string} mailData.scenarioId - ID for tilknyttet scenarie (valgfrit)
 * @param {string} mailData.containerSelector - Container selektor for scenarie (valgfrit)
 */
function addNewMail(mailData) {
    const mailList = document.querySelector('.mail-list');
    if (!mailList) return;
    
    // Opret nyt mail-element
    const newMail = document.createElement('div');
    newMail.className = 'mail-item unread';
    
    // Tilføj scenarie-data hvis tilgængeligt
    if (mailData.scenarioId && mailData.containerSelector) {
        newMail.dataset.scenario = mailData.scenarioId;
        newMail.dataset.container = mailData.containerSelector;
    }
    
    // Indhold til mail-element
    newMail.innerHTML = `
        <div class="mail-sender">${mailData.sender}</div>
        <div class="mail-subject">${mailData.subject}</div>
        <div class="mail-preview">${mailData.preview}</div>
        <div class="mail-time">Ulæst</div>
    `;
    
    // Indsæt øverst i indbakken
    mailList.insertBefore(newMail, mailList.firstChild);
    
    // Tilføj event listener
    newMail.addEventListener('click', function() {
        handleMailItemClick(this);
    });
    
    // Tilføj visuelt fokus for at gøre opmærksom på ny mail
    newMail.classList.add('new-mail-animation');
    setTimeout(() => {
        newMail.classList.remove('new-mail-animation');
    }, 3000);
    
    return newMail;
}

/**
 * Sletter en mail fra indbakken
 * @param {HTMLElement} mailItem - Mail-element der skal slettes
 */
function deleteMail(mailItem) {
    if (!mailItem) return;
    
    // Animér sletning
    mailItem.classList.add('mail-delete-animation');
    
    // Fjern elementet efter animation
    setTimeout(() => {
        if (mailItem.parentNode) {
            mailItem.parentNode.removeChild(mailItem);
        }
    }, 300);
}

/**
 * Svarer på en mail ved at åbne et nyt vindue
 * @param {string} to - Modtager email
 * @param {string} subject - Emne (typisk Re: original emne)
 * @param {string} originalContent - Oprindeligt indhold til citat
 */
function replyToMail(to, subject, originalContent) {
    // Her kunne tilføjes funktionalitet til at åbne et nyt vindue til 
    // at skrive svar, men dette er ikke en del af den primære scenarie-app
    console.log(`Svarer til: ${to}, Emne: ${subject}`);
    
    // Returner placeholder funktionalitet
    alert(`Svarfunktion ikke implementeret.\n\nVille svare til: ${to}\nEmne: ${subject}`);
}

// Eksporter funktioner til brug i andre moduler
window.setupMailApp = setupMailApp;
window.markMailAsRead = markMailAsRead;
window.addNewMail = addNewMail;
window.deleteMail = deleteMail;
window.replyToMail = replyToMail;