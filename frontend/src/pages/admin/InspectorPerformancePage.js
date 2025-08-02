// frontend/src/pages/admin/InspectorPerformancePage.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { fetchInspectorPerformance } from '../../services/api';
import toast from 'react-hot-toast';
import { FiChevronDown, FiChevronUp, FiArrowLeft } from 'react-icons/fi'; // Import FiArrowLeft

const InspectorPerformancePage = () => {
    // ... (all state and handler functions remain the same)
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'totalInspections', direction: 'desc' });
    useEffect(() => { setLoading(true); fetchInspectorPerformance().then(res => setPerformanceData(res.data)).catch(() => toast.error('Failed to fetch performance data.')).finally(() => setLoading(false)); }, []);
    const sortedData = useMemo(() => { let sortableItems = [...performanceData]; if (sortConfig !== null) { sortableItems.sort((a, b) => { if (a[sortConfig.key] < b[sortConfig.key]) { return sortConfig.direction === 'asc' ? -1 : 1; } if (a[sortConfig.key] > b[sortConfig.key]) { return sortConfig.direction === 'asc' ? 1 : -1; } return 0; }); } return sortableItems; }, [performanceData, sortConfig]);
    const requestSort = (key) => { let direction = 'asc'; if (sortConfig.key === key && sortConfig.direction === 'asc') { direction = 'desc'; } setSortConfig({ key, direction }); };
    const getSortIcon = (name) => { if (sortConfig.key !== name) return null; if (sortConfig.direction === 'asc') return <FiChevronUp className="inline ml-1" />; return <FiChevronDown className="inline ml-1" />; };

    return (
        <div className="space-y-4">
            {/* --- NEW: Back to Admin Dashboard Link --- */}
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                <FiArrowLeft />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold">Inspector Performance</h1>
            {/* ... (rest of the component's JSX remains the same) ... */}
            <div className="p-6 rounded-xl glass-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-light-border dark:border-dark-border">
                                <th className="p-3 cursor-pointer select-none" onClick={() => requestSort('inspectorName')}> Inspector {getSortIcon('inspectorName')} </th>
                                <th className="p-3 cursor-pointer select-none" onClick={() => requestSort('totalInspections')}> Total Inspections {getSortIcon('totalInspections')} </th>
                                <th className="p-3 cursor-pointer select-none" onClick={() => requestSort('passed')}> Accepted {getSortIcon('passed')} </th>
                                <th className="p-3 cursor-pointer select-none" onClick={() => requestSort('failed')}> Rejected {getSortIcon('failed')} </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center p-4">Loading performance data...</td></tr>
                            ) : sortedData.length === 0 ? (
                                <tr><td colSpan="4" className="text-center p-4 text-light-text-secondary dark:text-dark-text-secondary">No performance data available.</td></tr>
                            ) : (
                                sortedData.map(inspector => (
                                    <tr key={inspector.inspectorName} className="border-b border-light-border/50 dark:border-dark-border/50">
                                        <td className="p-3 font-bold">{inspector.inspectorName}</td>
                                        <td className="p-3 text-lg font-semibold">{inspector.totalInspections}</td>
                                        <td className="p-3 text-primary">{inspector.passed}</td>
                                        <td className="p-3 text-red-500">{inspector.failed}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InspectorPerformancePage;