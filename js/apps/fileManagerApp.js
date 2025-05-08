/**
 * fileManagerApp.js
 * Håndterer filhåndterings-appens funktionalitet
 */

// Filhåndterings-app state
let activeFolder = null;

/**
 * Initialiserer filhåndterings-app
 */
function setupFileManagerApp() {
    console.log('Initialiserer filhåndtering app');
    
    // DOM Elementer
    const folderAppBtn = document.getElementById('folder-app-btn');
    const fileManagerWindow = document.getElementById('file-manager-window');
    const sidebarItems = fileManagerWindow ? fileManagerWindow.querySelectorAll('.sidebar-item') : null;
    
    // Tilføj event listener til filhåndteringsknap
    if (folderAppBtn) {
        folderAppBtn.addEventListener('click', function() {
            openFileManagerApp();
        });
    }
    
    // Opsæt sidebar-elementer
    if (sidebarItems) {
        setupSidebarItems(sidebarItems);
    }
}

/**
 * Åbner filhåndterings-appen
 */
function openFileManagerApp() {
    // Tjek om vi er i mobilvisning
    const isMobile = window.innerWidth <= 880;
    
    if (isMobile) {
        if (typeof openAppMobile === 'function') {
            openAppMobile('file-manager-window');
        }
    } else {
        if (typeof openWindow === 'function') {
            openWindow('file-manager-window');
        }
    }
}

/**
 * Opsætter sidebar-elementer med klik-håndtering
 * @param {NodeList} sidebarItems - Liste af sidebar-elementer
 */
function setupSidebarItems(sidebarItems) {
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            handleSidebarItemClick(this);
        });
    });
}

/**
 * Håndterer klik på sidebar-elementer
 * @param {HTMLElement} item - Det klikkede sidebar-element
 */
function handleSidebarItemClick(item) {
    // Fjern active klasse fra alle elementer
    const allItems = document.querySelectorAll('.sidebar-item');
    allItems.forEach(i => {
        i.classList.remove('active');
    });
    
    // Tilføj active klasse til det klikkede element
    item.classList.add('active');
    activeFolder = item;
    
    // Tjek om dette element har et scenarie tilknyttet
    if (item.dataset.scenario) {
        loadFileManagerScenario(item.dataset.scenario, item.dataset.container);
    } else {
        // Ellers indlæs mappeindhold baseret på elementets tekst
        loadFolderContent(item.querySelector('span').textContent);
    }
}

/**
 * Indlæser et scenarie i filhåndteringsappen
 * @param {string} scenarioId - ID for scenariet der skal indlæses
 * @param {string} containerSelector - CSS-selektor for containeren
 */
function loadFileManagerScenario(scenarioId, containerSelector) {
    // Tjek om vi er i mobilvisning
    const isMobile = window.innerWidth <= 880;
    
    if (isMobile) {
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
    
    // Start scenariet hvis scenarioHandler er tilgængelig
    if (typeof startScenario === 'function') {
        startScenario(scenarioId, containerSelector);
    } else {
        console.error('scenarioHandler mangler - kan ikke indlæse filhåndteringsscenarie');
        
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
 * Indlæser mappeindhold baseret på mappenavn
 * @param {string} folderName - Navnet på mappen der skal indlæses
 */
function loadFolderContent(folderName) {
    const fileManagerContent = document.querySelector('.file-manager-content');
    if (!fileManagerContent) return;
    
    // Ryd eksisterende indhold
    fileManagerContent.innerHTML = '';
    
    // Forskellige mappeindhold baseret på mappenavn
    switch (folderName) {
        case 'Hjem':
            loadHomeFolder(fileManagerContent);
            break;
        case 'Skrivebord':
            loadDesktopFolder(fileManagerContent);
            break;
        case 'Dokumenter':
            loadDocumentsFolder(fileManagerContent);
            break;
        case 'Billeder':
            loadPicturesFolder(fileManagerContent);
            break;
        case 'Overførsler':
            loadDownloadsFolder(fileManagerContent);
            break;
        case 'Cloud':
            loadCloudFolder(fileManagerContent);
            break;
        case 'Præsentationer':
        case 'Mødenoter':
        case 'Faktura Q1':
            loadWorkFolder(fileManagerContent, folderName);
            break;
        case 'Denne PC':
            loadThisPCFolder(fileManagerContent);
            break;
        default:
            // Standard tom mappe
            fileManagerContent.innerHTML = `
                <div class="empty-folder-message">
                    <p>Mappen "${folderName}" er tom.</p>
                </div>
            `;
    }
}

/**
 * Indlæser standardindhold for Hjem-mappen
 * @param {HTMLElement} container - Container til at vise indholdet
 */
function loadHomeFolder(container) {
    container.innerHTML = `
        <div class="folder-view">
            <div class="folder-header">
                <h2>Hjem</h2>
            </div>
            <div class="folder-content">
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-folder-01" style="color: #FFC300;"></i>
                    <span>Dokumenter</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-folder-01" style="color: #FFC300;"></i>
                    <span>Billeder</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-folder-01" style="color: #FFC300;"></i>
                    <span>Overførsler</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-folder-01" style="color: #FFC300;"></i>
                    <span>Skrivebord</span>
                </div>
            </div>
        </div>
    `;
    
    // Tilføj event listeners til mappe-elementer
    addFolderItemListeners(container);
}

/**
 * Indlæser standardindhold for Skrivebord-mappen
 * @param {HTMLElement} container - Container til at vise indholdet
 */
function loadDesktopFolder(container) {
    container.innerHTML = `
        <div class="folder-view">
            <div class="folder-header">
                <h2>Skrivebord</h2>
            </div>
            <div class="folder-content">
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-file-01" style="color: #44AAFF;"></i>
                    <span>Arbejdsplan.docx</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-pdf-02" style="color: #FF5555;"></i>
                    <span>Sikkerhedspolitik.pdf</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-xls-02" style="color: #44C85C;"></i>
                    <span>Budget_2025.xlsx</span>
                </div>
            </div>
        </div>
    `;
    
    // Tilføj event listeners til mappe-elementer
    addFolderItemListeners(container);
}

/**
 * Indlæser standardindhold for Dokumenter-mappen
 * @param {HTMLElement} container - Container til at vise indholdet
 */
function loadDocumentsFolder(container) {
    container.innerHTML = `
        <div class="folder-view">
            <div class="folder-header">
                <h2>Dokumenter</h2>
            </div>
            <div class="folder-content">
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-folder-01" style="color: #FFC300;"></i>
                    <span>Projekter</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-folder-01" style="color: #FFC300;"></i>
                    <span>Rapporter</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-file-01" style="color: #44AAFF;"></i>
                    <span>Mødereferat.docx</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-pdf-02" style="color: #FF5555;"></i>
                    <span>Kontrakt.pdf</span>
                </div>
            </div>
        </div>
    `;
    
    // Tilføj event listeners til mappe-elementer
    addFolderItemListeners(container);
}

/**
 * Indlæser standardindhold for Billeder-mappen
 * @param {HTMLElement} container - Container til at vise indholdet
 */
function loadPicturesFolder(container) {
    container.innerHTML = `
        <div class="folder-view">
            <div class="folder-header">
                <h2>Billeder</h2>
            </div>
            <div class="folder-content">
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-folder-01" style="color: #FFC300;"></i>
                    <span>Firmafest 2024</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-folder-01" style="color: #FFC300;"></i>
                    <span>Produktfotos</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-image-01" style="color: #00AAFF;"></i>
                    <span>Logo.png</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-image-01" style="color: #00AAFF;"></i>
                    <span>Team_foto.jpg</span>
                </div>
            </div>
        </div>
    `;
    
    // Tilføj event listeners til mappe-elementer
    addFolderItemListeners(container);
}

/**
 * Indlæser standardindhold for Overførsler-mappen
 * @param {HTMLElement} container - Container til at vise indholdet
 */
function loadDownloadsFolder(container) {
    container.innerHTML = `
        <div class="folder-view">
            <div class="folder-header">
                <h2>Overførsler</h2>
            </div>
            <div class="folder-content">
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-zip-02" style="color: #FF8800;"></i>
                    <span>data_backup.zip</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-file-management" style="color: #8855FF;"></i>
                    <span>update.exe</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-pdf-02" style="color: #FF5555;"></i>
                    <span>Manual.pdf</span>
                </div>
                <div class="folder-item file-suspicious">
                    <i class="hgi hgi-solid hgi-file-management" style="color: #FF4040;"></i>
                    <span>free_gift.exe</span>
                </div>
            </div>
        </div>
    `;
    
    // Tilføj event listeners til mappe-elementer
    addFolderItemListeners(container);
}

/**
 * Indlæser standardindhold for Cloud-mappen
 * @param {HTMLElement} container - Container til at vise indholdet
 */
function loadCloudFolder(container) {
    container.innerHTML = `
        <div class="folder-view">
            <div class="folder-header">
                <h2>Cloud</h2>
            </div>
            <div class="folder-content">
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-folder-01" style="color: #FFC300;"></i>
                    <span>Delte Dokumenter</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-folder-01" style="color: #FFC300;"></i>
                    <span>Projekter</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-file-01" style="color: #44AAFF;"></i>
                    <span>Team_Opgaver.docx</span>
                </div>
            </div>
        </div>
    `;
    
    // Tilføj event listeners til mappe-elementer
    addFolderItemListeners(container);
}

/**
 * Indlæser standardindhold for arbejdsrelaterede mapper
 * @param {HTMLElement} container - Container til at vise indholdet
 * @param {string} folderName - Navn på mappen
 */
function loadWorkFolder(container, folderName) {
    let fileItems = '';
    
    // Forskellige filindhold baseret på mappenavn
    switch (folderName) {
        case 'Præsentationer':
            fileItems = `
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-ppt-02" style="color: #FF6F00;"></i>
                    <span>Kvartalspresentation.pptx</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-ppt-02" style="color: #FF6F00;"></i>
                    <span>Strategi_2025.pptx</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-ppt-02" style="color: #FF6F00;"></i>
                    <span>Kundemøde.pptx</span>
                </div>
            `;
            break;
        case 'Mødenoter':
            fileItems = `
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-file-01" style="color: #44AAFF;"></i>
                    <span>Ledelsesmøde_20250315.docx</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-file-01" style="color: #44AAFF;"></i>
                    <span>Teammøde_20250402.docx</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-file-01" style="color: #44AAFF;"></i>
                    <span>Projektopfølgning.docx</span>
                </div>
            `;
            break;
        case 'Faktura Q1':
            fileItems = `
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-pdf-02" style="color: #FF5555;"></i>
                    <span>Faktura_10157.pdf</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-pdf-02" style="color: #FF5555;"></i>
                    <span>Faktura_10158.pdf</span>
                </div>
                <div class="folder-item">
                    <i class="hgi hgi-solid hgi-xls-02" style="color: #44C85C;"></i>
                    <span>Fakturaoverview_Q1.xlsx</span>
                </div>
            `;
            break;
        default:
            fileItems = `
                <div class="empty-folder-message">
                    <p>Mappen er tom.</p>
                </div>
            `;
    }
    
    // Opret indhold
    container.innerHTML = `
        <div class="folder-view">
            <div class="folder-header">
                <h2>${folderName}</h2>
            </div>
            <div class="folder-content">
                ${fileItems}
            </div>
        </div>
    `;
    
    // Tilføj event listeners til mappe-elementer
    addFolderItemListeners(container);
}

/**
 * Indlæser standardindhold for 'Denne PC'-mappen
 * @param {HTMLElement} container - Container til at vise indholdet
 */
function loadThisPCFolder(container) {
    container.innerHTML = `
        <div class="folder-view">
            <div class="folder-header">
                <h2>Denne PC</h2>
            </div>
            <div class="folder-content">
                <div class="folder-item drive-item">
                    <i class="hgi hgi-solid hgi-hard-drive-02" style="color: #44AAFF;"></i>
                    <div class="drive-info">
                        <span>C: (System)</span>
                        <div class="drive-usage">
                            <div class="drive-usage-bar">
                                <div class="drive-usage-fill" style="width: 65%;"></div>
                            </div>
                            <span>65% brugt</span>
                        </div>
                    </div>
                </div>
                <div class="folder-item drive-item">
                    <i class="hgi hgi-solid hgi-hard-drive-02" style="color: #44AAFF;"></i>
                    <div class="drive-info">
                        <span>D: (Data)</span>
                        <div class="drive-usage">
                            <div class="drive-usage-bar">
                                <div class="drive-usage-fill" style="width: 32%;"></div>
                            </div>
                            <span>32% brugt</span>
                        </div>
                    </div>
                </div>
                <div class="folder-item drive-item">
                    <i class="hgi hgi-solid hgi-hard-drive-02" style="color: #44AAFF;"></i>
                    <div class="drive-info">
                        <span>E: (Backup)</span>
                        <div class="drive-usage">
                            <div class="drive-usage-bar">
                                <div class="drive-usage-fill" style="width: 48%;"></div>
                            </div>
                            <span>48% brugt</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Tilføj event listeners til mappe-elementer
    addFolderItemListeners(container);
}

/**
 * Tilføjer event listeners til mappe-elementer
 * @param {HTMLElement} container - Container med mappe-elementer
 */
function addFolderItemListeners(container) {
    const folderItems = container.querySelectorAll('.folder-item');
    
    folderItems.forEach(item => {
        item.addEventListener('click', function() {
            // Kunne tilføje funktionalitet for at åbne mapper eller filer
            // For nu, bare fremhæv det klikkede element
            folderItems.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
        });
        
        // Tilføj dobbelt-klik funktionalitet
        item.addEventListener('dblclick', function() {
            const itemName = this.querySelector('span').textContent;
            const itemIcon = this.querySelector('i');
            
            // Hvis det er en mappe, åbn den
            if (itemIcon.classList.contains('hgi-folder-01')) {
                loadFolderContent(itemName);
            }
            // Ellers kunne tilføje fil-åbningsfunktionalitet her
        });
    });
}

// Eksporter funktioner til brug i andre moduler
window.setupFileManagerApp = setupFileManagerApp;