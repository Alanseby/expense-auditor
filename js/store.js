// Simulated Global Store via localStorage
class Store {
    constructor() {
        this.claims = [];
        this.listeners = [];
        this.loadInitialData();
    }

    loadInitialData() {
        const stored = localStorage.getItem('auditpro_claims');
        if (stored) {
            this.claims = JSON.parse(stored);
        } else {
            // Pre-populate with some data for the auditor to see
            this.claims = [
                {
                    id: 'CLM-1001',
                    date: '2023-10-15',
                    amount: 45.00,
                    currency: 'USD',
                    merchant: 'Starbucks',
                    purpose: 'Client meeting coffee',
                    receiptUrl: 'https://images.unsplash.com/photo-1555502570-5bfae6d3cff3?auto=format&fit=crop&q=80&w=400',
                    status: 'approved',
                    riskLevel: 'low',
                    flagReason: '',
                    policySnippet: '[Section 4.1] Non-alcoholic beverages for client meetings are reimbursable up to $50 per attendee.',
                    rawText: 'Starbucks Coffee $45.00'
                },
                {
                    id: 'CLM-1002',
                    date: '2023-10-14',
                    amount: 155.00,
                    currency: 'USD',
                    merchant: 'Steakhouse NY',
                    purpose: 'Dinner',
                    receiptUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400',
                    status: 'rejected',
                    riskLevel: 'high',
                    flagReason: 'Rejected: Dinner limit for New York is $100; claim was for $155.',
                    policySnippet: '[Section 5.3] Employees dining in Tier 1 cities (e.g., NY, SF) have a daily dinner capping of $100. Overages require VP approval prior to event.',
                    rawText: 'NY Steakhouse Total $155.00'
                },
                {
                    id: 'CLM-1003',
                    date: '2023-10-18',
                    amount: 85.00,
                    currency: 'USD',
                    merchant: 'Uber',
                    purpose: 'Transport to venue on Saturday',
                    receiptUrl: 'https://images.unsplash.com/photo-1611342799915-5ddbadcf8d81?auto=format&fit=crop&q=80&w=400',
                    status: 'flagged',
                    riskLevel: 'medium',
                    flagReason: 'Flagged: Weekend travel requires specific justification; "Transport to venue" is ambiguous.',
                    policySnippet: '[Section 3.2] Weekend ground transportation is generally non-reimbursable unless explicitly tied to a verified weekend business event.',
                    rawText: 'Uber ride $85'
                }
            ];
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem('auditpro_claims', JSON.stringify(this.claims));
        this.notify();
    }

    addClaim(claim) {
        this.claims.unshift(claim);
        this.saveData();
    }

    updateClaimStatus(id, newStatus, overrideNote = '') {
        const claim = this.claims.find(c => c.id === id);
        if (claim) {
            claim.status = newStatus;
            if (newStatus === 'approved') claim.riskLevel = 'low';
            if (overrideNote) claim.flagReason = `Auditor Override: ${overrideNote}`;
            this.saveData();
        }
    }

    getClaims() {
        return this.claims;
    }

    getClaimById(id) {
        return this.claims.find(c => c.id === id);
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.claims));
    }
}

const appStore = new Store();
