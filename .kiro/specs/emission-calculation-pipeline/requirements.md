# Requirements Document

## Introduction

The carbon footprint tracking system currently uploads CSV data to the `events_normalized` table but does not calculate emissions. This feature will implement an automatic emission calculation pipeline that processes normalized events and calculates CO2 emissions based on vehicle type, fuel type, distance, and load. The calculated emissions will be stored in an `emissions` table and made available for ML predictions, hotspot detection, and dashboard visualization.

## Glossary

- **Data-Core Service**: The FastAPI service responsible for ingesting and normalizing supply chain event data
- **Emission Calculator**: A component that calculates CO2 emissions from normalized event data using emission factors
- **Emission Factor**: A coefficient that quantifies the emissions per unit of activity (e.g., kg CO2 per km for a diesel truck)
- **Normalized Event**: A validated and standardized event record stored in the `events_normalized` table
- **Emissions Table**: A database table storing calculated CO2 emissions for each event
- **ML Engine**: The machine learning service that generates predictions and detects anomalies
- **Orchestration Engine**: The service that coordinates analysis workflows across multiple services

## Requirements

### Requirement 1

**User Story:** As a supply chain manager, I want emissions to be calculated automatically when I upload CSV data, so that I can immediately see the carbon footprint of my operations.

#### Acceptance Criteria

1. WHEN a CSV file is uploaded and normalized THEN the Data-Core Service SHALL calculate CO2 emissions for each event
2. WHEN calculating emissions THEN the Data-Core Service SHALL use emission factors based on vehicle type and fuel type
3. WHEN emissions are calculated THEN the Data-Core Service SHALL store results in the emissions table with event references
4. WHEN emission calculation fails for an event THEN the Data-Core Service SHALL log the error and continue processing remaining events
5. WHEN all emissions are calculated THEN the Data-Core Service SHALL return a summary including total emissions and event count

### Requirement 2

**User Story:** As a data analyst, I want accurate emission calculations based on industry-standard factors, so that I can trust the carbon footprint data for reporting.

#### Acceptance Criteria

1. WHEN calculating emissions for diesel trucks THEN the Emission Calculator SHALL apply the diesel truck emission factor
2. WHEN calculating emissions for electric vehicles THEN the Emission Calculator SHALL apply the electric vehicle emission factor
3. WHEN calculating emissions THEN the Emission Calculator SHALL account for load weight in the calculation
4. WHEN calculating emissions THEN the Emission Calculator SHALL account for distance traveled in the calculation
5. WHEN an unknown vehicle or fuel type is encountered THEN the Emission Calculator SHALL use a default emission factor and flag the calculation

### Requirement 3

**User Story:** As a system administrator, I want emission calculations to be performant and scalable, so that large CSV uploads complete in reasonable time.

#### Acceptance Criteria

1. WHEN processing events THEN the Emission Calculator SHALL calculate emissions in batch operations
2. WHEN inserting emissions THEN the Data-Core Service SHALL use bulk insert operations
3. WHEN processing large files THEN the Data-Core Service SHALL process events in chunks of 100 records
4. WHEN emission calculation takes longer than 60 seconds THEN the Data-Core Service SHALL log a performance warning

### Requirement 4

**User Story:** As a developer, I want emission data to be immediately available after upload, so that downstream services can access it without delays.

#### Acceptance Criteria

1. WHEN emissions are calculated and stored THEN the emissions table SHALL be immediately queryable
2. WHEN the ML Engine requests emission data THEN the Data-Core Service SHALL provide emissions via API endpoint
3. WHEN the Orchestration Engine triggers analysis THEN the emissions data SHALL be available for hotspot detection
4. WHEN the dashboard requests emission data THEN the Data-Core Service SHALL return emissions grouped by supplier and time period

### Requirement 5

**User Story:** As a quality assurance engineer, I want emission calculations to be validated and tested, so that I can ensure accuracy and reliability.

#### Acceptance Criteria

1. WHEN emission factors are defined THEN the Emission Calculator SHALL validate they are positive numbers
2. WHEN calculating emissions THEN the Emission Calculator SHALL validate input values are within reasonable ranges
3. WHEN emissions are calculated THEN the result SHALL be a non-negative number
4. WHEN distance or load is zero THEN the Emission Calculator SHALL return zero emissions
5. WHEN distance or load is negative THEN the Emission Calculator SHALL reject the calculation and log an error

### Requirement 6

**User Story:** As a sustainability officer, I want to see emission breakdowns by vehicle type and fuel type, so that I can identify which transportation methods have the highest carbon footprint.

#### Acceptance Criteria

1. WHEN querying emissions THEN the Data-Core Service SHALL provide aggregations by vehicle type
2. WHEN querying emissions THEN the Data-Core Service SHALL provide aggregations by fuel type
3. WHEN querying emissions THEN the Data-Core Service SHALL provide aggregations by supplier
4. WHEN querying emissions THEN the Data-Core Service SHALL provide aggregations by time period
5. WHEN displaying aggregations THEN the Data-Core Service SHALL include total emissions and event counts
