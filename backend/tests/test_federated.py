import pytest
from backend.federated.federated_engine import get_federated_status, run_federated_training_round
from backend.federated.server import start_flower_fedavg_server
from backend.federated.client_a import train_local_hospital_a

def test_hospital_client_initialization():
    res = train_local_hospital_a()
    assert "status" in res or "hospital_id" in res

def test_flower_server_initialization():
    status = get_federated_status()
    assert status["deployment_mode"] == "REAL_FLOWER_NUMPYCLIENT"
    assert status["connected_nodes"] == 3

def test_federated_model_aggregation():
    res = run_federated_training_round()
    assert res["success"] is True
    assert "round_summary" in res
    assert "global_model_v" in res["round_summary"]["model_version"]
