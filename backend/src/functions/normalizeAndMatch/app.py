import os
import json
import hashlib
import uuid
import re
from datetime import datetime, timezone, timedelta
import difflib
import boto3
from boto3.dynamodb.conditions import Key, Attr

# Initialize DynamoDB Client
JOBS_TABLE = os.environ.get("JOBS_TABLE")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(JOBS_TABLE) if JOBS_TABLE else None

def normalize_title(title: str) -> str:
    if not title:
        return ""
    # Convert to lowercase
    cleaned = title.lower()
    # Strip bracketed/parenthesized content
    cleaned = re.sub(r"\[.*?\]|\(.*?\)", "", cleaned)
    # Clean separators and noise characters
    cleaned = re.sub(r"[-/|:,_]", " ", cleaned)
    # Clean level adjectives / noise words
    noise_words = [
        r"\bsenior\b", r"\bjunior\b", r"\bfresher\b", r"\binternship\b", r"\bintern\b",
        r"\blead\b", r"\bprincipal\b", r"\bstaff\b", r"\bmid\b", r"\bentry\b", r"\blevel\b",
        r"\bhcm\b", r"\bhn\b", r"\bhanoi\b", r"\bdanang\b", r"\bvietnam\b", r"\bvn\b", r"\bcity\b",
        r"\btuyển dụng\b", r"\bviệc làm\b", r"\btuyển\b", r"\bgấp\b"
    ]
    for noise in noise_words:
        cleaned = re.sub(noise, "", cleaned)
    
    # Standardize developer/engineer synonyms
    cleaned = re.sub(r"\bback-end\b", "backend", cleaned)
    cleaned = re.sub(r"\bfront-end\b", "frontend", cleaned)
    cleaned = re.sub(r"\bsoftware developer\b|\bsoftware engineer\b|\bdeveloper\b|\bengineer\b|\bdev\b", "developer", cleaned)
    
    # Strip extra whitespaces
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

def normalize_posted_at(posted_at_str: str) -> str:
    now = datetime.now(timezone.utc)
    if not posted_at_str:
        return now.strftime("%Y-%m-%d")
    
    cleaned = posted_at_str.lower().strip()
    
    # Check for today, yesterday, hours/minutes/seconds ago
    if any(word in cleaned for word in ["hôm nay", "vừa xong", "mới", "hour", "giờ", "minute", "phút", "giây", "second"]):
        return now.strftime("%Y-%m-%d")
    if "hôm qua" in cleaned or "yesterday" in cleaned:
        return (now - timedelta(days=1)).strftime("%Y-%m-%d")
        
    # Extract number
    match = re.search(r"(\d+)", cleaned)
    if not match:
        return now.strftime("%Y-%m-%d")
    
    num = int(match.group(1))
    
    # Check units
    if "ngày" in cleaned or "day" in cleaned:
        days = num
    elif "tuần" in cleaned or "week" in cleaned:
        days = num * 7
    elif "tháng" in cleaned or "month" in cleaned:
        days = num * 30
    else:
        days = num
        
    est_date = now - timedelta(days=days)
    return est_date.strftime("%Y-%m-%d")

def lambda_handler(event, context):
    print("Received raw event:", json.dumps(event))
    
    if not table:
        raise ValueError("JOBS_TABLE environment variable not configured or table initialization failed")
    
    # 1. Extract required information
    original_title = event.get("title") or event.get("job_title", "")
    company_name = event.get("company_name", "")
    location = event.get("location", "")
    
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
    
    # 2. Normalization
    normalized_title = normalize_title(original_title)
    normalized_posted_at = normalize_posted_at(original_posted_at)
    
    # 3. Deduplication Pipeline
    # Step 1: Hashing
    combined_string = f"{normalized_title}+{company_name}+{location}"
    hash_object = hashlib.sha256(combined_string.encode("utf-8"))
    sha256_hash = hash_object.hexdigest()
    
    # Query DynamoDB using the HashIndex GSI
    print(f"Checking hash uniqueness: {sha256_hash}")
    hash_query = table.query(
        IndexName="HashIndex",
        KeyConditionExpression=Key("hash").eq(sha256_hash)
    )
    
    if hash_query.get("Items"):
        print("Duplicate detected (exact hash match). Rejecting.")
        return {
            "status": "duplicate",
            "reason": "exact_hash_match",
            "hash": sha256_hash
        }
        
    # Step 2: Fuzzy Matching
    # Scan based on company_name to find candidates for comparison
    print(f"Scanning table for candidates with company: {company_name}")
    scan_response = table.scan(
        FilterExpression=Attr("companyName").eq(company_name)
    )
    candidates = scan_response.get("Items", [])
    
    new_match_str = f"{normalized_title} {company_name} {location}".lower()
    
    for candidate in candidates:
        candidate_title = candidate.get("title", "")
        candidate_company = candidate.get("companyName", "")
        candidate_location = candidate.get("location", "")
        
        cand_match_str = f"{candidate_title} {candidate_company} {candidate_location}".lower()
        
        similarity = difflib.SequenceMatcher(None, new_match_str, cand_match_str).ratio()
        print(f"Comparing with job {candidate.get('jobId')}. Similarity: {similarity:.2f}")
        
        if similarity > 0.8:
            print(f"Duplicate detected (fuzzy match similarity {similarity:.2f} > 0.8). Rejecting.")
            return {
                "status": "duplicate",
                "reason": "fuzzy_match",
                "similarity": similarity,
                "matched_job_id": candidate.get("jobId")
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
        "createdAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    }
    
    print(f"Inserting new job: {job_id}")
    table.put_item(Item=new_job)
    
    return {
        "status": "inserted",
        "jobId": job_id,
        "hash": sha256_hash
    }
