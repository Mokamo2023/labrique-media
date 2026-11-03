// Détourage local : node tools/cutout.mjs entree.jpg sortie.png
// Nécessite : bash tools/setup.sh (installe @imgly/background-removal-node dans /tmp/lb-tools)
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire('/tmp/lb-tools/package.json');
const { removeBackground } = require('@imgly/background-removal-node');
const [,, inp, out] = process.argv;
const type = inp.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
const blob = await removeBackground(new Blob([fs.readFileSync(inp)], { type }), { publicPath: 'file:///tmp/lb-tools/node_modules/@imgly/background-removal-node/dist/', model: 'medium', output: { format: 'image/png' } });
fs.writeFileSync(out, Buffer.from(await blob.arrayBuffer()));
console.log('détourage ok', out);
