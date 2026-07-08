import json
import re

def parse_log(log_content: str, filename: str = None) -> dict:
    """
    Parses a log file (txt, json, or csv) and extracts basic security event details:
    timestamp, event_id, message, source_ip.
    """
    # Initialize default result
    result = {
        "timestamp": "2026-07-03T12:00:00Z",
        "event_id": "SEC-1001",
        "message": "Sample log event parsed",
        "source_ip": "192.168.1.10"
    }
    
    # Try parsing as JSON
    if filename and filename.endswith('.json'):
        try:
            data = json.loads(log_content)
            if isinstance(data, dict):
                result["timestamp"] = data.get("timestamp", result["timestamp"])
                result["event_id"] = str(data.get("event_id", data.get("id", result["event_id"])))
                result["message"] = data.get("message", data.get("description", result["message"]))
                result["source_ip"] = data.get("source_ip", data.get("ip", result["source_ip"]))
            return result
        except Exception:
            pass
            
    # Simple parsing logic for txt / csv logs
    if log_content:
        # Search for IP address
        ip_match = re.search(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', log_content)
        if ip_match:
            result["source_ip"] = ip_match.group(0)
            
        # Search for ISO/simple timestamp
        ts_match = re.search(r'\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}', log_content)
        if ts_match:
            result["timestamp"] = ts_match.group(0)
            
        # Message summary
        cleaned_content = log_content.strip()
        if len(cleaned_content) > 100:
            result["message"] = cleaned_content[:100] + "..."
        else:
            result["message"] = cleaned_content
            
    return result
