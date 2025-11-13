
import React, { useRef, useEffect } from 'react';

interface LogPanelProps {
    logs: string[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Processing Log</h2>
            <div ref={logContainerRef} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs text-gray-600 dark:text-gray-400">
                {logs.map((log, index) => (
                    <div key={index}>{log}</div>
                ))}
            </div>
        </div>
    );
};
