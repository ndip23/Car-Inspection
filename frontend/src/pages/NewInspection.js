// frontend/src/pages/NewInspection.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createInspection } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const NewInspection = () => {
    const { id: vehicleId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [result, setResult] = useState('pass');
    const [notes, setNotes] = useState('');
    // RESTORED: State for the next due date
    const [nextDueDate, setNextDueDate] = useState(''); 
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nextDueDate) {
            return toast.error("Please select a 'Next Due Date'.");
        }
        setLoading(true);

        // RESTORED: The payload now includes the manually entered date
        const inspectionData = {
            vehicleId,
            result,
            notes,
            next_due_date: nextDueDate,
        };

        try {
            await createInspection(inspectionData);
            toast.success('Inspection created successfully!');
            navigate(`/vehicle/${vehicleId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create inspection.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <h1 className="text-3xl font-bold text-secondary mb-6">Record New Inspection</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-light-text-secondary dark:text-dark-text-secondary mb-2">Result</label>
                        <select
                            value={result}
                            onChange={(e) => setResult(e.target.value)}
                            className="w-full p-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                        >
                            <option value="pass">Pass</option>
                            <option value="fail">Fail</option>
                        </select>
                    </div>

                    {/* RESTORED: The "Next Due Date" input field */}
                    <div>
                        <label className="block text-sm font-bold text-light-text-secondary dark:text-dark-text-secondary mb-2">Next Due Date *</label>
                        <input
                            type="date"
                            value={nextDueDate}
                            onChange={(e) => setNextDueDate(e.target.value)}
                            required
                            className="w-full p-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary appearance-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-light-text-secondary dark:text-dark-text-secondary mb-2">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="4"
                            className="w-full p-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                            placeholder="e.g., Brake pads need replacement soon..."
                        ></textarea>
                    </div>
                    <Button type="submit" disabled={loading} variant="primary">
                        <FiSave/>
                        <span>{loading ? 'Saving...' : 'Save Inspection'}</span>
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default NewInspection;