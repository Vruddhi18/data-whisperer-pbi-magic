
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { DataRow } from '@/pages/Index';

interface ExcelUploaderProps {
  onDataProcessed: (data: DataRow[], columns: string[], fileName: string) => void;
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onDataProcessed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON with header row as keys
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      if (jsonData.length === 0) {
        toast.error('The Excel file appears to be empty or has no data');
        return;
      }

      // Clean and format the data
      const cleanedData = jsonData.map((row: any, index) => {
        const cleanRow: DataRow = {};
        Object.keys(row).forEach(key => {
          // Clean column names
          const cleanKey = key.toString().trim().replace(/\s+/g, ' ');
          let value = row[key];
          
          // Clean and format values
          if (typeof value === 'string') {
            value = value.trim();
            // Try to convert numeric strings to numbers
            const numValue = parseFloat(value.replace(/,/g, ''));
            if (!isNaN(numValue) && value.match(/^[\d,.-]+$/)) {
              value = numValue;
            }
          }
          
          cleanRow[cleanKey] = value;
        });
        return cleanRow;
      });

      const columns = Object.keys(cleanedData[0] || {});
      
      console.log('Processed Excel data:', { 
        rows: cleanedData.length, 
        columns: columns.length,
        sampleData: cleanedData.slice(0, 3)
      });

      onDataProcessed(cleanedData, columns, file.name);
      toast.success(`Successfully processed ${cleanedData.length} rows from ${file.name}`);
      
    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast.error('Failed to process Excel file. Please ensure it\'s a valid Excel file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size too large. Please select a file under 10MB');
      return;
    }

    processExcelFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Upload Excel File
        </h3>
        <p className="text-gray-500 mb-6">
          Drag and drop your Excel file here, or click to browse
        </p>
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Select File
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Supported formats:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Excel files (.xlsx, .xls)</li>
              <li>• Maximum file size: 10MB</li>
              <li>• First sheet will be processed</li>
              <li>• First row should contain column headers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploader;
