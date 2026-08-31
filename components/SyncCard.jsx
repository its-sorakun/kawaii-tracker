import React from 'react';
import Card from './Card.jsx';
import Icon from './Icon.jsx';

const SyncCard = ({ 
    fileHandle, 
    isSyncing, 
    lastSyncTime, 
    onConnect, 
    onDisconnect, 
    onRequestPermission, 
    needsPermission 
}) => {
    return (
        <Card>
            <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon name="hard-drive" className="text-blue-500" />
                    Local Sync
                </div>
                {fileHandle && !needsPermission && (
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full">
                        <div className={`w-2 h-2 rounded-full bg-emerald-500 ${isSyncing ? 'animate-pulse' : ''}`}></div>
                        Connected
                    </div>
                )}
            </h2>

            {!fileHandle ? (
                <div className="text-center py-4">
                    <p className="text-sm opacity-70 mb-4">Connect a local JSON file to save your data directly to your hard drive instead of the browser.</p>
                    <button 
                        onClick={onConnect}
                        className="w-full bg-blue-500 text-white font-medium py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Icon name="file-json" size={20} />
                        Select Local File
                    </button>
                </div>
            ) : needsPermission ? (
                <div className="text-center py-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-200 dark:border-orange-800 p-4">
                    <Icon name="shield-alert" className="mx-auto text-orange-500 mb-2" size={32} />
                    <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
                        The browser needs your permission to read and write to <strong>{fileHandle.name}</strong>.
                    </p>
                    <button 
                        onClick={onRequestPermission}
                        className="w-full bg-orange-500 text-white font-medium py-3 rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        Grant Permission
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <Icon name="file" className="opacity-50" size={20} />
                            <div>
                                <div className="font-medium text-sm">{fileHandle.name}</div>
                                <div className="text-xs opacity-60">
                                    {isSyncing ? 'Syncing...' : lastSyncTime ? `Last synced: ${lastSyncTime}` : 'Ready'}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onDisconnect}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            title="Disconnect File"
                        >
                            <Icon name="unlink" size={20} />
                        </button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default SyncCard;
