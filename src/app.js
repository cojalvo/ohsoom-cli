#!/usr/bin/env node

const program = require('commander').program;
const axios = require('axios');
const fs = require('fs');


program.version('0.0.1');

program
    .option('-t, --translate', 'Translation CLI')
    .option('-c, --compare', 'Compare')
    .option('-s, --source <type>', 'Source translation')
    .option('-d, --dest <type>', 'Destination translation')
    .option('-o, --output <type>', 'Output file');

program.parse(process.argv);

if (program.translate) console.log('Translation CLI');
if (program.compare) console.log('Start comparing');

if (program.translate) {
    if (program.compare) {
        const s = program.source;
        const d = program.dest;
        downloadAndCompare(d, s).then((res) => {

        }).catch((err) => {

        })

    }
}

async function downloadAndCompare(d, s) {
    const dFileResult = await axios.get(d);

    if (dFileResult.status !== 200) {
        throw "Unable to read dest file";
    }
    const sFileResult = await axios.get(s);

    if (sFileResult.status !== 200) {
        throw "Unable to read source file";
    }

    const map = {};
    dFileResult.data.split("\n").forEach(l => {
        const lTokens = l.split(',');
        if (lTokens[0]) {
            map[lTokens[0].trim()] = lTokens[1] ? lTokens[1].trim() : ''
        }
    });

    sFileResult.data.split("\n").forEach(l => {
        const lTokens = l.split(',');
        if (!map[lTokens[0].trim()]) {
            map[lTokens[0].trim()] = "[MISSING_TRANSLATION]"
        }
    });

    const all = Object.keys(map).map(k => `${k}, ${map[k]}`);

    const file = fs.createWriteStream(program.output ? program.output : "res.csv");
    file.on('error', function (err) { /* error handling */
    });
    all.forEach(function (v) {
        file.write(v + '\n');
    });
    file.end();
}

