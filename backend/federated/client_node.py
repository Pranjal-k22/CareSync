"""Real Flower NumPyClient implementation for Hospital Edge Node Local Model Fitting & Evaluation."""

import os
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, log_loss
from sklearn.model_selection import train_test_split
import flwr as fl

class HospitalNumPyClient(fl.client.NumPyClient):
    """Flower NumPyClient for Hospital Edge Node Local Fitting & Evaluation."""
    
    def __init__(self, hospital_id: str, dataset_path: str, name: str):
        self.hospital_id = hospital_id
        self.dataset_path = dataset_path
        self.name = name
        
        # Load local edge hospital dataset
        if not os.path.exists(self.dataset_path):
            raise FileNotFoundError(f"Hospital edge dataset missing at {self.dataset_path}")
            
        df = pd.read_csv(self.dataset_path)
        X = df.drop(columns=["deterioration_next_12h"])
        y = df["deterioration_next_12h"]
        
        # Split local dataset into 80% train and 20% test
        X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        self.scaler = StandardScaler()
        self.X_train = self.scaler.fit_transform(X_tr)
        self.X_test = self.scaler.transform(X_te)
        self.y_train = y_tr.values
        self.y_test = y_te.values
        self.num_samples = len(self.X_train)
        
        # Initialize local Logistic Regression model for clinical deterioration
        self.model = LogisticRegression(max_iter=100, random_state=42, solver='lbfgs')
        # Warm initialization fit on first 200 samples
        self.model.fit(self.X_train[:200], self.y_train[:200])

    def get_parameters(self, config=None):
        """Return local model parameters (coef_ and intercept_)."""
        return [self.model.coef_, self.model.intercept_]

    def set_parameters(self, parameters):
        """Set local model parameters from global aggregated weights."""
        if parameters is not None and len(parameters) >= 2:
            self.model.coef_ = np.array(parameters[0], dtype=np.float64)
            self.model.intercept_ = np.array(parameters[1], dtype=np.float64)
            self.model.classes_ = np.array([0, 1])

    def fit(self, parameters, config=None):
        """Perform local model fitting on local edge hospital dataset."""
        if parameters is not None:
            self.set_parameters(parameters)
            
        # Fit local model on local training dataset
        self.model.fit(self.X_train, self.y_train)
        
        updated_params = self.get_parameters(config)
        
        # Calculate local train metrics
        preds_prob = self.model.predict_proba(self.X_train)
        preds = (preds_prob[:, 1] >= 0.5).astype(int)
        acc = float(accuracy_score(self.y_train, preds))
        loss = float(log_loss(self.y_train, preds_prob, labels=[0, 1]))
        
        metrics = {
            "accuracy": round(acc * 100, 2),
            "loss": round(loss, 4),
            "hospital_id": self.hospital_id,
            "hospital_name": self.name,
            "samples": self.num_samples
        }
        
        return updated_params, self.num_samples, metrics

    def evaluate(self, parameters, config=None):
        """Evaluate global model parameters on local test dataset."""
        if parameters is not None:
            self.set_parameters(parameters)
            
        preds_prob = self.model.predict_proba(self.X_test)
        preds = (preds_prob[:, 1] >= 0.5).astype(int)
        acc = float(accuracy_score(self.y_test, preds))
        loss = float(log_loss(self.y_test, preds_prob, labels=[0, 1]))
        num_test_samples = len(self.X_test)
        
        metrics = {
            "accuracy": round(acc * 100, 2),
            "hospital_id": self.hospital_id,
            "hospital_name": self.name,
            "samples": num_test_samples
        }
        
        return float(loss), num_test_samples, metrics
