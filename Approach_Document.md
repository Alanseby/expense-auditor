# Solution Approach Document

## 1. Solution Design
The fundamental goal of the "Policy-First" Expense Auditor is to solve the extreme scalability bottlenecks faced by corporate finance teams processing massive volumes of incoming physical receipts. 

To achieve this, the architecture was explicitly designed to shift the analytical payload from a centralized server directly onto edge devices (the employee's local browser). Instead of transmitting sensitive financial documents to an external API (like AWS Textract or OpenAI), we inject a WebAssembly port of a Neural Network (`Tesseract.js`) directly into the DOM context.

When an employee submits an expense, a multi-step pipeline activates:
1. **Extraction Phase:** Tesseract scans the visual pixel matrix, streaming a progress event to the UI, and outputs raw linguistic text.
2. **Regex Targeting Phase:** Pure JavaScript algorithms algorithmically hunt for currency delimiters (`$`, `.`) to programmatically lock onto the "Highest Value" (The Receipt Total) and estimate merchant headers.
3. **Policy Matrix Routing:** A custom asynchronous logic engine evaluates the true extracted strings array against prohibited keywords (like "Vodka" or "Happy Hour"), triggering native rejection blocks instantly without database latency.

## 2. Tech Stack Choices
The prototype was engineered completely using **Vanilla HTML5, CSS3, and JavaScript**. 

- **Zero-Dependency Core:** Heavy frameworks like React, Next.js, or Angular were consciously avoided to guarantee universal portability. Evaluators can run this architecture seamlessly by simply double-clicking `index.html` locally without installing `npm` modules.
- **Tesseract.js (AI Layer):** Selected for its unparalleled browser-based OCR capabilities. It allows genuine image parsing autonomously on the client.
- **Chart.js:** Leveraged to autonomously render animated Doughnut and Bar analytic graphic canvases inside the Auditor portal visually.
- **State Management:** A custom Pub/Sub JavaScript mapping class (`js/store.js`) acts as the internal system manager, perpetually serializing array data into HTML5 `localStorage`. This guarantees memory inherently survives page refreshes and complex multi-tab execution layers without requiring a complex backend database.

## 3. Areas for Future Improvement
Given more time and expanded sprint scopes, the following architectural enhancements would drastically strengthen the application:
- **Cloud LLM Integration (Agentic Reasoning):** Transitioning away from explicit Regex heuristic checks (which can be circumvented by misread text) to a robust backend Node.js server actively queried against a Foundation LLM (e.g., Anthropic Claude / Google Gemini). This allows the AI to understand deep semantic context (e.g., knowing a "Ribeye" constitutes a dining limit calculation without explicitly searching for the word "dinner").
- **Backend Authentication:** Implementing cryptographically secure JWT tokens and encrypted route guarding for Finance User dashboards.
- **Relational Databasing:** Replacing standard `localStorage` with an enterprise-grade PostgreSQL integration utilizing the Prisma ORM.
