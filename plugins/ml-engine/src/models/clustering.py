"""
Clustering Model
Groups similar emission patterns using K-Means
"""
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from loguru import logger
import joblib
import os


class EmissionClusterer:
    """Cluster emissions data to identify patterns"""
    
    def __init__(self, n_clusters: int = 5, model_path: str = "models/clustering"):
        """
        Initialize clusterer
        
        Args:
            n_clusters: Number of clusters to create
            model_path: Path to save/load model
        """
        self.n_clusters = n_clusters
        self.model_path = model_path
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = []
        self.cluster_profiles = {}
        
    def train(self, data: pd.DataFrame, features: List[str] = None, auto_clusters: bool = False):
        """
        Train clustering model
        
        Args:
            data: Training data
            features: List of feature columns to use
            auto_clusters: Automatically determine optimal number of clusters
        """
        try:
            if features is None:
                # Use numeric columns
                features = data.select_dtypes(include=[np.number]).columns.tolist()
                features = [f for f in features if f not in ['id', 'timestamp']]
            
            self.feature_names = features
            
            # Prepare features
            X = data[features].fillna(0)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Determine optimal clusters if requested
            if auto_clusters:
                self.n_clusters = self._find_optimal_clusters(X_scaled)
                logger.info(f"Optimal number of clusters: {self.n_clusters}")
            
            # Train K-Means
            self.model = KMeans(
                n_clusters=self.n_clusters,
                random_state=42,
                n_init=10
            )
            self.model.fit(X_scaled)
            
            # Create cluster profiles
            data['cluster'] = self.model.labels_
            self.cluster_profiles = self._create_cluster_profiles(data)
            
            # Calculate silhouette score
            silhouette = silhouette_score(X_scaled, self.model.labels_)
            logger.info(f"Clustering model trained with silhouette score: {silhouette:.3f}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error training clustering model: {str(e)}")
            return False
    
    def _find_optimal_clusters(self, X: np.ndarray, max_clusters: int = 10) -> int:
        """Find optimal number of clusters using elbow method"""
        inertias = []
        silhouettes = []
        K_range = range(2, min(max_clusters + 1, len(X)))
        
        for k in K_range:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(X)
            inertias.append(kmeans.inertia_)
            silhouettes.append(silhouette_score(X, kmeans.labels_))
        
        # Find elbow point (simplified)
        if len(silhouettes) > 0:
            optimal_k = K_range[np.argmax(silhouettes)]
            return optimal_k
        
        return 5  # Default
    
    def predict(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Assign clusters to new data
        
        Returns:
            Dictionary with clustering results
        """
        try:
            if not self.model:
                raise ValueError("Model not trained. Call train() first.")
            
            # Prepare features
            X = data[self.feature_names].fillna(0)
            X_scaled = self.scaler.transform(X)
            
            # Predict clusters
            clusters = self.model.predict(X_scaled)
            
            # Add cluster assignments to data
            results = []
            for idx, cluster_id in enumerate(clusters):
                row_data = data.iloc[idx].to_dict()
                results.append({
                    'index': int(idx),
                    'timestamp': row_data.get('timestamp', ''),
                    'source': row_data.get('source', 'Unknown'),
                    'emissions': float(row_data.get('emissions', 0)),
                    'cluster_id': int(cluster_id),
                    'cluster_name': self.cluster_profiles.get(cluster_id, {}).get('name', f'Cluster {cluster_id}'),
                    'cluster_characteristics': self.cluster_profiles.get(cluster_id, {}).get('characteristics', {})
                })
            
            # Calculate cluster distribution
            cluster_counts = pd.Series(clusters).value_counts().to_dict()
            
            result = {
                'assignments': results,
                'summary': {
                    'total_samples': len(data),
                    'n_clusters': self.n_clusters,
                    'cluster_distribution': {int(k): int(v) for k, v in cluster_counts.items()},
                    'cluster_profiles': self.cluster_profiles
                },
                'metadata': {
                    'model_type': 'kmeans',
                    'features_used': self.feature_names
                }
            }
            
            logger.info(f"Assigned {len(data)} samples to {self.n_clusters} clusters")
            return result
            
        except Exception as e:
            logger.error(f"Error predicting clusters: {str(e)}")
            raise
    
    def _create_cluster_profiles(self, data: pd.DataFrame) -> Dict[int, Dict[str, Any]]:
        """Create descriptive profiles for each cluster"""
        profiles = {}
        
        for cluster_id in range(self.n_clusters):
            cluster_data = data[data['cluster'] == cluster_id]
            
            if len(cluster_data) == 0:
                continue
            
            # Calculate statistics
            avg_emissions = cluster_data['emissions'].mean() if 'emissions' in cluster_data.columns else 0
            total_samples = len(cluster_data)
            
            # Determine cluster characteristics
            characteristics = {}
            for feature in self.feature_names:
                if feature in cluster_data.columns:
                    characteristics[feature] = {
                        'mean': round(float(cluster_data[feature].mean()), 2),
                        'std': round(float(cluster_data[feature].std()), 2),
                        'min': round(float(cluster_data[feature].min()), 2),
                        'max': round(float(cluster_data[feature].max()), 2)
                    }
            
            # Assign descriptive name based on emissions level
            if avg_emissions > data['emissions'].quantile(0.75):
                name = "High Emitters"
                description = "Sources with consistently high emissions"
            elif avg_emissions > data['emissions'].quantile(0.5):
                name = "Medium Emitters"
                description = "Sources with moderate emission levels"
            elif avg_emissions > data['emissions'].quantile(0.25):
                name = "Low Emitters"
                description = "Sources with below-average emissions"
            else:
                name = "Minimal Emitters"
                description = "Sources with very low emissions"
            
            profiles[cluster_id] = {
                'id': cluster_id,
                'name': name,
                'description': description,
                'size': total_samples,
                'avg_emissions': round(avg_emissions, 2),
                'total_emissions': round(cluster_data['emissions'].sum(), 2) if 'emissions' in cluster_data.columns else 0,
                'characteristics': characteristics,
                'percentage': round(total_samples / len(data) * 100, 1)
            }
        
        return profiles
    
    def get_cluster_insights(self) -> List[Dict[str, Any]]:
        """Generate insights from cluster analysis"""
        insights = []
        
        if not self.cluster_profiles:
            return insights
        
        # Find largest cluster
        largest_cluster = max(self.cluster_profiles.values(), key=lambda x: x['size'])
        insights.append({
            'type': 'cluster_size',
            'title': f"Largest Group: {largest_cluster['name']}",
            'description': f"{largest_cluster['percentage']}% of emissions fall into this category",
            'cluster_id': largest_cluster['id']
        })
        
        # Find highest emitting cluster
        highest_cluster = max(self.cluster_profiles.values(), key=lambda x: x['avg_emissions'])
        insights.append({
            'type': 'high_emissions',
            'title': f"Highest Emissions: {highest_cluster['name']}",
            'description': f"Average {highest_cluster['avg_emissions']} kg CO2 per source",
            'cluster_id': highest_cluster['id']
        })
        
        # Identify optimization opportunities
        for cluster_id, profile in self.cluster_profiles.items():
            if profile['avg_emissions'] > 500:  # Threshold for high emissions
                insights.append({
                    'type': 'opportunity',
                    'title': f"Optimization Opportunity in {profile['name']}",
                    'description': f"{profile['size']} sources could benefit from emission reduction strategies",
                    'cluster_id': cluster_id,
                    'potential_reduction': round(profile['total_emissions'] * 0.2, 2)
                })
        
        return insights
    
    def save(self, path: Optional[str] = None):
        """Save model to disk"""
        save_path = path or self.model_path
        os.makedirs(save_path, exist_ok=True)
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'n_clusters': self.n_clusters,
            'cluster_profiles': self.cluster_profiles
        }
        
        model_file = os.path.join(save_path, "clustering_model.pkl")
        joblib.dump(model_data, model_file)
        logger.info(f"Model saved to {model_file}")
    
    def load(self, path: Optional[str] = None):
        """Load model from disk"""
        load_path = path or self.model_path
        model_file = os.path.join(load_path, "clustering_model.pkl")
        
        if os.path.exists(model_file):
            model_data = joblib.load(model_file)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            self.n_clusters = model_data['n_clusters']
            self.cluster_profiles = model_data.get('cluster_profiles', {})
            logger.info(f"Model loaded from {model_file}")
            return True
        else:
            logger.warning(f"Model file not found: {model_file}")
            return False
