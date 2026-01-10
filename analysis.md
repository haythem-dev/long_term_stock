# Analysis Report: CPR0002783 - Trace Long-term Unavailable Products

## Overview
This analysis covers the transition and tracing of long-term unavailable products within the CSC (Core Service Components) system. The goal is to prevent these products from being used for subsequent delivery positions, ensuring better fulfillment reliability.

## CPR Description (CPR0002783)
- **Goal**: Implement and adapt tracing for products that are unavailable for extended periods (Long Term Lack - LTL).
- **Context**: An automatic process for handling long-term unavailable products exists for Germany (DE) and now needs to be adapted for France (FR).
- **Specifics**: 
  - Identification of criteria for "long term unavailable" articles in France.
  - Prevention of these articles from being included in new delivery positions.
  - Related to a major incident on July 1, 2025.
- **Key Contacts**: Björn Bischof for incident details and specific FR criteria.

## Source Code Analysis
The system uses a sophisticated C++ backend for core inventory and order logic.

### Long Term Lack (LTL) Logic
The core logic resides in `libcsc` and `pxverbund`:
- **Repository**: `libcsc/stockbooking/longtermlack/longtermlackrepository.cpp` handles the check `isLongTermLack(articleNo)`.
- **Database Table**: `longtermlack` (Informix/SQL) stores flagged articles.
- **Validation**: `pxverbund/libsrc/itmstock.cpp` contains the business logic for stock checks, specifically bypassing or enforcing LTL checks based on delivery types (`MaxDispo`, `MaxNachliefern`).
- **Thrift Handlers**: Services like `OrderHandler` and `MSV3Handler` propagate these flags to client applications.

### Country-Specific Adaptations (DE vs FR)
- **Current State**: Logic is "already established in Germany."
- **FR Requirements**: The "criteria for putting articles in this table" need to be tailored for France. This likely involves:
  - Modifying the batch/trigger that populates the `longtermlack` table.
  - Adding country/branch filters in the LTL check logic within `pxverbund`.
  - Updating `itmstock.cpp` or related order entry components (`pxoerestrictions.hpp`) to respect FR-specific business rules.

## Full Template Analysis
- **Architecture**: Micro-services architecture using Apache Thrift for RPC.
- **Persistence**: `pxdb` layer provides a C++ interface to an Informix/PostgreSQL database.
- **Order Flow**: Order Import (`ibtorderimport`) -> Validation (`kscserver`) -> Stock Booking (`pxverbund`) -> Order Closing (`aaorderclose`).
- **Tracing**: Long-term lack status is checked during order entry and stock reservation to prevent "ghost" orders for unavailable stock.

## Implementation Roadmap for France
1.  **Define FR Criteria**: Consult with stakeholders to determine the specific article attributes or stock thresholds that trigger LTL status in France.
2.  **Update Database/Logic**: 
    - Adjust `longtermlacksqlmapper.cpp` if new columns are needed.
    - Implement country-conditional logic in `itmstock.cpp` to apply the LTL check for FR branches.
3.  **Validation**: Test via `test_libcsc_stockbooking.cpp` by mocking FR-specific article states.

## Conclusion
Adapting CPR0002783 for France requires localized configuration of the LTL identification criteria while leveraging the existing robust C++ repository and checking framework.
