import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Download,
  Edit3,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { DataRow } from '@/pages/Index';
import { toast } from 'sonner';

interface EditableDataTableProps {
  data: DataRow[];
  columns: string[];
  onDataChange: (newData: DataRow[]) => void;
}

const EditableDataTable: React.FC<EditableDataTableProps> = ({ 
  data, 
  columns, 
  onDataChange 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingCell, setEditingCell] = useState<{row: number, column: string} | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const itemsPerPage = 20;

  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = data.filter(row =>
        columns.some(col =>
          String(row[col]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        // Handle numeric sorting
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        // Handle string sorting
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [data, searchTerm, sortColumn, sortDirection, columns]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleCellEdit = (rowIndex: number, column: string) => {
    const actualRowIndex = data.findIndex(row => row === filteredAndSortedData[startIndex + rowIndex]);
    setEditingCell({ row: actualRowIndex, column });
    setEditingValue(String(data[actualRowIndex][column]));
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;

    const newData = [...data];
    let value: string | number = editingValue;

    // Try to parse as number if it looks like one
    const numValue = parseFloat(editingValue);
    if (!isNaN(numValue) && editingValue.trim().match(/^[\d.-]+$/)) {
      value = numValue;
    }

    newData[editingCell.row][editingCell.column] = value;
    onDataChange(newData);
    setEditingCell(null);
    setEditingValue('');
    toast.success('Cell updated successfully');
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  const handleDeleteRow = (rowIndex: number) => {
    const actualRowIndex = data.findIndex(row => row === filteredAndSortedData[startIndex + rowIndex]);
    const newData = data.filter((_, index) => index !== actualRowIndex);
    onDataChange(newData);
    toast.success('Row deleted successfully');
  };

  const handleAddRow = () => {
    const newRow: DataRow = {};
    columns.forEach(col => {
      newRow[col] = '';
    });
    onDataChange([...data, newRow]);
    toast.success('New row added');
  };

  const exportToCsv = () => {
    const csvContent = [
      columns.join(','),
      ...data.map(row =>
        columns.map(col => {
          const value = row[col];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported to CSV');
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Editable Data Table
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search data..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            <Button
              onClick={handleAddRow}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Row
            </Button>
            
            <Button
              onClick={exportToCsv}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} records
          {searchTerm && ` (filtered from ${data.length} total)`}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16">Actions</TableHead>
                  {columns.map((column) => (
                    <TableHead
                      key={column}
                      className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort(column)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{column}</span>
                        {sortColumn === column && (
                          <span className="text-blue-600">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((row, index) => {
                  const actualRowIndex = data.findIndex(dataRow => dataRow === filteredAndSortedData[startIndex + index]);
                  return (
                    <TableRow 
                      key={startIndex + index}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRow(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell key={column} className="py-3">
                          {editingCell?.row === actualRowIndex && editingCell?.column === column ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="h-8"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEdit();
                                  } else if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleSaveEdit}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="max-w-xs truncate cursor-pointer hover:bg-gray-100 p-2 rounded"
                              title={String(row[column])}
                              onClick={() => handleCellEdit(index, column)}
                            >
                              {typeof row[column] === 'number' 
                                ? row[column].toLocaleString()
                                : String(row[column])
                              }
                            </div>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EditableDataTable;