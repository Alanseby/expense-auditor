document.addEventListener('DOMContentLoaded', () => {
    // Extract ID from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const claim = appStore.getClaimById(id);

    if (!claim) {
        document.getElementById('result-container').innerHTML = `
            <div style="text-align:center; padding: 4rem;">
                <h2 style="color:var(--danger); font-size:2rem; margin-bottom: 1rem;"><i class="icon-lucide-alert-triangle"></i> Claim Not Found</h2>
                <p>The ID <strong>${id}</strong> could not be located in the local memory matrix.</p>
                <button class="btn btn-primary" style="margin-top:2rem;" onclick="window.close()">Close Window</button>
            </div>
        `;
        return;
    }

    // 1. Render primary status header
    const statusCard = document.getElementById('status-card');
    let riskColor = claim.riskLevel === 'high' ? 'var(--danger)' : claim.riskLevel === 'medium' ? 'var(--warning)' : 'var(--success)';
    let iconMap = { 'approved': 'check-circle', 'flagged': 'alert-triangle', 'rejected': 'alert-octagon' };

    statusCard.innerHTML = `
        <div style="display:inline-flex; align-items:center; justify-content:center; width:90px; height:90px; border-radius:50%; background:${riskColor}; color:white; font-size: 3rem; margin-bottom: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            <i class="icon-lucide-${iconMap[claim.status]}"></i>
        </div>
        <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem; color: #0f172a;">AI Audit Complete for <strong>${claim.id}</strong></h2>
        <h3 style="color:${riskColor}; text-transform:uppercase; font-size: 1.25rem; font-weight: 700;">${claim.status} / ${claim.riskLevel} Risk</h3>
        
        ${claim.flagReason ? `
            <div style="margin-top: 2rem; display:inline-block; text-align:left; background: #fff1f2; border: 1px solid #fda4af; padding: 1.5rem 2rem; border-radius: var(--radius-md);">
                <p style="color: #9f1239; font-weight: 600; font-size:1.1rem;"><i class="icon-lucide-info" style="margin-right: 0.5rem;"></i>AI Rejection/Flag Reason:</p>
                <p style="color: #881337; margin-top:0.5rem;">${claim.flagReason}</p>
            </div>` 
        : `
            <div style="margin-top: 2rem; display:inline-block; text-align:left; background: #ecfdf5; border: 1px solid #6ee7b7; padding: 1.5rem 2rem; border-radius: var(--radius-md);">
                <p style="color: #065f46; font-weight: 600; font-size:1.1rem;"><i class="icon-lucide-check" style="margin-right: 0.5rem;"></i>AI Assessment Reason:</p>
                <p style="color: #064e3b; margin-top:0.5rem;">The AI found zero policy violations. The transaction aligns completely with standard spending guidelines.</p>
            </div>
        `}
    `;

    // 2. Render Policy Details
    document.getElementById('details-pane').innerHTML = `
        <h3 style="margin-bottom: 1rem; color:#334155;"><i class="icon-lucide-book-open"></i> Policy Justification Core</h3>
        <p style="font-size:0.95rem; color:var(--text-muted); line-height:1.5;">During the assessment of your $${claim.amount.toFixed(2)} purchase at "${claim.merchant}", the Neural Network retrieved the following rule from the corporate policy matrix:</p>
        <div style="background: #0f172a; color: #e2e8f0; padding: 1.5rem; border-radius: 8px; font-family: monospace; font-size: 0.95rem; margin-top: 1.5rem; border-left: 5px solid ${riskColor}; box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05); line-height: 1.6;">
            ${claim.policySnippet}
        </div>
    `;

    // 3. Mount Chart.js Visualizations
    const claims = appStore.getClaims();

    // Chart 1: Global Risk Distribution matrix (Doughnut)
    const statusCounts = { approved: 0, flagged: 0, rejected: 0 };
    claims.forEach(c => { if(statusCounts[c.status] !== undefined) statusCounts[c.status]++; });

    const ctx1 = document.getElementById('riskChart').getContext('2d');
    new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['Approved', 'Flagged', 'Rejected'],
            datasets: [{
                data: [statusCounts.approved, statusCounts.flagged, statusCounts.rejected],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                title: { display: true, text: 'Total Account Claim Status', font: {size: 16} },
                legend: { position: 'bottom' }
            }
        }
    });

    // Chart 2: Personal Budget Bar Graph
    let spendCategories = { 'Meals & Dining': 0, 'Flights & Uber': 0, 'Hotels': 0, 'Other Ops': 0 };
    claims.filter(c => c.status === 'approved' || c.status === 'flagged').forEach(c => {
        const t = (c.purpose + ' ' + c.merchant).toLowerCase();
        if(t.includes('meal') || t.includes('dinner') || t.includes('lunch') || t.includes('restaurant')) spendCategories['Meals & Dining'] += c.amount;
        else if(t.includes('uber') || t.includes('taxi') || t.includes('flight') || t.includes('air')) spendCategories['Flights & Uber'] += c.amount;
        else if(t.includes('hotel') || t.includes('lodging') || t.includes('resort')) spendCategories['Hotels'] += c.amount;
        else spendCategories['Other Ops'] += c.amount;
    });

    const ctx2 = document.getElementById('budgetChart').getContext('2d');
    new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: Object.keys(spendCategories),
            datasets: [{
                label: 'Approved YTD Spend ($)',
                data: Object.values(spendCategories),
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                title: { display: true, text: 'Your Spend Metrics By Category', font: {size: 16} },
                legend: { display: false }
            },
            scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } } }
        }
    });
});
