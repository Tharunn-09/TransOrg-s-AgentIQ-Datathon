"""
Authentication & Role-Based Access Control (MFA TOTP)
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)

Provides secure multi-factor authentication using Time-based One-Time Passwords (TOTP),
compatible with Google Authenticator, Microsoft Authenticator, and Authy.
"""

import base64
import io
import urllib.parse
from typing import Dict, Optional, Tuple
import pyotp

try:
    import qrcode
    HAS_QRCODE = True
except ImportError:
    HAS_QRCODE = False


# Pre-configured demo accounts for Datathon evaluation
USER_DATABASE = {
    "executive": {
        "password": "Password123!",
        "role": "Executive",
        "name": "Chief Risk Officer",
        "totp_secret": "JBSWY3DPEHPK3PXP" # Base32 seed
    },
    "analyst": {
        "password": "Password123!",
        "role": "Fraud Analyst",
        "name": "Senior Fraud Specialist",
        "totp_secret": "KRSXG5CTMVRXEZLU"
    },
    "auditor": {
        "password": "Password123!",
        "role": "Compliance Auditor",
        "name": "Lead Datathon Evaluator",
        "totp_secret": "MZXW633PN5XW6MZA"
    }
}


def verify_credentials(username: str, password: str) -> Tuple[bool, Optional[str]]:
    """Verifies standard username and password."""
    user = USER_DATABASE.get(username.strip().lower())
    if not user:
        return False, "User not found"
    if user["password"] != password:
        return False, "Invalid password"
    return True, None


def verify_totp_code(username: str, otp_code: str) -> bool:
    """Verifies a 6-digit TOTP token against the user's secret."""
    user = USER_DATABASE.get(username.strip().lower())
    if not user:
        return False
    totp = pyotp.TOTP(user["totp_secret"])
    # Allow 1-step clock skew tolerance
    return totp.verify(otp_code.strip(), valid_window=1)


def get_current_totp(username: str) -> str:
    """Generates the current valid TOTP code (helper for testing/quick login)."""
    user = USER_DATABASE.get(username.strip().lower())
    if not user:
        return ""
    totp = pyotp.TOTP(user["totp_secret"])
    return totp.now()


def generate_qr_code_base64(username: str) -> str:
    """Generates a QR Code image as a base64 string for scanning in authenticator apps."""
    user = USER_DATABASE.get(username.strip().lower())
    if not user:
        return ""
    totp = pyotp.TOTP(user["totp_secret"])
    provisioning_uri = totp.provisioning_uri(name=username, issuer_name="AgentIQ UPI Platform")
    
    if HAS_QRCODE:
        try:
            qr = qrcode.QRCode(version=1, box_size=8, border=2)
            qr.add_data(provisioning_uri)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            return base64.b64encode(buffered.getvalue()).decode("utf-8")
        except Exception:
            pass
            
    return ""
