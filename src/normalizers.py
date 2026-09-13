"""
Canonical ID Normalization Module
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)

Provides deterministic normalization for user_id and merchant_id across
all transaction logs, KYC master records, merchant records, and dispute JSONs.
"""

import re
from typing import Any, Optional, Tuple


def normalize_user_id(raw_id: Any, pad_length: int = 5) -> str:
    """
    Standardizes user IDs into the canonical format: USR#####
    
    Handles:
      - 'USR12345', 'usr12345', 'USR-12345', 'USR 12345', 'usr_12345'
      - Bare numbers: '12345', 12345, '45454'
      - Whitespace, hyphens, and mixed casing
    """
    if raw_id is None:
        return "USR_UNKNOWN"
    
    s = str(raw_id).strip()
    if not s or s.lower() in ("nan", "none", "null", ""):
        return "USR_UNKNOWN"
    
    # Remove all whitespace, hyphens, underscores, and dots
    cleaned = re.sub(r"[\s\-_.]+", "", s).upper()
    
    # Extract prefix and digits
    match = re.search(r"^(?:USR)?(\d+)$", cleaned, re.IGNORECASE)
    if match:
        digits = match.group(1)
        padded = digits.zfill(pad_length)
        return f"USR{padded}"
    
    # Fallback if there are mixed characters: extract numeric part
    numeric_match = re.search(r"(\d+)", cleaned)
    if numeric_match:
        digits = numeric_match.group(1)
        return f"USR{digits.zfill(pad_length)}"
        
    return cleaned


def normalize_merchant_id(raw_id: Any, pad_length: int = 4) -> str:
    """
    Standardizes merchant IDs into the canonical format: MCH####
    
    Handles:
      - 'MCH1234', 'mch1234', 'MCH-1234', 'MCH 1234', 'mch_1234'
      - Bare numbers: '3835', 3835, '1234'
      - Case differences and whitespace
    """
    if raw_id is None:
        return "MCH_UNKNOWN"
        
    s = str(raw_id).strip()
    if not s or s.lower() in ("nan", "none", "null", ""):
        return "MCH_UNKNOWN"
        
    # Remove whitespace, hyphens, underscores, and dots
    cleaned = re.sub(r"[\s\-_.]+", "", s).upper()
    
    # Check if bare number or MCH + number
    match = re.search(r"^(?:MCH)?(\d+)$", cleaned, re.IGNORECASE)
    if match:
        digits = match.group(1)
        padded = digits.zfill(pad_length)
        return f"MCH{padded}"
        
    numeric_match = re.search(r"(\d+)", cleaned)
    if numeric_match:
        digits = numeric_match.group(1)
        return f"MCH{digits.zfill(pad_length)}"
        
    return cleaned


def normalize_mcc(raw_mcc: Any) -> Optional[str]:
    """
    Standardizes Merchant Category Codes (MCC) to 4-digit numeric strings.
    Handles 'MCC-5411', '05411', 5411, 5411.0, '5411'
    """
    if raw_mcc is None:
        return None
    s = str(raw_mcc).strip()
    if not s or s.lower() in ("nan", "none", "null", ""):
        return None
        
    # Remove 'MCC-' or 'MCC' prefix
    s = re.sub(r"^MCC[\-_]?", "", s, flags=re.IGNORECASE).strip()
    
    # Remove float decimal e.g. '5411.0' -> '5411'
    if "." in s:
        try:
            s = str(int(float(s)))
        except Exception:
            pass
            
    # Keep only digits
    digits = re.sub(r"\D", "", s)
    if not digits:
        return None
        
    # Standardize to 4 digits (e.g. 05411 -> 5411 if 5-digit with leading zero)
    if len(digits) == 5 and digits.startswith("0"):
        digits = digits[1:]
        
    return digits.zfill(4)
