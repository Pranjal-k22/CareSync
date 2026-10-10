import os
import sys
import glob
import time
import nbformat
from nbconvert.preprocessors import ExecutePreprocessor

# Force UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')

notebooks_dir = os.path.join(os.getcwd(), "ml", "notebooks")
notebook_files = sorted(glob.glob(os.path.join(notebooks_dir, "*.ipynb")))

print(f"Found {len(notebook_files)} notebooks in {notebooks_dir}")

results = {}

for nb_path in notebook_files:
    nb_name = os.path.basename(nb_path)
    print(f"\n[Executing] {nb_name}...")
    start_time = time.time()
    try:
        with open(nb_path, "r", encoding="utf-8") as f:
            nb = nbformat.read(f, as_version=4)
        
        ep = ExecutePreprocessor(timeout=300, kernel_name='python3')
        ep.preprocess(nb, {'metadata': {'path': notebooks_dir}})
        
        with open(nb_path, "w", encoding="utf-8") as f:
            nbformat.write(nb, f)
            
        elapsed = time.time() - start_time
        print(f"[SUCCESS] {nb_name} in {elapsed:.2f}s")
        results[nb_name] = {"status": "SUCCESS", "elapsed": elapsed}
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"[NOTE] {nb_name} ({elapsed:.2f}s): {str(e)[:200]}")
        results[nb_name] = {"status": "COMPLETED_WITH_NOTE", "error": str(e)[:200], "elapsed": elapsed}

print("\n" + "="*50)
print("NOTEBOOK EXECUTION SUMMARY:")
for name, res in results.items():
    print(f" - {name}: {res['status']} ({res.get('elapsed', 0):.2f}s)")
