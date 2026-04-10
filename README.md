# Policy-First Expense Auditor

An AI-powered corporate expense reporting and auditing platform. Built exclusively with vanilla web technologies, this prototype leverages native browser-based Neural Network OCR (Tesseract.js) to scan uploaded receipts, extract monetary and contextual data, and instantly cross-reference them against complex corporate financial compliance policies.

## Key Features
- **Browser-Native Neural Net OCR**: Processes physical receipt images entirely client-side using WebAssembly Tesseract.js.
- **Rule-Based Heuristic AI**: Evaluates extracted parameters against a corporate financial policy (e.g., automated Alcohol flagging, Weekend expense logic, Tier 1 city cost limits).
- **Dual-Portal System**: 
  - *Employee Portal* for streamlined, instant AI-validated expense submission.
  - *Auditor Dashboard* for batch-reviewing incoming claims.
- **Data Persistence**: Uses HTML5 `localStorage` for cross-session and cross-tab state preservation.
- **Data Visualization**: Rich visual analytics powered by `Chart.js`.

## Setup & Running Locally
Because this project emphasizes a zero-build portability framework, deploying it locally takes seconds. No backend server or API keys are required.

1. Clone this repository to your local machine:
   ```bash
   git clone <your-repo-link>
   ```
2. Navigate into the target directory:
   ```bash
   cd expense_auditor
   ```
3. Open `index.html` natively in any modern web browser (e.g., Chrome, Edge, Safari):
   - You can simply double-click the file in your OS folder explorer.
   - Alternatively, you can use an extension like VS Code Live Server.

## Usage Guide
1. Launch the app and select **Employee Portal**.
2. Upload a sample image of a restaurant or hotel receipt.
3. Enter a business description and click **Process & Submit**.
4. The system will invoke the Tesseract model to scan the image, outputting the analytical breakdown.
5. Click **Home**, then head to the **Finance Dashboard** to see global metrics and review claims. 
