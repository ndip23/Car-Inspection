// frontend/src/pages/ReportsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchReport } from '../services/api';
import toast from 'react-hot-toast';
import { FiDownload, FiLoader, FiArrowLeft } from 'react-icons/fi';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportDocument from '../components/pdf/ReportDocument';
import { format, getWeekOfMonth } from 'date-fns';

// This helper function groups monthly data by the week number.
const groupDataByWeek = (data) => {
    if (!data) return {};
    return data.reduce((acc, item) => {
        const date = new Date(item.date);
        const weekNumber = getWeekOfMonth(date, { weekStartsOn: 1 }); // Week starts on Monday
        const weekKey = `Week ${weekNumber}`;
        if (!acc[weekKey]) {
            acc[weekKey] = [];
        }
        acc[weekKey].push(item);
        return acc;
    }, {});
};

// This is a reusable component for displaying the report data in a table.
const ReportTable = ({ data }) => (
    <table className="w-full text-left">
        <thead className="bg-light-bg dark:bg-dark-bg">
            <tr>
                <th className="p-3 text-sm font-semibold">Date</th>
                <th className="p-3 text-sm font-semibold">License Plate</th>
                <th className="p-3 text-sm font-semibold">Inspector</th>
                <th className="p-3 text-sm font-semibold">Result</th>
            </tr>
        </thead>
        <tbody>
            {data.map(item => (
                <tr key={item._id} className="border-t border-light-border dark:border-dark-border">
                    <td className="p-3 text-sm">{format(new Date(item.date), 'MM/dd/yy, HH:mm')}</td>
                    <td className="p-3 text-sm">{item.vehicle?.license_plate || 'N/A'}</td>
                    <td className="p-3 text-sm">{item.inspector?.name || 'Unknown'}</td>
                    {/* The logic checks for 'pass' but displays the user-friendly label */}
                    <td className={`p-3 font-bold text-sm ${item.result === 'pass' ? 'text-primary' : 'text-red-500'}`}>
                        {item.result === 'pass' ? 'ACCEPTED' : 'REJECTED'}
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);


const ReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('');
  const [activeButton, setActiveButton] = useState('');

  // Automatically generate the "Today" report when the page first loads.
  useEffect(() => {
    generateReport('daily');
  }, []);

  const generateReport = async (reportPeriod) => {
    setLoading(true);
    setPeriod(reportPeriod);
    setActiveButton(reportPeriod);
    setReportData(null);
    try {
      const { data } = await fetchReport(reportPeriod);
      setReportData(data);
    } catch (error) {
      toast.error('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  // This function's logic correctly checks for 'pass' and 'fail'.
  const getSummary = (data) => {
    if (!data) return { total: 0, passed: 0, failed: 0 };
    return {
      total: data.length,
      passed: data.filter(item => item.result === 'pass').length,
      failed: data.filter(item => item.result === 'fail').length,
    };
  };

  const overallSummary = getSummary(reportData);
  const periodTitle = `${period.charAt(0).toUpperCase() + period.slice(1)} Report`;
  const groupedWeeklyData = period === 'monthly' ? groupDataByWeek(reportData) : null;

  const buttonClass = (buttonPeriod) => 
    `px-4 py-2 font-semibold rounded-lg transition-colors ${activeButton === buttonPeriod ? 'bg-primary text-white' : 'bg-primary/20 text-primary hover:bg-primary/30'}`;

  return (
    <div className="space-y-4">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
        <FiArrowLeft /> Back to Dashboard
      </Link>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inspection Reports</h1>
      </div>
      <div className="p-6 rounded-xl glass-card flex flex-col md:flex-row items-center gap-4">
        <span className="font-semibold">Generate Report For:</span>
        <div className="flex items-center gap-2">
          <button onClick={() => generateReport('daily')} className={buttonClass('daily')}>Today</button>
          <button onClick={() => generateReport('weekly')} className={buttonClass('weekly')}>This Week</button>
          <button onClick={() => generateReport('monthly')} className={buttonClass('monthly')}>This Month</button>
        </div>
        {loading && <FiLoader className="animate-spin w-6 h-6 text-primary" />}
        {reportData && (
          <div className="flex-grow flex justify-end">
             <PDFDownloadLink
                document={<ReportDocument data={reportData} period={periodTitle} summary={overallSummary} />}
                fileName={`Harmony Inpection_${period}_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary-hover"
              >
                {({ loading: pdfLoading }) => (pdfLoading ? 'Preparing...' : <><FiDownload/> Download PDF</>)}
            </PDFDownloadLink>
          </div>
        )}
      </div>

      {reportData && (
        <div className="p-6 rounded-xl glass-card">
          <h2 className="text-2xl font-bold mb-4">{periodTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
            <div className="p-4 bg-light-bg dark:bg-dark-bg rounded-lg"><p className="text-2xl font-bold">{overallSummary.total}</p><p>Total</p></div>
            <div className="p-4 bg-green-500/10 rounded-lg"><p className="text-2xl font-bold text-green-500">{overallSummary.passed}</p><p>Accepted</p></div>
            <div className="p-4 bg-red-500/10 rounded-lg"><p className="text-2xl font-bold text-red-500">{overallSummary.failed}</p><p>Rejected</p></div>
          </div>
          
          {period === 'monthly' && groupedWeeklyData ? (
            <div className="space-y-6">
              {Object.keys(groupedWeeklyData).sort().map(weekKey => {
                const weeklyData = groupedWeeklyData[weekKey];
                const weeklySummary = getSummary(weeklyData);
                return (
                  <div key={weekKey}>
                    <h3 className="text-lg font-bold mb-2">{weekKey} (Accepted: {weeklySummary.passed}, Rejected: {weeklySummary.failed})</h3>
                    <div className="overflow-x-auto rounded-lg border border-light-border dark:border-dark-border">
                        <ReportTable data={weeklyData} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-light-border dark:border-dark-border">
                <ReportTable data={reportData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;