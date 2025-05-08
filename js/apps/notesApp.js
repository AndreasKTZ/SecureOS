/**
 * notesApp.js
 * Håndterer note-appens funktionalitet
 */

// Noter app state
let activeNote = null;
const defaultNotes = [
    {
        id: 'usb-devices',
        title: 'Tænk før du tilslutter en ukendt USB-enhed',
        icon: 'hgi-usb',
        content: `
            <h1>Tænk før du tilslutter en ukendt USB-enhed</h1>
            <div class="note-section">
                <h2><i class="hgi hgi-solid hgi-chart"></i> Statistik</h2>
                <p>28% af danske SMV'er oplevede mindst ét it-sikkerhedsbrud i 2021 – ofte pga. malware eller menneskelige fejl, herunder inficerede lagermedier.</p>
                <h2><i class="hgi hgi-solid hgi-user-question-02"></i> Hvorfor det er vigtigt</h2>
                <p>Fundne/givne USB-nøgler kan skjule automatiske scripts (fx "Rubber Ducky"-angreb) eller ransomware, som hurtigt spreder sig i netværket.</p>
                <h2><i class="hgi hgi-solid hgi-bulb"></i> Hvad kan jeg gøre?</h2>
                <ul>
                    <li>Brug en "off-net" scannings-pc til ikke-legitime medier</li>
                    <li>Deaktiver AutoRun og overvej at whitelist godkendte USB-ID'er på firmamaskiner</li>
                </ul>
            </div>
        `
    },
    {
        id: 'phishing-emails',
        title: 'Phishing-mails: klik-tænk-slet',
        icon: 'hgi-mail-02',
        content: `
            <h1>Phishing-mails: klik-tænk-slet</h1>
            <div class="note-section">
                <h2><i class="hgi hgi-solid hgi-chart"></i> Statistik</h2>
                <p>6.533 anmeldelser om phishing/smishing/vishing hos politiets National Center for It-Kriminalitet (NCIK) i 2023 – 18% af alle it-økonomiske forbrydelser.</p>
                <h2><i class="hgi hgi-solid hgi-user-question-02"></i> Hvorfor det er vigtigt</h2>
                <p>Et forkert klik kan udløse credential theft eller fakturasvindel med store tab og driftsstop.</p>
                <h2><i class="hgi hgi-solid hgi-bulb"></i> Hvad kan jeg gøre?</h2>
                <ul>
                    <li>Hold musen over links før du klikker</li>
                    <li>Rapportér mistænkelige mails i Outlook med "Report"-funktionen</li>
                    <li>Træn på interne phishingtests</li>
                </ul>
            </div>
        `
    },
    {
        id: 'fake-login-mitid',
        title: 'Falske login-sider & MitID-fup',
        icon: 'hgi-login-method',
        content: `
            <h1>Falske login-sider & MitID-fup</h1>
            <div class="note-section">
                <h2><i class="hgi hgi-solid hgi-chart"></i> Statistik</h2>
                <p>2.953 sager om misbrug af adgang til tjenester (netbank, streaming mv.) i 2023 + 464 mio. kr. stjålet via netbank/investeringssvindel det samme år.</p>
                <h2><i class="hgi hgi-solid hgi-user-question-02"></i> Hvorfor det er vigtigt</h2>
                <p>Kriminelle kopierer firma- eller MitID-portaler og narrer dig til at "swipe" – så overtager de kontoen i realtid.</p>
                <h2><i class="hgi hgi-solid hgi-bulb"></i> Hvad kan jeg gøre?</h2>
                <ul>
                    <li>Tjek altid domænet (fx mitid.dk vs. m1tid.dk)</li>
                    <li>Brug kun egne bogmærker, og stop hvis MitID-appen viser <b>falske</b> oplysninger</li>
                </ul>
            </div>
        `
    },
    {
        id: 'passwords',
        title: 'Adgangskoder & password-manager',
        icon: 'hgi-key-02',
        content: `
            <h1>Adgangskoder & password-manager</h1>
            <div class="note-section">
                <h2><i class="hgi hgi-solid hgi-chart"></i> Statistik</h2>
                <p>40% af danskerne skifter kode sjældnere end én gang om året, og 12% gør det aldrig (YouGov/Gjensidige 2024).</p>
                <h2><i class="hgi hgi-solid hgi-user-question-02"></i> Hvorfor det er vigtigt</h2>
                <p>Genbrugte eller forældede koder er årsag til kontoovertagelser – de lækkes i store sæt (fx <i>rockyou2024</i> med 9,9 mia. koder).</p>
                <h2><i class="hgi hgi-solid hgi-bulb"></i> Hvad kan jeg gøre?</h2>
                <ul>
                    <li>Brug en password-manager</li>
                    <li>Lav lange pass-sætninger (&gt; 12 tegn)</li>
                    <li>Slå altid 2FA til</li>
                </ul>
            </div>
        `
    },
    {
        id: 'updates-backup',
        title: 'Opdatering & backup – det kedelige grundarbejde',
        icon: 'hgi-refresh',
        content: `
            <h1>Opdatering & backup – det kedelige grundarbejde</h1>
            <div class="note-section">
                <h2><i class="hgi hgi-solid hgi-chart"></i> Statistik</h2>
                <p>16% af danske SMV'er havde <b>hverken</b> regelmæssig backup <b>eller</b> softwareopdatering i 2022.</p>
                <h2><i class="hgi hgi-solid hgi-user-question-02"></i> Hvorfor det er vigtigt</h2>
                <p>Uaktuelle systemer giver "åbne døre" (fx Hafnium/Log4J). Uden backup bliver ransomware ofte et valg mellem at betale eller starte forfra.</p>
                <h2><i class="hgi hgi-solid hgi-bulb"></i> Hvad kan jeg gøre?</h2>
                <ul>
                    <li>Sæt "patch-tirsdag" i kalenderen</li>
                    <li>Brug 3-2-1-backup-regel (3 kopier, 2 medier, 1 off-site)</li>
                    <li>Test gendannelse kvartalsvis</li>
                </ul>
            </div>
        `
    },
    {
        id: 'phone-scam',
        title: 'Telefonsvindel & spoofing – lær at lægge på',
        icon: 'hgi-smart-phone-02',
        content: `
            <h1>Telefonsvindel & spoofing – lær at lægge på</h1>
            <div class="note-section">
                <h2><i class="hgi hgi-solid hgi-chart"></i> Statistik</h2>
                <p>189.000 danskere blev udsat for internetrelateret kriminalitet i 2023; NCIK ser kraftig vækst i spoofede "bank-opkald".</p>
                <h2><i class="hgi hgi-solid hgi-user-question-02"></i> Hvorfor det er vigtigt</h2>
                <p>Social engineering over telefonen kan få dig til at installere fjernsupport eller overføre penge til "sikker konto".</p>
                <h2><i class="hgi hgi-solid hgi-bulb"></i> Hvad kan jeg gøre?</h2>
                <ul>
                    <li>Ring selv tilbage på bankens officielle nummer</li>
                    <li>Giv aldrig personlige oplysninger til andre</li>
                    <li>Yderligere råd: <a href="https://www.jyskebank.dk/tema/sikkerhed/typer-af-svindel" target="_blank">https://www.jyskebank.dk/tema/sikkerhed/typer-af-svindel</a></li>
                </ul>
            </div>
        `
    }
];

/**
 * Initialiserer note-app
 */
function setupNotesApp() {
    console.log('Initialiserer noter app');
    
    // DOM Elementer
    const notesAppBtn = document.getElementById('notes-app-btn');
    const notesAppWindow = document.getElementById('notes-app-window');
    
    // Tilføj event listener til notes-knap
    if (notesAppBtn) {
        notesAppBtn.addEventListener('click', function() {
            openNotesApp();
        });
    }
    
    // Tilføj note-navigation hvis det ikke findes endnu
    setupNotesNavigation();
    
    // Tilføj keyboard navigation
    setupKeyboardNavigation();
}

/**
 * Åbner note-appen
 */
function openNotesApp() {
    // Tjek om vi er i mobilvisning
    const isMobile = window.innerWidth <= 880;
    
    if (isMobile) {
        if (typeof openAppMobile === 'function') {
            openAppMobile('notes-app-window');
        }
    } else {
        if (typeof openWindow === 'function') {
            openWindow('notes-app-window');
        }
    }
    
    // Vis standard velkomstnote hvis ingen er aktiv
    if (!activeNote) {
        displayNote('usb-devices');
    }
    
    // Fokuser på den aktive note-option
    const activeOption = document.querySelector('.note-option.active');
    if (activeOption) {
        activeOption.focus();
    }
}

/**
 * Opsætter note-navigation
 */
function setupNotesNavigation() {
    const notesAppWindow = document.getElementById('notes-app-window');
    if (!notesAppWindow) return;
    
    const notesContent = notesAppWindow.querySelector('.notes-content');
    if (!notesContent) return;
    
    // Tjek om navigation allerede findes
    if (notesContent.querySelector('.notes-navigation')) return;
    
    // Opret navigationselement
    const navigation = document.createElement('div');
    navigation.className = 'notes-navigation';
    
    // Tilføj notevalg
    defaultNotes.forEach(note => {
        const noteOption = document.createElement('div');
        noteOption.className = 'note-option';
        noteOption.dataset.noteId = note.id;
        noteOption.tabIndex = 0; // Gør elementet fokuserbart
        
        // Tilføj ikon og titel
        noteOption.innerHTML = `
            <i class="hgi hgi-solid ${note.icon}"></i>
            <span>${note.title}</span>
        `;
        
        // Tilføj klikhåndtering
        noteOption.addEventListener('click', function() {
            displayNote(this.dataset.noteId);
        });
        
        // Tilføj keyboard support
        noteOption.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                displayNote(this.dataset.noteId);
            }
        });
        
        navigation.appendChild(noteOption);
    });
    
    // Indsæt navigation øverst i notesContent
    notesContent.insertBefore(navigation, notesContent.firstChild);
    
    // Tilføj toggle-knap for mobil
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'notes-nav-toggle';
    toggleBtn.innerHTML = '<i class="hgi hgi-solid hgi-menu-hamburger"></i>';
    toggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
    toggleBtn.addEventListener('click', function() {
        navigation.classList.toggle('show-mobile');
        this.setAttribute('aria-expanded', navigation.classList.contains('show-mobile'));
    });
    
    notesContent.insertBefore(toggleBtn, notesContent.firstChild);
}

/**
 * Opsætter keyboard navigation
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Tjek om notes app er åben
        const notesAppWindow = document.getElementById('notes-app-window');
        if (!notesAppWindow || notesAppWindow.style.display === 'none') return;
        
        const noteOptions = document.querySelectorAll('.note-option');
        const activeOption = document.querySelector('.note-option.active');
        const activeIndex = Array.from(noteOptions).indexOf(activeOption);
        
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (activeIndex + 1) % noteOptions.length;
                noteOptions[nextIndex].focus();
                break;
                
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = (activeIndex - 1 + noteOptions.length) % noteOptions.length;
                noteOptions[prevIndex].focus();
                break;
        }
    });
}

/**
 * Viser en note baseret på ID
 * @param {string} noteId - ID for noten der skal vises
 */
function displayNote(noteId) {
    const notesAppWindow = document.getElementById('notes-app-window');
    if (!notesAppWindow) return;
    
    const notesContent = notesAppWindow.querySelector('.notes-content');
    if (!notesContent) return;
    
    // Find noten baseret på ID
    const note = defaultNotes.find(n => n.id === noteId);
    if (!note) return;
    
    // Opdater aktiv note-reference
    activeNote = noteId;
    
    // Fjern eksisterende note-indhold
    const existingContent = notesContent.querySelector('.note-content-container');
    if (existingContent) {
        existingContent.remove();
    }
    
    // Opret nyt note-indhold
    const contentContainer = document.createElement('div');
    contentContainer.className = 'note-content-container';
    contentContainer.innerHTML = note.content;
    
    // Tilføj indhold til note-vindue
    notesContent.appendChild(contentContainer);
    
    // Opdater aktiv klasse i navigation
    const noteOptions = notesContent.querySelectorAll('.note-option');
    noteOptions.forEach(option => {
        if (option.dataset.noteId === noteId) {
            option.classList.add('active');
            option.focus();
        } else {
            option.classList.remove('active');
        }
    });
    
    // Skjul mobil-navigation hvis synlig
    const navigation = notesContent.querySelector('.notes-navigation');
    if (navigation) {
        navigation.classList.remove('show-mobile');
    }
    
    // Scroll til toppen af indholdet
    contentContainer.scrollTop = 0;
}

// Eksporter funktioner til brug i andre moduler
window.setupNotesApp = setupNotesApp;
window.displayNote = displayNote;

// Aktiver horisontal scroll med lodret hjul på notes navigation
window.addEventListener('DOMContentLoaded', function() {
  const nav = document.querySelector('.notes-navigation');
  if (nav) {
    nav.addEventListener('wheel', function(e) {
      if (e.deltaY !== 0) {
        e.preventDefault();
        nav.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }
});