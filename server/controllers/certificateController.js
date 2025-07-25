// server/controllers/certificateController.js
import asyncHandler from 'express-async-handler';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import Inspection from '../models/Inspection.js';

// @desc    Generate a PDF certificate for an inspection
// @route   GET /api/certificate/:inspectionId
// @access  Private
const generateCertificate = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findById(req.params.inspectionId).populate('vehicle');

  if (!inspection) {
    res.status(404);
    throw new Error('Inspection not found');
  }

  const { vehicle } = inspection;
  
  // Set headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=certificate-${vehicle.license_plate}.pdf`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  // --- PDF Content ---
  // Header
  doc.fontSize(20).fillColor('#10B981').text('VisuTech', { align: 'center' });
  doc.fontSize(12).fillColor('#555').text('VEHICLE INSPECTION CERTIFICATE', { align: 'center' });
  doc.moveDown(2);

  // Vehicle Info Section
  doc.fontSize(16).fillColor('#333').text('Vehicle Information', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`License Plate: ${vehicle.license_plate}`);
  doc.text(`Make & Model: ${vehicle.make} ${vehicle.model}`);
  doc.text(`Year: ${vehicle.year}`);
  doc.text(`Owner: ${vehicle.owner_name}`);
  doc.moveDown(2);

  // Inspection Details Section
  doc.fontSize(16).text('Inspection Details', { underline: true });
  doc.moveDown();
  doc.text(`Inspection Date: ${new Date(inspection.date).toLocaleDateString()}`);
  doc.text(`Inspector: ${inspection.inspector_name}`);
  doc.text(`Notes: ${inspection.notes || 'N/A'}`);
  doc.moveDown(2);

  // Result Box
  const resultColor = inspection.result === 'pass' ? '#10B981' : '#EF4444';
  doc.rect(doc.x, doc.y, doc.page.width - 100, 50).fill(resultColor);
  doc.fontSize(24).fillColor('#FFF').text(inspection.result.toUpperCase(), { align: 'center' });
  doc.moveDown(4);

  // Next Due Date
  doc.fillColor('#333').fontSize(14).text('Next Inspection Due:', { align: 'center' });
  doc.fontSize(18).fillColor('#F59E0B').text(new Date(inspection.next_due_date).toLocaleDateString(), { align: 'center' });

  // Optional QR Code
  const qrData = await QRCode.toDataURL(`http://yourapp.com/vehicle/${vehicle._id}`);
  doc.image(qrData, doc.page.width - 120, doc.page.height - 120, { width: 70 });
  
  // Finalize the PDF
  doc.end();
});

export { generateCertificate };