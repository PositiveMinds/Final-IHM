# HealthFlow Data Import Guide

## Overview

The Data Import feature in HealthFlow allows you to quickly import large batches of patient and appointment records using CSV (Comma-Separated Values) files. This is especially useful for initial data migration or bulk uploads.

## Features

- **Bulk Import**: Import up to hundreds of records at once
- **Preview Before Import**: Review records before committing them to the database
- **Validation**: Automatic validation of required fields and data format
- **Batch Processing**: Large files are processed in batches to prevent timeouts
- **Error Reporting**: Detailed error messages for troubleshooting

## How to Access

1. Go to the **Dashboard**
2. Scroll down to the **Data Management** section
3. Click on the **Data Import** tab

## Patients Data Import

### Step 1: Prepare Your CSV File

Create a CSV file with the following columns (in any order):

| Column Name | Required | Format | Example |
|---|---|---|---|
| `first_name` | Yes | Text | John |
| `last_name` | Yes | Text | Doe |
| `email` | Yes | Email | john.doe@example.com |
| `phone_number` | Yes | Text | 0701234567 |
| `date_of_birth` | Yes | YYYY-MM-DD | 1990-05-15 |
| `gender` | Yes | M, F, or O | M |
| `national_id` | No | Text | CM12345678A |

### Step 2: Upload and Preview

1. Click the **"Select CSV File"** button in the Import Patients tab
2. Choose your CSV file (maximum 5MB)
3. A preview of the first 5 records will be shown
4. Review the data for accuracy

### Step 3: Confirm and Import

1. Click **"Confirm Import"** to proceed
2. The system will process all records in batches
3. You'll see a success message once the import is complete

### Example CSV Format

```csv
first_name,last_name,email,phone_number,date_of_birth,gender,national_id
John,Doe,john.doe@example.com,0701234567,1990-05-15,M,CM12345678A
Jane,Smith,jane.smith@example.com,0702345678,1988-03-20,F,CM87654321B
Robert,Johnson,robert.j@example.com,0703456789,1995-07-10,M,CM11223344C
```

## Appointments Data Import

### Step 1: Prepare Your CSV File

Create a CSV file with the following columns (in any order):

| Column Name | Required | Format | Example |
|---|---|---|---|
| `patient_id` | Yes | Number | 1 |
| `appointment_date` | Yes | YYYY-MM-DD | 2024-01-25 |
| `appointment_time` | Yes | HH:MM | 09:00 |
| `reason` | Yes | Text | HIV Viral Load Test |
| `doctor_name` | Yes | Text | Dr. Sarah Omondi |

### Step 2: Upload and Preview

1. Click the **"Select CSV File"** button in the Import Appointments tab
2. Choose your CSV file (maximum 5MB)
3. A preview of the first 5 records will be shown
4. Review the data for accuracy

### Step 3: Confirm and Import

1. Click **"Confirm Import"** to proceed
2. The system will process all records in batches
3. You'll see a success message once the import is complete

### Example CSV Format

```csv
patient_id,appointment_date,appointment_time,reason,doctor_name
1,2024-01-25,09:00,HIV Viral Load Test,Dr. Sarah Omondi
2,2024-01-25,10:30,Routine Check-up,Dr. James Kipchoge
3,2024-01-26,14:00,Blood Pressure Monitoring,Dr. Mary Njoroge
```

## Important Notes

### Data Validation

- **Required Fields**: All required fields must have values
- **Date Format**: Dates must be in YYYY-MM-DD format
- **Time Format**: Times must be in HH:MM format (24-hour)
- **Gender**: Must be one of: M (Male), F (Female), or O (Other)
- **Phone Numbers**: Can include spaces and special characters (e.g., +256 701 234 567)

### Best Practices

1. **Clean Your Data**: Remove extra spaces and special characters from column names
2. **Verify Patient IDs**: For appointments, ensure patient IDs exist in the system first
3. **Test Small Batches**: Start with a small number of records to test
4. **Backup Data**: Keep a backup of your original CSV files
5. **Check for Duplicates**: Ensure you're not importing duplicate records

### Common Issues

| Issue | Solution |
|---|---|
| "Missing required columns" | Ensure all required column names are spelled exactly as shown |
| "File size exceeds 5MB" | Split your file into smaller chunks |
| "Failed to parse CSV file" | Check that your CSV is properly formatted with correct delimiters |
| "Some records failed to import" | Check the error message for specific details about which records failed |

## Sample Files

We provide sample CSV files to help you get started:

- **sample_patients_import.csv** - Example patient records
- **sample_appointments_import.csv** - Example appointment records

You can download these files and use them as templates for your own data.

## Tips for Large Imports

- For files with 1000+ records, consider splitting them into multiple smaller files
- Import during off-peak hours to avoid impacting system performance
- Review your data thoroughly before importing
- Keep detailed records of what was imported and when

## Troubleshooting

### Import appears to be stuck

- Wait a few minutes - large imports can take time to process
- Check your internet connection
- Try reloading the page and checking the import status

### Data didn't import but no error was shown

- Check that you selected the preview checkbox
- Verify your file format is correct
- Try importing a smaller batch first

### Some records imported but others failed

- The system will show you which batch had issues
- Review those specific records in your CSV file
- Fix the errors and re-import the failing records

## Security and Privacy

- All imported data is encrypted in transit
- Data is validated before insertion into the database
- Import operations are logged for audit purposes
- Only authorized users can import data

## Need Help?

For additional support, please contact the HealthFlow support team or check the Knowledge Base section in the Help menu.

---

Last Updated: January 2024
