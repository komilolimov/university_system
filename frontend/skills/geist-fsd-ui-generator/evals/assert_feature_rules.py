import sys
import os
import glob
import json

def main():
    if len(sys.argv) < 2:
        print("Usage: python assert_feature_rules.py <output_dir>")
        sys.exit(1)
        
    output_dir = sys.argv[1]
    
    has_use_client = False
    has_use_server = False
    has_api_client_put = False
    has_index_ts = False
    has_geist = False
    
    evidence = []
    
    files = glob.glob(os.path.join(output_dir, '**', '*'), recursive=True)
    ts_files = [f for f in files if f.endswith('.tsx') or f.endswith('.ts')]
    
    has_index_ts = any(os.path.basename(f) == 'index.ts' for f in ts_files)
    
    for f in ts_files:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            if '"use client"' in content or "'use client'" in content:
                has_use_client = True
                evidence.append(f"Found 'use client' in {f}")
            if '"use server"' in content or "'use server'" in content:
                has_use_server = True
                evidence.append(f"Found 'use server' in {f}")
            if 'apiClient.PUT' in content or 'apiClient.put' in content or ('apiClient' in content and 'PUT' in content):
                has_api_client_put = True
                evidence.append(f"Found apiClient PUT usage in {f}")
            if 'geist' in content.lower():
                has_geist = True
                evidence.append(f"Found Geist font in {f}")
                
    if has_index_ts:
        evidence.append("Public API index.ts found.")
        
    grading = {
        "expectations": [
            {
                "text": "UI Component uses 'use client'",
                "passed": has_use_client,
                "evidence": "\n".join(e for e in evidence if 'use client' in e) or "Not found."
            },
            {
                "text": "Action file uses 'use server'",
                "passed": has_use_server,
                "evidence": "\n".join(e for e in evidence if 'use server' in e) or "Not found."
            },
            {
                "text": "Uses apiClient for PUT request",
                "passed": has_api_client_put,
                "evidence": "\n".join(e for e in evidence if 'apiClient' in e) or "Not found."
            },
            {
                "text": "Uses Geist font",
                "passed": has_geist,
                "evidence": "\n".join(e for e in evidence if 'Geist' in e) or "Not found."
            },
            {
                "text": "Includes index.ts public API",
                "passed": has_index_ts,
                "evidence": "index.ts found." if has_index_ts else "No index.ts found."
            }
        ]
    }
    
    with open(os.path.join(output_dir, '..', 'grading.json'), 'w') as f:
        json.dump(grading, f, indent=2)
        
if __name__ == '__main__':
    main()
