"""Hospital C Local Federated Client Script using real Flower NumPyClient."""

from backend.federated.client_node import HospitalNumPyClient

DATASET_PATH = "datasets/hospital_c.csv"

def train_local_hospital_c():
    print(f"[Hospital C Client] Initializing Flower NumPyClient on {DATASET_PATH}...")
    client = HospitalNumPyClient(
        hospital_id="hosp_c",
        dataset_path=DATASET_PATH,
        name="Hospital C - Fortis Cardiac Node"
    )
    params = client.get_parameters()
    updated_params, num_samples, metrics = client.fit(params)
    print(f"[Hospital C Client] Local training finished on {num_samples} samples. Accuracy: {metrics['accuracy']}%")
    return metrics

if __name__ == "__main__":
    train_local_hospital_c()
