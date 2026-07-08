import os
import re
import csv
import json
import logging
from io import StringIO

logger = logging.getLogger(__name__)

# Dictionary containing synonyms for standard fields
FIELD_MAPPINGS = {
    "timestamp": ["timestamp", "time", "@timestamp", "datetime", "DateTime", "date", "event_time", "EventTime"],
    "event_id": ["event_id", "eventId", "id", "EventID", "eventid", "Event ID"],
    "username": ["username", "user", "user_name", "AccountName", "account_name", "UserName", "account", "login"],
    "source_ip": ["source_ip", "src_ip", "ip", "source", "SourceAddress", "src", "source_address", "Source Network Address"],
    "destination_ip": ["destination_ip", "dest_ip", "dst_ip", "destination", "DestinationAddress", "dst", "destination_address", "Destination Network Address"],
    "hostname": ["hostname", "host", "computer", "ComputerName", "Computer"],
    "process_name": ["process_name", "process", "Image", "processName", "ProcessName", "Process Name", "image_path"],
    "process_id": ["process_id", "pid", "ProcessID", "ProcessId", "Process ID"],
    "event_type": ["event_type", "type", "eventType", "activity", "Activity", "category", "Task Category"],
    "message": ["message", "msg", "description", "details", "Message", "Description"]
}

def create_empty_standard_log() -> dict:
    return {
        "timestamp": None,
        "event_id": None,
        "username": None,
        "source_ip": None,
        "destination_ip": None,
        "hostname": None,
        "process_name": None,
        "process_id": None,
        "event_type": None,
        "message": None
    }

def map_dictionary_to_standard(data: dict) -> dict:
    """
    Maps key-value fields from a parsed dictionary to the standard schema.
    """
    standard_log = create_empty_standard_log()
    for std_field, synonyms in FIELD_MAPPINGS.items():
        # Look for matching keys case-insensitively
        for synonym in synonyms:
            matched = False
            for k, v in data.items():
                if k.strip().lower() == synonym.lower():
                    standard_log[std_field] = str(v) if v is not None and str(v).strip() != "" else None
                    matched = True
                    break
            if matched:
                break
    return standard_log

def parse_json_log(content: str) -> list[dict]:
    """
    Parses JSON formatted logs (single object or list of objects).
    """
    try:
        data = json.loads(content)
        if isinstance(data, list):
            return [map_dictionary_to_standard(item) for item in data if isinstance(item, dict)]
        elif isinstance(data, dict):
            return [map_dictionary_to_standard(data)]
    except Exception as e:
        logger.warning(f"Failed to parse content as JSON: {e}")
    return []

def parse_csv_log(content: str) -> list[dict]:
    """
    Parses CSV formatted logs.
    """
    events = []
    try:
        f = StringIO(content)
        reader = csv.DictReader(f)
        for row in reader:
            events.append(map_dictionary_to_standard(row))
    except Exception as e:
        logger.warning(f"Failed to parse content as CSV: {e}")
    return events

def parse_windows_event_log(content: str) -> dict:
    """
    Parses a single Windows Event Log block formatted as key-value pairs or text details.
    """
    standard_log = create_empty_standard_log()
    
    # Extract Event ID
    event_id_match = re.search(r'(?:Event ID|EventID):\s*(\d+)', content, re.IGNORECASE)
    if event_id_match:
        standard_log["event_id"] = event_id_match.group(1)
        
    # Extract Date/Time
    date_match = re.search(r'(?:Date|Time|Event Time):\s*([^\n]+)', content, re.IGNORECASE)
    if date_match:
        standard_log["timestamp"] = date_match.group(1).strip()
        
    # Extract Computer/Hostname
    computer_match = re.search(r'(?:Computer|Hostname|ComputerName):\s*([^\n]+)', content, re.IGNORECASE)
    if computer_match:
        standard_log["hostname"] = computer_match.group(1).strip()

    # Extract IPs
    ip_matches = re.findall(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', content)
    ips = [ip for ip in ip_matches if ip != "0.0.0.0" and ip != "255.255.255.255"]
    if len(ips) > 0:
        standard_log["source_ip"] = ips[0]
    if len(ips) > 1:
        standard_log["destination_ip"] = ips[1]
        
    # Search for specific IP labels if present
    src_ip_match = re.search(r'(?:Source Network Address|Source Address|Src IP):\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})', content, re.IGNORECASE)
    if src_ip_match:
        standard_log["source_ip"] = src_ip_match.group(1)
    dst_ip_match = re.search(r'(?:Destination Network Address|Dest Address|Dst IP):\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})', content, re.IGNORECASE)
    if dst_ip_match:
        standard_log["destination_ip"] = dst_ip_match.group(1)
        
    # Extract Account Name / Username
    new_logon_match = re.search(r'New Logon:(?:\s+Security ID:\s*\S+)?\s+Account Name:\s*([^\s\n]+)', content, re.IGNORECASE)
    if new_logon_match:
        standard_log["username"] = new_logon_match.group(1)
    else:
        account_names = re.findall(r'Account Name:\s*([^\s\n]+)', content, re.IGNORECASE)
        filtered_names = [name for name in account_names if name.upper() not in ["SYSTEM", "-", "ANONYMOUS LOGON"] and not name.endswith('$')]
        if filtered_names:
            standard_log["username"] = filtered_names[0]
        elif account_names:
            standard_log["username"] = account_names[-1]

    # Extract Process Name
    process_name_match = re.search(r'(?:Process Name|Image Path|Image):\s*([^\n]+)', content, re.IGNORECASE)
    if process_name_match:
        standard_log["process_name"] = process_name_match.group(1).strip()
        
    # Extract Process ID
    process_id_match = re.search(r'(?:Process ID|ProcessId|Pid):\s*(0x[0-9a-fA-F]+|\d+)', content, re.IGNORECASE)
    if process_id_match:
        standard_log["process_id"] = process_id_match.group(1).strip()
        
    # Extract Event Type / Task Category
    event_type_match = re.search(r'(?:Task Category|Logon Type|Activity|Category):\s*([^\n]+)', content, re.IGNORECASE)
    if event_type_match:
        standard_log["event_type"] = event_type_match.group(1).strip()
        
    # Message / Description
    desc_match = re.search(r'(?:Description|Message):\s*([\s\S]+)', content, re.IGNORECASE)
    if desc_match:
        standard_log["message"] = desc_match.group(1).strip()
    else:
        first_line = content.split('\n')[0].strip()
        standard_log["message"] = first_line if len(first_line) > 0 else "Windows Event Log Entry"
        
    return standard_log

def parse_text_log_generic(content: str) -> list[dict]:
    """
    Parses generic text/syslog files line by line.
    """
    events = []
    lines = content.splitlines()
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        standard_log = create_empty_standard_log()
        standard_log["message"] = line
        
        # 1. Parse IPs
        ip_matches = re.findall(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', line)
        ips = [ip for ip in ip_matches if ip != "255.255.255.255"]
        if len(ips) > 0:
            standard_log["source_ip"] = ips[0]
        if len(ips) > 1:
            standard_log["destination_ip"] = ips[1]
            
        # 2. Parse Timestamp
        iso_match = re.search(r'\b\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?\b', line)
        if iso_match:
            standard_log["timestamp"] = iso_match.group(0)
        else:
            syslog_match = re.search(r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\b', line)
            if syslog_match:
                standard_log["timestamp"] = syslog_match.group(0)
                
        # 3. Parse Process name and ID e.g. sshd[1234]: or CRON[567]:
        proc_match = re.search(r'\b([a-zA-Z][a-zA-Z0-9_\-\.]+)(?:\[(\d+)\])?\s*:', line)
        if proc_match:
            p_name = proc_match.group(1)
            if not p_name.isdigit():
                standard_log["process_name"] = p_name
                if proc_match.group(2):
                    standard_log["process_id"] = proc_match.group(2)
                    
        # 4. Parse username from common words: user=admin, user admin, for user admin, for admin
        user_match = re.search(r'\b(?:user=|user\s+|for\s+user\s+|for\s+)([a-zA-Z0-9_\-\.]+)\b', line, re.IGNORECASE)
        if user_match:
            val = user_match.group(1).rstrip(',;:').strip()
            if val.lower() not in ["invalid", "failed", "a", "an", "the", "from", "port"]:
                standard_log["username"] = val
                
        # 5. Parse Event ID if present
        eid_match = re.search(r'\b(?:event_id|eventId|eventid)=(\d+)\b', line, re.IGNORECASE)
        if eid_match:
            standard_log["event_id"] = eid_match.group(1)
            
        events.append(standard_log)
        
    return events

def parse_log_file(content: str, filename: str) -> list[dict]:
    """
    Dispatches file parsing based on extension and structure.
    """
    if not content or not content.strip():
        return []
        
    ext = os.path.splitext(filename)[1].lower() if filename else ""
    
    # 1. JSON check
    if ext == '.json' or content.strip().startswith('{') or content.strip().startswith('['):
        parsed = parse_json_log(content)
        if parsed:
            return parsed
            
    # 2. CSV check
    if ext == '.csv' or (',' in content.splitlines()[0] and len(content.splitlines()) > 1):
        parsed = parse_csv_log(content)
        if parsed:
            return parsed
            
    # 3. Windows Event Log (check for characteristic tags)
    if "Event ID:" in content or "EventID:" in content or "Log Name:" in content:
        # Split multiple event log blocks if they exist
        blocks = re.split(r'\n\s*-{3,}\s*\n|\n{2,}(?=Log Name:|Event ID:)', content)
        events = []
        for block in blocks:
            if block.strip():
                events.append(parse_windows_event_log(block))
        if events:
            return events
            
    # 4. Fallback: Generic text log
    return parse_text_log_generic(content)
