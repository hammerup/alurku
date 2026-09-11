from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AIGenerateModel(BaseModel):
    prompt: str
    provider: Optional[str] = "auto"
    # Optional type hint for policy enforcement: 'nudge', 'subtask', 'chat', etc.
    prompt_type: Optional[str] = None


class RequestFormModel(BaseModel):
    project_name: str
    requester: str
    category: str
    description: str
    supporting_access: str
    start_date: str
    deadline: str
    impact: Optional[str] = "Medium"
    etc: Optional[float] = 2.0
    auto_nudge: Optional[bool] = False
    recurring: Optional[str] = "none"
    subtasks: Optional[List[dict]] = []


class TaskUpdateModel(BaseModel):
    status: str


class TaskEditModel(BaseModel):
    project_name: str
    requester: str
    category: str
    description: str
    supporting_access: str
    start_date: str
    deadline: str
    impact: Optional[str] = "Medium"
    etc: Optional[float] = 2.0
    auto_nudge: Optional[bool] = False
    recurring: Optional[str] = "none"
    status: str
    board_id: Optional[int] = None


class SubtaskModel(BaseModel):
    task_name: str
    assignee: Optional[str] = None


class SubtaskToggleModel(BaseModel):
    is_done: int
    assignee: Optional[str] = None


class CommentModel(BaseModel):
    text: str


class AIChatModel(BaseModel):
    text: str


class RegisterModel(BaseModel):
    full_name: str
    email: str
    username: str
    password: str


class QuickRegisterModel(BaseModel):
    email: str
    origin: Optional[str] = None


class LoginModel(BaseModel):
    username: str
    password: str


class GoogleLoginModel(BaseModel):
    token: str


class VerifyModel(BaseModel):
    token: str


class BoardModel(BaseModel):
    name: str
    is_private: Optional[int] = 0


class BoardSettingsModel(BaseModel):
    statuses: str
    categories: str


class InviteModel(BaseModel):
    members_input: str


class AdminActionModel(BaseModel):
    username: str
    status: Optional[str] = None
    offboard_date: Optional[str] = None


class SubtaskReorderModel(BaseModel):
    ordered_ids: List[int]


class FeedbackModel(BaseModel):
    text: str


class ProfileUpdateModel(BaseModel):
    full_name: str
    email: str
    avatar: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class SystemConfigModel(BaseModel):
    smtp_server: Optional[str] = None
    smtp_port: Optional[str] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    gemini_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    database_url: Optional[str] = None
    google_calendar_api_key: Optional[str] = None
    secret_key: Optional[str] = None


class SudoVerifyModel(BaseModel):
    password: str


class AutoNudgeToggleModel(BaseModel):
    auto_nudge: bool


class LeaveModel(BaseModel):
    start_date: str
    end_date: Optional[str] = None
    description: str
    leave_type: str


class TransferToMemberModel(BaseModel):
    new_owner: str


class TransferBoardModel(BaseModel):
    new_owner: str


class DMModel(BaseModel):
    text: str


class WorkspaceCreateModel(BaseModel):
    name: str


class WorkspaceInviteModel(BaseModel):
    username_or_email: str
    role: Optional[str] = "member"


class AIChatSessionCreate(BaseModel):
    id: str
    title: str
    messages: Optional[str] = "[]"
    is_pinned: Optional[int] = 0

class AIChatSessionUpdate(BaseModel):
    title: Optional[str] = None
    messages: Optional[str] = None
    is_pinned: Optional[int] = None


class AccountDeleteModel(BaseModel):
    password: str
    confirmation: Optional[str] = None


class SystemPolicyModel(BaseModel):
    org_name: Optional[str] = "alurku."
    default_language: Optional[str] = "id"
    allow_public_signup: Optional[bool] = True
    allowed_domains: Optional[str] = ""
    session_duration_days: Optional[int] = 30
    soft_delete_grace_days: Optional[int] = 90
    max_upload_size_mb: Optional[int] = 10
    default_ai_engine: Optional[str] = "auto"
    enable_proactive_nudge: Optional[bool] = True
    enable_auto_subtasks: Optional[bool] = True


class ContentModerationActionModel(BaseModel):
    content_id: int
    content_type: str
    reason: Optional[str] = None


class TaskAttachmentResponse(BaseModel):
    id: int
    task_id: int
    filename: str
    file_size: int
    content_type: Optional[str] = None
    uploader_username: str
    created_at: Optional[str] = None
    download_url: Optional[str] = None
    preview_url: Optional[str] = None


