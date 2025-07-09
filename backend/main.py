
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
from io import BytesIO
from typing import Optional, List, Dict, Any
import calendar

app = FastAPI(title="AI Power BI Studio API", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def format_month_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Convert numeric months to proper month names"""
    month_mapping = {
        1: 'January', 2: 'February', 3: 'March', 4: 'April',
        5: 'May', 6: 'June', 7: 'July', 8: 'August',
        9: 'September', 10: 'October', 11: 'November', 12: 'December'
    }
    
    for col in df.columns:
        if 'month' in col.lower():
            # Try to convert numeric months to month names
            try:
                df[col] = df[col].apply(lambda x: month_mapping.get(x, x) if pd.notna(x) and isinstance(x, (int, float)) and 1 <= x <= 12 else x)
            except:
                pass
    
    return df

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "FastAPI backend is running"}

@app.post("/api/upload-excel")
async def upload_excel(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="Only Excel files are supported")
        
        # Read the Excel file
        contents = await file.read()
        excel_file = BytesIO(contents)
        
        # Check if file has multiple sheets
        excel_data = pd.ExcelFile(excel_file)
        sheet_names = excel_data.sheet_names
        
        if len(sheet_names) > 1:
            return {
                "success": True,
                "multipleSheets": True,
                "sheets": sheet_names,
                "fileName": file.filename
            }
        
        # Single sheet - process directly
        df = pd.read_excel(excel_file, sheet_name=0)
        
        # Format month columns
        df = format_month_columns(df)
        
        # Convert to JSON-serializable format
        data = df.fillna('').to_dict('records')
        columns = df.columns.tolist()
        
        return {
            "success": True,
            "data": data,
            "columns": columns,
            "fileName": file.filename,
            "multipleSheets": False
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/api/process-sheet")
async def process_sheet(file: UploadFile = File(...), sheet_name: str = Form(...)):
    try:
        contents = await file.read()
        excel_file = BytesIO(contents)
        
        # Read specific sheet
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        
        # Format month columns
        df = format_month_columns(df)
        
        # Convert to JSON-serializable format
        data = df.fillna('').to_dict('records')
        columns = df.columns.tolist()
        
        return {
            "success": True,
            "data": data,
            "columns": columns,
            "fileName": file.filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing sheet: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
