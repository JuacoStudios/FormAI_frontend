import { StyleSheet, Text, View, Modal, Image } from 'react-native';
import { useState } from 'react';
import ScanHistory from '../../components/ScanHistory';

export default function HistoryScreen() {
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectScan = (scan: any) => {
    setSelectedScan(scan);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedScan(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan History</Text>
      <Text style={styles.subtitle}>Your previous machine scans will appear here</Text>
      <ScanHistory onSelectScan={handleSelectScan} />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedScan && (
              <>
                <Text style={styles.modalTitle}>{selectedScan.machineName}</Text>
                <Text style={styles.modalDate}>{new Date(selectedScan.timestamp).toLocaleString()}</Text>
                <Text style={styles.modalResult}>{selectedScan.result}</Text>
                {/* Large image */}
                {selectedScan.imageUri && (
                  <View style={{ alignItems: 'center', marginVertical: 16 }}>
                    <Image source={{ uri: selectedScan.imageUri }} style={{ width: 220, height: 160, borderRadius: 16, resizeMode: 'cover' }} />
                  </View>
                )}
                <Text style={styles.closeButton} onPress={handleCloseModal}>Close</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#23272f',
    borderRadius: 20,
    padding: 24,
    width: 320,
    maxWidth: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalDate: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 12,
  },
  modalResult: {
    color: 'white',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  closeButton: {
    color: '#00e676',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
});