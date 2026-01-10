# Architectural & Implementation Design: CPR0002783

## 1. Existing Implementation (DE Logic)

The current system implements Long Term Lack (LTL) checks primarily for the German (DE) branch. The architecture relies on a repository pattern to query a dedicated database table.

### Design Pattern: Repository & Strategy
- **Repository**: `LongTermLackRepository` handles the abstraction of the LTL database state.
- **Checker**: `ILongTermLackChecker` interface is used by stock booking services.

### Code Evidence (Before CPR)
**Repository Check (`libcsc/stockbooking/longtermlack/longtermlackrepository.cpp`):**
```cpp
bool LongTermLackRepository::isLongTermLack( const basar::Int32 articleNo ) const {
    // Queries the 'longtermlack' table for the given article
    basar::db::sql::ResultsetRef resultset = 
        m_CheckerLongTermLackAccessor->select(LongTermLackSQLMapper::getSelectSQL(), ...);
    return numberOfLacks > 0;
}
```

**Stock Validation (`pxverbund/libsrc/itmstock.cpp`):**
```cpp
// Existing logic often assumes a global or DE-specific context
if (RestrictionType_LongTermLackCheck == 3) {
    if (ltlRepo->isLongTermLack(item.articleNo)) {
        // Block delivery position
    }
}
```

---

## 2. Post-CPR Implementation (FR Integration)

The new design extends the LTL check to be **branch-aware**, allowing France (FR) to have its own criteria and exclusion logic.

### Design Evolution: Context-Aware Filtering
The `isLongTermLack` method will be overloaded or updated to accept a `branchCode` or `countryCode`, allowing the repository to filter the `longtermlack` table by region.

### Proposed Code Evidence (After CPR)

**Updated Repository Check (`longtermlackrepository.cpp`):**
```cpp
// Enhanced to support branch-specific lookups
bool LongTermLackRepository::isLongTermLack(const basar::Int32 articleNo, const basar::Int16 branchCode) const {
    // Updated SQL to: SELECT count(*) FROM longtermlack WHERE articleno = ? AND (branch = ? OR global = 1)
    basar::db::sql::ResultsetRef resultset = 
        m_CheckerLongTermLackAccessor->select(LongTermLackSQLMapper::getSelectSQL(branchCode), ...);
    return numberOfLacks > 0;
}
```

**Adaptive Stock Validation (`itmstock.cpp`):**
```cpp
// Logic adapted for France specifics
if (isFrance(currentBranch)) {
    // Apply FR specific criteria (e.g., different stock thresholds)
    if (ltlRepo->isLongTermLack(item.articleNo, currentBranch)) {
        logIncidentReference("01.07.2025");
        return Status_Unavailable;
    }
} else {
    // Fallback to standard DE logic
    if (ltlRepo->isLongTermLack(item.articleNo)) {
        return Status_Unavailable;
    }
}
```

---

## 3. Data Model Changes
- **Table `longtermlack`**: Add `branch_code` (nullable) or `country_iso` column to distinguish between DE and FR entries.
- **Criteria Engine**: A new configuration layer (potentially in `kscserver`) to define what qualifies an article for LTL in France (e.g., "Out of stock for > 14 days").

## 4. Summary of Changes
| Feature | Before CPR (DE) | After CPR (FR Integration) |
| :--- | :--- | :--- |
| **Scope** | Hardcoded or implicit DE | Explicit Branch/Country aware |
| **Filtering** | Global article check | Branch-specific exclusion |
| **Incident Response** | N/A | Targeted fix for 01.07.2025 |
| **Code Structure** | Simple Repository | Contextual Repository with Branch Context |
