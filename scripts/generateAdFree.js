const { existsSync, unlinkSync, readFileSync, writeFileSync, createReadStream, createWriteStream } = require('fs');
const path = require('path');

const rootDirPath = path.resolve(__dirname, '..');
const inputFilePath = path.resolve(rootDirPath, 'docs', 'index.html');
const outputFilePath = path.resolve(rootDirPath, 'docs', 'adfree.html');

if (existsSync(outputFilePath)) {
  unlinkSync(outputFilePath);
}

const readStream = createReadStream(inputFilePath, { encoding: 'utf-8' });
const writeStream = createWriteStream(outputFilePath, { encoding: 'utf-8' });

let modifiedContent = '';

const startString = '<excludeInAdFree>';
const endString = '</excludeInAdFree>';
let skip = false;

readStream.on('data', chunk => {
  const lines = chunk.split('\n');
  for (let line of lines) {
    if (line.includes(startString)) {
      skip = true;
      continue;
    }
    if (line.includes(endString)) {
      skip = false;
      continue;
    }
    if (!skip) modifiedContent += line + '\n';
  }
});

readStream.on('close', () => {
  writeStream.write(modifiedContent);
  writeStream.end();
});

readStream.on('error', err => {
  console.error(`Error while reading file: ${inputFilePath}`);
  console.error(err);
});

writeStream.on('finish', () => {
  console.log(`The file ${outputFilePath} has been created!`);
});

writeStream.on('error', err => {
  console.error(`Error while writing file: ${outputFilePath}`);
  console.error(err);
});
