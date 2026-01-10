# Required SQL Information for CPR0002783

To implement and verify the France (FR) integration for long-term unavailable products, I need the following information from your Informix servers:

## 1. Table Schema: `longtermlack`
This is the primary table for tracking unavailable articles. I need the output of:
```sql
-- Informix syntax
INFO COLUMNS FOR longtermlack;
-- OR
SELECT * FROM systables WHERE tabname = 'longtermlack';
SELECT * FROM syscolumns WHERE tabid = (SELECT tabid FROM systables WHERE tabname = 'longtermlack');
```
**Goal**: Check if `branch_code` or `country_code` columns already exist or need to be added.

## 2. Sample Data: `longtermlack`
A few rows of data from both DE and potentially existing FR records:
```sql
SELECT FIRST 10 * FROM longtermlack;
```

## 3. Article Metadata: `rartikel`
The article master table. I need to understand how branch/country information is associated with articles:
```sql
INFO COLUMNS FOR rartikel;
SELECT FIRST 5 * FROM rartikel;
```

## 4. Branch Configuration: `tfiliale`
To understand how France branches are identified:
```sql
SELECT * FROM tfiliale WHERE land = 'FR'; -- Assuming 'land' is the country column
```

## 5. Order Position Table: `tkdauftragpos`
To see how the unavailability check impacts the delivery positions:
```sql
INFO COLUMNS FOR tkdauftragpos;
```

---
**Note**: Please provide the output as text files or screenshots. This will allow me to finalize the SQL mapping in `longtermlacksqlmapper.cpp` and the business logic in `itmstock.cpp`.
