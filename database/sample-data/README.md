# SchemeSetu Local Dataset & Sample Upload Files

This directory contains standardized sample datasets for evaluating the **SchemeSetu** offline prototype, recommendation algorithms, and Data Hub import tools.

## Included Files

| File | Format | Records | Description |
|---|---|---|---|
| `sample-schemes.json` | JSON | 8 Schemes | Central and State Government scheme profiles with loan limits, subsidies, and rules. |
| `sample-schemes.csv` | CSV | 8 Schemes | Tabular CSV equivalent of government schemes with semicolon-delimited lists. |
| `sample-users.json` | JSON | 5 Profiles | Citizen demographic profiles (diverse categories, incomes, occupations, and locations). |
| `sample-users.csv` | CSV | 5 Profiles | Tabular CSV test user records for batch eligibility verification. |

## Required Schema & Field Definitions

### 1. Scheme Records (`schemes.json` / `schemes.csv`)
- `id` (string, required): Unique identifier (e.g., `"SCHEME-001"`)
- `name` (string, required): Full scheme title
- `category` (string, required): Category classification (e.g., `"Micro Enterprise Loan"`)
- `level` (string): `"Central"` or `"State"`
- `state` (string): State name or `"Pan-India"`
- `minAge` / `maxAge` (number): Age eligibility range (e.g., `18` to `65`)
- `minIncome` / `maxIncome` (number): Annual income ceiling in INR
- `minLoan` / `maxLoan` (number): Credit range or assistance amount
- `interestRate` (number): Annualized interest percentage (e.g., `7.5`)
- `projectTypes` (array or semicolon-separated string): Applicable enterprise sectors
- `education` (array or semicolon-separated string): Minimum educational qualifications
- `department` (string): Nodal ministry or department
- `benefits` (string): Financial benefit summary

### 2. User Profiles (`users.json` / `users.csv`)
- `id` (string): Unique user reference (e.g., `"USER-001"`)
- `name` (string): Beneficiary persona name
- `age` (number): Age in years (18-100)
- `gender` (string): `"Male"`, `"Female"`, `"Transgender"`
- `category` (string): `"General"`, `"OBC"`, `"SC"`, `"ST"`
- `annualIncome` (number): Annual family income in INR (0 to 1,00,00,000)
- `occupation` (string): Vocation / occupation
- `projectCost` (number): Proposed project or business capital requirement
- `state` / `district` (string): Location coordinates

## How to Test the Upload Functionality

1. Open the SchemeSetu portal and navigate to the **Data Hub / Upload Data** section (accessible via Admin Portal or Settings).
2. Click **"Choose File"** and select either `sample-schemes.json`, `sample-schemes.csv`, `sample-users.json`, or `sample-users.csv`.
3. The system will parse the file locally, perform schema validation, display record counts, and show a live table preview.
4. Click **"Import Records into Prototype"** to immediately merge the data into the active session without requiring internet connectivity.
