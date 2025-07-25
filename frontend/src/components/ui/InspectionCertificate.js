// src/components/pdf/InspectionCertificate.js
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a font (optional, but good for consistency)
Font.register({
    family: 'Helvetica-Bold',
    src: `https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf`
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#333'
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981', // Green
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#555',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    border: '1px solid #E5E7EB',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1D232A',
    borderBottom: '1px solid #F59E0B', // Orange
    paddingBottom: 5,
  },
  field: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  fieldLabel: {
    width: '35%',
    fontWeight: 'bold',
  },
  fieldValue: {
    width: '65%',
  },
  resultSection: {
    marginTop: 20,
    padding: 20,
    borderRadius: 5,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#888',
  }
});

const InspectionCertificate = ({ vehicle, inspection }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>VisuTech</Text>
        <Text style={styles.subtitle}>VEHICLE INSPECTION CERTIFICATE</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        <View style={styles.field}><Text style={styles.fieldLabel}>License Plate:</Text><Text style={styles.fieldValue}>{vehicle.license_plate}</Text></View>
        <View style={styles.field}><Text style={styles.fieldLabel}>Make & Model:</Text><Text style={styles.fieldValue}>{vehicle.make} {vehicle.model}</Text></View>
        <View style={styles.field}><Text style={styles.fieldLabel}>Year:</Text><Text style={styles.fieldValue}>{vehicle.year}</Text></View>
        <View style={styles.field}><Text style={styles.fieldLabel}>Owner:</Text><Text style={styles.fieldValue}>{vehicle.owner_name}</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inspection Details</Text>
        <View style={styles.field}><Text style={styles.fieldLabel}>Inspection Date:</Text><Text style={styles.fieldValue}>{new Date(inspection.date).toLocaleDateString()}</Text></View>
        <View style={styles.field}><Text style={styles.fieldLabel}>Inspector:</Text><Text style={styles.fieldValue}>{inspection.inspector_name}</Text></View>
        <View style={styles.field}><Text style={styles.fieldLabel}>Notes:</Text><Text style={styles.fieldValue}>{inspection.notes}</Text></View>
      </View>
      
      <View style={[styles.resultSection, { backgroundColor: inspection.result === 'pass' ? '#10B981' : '#EF4444' }]}>
        <Text style={styles.resultText}>{inspection.result.toUpperCase()}</Text>
      </View>

       <View style={[styles.section, {marginTop: 20, border: '1px solid #F59E0B'}]}>
         <Text style={styles.sectionTitle}>Next Inspection Due</Text>
         <Text style={{fontSize: 18, textAlign: 'center', fontWeight: 'bold'}}>{new Date(inspection.next_due_date).toLocaleDateString()}</Text>
       </View>
      
      <Text style={styles.footer}>
        This is an automatically generated certificate.
      </Text>
    </Page>
  </Document>
);

export default InspectionCertificate;