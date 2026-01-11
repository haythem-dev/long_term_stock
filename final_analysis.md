# Refined Technical Analysis: CPR0002783 - Trace Long-term Unavailable Products (DE/FR)

## 1. Integrated Findings (Colleague03 + SQL Inspection)

### 1.1 Data Model Verification
*   **Table `longtermlack`**: Confirmed on both DE and FR servers with columns `articleno`, `messagecode`, and `enabled`.
*   **Country Identifiers**: Colleague03's analysis identifies that `pxSession` already has constants for `COUNTRY_FRANCE` ("FR") and `COUNTRY_FRANCE_PREWHOLE` ("PF"). This is critical for triggering country-specific logic.
*   **Source Data**: Unavailability is determined by several "Preparers" (e.g., `ArticlesWithoutStockPreparer`, `PseudoArticlesPreparer`). These preparers populate the source table before it's moved into `longtermlack`.

### 1.2 France-Specific Logic
For the French market, the "tailored criteria" involve:
*   **PZN Management**: Specific handling of pharmaceutical identification numbers.
*   **Activation Tags**: Using `artikelaktiv` and `kzaktivpassiv` to determine long-term status.
*   **Incident Context (01.07.2025)**: The requirement is to ensure that products flagged via these French-specific tags are excluded from `tkdauftragpos` (Order Positions) during the delivery phase.

## 2. Refined Architecture

### 2.1 Branch-Aware Repository
The `LongTermLackRepository` must be updated to accept a country or branch context.
*   **Old Query**: `SELECT count(*) FROM longtermlack WHERE articleno = ? AND enabled > 0`
*   **New Query**: Should support a branch/country differentiator if we add a column, or use the `messagecode` as a proxy if schema changes are deferred.

### 2.2 Integration Point: `itmstock.cpp`
The core logic resides in `itmstock.cpp`. We will use the `pxSession` country code to apply France-specific unavailability rules.

```cpp
// Logic Refinement
if ( RestrictionType_LongTermLackCheck == 3 ) {
    const basar::VarString& countryCode = session.getCountryCode();
    if ( countryCode == pxSession::COUNTRY_FRANCE ) {
        // France-specific criteria (PZN, Activation Tags)
        if ( ltlRepo->isLongTermLackFR(item.articleNo) ) {
            return Status_LongTermUnavailable;
        }
    } else {
        // Default DE logic
        if ( ltlRepo->isLongTermLack(item.articleNo) ) {
            return Status_LongTermUnavailable;
        }
    }
}
```

## 3. Implementation Roadmap (Updated)

1.  **Repository Extension**: Update `LongTermLackSQLMapper` to include `branch_code` in the SELECT if the schema is updated, or implement `isLongTermLackFR` based on specific `messagecode` ranges.
2.  **Session Integration**: Leverage `pxSession::COUNTRY_FRANCE` to branch the logic in `itmstock.cpp`.
3.  **Data Flow**: Ensure the `LongTermLackInserter` (identified in colleague's analysis) correctly populates the French server's `longtermlack` table using the French-specific preparers.

## 4. Conclusion
The architecture is now solidified. We have identified the necessary session-level country checks and the database interaction points. The French implementation will run parallel to the German one, using the same table structure but with filtered logic triggered by the "FR" country code.
