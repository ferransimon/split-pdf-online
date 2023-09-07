const saveFile = async (blob: Blob) => {
    // @ts-ignore
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
}

export {saveFile}