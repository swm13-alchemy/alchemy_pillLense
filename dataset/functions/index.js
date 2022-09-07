const fs = require('fs');

const generateRandomString = num => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < num; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
};

const browseFile = path => {
    return fs.readFileSync(path, 'utf8');
};

const browseJSON = path => {
    return JSON.parse(browseFile(path));
};

const saveListAsJSON = (path, value) => {
    fs.writeFileSync(path, JSON.stringify(value), 'utf8');
};

const saveSetAsJson = (path, targetSet) => {
    const saveList = [];

    targetSet.forEach(e => {
        if (!e) return;
        saveList.push(e);
    });

    saveListAsJSON(path, saveList);
};

module.exports = {
    generateRandomString,
    saveSetAsJson,
    saveListAsJSON,
    browseFile,
    browseJSON,
};
