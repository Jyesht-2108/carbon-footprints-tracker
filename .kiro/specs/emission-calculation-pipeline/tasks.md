# Implementation Plan

- [ ] 1. Create emission factors configuration
  - Create `plugins/data-core/src/utils/emission_factors.py` with emission factor lookup table
  - Define emission factors for all vehicle/fuel combinations
  - Include default emission factor for unknown combinations
  - Add load factor adjustment formula
  - _Requirements: 2.1, 2.2, 2.5_

- [ ] 1.1 Write property test for emission factors validation
  - **Property 10: Non-negative emissions**
  - **Validates: Requirements 5.3**

- [ ] 2. Implement EmissionCalculator component
  - Create `plugins/data-core/src/processing/emission_calculator.py`
  - Implement `calculate_emission()` method for single event
  - Implement `calculate_emissions_batch()` method for multiple events
  - Implement `get_emission_factor()` method with vehicle/fuel lookup
  - Apply load factor adjustment to base emission factor
  - Handle unknown vehicle/fuel types with default factor
  - _Requirements: 1.2, 2.3, 2.4, 2.5_

- [ ] 2.1 Write property test for correct emission factor application
  - **Property 2: Correct emission factor application**
  - **Validates: Requirements 1.2**

- [ ] 2.2 Write property test for load weight impact
  - **Property 5: Load weight impact**
  - **Validates: Requirements 2.3**

- [ ] 2.3 Write property test for distance scaling
  - **Property 6: Distance scaling**
  - **Validates: Requirements 2.4**

- [ ] 2.4 Write property test for unknown vehicle/fuel handling
  - **Property 7: Unknown vehicle/fuel handling**
  - **Validates: Requirements 2.5**

- [ ] 2.5 Write unit tests for EmissionCalculator
  - Test diesel truck emission calculation with known values
  - Test electric vehicle emission calculation
  - Test zero distance returns zero emissions
  - Test negative values are rejected
  - _Requirements: 2.1, 2.2, 5.4, 5.5_

- [ ] 3. Create emissions database table
  - Create SQL migration file for emissions table schema
  - Add indexes for supplier_id, event_type, timestamp
  - Add foreign key constraint to events_normalized
  - Add unique constraint on event_id
  - Run migration on development database
  - _Requirements: 1.3, 4.1_

- [ ] 4. Extend Supabase client for emissions
  - Add `insert_emission()` method to SupabaseClient
  - Add `insert_emissions_batch()` method for bulk inserts
  - Add `get_emissions_by_supplier()` method with date filtering
  - Add `get_emissions_aggregated()` method for grouping
  - Add error handling for duplicate event_id
  - _Requirements: 1.3, 4.1, 4.4, 6.1, 6.2, 6.3, 6.4_

- [ ] 4.1 Write property test for event reference integrity
  - **Property 3: Event reference integrity**
  - **Validates: Requirements 1.3**

- [ ] 4.2 Write property test for immediate queryability
  - **Property 8: Immediate queryability**
  - **Validates: Requirements 4.1**

- [ ] 4.3 Write property test for aggregation correctness
  - **Property 9: Aggregation correctness**
  - **Validates: Requirements 4.4**

- [ ] 4.4 Write unit tests for Supabase client emissions methods
  - Test single emission insertion
  - Test bulk emission insertion
  - Test query by supplier with date range
  - Test aggregation by vehicle type
  - Test aggregation by fuel type
  - _Requirements: 1.3, 4.1, 4.4, 6.1, 6.2_

- [ ] 5. Integrate emission calculation into CSV upload flow
  - Modify `/ingest/upload` endpoint in `routes.py`
  - Call `EmissionCalculator.calculate_emissions_batch()` after normalization
  - Process emissions in chunks of 100 events
  - Use `insert_emissions_batch()` for database insertion
  - Add error handling to continue on individual failures
  - Update response to include emission summary
  - _Requirements: 1.1, 1.4, 1.5, 3.3_

- [ ] 5.1 Write property test for emission calculation completeness
  - **Property 1: Emission calculation completeness**
  - **Validates: Requirements 1.1**

- [ ] 5.2 Write property test for error resilience
  - **Property 4: Error resilience**
  - **Validates: Requirements 1.4**

- [ ] 5.3 Write property test for response completeness
  - **Property 12: Response completeness**
  - **Validates: Requirements 1.5, 6.5**

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Add emission query API endpoints
  - Add `GET /emissions/{supplier_id}` endpoint
  - Add `GET /emissions/aggregate/{group_by}` endpoint
  - Add `GET /emissions/total` endpoint
  - Add date range filtering support (start_date, end_date query params)
  - Add input validation for group_by parameter
  - Return proper error responses for invalid inputs
  - _Requirements: 4.2, 4.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7.1 Write unit tests for emission API endpoints
  - Test GET /emissions/{supplier_id} returns correct data
  - Test GET /emissions/aggregate/vehicle_type returns correct structure
  - Test date range filtering works correctly
  - Test invalid parameters return 400 errors
  - _Requirements: 4.2, 4.4_

- [ ] 8. Add input validation and error handling
  - Validate distance and load are within reasonable ranges
  - Validate emission factors are positive numbers
  - Add logging for calculation errors
  - Add logging for unknown vehicle/fuel types
  - Add performance warning for calculations > 60 seconds
  - _Requirements: 5.1, 5.2, 1.4, 3.4_

- [ ] 8.1 Write property test for input validation
  - **Property 11: Input validation**
  - **Validates: Requirements 5.2**

- [ ] 9. Add configuration and environment variables
  - Add ENABLE_EMISSION_CALCULATION environment variable
  - Add EMISSION_CALCULATION_BATCH_SIZE environment variable
  - Add EMISSION_CALCULATION_TIMEOUT environment variable
  - Add DEFAULT_EMISSION_FACTOR environment variable
  - Update .env.example with new variables
  - _Requirements: 3.3_

- [ ] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Create integration tests
  - Test complete CSV upload → emission calculation → API query flow
  - Test emission data is available for ML Engine
  - Test emission data is available for Orchestration Engine
  - Test multiple CSV uploads produce correct aggregations
  - _Requirements: 4.2, 4.3_

- [ ] 12. Add documentation
  - Document emission factor sources and methodology
  - Document API endpoints with examples
  - Document configuration options
  - Add troubleshooting guide
  - _Requirements: All_
