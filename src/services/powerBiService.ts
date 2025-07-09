
import { DataRow } from '@/pages/Index';

export interface PowerBIConfig {
  embedUrl: string;
  accessToken: string;
  reportId: string;
  datasetId: string;
}

export interface PowerBIEmbedProps {
  data: DataRow[];
  columns: string[];
  title: string;
}

export class PowerBIService {
  private static instance: PowerBIService;
  private config: PowerBIConfig | null = null;

  static getInstance(): PowerBIService {
    if (!PowerBIService.instance) {
      PowerBIService.instance = new PowerBIService();
    }
    return PowerBIService.instance;
  }

  setConfig(config: PowerBIConfig) {
    this.config = config;
  }

  // Generate Power BI dataset schema from data
  generateDatasetSchema(data: DataRow[], columns: string[]) {
    const tables = [{
      name: "ExcelData",
      columns: columns.map(col => {
        // Analyze column data to determine type
        const sampleValues = data.slice(0, 10).map(row => row[col]);
        const hasNumbers = sampleValues.some(val => typeof val === 'number');
        const hasStrings = sampleValues.some(val => typeof val === 'string');
        
        let dataType = 'String';
        if (hasNumbers && !hasStrings) {
          dataType = 'Double';
        } else if (col.toLowerCase().includes('date') || col.toLowerCase().includes('month')) {
          dataType = 'DateTime';
        }

        return {
          name: col,
          dataType: dataType
        };
      }),
      rows: data
    }];

    return {
      name: "AI_PowerBI_Dataset",
      tables: tables
    };
  }

  // Generate Power BI report definition
  generateReportDefinition(data: DataRow[], columns: string[]) {
    // Identify key columns for visualizations
    const timeColumns = columns.filter(col => 
      col.toLowerCase().includes('month') || 
      col.toLowerCase().includes('date') ||
      col.toLowerCase().includes('time')
    );

    const numericColumns = columns.filter(col => {
      const sampleValues = data.slice(0, 5).map(row => row[col]);
      return sampleValues.some(val => typeof val === 'number');
    });

    const pages = [{
      name: "Overview",
      visualContainers: [
        // Bar Chart - Plan vs Actual
        {
          x: 0, y: 0, width: 6, height: 4,
          visualType: "clusteredColumnChart",
          title: "Performance Overview",
          filters: [],
          dataRoles: {
            Category: timeColumns[0] || columns[0],
            Values: numericColumns.slice(0, 2)
          }
        },
        // Pie Chart - Distribution
        {
          x: 6, y: 0, width: 6, height: 4,
          visualType: "pieChart",
          title: "Distribution Analysis",
          filters: [],
          dataRoles: {
            Category: timeColumns[0] || columns[0],
            Values: [numericColumns[0]]
          }
        },
        // Line Chart - Trends
        {
          x: 0, y: 4, width: 12, height: 4,
          visualType: "lineChart",
          title: "Trend Analysis",
          filters: [],
          dataRoles: {
            Category: timeColumns[0] || columns[0],
            Values: numericColumns.slice(0, 3)
          }
        }
      ]
    }];

    return {
      version: "1.0",
      config: {
        theme: "CityPark"
      },
      pages: pages
    };
  }

  // Export data to Power BI format
  exportToPowerBI(data: DataRow[], columns: string[], title: string) {
    const dataset = this.generateDatasetSchema(data, columns);
    const report = this.generateReportDefinition(data, columns);
    
    // Create downloadable file
    const exportData = {
      metadata: {
        title: title,
        createdBy: "AI Power BI Studio",
        createdAt: new Date().toISOString(),
        version: "1.0"
      },
      dataset: dataset,
      report: report,
      data: data
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}_PowerBI_Export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return exportData;
  }

  // Generate Power BI embed URL (placeholder for actual implementation)
  generateEmbedUrl(reportId: string): string {
    return `https://app.powerbi.com/reportEmbed?reportId=${reportId}&autoAuth=true&ctid=YOUR_TENANT_ID`;
  }
}

export const powerBIService = PowerBIService.getInstance();
