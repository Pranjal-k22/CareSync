import os
import glob
import json

notebooks_dir = os.path.join(os.getcwd(), "ml", "notebooks")
notebook_files = glob.glob(os.path.join(notebooks_dir, "*.ipynb"))

cleaned_count = 0
for nb_path in notebook_files:
    try:
        with open(nb_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        modified = False
        for cell in data.get("cells", []):
            if cell.get("cell_type") == "code" and "outputs" in cell:
                new_outputs = []
                for out in cell["outputs"]:
                    if out.get("output_type") == "stream" and "text" in out:
                        lines = out["text"]
                        if isinstance(lines, str):
                            lines = lines.splitlines(keepends=True)
                        filtered = [line for line in lines if "findfont" not in line and "Helvetica" not in line]
                        if len(filtered) != len(lines):
                            modified = True
                            if filtered:
                                out["text"] = "".join(filtered) if isinstance(out["text"], str) else filtered
                                new_outputs.append(out)
                        else:
                            new_outputs.append(out)
                    else:
                        new_outputs.append(out)
                cell["outputs"] = new_outputs

        if modified:
            with open(nb_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=1)
            cleaned_count += 1
            print(f"Cleaned font warning outputs from: {os.path.basename(nb_path)}")
    except Exception as e:
        print(f"Error processing {os.path.basename(nb_path)}: {e}")

print(f"\nDone! Cleaned warning outputs in {cleaned_count} notebooks.")
