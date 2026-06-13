"""Minimal client for the (unofficial) Bring! shopping list API.

Bring! syncs with Alexa, Google Home, and other voice assistants. This client
reads any Bring! list. It only needs the stdlib + `requests`.

The API key below is the public key used by the Bring! android app (same one
Home Assistant uses); it is not a secret. Your Bring! account email/password
ARE secrets -> keep them in env vars.
"""

from __future__ import annotations

import dataclasses
import requests

BASE_URL = "https://api.getbring.com/rest/v2"
# Android client API key — unlocks the lists enumeration endpoint.
# The web-app key (cof4Nc6Q8RWODD8I89om9GYKLBPgz3UnejLGS86) does NOT.
API_KEY = "cof4Nc6D8saplXjE3h3HXqHH8m7VU2i1Gs0g85Sp"


@dataclasses.dataclass
class BringItem:
    name: str
    specification: str = ""  # quantity / note, e.g. "2" or "organic"

    @property
    def display(self) -> str:
        return f"{self.name} ({self.specification})" if self.specification else self.name


class BringError(RuntimeError):
    pass


class BringClient:
    def __init__(self, email: str, password: str, country: str = "US", locale: str = "en-US"):
        self._email = email
        self._password = password
        self._country = country
        self._locale = locale
        self._session = requests.Session()
        self._access_token: str | None = None
        self._user_uuid: str | None = None
        self._default_list_uuid: str | None = None

    # -- auth ---------------------------------------------------------------
    def login(self) -> None:
        resp = self._session.post(
            f"{BASE_URL}/bringauth",
            data={"email": self._email, "password": self._password},
            headers={"X-BRING-API-KEY": API_KEY},
            timeout=15,
        )
        if resp.status_code != 200:
            raise BringError(f"Bring login failed ({resp.status_code}): {resp.text[:200]}")
        data = resp.json()
        self._access_token = data["access_token"]
        self._user_uuid = data["uuid"]
        self._default_list_uuid = data.get("bringListUUID")

    def _headers(self) -> dict[str, str]:
        if not self._access_token:
            raise BringError("Not authenticated -- call login() first")
        return {
            "Authorization": f"Bearer {self._access_token}",
            "X-BRING-API-KEY": API_KEY,
            "X-BRING-CLIENT": "webApp",
            "X-BRING-CLIENT-SOURCE": "webApp",
            "X-BRING-COUNTRY": self._country,
            "X-BRING-USER-UUID": self._user_uuid or "",
        }

    # -- lists --------------------------------------------------------------
    def lists(self) -> list[dict]:
        resp = self._session.get(
            f"{BASE_URL}/bringusers/{self._user_uuid}/lists",
            headers=self._headers(),
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json().get("lists", [])

    def resolve_list_uuid(self, list_name: str | None) -> str:
        """Pick the list to read: by name if given, else the account default."""
        if not list_name and self._default_list_uuid:
            return self._default_list_uuid
        for lst in self.lists():
            if not list_name or lst.get("name", "").lower() == list_name.lower():
                return lst["listUuid"]
        raise BringError(f"No Bring list matching name={list_name!r}")

    def items(self, list_uuid: str) -> list[BringItem]:
        resp = self._session.get(
            f"{BASE_URL}/bringlists/{list_uuid}",
            headers=self._headers(),
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        # API returns different shapes depending on the client key:
        #   android key: { items: { purchase: [{itemId, specification}, ...] } }
        #   web key:     { purchase: [{name, specification}, ...] }
        purchase = data.get("purchase")
        if purchase is None:
            purchase = data.get("items", {}).get("purchase", [])
        return [
            BringItem(name=(i.get("name") or i.get("itemId", "")).strip(), specification=i.get("specification", "").strip())
            for i in purchase
            if i.get("name") or i.get("itemId")
        ]

    def fetch(self, list_name: str | None = None) -> list[BringItem]:
        """Login (if needed) and return the current to-buy items."""
        if not self._access_token:
            self.login()
        list_uuid = self.resolve_list_uuid(list_name)
        return self.items(list_uuid)
