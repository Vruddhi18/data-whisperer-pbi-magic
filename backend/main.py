
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import io
import json
from typing import Dict, List, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Power BI Studio API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def format_month_value(value: Any) -> str:
    """Convert month values to proper month names"""
    if pd.isna(value) or value == '':
        return 'Unknown'
    
    month_mapping = {
        1: 'January', 2: 'February', 3: 'March', 4: 'April',
        5: 'May', 6: 'June', 7: 'July', 8: 'August',
        9: 'September', 10: 'October', 11: 'November', 12: 'December',
        '1': 'January', '2': 'February', '3': 'March', '4': 'April',
        '5': 'May', '6': 'June', '7': 'July', '8': 'August',
        '9': 'September', '10': 'October', '11': 'November', '12': 'December'
    }
    
    # Direct mapping
    if value in month_mapping:
        return month_mapping[value]
    
    # String processing
    str_value = str(value).lower().strip()
    
    # Check for month abbreviations
    month_abbrevs = {
        'jan': 'January', 'feb': 'February', 'mar': 'March', 'apr': 'April',
        'may': 'May', 'jun': 'June', 'jul': 'July', 'aug': 'August',
        'sep': 'September', 'oct': 'October', 'nov': 'November', 'dec': 'December'
    }
    
    if str_value in month_abbrevs:
        return month_abbrevs[str_value]
    
    # Try to parse as date
    try:
        if isinstance(value, (int, float)):
            if 1 <= value <= 12:
                return month_mapping[int(value)]
        date_val = pd.to_datetime(value, errors='coerce')
        if not pd.isna(date_val):
            return date_val.strftime('%B')
    except:
        pass
    
    return str(value)

def clean_and_process_data(df: pd.DataFrame) -> tuple[List[Dict], List[str]]:
    """Clean and process the dataframe with proper month formatting"""
    
    # Clean column names
    df.columns = df.columns.astype(str).str.strip().str.replace(r'\s+', ' ', regex=True)
    
    # Identify month columns
    month_columns = [col for col in df.columns if 'month' in col.lower()]
    
    # Process each row
    processed_data = []
    for _, row in df.iterrows():
        clean_row = {}
        for col in df.columns:
            value = row[col]
            
            # Handle month columns specially
            if col in month_columns:
                clean_row[col] = format_month_value(value)
            else:
                # Clean other values
                if pd.isna(value):
                    clean_row[col] = ''
                elif isinstance(value, str):
                    clean_value = value.strip()
                    # Try to convert numeric strings
                    try:
                        if clean_value.replace(',', '').replace('.', '').replace('-', '').isdigit():
                            clean_row[col] = float(clean_value.replace(',', ''))
                        else:
                            clean_row[col] = clean_value
                    except:
                        clean_row[col] = clean_value
                else:
                    clean_row[col] = value
        
        processed_data.append(clean_row)
    
    columns = list(df.columns)
    logger.info(f"Processed {len(processed_data)} rows with {len(columns)} columns")
    logger.info(f"Month columns found: {month_columns}")
    
    return processed_data, columns

@app.post("/api/upload-excel")
async def upload_excel(file: UploadFile = File(...)):
    """Process uploaded Excel file and return cleaned data"""
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload Excel files only.")
    
    try:
        # Read file content
        content = await file.read()
        
        # Load Excel file
        excel_file = pd.ExcelFile(io.BytesIO(content))
        sheet_names = excel_file.sheet_names
        
        logger.info(f"Found {len(sheet_names)} sheets: {sheet_names}")
        
        if len(sheet_names) == 1:
            # Process single sheet directly
            df = pd.read_excel(io.BytesIO(content), sheet_name=sheet_names[0])
            processed_data, columns = clean_and_process_data(df)
            
            return JSONResponse({
                "success": True,
                "data": processed_data,
                "columns": columns,
                "fileName": f"{file.filename} - {sheet_names[0]}",
                "sheets": sheet_names
            })
        else:
            # Multiple sheets - return sheet info for user selection
            return JSONResponse({
                "success": True,
                "multipleSheets": True,
                "sheets": sheet_names,
                "fileName": file.filename
            })
            
    except Exception as e:
        logger.error(f"Error processing Excel file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/api/process-sheet")
async def process_sheet(file: UploadFile = File(...), sheet_name: str = ""):
    """Process specific sheet from Excel file"""
    
    try:
        content = await file.read()
        df = pd.read_excel(io.BytesIO(content), sheet_name=sheet_name)
        processed_data, columns = clean_and_process_data(df)
        
        return JSONResponse({
            "success": True,
            "data": processed_data,
            "columns": columns,
            "fileName": f"{file.filename} - {sheet_name}"
        })
        
    except Exception as e:
        logger.error(f"Error processing sheet {sheet_name}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing sheet: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Power BI Studio API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
