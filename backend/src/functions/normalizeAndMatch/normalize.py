import re
from datetime import datetime, timezone, timedelta

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
