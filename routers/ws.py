"""
WebSocket endpoint for real-time workspace events.
Handles user presence (online/offline) and relays activity events.
"""
import os
import asyncio
import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session

from database import get_db, WorkspaceMember, SessionLocal
from services.ws_manager import manager

router = APIRouter(tags=["websocket"])

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"


def _verify_ws_token(token: str) -> str | None:
    """Verify JWT token and return the username, or None if invalid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except (jwt.PyJWTError, Exception):
        return None


def _is_workspace_member(username: str, workspace_id: int) -> bool:
    """Check if the user is a member of the workspace (sync DB call)."""
    db: Session = SessionLocal()
    try:
        member = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.username == username,
        ).first()
        return member is not None
    finally:
        db.close()


@router.websocket("/ws/workspace/{workspace_id}")
async def workspace_websocket(
    websocket: WebSocket,
    workspace_id: int,
    token: str = Query(default=""),
):
    """
    WebSocket endpoint for real-time workspace events.

    Query params:
        token: JWT auth token

    Events sent to client (JSON):
        - {"type": "user_online", "username": "...", "timestamp": "..."}
        - {"type": "user_offline", "username": "...", "timestamp": "..."}
        - {"type": "online_users_list", "users": ["user1", "user2"]}
        - {"type": "activity", "username": "...", "action": "...", "target_title": "...", "extra_data": {...}, "timestamp": "..."}
    """
    # Authenticate
    username = _verify_ws_token(token)
    if not username:
        await websocket.close(code=4001, reason="Invalid or missing token")
        return

    # Authorize — must be a workspace member
    if not _is_workspace_member(username, workspace_id):
        await websocket.close(code=4003, reason="Not a member of this workspace")
        return

    # Register connection
    await manager.connect(workspace_id, username, websocket)

    # Send the current online users list to the newly connected client
    online = manager.get_online_users(workspace_id)
    try:
        import json
        await websocket.send_text(json.dumps({
            "type": "online_users_list",
            "users": online,
        }))
    except Exception:
        pass

    # Keep the connection alive, listening for client messages (ping/pong)
    try:
        while True:
            # Wait for incoming messages from the client.
            # Clients can send {"type": "ping"} to keep alive.
            data = await websocket.receive_text()
            # We don't process client messages for now, just keep connection alive.
    except WebSocketDisconnect:
        await manager.disconnect(workspace_id, username)
    except Exception:
        await manager.disconnect(workspace_id, username)
