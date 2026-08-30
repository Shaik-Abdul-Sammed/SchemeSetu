# SchemeSetu — Demo Person Dataset (SIH Demonstration)

This directory contains standardized, realistic, fictional demographic profiles for testing and demonstrating **SchemeSetu's AI-style local scheme recommendation engine**, data-driven financial limit checks, and media upload features.

## Files Included

| File | Format | Description |
|---|---|---|
| `demo-person-sc-profile.json` | JSON | Single complete fictional Scheduled Caste (SC) micro-entrepreneur profile (`Ramesh Kumar`, Project Cost ₹3,50,000, Loan ₹2,50,000). |
| `demo-person-sc-profile.csv` | CSV | Tabular CSV version of the SC entrepreneur profile. |
| `demo-person-multiple-profiles.json` | JSON | 6 diverse profiles covering SC, ST, OBC, Women, Farmers, and Street Vendors across different income tiers. |
| `demo-person-multiple-profiles.csv` | CSV | Tabular CSV version containing all 6 diverse evaluation records. |

## Profile Attributes & Schema

- `id`: Unique identifier (e.g. `"DEMO-SC-001"`)
- `name`: Beneficiary persona name
- `age`: Age in years (18 to 100)
- `gender`: `"Male"`, `"Female"`, or `"Transgender"`
- `category` / `casteCategory`: Social group (`"SC"`, `"ST"`, `"OBC"`, `"General"`)
- `state` / `district` / `villageTown`: Location coordinates
- `education`: Educational qualification (`"8th pass"`, `"10th pass"`, `"12th pass"`, `"Graduate"`)
- `occupation` & `businessType`: Enterprise vocation (e.g. `"Manufacturing"`, `"Handicrafts"`, `"Dairy"`)
- `annualIncome` / `existingBusinessIncome`: Annual earnings in ₹ (0 to 1,00,00,000)
- `projectCost`: Total proposed enterprise capital requirement
- `loanRequirement`: Requested bank credit / subsidy assistance
- `numEmployees`: Headcount of workers
- `disabilityStatus`: PwD declaration (`"Yes"` / `"No"`)
- `bplStatus`: Below Poverty Line card status (`"Yes"` / `"No"`)

## Upload & Demonstration Workflow

1. In SchemeSetu, open **Data Hub** or **Eligibility Recommendation Wizard**.
2. Upload either `demo-person-sc-profile.json` or `demo-person-sc-profile.csv`.
3. The platform validates all financial and demographic constraints locally in your browser.
4. Click **"Confirm & Recommend Schemes"** to run data-driven matching against central & state schemes (e.g. Mudra Kishore, PMEGP SC subsidy, Stand-Up India, Dalit Bandhu).
