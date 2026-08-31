import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopNavigation from './components/TopNavigation.jsx';
import LogPage from './pages/LogPage.jsx';
import ChartPage from './pages/ChartPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import InsightsPage from './pages/InsightsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { loadData, saveData } from './utils/storage.js';
import { 
    selectSyncFile, 
    getStoredFileHandle, 
    verifyPermission, 
    readDataFromFile, 
    writeDataToFile, 
    disconnectSyncFile 
} from './utils/fileSync.js';

const App = () => {
    // Basic Theme State (still stored in localStorage because it's a UI preference)
    const [theme, setTheme] = useState(() => loadData('theme', 'light'));
    
    // Core Data States
    const [logs, setLogs] = useState([]);
    const [profile, setProfile] = useState({ height: '', weight: '', age: '', gender: 'male' });
    const [chatHistory, setChatHistory] = useState([]);
    
    // File Sync States
    const [fileHandle, setFileHandle] = useState(null);
    const [needsPermission, setNeedsPermission] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [isAppLoaded, setIsAppLoaded] = useState(false); // Prevents saving before initial load

    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        saveData('theme', theme);
    }, [theme]);

    // Initial Load: Check for stored file handle or fallback to localStorage
    useEffect(() => {
        const initStorage = async () => {
            const storedHandle = await getStoredFileHandle();
            if (storedHandle) {
                setFileHandle(storedHandle);
                // We cannot read yet because we need user gesture permission on refresh
                setNeedsPermission(true);
            } else {
                // Fallback to localStorage if no file is connected
                setLogs(loadData('calorie_logs', []));
                setProfile(loadData('user_profile', { height: '', weight: '', age: '', gender: 'male' }));
                setChatHistory(loadData('gemini_chat', []));
                setIsAppLoaded(true);
            }
        };
        initStorage();
    }, []);

    const skipNextSync = React.useRef(false);

    const performSyncWrite = useCallback(async (currentLogs, currentProfile, currentChat) => {
        if (!isAppLoaded) return;
        
        if (fileHandle && !needsPermission) {
            setIsSyncing(true);
            try {
                await writeDataToFile(fileHandle, {
                    logs: currentLogs,
                    profile: currentProfile,
                    chatHistory: currentChat
                });
                setLastSyncTime(new Date().toLocaleTimeString());
            } catch (err) {
                console.error("Write failed:", err);
            } finally {
                setIsSyncing(false);
            }
        } else {
            saveData('calorie_logs', currentLogs);
            saveData('user_profile', currentProfile);
            saveData('gemini_chat', currentChat);
        }
    }, [fileHandle, needsPermission, isAppLoaded]);

    // Auto-sync is REMOVED to prevent losing user gesture context.
    // We now sync explicitly on user actions (button clicks).

    const handleConnectFile = async (e) => {
        if (e) e.preventDefault();
        try {
            const handle = await selectSyncFile();
            setFileHandle(handle);
            
            // Read existing data from the selected file
            const data = await readDataFromFile(handle);
            if (data) {
                if (data.logs) setLogs(data.logs);
                if (data.profile) setProfile(data.profile);
                if (data.chatHistory) setChatHistory(data.chatHistory);
            }
            setNeedsPermission(false);
            setIsAppLoaded(true);
            setLastSyncTime(new Date().toLocaleTimeString());
        } catch (err) {
            console.error("Connection cancelled or failed", err);
        }
    };

    const handleRequestPermission = async (e) => {
        if (e) e.preventDefault();
        if (!fileHandle) return;
        const granted = await verifyPermission(fileHandle);
        if (granted) {
            const data = await readDataFromFile(fileHandle);
            if (data) {
                if (data.logs) setLogs(data.logs);
                if (data.profile) setProfile(data.profile);
                if (data.chatHistory) setChatHistory(data.chatHistory);
            }
            setNeedsPermission(false);
            setIsAppLoaded(true);
            setLastSyncTime(new Date().toLocaleTimeString());
        }
    };

    const handleDisconnect = async () => {
        await disconnectSyncFile();
        setFileHandle(null);
        setNeedsPermission(false);
    };

    const handleAddLog = (newLog) => {
        const newLogs = [newLog, ...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
        setLogs(newLogs);
        performSyncWrite(newLogs, profile, chatHistory);
    };

    const handleDeleteLog = (id) => {
        const newLogs = logs.filter(l => l.id !== id);
        setLogs(newLogs);
        performSyncWrite(newLogs, profile, chatHistory);
    };

    const handleUpdateProfile = (newProfile) => {
        setProfile(newProfile);
        performSyncWrite(logs, newProfile, chatHistory);
    };

    const handleUpdateChatHistory = (newHistory) => {
        // Handle function updates if needed (though we mostly pass arrays)
        const resolvedHistory = typeof newHistory === 'function' ? newHistory(chatHistory) : newHistory;
        setChatHistory(resolvedHistory);
        performSyncWrite(logs, profile, resolvedHistory);
    };

    const handleDownloadJSON = () => {
        const data = { profile, logs, chatHistory };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calorie_tracker_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const syncProps = {
        fileHandle,
        isSyncing,
        lastSyncTime,
        needsPermission,
        onConnect: handleConnectFile,
        onDisconnect: handleDisconnect,
        onRequestPermission: handleRequestPermission
    };
    
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-[#141218] flex flex-col transition-colors duration-300">
                <TopNavigation theme={theme} setTheme={setTheme} />
                
                <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
                    {/* Block rendering if waiting for permission on load to prevent overwrite */}
                    {fileHandle && needsPermission && !isAppLoaded ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center p-8 bg-white dark:bg-[#1c1b1f] rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
                                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Permission Required</h2>
                                <p className="mb-6 opacity-70">Please grant access to your sync file to continue.</p>
                                <button 
                                    onClick={handleRequestPermission}
                                    className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-600 transition-colors"
                                >
                                    Grant Access to {fileHandle.name}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Routes>
                            <Route path="/" element={<LogPage onAddLog={handleAddLog} />} />
                            <Route path="/chart" element={<ChartPage logs={logs} theme={theme} profile={profile} />} />
                            <Route path="/history" element={<HistoryPage logs={logs} onDeleteLog={handleDeleteLog} />} />
                            <Route path="/insights" element={
                                <InsightsPage 
                                    profile={profile} 
                                    logs={logs} 
                                    chatHistory={chatHistory} 
                                    setChatHistory={handleUpdateChatHistory} 
                                />
                            } />
                            <Route path="/settings" element={
                                <SettingsPage
                                    profile={profile}
                                    setProfile={handleUpdateProfile}
                                    syncProps={syncProps}
                                    onDownloadJSON={handleDownloadJSON}
                                />
                            } />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    )}
                </main>
            </div>
        </Router>
    );
};

export default App;
