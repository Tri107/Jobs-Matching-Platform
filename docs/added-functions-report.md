# Added Functions Report

This document reports the new Lambda functions added to the **AI Jobs Matching Platform** backend to handle job ingestion processing, normalization, and deduplication.

---

## 1. ProcessJobsFunction (TypeScript)

- **Entrypoint File**: `src/functions/processJobs/handler.ts`
- **Runtime**: Node.js 24.x (Global default)
- **Trigger**: AWS SQS (`RawJobsQueue`) with a `BatchSize` of 10.
- **Role**: SQS Message Consumer.
- **Workflow**:
  1. Triggered automatically by SQS events.
  2. Loops through the event batch records.
  3. Extracts the raw job JSON string from each SQS message body.
  4. Invokes the `NormalizeAndMatchFunction` (Python) synchronously passing the raw job payload.
  5. Monitors execution success/failure. If the Python function throws an error, the consumer throws an error to force SQS retry or dead-letter queue (DLQ) redrive.

---

## 2. NormalizeAndMatchFunction (Python)

- **Entrypoint File**: `src/functions/normalizeAndMatch/app.py`
- **Runtime**: Python 3.13 (Overridden)
- **Role**: Job Normalizer & Deduplication Processor.
- **Workflow**:
  1. **Data Extraction**: Reads job attributes (`title`, `company_name`, `location`, `posted_at`, `schedule_type`, `source_link`, `description`).
  2. **Title Normalization**:
     - Strips location tags, brackets, and parenthesized text (`[HCM]`, `(Junior)`, `(.NET)`).
     - Cleans special separators and trims extra whitespaces.
     - Strips level adjectives and noise terms (`senior`, `junior`, `fresher`, `intern`, `tuyển`, `gấp`, `hn`, `hcm`, etc.).
     - Standardizes synonyms (e.g. `back-end` -> `backend`, `engineer` -> `developer`).
  3. **Posted Date Normalization**:
     - Analyzes English and Vietnamese relative dates (e.g., `"4 ngày trước"`, `"yesterday"`).
     - Subtracts calculated duration from current UTC time to return an exact date string in `YYYY-MM-DD` format.
  4. **Deduplication Step 1: Hashing**:
     - Computes SHA-256 hash of `title+company_name+location` string.
     - Queries DynamoDB `JobsTable` using GSI `HashIndex` for this hash value.
     - Rejects immediately if an exact hash match exists.
  5. **Deduplication Step 2: Fuzzy Matching**:
     - Scans DynamoDB `JobsTable` with a `FilterExpression` on `companyName` to get candidates from the same employer.
     - Evaluates text similarity of `title + company_name + location` using `difflib.SequenceMatcher`.
     - Rejects job if similarity score exceeds `80%` (`> 0.8`).
  6. **Insert**: Writes the unique, normalized job record into DynamoDB `JobsTable` with generated UUID (`jobId`).
