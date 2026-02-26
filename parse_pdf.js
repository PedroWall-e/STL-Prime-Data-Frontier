const fs = require('fs');
const pdf = require('pdf-parse');

console.log(typeof pdf, Object.keys(pdf));

let dataBuffer = fs.readFileSync('Data Frontier.pdf');

try {
    let fn = typeof pdf === 'function' ? pdf : (pdf.default || pdf.pdf);
    fn(dataBuffer).then(function (data) {
        console.log("PDF TEXT:");
        console.log(data.text);
    }).catch(console.error);
} catch (e) {
    console.error(e);
}
