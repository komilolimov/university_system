import sys
import os
import glob
import json

def main():
    if len(sys.argv) < 2:
        print("Usage: python assert_widget_rules.py <output_dir>")
        sys.exit(1)
        
    output_dir = sys.argv[1]
    
    evidence = []
    
    files = glob.glob(os.path.join(output_dir, '**', '*'), recursive=True)
    ts_files = [f for f in files if f.endswith('.tsx') or f.endswith('.ts')]
    
    has_index_ts = any(os.path.basename(f) == 'index.ts' for f in ts_files)
    
    use_client_found = False
    has_api_client = False
    has_geist = False
    has_inter = False
    has_generic_colors = False
    
    for f in ts_files:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            if '"use client"' in content or "'use client'" in content:
                use_client_found = True
                evidence.append(f"Found 'use client' in {f}")
            if 'apiClient' in content:
                has_api_client = True
                evidence.append(f"Found apiClient usage in {f}")
            if 'geist' in content.lower():
                has_geist = True
                evidence.append(f"Found Geist font in {f}")
            if 'inter' in content.lower():
                has_inter = True
                evidence.append(f"Found Inter font in {f}")
            if 'bg-blue' in content or 'bg-red' in content or 'bg-green' in content:
                has_generic_colors = True
                evidence.append(f"Found generic Tailwind color in {f}")

    has_no_use_client = not use_client_found
    has_no_inter = not has_inter
    has_no_generic_colors = not has_generic_colors
                
    if has_no_use_client:
        evidence.append("Correctly avoided 'use client'.")
    if has_no_inter:
        evidence.append("Correctly avoided Inter font.")
    if has_index_ts:
        evidence.append("Public API index.ts found.")
        
    grading = {
        "expectations": [
            {
                "text": "Server Component does not use 'use client'",
                "passed": has_no_use_client,
                "evidence": "\n".join(e for e in evidence if 'use client' in e) or "Check passed."
            },
            {
                "text": "Uses apiClient for data fetching",
                "passed": has_api_client,
                "evidence": "\n".join(e for e in evidence if 'apiClient' in e) or "No apiClient found."
            },
            {
                "text": "Uses Geist font and NOT Inter",
                "passed": has_geist and has_no_inter,
                "evidence": "\n".join(e for e in evidence if 'Geist' in e or 'Inter' in e) or "Failed font check."
            },
            {
                "text": "Avoids generic vibrant background colors",
                "passed": has_no_generic_colors,
                "evidence": "\n".join(e for e in evidence if 'generic Tailwind color' in e) or "Check passed."
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
