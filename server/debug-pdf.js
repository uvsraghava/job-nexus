const pdf = require('pdf-parse');

console.log("--------------------------------------------------");
console.log("🔍 DIAGNOSING PDF-PARSE LIBRARY");
console.log("1. Type of export:", typeof pdf);
console.log("2. Is it a function?", typeof pdf === 'function');
console.log("3. Object Keys:", Object.keys(pdf));
console.log("4. Full Structure:", pdf);
console.log("--------------------------------------------------");