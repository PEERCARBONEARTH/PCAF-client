/**
 * Loan Data Uploader Component - Interface for uploading loan data across PCAF instruments
 */

import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, BarChart3, Zap } from 'lucide-react';
import { loanDataPipelineService, LoanDataUpload, PCAFInstrument, ProcessingResult } from '../../services/loan-data-pipeline-service';

interface LoanDataUploaderProps {
  onUploadComplete?: (result: ProcessingResult) => void;
}

export const LoanDataUploader: React.FC<LoanDataUploaderProps> = ({ onUploadComplete }) => {
  const [selectedInstrument, setSelectedInstrument] = useState<PCAFInstrument>('auto_loans');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const instrumentOptions = [
    { value: 'auto_loans', label: 'Auto Loans', icon: '🚗', description: 'Vehicle financing and auto loans' },
    { value: 'commercial_real_estate', label: 'Commercial Real Estate', icon: '🏢', description: 'Commercial property financing' },
    { value: 'project_finance', label: 'Project Finance', icon: '⚡', description: 'Infrastructure and energy projects' }
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [selectedInstrument]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadStatus('uploading');
      setErrorMessage('');

      // Validate file type
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
        throw new Error('Please upload a CSV or JSON file');
      }

      // Read file content
      const fileContent = await readFileContent(file);
      
      // Parse loan data based on file type
      const loanData = file.name.endsWith('.json') 
        ? parseJSONLoanData(fileContent, selectedInstrument)
        : parseCSVLoanData(fileContent, selectedInstrument);

      // Create upload data structure
      const uploadData: LoanDataUpload = {
        instrument: selectedInstrument,
        loans: loanData,
        metadata: {
          uploadId: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          uploadDate: new Date(),
          source: file.name,
          dataQuality: 3 // Default data quality
        }
      };

      setUploadStatus('processing');

      // Process through the pipeline
      const result = await loanDataPipelineService.processLoanDataUpload(uploadData);
      
      setProcessingResult(result);
      setUploadStatus(result.success ? 'complete' : 'error');
      
      if (!result.success) {
        setErrorMessage(result.errors.join(', '));
      }

      if (result.success && onUploadComplete) {
        onUploadComplete(result);
      }

    } catch (error) {
      console.error('File upload failed:', error);
      setUploadStatus('error');
      setErrorMessage(error.message);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const parseCSVLoanData = (csvContent: string, instrument: PCAFInstrument) => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const loans = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < headers.length) continue;

      const loan: any = {
        id: values[headers.indexOf('id')] || `loan_${i}`,
        instrument,
        loanAmount: parseFloat(values[headers.indexOf('loanAmount')] || '0'),
        outstandingBalance: parseFloat(values[headers.indexOf('outstandingBalance')] || '0'),
        originationDate: new Date(values[headers.indexOf('originationDate')] || Date.now()),
        pcafScore: parseFloat(values[headers.indexOf('pcafScore')] || '3')
      };

      // Add instrument-specific fields
      if (instrument === 'auto_loans') {
        loan.vehicleDetails = {
          make: values[headers.indexOf('make')] || 'Unknown',
          model: values[headers.indexOf('model')] || 'Unknown',
          year: parseInt(values[headers.indexOf('year')] || '2020'),
          fuelType: values[headers.indexOf('fuelType')] || 'Gasoline',
          emissions: parseFloat(values[headers.indexOf('emissions')] || '4.0')
        };
      }

      loans.push(loan);
    }

    return loans;
  };

  const parseJSONLoanData = (jsonContent: string, instrument: PCAFInstrument) => {
    const data = JSON.parse(jsonContent);
    return Array.isArray(data) ? data : [data];
  };

  const generateSampleData = () => {
    const sampleData = {
      auto_loans: [
        {
          id: 'AUTO001',
          instrument: 'auto_loans',
          loanAmount: 35000,
          outstandingBalance: 28000,
          originationDate: '2023-06-15',
          pcafScore: 2,
          vehicleDetails: {
            make: 'Tesla',
            model: 'Model 3',
            year: 2023,
            fuelType: 'Electric',
            emissions: 0.5
          }
        },
        {
          id: 'AUTO002',
          instrument: 'auto_loans',
          loanAmount: 28000,
          outstandingBalance: 22000,
          originationDate: '2023-08-20',
          pcafScore: 3,
          vehicleDetails: {
            make: 'Toyota',
            model: 'Prius',
            year: 2023,
            fuelType: 'Hybrid',
            emissions: 2.1
          }
        }
      ],
      commercial_real_estate: [
        {
          id: 'CRE001',
          instrument: 'commercial_real_estate',
          loanAmount: 2500000,
          outstandingBalance: 2100000,
          originationDate: '2023-03-10',
          pcafScore: 2,
          propertyDetails: {
            propertyType: 'Office',
            squareFootage: 50000,
            location: 'Downtown Seattle',
            energyRating: 'LEED Gold',
            emissions: 125.5
          }
        }
      ],
      project_finance: [
        {
          id: 'PF001',
          instrument: 'project_finance',
          loanAmount: 15000000,
          outstandingBalance: 12000000,
          originationDate: '2023-01-15',
          pcafScore: 1,
          projectDetails: {
            projectType: 'Renewable Energy',
            sector: 'Solar',
            location: 'Arizona',
            capacity: 100,
            projectStatus: 'Operational',
            expectedEmissions: -500
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sampleData[selectedInstrument], null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_${selectedInstrument}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Loan Data Upload & AI Pipeline
        </h2>
        <p className="text-gray-600">
          Upload loan data across PCAF instruments for automatic embedding and contextual AI analysis
        </p>
      </div>

      {/* Instrument Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Select PCAF Instrument</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {instrumentOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedInstrument(option.value as PCAFInstrument)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedInstrument === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <div className="font-medium text-gray-900">{option.label}</div>
              <div className="text-sm text-gray-500 mt-1">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Upload Loan Data</h3>
          <button
            onClick={generateSampleData}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <FileText className="w-4 h-4" />
            Download Sample
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : uploadStatus === 'idle'
              ? 'border-gray-300 hover:border-gray-400'
              : 'border-gray-200'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploadStatus === 'idle' && (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your loan data file here
              </p>
              <p className="text-gray-500 mb-4">
                Supports CSV and JSON formats
              </p>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                />
              </label>
            </>
          )}

          {uploadStatus === 'uploading' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-lg font-medium text-gray-900">Uploading file...</p>
            </div>
          )}

          {uploadStatus === 'processing' && (
            <div className="flex flex-col items-center">
              <Zap className="w-12 h-12 text-yellow-500 animate-pulse mb-4" />
              <p className="text-lg font-medium text-gray-900">Processing & Embedding...</p>
              <p className="text-gray-500">Creating AI-ready loan embeddings</p>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-lg font-medium text-red-900">Upload Failed</p>
              <p className="text-red-600 text-sm">{errorMessage}</p>
              <button
                onClick={() => setUploadStatus('idle')}
                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Try Again
              </button>
            </div>
          )}

          {uploadStatus === 'complete' && processingResult && (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-lg font-medium text-green-900">Upload Complete!</p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">{processingResult.processedLoans}</div>
                  <div className="text-gray-500">Loans Processed</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">{processingResult.embeddedDocuments}</div>
                  <div className="text-gray-500">Documents Embedded</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">{processingResult.summary.avgDataQuality.toFixed(1)}</div>
                  <div className="text-gray-500">Avg PCAF Score</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">{processingResult.summary.complianceRate.toFixed(0)}%</div>
                  <div className="text-gray-500">Compliance Rate</div>
                </div>
              </div>
              <button
                onClick={() => setUploadStatus('idle')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Upload Another File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Processing Results */}
      {processingResult && uploadStatus === 'complete' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Processing Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">By Instrument</h4>
              <div className="space-y-2">
                {Object.entries(processingResult.summary.byInstrument).map(([instrument, count]) => (
                  <div key={instrument} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{instrument.replace('_', ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Emissions Impact</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Emissions</span>
                  <span className="font-medium">{processingResult.summary.totalEmissions.toFixed(1)} tCO2e</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Time</span>
                  <span className="font-medium">{processingResult.processingTimeMs}ms</span>
                </div>
              </div>
            </div>
          </div>

          {processingResult.errors.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h5 className="font-medium text-yellow-800 mb-1">Warnings</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                {processingResult.errors.slice(0, 3).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {processingResult.errors.length > 3 && (
                  <li>• ... and {processingResult.errors.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoanDataUploader;