const fs = require('fs');

const backendPath = '/home/user/Github/SchemeSetu/backend/src/data/schemesData.js';
const frontendPath = '/home/user/Github/SchemeSetu/frontend/src/data/mock/schemes.js';

const financialEnrichments = {
  "pm-mudra-yojana": { minLoan: 10000, maxLoan: 2000000, maxProjectCost: 2000000, interestRate: 8.5, tenureMonths: 60, moratoriumMonths: 6 },
  "pm-mudra-shishu": { minLoan: 10000, maxLoan: 50000, maxProjectCost: 50000, interestRate: 8.0, tenureMonths: 36, moratoriumMonths: 3 },
  "pm-mudra-kishore": { minLoan: 50000, maxLoan: 500000, maxProjectCost: 500000, interestRate: 8.5, tenureMonths: 60, moratoriumMonths: 6 },
  "pm-mudra-tarun": { minLoan: 500000, maxLoan: 1000000, maxProjectCost: 1000000, interestRate: 9.0, tenureMonths: 60, moratoriumMonths: 6 },
  "stand-up-india": { minLoan: 1000000, maxLoan: 10000000, maxProjectCost: 10000000, interestRate: 7.5, tenureMonths: 84, moratoriumMonths: 18 },
  "pm-svanidhi": { minLoan: 10000, maxLoan: 50000, maxProjectCost: 50000, interestRate: 7.0, tenureMonths: 12, moratoriumMonths: 0 },
  "pm-vishwakarma": { minLoan: 100000, maxLoan: 300000, maxProjectCost: 300000, interestRate: 5.0, tenureMonths: 30, moratoriumMonths: 3 },
  "pmegp": { minLoan: 100000, maxLoan: 5000000, maxProjectCost: 5000000, interestRate: 9.5, tenureMonths: 84, moratoriumMonths: 6 },
  "dalit-bandhu": { minLoan: 1000000, maxLoan: 1000000, maxProjectCost: 1000000, interestRate: 0.0, tenureMonths: 0, moratoriumMonths: 0 }
};

// Process backend schemesData.js
let backendContent = fs.readFileSync(backendPath, 'utf8');
const schemesData = require(backendPath);

schemesData.forEach(scheme => {
  if (financialEnrichments[scheme.id]) {
    Object.assign(scheme, financialEnrichments[scheme.id]);
  }
});

fs.writeFileSync(backendPath, `const schemesData = ${JSON.stringify(schemesData, null, 2)};\n\nmodule.exports = schemesData;\n`, 'utf8');
console.log('✅ Updated backend schemesData.js with financial limits!');

// Process frontend schemes.js if present
if (fs.existsSync(frontendPath)) {
  fs.writeFileSync(frontendPath, `export const mockSchemes = ${JSON.stringify(schemesData, null, 2)};\nexport default mockSchemes;\n`, 'utf8');
  console.log('✅ Updated frontend mock schemes.js with financial limits!');
}
