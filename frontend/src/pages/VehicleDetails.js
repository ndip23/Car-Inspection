// frontend/src/pages/VehicleDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPlus, FiDownload, FiTool, FiUser, FiCalendar, FiSend, FiArrowLeft } from 'react-icons/fi'; // Import FiArrowLeft
import { fetchVehicleById, fetchInspectionsByVehicleId, sendManualReminder } from '../services/api';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InspectionCertificate from '../components/ui/InspectionCertificate';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const VehicleDetails = () => {
  const { id: vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminderLoading, setReminderLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const vehicleData = await fetchVehicleById(vehicleId);
        const inspectionsData = await fetchInspectionsByVehicleId(vehicleId);
        setVehicle(vehicleData);
        setInspections(inspectionsData.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [vehicleId]);

  const handleSendReminder = async () => {
    setReminderLoading(true);
    const toastId = toast.loading('Sending reminder...');
    try {
        await sendManualReminder(vehicleId);
        toast.success('Reminder sent successfully!', { id: toastId });
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send reminder.', { id: toastId });
    } finally {
        setReminderLoading(false);
    }
  };


  if (loading) return <p className='text-center'>Loading vehicle details...</p>;
  if (!vehicle) return <p className='text-center'>Vehicle not found.</p>;
  
  const getStatusChip = (result) => (result === 'pass' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400');

  return (
    // The main container now has its own space-y class
    <div className="space-y-4"> 
      
      {/* --- NEW: Back to Dashboard Link --- */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
        <FiArrowLeft />
        Back to Dashboard
      </Link>
      
      {/* The grid now uses a larger gap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vehicle Info Card */}
        <div className="lg:col-span-1 p-6 rounded-xl glass-card space-y-4">
            <div className="flex items-center gap-4">
                <FiTool className="w-8 h-8 text-primary"/>
                <div>
                    <h1 className="text-2xl font-bold">{vehicle.license_plate}</h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        ({vehicle.category} - {vehicle.vehicle_type})
                    </p>
                </div>
            </div>
            <div className="border-t border-light-border dark:border-dark-border my-4"></div>
            <div className="flex items-center gap-4">
                 <FiUser className="w-8 h-8 text-secondary"/>
                <div>
                    <h3 className="font-semibold">Owner Information</h3>
                    <p>{vehicle.owner_name}</p>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{vehicle.owner_email}</p>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Phone: {vehicle.owner_phone}</p>
                    {vehicle.owner_whatsapp && <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">WhatsApp: {vehicle.owner_whatsapp}</p>}
                </div>
            </div>
        </div>

        {/* Inspection History Card */}
        <div className="lg:col-span-2 p-6 rounded-xl glass-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold">Inspection History</h2>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <button 
                        onClick={handleSendReminder}
                        disabled={reminderLoading || inspections.length === 0}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiSend />
                        <span>Send Reminder</span>
                    </button>
                    <Link 
                        to={`/vehicle/${vehicleId}/new-inspection`} 
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary-hover text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        <FiPlus />
                        <span>New Inspection</span>
                    </Link>
                </div>
            </div>
            
            {inspections.length > 0 ? (
                <ul className="space-y-4">
                    {inspections.map((insp) => (
                    <li key={insp._id} className="p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-grow">
                            <div className="flex items-center gap-2 font-bold"><FiCalendar size={14}/> {format(new Date(insp.date), 'MM/dd/yyyy')}</div>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">Next Due: {format(new Date(insp.next_due_date), 'MM/dd/yyyy')}</p>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">Inspector: {insp.inspector_name}</p>
                            <p className="mt-2">{insp.notes}</p>
                        </div>
                        <div className='flex items-center space-x-4 flex-shrink-0'>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusChip(insp.result)}`}>
                                {insp.result.toUpperCase()}
                            </span>
                            <PDFDownloadLink
                                document={<InspectionCertificate vehicle={vehicle} inspection={insp} />}
                                fileName={`certificate-${vehicle.license_plate}-${insp._id}.pdf`}
                                className="p-2 text-primary hover:bg-primary/20 rounded-full transition"
                            >
                                {({ loading: pdfLoading }) => (pdfLoading ? '...' : <FiDownload />)}
                            </PDFDownloadLink>
                        </div>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">No inspection records found for this vehicle.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;