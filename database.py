import os
from dotenv import load_dotenv
import bcrypt
import json
from sqlalchemy import create_engine, Column, Integer, String, Text, text, DateTime, Boolean, Float, ForeignKey
from datetime import datetime
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in the environment or .env file!")

# Tambahkan pool_pre_ping dan pool_recycle untuk menangani auto-disconnect di cloud DB (seperti Neon DB)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, pool_pre_ping=True, pool_recycle=300
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Workspace(Base):
    __tablename__ = "workspaces"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    owner_username = Column(String(50), ForeignKey("users.username", ondelete="CASCADE"), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="owned_workspaces")
    members = relationship("WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")
    boards = relationship("Board", back_populates="workspace", cascade="all, delete-orphan")
    requests = relationship("Request", back_populates="workspace", cascade="all, delete-orphan")


class WorkspaceMember(Base):
    __tablename__ = "workspace_members"
    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), index=True)
    username = Column(String(50), ForeignKey("users.username", ondelete="CASCADE"), index=True)
    role = Column(String(20), default="member")  # admin, member, viewer
    joined_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User", back_populates="workspace_memberships")


class Request(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, index=True, nullable=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    project_name = Column(String(100))
    requester = Column(String(100))
    category = Column(String(50))
    description = Column(Text)
    supporting_access = Column(Text)
    start_date = Column(DateTime, nullable=True)
    deadline = Column(DateTime)
    status = Column(String(50), default="Pending")
    completed_time = Column(DateTime, nullable=True)
    owner_username = Column(String(50), index=True)
    impact = Column(String(50), default="Medium")
    etc = Column(Float, default=2.0)
    auto_nudge = Column(Boolean, default=False)
    recurring = Column(String(50), default="none")

    # Relationships
    workspace = relationship("Workspace", back_populates="requests")


class LeaveDay(Base):
    __tablename__ = "leave_days"
    id = Column(Integer, primary_key=True, index=True)
    leave_date = Column(DateTime, unique=True)


class LeaveRecord(Base):
    __tablename__ = "leave_records"
    id = Column(Integer, primary_key=True, index=True)
    leave_date = Column(DateTime, index=True)
    username = Column(String(50), index=True, nullable=True)
    description = Column(String(255))
    leave_type = Column(
        String(50), default="personal"
    )  # 'personal', 'mass_leave', 'public_holiday'


class Subtask(Base):
    __tablename__ = "subtasks"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, index=True)
    task_name = Column(String(255))
    is_done = Column(Integer, default=0)
    assignee = Column(String(50), nullable=True)
    due_date = Column(DateTime, nullable=True)
    position = Column(Integer, default=0)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    full_name = Column(String(100))
    password = Column(String(255))
    avatar = Column(Text, nullable=True)
    is_verified = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    account_status = Column(
        String(50), default="active"
    )  # active, suspended, pending_deletion
    deletion_date = Column(DateTime, nullable=True)
    is_superadmin = Column(Integer, default=0)

    # Relationships
    owned_workspaces = relationship("Workspace", back_populates="owner", cascade="all, delete-orphan")
    workspace_memberships = relationship("WorkspaceMember", back_populates="user", cascade="all, delete-orphan")


class Board(Base):
    __tablename__ = "boards"
    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(100))
    owner_username = Column(String(50), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    statuses = Column(Text, nullable=True)
    categories = Column(Text, nullable=True)
    last_activity_date = Column(DateTime, nullable=True)
    deletion_date = Column(DateTime, nullable=True)
    is_private = Column(Integer, default=0)

    # Relationships
    workspace = relationship("Workspace", back_populates="boards")


class BoardMember(Base):
    __tablename__ = "board_members"
    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, index=True)
    member_username = Column(String(50), index=True)
    status = Column(String(20), default="pending")


class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, index=True)
    username = Column(String(50))
    text = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=True, index=True)
    user_username = Column(String(50), index=True)
    message = Column(String(255))
    type = Column(String(50), default="info")
    is_read = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)
    related_task_id = Column(Integer, nullable=True)


class DirectMessage(Base):
    __tablename__ = "direct_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_username = Column(String(50), index=True)
    receiver_username = Column(String(50), index=True)
    text = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Integer, default=0)
    is_deleted_by_sender = Column(Integer, default=0)
    is_deleted_by_receiver = Column(Integer, default=0)


class SecurityLog(Base):
    __tablename__ = "security_logs"
    key = Column(String(255), primary_key=True, index=True)
    value = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def get_security_log(db, key: str, default_value=None):
    log = db.query(SecurityLog).filter(SecurityLog.key == key).first()
    if log and log.value:
        try:
            return json.loads(log.value)
        except:
            return default_value
    return default_value


def set_security_log(db, key: str, value):
    log = db.query(SecurityLog).filter(SecurityLog.key == key).first()
    str_val = json.dumps(value)
    if log:
        log.value = str_val
    else:
        new_log = SecurityLog(key=key, value=str_val)
        db.add(new_log)
    db.commit()


def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            salt = bcrypt.gensalt()
            hashed_pw = bcrypt.hashpw("admin123".encode("utf-8"), salt).decode("utf-8")
            new_admin = User(
                username="admin",
                email="ekahary89@gmail.com",
                full_name="System Admin",
                password=hashed_pw,
                is_superadmin=1,
            )
            db.add(new_admin)
            db.flush()
            
            # Create default workspace for admin
            admin_ws = Workspace(
                name="Workspace Pribadi Admin",
                owner_username="admin"
            )
            db.add(admin_ws)
            db.flush()
            
            # Create member link
            ws_member = WorkspaceMember(
                workspace_id=admin_ws.id,
                username="admin",
                role="admin"
            )
            db.add(ws_member)
            db.commit()
        else:
            if admin.is_superadmin == 0:
                admin.is_superadmin = 1
                db.commit()

            if not admin.password.startswith("$2b$"):
                salt = bcrypt.gensalt()
                admin.password = bcrypt.hashpw(
                    admin.password.encode("utf-8")[:71], salt
                ).decode("utf-8")
                db.commit()

        # Check if admin has any workspace membership, if not, create one
        if admin:
            existing_ws_member = db.query(WorkspaceMember).filter(WorkspaceMember.username == "admin").first()
            if not existing_ws_member:
                admin_ws = Workspace(
                    name="Workspace Pribadi Admin",
                    owner_username="admin"
                )
                db.add(admin_ws)
                db.flush()
                ws_member = WorkspaceMember(
                    workspace_id=admin_ws.id,
                    username="admin",
                    role="admin"
                )
                db.add(ws_member)
                db.commit()
    finally:
        db.close()


def get_leave_dates(db):
    leaves = db.query(LeaveDay.leave_date).all()
    global_leaves = (
        db.query(LeaveRecord.leave_date)
        .filter(LeaveRecord.leave_type.in_(["mass_leave", "public_holiday"]))
        .all()
    )

    ans = set()
    for l in leaves:
        if l[0]:
            ans.add(l[0].strftime("%Y-%m-%d") if hasattr(l[0], "strftime") else str(l[0])[:10])
    for l in global_leaves:
        if l[0]:
            ans.add(l[0].strftime("%Y-%m-%d") if hasattr(l[0], "strftime") else str(l[0])[:10])
    return ans


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
