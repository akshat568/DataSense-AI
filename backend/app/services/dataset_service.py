import io
import pandas as pd

def process_csv_dataset(file_content: bytes, filename: str) -> dict:
    """
    Reads a CSV dataset from bytes into memory using Pandas, extracts metadata,
    and returns a summary of the dataset.

    Args:
        file_content (bytes): The raw bytes of the CSV file.
        filename (str): The name of the uploaded file.

    Returns:
        dict: A dictionary containing the dataset metadata and a preview.
    """
    # Read the CSV into a pandas DataFrame in memory
    df = pd.read_csv(io.BytesIO(file_content))
    
    # Extract metadata
    rows, columns = df.shape
    
    # Memory usage in bytes
    memory_usage = int(df.memory_usage(deep=True).sum())
    
    # Detect column data types and convert to strings (e.g., 'int64', 'object')
    data_types = {col: str(dtype) for col, dtype in df.dtypes.items()}
    
    # Extract the first 10 rows, replacing NaNs with None for JSON serialization
    preview_df = df.head(10).replace({pd.NA: None})
    
    # Convert preview to a list of dicts
    # Orient 'records' makes it a list of dictionaries mapping columns to values
    # date_format='iso' helps serialize timestamps nicely
    preview_data = preview_df.to_dict(orient="records")

    return {
        "filename": filename,
        "rows": rows,
        "columns": columns,
        "memory_usage": memory_usage,
        "data_types": data_types,
        "preview": preview_data
    }
