"""Flower FedAvg Server Script for Hospital Deterioration Model Aggregation."""

import os
import json
from backend.federated.federated_engine import run_federated_training_round, get_federated_status

def start_flower_fedavg_server(num_rounds: int = 1):
    print(f"Starting Flower FedAvg Server for {num_rounds} round(s)...")
    res = run_federated_training_round()
    print("Federated Aggregation Completed:")
    print(json.dumps(res, indent=2))
    return res

if __name__ == "__main__":
    start_flower_fedavg_server()
