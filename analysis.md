# Analysis Report: CPR0002783 - Trace Long-term Unavailable Products

## Overview
This analysis covers the implementation of a tracing mechanism for long-term unavailable products (Long Term Lack - LTL) within the CSC (Core Service Components) system. The project focuses on extending existing German (DE) logic to the French (FR) market to prevent delivery failures, following a major incident on July 1, 2025.

## CPR Description (CPR0002783)
- **Goal**: Prevent products marked as long-term unavailable from being used for subsequent delivery positions.
- **Context**: An automatic process for handling long-term unavailable products exists for Germany and needs tailoring for France.
- **Specifics**: 
  - Verification of existing `cscservice` logic for tracking unavailable products.
  - Updating outbound core applications to recognize and process FR branch data.
  - Tailoring article inclusion criteria to meet French-specific supply chain requirements.
- **Key Contacts**: Björn Bischof (Incident details), PINT department (Data flow), Citrix/Windows teams (Frontend impact).

## Source Code Analysis
The codebase is a multi-tier enterprise application using C++ for core services and C# for batch utilities.

### Long Term Lack (LTL) Implementation
- **Core Repository**: `libcsc/stockbooking/longtermlack/longtermlackrepository.cpp` manages the LTL state check.
- **Database Layer**: `longtermlack` table in the Informix/PostgreSQL database stores flagged articles.
- **Validation Points**:
  - `pxverbund/libsrc/itmstock.cpp`: Core stock check logic.
  - `pxverbund/libsrc/pxstockbulkinquiry.cpp`: Bulk inquiry filtering.
  - `OrderHandler` / `MSV3Handler`: Thrift services for propagating LTL status.

### France-Specific Adaptations
Based on technical analysis from team members (Colleague 01 and Colleague 02):
- **Branch Logic**: The logic must be updated to include French branch codes (e.g., branch-specific stock status) when evaluating unavailability.
- **Automated Filtering**: Implementation of service-level filters in the outbound delivery position generation logic to query the `cscservice` unavailability table for FR branch orders.
- **Criteria**: FR-specific article criteria (stock thresholds/timeframes) must be defined and integrated into the `longtermlack` table population routines.

## Full Template Analysis
- **Architecture**: Modular services communicating via Apache Thrift.
- **System Impact**: 
  - **Package**: `pharmos.outbound.csc_core_applications`
  - **Dependencies**: PINT for data integrity, Citrix/Windows for frontend visibility.
- **Process Flow**: Order Import -> Validation -> LTL Check (FR specific) -> Delivery Position Generation.

## Conclusion & Next Steps
The implementation of CPR0002783 for France requires extending the `pxdb` query logic to support FR branch filtering and ensuring the `cscservice` unavailability table is correctly cross-referenced during delivery position creation.

### Actions:
1.  Finalize FR article criteria for LTL status.
2.  Update C++ stock booking routines to enforce FR branch checks.
3.  Coordinate with PINT for database schema alignment if required for FR-specific metadata.
