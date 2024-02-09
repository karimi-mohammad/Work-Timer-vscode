const fs = require('fs');

module.exports = {
    findExtensionDataPath() {
        let userProfile = process.env.USERPROFILE;
        if (userProfile) {
            userProfile = require('os').homedir();
        }
        return `${userProfile}/.vscode/extensions/work-timer/data`
    },
    async readFileAndContinueIfExists(exists, extensionDataPath) {
        if (exists) {
            try {
                const dataInFile = JSON.parse(await fs.promises.readFile(extensionDataPath, 'utf-8'));
                console.log(await dataInFile);
                return await dataInFile
            } catch (err) {
                console.error(err);
            }
        }
    }, ensureDirectoryExists(dirPath) {
        try {
            fs.mkdirSync(dirPath, { recursive: true }); // Create directory and any missing parent directories
        } catch (err) {
            if (err.code !== 'EEXIST') {
                throw err; // Re-throw the error if it's not due to the directory already existing
            }
        }
    }
}
