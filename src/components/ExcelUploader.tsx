import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileSpreadsheet, AlertCircle, Sheet } from 'lucide-react';
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
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [currentFileName, setCurrentFileName] = useState<string>('');

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'buffer' });
      
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      setCurrentFileName(file.name);
      
      if (wb.SheetNames.length === 1) {
        // If only one sheet, process it directly
        processSheet(wb, wb.SheetNames[0], file.name);
      } else {
        // Multiple sheets, let user select
        setSelectedSheet(wb.SheetNames[0]);
        toast.success(`Found ${wb.SheetNames.length} sheets. Please select a sheet to process.`);
      }
      
    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast.error('Failed to process Excel file. Please ensure it\'s a valid Excel file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processSheet = (wb: XLSX.WorkBook, sheetName: string, fileName: string) => {
    try {
      const worksheet = wb.Sheets[sheetName];
      
      // Convert to JSON with header row as keys
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      if (jsonData.length === 0) {
        toast.error('The selected sheet appears to be empty or has no data');
        return;
      }

      // Clean and format the data
      const cleanedData = jsonData.map((row: any) => {
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
        sheet: sheetName,
        rows: cleanedData.length, 
        columns: columns.length,
        sampleData: cleanedData.slice(0, 3)
      });

      onDataProcessed(cleanedData, columns, `${fileName} - ${sheetName}`);
      toast.success(`Successfully processed ${cleanedData.length} rows from sheet "${sheetName}"`);
      
      // Reset sheet selection state
      setWorkbook(null);
      setSheetNames([]);
      setSelectedSheet('');
      
    } catch (error) {
      console.error('Error processing sheet:', error);
      toast.error('Failed to process the selected sheet.');
    }
  };

  const handleSheetSelect = (sheetName: string) => {
    setSelectedSheet(sheetName);
  };

  const handleProcessSheet = () => {
    if (workbook && selectedSheet) {
      processSheet(workbook, selectedSheet, currentFileName);
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

      {/* Sheet Selection */}
      {sheetNames.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sheet className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-700">Select Sheet</h4>
          </div>
          <div className="space-y-4">
            <Select value={selectedSheet} onValueChange={handleSheetSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a sheet to process" />
              </SelectTrigger>
              <SelectContent>
                {sheetNames.map((sheetName) => (
                  <SelectItem key={sheetName} value={sheetName}>
                    {sheetName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleProcessSheet}
              disabled={!selectedSheet}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Process Selected Sheet
            </Button>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Supported formats:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Excel files (.xlsx, .xls)</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Multiple sheets supported</li>
              <li>• First row should contain column headers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploader;
