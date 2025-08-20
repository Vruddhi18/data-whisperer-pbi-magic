// Enhanced date parsing utility to preserve various date formats
import { parseISO, isValid, format, parse } from 'date-fns';

export interface DateParseResult {
  isDate: boolean;
  originalValue: any;
  parsedDate?: Date;
  displayValue: string;
  sortValue: string | number;
}

// Common date formats to try
const DATE_FORMATS = [
  // ISO formats
  'yyyy-MM-dd',
  'yyyy-MM-dd HH:mm:ss',
  'yyyy-MM-dd HH:mm',
  'yyyy-MM-ddTHH:mm:ss',
  'yyyy-MM-ddTHH:mm:ss.SSS',
  'yyyy-MM-ddTHH:mm:ssXXX',
  
  // US formats
  'MM/dd/yyyy',
  'MM/dd/yy',
  'M/d/yyyy',
  'M/d/yy',
  'MM-dd-yyyy',
  'MM-dd-yy',
  
  // European formats
  'dd/MM/yyyy',
  'dd/MM/yy',
  'd/M/yyyy',
  'd/M/yy',
  'dd-MM-yyyy',
  'dd-MM-yy',
  'dd.MM.yyyy',
  'dd.MM.yy',
  
  // Text formats
  'MMM dd, yyyy',
  'MMM d, yyyy',
  'MMMM dd, yyyy',
  'MMMM d, yyyy',
  'dd MMM yyyy',
  'd MMM yyyy',
  'dd MMMM yyyy',
  'd MMMM yyyy',
  
  // Other common formats
  'yyyy/MM/dd',
  'yy/MM/dd',
  'yyyyMMdd',
  'ddMMyyyy',
  'MMddyyyy'
];

export function parseDate(value: any): DateParseResult {
  if (!value) {
    return {
      isDate: false,
      originalValue: value,
      displayValue: String(value || ''),
      sortValue: String(value || '')
    };
  }

  const stringValue = String(value).trim();
  
  // Check if it's already a Date object
  if (value instanceof Date) {
    if (isValid(value)) {
      return {
        isDate: true,
        originalValue: value,
        parsedDate: value,
        displayValue: format(value, 'MMM dd, yyyy'),
        sortValue: value.getTime()
      };
    }
  }

  // Try parsing as ISO date first
  try {
    const isoDate = parseISO(stringValue);
    if (isValid(isoDate)) {
      return {
        isDate: true,
        originalValue: value,
        parsedDate: isoDate,
        displayValue: format(isoDate, 'MMM dd, yyyy'),
        sortValue: isoDate.getTime()
      };
    }
  } catch (e) {
    // Continue to other formats
  }

  // Try various date formats
  for (const dateFormat of DATE_FORMATS) {
    try {
      const parsedDate = parse(stringValue, dateFormat, new Date());
      if (isValid(parsedDate)) {
        return {
          isDate: true,
          originalValue: value,
          parsedDate: parsedDate,
          displayValue: format(parsedDate, 'MMM dd, yyyy'),
          sortValue: parsedDate.getTime()
        };
      }
    } catch (e) {
      // Continue to next format
    }
  }

  // Check for Excel serial date numbers (days since 1900-01-01)
  const numValue = parseFloat(stringValue);
  if (!isNaN(numValue) && numValue > 1 && numValue < 100000) {
    try {
      // Excel date serial number conversion
      const excelEpoch = new Date(1900, 0, 1);
      const excelDate = new Date(excelEpoch.getTime() + (numValue - 1) * 24 * 60 * 60 * 1000);
      
      if (isValid(excelDate) && excelDate.getFullYear() > 1900 && excelDate.getFullYear() < 2100) {
        return {
          isDate: true,
          originalValue: value,
          parsedDate: excelDate,
          displayValue: format(excelDate, 'MMM dd, yyyy'),
          sortValue: excelDate.getTime()
        };
      }
    } catch (e) {
      // Not an Excel date
    }
  }

  // Check for Unix timestamp (seconds or milliseconds)
  if (!isNaN(numValue)) {
    // Unix timestamp in seconds (10 digits)
    if (numValue > 1000000000 && numValue < 10000000000) {
      try {
        const unixDate = new Date(numValue * 1000);
        if (isValid(unixDate)) {
          return {
            isDate: true,
            originalValue: value,
            parsedDate: unixDate,
            displayValue: format(unixDate, 'MMM dd, yyyy'),
            sortValue: unixDate.getTime()
          };
        }
      } catch (e) {
        // Not a Unix timestamp
      }
    }
    
    // Unix timestamp in milliseconds (13 digits)
    if (numValue > 1000000000000 && numValue < 10000000000000) {
      try {
        const unixDate = new Date(numValue);
        if (isValid(unixDate)) {
          return {
            isDate: true,
            originalValue: value,
            parsedDate: unixDate,
            displayValue: format(unixDate, 'MMM dd, yyyy'),
            sortValue: unixDate.getTime()
          };
        }
      } catch (e) {
        // Not a Unix timestamp
      }
    }
  }

  // Not a date
  return {
    isDate: false,
    originalValue: value,
    displayValue: stringValue,
    sortValue: stringValue.toLowerCase()
  };
}

export function detectDateColumns(data: any[], columns: string[]): string[] {
  const dateColumns: string[] = [];
  
  for (const column of columns) {
    let dateCount = 0;
    const sampleSize = Math.min(10, data.length);
    
    for (let i = 0; i < sampleSize; i++) {
      const value = data[i][column];
      const parseResult = parseDate(value);
      if (parseResult.isDate) {
        dateCount++;
      }
    }
    
    // If more than 50% of sample values are dates, consider it a date column
    if (dateCount > sampleSize * 0.5) {
      dateColumns.push(column);
    }
  }
  
  return dateColumns;
}

export function formatDateColumn(data: any[], column: string): any[] {
  return data.map(row => {
    const value = row[column];
    const parseResult = parseDate(value);
    
    if (parseResult.isDate && parseResult.parsedDate) {
      // Store both display value and original for sorting/processing
      return {
        ...row,
        [column]: parseResult.displayValue,
        [`${column}_original`]: parseResult.originalValue,
        [`${column}_timestamp`]: parseResult.sortValue
      };
    }
    
    return row;
  });
}
