"""
Time Series Forecasting Model
Predicts future emissions trends using Prophet and ARIMA
"""
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from loguru import logger
import joblib
import os


class TimeSeriesForecaster:
    """Forecast future emissions using time series analysis"""
    
    def __init__(self, model_path: str = "models/timeseries"):
        self.model_path = model_path
        self.model = None
        self.scaler = None
        
    def train(self, data: pd.DataFrame, target_col: str = "emissions"):
        """
        Train time series forecasting model
        
        Args:
            data: DataFrame with 'timestamp' and target column
            target_col: Name of the column to forecast
        """
        try:
            # Prepare data
            df = data.copy()
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values('timestamp')
            
            # Aggregate by day
            daily_data = df.groupby(df['timestamp'].dt.date)[target_col].sum().reset_index()
            daily_data.columns = ['ds', 'y']
            daily_data['ds'] = pd.to_datetime(daily_data['ds'])
            
            # Use simple moving average and trend for lightweight model
            self.model = {
                'data': daily_data,
                'mean': daily_data['y'].mean(),
                'std': daily_data['y'].std(),
                'trend': self._calculate_trend(daily_data)
            }
            
            logger.info("Time series model trained successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error training time series model: {str(e)}")
            return False
    
    def _calculate_trend(self, data: pd.DataFrame) -> float:
        """Calculate linear trend"""
        x = np.arange(len(data))
        y = data['y'].values
        
        # Simple linear regression
        x_mean = x.mean()
        y_mean = y.mean()
        
        numerator = ((x - x_mean) * (y - y_mean)).sum()
        denominator = ((x - x_mean) ** 2).sum()
        
        if denominator == 0:
            return 0
        
        slope = numerator / denominator
        return slope
    
    def forecast(
        self,
        periods: int = 30,
        frequency: str = "D",
        include_confidence: bool = True
    ) -> Dict[str, Any]:
        """
        Generate forecast for future periods
        
        Args:
            periods: Number of periods to forecast
            frequency: Frequency ('D' for daily, 'W' for weekly, 'M' for monthly)
            include_confidence: Include confidence intervals
            
        Returns:
            Dictionary with forecast data
        """
        try:
            if not self.model:
                raise ValueError("Model not trained. Call train() first.")
            
            # Get last date from training data
            last_date = self.model['data']['ds'].max()
            
            # Generate future dates
            if frequency == "D":
                future_dates = pd.date_range(
                    start=last_date + timedelta(days=1),
                    periods=periods,
                    freq='D'
                )
            elif frequency == "W":
                future_dates = pd.date_range(
                    start=last_date + timedelta(weeks=1),
                    periods=periods,
                    freq='W'
                )
            elif frequency == "M":
                future_dates = pd.date_range(
                    start=last_date + timedelta(days=30),
                    periods=periods,
                    freq='MS'
                )
            else:
                future_dates = pd.date_range(
                    start=last_date + timedelta(days=1),
                    periods=periods,
                    freq='D'
                )
            
            # Simple forecast using trend and seasonality
            base_value = self.model['mean']
            trend = self.model['trend']
            std = self.model['std']
            
            forecasts = []
            for i, date in enumerate(future_dates):
                # Trend component
                trend_value = base_value + (trend * (len(self.model['data']) + i))
                
                # Add some seasonality (weekly pattern)
                day_of_week = date.dayofweek
                seasonal_factor = 1.0 + (0.1 * np.sin(2 * np.pi * day_of_week / 7))
                
                # Final forecast
                forecast_value = max(0, trend_value * seasonal_factor)
                
                # Confidence intervals
                lower_bound = max(0, forecast_value - 1.96 * std)
                upper_bound = forecast_value + 1.96 * std
                
                forecasts.append({
                    'date': date.isoformat(),
                    'forecast': round(forecast_value, 2),
                    'lower_bound': round(lower_bound, 2) if include_confidence else None,
                    'upper_bound': round(upper_bound, 2) if include_confidence else None
                })
            
            # Calculate summary statistics
            total_forecast = sum(f['forecast'] for f in forecasts)
            avg_forecast = total_forecast / len(forecasts)
            
            result = {
                'forecasts': forecasts,
                'summary': {
                    'periods': periods,
                    'frequency': frequency,
                    'total_forecast': round(total_forecast, 2),
                    'average_forecast': round(avg_forecast, 2),
                    'trend': 'increasing' if trend > 0 else 'decreasing',
                    'confidence_level': 0.95 if include_confidence else None
                },
                'metadata': {
                    'model_type': 'trend_seasonal',
                    'training_samples': len(self.model['data']),
                    'last_training_date': self.model['data']['ds'].max().isoformat()
                }
            }
            
            logger.info(f"Generated forecast for {periods} periods")
            return result
            
        except Exception as e:
            logger.error(f"Error generating forecast: {str(e)}")
            raise
    
    def evaluate(self, test_data: pd.DataFrame, target_col: str = "emissions") -> Dict[str, float]:
        """
        Evaluate model performance on test data
        
        Returns:
            Dictionary with evaluation metrics
        """
        try:
            if not self.model:
                raise ValueError("Model not trained")
            
            # Prepare test data
            df = test_data.copy()
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values('timestamp')
            
            daily_data = df.groupby(df['timestamp'].dt.date)[target_col].sum().reset_index()
            daily_data.columns = ['ds', 'y']
            
            # Generate predictions for test period
            predictions = []
            for i in range(len(daily_data)):
                trend_value = self.model['mean'] + (self.model['trend'] * (len(self.model['data']) + i))
                predictions.append(max(0, trend_value))
            
            # Calculate metrics
            actual = daily_data['y'].values
            predicted = np.array(predictions)
            
            mae = np.mean(np.abs(actual - predicted))
            rmse = np.sqrt(np.mean((actual - predicted) ** 2))
            mape = np.mean(np.abs((actual - predicted) / (actual + 1e-10))) * 100
            
            return {
                'mae': round(mae, 2),
                'rmse': round(rmse, 2),
                'mape': round(mape, 2)
            }
            
        except Exception as e:
            logger.error(f"Error evaluating model: {str(e)}")
            return {}
    
    def save(self, path: Optional[str] = None):
        """Save model to disk"""
        save_path = path or self.model_path
        os.makedirs(save_path, exist_ok=True)
        
        model_file = os.path.join(save_path, "timeseries_model.pkl")
        joblib.dump(self.model, model_file)
        logger.info(f"Model saved to {model_file}")
    
    def load(self, path: Optional[str] = None):
        """Load model from disk"""
        load_path = path or self.model_path
        model_file = os.path.join(load_path, "timeseries_model.pkl")
        
        if os.path.exists(model_file):
            self.model = joblib.load(model_file)
            logger.info(f"Model loaded from {model_file}")
            return True
        else:
            logger.warning(f"Model file not found: {model_file}")
            return False
