const fs = require('fs');
const path = require('path');

const directories = ['files',
];

const outputPath = path.join(__dirname, 'files.json');

let filesList = [];

directories.forEach(directory => {
    const folderPath = path.join(__dirname, directory);
    const files = fs.readdirSync(folderPath).map(file => ({
        directory,
        file,
    }));
    filesList = filesList.concat(files);
});

fs.writeFileSync(outputPath, JSON.stringify(filesList, null, 2));
console.log('File list generated successfully.');
