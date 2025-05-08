/**
 * securityCenterApp.js
 * Håndterer sikkerhedscenterets funktionalitet
 * Beregner sikkerhedspoint, genererer anbefalinger og viser sikkerhedsstatus
 */

// Sikkerhedscenter state
const securityLevels = {
    CRITICAL: { level: 'critical', text: 'Kritisk', percentage: 0, color: '#FF4040' },
    RISK: { level: 'risk', text: 'Risiko', percentage: 25, color: '#FF8800' },
    MODERATE: { level: 'moderate', text: 'Moderat', percentage: 50, color: '#FFC300' },
    GOOD: { level: 'good', text: 'God', percentage: 75, color: '#44AAFF' },
    EXCELLENT: { level: 'excellent', text: 'Fremragende', percentage: 100, color: '#44C85C' }
};

// Scenarie titler for visning
const scenarioTitles = {
    'personal-info': 'Personlige Oplysninger',
    'unknown-usb': 'Ukendt USB-enhed',
    'browser-security': 'Sikker Webnavigation'
};

/**
 * Initialiserer sikkerhedscenter-app
 */
function setupSecurityCenterApp() {
    console.log('Initialiserer sikkerhedscenter app');
    
    // DOM Elementer
    const securityCenterBtn = document.getElementById('security-center-btn');
    const securityCenterWindow = document.getElementById('security-center-window');
    
    // Tilføj event listener til sikkerhedscenter-knap
    if (securityCenterBtn) {
        securityCenterBtn.addEventListener('click', function() {
            openSecurityCenterApp();
        });
    }
    
    // Lyt efter ændringer i localStorage for at opdatere i realtid
    window.addEventListener('app-storage-updated', function(e) {
        if (e.detail && e.detail.key === 'userChoices') {
            updateSecurityStatus();
        }
    });
}

/**
 * Åbner sikkerhedscenter-appen
 */
function openSecurityCenterApp() {
    // Opdater sikkerhedsstatus før vinduet åbnes
    updateSecurityStatus();
    
    // Tjek om vi er i mobilvisning
    const isMobile = window.innerWidth <= 880;
    
    if (isMobile) {
        if (typeof openAppMobile === 'function') {
            openAppMobile('security-center-window');
        }
    } else {
        if (typeof openWindow === 'function') {
            openWindow('security-center-window');
        }
    }
}

/**
 * Beregner sikkerhedspoint fra brugervalg
 * @returns {Object} Objekt med totalpoint og valgliste
 */
function calculateSecurityPoints() {
    let userChoices = {};
    
    // Hent brugervalg fra storage
    if (typeof getUserChoices === 'function') {
        userChoices = getUserChoices();
    } else {
        // Backup direkte hentning hvis storageManager ikke er tilgængelig
        try {
            const choicesString = localStorage.getItem('userChoices');
            userChoices = choicesString ? JSON.parse(choicesString) : {};
        } catch (e) {
            console.error('Fejl ved hentning af brugervalg:', e);
            userChoices = {};
        }
    }
    
    let totalPoints = 0;
    let choicesList = [];
    
    // Behandl hvert scenarie
    for (const scenarioId in userChoices) {
        const scenario = userChoices[scenarioId];
        const choices = scenario.choices || [];
        
        // Tilføj hvert valg til listen og beregn totalpoint
        choices.forEach(choice => {
            const points = parseInt(choice.points) || 0;
            totalPoints += points;
            
            // Tilføj til valgliste for aktivitetsvisning
            choicesList.push({
                scenarioId: scenarioId,
                text: choice.text,
                security: choice.security,
                points: points,
                timestamp: choice.timestamp || new Date().toISOString()
            });
        });
    }
    
    // Sortér valg efter tidsstempel (nyeste først)
    choicesList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return {
        totalPoints: totalPoints,
        choices: choicesList
    };
}

/**
 * Bestemmer sikkerhedsniveau baseret på point
 * @param {number} points - Sikkerhedspoint
 * @returns {Object} Sikkerhedsniveau objekt
 */
function getSecurityLevel(points) {
    if (points >= 60) return securityLevels.EXCELLENT;
    if (points >= 30) return securityLevels.GOOD;
    if (points >= 0) return securityLevels.MODERATE;
    if (points >= -20) return securityLevels.RISK;
    return securityLevels.CRITICAL;
}

/**
 * Opdaterer sikkerhedsstatus-elementerne i UI
 */
function updateSecurityStatus() {
    const { totalPoints, choices } = calculateSecurityPoints();
    const securityLevel = getSecurityLevel(totalPoints);
    // Beregn målerprocent baseret på point
    const minPoints = -40;
    const maxPoints = 70;
    let percent = Math.round(((totalPoints - minPoints) / (maxPoints - minPoints)) * 100);
    percent = Math.max(0, Math.min(100, percent));
    // Opdater måler-SVG
    const gaugeArc = document.getElementById('gauge-arc');
    const gaugePercentage = document.getElementById('gauge-percentage');
    if (gaugeArc && gaugePercentage) {
        const circleLength = 2 * Math.PI * 45; // r=45
        const offset = circleLength * (1 - percent / 100);
        gaugeArc.setAttribute('stroke-dashoffset', offset);
        gaugeArc.setAttribute('stroke', securityLevel.color);
        gaugePercentage.textContent = percent + '%';
    }
    // Update summary (now includes points)
    const securitySummaryText = document.getElementById('security-summary-text');
    if (securitySummaryText) {
        if (choices.length === 0) {
            securitySummaryText.textContent = 'Din sikkerhedsstatus vil blive vist her efter du har gennemført sikkerhedsscenarier.';
        } else {
            securitySummaryText.textContent = `Du har opnået ${totalPoints} point. ` + generateSecuritySummary(totalPoints, securityLevel.level, choices);
        }
    }
    // Update activity list
    updateActivityList(choices);
    // Update recommendations
    updateRecommendations(totalPoints, securityLevel.level, choices);
    // Update taskbar icon
    updateTaskbarIcon(securityLevel.level);
}

/**
 * Genererer sikkerhedsopsummeringstekst
 * @param {number} points - Sikkerhedspoint
 * @param {string} level - Sikkerhedsniveau
 * @param {Array} choices - Liste af brugervalg
 * @returns {string} Opsummeringstekst
 */
function generateSecuritySummary(points, level, choices) {
    if (choices.length === 0) {
        return 'Du har endnu ikke gennemført nogen sikkerhedsscenarier.';
    }
    
    const totalChoices = choices.length;
    const goodChoices = choices.filter(choice => choice.security === 'good').length;
    const badChoices = choices.filter(choice => choice.security === 'bad').length;
    const goodPercentage = Math.round((goodChoices / totalChoices) * 100);
    
    let summary = '';
    
    switch (level) {
        case 'excellent':
            summary = `Fremragende sikkerhedsadfærd! Du har truffet ${goodPercentage}% gode sikkerhedsbeslutninger. Bliv ved med det gode arbejde og hold dig opdateret om nye sikkerhedstrusler.`;
            break;
        case 'good':
            summary = `God sikkerhedsbevidsthed. Du har truffet ${goodPercentage}% gode sikkerhedsbeslutninger. Med lidt mere omhu kan du nå det højeste sikkerhedsniveau.`;
            break;
        case 'moderate':
            summary = `Acceptabel sikkerhedsadfærd. Du har truffet ${goodPercentage}% gode sikkerhedsbeslutninger, men der er plads til forbedring. Overvej at revurdere dine valg i situationer med sikkerhedsrisici.`;
            break;
        case 'risk':
            summary = `Din sikkerhedsadfærd udgør en risiko. Med kun ${goodPercentage}% gode sikkerhedsbeslutninger er du sårbar over for sikkerhedstrusler. Fokusér på at forbedre dine sikkerhedsvalg.`;
            break;
        case 'critical':
            summary = `Kritisk lav sikkerhedsbevidsthed. Du har truffet mange beslutninger, der kompromitterer sikkerheden. En omfattende revision af din tilgang til sikkerhed anbefales.`;
            break;
        default:
            summary = 'Din sikkerhedsstatus er under evaluering baseret på dine valg.';
    }
    
    return summary;
}

/**
 * Opdaterer aktivitetsliste i UI
 * @param {Array} choices - Liste af brugervalg
 */
function updateActivityList(choices) {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    if (choices.length === 0) {
        activityList.innerHTML = `
            <div class="activity-empty-state">
                <i class="hgi hgi-solid hgi-document-list"></i>
                <p>Ingen aktivitet endnu. Prøv at gennemføre et sikkerhedsscenarie.</p>
            </div>
        `;
        return;
    }
    
    // Opret aktivitetselementer (vis op til 10 nyeste)
    let activityHTML = '';
    const recentChoices = choices.slice(0, 10);
    
    recentChoices.forEach(choice => {
        const timestamp = new Date(choice.timestamp);
        const formattedDate = formatActivityDate(timestamp);
        const scenarioTitle = scenarioTitles[choice.scenarioId] || choice.scenarioId;
        const pointsText = choice.points > 0 ? `+${choice.points}` : choice.points;
        const pointsClass = choice.points > 0 ? 'positive' : (choice.points < 0 ? 'negative' : 'neutral');
        
        activityHTML += `
            <div class="activity-item security-${choice.security || 'neutral'}">
                <div class="activity-header">
                    <span class="activity-title">${scenarioTitle}</span>
                    <span class="activity-time">${formattedDate}</span>
                </div>
                <div class="activity-description">
                    ${choice.text} <span class="points ${pointsClass}">${pointsText} point</span>
                </div>
            </div>
        `;
    });
    
    activityList.innerHTML = activityHTML;
}

/**
 * Formaterer dato for aktivitetsvisning
 * @param {Date} date - Dato der skal formateres
 * @returns {string} Formateret dato
 */
function formatActivityDate(date) {
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Opdaterer anbefalinger baseret på brugerens sikkerhedsstatus
 * @param {number} points - Sikkerhedspoint
 * @param {string} level - Sikkerhedsniveau
 * @param {Array} choices - Liste af brugervalg
 */
function updateRecommendations(points, level, choices) {
    const recommendationsList = document.getElementById('recommendations-list');
    if (!recommendationsList) return;
    
    let recommendations = [];
    
    // Standard anbefaling hvis ingen valg er foretaget
    if (choices.length === 0) {
        recommendations.push({
            icon: 'hgi-lamp-charge',
            color: '#FFC300',
            title: 'Kom i gang',
            text: 'Åbn mail-appen for at begynde at træne dine sikkerhedsfærdigheder.'
        });
        
        recommendations.push({
            icon: 'hgi-shield-check',
            color: '#44AAFF',
            title: 'Sikker adfærd',
            text: 'Lær hvordan du beskytter dig mod sikkerhedstrusler gennem praktiske scenarier.'
        });
    } else {
        // Tjek for dårlige valg i specifikke scenarier
        const hasPersonalInfoBadChoices = choices.some(c => c.scenarioId === 'personal-info' && c.security === 'bad');
        const hasUsbBadChoices = choices.some(c => c.scenarioId === 'unknown-usb' && c.security === 'bad');
        const hasBrowserBadChoices = choices.some(c => c.scenarioId === 'browser-security' && c.security === 'bad');
        
        // Personaliserede anbefalinger baseret på valg
        if (hasPersonalInfoBadChoices) {
            recommendations.push({
                icon: 'hgi-user-account',
                color: '#FF8800',
                title: 'Beskyt dine oplysninger',
                text: 'Vær forsigtig med at dele personlige oplysninger, især når du modtager uventede anmodninger via email.'
            });
        }
        
        if (hasUsbBadChoices) {
            recommendations.push({
                icon: 'hgi-usb-memory-01',
                color: '#FF8800',
                title: 'USB-enhed sikkerhed',
                text: 'Tilslut aldrig ukendte USB-enheder til din computer. De kan indeholde malware eller anden skadelig software.'
            });
        }
        
        if (hasBrowserBadChoices) {
            recommendations.push({
                icon: 'hgi-globe-02',
                color: '#FF8800',
                title: 'Sikker browsing',
                text: 'Kontroller altid URL\'er og sikkerhedscertifikater før du indtaster følsomme oplysninger på websteder.'
            });
        }
        
        // Niveaubaserede anbefalinger
        switch (level) {
            case 'excellent':
                recommendations.push({
                    icon: 'hgi-award-02',
                    color: '#44C85C',
                    title: 'Sikkerhedsekspert',
                    text: 'Du har demonstreret fremragende sikkerhedsbevidsthed. Del din viden med andre for at forbedre den generelle sikkerhed.'
                });
                break;
            case 'good':
                recommendations.push({
                    icon: 'hgi-chart-breakout-circle',
                    color: '#44AAFF',
                    title: 'Næsten i mål',
                    text: 'Du er på rette vej! Fokuser på at identificere phishing-forsøg og praktisere sikker datahåndtering.'
                });
                break;
            case 'moderate':
                recommendations.push({
                    icon: 'hgi-refresh',
                    color: '#FFC300',
                    title: 'Forbedringsmuligheder',
                    text: 'Gå tilbage og prøv nogle af scenarierne igen med fokus på at træffe sikrere valg.'
                });
                break;
            case 'risk':
            case 'critical':
                recommendations.push({
                    icon: 'hgi-alert-01',
                    color: '#FF4040',
                    title: 'Sikkerhedsrisiko',
                    text: 'Dine valg udgør en betydelig sikkerhedsrisiko. Gennemgå sikkerhedsgrundprincipperne og prøv scenarierne igen.'
                });
                break;
        }
        
        // Altid tilføj en generel anbefaling
        recommendations.push({
            icon: 'hgi-shield-01',
            color: '#44C85C',
            title: 'Hold dig opdateret',
            text: 'Sikkerhedstrusler udvikler sig konstant. Hold dig informeret om de nyeste trusler og beskyttelsesmetoder.'
        });
    }
    
    // Opret anbefalings-HTML
    let recommendationsHTML = '';
    recommendations.forEach(rec => {
        recommendationsHTML += `
            <div class="recommendation-item">
                <i class="hgi hgi-solid ${rec.icon}" style="color: ${rec.color};"></i>
                <div class="recommendation-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.text}</p>
                </div>
            </div>
        `;
    });
    
    recommendationsList.innerHTML = recommendationsHTML;
}

/**
 * Opdaterer taskbar sikkerhedsikon baseret på sikkerhedsniveau
 * @param {string} level - Sikkerhedsniveau
 */
function updateTaskbarIcon(level) {
    const securityBtn = document.getElementById('security-btn');
    const securityText = securityBtn ? securityBtn.nextElementSibling : null;
    
    if (!securityBtn || !securityText) return;
    
    // Opdater ikonfarve
    let iconColor = '#44C85C'; // Standard: grøn
    let statusText = 'Ingen trusler';
    
    switch (level) {
        case 'excellent':
            iconColor = '#44C85C'; // Grøn
            statusText = 'Ingen trusler';
            break;
        case 'good':
            iconColor = '#44AAFF'; // Blå
            statusText = 'Sikker';
            break;
        case 'moderate':
            iconColor = '#FFC300'; // Gul
            statusText = 'Moderat risiko';
            break;
        case 'risk':
            iconColor = '#FF8800'; // Orange
            statusText = 'Forhøjet risiko';
            break;
        case 'critical':
            iconColor = '#FF4040'; // Rød
            statusText = 'Kritisk risiko';
            break;
    }
    
    // Opdater ikonfarve og tekst
    securityBtn.querySelector('i').style.color = iconColor;
    securityText.textContent = statusText;
}

/**
 * Genererer en sikkerhedsrapport baseret på brugerens valg
 * @returns {string} HTML-indhold til sikkerhedsrapport
 */
function generateSecurityReport() {
    const { totalPoints, choices } = calculateSecurityPoints();
    const securityLevel = getSecurityLevel(totalPoints);
    
    // Generer rapport baseret på sikkerhedsstatus
    if (choices.length === 0) {
        return `
            <div class="security-report">
                <h2>Sikkerhedsrapport</h2>
                <p>Ingen sikkerhedsdata tilgængelig. Gennemfør sikkerhedsscenarier for at generere en rapport.</p>
            </div>
        `;
    }
    
    // Tæl forskellige typer valg
    const totalChoices = choices.length;
    const goodChoices = choices.filter(choice => choice.security === 'good').length;
    const neutralChoices = choices.filter(choice => choice.security === 'neutral').length;
    const badChoices = choices.filter(choice => choice.security === 'bad').length;
    
    // Beregn procentdele
    const goodPercentage = Math.round((goodChoices / totalChoices) * 100);
    const neutralPercentage = Math.round((neutralChoices / totalChoices) * 100);
    const badPercentage = Math.round((badChoices / totalChoices) * 100);
    
    // Generer statusopsummering
    let statusSummary = '';
    switch (securityLevel.level) {
        case 'excellent':
            statusSummary = 'Fremragende sikkerhedsadfærd! Din høje sikkerhedsbevidsthed gør dig godt rustet mod sikkerhedstrusler.';
            break;
        case 'good':
            statusSummary = 'God sikkerhedsadfærd. Du har truffet flere gode valg, men der er stadig plads til forbedring.';
            break;
        case 'moderate':
            statusSummary = 'Moderat sikkerhedsadfærd. Du har truffet både gode og dårlige valg, hvilket giver en blandet sikkerhedsprofil.';
            break;
        case 'risk':
            statusSummary = 'Risikabel sikkerhedsadfærd. Dine valg udgør en betydelig sikkerhedsrisiko. Fokuser på at forbedre din sikkerhedsadfærd.';
            break;
        case 'critical':
            statusSummary = 'Kritisk lav sikkerhedsadfærd. Dine valg udgør en alvorlig sikkerhedsrisiko. En omfattende revision af din sikkerhedspraksis er nødvendig.';
            break;
    }
    
    // Opret HTML for rapporten
    let reportHTML = `
        <div class="security-report">
            <h2>Sikkerhedsrapport</h2>
            
            <div class="report-summary">
                <h3>Sikkerhedsstatus: <span class="security-level-${securityLevel.level}">${securityLevel.text}</span></h3>
                <p>${statusSummary}</p>
                <div class="security-score">
                    <strong>Sikkerhedspoint:</strong> ${totalPoints}
                </div>
            </div>
            
            <div class="report-statistics">
                <h3>Valgstatistik</h3>
                <div class="stats-item">
                    <span class="stats-label">Gode valg:</span>
                    <span class="stats-value">${goodChoices} (${goodPercentage}%)</span>
                </div>
                <div class="stats-item">
                    <span class="stats-label">Neutrale valg:</span>
                    <span class="stats-value">${neutralChoices} (${neutralPercentage}%)</span>
                </div>
                <div class="stats-item">
                    <span class="stats-label">Dårlige valg:</span>
                    <span class="stats-value">${badChoices} (${badPercentage}%)</span>
                </div>
            </div>
            
            <div class="report-recommendations">
                <h3>Forbedringsforslag</h3>
                <ul>
    `;
    
    // Tilføj anbefalinger baseret på sikkerhedsniveau og valg
    const recommendations = getRecommendationsForReport(securityLevel.level, choices);
    recommendations.forEach(rec => {
        reportHTML += `<li>${rec}</li>`;
    });
    
    reportHTML += `
                </ul>
            </div>
        </div>
    `;
    
    return reportHTML;
}

/**
 * Henter anbefalinger til sikkerhedsrapport
 * @param {string} level - Sikkerhedsniveau
 * @param {Array} choices - Liste af brugervalg
 * @returns {Array} Liste af anbefalinger
 */
function getRecommendationsForReport(level, choices) {
    let recommendations = [];
    
    // Generelle anbefalinger baseret på niveau
    switch (level) {
        case 'excellent':
            recommendations.push('Fortsæt med at holde dig opdateret om nye sikkerhedstrusler.');
            recommendations.push('Del din viden med kolleger for at styrke den samlede sikkerhedskultur.');
            break;
        case 'good':
            recommendations.push('Fokuser på at identificere subtile phishing-forsøg.');
            recommendations.push('Overvej at aktivere to-faktor autentificering på alle vigtige konti.');
            break;
        case 'moderate':
            recommendations.push('Gennemgå sikkerhedsgrundprincipper og vær mere påpasselig med emails fra ukendte afsendere.');
            recommendations.push('Tjek altid URL\'er i browseren før du indtaster følsomme oplysninger.');
            break;
        case 'risk':
        case 'critical':
            recommendations.push('Udvis større forsigtighed ved håndtering af potentielle sikkerhedstrusler.');
            recommendations.push('Kontakt altid IT-sikkerhed ved mistænkelige aktiviteter i stedet for at handle på egen hånd.');
            recommendations.push('Brug sikre adgangskoder og undgå at genbruge dem på tværs af tjenester.');
            break;
    }
    
    // Specifikke anbefalinger baseret på valg
    if (choices.some(c => c.scenarioId === 'personal-info' && c.security === 'bad')) {
        recommendations.push('Vær yderst forsigtig med at dele personlige oplysninger online, selv hvis anmodningen ser legitim ud.');
    }
    
    if (choices.some(c => c.scenarioId === 'unknown-usb' && c.security === 'bad')) {
        recommendations.push('Tilslut aldrig ukendte USB-enheder til din computer, og rapporter altid mistænkelige enheder til IT-sikkerhed.');
    }
    
    if (choices.some(c => c.scenarioId === 'browser-security' && c.security === 'bad')) {
        recommendations.push('Tjek altid for HTTPS og verificer webstedsadressen før du logger ind eller indtaster følsomme oplysninger.');
    }
    
    return recommendations;
}

// Eksporter funktioner til brug i andre moduler
window.setupSecurityCenterApp = setupSecurityCenterApp;
window.updateSecurityStatus = updateSecurityStatus;
window.generateSecurityReport = generateSecurityReport;