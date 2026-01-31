/**
 * Main application logic for Manifold Portfolio Analyzer
 */

// DOM Elements
const usernameInput = document.getElementById('username');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingDiv = document.getElementById('loading');
const loadingDetail = document.getElementById('loading-detail');
const errorDiv = document.getElementById('error');
const resultsDiv = document.getElementById('results');
const positionsBody = document.getElementById('positions-body');

// Allow Enter key to trigger analysis
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        analyzePortfolio();
    }
});

// Check URL parameters for username
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const username = params.get('user') || params.get('username');
    if (username) {
        usernameInput.value = username;
        analyzePortfolio();
    }
});

/**
 * Main analysis function
 */
async function analyzePortfolio() {
    let username = usernameInput.value.trim();
    
    // Extract username if user pasted a full URL
    if (username.includes('manifold.markets/')) {
        username = username.split('manifold.markets/')[1].split('/')[0].split('?')[0];
        usernameInput.value = username;
    }
    
    if (!username) {
        showError('Please enter a username');
        return;
    }
    
    // Update URL for sharing
    const newUrl = `${window.location.pathname}?user=${encodeURIComponent(username)}`;
    window.history.pushState({}, '', newUrl);
    
    // Reset UI
    hideError();
    hideResults();
    showLoading();
    setButtonLoading(true);
    
    try {
        // Step 1: Get user ID
        updateLoadingDetail('Looking up user...');
        const userId = await ManifoldAPI.getUserId(username);
        
        // Step 2: Fetch positions
        updateLoadingDetail('Fetching positions...');
        const rawData = await ManifoldAPI.getUserPositions(userId, updateLoadingDetail);
        
        // Step 3: Process positions
        updateLoadingDetail('Analyzing positions...');
        const allPositions = ManifoldAPI.processPositions(rawData);
        
        // Step 4: Filter below margin rate
        const belowMargin = ManifoldAPI.getPositionsBelowMarginRate(allPositions);
        
        // Display results
        hideLoading();
        displayResults(belowMargin, allPositions.length);
        
    } catch (error) {
        hideLoading();
        showError(error.message);
    } finally {
        setButtonLoading(false);
    }
}

/**
 * Display the results table
 */
function displayResults(positions, totalPositions) {
    // Update summary
    document.getElementById('summary-text').textContent = 
        `Found ${positions.length} of ${totalPositions} positions with return below margin rate.`;
    
    // Update stats
    const totalSaleValue = positions.reduce((sum, p) => sum + p.saleValue, 0);
    const totalPayout = positions.reduce((sum, p) => sum + p.shares, 0);
    
    document.getElementById('stat-positions').textContent = positions.length;
    document.getElementById('stat-recoverable').textContent = `M$${Math.round(totalSaleValue).toLocaleString()}`;
    document.getElementById('stat-payout').textContent = `M$${Math.round(totalPayout).toLocaleString()}`;
    
    // Build table rows
    positionsBody.innerHTML = '';
    
    positions.forEach((position, index) => {
        const row = document.createElement('tr');
        
        // Truncate question
        let question = position.question;
        if (question.length > 70) {
            question = question.substring(0, 70) + '...';
        }
        
        // Answer text
        let answerHtml = '';
        if (position.answer) {
            let answerText = position.answer;
            if (answerText.length > 50) {
                answerText = answerText.substring(0, 50) + '...';
            }
            answerHtml = `<span class="answer-text">↳ ${escapeHtml(answerText)}</span>`;
        }
        
        // Position badge
        const positionClass = position.outcome === 'YES' ? 'position-yes' : 'position-no';
        
        // Return styling
        const returnPercent = (position.returnIfCorrect * 100).toFixed(3);
        let returnClass = 'return-low';
        if (position.returnIfCorrect < 0.05) {
            returnClass = 'return-very-low';
        }
        
        row.innerHTML = `
            <td class="hide-cell"><button class="hide-btn" onclick="hideRow(this)" title="Hide this row">×</button></td>
            <td>${index + 1}</td>
            <td>
                <a href="${escapeHtml(position.url)}" target="_blank" class="market-link">
                    ${escapeHtml(question)}
                </a>
                ${answerHtml}
            </td>
            <td>
                <span class="position-badge ${positionClass}">
                    ${position.shares.toFixed(1)} ${position.outcome}
                </span>
            </td>
            <td class="right">M$${position.saleValue.toFixed(2)}</td>
            <td class="right">M$${position.shares.toFixed(2)}</td>
            <td class="right">${Math.round(position.daysUntilClose || 0)}</td>
            <td class="right ${returnClass}">${returnPercent}%</td>
        `;
        
        positionsBody.appendChild(row);
    });
    
    showResults();
}

// UI Helper functions
function showLoading() {
    loadingDiv.classList.remove('hidden');
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
}

function updateLoadingDetail(text) {
    loadingDetail.textContent = text;
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

function showResults() {
    resultsDiv.classList.remove('hidden');
}

function hideResults() {
    resultsDiv.classList.add('hidden');
}

function setButtonLoading(isLoading) {
    analyzeBtn.disabled = isLoading;
    analyzeBtn.textContent = isLoading ? 'Loading...' : 'Analyze';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function hideRow(button) {
    const row = button.closest('tr');
    row.classList.add('hidden-row');
    updateHiddenCount();
}

function showAllRows() {
    document.querySelectorAll('.hidden-row').forEach(row => {
        row.classList.remove('hidden-row');
    });
    updateHiddenCount();
}

function updateHiddenCount() {
    const hiddenCount = document.querySelectorAll('.hidden-row').length;
    let showAllBtn = document.getElementById('show-all-btn');
    
    if (hiddenCount > 0) {
        if (!showAllBtn) {
            showAllBtn = document.createElement('button');
            showAllBtn.id = 'show-all-btn';
            showAllBtn.className = 'show-all-btn';
            showAllBtn.onclick = showAllRows;
            document.querySelector('.summary').appendChild(showAllBtn);
        }
        showAllBtn.textContent = `Show ${hiddenCount} hidden row${hiddenCount > 1 ? 's' : ''}`;
        showAllBtn.classList.remove('hidden');
    } else if (showAllBtn) {
        showAllBtn.classList.add('hidden');
    }
}
