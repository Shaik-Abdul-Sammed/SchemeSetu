const fs = require('fs');
const path = require('path');

const langFilePath = path.resolve(__dirname, '../frontend/src/context/languageStore.js');
const langFileContent = fs.readFileSync(langFilePath, 'utf8');

const langMatch = langFileContent.match(/export const translations = ({[\s\S]*?});/) ||
                  langFileContent.match(/const translations = ({[\s\S]*?});/);

if (!langMatch) {
  console.error("Could not parse translations object from languageStore.js");
  process.exit(1);
}

const transObj = eval('(' + langMatch[1] + ')');
const languages = Object.keys(transObj);
const enKeys = Object.keys(transObj.EN || {});

console.log("=========================================================================================");
console.log("                         SCHEMESETU TRANSLATION AUDIT REPORT                             ");
console.log("=========================================================================================");
console.log("Language | Total Keys | Missing | Empty | English Duplicates | Invalid (undefined/null)");
console.log("-----------------------------------------------------------------------------------------");

let allPassed = true;

languages.forEach(lang => {
  const dict = transObj[lang] || {};
  const total = Object.keys(dict).length;
  const missing = enKeys.filter(k => dict[k] === undefined).length;
  const empty = Object.values(dict).filter(v => v === '').length;
  const invalid = Object.values(dict).filter(v => v === null || v === undefined || v === '[object Object]').length;

  let enDuplicates = 0;
  if (lang !== 'EN') {
    enDuplicates = Object.keys(dict).filter(k => dict[k] === transObj.EN[k] && !['EN', 'PM-KISAN', 'PMEGP', 'PMMY', 'OK', 'N/A'].includes(dict[k])).length;
  }

  const isOk = missing === 0 && empty === 0 && invalid === 0;
  if (!isOk) allPassed = false;

  console.log(`${lang.padEnd(8)} | ${String(total).padEnd(10)} | ${String(missing).padEnd(7)} | ${String(empty).padEnd(5)} | ${String(enDuplicates).padEnd(18)} | ${invalid}`);
});

console.log("-----------------------------------------------------------------------------------------");
console.log(`Total Keys in Master Dictionary (EN): ${enKeys.length}`);
console.log(`Parity Status across 10 Languages: ${allPassed ? '✅ 100% PARITY & VALIDITY VERIFIED' : '❌ AUDIT FAILED'}`);
console.log("=========================================================================================\n");

process.exit(allPassed ? 0 : 1);
