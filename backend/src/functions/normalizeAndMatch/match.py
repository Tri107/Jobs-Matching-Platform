import difflib
from repository import JobRepository

def check_exact_duplicate(sha256_hash: str, repository: JobRepository) -> bool:
    items = repository.find_by_hash(sha256_hash)
    return len(items) > 0

def check_fuzzy_duplicate(normalized_title: str, company_name: str, location: str, repository: JobRepository) -> dict:
    candidates = repository.find_by_company(company_name)
    
    new_match_str = f"{normalized_title} {company_name} {location}".lower()
    
    for candidate in candidates:
        candidate_title = candidate.get("title", "")
        candidate_company = candidate.get("companyName", "")
        candidate_location = candidate.get("location", "")
        
        cand_match_str = f"{candidate_title} {candidate_company} {candidate_location}".lower()
        
        similarity = difflib.SequenceMatcher(None, new_match_str, cand_match_str).ratio()
        
        if similarity > 0.8:
            return {
                "is_duplicate": True,
                "similarity": similarity,
                "matched_job_id": candidate.get("jobId")
            }
            
    return {
        "is_duplicate": False
    }
