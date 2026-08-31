import { get, set, del } from 'idb-keyval';

const FILE_HANDLE_KEY = 'calorie_tracker_file_handle';

/**
 * Prompts the user to select or create a JSON file to sync.
 * @returns {Promise<FileSystemFileHandle>} The selected file handle.
 */
export const selectSyncFile = async () => {
    try {
        const [handle] = await window.showOpenFilePicker({
            types: [{
                description: 'JSON Files',
                accept: { 'application/json': ['.json'] },
            }],
            multiple: false
        });
        await set(FILE_HANDLE_KEY, handle);
        return handle;
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Failed to select file:', error);
        }
        throw error;
    }
};

/**
 * Retrieves the stored file handle from IndexedDB, if it exists.
 */
export const getStoredFileHandle = async () => {
    return await get(FILE_HANDLE_KEY);
};

/**
 * Checks if we have permission to read/write the handle. If not, requests it.
 * Note: requesting permission REQUIRES a user gesture.
 */
export const verifyPermission = async (fileHandle) => {
    const options = { mode: 'readwrite' };
    
    // Check if we already have permission
    if (await fileHandle.queryPermission(options) === 'granted') {
        return true;
    }

    // Request permission (triggers the browser popup)
    if (await fileHandle.requestPermission(options) === 'granted') {
        return true;
    }

    return false;
};

/**
 * Reads and parses the JSON from the file handle.
 */
export const readDataFromFile = async (fileHandle) => {
    try {
        const file = await fileHandle.getFile();
        const text = await file.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error('Failed to read from file:', error);
        throw error;
    }
};

/**
 * Writes a JSON string to the file handle.
 */
export const writeDataToFile = async (fileHandle, data) => {
    try {
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(data, null, 2));
        await writable.close();
    } catch (error) {
        console.error('Failed to write to file:', error);
        throw error;
    }
};

/**
 * Disconnects the sync file by deleting the handle from IndexedDB.
 */
export const disconnectSyncFile = async () => {
    await del(FILE_HANDLE_KEY);
};
