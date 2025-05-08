/**
 * utils.js
 * Samling af hjælpefunktioner til applikationen
 * Inkluderer tidsvisning, eksterne links, download af rapport og nulstillingsfunktionalitet
 */

/**
 * Initialiserer tidsvisning og opdatering
 */
function setupTimeDisplay() {
    console.log('Initialiserer tidsvisning');
    
    // Initialiser tid ved sideindlæsning
    updateTime();
    
    // Opdater tid hvert minut
    setInterval(updateTime, 60000);
}

/**
 * Opdaterer tidsvisningen i taskbar
 */
function updateTime() {
    // Hent aktuel dato
    const now = new Date();
    
    // Få ugedagens forkortelse på dansk
    const days = ['Søn.', 'Man.', 'Tir.', 'Ons.', 'Tor.', 'Fre.', 'Lør.'];
    const dayName = days[now.getDay()];
    
    // Få timer og minutter
    let hours = now.getHours();
    let minutes = now.getMinutes();
    
    // Tilføj foranstillet nul til minutter hvis nødvendigt
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    // Formater tidsstreng
    const timeString = `${dayName} ${hours}:${minutes}`;
    
    // Opdater tidselementet i DOM
    const timeElement = document.querySelector('.taskbar-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

/**
 * Initialiserer systemknapper (GitHub, download rapport, nulstil)
 */
function setupSystemButtons() {
    console.log('Initialiserer systemknapper');
    
    // Hent knapper
    const githubBtn = document.getElementById('github-btn');
    const downloadReportBtn = document.getElementById('document-validation-btn');
    const resetBtn = document.getElementById('reload-btn');
    
    // GitHub knap
    if (githubBtn) {
        githubBtn.addEventListener('click', openGithubRepository);
    }
    
    // Download rapport knap
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', confirmAndDownloadReport);
    }
    
    // Nulstil knap
    if (resetBtn) {
        resetBtn.addEventListener('click', confirmAndResetApplication);
    }
    
    // Skift baggrund knap
    setupBackgroundButton();
}

/**
 * Åbner GitHub repository i ny fane
 */
function openGithubRepository() {
    window.open("https://github.com/AndreasKTZ/SecureOS", "_blank");
}

/**
 * Viser bekræftelsesdialog og downloader projektrapport
 */
function confirmAndDownloadReport() {
    // Vis bekræftelsesdialog
    const confirmed = confirm('Vil du downloade projektrapport PDF-filen?');
    
    // Fortsæt kun hvis bruger bekræftede
    if (confirmed) {
        downloadProjectReport();
    }
}

/**
 * Downloader projektrapport PDF
 */
function downloadProjectReport() {
    // Sti til PDF-filen - skal være i dine projektfiler
    const pdfPath = 'docs/projekt_rapport.pdf';
    
    // Opret midlertidigt ankerelement for at udløse download
    const a = document.createElement('a');
    a.href = pdfPath;
    a.download = 'projekt_rapport.pdf'; // Navn filen gemmes som
    
    // Tilføj til body, klik og fjern
    document.body.appendChild(a);
    a.click();
    
    // Ryd op
    setTimeout(() => {
        document.body.removeChild(a);
    }, 100);
}

/**
 * Viser bekræftelsesdialog og nulstiller applikation
 */
function confirmAndResetApplication() {
    // Vis bekræftelsesdialog med tydelig advarsel
    const confirmed = confirm('Advarsel: Dette vil nulstille alle dine fremskridt og valg. Er du sikker?');
    
    // Fortsæt kun hvis bruger bekræftede
    if (confirmed) {
        resetApplication();
    }
}

/**
 * Nulstiller applikationen til starttilstand
 */
function resetApplication() {
    try {
        // Nulstil local storage data via storageManager
        if (typeof resetAllData === 'function') {
            resetAllData();
        } else {
            // Backup direkte nulstilling hvis storageManager ikke er tilgængelig
            localStorage.clear();
        }
        
        // Genindlæs siden for at anvende ændringer
        location.reload();
        
        return true;
    } catch (e) {
        console.error('Fejl ved nulstilling af applikation:', e);
        alert('Der opstod en fejl ved nulstilling af applikationen.');
        return false;
    }
}

/**
 * Opsætter baggrundsvalgknap
 */
function setupBackgroundButton() {
    const arrowUpBtn = document.getElementById('upload-bg-btn');
    
    if (arrowUpBtn) {
        // Opret skjult filinput
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        // Tjek for gemt baggrund
        applyBackgroundFromStorage();
        
        // Tilføj klikevent til pil op-knap
        arrowUpBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        // Håndter filvalg
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const imageDataUrl = e.target.result;
                    const desktop = document.querySelector('.desktop');
                    
                    if (desktop) {
                        desktop.style.backgroundImage = `url(${imageDataUrl})`;
                        
                        // Gem baggrund i storage
                        if (typeof saveCustomBackground === 'function') {
                            saveCustomBackground(imageDataUrl);
                        } else {
                            // Backup direkte lagring hvis storageManager ikke er tilgængelig
                            localStorage.setItem('customBackground', imageDataUrl);
                        }
                    }
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
        
        // Tilføj langt tryk for at nulstille baggrund
        let pressTimer;
        
        arrowUpBtn.addEventListener('mousedown', function() {
            pressTimer = window.setTimeout(function() {
                if (confirm('Nulstil til standard baggrund?')) {
                    const desktop = document.querySelector('.desktop');
                    
                    if (desktop) {
                        desktop.style.backgroundImage = 'url("../images/bg2.png")';
                        
                        // Fjern gemt baggrund
                        if (typeof resetCustomBackground === 'function') {
                            resetCustomBackground();
                        } else {
                            // Backup direkte fjernelse hvis storageManager ikke er tilgængelig
                            localStorage.removeItem('customBackground');
                        }
                    }
                }
            }, 800); // Langt tryk i 800ms
        });
        
        arrowUpBtn.addEventListener('mouseup', function() {
            clearTimeout(pressTimer);
        });
        
        arrowUpBtn.addEventListener('mouseleave', function() {
            clearTimeout(pressTimer);
        });
    }
}

/**
 * Genererer en unik ID
 * @returns {string} Unik ID streng
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Formaterer dato til læsevenlig visning
 * @param {Date|string} date - Dato objekt eller ISO streng
 * @returns {string} Formateret datostreng
 */
function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    if (!(date instanceof Date) || isNaN(date)) {
        return 'Ugyldig dato';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Begrænser en string til en maksimal længde og tilføjer ellipsis hvis nødvendigt
 * @param {string} text - Tekst der skal begrænses
 * @param {number} maxLength - Maksimal længde
 * @returns {string} Begrænset tekst
 */
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength) + '...';
}

// Eksporter funktioner til brug i andre moduler
window.setupTimeDisplay = setupTimeDisplay;
window.updateTime = updateTime;
window.setupSystemButtons = setupSystemButtons;
window.openGithubRepository = openGithubRepository;
window.confirmAndDownloadReport = confirmAndDownloadReport;
window.downloadProjectReport = downloadProjectReport;
window.confirmAndResetApplication = confirmAndResetApplication;
window.resetApplication = resetApplication;
window.generateUniqueId = generateUniqueId;
window.formatDate = formatDate;
window.truncateText = truncateText;