// frontend/src/pages/admin/CustomerReportsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchLapsedCustomers, fetchLoyalCustomers } from '../../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiLoader, FiUsers, FiStar } from 'react-icons/fi';
import { format } from 'date-fns';

const CustomerReportsPage = () => {
    const [activeTab, setActiveTab] = useState('loyal');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let response;
                if (activeTab === 'loyal') {
                    response = await fetchLoyalCustomers();
                } else {
                    response = await fetchLapsedCustomers();
                }
                setReportData(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                toast.error('Failed to load report data.');
                setReportData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

    return (
        <div className="space-y-4">
            <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                <FiArrowLeft /> Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Customer Reports</h1>

            <div className="flex border-b border-light-border dark:border-dark-border">
                <TabButton name="loyal" activeTab={activeTab} setActiveTab={setActiveTab} icon={<FiStar />}>Loyal Customers</TabButton>
                <TabButton name="lapsed" activeTab={activeTab} setActiveTab={setActiveTab} icon={<FiUsers />}>Lapsed Customers</TabButton>
            </div>

            <div className="p-6 rounded-xl glass-card">
                {loading ? (
                    <div className="flex justify-center items-center h-48"><FiLoader className="animate-spin text-primary text-3xl" /></div>
                ) : (
                    activeTab === 'loyal' ? <LoyalCustomersTable data={reportData} /> : <LapsedCustomersTable data={reportData} />
                )}
            </div>
        </div>
    );
};

const TabButton = ({ name, activeTab, setActiveTab, children, icon }) => (
    <button onClick={() => setActiveTab(name)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${activeTab === name ? 'border-b-2 border-primary text-primary' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'}`}>
        {icon}{children}
    </button>
);

const LoyalCustomersTable = ({ data }) => (
    <ReportTable
        headers={['Rank', 'License Plate', 'Customer Name', 'Total Inspections']}
        rows={data.map((item, index) => (
            <tr key={item.vehicleId} className="border-b border-light-border/50 dark:border-dark-border/50">
                <td className="p-3">#{index + 1}</td>
                <td className="p-3 font-bold text-primary">{item.license_plate}</td>
                <td className="p-3">{item.customer_name}</td>
                <td className="p-3 font-semibold">{item.inspectionCount}</td>
            </tr>
        ))}
        noDataMessage="No inspection data available to determine loyal customers."
    />
);

// --- THIS IS THE CORRECTED TABLE COMPONENT ---
const LapsedCustomersTable = ({ data }) => (
    <ReportTable
        headers={['License Plate', 'Customer Name', 'Contact Phone', 'Last Seen']}
        rows={data.map(item => (
            <tr key={item.vehicleId} className="border-b border-light-border/50 dark:border-dark-border/50">
                <td className="p-3 font-bold text-primary">{item.license_plate}</td>
                <td className="p-3">{item.customer_name}</td>
                <td className="p-3">{item.customer_phone}</td>
                <td className="p-3 text-red-500">{format(new Date(item.lastInspectionDate), 'MMMM d, yyyy')}</td>
            </tr>
        ))}
        noDataMessage="No lapsed customers found (vehicles not seen in 2+ years)."
    />
);
// ---------------------------------------------

const ReportTable = ({ headers, rows, noDataMessage }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="border-b border-light-border dark:border-dark-border">
                    {headers.map(h => <th key={h} className="p-3 text-sm font-semibold">{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {rows.length > 0 ? rows : (
                    <tr><td colSpan={headers.length} className="text-center p-8 text-light-text-secondary dark:text-dark-text-secondary">{noDataMessage}</td></tr>
                )}
            </tbody>
        </table>
    </div>
);

export default CustomerReportsPage;