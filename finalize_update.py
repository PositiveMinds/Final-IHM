import os
import time

# Wait for file to be released
time.sleep(2)

# Replace original with updated
original = 'Client Outreach Plan - Western Uganda (10 First Customers).docx'
updated = 'Client Outreach Plan - Western Uganda (10 First Customers)_UPDATED.docx'
backup = 'Client Outreach Plan - Western Uganda (10 First Customers)_ORIGINAL_BACKUP.docx'

try:
    # Backup original
    if os.path.exists(original):
        os.rename(original, backup)
    
    # Replace with updated
    os.rename(updated, original)
    
    print(f"Updated document saved as: {original}")
    print(f"Original backed up as: {backup}")
except Exception as e:
    print(f"Error: {e}")
    print("Please close the document and try again")
