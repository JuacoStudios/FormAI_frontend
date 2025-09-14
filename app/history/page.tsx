'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HistoryPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-gray-900 text-white p-5 pt-16">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="mr-4 p-2 hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">Scan History</h1>
      </div>
      
      <p className="text-gray-400 mb-6">Your previous machine scans will appear here</p>
      
      {/* Placeholder for scan history */}
      <div className="text-center py-12">
        <p className="text-gray-500">No scans yet. Start by scanning your first gym machine!</p>
      </div>

      {/* Modal */}
      {modalVisible && selectedScan && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-2">{selectedScan.machineName}</h2>
            <p className="text-gray-400 text-sm mb-4">
              {new Date(selectedScan.timestamp).toLocaleString()}
            </p>
            <p className="text-gray-300 mb-4">{selectedScan.result}</p>
            {selectedScan.imageUri && (
              <div className="flex justify-center mb-4">
                <Image 
                  src={selectedScan.imageUri} 
                  alt="Scan result"
                  width={224}
                  height={160}
                  className="w-56 h-40 object-cover rounded-2xl"
                />
              </div>
            )}
            <button
              onClick={handleCloseModal}
              className="w-full py-3 bg-green-500 text-black rounded-lg font-semibold hover:bg-green-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
