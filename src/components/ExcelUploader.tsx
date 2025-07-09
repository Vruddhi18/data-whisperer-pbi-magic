
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileSpreadsheet, AlertCircle, Sheet, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { DataRow } from '@/pages/Index';
import { ApiService } from '@/services/apiService';

interface ExcelUploaderProps {
  onDataProcessed: (data: DataRow[], columns: string[], fileName: string) => void;
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onDataProcessed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  // Check API connection on component mount
  React.useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      await ApiService.healthCheck();
      setApiConnected(true);
    } catch (error) {
      setApiConnected(false);
      console.error('API connection failed:', error);
    }
  };

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const response = await ApiService.uploadExcel(file);
      
      if (response.multipleSheets && response.sheets) {
        // Multiple sheets - let user select
        setSheetNames(response.sheets);
        setSelectedSheet(response.sheets[0]);
        setCurrentFile(file);
        toast.success(`Found ${response.sheets.length} sheets. Please select a sheet to process.`);
      } else if (response.data && response.columns) {
        // Single sheet processed
        onDataProcessed(response.data, response.columns, response.fileName || file.name);
        toast.success(`Successfully processed ${response.data.length} rows with proper month formatting`);
      }
      
    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast.error(`Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSheetSelect = (sheetName: string) => {
    setSelectedSheet(sheetName);
  };

  const handleProcessSheet = async () => {
    if (!currentFile || !selectedSheet) return;
    
    setIsProcessing(true);
    try {
      const response = await ApiService.processSheet(currentFile, selectedSheet);
      
      if (response.data && response.columns) {
        onDataProcessed(response.data, response.columns, response.fileName || `${currentFile.name} - ${selectedSheet}`);
        toast.success(`Successfully processed ${response.data.length} rows from sheet "${selectedSheet}" with proper month formatting`);
        
        // Reset sheet selection state
        setSheetNames([]);
        setSelectedSheet('');
        setCurrentFile(null);
      }
      
    } catch (error) {
      console.error('Error processing sheet:', error);
      toast.error(`Failed to process sheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    if (!apiConnected) {
      toast.error('Backend API is not connected. Please check the FastAPI server.');
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
      {/* API Status Indicator */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        apiConnected === null ? 'bg-yellow-50 text-yellow-700' :
        apiConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}>
        {apiConnected === null ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent" />
            <span className="text-sm">Checking API connection...</span>
          </>
        ) : apiConnected ? (
          <>
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">FastAPI Backend Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Backend Disconnected - Please start FastAPI server</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={checkApiConnection}
              className="ml-auto"
            >
              Retry
            </Button>
          </>
        )}
      </div>

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
          disabled={isProcessing || !apiConnected}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Processing with AI...
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
              disabled={!selectedSheet || isProcessing}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processing with AI...
                </>
              ) : (
                'Process Selected Sheet'
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Enhanced with AI Processing:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Intelligent month formatting (1 → January, 2 → February, etc.)</li>
              <li>• Advanced data cleaning and type detection</li>
              <li>• FastAPI backend for robust processing</li>
              <li>• Excel files (.xlsx, .xls) up to 10MB</li>
              <li>• Multiple sheets supported with smart detection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploader;
