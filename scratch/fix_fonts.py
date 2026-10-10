import os
import glob

notebooks_dir = os.path.join(os.getcwd(), "ml", "notebooks")
notebook_files = glob.glob(os.path.join(notebooks_dir, "*.ipynb"))

count = 0
for nb_path in notebook_files:
    with open(nb_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "Helvetica" in content:
        # Replace font setting
        new_content = content.replace("plt.rcParams['font.sans-serif'] = 'Helvetica'", "plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'sans-serif']")
        new_content = new_content.replace('plt.rcParams["font.sans-serif"] = "Helvetica"', "plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'sans-serif']")
        new_content = new_content.replace("'Helvetica'", "['DejaVu Sans', 'Arial', 'sans-serif']")
        
        with open(nb_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        count += 1
        print(f"Fixed font configuration in: {os.path.basename(nb_path)}")

print(f"\nDone! Updated font settings in {count} notebooks.")
