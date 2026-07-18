"""
WebSocket Connection Manager for alurku.
Manages per-workspace WebSocket connections and broadcasts events
for real-time Team Activity feed and User Online presence.
"""
import json
import asyncio
from collections import defaultdict
from datetime import datetime
from fastapi import WebSocket


class ConnectionManager:
    """
    Singleton-style manager that tracks active WebSocket connections
    per workspace. Provides methods to connect, disconnect, broadcast,
    and query online users.
    """

    def __init__(self):
        # {workspace_id: {username: WebSocket}}
        self._connections: dict[int, dict[str, WebSocket]] = defaultdict(dict)

    async def connect(self, workspace_id: int, username: str, websocket: WebSocket):
        """Accept a WebSocket and register the user in the workspace room."""
        await websocket.accept()
        self._connections[workspace_id][username] = websocket

        # Broadcast that this user is now online
        await self.broadcast(workspace_id, {
            "type": "user_online",
            "username": username,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        })

    async def disconnect(self, workspace_id: int, username: str):
        """Remove the user from the workspace room and notify others."""
        self._connections[workspace_id].pop(username, None)

        # Clean up empty workspace rooms
        if not self._connections[workspace_id]:
            del self._connections[workspace_id]

        # Broadcast that this user went offline
        await self.broadcast(workspace_id, {
            "type": "user_offline",
            "username": username,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        })

    def get_online_users(self, workspace_id: int) -> list[str]:
        """Return the list of usernames currently connected to a workspace."""
        return list(self._connections.get(workspace_id, {}).keys())

    async def broadcast(self, workspace_id: int, message: dict):
        """Send a JSON message to all connected clients in a workspace."""
        dead_connections = []
        room = self._connections.get(workspace_id, {})
        payload = json.dumps(message)

        for username, ws in room.items():
            try:
                await ws.send_text(payload)
            except Exception:
                dead_connections.append(username)

        # Clean up any dead connections
        for username in dead_connections:
            self._connections[workspace_id].pop(username, None)

    async def broadcast_activity(self, workspace_id: int, username: str, action: str, target_title: str = "", extra_data: dict = None):
        """
        Convenience method to broadcast an activity event to a workspace.
        Also used by task/board routers after CUD operations.
        """
        await self.broadcast(workspace_id, {
            "type": "activity",
            "username": username,
            "action": action,
            "target_title": target_title,
            "extra_data": extra_data or {},
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        })


# Singleton instance — import this from any router
manager = ConnectionManager()
