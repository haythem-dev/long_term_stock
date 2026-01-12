# Justification Report: France Integration Issue (CPR0002783)

## 1. Analysis of the Same Codebase
The comparison between the German (DE) and French (FR) server configurations confirms that the `cscservice` binary is identical and uses the same core logic. The issue with France is not a bug in the shared code, but a **lack of branch-aware specialization** in the unavailability tracking logic.

## 2. Parameter Comparison (`cscservice.vars`)
The diff between `under server de/vars/cscservice.vars` and `under server fr/vars/cscservice.vars` reveals:
*   **DE Server**: Defaults to `PORTNR=56001` (CSC Service DE Nord).
*   **FR Server**: Defaults to `PORTNR=56121` (CSC Service FR).
*   **ADDITIONAL_PARA**: Both are currently empty (`""`).

**Finding**: There are no job launch parameters currently being used to differentiate the French unavailability criteria. The code is running as a "global" check on both servers.

## 3. Why the Current Code Fails for France
The current C++ implementation in `itmstock.cpp` and `LongTermLackRepository` queries the `longtermlack` table globally. 
*   **Germany**: Operates as a single logical entity where a global unavailability list is acceptable.
*   **France**: Requires a **branch-specific exclusion** (due to regional stock differences and the 01.07.2025 incident). 

Because the code does not check the `session.getCountryCode()` or filter by branch, any product flagged on the French server is treated the same as it would be in Germany, failing to account for the tailored French criteria (PZN, specific activation tags).

## 4. Justification for Code Changes vs Parameters
While parameters could theoretically toggle the feature, the **logical extension** (branch-specific filtering) requires code modifications in the SQL mapping layer.
1.  **SQL Layer**: The query must be updated to handle branch/country context.
2.  **Logic Layer**: `itmstock.cpp` must be explicitly branched to handle the France-specific "Incident 01.07.2025" logic.

## 5. Conclusion
The issue is justified: the shared codebase is "generic" but lacks the necessary **country-aware branching** to handle France's unique requirements. The fix requires the code changes I have prepared in the `implementation/after` directory.
