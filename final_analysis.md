# Final Technical Analysis: CPR0002783 - Trace Long-term Unavailable Products (DE/FR)

## 1. SQL Inspection Results

### Table: `longtermlack` (DE & FR)
The schema is identical on both servers:
- **articleno** (int)
- **messagecode** (int)
- **enabled** (smallint)

**Finding**: There is **no branch or country column** in the current `longtermlack` table. This confirms that the table is likely branch-independent within a specific server instance or represents a global unavailability list for that database.

### Table: `filiale` (Branch)
Both servers contain the `filiale` table with:
- **filialnr** (smallint)
- **name** (char)
- **regionno** (smallint)

### Table: `kdauftragpos` (Order Positions)
- **artikel_nr** (int)
- **codeblocage** (char) - *Potentially useful for French-specific blocking.*

## 2. Implementation Design for France

### Current Logic (DE)
The German implementation uses a global check on the `longtermlack` table. Since the table lacks a branch column, any entry in this table blocks the article for all branches on that server.

### Proposed Changes for France Integration
To meet the requirement of "tailoring criteria for France," we must implement one of the following:

#### Option A: Database Schema Extension (Recommended)
Add a `branch_code` column to the `longtermlack` table.
```sql
ALTER TABLE longtermlack ADD branch_code SMALLINT;
```
This allows the `LongTermLackRepository` to filter by the current order's branch.

#### Option B: Logic-Based Filtering (Application Level)
If schema changes are restricted, we can use the `messagecode` or a specific range of article numbers to differentiate between DE and FR unavailability rules within the existing table.

## 3. Code Adjustments

### `libcsc/stockbooking/longtermlack/longtermlacksqlmapper.cpp`
Update the `getSelectSQL` to include branch awareness:
```cpp
// After CPR Implementation
const basar::VarString LongTermLackSQLMapper::getSelectSQL(const basar::Int16 branchCode) {
    std::stringstream sql;
    sql << "SELECT count(*) AS " << s_NumberOfLacksColumn.c_str() 
        << " FROM longtermlack "
        << " WHERE articleno = ? AND (branch_code = " << branchCode << " OR branch_code IS NULL) AND enabled > 0;";
    return sql.str();
}
```

### `pxverbund/libsrc/itmstock.cpp`
Inject the current branch context into the LTL check:
```cpp
if (RestrictionType_LongTermLackCheck == 3) {
    if (ltlRepo->isLongTermLack(item.articleNo, currentBranchNo)) {
        // Apply France-specific incident logic (Ref: 01.07.2025)
        return Status_LongTermUnavailable;
    }
}
```

## 4. Conclusion
The SQL inspection confirms that the infrastructure is ready for the logic extension. The primary technical task is to transition the `longtermlack` check from a global article-based filter to a branch-aware filter, ensuring that the French branch can independently manage its unavailability criteria as requested by the CPR.
