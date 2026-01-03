# Guide to Adding 300 More Universities

## Current Status
- **Current Count:** 317 universities
- **Target:** 600+ universities  
- **Need to Add:** ~290 more universities

## Approach

Due to file size constraints, I recommend adding universities in batches using the Python script.

### Batch 1: US Universities (50)
Run: `python add_universities_batch1.py`

### Batch 2: UK & Europe (50)
Run: `python add_universities_batch2.py`

### Batch 3: Asia (50)
Run: `python add_universities_batch3.py`

### Batch 4: Canada & Australia (50)
Run: `python add_universities_batch4.py`

### Batch 5: Global Mix (90)
Run: `python add_universities_batch5.py`

## Quick Add Command

To add all batches at once:
```bash
cd StudyAbroad-main/backend
python add_universities_batch1.py
python add_universities_batch2.py
python add_universities_batch3.py
python add_universities_batch4.py
python add_universities_batch5.py
```

## Verification

After adding, verify no duplicates:
```powershell
$json = Get-Content "data/universities.json" | ConvertFrom-Json
$names = $json | Select-Object -ExpandProperty name
$duplicates = $names | Group-Object | Where-Object { $_.Count -gt 1 }
if ($duplicates) { "Found duplicates!" } else { "✅ No duplicates" }
Write-Output "Total: $($json.Count) universities"
```

## Alternative: Manual Addition

If you prefer, I can provide:
1. A CSV file with 300 universities
2. SQL INSERT statements
3. JSON array to copy-paste

Let me know your preference!
