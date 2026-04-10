// Router and View Renderer
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const viewContainer = document.getElementById('view-container');
    const pageTitle = document.getElementById('page-title');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Utility: Category Icons
    function getCategoryIcon(purpose, merchant) {
        const txt = (purpose + ' ' + merchant).toLowerCase();
        if(txt.includes('dinner') || txt.includes('lunch') || txt.includes('meal') || txt.includes('starbucks')) return '🍽️';
        if(txt.includes('uber') || txt.includes('lyft') || txt.includes('taxi') || txt.includes('flight') || txt.includes('air')) return '🚕';
        if(txt.includes('hotel') || txt.includes('hilton') || txt.includes('lodging')) return '🏨';
        return '💳'; // Default Fintech Card Icon
    }

    // Routing Logic
    function navigate(route, params = null) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('data-route') === route) {
                link.classList.add('active');
            }
        });

        if (route === 'home') {
            pageTitle.innerText = "Welcome to AuditPro";
            document.querySelector('.user-name').innerText = "System Gateway";
            renderHome();
        } else if (route === 'employee') {
            pageTitle.innerText = "Submit Expense";
            document.querySelector('.user-name').innerText = "Employee Portal";
            renderEmployeePortal();
        } else if (route === 'auditor') {
            pageTitle.innerText = "Finance Dashboard";
            document.querySelector('.user-name').innerText = "Finance Team";
            renderAuditorDashboard();
        } else if (route === 'audit-detail') {
            pageTitle.innerText = `Audit Detail: ${params.id}`;
            renderAuditDetail(params.id);
        }
    }

    // Event Listeners for Nav
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = e.currentTarget.getAttribute('data-route');
            navigate(route);
        });
    });

    // Store update hooks are handled locally within functions now.

    // ===== VIEWS =====

    // 1. Employee Portal (Guided Flow)
    function renderEmployeePortal() {
        let currentStep = 1;
        let uploadFile = null;
        let previewSrc = '';
        let purposeText = '';
        let validationResult = null;

        function render() {
            const stepperHTML = `
                <div class="stepper">
                    <div class="step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}">1. Receipt</div>
                    <div class="step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}">2. Description</div>
                    <div class="step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}">3. Result</div>
                </div>
            `;

            let stepContentHTML = '';

            if (currentStep === 1) {
                stepContentHTML = `
                    <div class="form-group">
                        <label>Upload Receipt</label>
                        <div class="dropzone" id="dropzone" style="${previewSrc ? 'display:none;' : ''}">
                            <i class="icon-lucide-upload-cloud" style="font-size:3rem; margin-bottom: 1rem; color: #94a3b8;"></i>
                            <h3 style="font-size:1.25rem; font-weight:600;">Click or drag receipt here</h3>
                            <p style="color:var(--text-muted);">Supports JPG, PNG, PDF</p>
                            <input type="file" id="file-input" accept="image/*,application/pdf">
                        </div>
                        <div id="preview-container" style="${previewSrc ? 'display:block;' : 'display:none;'} margin-top: 1rem; text-align: center;">
                            <img id="file-preview" src="${previewSrc}" style="max-height: 150px; border-radius: 8px; border: 1px solid var(--border);">
                            <div style="margin-top: 1rem;">
                                <button type="button" class="btn btn-sm" id="clear-file" style="background:#e2e8f0;">Change File</button>
                            </div>
                        </div>
                    </div>
                    <div class="sticky-footer" style="justify-content: flex-end;">
                        <button type="button" class="btn btn-primary" id="next-to-2" ${!previewSrc ? 'disabled' : ''}>Next: Add Purpose <i class="icon-lucide-arrow-right"></i></button>
                    </div>
                `;
            } else if (currentStep === 2) {
                stepContentHTML = `
                    <div class="form-group" id="description-form">
                        <label for="purpose">Business Description</label>
                        <textarea class="form-control" id="purpose" rows="4" placeholder="Explain the context of this spend (e.g., Client lunch with Acme Corp)">${purposeText}</textarea>
                    </div>
                    <div id="loading-area" style="display:none; text-align:center; padding: 2rem 0;">
                        <div class="spinner" style="margin: 0 auto; margin-bottom: 1rem;"></div>
                        <h3 style="margin-bottom: 0.5rem;" id="audit-loading-title">AI is Auditing your Expense</h3>
                        <p style="color:var(--text-muted);" id="audit-loading-text">Starting OCR Neural Net Processing...</p>
                    </div>
                    <div class="sticky-footer" id="action-area">
                        <button type="button" class="btn" id="back-to-1" style="background:#e2e8f0;"><i class="icon-lucide-arrow-left"></i> Back</button>
                        <button type="button" class="btn btn-primary" id="submit-audit"><i class="icon-lucide-zap"></i> Process & Submit</button>
                    </div>
                `;
            } else if (currentStep === 3) {
                let riskColor = validationResult.riskLevel === 'high' ? '#e11d48' : validationResult.riskLevel === 'medium' ? '#d97706' : '#059669';
                let riskBg = validationResult.riskLevel === 'high' ? '#ffe4e6' : validationResult.riskLevel === 'medium' ? '#fef3c7' : '#d1fae5';
                let iconMap = { 'approved': 'check-circle', 'flagged': 'alert-triangle', 'rejected': 'alert-octagon' };

                stepContentHTML = `
                    <div style="text-align: center; border-radius: var(--radius-xl); background: #ffffff; padding: 2rem 1.5rem; margin-bottom: 1.5rem; border: 1px solid var(--border);">
                        <div style="display:inline-flex; align-items:center; justify-content:center; width:70px; height:70px; border-radius:50%; background:${riskColor}; color:white; font-size: 2.2rem; margin-bottom: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                            <i class="icon-lucide-${iconMap[validationResult.status]}"></i>
                        </div>
                        <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem; color: #0f172a;">Audit Complete</h2>
                        <h3 style="color:${riskColor}; text-transform:uppercase; font-size: 1.1rem; font-weight: 700; margin-bottom:1.5rem;">${validationResult.status} / ${validationResult.riskLevel} Risk</h3>
                        
                        ${validationResult.flagReason ? `
                            <div style="display:inline-block; text-align:left; background: ${riskBg}; border: 1px solid ${riskColor}; padding: 1rem 1.5rem; border-radius: var(--radius-md);">
                                <p style="color: ${riskColor}; font-weight: 600; font-size:0.95rem;"><i class="icon-lucide-info" style="margin-right: 0.5rem;"></i>AI Notice:</p>
                                <p style="color: #0f172a; margin-top:0.25rem; font-size:0.9rem;">${validationResult.flagReason}</p>
                            </div>` 
                        : `
                            <div style="display:inline-block; text-align:left; background: ${riskBg}; border: 1px solid ${riskColor}; padding: 1rem 1.5rem; border-radius: var(--radius-md);">
                                <p style="color: ${riskColor}; font-weight: 600; font-size:0.95rem;"><i class="icon-lucide-check" style="margin-right: 0.5rem;"></i>AI Assessment:</p>
                                <p style="color: #0f172a; margin-top:0.25rem; font-size:0.9rem;">No policy violations found. Routine approval.</p>
                            </div>
                        `}
                    </div>

                    <div style="background: white; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border); margin-bottom: 1.5rem;">
                        <h4 style="margin-bottom: 0.75rem; color:#334155; font-size: 0.95rem;"><i class="icon-lucide-book-open"></i> Policy Context</h4>
                        <div style="background: #0f172a; color: #e2e8f0; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 0.85rem; border-left: 4px solid ${riskColor}; line-height: 1.5;">
                            ${validationResult.policySnippet}
                        </div>
                    </div>

                    <div class="analytics-grid" style="grid-template-columns: 1fr 1fr; margin-bottom: 2rem; gap:1rem;">
                        <div class="stat-card" style="background: white; border: 1px solid var(--border); height: 260px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 0.5rem;">
                            <canvas id="inlineRiskChart"></canvas>
                        </div>
                        <div class="stat-card" style="background: white; border: 1px solid var(--border); height: 260px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 0.5rem;">
                            <canvas id="inlineBudgetChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="sticky-footer" style="justify-content: flex-end;">
                        <button type="button" class="btn btn-primary" id="reset-flow"><i class="icon-lucide-plus"></i> Submit Another</button>
                    </div>
                `;
            }

            viewContainer.innerHTML = `
                <div class="fade-enter">
                    <div class="card" style="max-width: 650px; margin: 0 auto;">
                        ${stepperHTML}
                        <div style="margin-top: 2.5rem;" id="step-content">
                            ${stepContentHTML}
                        </div>
                    </div>

                    <div class="card" style="margin-top: 2rem;">
                        <h3 style="margin-bottom: 1rem;">My Recent Claims</h3>
                        <div class="table-container">
                            <table id="my-claims-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Merchant</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            attachStepListeners();
            updateEmployeeTable();
        }

        function attachStepListeners() {
            if (currentStep === 1) {
                const dropzone = document.getElementById('dropzone');
                const fileInput = document.getElementById('file-input');
                const btnNext = document.getElementById('next-to-2');
                const btnClear = document.getElementById('clear-file');

                const handleFile = (e) => {
                    if(e.target.files.length > 0) {
                        uploadFile = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            previewSrc = ev.target.result;
                            render();
                        }
                        reader.readAsDataURL(uploadFile);
                    }
                };

                if (dropzone && fileInput) {
                    dropzone.addEventListener('click', () => fileInput.click());
                    fileInput.addEventListener('change', handleFile);
                }

                if (btnClear) {
                    btnClear.addEventListener('click', () => {
                        uploadFile = null;
                        previewSrc = '';
                        render();
                    });
                }

                if (btnNext) btnNext.addEventListener('click', () => { currentStep = 2; render(); });

            } else if (currentStep === 2) {
                const btnBack = document.getElementById('back-to-1');
                const btnSubmit = document.getElementById('submit-audit');
                const purposeInput = document.getElementById('purpose');

                purposeInput.addEventListener('input', (e) => { purposeText = e.target.value; });
                
                btnBack.addEventListener('click', () => { currentStep = 1; render(); });
                btnSubmit.addEventListener('click', async () => {
                    if (!purposeText.trim()) { alert("Please enter a business description."); return; }
                    
                    document.getElementById('action-area').style.display = 'none';
                    document.getElementById('description-form').style.display = 'none';
                    document.getElementById('loading-area').style.display = 'block';

                    try {
                        const ocrData = await MockEngine.processReceipt(uploadFile);
                        const statusTxt = document.getElementById('audit-loading-text');
                        if(statusTxt) statusTxt.innerText = "Cross-referencing Policy Manual...";
                        
                        validationResult = await MockEngine.validatePolicy(ocrData, purposeText);

                        const newClaim = {
                            id: `CLM-${Math.floor(Math.random()*9000) + 1000}`,
                            date: ocrData.date,
                            amount: ocrData.amount,
                            currency: ocrData.currency,
                            merchant: ocrData.merchant,
                            purpose: purposeText,
                            receiptUrl: previewSrc,
                            status: validationResult.status,
                            riskLevel: validationResult.riskLevel,
                            flagReason: validationResult.flagReason,
                            policySnippet: validationResult.policySnippet,
                            rawText: ocrData.rawText
                        };
                        appStore.addClaim(newClaim);
                        
                        currentStep = 3; // Jump directly to inline result template
                        render();
                        renderInlineCharts(); // Boot up Chart.js graphics
                    } catch(err) {
                        console.error(err);
                        alert("Error executing AI audit pipeline.");
                        if(document.getElementById('action-area')) document.getElementById('action-area').style.display = 'flex';
                        if(document.getElementById('description-form')) document.getElementById('description-form').style.display = 'block';
                        if(document.getElementById('loading-area')) document.getElementById('loading-area').style.display = 'none';
                    }
                });
            } else if (currentStep === 3) {
                document.getElementById('reset-flow').addEventListener('click', () => {
                    uploadFile = null;
                    previewSrc = '';
                    purposeText = '';
                    validationResult = null;
                    currentStep = 1;
                    render();
                });
            }
        }

        render();
    }

    function updateEmployeeTable() {
        const tbody = document.querySelector('#my-claims-table tbody');
        if(!tbody) return;
        
        const claims = appStore.getClaims();
        tbody.innerHTML = claims.map(c => `
            <tr>
                <td>${c.date}</td>
                <td><span style="margin-right: 0.5rem; font-size: 1.1em;">${getCategoryIcon(c.purpose, c.merchant)}</span> ${c.merchant}</td>
                <td>$${c.amount.toFixed(2)}</td>
                <td><span class="badge ${c.status}">${c.status}</span></td>
            </tr>
        `).join('');
    }

    // 2. Finance Auditor Dashboard
    function renderAuditorDashboard() {
        // Analytics calculations
        const claims = appStore.getClaims();
        let totalProcessed = claims.length;
        let approvedCount = claims.filter(c => c.status === 'approved').length;
        let rejectedCount = claims.filter(c => c.status === 'rejected').length;
        
        let approvalRate = totalProcessed === 0 ? 0 : Math.round((approvedCount / totalProcessed) * 100);
        let rejectionRate = totalProcessed === 0 ? 0 : Math.round((rejectedCount / totalProcessed) * 100);

        let totalSpend = claims.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0);

        // Map errors to simple categories
        let violations = claims.filter(c => c.flagReason).map(c => {
            if(c.flagReason.includes('Dinner limit')) return 'Dinner Limit';
            if(c.flagReason.includes('Alcohol')) return 'Alcohol Exp';
            if(c.flagReason.includes('Weekend')) return 'Weekend Travel';
            if(c.flagReason.includes('IT Equipment')) return 'IT Hardware';
            if(c.flagReason.includes('brief')) return 'Ambiguous Text';
            return 'Other';
        });

        let mostViolated = "None";
        if (violations.length > 0) {
            const counts = {};
            violations.forEach(v => counts[v] = (counts[v] || 0) + 1);
            mostViolated = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        }

        viewContainer.innerHTML = `
            <div class="fade-enter">
                <div class="analytics-grid">
                    <div class="stat-card">
                        <div class="stat-value">${totalProcessed}</div>
                        <div class="stat-label">Total Claims</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${approvalRate}% / ${rejectionRate}%</div>
                        <div class="stat-label">Approve vs Reject</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">$${Math.round(totalSpend).toLocaleString()}</div>
                        <div class="stat-label">Approved Spend</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" style="font-size: 1.25rem; display: flex; align-items: center; justify-content: center; height: 33px;">${mostViolated}</div>
                        <div class="stat-label">Most Violated Rule</div>
                    </div>
                </div>

                <div class="card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
                        <h3>Pending Audits Dashboard</h3>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Date</th>
                                    <th>Employee</th>
                                    <th>Amount</th>
                                    <th>Risk Level</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="auditor-table-body">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        updateAuditorTable();
    }

    function updateAuditorTable() {
        const tbody = document.getElementById('auditor-table-body');
        if(!tbody) return;

        // Sort by risk (high first) then ID
        const sorted = [...appStore.getClaims()].sort((a,b) => {
            const riskWeight = { 'high': 3, 'medium': 2, 'low': 1 };
            return riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
        });

        tbody.innerHTML = sorted.map(c => {
            let riskColor = c.riskLevel === 'high' ? 'var(--danger)' : c.riskLevel === 'medium' ? 'var(--warning)' : 'var(--success)';
            return `
            <tr>
                <td><strong><span style="font-size: 1.1em; margin-right: 0.25rem;">${getCategoryIcon(c.purpose, c.merchant)}</span> ${c.id}</strong></td>
                <td>${c.date}</td>
                <td>Jane Doe</td>
                <td>$${c.amount.toFixed(2)}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <div style="width:10px;height:10px;border-radius:50%;background:${riskColor}"></div>
                        <span style="text-transform:capitalize;">${c.riskLevel}</span>
                    </div>
                </td>
                <td><span class="badge ${c.status}">${c.status}</span></td>
                <td>
                    <button class="btn btn-primary btn-sm view-audit-btn" data-id="${c.id}" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">Review</button>
                </td>
            </tr>
        `}).join('');

        // Attach events to purely rendered buttons
        document.querySelectorAll('.view-audit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                navigate('audit-detail', { id });
            });
        });
    }

    // 3. Audit Detail View
    function renderAuditDetail(id) {
        const claim = appStore.getClaimById(id);
        if(!claim) return;

        let alertHTML = '';
        if(claim.status === 'rejected') {
            alertHTML = `<div class="flag-alert danger"><i class="icon-lucide-alert-octagon"></i><div><strong>Policy Violation Deteced</strong><br>${claim.flagReason}</div></div>`;
        } else if (claim.status === 'flagged') {
            alertHTML = `<div class="flag-alert warning"><i class="icon-lucide-alert-triangle"></i><div><strong>Needs Verification</strong><br>${claim.flagReason}</div></div>`;
        } else {
            alertHTML = `<div class="flag-alert success"><i class="icon-lucide-check-circle"></i><div><strong>Compliant</strong><br>This expense fully complies with policy.</div></div>`;
        }

        viewContainer.innerHTML = `
            <div class="fade-enter">
                <div style="margin-bottom: 1rem;">
                    <button class="btn" id="back-btn" style="background:rgba(255,255,255,0.7);"><i class="icon-lucide-arrow-left"></i> Back to Dashboard</button>
                </div>
                
                <div class="audit-grid">
                    <!-- Left: Image -->
                    <div class="card receipt-preview" style="text-align:center;">
                        <h3 style="margin-bottom: 1rem; text-align:left;">Digital Receipt</h3>
                        <img src="${claim.receiptUrl}" alt="Receipt">
                    </div>

                    <!-- Right: Data & Actions -->
                    <div class="card">
                        ${alertHTML}
                        
                        <h3 style="margin-bottom: 1rem;">Extracted Data (OCR)</h3>
                        <table style="margin-bottom: 2rem;">
                            <tr><td style="color:var(--text-muted); width: 120px;">Category</td><td><strong><span style="font-size: 1.25em;">${getCategoryIcon(claim.purpose, claim.merchant)}</span></strong></td></tr>
                            <tr><td style="color:var(--text-muted);">Merchant</td><td><strong>${claim.merchant}</strong></td></tr>
                            <tr><td style="color:var(--text-muted);">Date</td><td><strong>${claim.date}</strong></td></tr>
                            <tr><td style="color:var(--text-muted);">Amount</td><td><strong>$${claim.amount.toFixed(2)} ${claim.currency}</strong></td></tr>
                            <tr><td style="color:var(--text-muted);">Purpose</td><td>${claim.purpose}</td></tr>
                            <tr><td style="color:var(--text-muted); vertical-align: top;">Raw Bill Text</td><td><pre style="white-space: pre-wrap; font-size: 0.8rem; background: var(--bg-main); padding: 0.5rem; border-radius: 4px; max-height: 150px; overflow-y: auto; font-family: monospace;">${claim.rawText}</pre></td></tr>
                        </table>

                        <h3 style="margin-bottom: 1rem;">Policy Justification Context</h3>
                        <p style="font-size:0.9rem; color:var(--text-muted);">The AI Engine retrieved the following rule matching this expenditure category:</p>
                        <div class="policy-snippet">
                            ${claim.policySnippet}
                        </div>

                        ${claim.status !== 'approved' ? `
                        <div class="action-buttons">
                            <button class="btn btn-primary" id="override-approve-btn"><i class="icon-lucide-check"></i> Override & Approve</button>
                            <button class="btn" id="confirm-reject-btn" style="background:var(--danger); color:white;"><i class="icon-lucide-x"></i> Confirm Rejection</button>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('back-btn').addEventListener('click', () => {
            navigate('auditor');
        });

        const approveBtn = document.getElementById('override-approve-btn');
        if(approveBtn) {
            approveBtn.addEventListener('click', () => {
                const note = prompt("Enter override justification:");
                if(note !== null) {
                    appStore.updateClaimStatus(id, 'approved', note);
                    alert("Claim approved manually.");
                    navigate('auditor');
                }
            });
        }

        const rejectBtn = document.getElementById('confirm-reject-btn');
        if(rejectBtn) {
            rejectBtn.addEventListener('click', () => {
                alert("Rejection confirmed. Employee will be notified.");
                navigate('auditor');
            });
        }
    }

    // 4. Landing Page
    function renderHome() {
        viewContainer.innerHTML = `
            <div class="fade-enter">
                <div style="text-align:center; padding: 4rem 2rem; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); margin-bottom: 3rem; position: relative; overflow: hidden;">
                    <div style="position:absolute; top:-50px; right:-50px; width:200px; height:200px; background: rgba(255,255,255,0.05); border-radius:50%; blur(40px);"></div>
                    <i class="icon-lucide-shield-check" style="font-size: 4rem; color: #818cf8; margin-bottom: 1rem;"></i>
                    <h1 style="font-size: 3rem; font-weight: 700; margin-bottom: 1.5rem; letter-spacing: -0.05em;">AI-Powered Policy Enforcement</h1>
                    <p style="font-size: 1.25rem; max-width: 600px; margin: 0 auto; color: #c7d2fe; line-height: 1.6;">
                        Automatically cross-reference incoming receipts against 40-page corporate financial policies using Neural Network OCR and rule-based heuristics.
                    </p>
                </div>

                <div class="audit-grid" style="gap: 3rem;">
                    <div class="card" style="text-align: center; border-top: 4px solid #3b82f6; cursor: pointer; transition: transform 0.3s ease;" onclick="document.querySelector('[data-route=employee]').click()">
                        <i class="icon-lucide-receipt" style="font-size: 3rem; color: #3b82f6; margin-bottom: 1.5rem; display: inline-block;"></i>
                        <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Employee Portal</h2>
                        <p style="color: var(--text-muted); margin-bottom: 2rem;">Upload your receipts to instantly verify if your expenses comply with limits before hitting submit.</p>
                        <button class="btn btn-primary" style="width: 100%;">Create a Claim <i class="icon-lucide-arrow-right"></i></button>
                    </div>

                    <div class="card" style="text-align: center; border-top: 4px solid #10b981; cursor: pointer; transition: transform 0.3s ease;" onclick="document.querySelector('[data-route=auditor]').click()">
                        <i class="icon-lucide-layout-dashboard" style="font-size: 3rem; color: #10b981; margin-bottom: 1.5rem; display: inline-block;"></i>
                        <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Auditor Dashboard</h2>
                        <p style="color: var(--text-muted); margin-bottom: 2rem;">Review high-risk transactions caught by the engine, track duplicate invoices, and approve payouts.</p>
                        <button class="btn btn-primary" style="width: 100%; background: #10b981;">Access Finance Desk <i class="icon-lucide-arrow-right"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    function renderInlineCharts() {
        setTimeout(() => {
            const claims = appStore.getClaims();
            const statusCounts = { approved: 0, flagged: 0, rejected: 0 };
            claims.forEach(c => { if(statusCounts[c.status] !== undefined) statusCounts[c.status]++; });

            const ctx1 = document.getElementById('inlineRiskChart');
            if(ctx1) {
                new Chart(ctx1.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Approved', 'Flagged', 'Rejected'],
                        datasets: [{
                            data: [statusCounts.approved, statusCounts.flagged, statusCounts.rejected],
                            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                            borderWidth: 0, hoverOffset: 2
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { title: { display: true, text: 'Total Validations', font: {size: 13} }, legend: { position: 'bottom', labels: { boxWidth: 10 } } }
                    }
                });
            }

            let spendCategories = { 'Meals': 0, 'Transport': 0, 'Lodging': 0, 'Other': 0 };
            claims.filter(c => c.status === 'approved' || c.status === 'flagged').forEach(c => {
                const t = (c.purpose + ' ' + c.merchant).toLowerCase();
                if(t.includes('meal') || t.includes('dinner') || t.includes('lunch') || t.includes('restaurant')) spendCategories['Meals'] += c.amount;
                else if(t.includes('uber') || t.includes('taxi') || t.includes('flight') || t.includes('air')) spendCategories['Transport'] += c.amount;
                else if(t.includes('hotel') || t.includes('lodging') || t.includes('resort')) spendCategories['Lodging'] += c.amount;
                else spendCategories['Other'] += c.amount;
            });

            const ctx2 = document.getElementById('inlineBudgetChart');
            if(ctx2) {
                new Chart(ctx2.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: Object.keys(spendCategories),
                        datasets: [{
                            label: 'Approved YTD',
                            data: Object.values(spendCategories),
                            backgroundColor: '#3b82f6',
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { title: { display: true, text: 'Spend By Category ($)', font: {size: 13} }, legend: { display: false } },
                        scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: {size: 10} } }, x: { ticks: { font: {size: 10} } } }
                    }
                });
            }
        }, 150);
    }

    // Init
    navigate('home');
});
