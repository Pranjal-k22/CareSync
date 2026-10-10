"""Hospital B Local Federated Client Script using real Flower NumPyClient."""

from backend.federated.client_node import HospitalNumPyClient

DATASET_PATH = "datasets/hospital_b.csv"

def train_local_hospital_b():
    print(f"[Hospital B Client] Initializing Flower NumPyClient on {DATASET_PATH}...")
    client = HospitalNumPyClient(
        hospital_id="hosp_b",
        dataset_path=DATASET_PATH,
        name="Hospital B - Apollo Telemetry Node"
    )
    params = client.get_parameters()
    updated_params, num_samples, metrics = client.fit(params)
    print(f"[Hospital B Client] Local training finished on {num_samples} samples. Accuracy: {metrics['accuracy']}%")
    return metrics

if __name__ == "__main__":
    train_local_hospital_b()
