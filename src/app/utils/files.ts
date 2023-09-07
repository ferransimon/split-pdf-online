const saveFile = async (blob) => {
    try {
        const handle = await window.showSaveFilePicker({
            suggestedName: 'split.zip',
            types: [{
                description: 'Archivos ZIP',
                accept: {
                    'application/zip': ['.zip'],
                },
            }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return handle;
    } catch (err) {
        console.error(err.name, err.message);
    }
}

export {saveFile}