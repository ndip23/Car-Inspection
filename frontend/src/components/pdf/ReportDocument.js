// frontend/src/components/pdf/ReportDocument.js
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

Font.register({
    family: 'Helvetica-Bold',
    src: `https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf`
});

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 10 },
  header: { textAlign: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#10B981' },
  subtitle: { fontSize: 12, color: '#555' },
  summarySection: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 15, padding: 10, backgroundColor: '#F3F4F6', borderRadius: 5 },
  summaryBox: { alignItems: 'center' },
  summaryValue: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { flexDirection: 'row' },
  tableColHeader: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#E5E7EB', padding: 5, fontFamily: 'Helvetica-Bold' },
  tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, textAlign: 'center', fontSize: 8, color: '#888' },
});

const ReportDocument = ({ data, period, summary }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>VisuTech Inspection Report</Text>
        <Text style={styles.subtitle}>{period} - Generated on {format(new Date(), 'MM/dd/yyyy')}</Text>
      </View>
      
      <View style={styles.summarySection}>
        <View style={styles.summaryBox}><Text style={styles.summaryValue}>{summary.total}</Text><Text>Total Inspections</Text></View>
        <View style={styles.summaryBox}><Text style={[styles.summaryValue, {color: '#10B981'}]}>{summary.passed}</Text><Text>Passed</Text></View>
        <View style={styles.summaryBox}><Text style={[styles.summaryValue, {color: '#EF4444'}]}>{summary.failed}</Text><Text>Failed</Text></View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Date</Text>
          <Text style={styles.tableColHeader}>License Plate</Text>
          <Text style={styles.tableColHeader}>Inspector</Text>
          <Text style={styles.tableColHeader}>Result</Text>
        </View>
        {data.map(item => (
          <View style={styles.tableRow} key={item._id}>
            <Text style={styles.tableCol}>{format(new Date(item.date), 'MM/dd/yy HH:mm')}</Text>
            <Text style={styles.tableCol}>{item.vehicle?.license_plate || 'N/A'}</Text>
            <Text style={styles.tableCol}>{item.inspector_name}</Text>
            <Text style={[styles.tableCol, { color: item.result === 'pass' ? '#10B981' : '#EF4444', fontFamily: 'Helvetica-Bold'}]}>{item.result.toUpperCase()}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>This is an automatically generated report.</Text>
    </Page>
  </Document>
);

export default ReportDocument;