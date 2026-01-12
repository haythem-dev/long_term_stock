# Investigation Report: Empty longtermlack Table in France

## 1. The Observation
You noted that `SELECT * FROM longtermlack` returns hundreds of rows in Germany (DE) but 0 rows in France (FR). 

## 2. The Reason: Population vs. Filtering
This confirms that the issue isn't just a "precision" problem in the code—it's a **data population** problem. The table is empty in France because the **`longtermlackloader`** job is likely not active or not configured with French-specific criteria.

### **Why it's empty in France:**
*   **Job Inactivity**: The batch process that identifies unavailable products (based on stock, PZN, and activation tags) is either not running for the French server or is failing due to missing configuration.
*   **Generic logic**: As you suspected, if the loader is running the exact same code as Germany without the "FR" parameters, it might be looking for German-style stock indicators that don't exist in the French database, resulting in 0 matches.

## 3. The Relationship to the Code Change
Even if we "fix" the loader to fill the table, the **`cscservice`** (the binary you asked about) still needs the code changes I prepared. 
*   **Without the code change**: Even if the table has data, `cscservice` will treat it globally, which leads to the "Incident 01.07.2025" where products are blocked incorrectly across branches.
*   **With the code change**: `cscservice` will be able to handle the French data correctly once the loader starts populating it.

## 4. Conclusion
The empty table in France is a "population" issue (Loader/Config), while the requirement for the CPR is a "processing" issue (cscservice logic). Both need to be aligned for the France integration to work.

**Recommendation**: Ensure the `longtermlackloader` job is scheduled for the French server with the correct `.vars.fr` parameters to begin populating the table.
