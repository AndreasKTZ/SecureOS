/**
 * responsiveHandler.js
 * Håndterer responsivt design og skift mellem desktop og mobil visning
 */

// Konstanter for skærmstørrelser
const MOBILE_BREAKPOINT = 880;
const MEDIUM_SCREEN_MAX = 1200;

/**
 * Hovedfunktion til opsætning af responsiv håndtering
 */
function setupResponsiveHandler() {
    console.log('Initialiserer responsiveHandler');
    
    // Tjek for mobil ved opstart
    handleResponsiveLayout();
    
    // Lyt efter ændringer i vinduets størrelse
    window.addEventListener('resize', handleWindowResize);
}

/**
 * Håndterer ændringer i vinduets størrelse
 */
function handleWindowResize() {
    // Genindlæs siden hvis skærmbredden krydser mobil-breakpoint
    const isMobileNow = window.innerWidth <= MOBILE_BREAKPOINT;
    const wasMobile = document.body.classList.contains('mobile-view');
    
    if (wasMobile !== isMobileNow) {
        // Kun genindlæs hvis vi krydser breakpointet
        location.reload();
    } else {
        // Mindre justeringer baseret på skærmstørrelse uden at genindlæse siden
        updateResponsiveElements();
    }
}

/**
 * Indstiller layout baseret på aktuel skærmstørrelse
 */
function handleResponsiveLayout() {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const isMediumScreen = window.innerWidth > MOBILE_BREAKPOINT && window.innerWidth <= MEDIUM_SCREEN_MAX;
    
    if (isMobile) {
        setupMobileView();
    } else if (isMediumScreen) {
        setupMediumScreenView();
    } else {
        setupDesktopView();
    }
}

/**
 * Opsætter mobilvisning
 */
function setupMobileView() {
    document.body.classList.add('mobile-view');
    document.body.classList.remove('medium-screen-view', 'desktop-view');
    
    // Skjul window overlay på mobil
    const windowOverlay = document.querySelector('.window-overlay');
    if (windowOverlay) {
        windowOverlay.style.display = 'none';
    }
    // Skjul volume, wifi og alerts på mobil
    const volumeBtn = document.getElementById('volume-btn');
    const wifiBtn = document.getElementById('wifi-btn');
    const alerts = document.querySelector('.alerts');
    if (volumeBtn) volumeBtn.style.display = 'none';
    if (wifiBtn) wifiBtn.style.display = 'none';
    if (alerts) alerts.style.display = 'none';
    // Opsæt mobilspecifik opførsel for apps
    setupMobileAppsBehavior();
}

/**
 * Opsætter mobilspecifik opførsel for apps
 */
function setupMobileAppsBehavior() {
    // Mail app
    const mailAppWindow = document.getElementById('mail-app-window');
    if (mailAppWindow) {
        setupMailAppForMobile(mailAppWindow);
    }
    
    // File manager
    const fileManagerWindow = document.getElementById('file-manager-window');
    if (fileManagerWindow) {
        setupFileManagerForMobile(fileManagerWindow);
    }
    
    // Browser app
    const browserAppWindow = document.getElementById('browser-app-window');
    if (browserAppWindow) {
        setupBrowserAppForMobile(browserAppWindow);
    }
    
    // Nulstil aktiv app ved opstart på mobil
    resetActiveAppMobile();
}

/**
 * Opsætter mellemstor skærmvisning
 */
function setupMediumScreenView() {
    document.body.classList.add('medium-screen-view');
    document.body.classList.remove('mobile-view', 'desktop-view');
    
    // Justér vinduesstørrelser for mellemstore skærme
    adjustWindowSizesForMediumScreen();
}

/**
 * Opsætter desktopvisning
 */
function setupDesktopView() {
    document.body.classList.add('desktop-view');
    document.body.classList.remove('mobile-view', 'medium-screen-view');
    
    // Nulstil eventuelle mobile-specifikke ændringer
    resetMobileChanges();
}

/**
 * Justerer vinduesstørrelser til mellemstore skærme
 */
function adjustWindowSizesForMediumScreen() {
    const appWindows = document.querySelectorAll('.app-window');
    
    appWindows.forEach(window => {
        // Nulstil til standard centreret position
        window.style.top = '50%';
        window.style.left = '50%';
        window.style.transform = 'translate(-50%, -50%)';
        
        // Tjek om vinduet har specifik mellemstor skærm-størrelse i CSS
        // og tilføj kun klasse hvis nødvendigt
        if (!window.classList.contains('medium-screen-size')) {
            window.classList.add('medium-screen-size');
        }
    });
}

/**
 * Opdaterer responsive elementer uden at genindlæse siden
 */
function updateResponsiveElements() {
    // For eksempel justere taskbar elementer baseret på skærmbredde
    const isMediumScreen = window.innerWidth > MOBILE_BREAKPOINT && window.innerWidth <= MEDIUM_SCREEN_MAX;
    if (isMediumScreen) {
        // Skjul nogle elementer på mindre mellemstore skærme
        if (window.innerWidth <= 1050) {
            const optionalElements = document.querySelectorAll('#volume-btn, #wifi-btn');
            optionalElements.forEach(el => {
                if (el) el.style.display = 'none';
            });
            const alerts = document.querySelector('.alerts');
            if (alerts) alerts.style.display = 'none';
        } else {
            // Vis elementerne på større mellemstore skærme
            const optionalElements = document.querySelectorAll('#volume-btn, #wifi-btn');
            optionalElements.forEach(el => {
                if (el) el.style.display = '';
            });
            const alerts = document.querySelector('.alerts');
            if (alerts) alerts.style.display = '';
        }
    }
}

/**
 * Nulstiller mobil-specifikke ændringer
 */
function resetMobileChanges() {
    // Fjern mobile-specifikke back-buttons
    const mobileBackButtons = document.querySelectorAll('.mobile-back-button');
    mobileBackButtons.forEach(btn => {
        if (btn && btn.parentNode) {
            btn.parentNode.removeChild(btn);
        }
    });
    
    // Vis window overlay på desktop
    const windowOverlay = document.querySelector('.window-overlay');
    if (windowOverlay) {
        windowOverlay.style.display = '';
    }
}

/**
 * Nulstiller aktiv app ved opstart på mobil
 */
function resetActiveAppMobile() {
    const appWindows = document.querySelectorAll('.app-window');
    
    appWindows.forEach(window => {
        window.classList.remove('active');
    });
}

/**
 * Opsætter mail app til mobil visning
 * @param {HTMLElement} mailAppWindow - Mail app vinduet
 */
function setupMailAppForMobile(mailAppWindow) {
    const mailContent = mailAppWindow.querySelector('.mail-content');
    const mailList = mailAppWindow.querySelector('.mail-list');
    
    // Opret tilbage-knap til mail app
    if (mailContent && !mailContent.querySelector('.mobile-back-button')) {
        const backButton = document.createElement('button');
        backButton.className = 'mobile-back-button';
        backButton.innerHTML = '<i class="hgi hgi-solid hgi-arrow-left"></i> Tilbage til indbakke';
        backButton.style.display = 'none';
        
        // Indsæt tilbage-knap øverst i mail content
        mailContent.insertBefore(backButton, mailContent.firstChild);
        
        // Tilføj tilbage-knap klik begivenhed
        backButton.addEventListener('click', function() {
            if (mailList) {
                mailList.classList.remove('hidden');
            }
            mailContent.classList.remove('active');
            backButton.style.display = 'none';
            
            // Ryd scenario container
            const scenarioContainer = document.getElementById('scenario-container');
            if (scenarioContainer) {
                scenarioContainer.innerHTML = '<div class="placeholder-message"><p>Vælg en mail for at se indholdet</p></div>';
            }
        });
    }
    
    // Tilføj klik begivenhed til mail elementer
    if (mailList) {
        const mailItems = mailList.querySelectorAll('.mail-item.unread');
        mailItems.forEach(item => {
            item.addEventListener('click', function() {
                mailList.classList.add('hidden');
                if (mailContent) {
                    mailContent.classList.add('active');
                }
                const backButton = mailContent.querySelector('.mobile-back-button');
                if (backButton) {
                    backButton.style.display = 'flex';
                }
            });
        });
    }
}

/**
 * Opsætter filmanager til mobil visning
 * @param {HTMLElement} fileManagerWindow - Filmanager vinduet
 */
function setupFileManagerForMobile(fileManagerWindow) {
    const fileManagerSidebar = fileManagerWindow.querySelector('.file-manager-sidebar');
    const fileManagerContent = fileManagerWindow.querySelector('.file-manager-content');
    
    // Opret tilbage-knap til filmanager
    if (fileManagerContent && !fileManagerContent.querySelector('.mobile-back-button')) {
        const backButton = document.createElement('button');
        backButton.className = 'mobile-back-button';
        backButton.innerHTML = '<i class="hgi hgi-solid hgi-arrow-left"></i> Tilbage til mapper';
        backButton.style.display = 'none';
        
        // Indsæt tilbage-knap øverst i filmanager indhold
        fileManagerContent.insertBefore(backButton, fileManagerContent.firstChild);
        
        // Tilføj tilbage-knap klik begivenhed
        backButton.addEventListener('click', function() {
            if (fileManagerSidebar) {
                fileManagerSidebar.classList.remove('hidden');
            }
            if (fileManagerContent) {
                fileManagerContent.classList.remove('active');
            }
            backButton.style.display = 'none';
            
            // Nulstil indhold
            fileManagerContent.innerHTML = '<button class="mobile-back-button"><i class="hgi hgi-solid hgi-arrow-left"></i> Tilbage til mapper</button>';
            
            // Genopret event listener til den nye knap
            const newBackBtn = fileManagerContent.querySelector('.mobile-back-button');
            if (newBackBtn) {
                newBackBtn.addEventListener('click', function() {
                    if (fileManagerSidebar) {
                        fileManagerSidebar.classList.remove('hidden');
                    }
                    if (fileManagerContent) {
                        fileManagerContent.classList.remove('active');
                    }
                    this.style.display = 'none';
                });
            }
        });
    }
    
    // Tilføj klik begivenhed til sidebar elementer
    if (fileManagerSidebar) {
        const sidebarItems = fileManagerSidebar.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            if (item.dataset.scenario) {
                item.addEventListener('click', function() {
                    fileManagerSidebar.classList.add('hidden');
                    if (fileManagerContent) {
                        fileManagerContent.classList.add('active');
                    }
                    const backButton = fileManagerContent.querySelector('.mobile-back-button');
                    if (backButton) {
                        backButton.style.display = 'flex';
                    }
                });
            }
        });
    }
}

/**
 * Opsætter browser app til mobil visning
 * @param {HTMLElement} browserAppWindow - Browser app vinduet
 */
function setupBrowserAppForMobile(browserAppWindow) {
    const browserContent = browserAppWindow.querySelector('.browser-content');
    
    // Opret tilbage-knap til browser app
    if (browserContent && !browserContent.querySelector('.mobile-back-button')) {
        const backButton = document.createElement('button');
        backButton.className = 'mobile-back-button';
        backButton.innerHTML = '<i class="hgi hgi-solid hgi-arrow-left"></i> Tilbage til browser';
        backButton.style.display = 'none';
        
        // Indsæt tilbage-knap øverst i browser indhold
        browserContent.insertBefore(backButton, browserContent.firstChild);
    }
}

/**
 * Åbner en app på mobil
 * @param {string} windowId - ID på det vindue, der skal åbnes
 */
function openAppMobile(windowId) {
    // Skjul alle vinduer først
    const appWindows = document.querySelectorAll('.app-window');
    appWindows.forEach(window => {
        window.classList.remove('active');
    });
    
    // Vis det valgte vindue
    const appWindow = document.getElementById(windowId);
    if (appWindow) {
        appWindow.classList.add('active');
        
        // Nulstil visningsstatusen
        resetAppMobileState(windowId, appWindow);
    }
}

/**
 * Nulstiller app tilstand på mobil
 * @param {string} windowId - ID på vindue
 * @param {HTMLElement} appWindow - App vindue element
 */
function resetAppMobileState(windowId, appWindow) {
    if (windowId === 'mail-app-window') {
        const mailList = appWindow.querySelector('.mail-list');
        const mailContent = appWindow.querySelector('.mail-content');
        const backButton = appWindow.querySelector('.mobile-back-button');
        
        if (mailList && mailContent) {
            mailList.classList.remove('hidden');
            mailContent.classList.remove('active');
            if (backButton) backButton.style.display = 'none';
        }
    }
    else if (windowId === 'file-manager-window') {
        const sidebar = appWindow.querySelector('.file-manager-sidebar');
        const content = appWindow.querySelector('.file-manager-content');
        const backButton = appWindow.querySelector('.mobile-back-button');
        
        if (sidebar && content) {
            sidebar.classList.remove('hidden');
            content.classList.remove('active');
            if (backButton) backButton.style.display = 'none';
        }
    }
    else if (windowId === 'browser-app-window') {
        const backButton = appWindow.querySelector('.mobile-back-button');
        if (backButton) backButton.style.display = 'none';
    }
}

// Eksporter funktioner til brug i andre moduler
window.setupResponsiveHandler = setupResponsiveHandler;
window.openAppMobile = openAppMobile;