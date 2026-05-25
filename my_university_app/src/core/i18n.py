from typing import Dict

TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "en": {
        "Not enough permissions": "Not enough permissions",
        "Could not validate credentials": "Could not validate credentials",
        "Token has been revoked (Logged out)": "Token has been revoked (Logged out)",
        "Invalid token type": "Invalid token type",
        "Invalid token": "Invalid token"
    },
    "ru": {
        "Not enough permissions": "Недостаточно прав",
        "Could not validate credentials": "Не удалось подтвердить учетные данные",
        "Token has been revoked (Logged out)": "Токен был отозван (Выполнен выход)",
        "Invalid token type": "Неверный тип токена",
        "Invalid token": "Недействительный токен"
    },
    "it": {
        "Not enough permissions": "Permessi insufficienti",
        "Could not validate credentials": "Impossibile convalidare le credenziali",
        "Token has been revoked (Logged out)": "Il token è stato revocato (Disconnesso)",
        "Invalid token type": "Tipo di token non valido",
        "Invalid token": "Token non valido"
    }
}

def translate(message_key: str, lang: str = "en") -> str:
    lang = lang.lower()
    if lang not in TRANSLATIONS:
        lang = "en"
    return TRANSLATIONS[lang].get(message_key, message_key)
