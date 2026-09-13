# 📖 Data Dictionary & Mathematical Metrics Specification
**TransOrg AgentIQ Datathon — Track 1: FinTech & BFSI (UPI Fraud Ring & Merchant Analytics)**

---

## 1. Table Schemas & Column Dictionaries

### 1.1 `transactions` Table
The core UPI transaction ledger. Joined with customers and merchants.

| Column Name | Data Type | Source Field | Description & Normalization Strategy |
| :--- | :--- | :--- | :--- |
| `txn_id` | `TEXT` (PK) | `txn_id` | Unique transaction identifier. Deduplicated to prevent revenue inflation. |
| `timestamp_iso` | `TEXT` | `timestamp` | Standardized ISO 8601 timestamp (`YYYY-MM-DD HH:MM:SS`). Flexibly parsed from Unix epoch integers, ISO strings, and 12-hour AM/PM formats. |
| `txn_date` | `TEXT` | `timestamp` | Extracted calendar date (`YYYY-MM-DD`) for daily velocity aggregation. |
| `txn_hour` | `INTEGER` | `timestamp` | Extracted 24-hour component (0–23) for hourly failure heatmap analysis. |
| `txn_day_of_week` | `TEXT` | `timestamp` | Day of week string (`Monday`–`Sunday`). |
| `user_id` | `TEXT` (FK) | `user_id` | Canonicalized Customer ID (`USR#####`) formatted via `normalize_user_id()`. |
| `merchant_id` | `TEXT` (FK) | `merchant_id` | Canonicalized Merchant ID (`MCH####`) formatted via `normalize_merchant_id()`. |
| `amount_clean` | `REAL` | `amount` | Transaction value in INR. Stripped of currency prefixes (`Rs.`, `₹`, `INR`), commas, and cast to float. |
| `is_amount_valid` | `INTEGER` | Derived | Boolean flag (`1` = Valid positive numeric, `0` = Negative or unparseable amount). |
| `utr` | `TEXT` | `utr` | Unique Transaction Reference number from banking switch. |
| `is_utr_valid` | `INTEGER` | Derived | Boolean flag (`1` = Valid UTR $\ge 10$ chars without spaces, `0` = Missing or malformed). |
| `mcc_clean` | `TEXT` | `mcc` | Standardized 4-digit Merchant Category Code (stripped of `MCC-` prefix and leading zeros). |
| `status_clean` | `TEXT` | `status` | Standardized transaction status: `SUCCESS`, `FAILED`, `PENDING`. |
| `is_duplicate` | `INTEGER` | Derived | Boolean flag identifying if record was part of a duplicate attempt. |

---

### 1.2 `customers` Table
Customer identity and KYC master records.

| Column Name | Data Type | Source Field | Description & Normalization Strategy |
| :--- | :--- | :--- | :--- |
| `user_id` | `TEXT` (PK) | `user_id` | Canonical Customer ID (`USR#####`). Whitespace and prefixes normalized. |
| `full_name` | `TEXT` | `full_name` | Cleaned full name of customer. |
| `pan_clean` | `TEXT` | `pan` | Standardized PAN number. |
| `is_pan_valid` | `INTEGER` | Derived | Regex compliance validation against `^[A-Z]{5}[0-9]{4}[A-Z]{1}$` (`1` = Valid, `0` = Invalid format signal). |
| `aadhaar_clean` | `TEXT` | `aadhaar` | Stripped of spaces and hyphens. |
| `is_aadhaar_valid`| `INTEGER` | Derived | Validation check for exactly 12 numeric digits (`1` = Valid, `0` = Invalid). |
| `dob_clean` | `TEXT` | `date_of_birth` | Parsed date of birth in `YYYY-MM-DD` format (redundant time component stripped). |
| `age` | `INTEGER` | Derived | Calculated customer age in years relative to audit date. |
| `city_clean` | `TEXT` | `city` | Harmonized city name with aliases resolved (`Bombay` $\to$ `Mumbai`, `Calcutta` $\to$ `Kolkata`, etc.). |
| `state_clean` | `TEXT` | `state` | Standardized state name in Title Case. |
| `monthly_income_clean` | `REAL` | `monthly_income` | Parsed monthly income in INR (handles plain numbers, `₹11,214`, and shorthand multiplier `27.3k`). |
| `is_income_valid` | `INTEGER` | Derived | Boolean flag indicating valid non-negative income. |
| `occupation` | `TEXT` | `occupation` | Customer employment sector. |
| `signup_timestamp_iso` | `TEXT` | `signup_timestamp` | Standardized signup datetime in ISO format. |
| `kyc_status_clean` | `TEXT` | `kyc_status` | Harmonized status: `VERIFIED`, `PENDING`, `REJECTED`. |
| `risk_segment_clean` | `TEXT` | `risk_segment` | Harmonized risk tier: `LOW`, `MEDIUM`, `HIGH`, `UNKNOWN`. |

---

### 1.3 `merchants` Table
Merchant master metadata and risk indicators.

| Column Name | Data Type | Source Field | Description & Normalization Strategy |
| :--- | :--- | :--- | :--- |
| `merchant_id` | `TEXT` (PK) | `merchant_id` | Canonical Merchant ID (`MCH####`). Bare numbers prefixed and zero-padded. |
| `merchant_name_clean` | `TEXT` | `merchant_name` | Trimmed merchant business name with OCR artifacts corrected. |
| `mcc_clean` | `TEXT` | `mcc` | 4-digit standardized MCC. |
| `merchant_category_clean` | `TEXT` | `merchant_category` | Harmonized from 82 noisy strings into 9 standardized industry categories. |
| `business_type` | `TEXT` | `business_type` | Business registration type (e.g., Sole Proprietorship, Pvt Ltd). |
| `city` / `state` | `TEXT` | `city` / `state` | Cleaned geographic location. |
| `onboarding_date_clean` | `TEXT` | `onboarding_date` | Parsed onboarding date in `YYYY-MM-DD` format. |
| `settlement_account_clean`| `TEXT` | `settlement_account` | Banking account string (`NA`, `N/A`, `blank` standardized to `NULL`). |
| `has_settlement_account` | `INTEGER` | Derived | Boolean compliance flag (`1` = Present, `0` = Missing settlement account). |
| `merchant_status_clean` | `TEXT` | `merchant_status` | Standardized status: `ACTIVE`, `INACTIVE`. |
| `declared_avg_ticket_size_clean` | `REAL` | `declared_avg_ticket_size` | Cleaned declared ticket size in INR. |
| `is_declared_ticket_valid` | `INTEGER` | Derived | Validation flag (`1` = Positive valid number, `0` = Negative or invalid data entry). |

---

### 1.4 `chargebacks` Table
Disputes and customer complaints filed against UPI transactions.

| Column Name | Data Type | Source Field | Description & Normalization Strategy |
| :--- | :--- | :--- | :--- |
| `complaint_id` | `TEXT` (PK) | `complaint_id` | Unique dispute case identifier. |
| `txn_id` | `TEXT` (FK) | `txn_id` | Foreign key linking to disputed UPI transaction. |
| `user_id` | `TEXT` (FK) | `user_id` | Normalized complaining user ID (`USR#####`). |
| `merchant_id` | `TEXT` (FK) | `merchant_id` | Normalized disputed merchant ID (`MCH####`). |
| `transaction_timestamp_iso`| `TEXT` | `transaction_timestamp` | Standardized transaction timestamp. |
| `reported_timestamp_iso` | `TEXT` | `reported_timestamp` | Standardized dispute filing timestamp. |
| `bank_response_timestamp_iso`| `TEXT` | `bank_response_timestamp` | Standardized bank resolution timestamp. |
| `disputed_amount_clean` | `REAL` | `disputed_amount` | Disputed amount in INR (empty strings converted to `NULL`, currency stripped). |
| `is_disputed_amount_valid` | `INTEGER` | Derived | Boolean validation flag. |
| `reason_code_clean` | `TEXT` | `reason_code` | Normalized reason bucket: `FRAUD_ATO`, `NON_DELIVERY`, `DUPLICATE_DEBIT`, `WRONG_AMOUNT`, `SERVICE_ISSUE`, `CUSTOMER_DISPUTE_OTHER`. |
| `complaint_text` | `TEXT` | `complaint_text` | Raw customer complaint narrative. |
| `resolution_status_clean` | `TEXT` | `resolution_status` | Harmonized status: `OPEN`, `IN_PROGRESS`, `PENDING_BANK`, `RESOLVED`, `REJECTED`. |
| `severity_clean` | `TEXT` | `severity` | Normalized ordinal scale: `CRITICAL` (P1), `HIGH` (P2), `MEDIUM` (P3), `LOW` (P4). |
| `channel` | `TEXT` | `channel` | Ingestion channel (App, IVR, Call Center, Web). |
| `reporting_delay_days` | `REAL` | Derived | Computed dispute delay in days: $\frac{\text{reported\_ts} - \text{txn\_ts}}{86400}$. |
| `is_impossible_delay` | `INTEGER` | Derived | Data quality flag if dispute was logged before transaction ($\text{delay} < 0$). |
| `is_long_delay` | `INTEGER` | Derived | Boolean indicator if dispute filed after regulatory SLA threshold ($> 7\text{ days}$). |
| `delay_explanation` | `TEXT` | Derived | Plain-language AI explainability note explaining risk implications. |

---

## 2. Mathematical Metric Formulas

### 2.1 Portfolio Level KPIs
1. **Average Transaction Value (ATV)**:
   $$\text{ATV} = \frac{\sum_{i=1}^{N} \text{amount\_clean}_i}{N}$$
2. **Transaction Success Rate (%)**:
   $$\text{Success Rate} = \left( \frac{\sum \mathbb{I}(\text{status} = \text{'SUCCESS'})}{N} \right) \times 100$$
3. **Transaction Failure Rate (%)**:
   $$\text{Failure Rate} = \left( \frac{\sum \mathbb{I}(\text{status} = \text{'FAILED'})}{N} \right) \times 100$$
4. **Chargeback-to-Transaction Ratio (%)**:
   $$\text{CB Ratio} = \left( \frac{\text{Total Unique Disputes}}{\text{Total Unique Transactions}} \right) \times 100$$
5. **Disputed Volume Ratio (%)**:
   $$\text{Disputed Volume Ratio} = \left( \frac{\sum \text{disputed\_amount}}{\sum \text{amount\_clean}} \right) \times 100$$
6. **Average Dispute Reporting Delay (Days)**:
   $$\overline{\text{Delay}} = \frac{1}{M} \sum_{j=1}^{M} \max(0, \text{reporting\_delay\_days}_j)$$

---

### 2.2 Entity Risk Scoring Models

#### 1. Multi-Dimensional Merchant Risk Score ($0 \text{ to } 100$)
$$\text{MerchantRiskScore} = \min\left(100, W_1 \cdot \text{NormCB} + W_2 \cdot \text{NormVol} + W_3 \cdot \text{SettlementPenalty} + W_4 \cdot \text{TicketDiscrepancy}\right)$$
- **Weights**: $W_1 = 35\%$, $W_2 = 25\%$, $W_3 = 20\%$, $W_4 = 20\%$
- **Normalized Components**:
  - $\text{NormCB} = \min\left(1.0, \frac{\text{cb\_ratio\_pct}}{50.0}\right) \times 35$
  - $\text{NormVol} = \min\left(1.0, \frac{\text{dispute\_vol\_ratio\_pct}}{50.0}\right) \times 25$
  - $\text{SettlementPenalty} = (1 - \text{has\_settlement\_account}) \times 15 + \mathbb{I}(\text{status} = \text{'INACTIVE'}) \times 5$
  - $\text{TicketDiscrepancy} = \min\left(1.0, \frac{|\text{actual\_avg} - \text{declared\_ticket}|}{\text{declared\_ticket}}\right) \times 10 + \mathbb{I}(\text{fraud\_cbs} > 0) \times 10$

#### 2. Multi-Dimensional Customer Risk Score ($0 \text{ to } 100$)
$$\text{UserRiskScore} = \min\left(100, \text{DisputeScore} + \text{IdentityScore} + \text{KYCScore} + \text{BehavioralScore}\right)$$
- $\text{DisputeScore} = \min(35.0, \text{cb\_count} \times 15.0)$
- $\text{IdentityScore} = (1 - \text{is\_pan\_valid}) \times 15.0 + (1 - \text{is\_aadhaar\_valid}) \times 10.0$
- $\text{KYCScore} = \begin{cases} 0 & \text{if VERIFIED} \\ 10 & \text{if PENDING} \\ 20 & \text{if REJECTED} \end{cases} + \text{SegmentWeight}(\text{risk\_segment})$
- $\text{BehavioralScore} = \min(15.0, \text{missing\_utr\_txns} \times 5.0)$
