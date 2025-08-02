// frontend/src/pages/VehicleDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPlus, FiDownload, FiTool, FiUser, FiCalendar, FiSend, FiArrowLeft, FiEdit, FiLoader } from 'react-icons/fi';
import { fetchVehicleById, fetchInspectionsByVehicleId, sendManualReminder, updateVehicleCustomer } from '../services/api';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InspectionCertificate from '../components/ui/InspectionCertificate';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Modal from '../components/ui/Modal';
import EditCustomerForm from '../components/ui/EditCustomerForm';

const VehicleDetails = () => {
  const { id: vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch vehicle details first. This is a critical step.
        const vehicleRes = await fetchVehicleById(vehicleId);
        
        if (vehicleRes && vehicleRes.data) {
          setVehicle(vehicleRes.data);
          
          // Only if the vehicle was found, proceed to fetch its inspections.
          const inspectionsRes = await fetchInspectionsByVehicleId(vehicleId);
          
          // Defensive check: Ensure the response is an array before sorting.
          if (Array.isArray(inspectionsRes.data)) {
            setInspections(inspectionsRes.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
          } else {
            setInspections([]); // Fallback to a safe empty array if data is not an array
          }
        } else {
          // If vehicleRes or vehicleRes.data is null/undefined, set vehicle to null.
          setVehicle(null);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error(error.response?.data?.message || "Failed to load vehicle details.");
        setVehicle(null); // Explicitly set vehicle to null on any API error.
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
  
  const handleUpdateCustomer = async (customerData) => {
    try {
        const { data: updatedVehicle } = await updateVehicleCustomer(vehicleId, customerData);
        setVehicle(updatedVehicle); // Instantly update the state with the new vehicle data
        toast.success('Customer details updated successfully!');
        setIsEditModalOpen(false); // Close the modal on success
    } catch (error) {
        toast.error('Failed to update customer details.');
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <FiLoader className="animate-spin text-primary text-4xl" />
        </div>
    );
  }
  
  // If after loading, the vehicle state is still null, it means it was not found.
  if (!vehicle) {
    return (
        <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                <FiArrowLeft /> Back to Dashboard
            </Link>
            <p className='text-center text-xl mt-8'>Vehicle not found.</p>
        </div>
    );
  }
  
  const getStatusChip = (result) => (result === 'pass' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400');

  return (
    <>
      <div className="space-y-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
          <FiArrowLeft />
          Back to Dashboard
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 p-6 rounded-xl glass-card space-y-4">
              <div className="flex items-center gap-4">
                  <FiTool className="w-8 h-8 text-primary"/>
                  <div>
                      <h1 className="text-2xl font-bold">{vehicle.license_plate}</h1>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary">
                          ({vehicle.category}) - {vehicle.vehicle_type}
                      </p>
                  </div>
              </div>
              <div className="border-t border-light-border dark:border-dark-border my-4"></div>
              <div className="space-y-2">
                  <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                          <FiUser className="w-8 h-8 text-secondary"/>
                          <h3 className="font-semibold">Customer Information</h3>
                      </div>
                      <button onClick={() => setIsEditModalOpen(true)} className="p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-full" title="Edit Customer Details">
                          <FiEdit className="text-secondary"/>
                      </button>
                  </div>
                  <div className="pl-12 text-sm">
                      <p className="font-bold">{vehicle.customer_name}</p>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary">{vehicle.customer_email}</p>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary">Phone: {vehicle.customer_phone}</p>
                      {vehicle.customer_whatsapp && <p className="text-light-text-secondary dark:text-dark-text-secondary">WhatsApp: {vehicle.customer_whatsapp}</p>}
                  </div>
              </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-xl glass-card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h2 className="text-2xl font-bold">Inspection History</h2>
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                      <button onClick={handleSendReminder} disabled={reminderLoading || inspections.length === 0} className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          <FiSend /><span>Send Reminder</span>
                      </button>
                      <Link to={`/vehicle/${vehicleId}/new-inspection`} className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">
                          <FiPlus /><span>New Inspection</span>
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
                              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">Inspector: {insp.inspector?.name || 'N/A'}</p>
                              <p className="mt-2">{insp.notes}</p>
                          </div>
                          <div className='flex items-center space-x-4 flex-shrink-0'>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusChip(insp.result)}`}>
                                  {insp.result.toUpperCase()}
                              </span>
                              <PDFDownloadLink document={<InspectionCertificate vehicle={vehicle} inspection={insp} />} fileName={`certificate-${vehicle.license_plate}-${insp._id}.pdf`} className="p-2 text-primary hover:bg-primary/20 rounded-full transition">
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

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          {vehicle && (
              <EditCustomerForm 
                  vehicle={vehicle}
                  onUpdate={handleUpdateCustomer}
                  onCancel={() => setIsEditModalOpen(false)}
              />
          )}
      </Modal>
    </>
  );
};

export default VehicleDetails;