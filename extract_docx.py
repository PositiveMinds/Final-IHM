#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import zipfile
import xml.etree.ElementTree as ET
import re

# Set output encoding to UTF-8
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    docx_path = '90-Day Action Plan - AI HIV Automation (Western Uganda).docx'
    z = zipfile.ZipFile(docx_path)
    root = ET.fromstring(z.read('word/document.xml'))
    
    # Extract all text
    text = ''.join(root.itertext())
    
    # Find pricing-related content
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if any(keyword in line.lower() for keyword in ['pricing', 'price', 'cost', 'fee', 'ugx', 'shilling', 'tier', 'plan', 'package']):
            print(f"{i}: {line}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
