"""Push merge variables to a TRMNL Private Plugin via its webhook strategy.

Create a Private Plugin at https://trmnl.com/plugin_settings/new?keyname=private_plugin
choosing the "Webhook" strategy. TRMNL gives you a Plugin UUID; the webhook URL
is https://usetrmnl.com/api/custom_plugins/<UUID>. POST JSON shaped as
{"merge_variables": {...}} and the keys become available in your Liquid markup.
"""

from __future__ import annotations

import requests

WEBHOOK_URL = "https://trmnl.com/api/custom_plugins/{plugin_uuid}"


class TrmnlError(RuntimeError):
    pass


def push(plugin_uuid: str, merge_variables: dict) -> None:
    url = WEBHOOK_URL.format(plugin_uuid=plugin_uuid)
    resp = requests.post(
        url,
        json={"merge_variables": merge_variables},
        headers={"Content-Type": "application/json"},
        timeout=15,
    )
    if resp.status_code not in (200, 201, 204):
        raise TrmnlError(f"TRMNL push failed ({resp.status_code}): {resp.text[:300]}")
