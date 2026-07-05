import json
import hashlib
import uuid
from datetime import datetime, timezone

from repositories.jobRepository import JobRepository
from services.matchAndNormalizeService import (
    normalize_title,
    normalize_posted_at,
    check_exact_duplicate,
    check_fuzzy_duplicate
)

# Initialize repository globally to reuse DynamoDB client connection
try:
    repository = JobRepository()
except Exception as e:
    print(f"Warning: Repository initialization failed (likely local environment without environment variables): {e}")
    repository = None

def lambda_handler(event, context):
    print("Received raw event:", json.dumps(event))
    
    global repository
    if not repository:
        # Fallback reload just in case
        repository = JobRepository()

    # 1. Extract required information
    original_title = event.get("title") or event.get("job_title", "")
    company_name = event.get("company_name", "")
    location = event.get("location", "")
    
    if not original_title or not company_name:
        print("Warning: Missing required fields (title, company_name) in event payload. Rejecting.")
        return {
            "status": "rejected",
            "reason": "missing_required_fields",
            "received_fields": list(event.keys())
        }
    
    detected_extensions = event.get("detected_extensions", {})
    original_posted_at = detected_extensions.get("posted_at")
    original_schedule_type = detected_extensions.get("schedule_type")
    
    # Fallback to extensions list if detected_extensions is empty
    extensions = event.get("extensions", [])
    if not original_posted_at and len(extensions) > 0:
        original_posted_at = extensions[0]
    if not original_schedule_type and len(extensions) > 1:
        original_schedule_type = extensions[1]
        
    source_link = event.get("source_link", "")
    description = event.get("description", "")
    thumbnail = event.get("thumbnail") or ""
    
    # 2. Normalization
    normalized_title = normalize_title(original_title)
    normalized_posted_at = normalize_posted_at(original_posted_at)
    
    # 3. Deduplication Pipeline
    # Step 1: Hashing
    combined_string = f"{normalized_title}+{company_name}+{location}"
    hash_object = hashlib.sha256(combined_string.encode("utf-8"))
    sha256_hash = hash_object.hexdigest()
    
    # Check exact match
    print(f"Checking hash uniqueness: {sha256_hash}")
    if check_exact_duplicate(sha256_hash, repository):
        print("Duplicate detected (exact hash match). Rejecting.")
        return {
            "status": "duplicate",
            "reason": "exact_hash_match",
            "hash": sha256_hash
        }
        
    # Step 2: Fuzzy Matching
    print(f"Scanning table for candidates with company: {company_name}")
    fuzzy_result = check_fuzzy_duplicate(normalized_title, company_name, location, repository)
    if fuzzy_result.get("is_duplicate"):
        similarity = fuzzy_result.get("similarity")
        matched_job_id = fuzzy_result.get("matched_job_id")
        print(f"Duplicate detected (fuzzy match similarity {similarity:.2f} > 0.8). Rejecting.")
        return {
            "status": "duplicate",
            "reason": "fuzzy_match",
            "similarity": similarity,
            "matched_job_id": matched_job_id
        }
            
    # 4. Insert into DynamoDB
    job_id = str(uuid.uuid4())
    new_job = {
        "jobId": job_id,
        "hash": sha256_hash,
        "title": normalized_title,
        "originalTitle": original_title,
        "companyName": company_name,
        "location": location,
        "postedAt": normalized_posted_at,
        "originalPostedAt": original_posted_at,
        "scheduleType": original_schedule_type or "",
        "sourceLink": source_link,
        "description": description,
        "thumbnail": thumbnail,
        "createdAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    }
    
    print(f"Inserting new job: {job_id}")
    repository.insert(new_job)
    
    return {
        "status": "inserted",
        "jobId": job_id,
        "hash": sha256_hash
    }
