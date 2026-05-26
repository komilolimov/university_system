import sys
import os
import glob
import json

def main():
    if len(sys.argv) < 2:
        print("Usage: python assert_course_catalog_rules.py <output_dir>")
        sys.exit(1)
        
    output_dir = sys.argv[1]
    
    # Assertions
    has_no_use_client = False
    has_api_client = False
    has_ag_grid = False
    has_index_ts = False
    
    evidence = []
    
    files = glob.glob(os.path.join(output_dir, '**', '*'), recursive=True)
    ts_files = [f for f in files if f.endswith('.tsx') or f.endswith('.ts')]
    
    has_index_ts = any(os.path.basename(f) == 'index.ts' for f in ts_files)
    
    use_client_found = False
    
    for f in ts_files:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            if '"use client"' in content or "'use client'" in content:
                use_client_found = True
                evidence.append(f"Found 'use client' in {f}")
            if 'apiClient' in content:
                has_api_client = True
                evidence.append(f"Found apiClient usage in {f}")
            if 'ag-grid-react' in content or 'AgGridReact' in content:
                has_ag_grid = True
                evidence.append(f"Found AG-Grid usage in {f}")
                
    has_no_use_client = not use_client_found
    if has_no_use_client:
        evidence.append("Correctly avoided 'use client' for Server Component.")
    if has_index_ts:
        evidence.append("Public API index.ts found.")
        
    grading = {
        "expectations": [
            {
                "text": "Server Component does not use 'use client'",
                "passed": has_no_use_client,
                "evidence": "\n".join(e for e in evidence if 'use client' in e) or "Check completed."
            },
            {
                "text": "Uses apiClient for data fetching",
                "passed": has_api_client,
                "evidence": "\n".join(e for e in evidence if 'apiClient' in e) or "No apiClient found."
            },
            {
                "text": "Uses AG-Grid for data table",
                "passed": has_ag_grid,
                "evidence": "\n".join(e for e in evidence if 'AG-Grid' in e) or "No AG-Grid found."
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
