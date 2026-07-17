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
    description = Column(Text, nullable=True)

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



class Article(Base):
    __tablename__ = "articles"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False)
    category_slug = Column(String(100), nullable=False)
    duration = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    language = Column(String(10), default="id")  # id or en
    translation_key = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


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


        # Seed default articles
        existing_articles = db.query(Article).first()
        if not existing_articles:
            default_articles = [
                # ID Articles
                {
                    "title": "Cara Membuat Proyek Pertama Anda",
                    "slug": "cara-membuat-proyek-pertama",
                    "category": "Panduan Memulai",
                    "category_slug": "panduan-memulai",
                    "duration": "Baca 3 menit",
                    "description": "Langkah mudah untuk membuat papan proyek baru, menambahkan anggota tim, dan mengimpor tugas dari spreadsheet.",
                    "content": "<p>Memulai proyek pertama di <strong>alurku.</strong> sangat mudah. Ikuti langkah-langhat di bawah ini untuk membuat ruang kerja yang teratur:</p><h2>1. Masuk ke Dashboard</h2><p>Buka halaman utama aplikasi dan pastikan Anda sudah masuk menggunakan akun Google Anda.</p><h2>2. Klik Tombol 'Proyek Baru'</h2><p>Di bilah sisi (sidebar) atau dasbor utama, klik tombol <strong>+ Proyek Baru</strong>.</p><h2>3. Tentukan Nama & Tipe Proyek</h2><p>Masukkan nama proyek yang Anda inginkan (misalnya 'Desain Ulang Website'). Pilih tipe proyek: <strong>Proyek Tim</strong> untuk kolaborasi dengan rekan kerja, atau <strong>Proyek Pribadi</strong> jika proyek ini hanya untuk Anda pantau sendiri.</p><h2>4. Atur Kolom Kanban</h2><p>Proyek baru akan langsung dibuat dengan kolom alur kerja bawaan (To Do, In Progress, Done). Anda dapat langsung mulai membuat tugas pertama Anda!</p>",
                    "language": "id",
                    "translation_key": "create-first-project"
                },
                {
                    "title": "Memahami Kolom Status & Prioritas",
                    "slug": "memahami-kolom-status-prioritas",
                    "category": "Panduan Memulai",
                    "category_slug": "panduan-memulai",
                    "duration": "Baca 5 menit",
                    "description": "Pelajari cara terbaik untuk mengatur kolom alur kerja Kanban dan menetapkan tingkat prioritas tugas yang tepat.",
                    "content": "<p>Mengelola status dan tingkat prioritas dengan benar adalah kunci kelancaran proyek di <strong>alurku.</strong>.</p><h2>1. Kolom Status Kanban</h2><p>Papan kerja default menggunakan tiga tahapan utama:</p><ul><li><strong>To Do (Untuk Dikerjakan)</strong>: Berisi tugas yang baru direncanakan dan belum dimulai.</li><li><strong>In Progress (Sedang Dikerjakan)</strong>: Tugas yang saat ini sedang aktif dikerjakan oleh anggota tim.</li><li><strong>Done (Selesai)</strong>: Tugas yang sudah rampung dan divalidasi.</li></ul><h2>2. Menetapkan Tingkat Prioritas</h2><p>Setiap tugas dapat diberi label prioritas untuk membantu tim mengetahui fokus kerja:</p><ul><li><strong>Low (Rendah)</strong>: Tugas pendukung yang tidak memiliki tenggat waktu ketat.</li><li><strong>Medium (Sedang)</strong>: Tugas standar yang harus diselesaikan dalam waktu dekat.</li><li><strong>High (Tinggi)</strong>: Tugas mendesak yang mempengaruhi laju progres proyek secara keseluruhan.</li></ul>",
                    "language": "id",
                    "translation_key": "status-priority"
                },
                {
                    "title": "Mengundang Anggota Tim ke Papan Proyek",
                    "slug": "mengundang-anggota-tim-papan-proyek",
                    "category": "Panduan Memulai",
                    "category_slug": "panduan-memulai",
                    "duration": "Baca 2 menit",
                    "description": "Kolaborasi menjadi mudah. Panduan singkat tentang cara membagikan tautan proyek dan mengatur hak akses anggota tim.",
                    "content": "<p>Kolaborasi adalah kekuatan utama <strong>alurku.</strong>. Berikut cara cepat mengundang rekan kerja Anda:</p><h2>1. Masuk ke Proyek Pilihan</h2><p>Buka proyek yang ingin Anda bagikan dari dasbor utama.</p><h2>2. Buka Pengaturan Tim</h2><p>Pada header proyek bagian atas, klik tombol <strong>Tim ➔ Kelola Tim</strong>.</p><h2>3. Ketik Username atau Email</h2><p>Ketikkan nama pengguna corporate atau alamat email rekan kerja Anda yang terdaftar dalam Workspace yang sama, lalu klik <strong>Undang</strong>.</p><h2>4. Penerimaan Undangan</h2><p>Rekan kerja Anda akan menerima notifikasi di bilah samping mereka dan dapat langsung bergabung dengan satu klik.</p>",
                    "language": "id",
                    "translation_key": "invite-members"
                },
                {
                    "title": "Menggunakan Fitur Asisten Perencana Otomatis",
                    "slug": "menggunakan-fitur-asisten-perencana-otomatis",
                    "category": "Bantuan Asisten AI",
                    "category_slug": "bantuan-asisten-ai",
                    "duration": "Baca 6 menit",
                    "description": "Bagaimana AI memecah tugas dan memprediksi durasinya. Tips menuliskan draf kasar agar hasil AI lebih akurat.",
                    "content": "<p>Asisten AI di <strong>alurku.</strong> membantu memotong waktu perencanaan Anda hingga 80%.</p><h2>1. Akses AI Planner</h2><p>Klik tombol <strong>Smart Assistant (✨)</strong> di sudut kanan bawah aplikasi.</p><h2>2. Berikan Draf Kasar Rencana Anda</h2><p>Ketikkan rencana proyek kasar Anda, misalnya: <em>'Buatkan proyek renovasi halaman beranda website dengan langkah riset, wireframe, coding, dan deployment.'</em></p><h2>3. AI Memecah Tugas Secara Otomatis</h2><p>AI akan menganalisis input Anda, memecahnya menjadi sub-tugas yang logis, mengestimasi durasi pengerjaan masing-masing secara realistis, dan menyusunnya dalam draf tugas siap simpan.</p>",
                    "language": "id",
                    "translation_key": "ai-planner"
                },
                {
                    "title": "Meringkas Hasil Rapat ke Daftar Tugas",
                    "slug": "meringkas-hasil-rapat-daftar-tugas",
                    "category": "Bantuan Asisten AI",
                    "category_slug": "bantuan-asisten-ai",
                    "duration": "Baca 4 menit",
                    "description": "Panduan merekam poin rapat Anda secara real-time dan membiarkan AI alurku. memecahnya menjadi sub-tugas secara otomatis.",
                    "content": "<p>Ubah hasil rapat bertele-tele menjadi aksi nyata yang teratur.</p><h2>1. Salin Catatan Rapat Anda</h2><p>Kumpulkan poin-poin hasil rapat tim Anda dalam format teks bebas.</p><h2>2. Kirimkan ke Asisten AI</h2><p>Buka Smart Assistant dan tempel catatan tersebut dengan perintah: <em>'Ubah notulen rapat ini menjadi daftar tugas.'</em></p><h2>3. Konfirmasi Tugas</h2><p>AI akan mengekstrak siapa mengerjakan apa, kapan tenggat waktunya, dan membuatkan daftar kartu tugas di proyek yang bersangkutan secara otomatis.</p>",
                    "language": "id",
                    "translation_key": "meeting-summary"
                },
                {
                    "title": "Menyematkan Konteks Proyek di Kolom Komentar",
                    "slug": "menyematkan-konteks-proyek-kolom-komentar",
                    "category": "Bantuan Asisten AI",
                    "category_slug": "bantuan-asisten-ai",
                    "duration": "Baca 3 menit",
                    "description": "Cara memanggil AI dengan tag di thread tugas untuk menjawab pertanyaan teknis berdasarkan deskripsi dan lampiran.",
                    "content": "<p>Gunakan asisten AI sebagai konsultan proyek pribadi Anda langsung di kolom komentar tugas.</p><h2>1. Buka Detail Tugas</h2><p>Klik salah satu kartu tugas untuk membuka detailnya.</p><h2>2. Gunakan Tag @ai</h2><p>Di bagian kolom komentar, ketikkan pertanyaan Anda dengan menyebut <strong>@ai</strong> (misalnya: <em>'@ai, tolong berikan rekomendasi library chart untuk tugas ini'</em>).</p><h2>3. AI Membalas Berdasarkan Konteks</h2><p>AI akan secara otomatis membaca deskripsi tugas, lampiran berkas, dan membalas komentar Anda dengan jawaban teknis yang relevan.</p>",
                    "language": "id",
                    "translation_key": "project-comments"
                },
                {
                    "title": "Cara Membaca Grafik Beban Kerja (Workload)",
                    "slug": "cara-membaca-grafik-beban-kerja",
                    "category": "Manajemen Beban Kerja",
                    "category_slug": "manajemen-beban-kerja",
                    "duration": "Baca 4 menit",
                    "description": "Memahami persentase kapasitas tim dan mengidentifikasi anggota yang mengalami kelebihan beban sebelum burnout terjadi.",
                    "content": "<p>Mencegah kejenuhan (burnout) tim dengan grafik beban kerja transparan.</p><h2>1. Buka Halaman Analitik</h2><p>Di dasbor navigasi atas, buka tab <strong>Analitik</strong>.</p><h2>2. Perhatikan Persentase Kapasitas</h2><p>Setiap anggota tim akan ditampilkan dengan kapasitas persentase kerja mereka:</p><ul><li><strong>Di bawah 70% (Kapasitas Longgar)</strong>: Anggota tim siap menerima tugas tambahan.</li><li><strong>70% - 90% (Kapasitas Optimal)</strong>: Beban kerja ideal dan seimbang.</li><li><strong>Di atas 95% (Kritis / Overload)</strong>: Menandakan kelebihan beban kerja yang berisiko burnout.</li></ul>",
                    "language": "id",
                    "translation_key": "workload-charts"
                },
                {
                    "title": "Strategi Pembagian Tugas yang Adil",
                    "slug": "strategi-pembagian-tugas-yang-adil",
                    "category": "Manajemen Beban Kerja",
                    "category_slug": "manajemen-beban-kerja",
                    "duration": "Baca 5 menit",
                    "description": "Metodologi manajemen beban kerja terbaik menggunakan alurku. untuk menjaga tim tetap produktif dan bahagia.",
                    "content": "<p>Membagi kerja secara adil menjaga tim tetap bahagia dan loyal.</p><h2>1. Lacak Estimasi Waktu (ETC)</h2><p>Pastikan setiap tugas yang dibuat memiliki estimasi waktu pengerjaan (ETC) yang jelas sebelum ditugaskan.</p><h2>2. Gunakan Fitur Drag & Drop</h2><p>Jika visual grafik menunjukkan salah satu anggota tim berada dalam zona merah (overload), Anda dapat langsung menyeret salah satu kartu tugas mereka di dasbor analitik dan memindahkannya ke anggota tim yang kapasitasnya masih longgar.</p>",
                    "language": "id",
                    "translation_key": "fair-task-distribution"
                },
                
                # EN Articles
                {
                    "title": "How to Create Your First Project",
                    "slug": "how-to-create-your-first-project",
                    "category": "Get Started",
                    "category_slug": "panduan-memulai",
                    "duration": "3 min read",
                    "description": "Easy steps to create a new project board, add team members, and import tasks from a spreadsheet.",
                    "content": "<p>Getting started with your first project on <strong>alurku.</strong> is simple. Follow these steps to build an organized workspace:</p><h2>1. Log in to Dashboard</h2><p>Open the app and ensure you are logged in using your Google Account.</p><h2>2. Click 'New Project' Button</h2><p>On the sidebar or main dashboard, click the <strong>+ New Project</strong> button.</p><h2>3. Define Project Name & Type</h2><p>Enter your project name (e.g., 'Website Redesign'). Choose the project type: <strong>Team Project</strong> for team collaboration, or <strong>Private Project</strong> if this is for personal tracking.</p><h2>4. Start Using Kanban Board</h2><p>Your new project will be initialized with default status columns (To Do, In Progress, Done). You can start adding tasks immediately!</p>",
                    "language": "en",
                    "translation_key": "create-first-project"
                },
                {
                    "title": "Understanding Status & Priority Columns",
                    "slug": "understanding-status-priority-columns",
                    "category": "Get Started",
                    "category_slug": "panduan-memulai",
                    "duration": "5 min read",
                    "description": "Learn the best practices to organize Kanban workflow columns and assign correct task priority levels.",
                    "content": "<p>Managing status and priority levels correctly is the key to maintaining a smooth workflow in <strong>alurku.</strong>.</p><h2>1. Kanban Status Columns</h2><p>The default project board uses three primary columns:</p><ul><li><strong>To Do</strong>: Houses newly planned tasks that haven't been started yet.</li><li><strong>In Progress</strong>: Tasks currently being worked on by team members.</li><li><strong>Done</strong>: Tasks that have been fully completed and verified.</li></ul><h2>2. Assigning Priority Levels</h2><p>Every task can be marked with a priority to guide focus:</p><ul><li><strong>Low</strong>: Supporting tasks with flexible deadlines.</li><li><strong>Medium</strong>: Standard tasks that should be completed soon.</li><li><strong>High</strong>: Urgent tasks that directly affect overall project progress.</li></ul>",
                    "language": "en",
                    "translation_key": "status-priority"
                },
                {
                    "title": "Inviting Team Members to Project Boards",
                    "slug": "inviting-team-members-to-project-boards",
                    "category": "Get Started",
                    "category_slug": "panduan-memulai",
                    "duration": "2 min read",
                    "description": "Collaboration made easy. A short guide on how to share project links and manage team access permissions.",
                    "content": "<p>Collaboration is the core strength of <strong>alurku.</strong>. Here is how to quickly invite your colleagues:</p><h2>1. Open the Project</h2><p>Navigate to the project you want to share from the main dashboard.</p><h2>2. Go to Team Settings</h2><p>In the top header area of the project, click on <strong>Team ➔ Manage Team</strong>.</p><h2>3. Enter Username or Email</h2><p>Type the corporate username or registered email of your team member from the same Workspace, then click <strong>Invite</strong>.</p><h2>4. Invitation Notification</h2><p>Your colleague will receive a notification in their sidebar and can join the project with a single click.</p>",
                    "language": "en",
                    "translation_key": "invite-members"
                },
                {
                    "title": "Using the Automated AI Planner Feature",
                    "slug": "using-the-automated-ai-planner-feature",
                    "category": "AI Assistant Help",
                    "category_slug": "bantuan-asisten-ai",
                    "duration": "6 min read",
                    "description": "How AI breaks down tasks and predicts their durations. Tips on writing drafts to get more accurate AI results.",
                    "content": "<p>The AI Planner inside <strong>alurku.</strong> reduces your planning time by up to 80%.</p><h2>1. Access the AI Planner</h2><p>Click the <strong>Smart Assistant (✨)</strong> button in the bottom right corner of the application.</p><h2>2. Provide a Rough Draft of Your Plan</h2><p>Type your project idea in natural language, e.g., <em>'Create a website homepage design project with research, wireframing, coding, and deployment phases.'</em></p><h2>3. AI Automatically Breaks Down Tasks</h2><p>The AI will analyze your input, break it down into logical subtasks, realistically estimate their durations, and generate a draft ready to be saved.</p>",
                    "language": "en",
                    "translation_key": "ai-planner"
                },
                {
                    "title": "Summarizing Meeting Notes into Task Lists",
                    "slug": "summarizing-meeting-notes-into-task-lists",
                    "category": "AI Assistant Help",
                    "category_slug": "bantuan-asisten-ai",
                    "duration": "4 min read",
                    "description": "Guide to recording meeting minutes in real-time and letting alurku.'s AI automatically break them into subtasks.",
                    "content": "<p>Turn chaotic meeting notes into clean, actionable work items.</p><h2>1. Copy Your Meeting Notes</h2><p>Gather the notes or raw transcripts from your team meeting into a text format.</p><h2>2. Send to Smart Assistant</h2><p>Open the Smart Assistant chat and paste the notes with the instruction: <em>'Convert these meeting notes into a list of tasks.'</em></p><h2>3. Confirm Tasks</h2><p>The AI will extract who is responsible for what, set deadlines, and automatically build cards in your chosen project board.</p>",
                    "language": "en",
                    "translation_key": "meeting-summary"
                },
                {
                    "title": "Embedding Project Context in Comments",
                    "slug": "embedding-project-context-in-comments",
                    "category": "AI Assistant Help",
                    "category_slug": "bantuan-asisten-ai",
                    "duration": "3 min read",
                    "description": "How to invoke AI with tags in task threads to answer technical questions based on descriptions and attachments.",
                    "content": "<p>Use our AI assistant as a dedicated project consultant directly inside the task comment thread.</p><h2>1. Open Task Details</h2><p>Click on any task card to open the detail panel.</p><h2>2. Mention @ai</h2><p>In the comment box, type your query mentioning <strong>@ai</strong> (e.g., <em>'@ai, please suggest a charting library for this task'</em>).</p><h2>3. Contextual AI Response</h2><p>The AI will read the task description, attachments, and respond to your comment with relevant technical answers.</p>",
                    "language": "en",
                    "translation_key": "project-comments"
                },
                {
                    "title": "How to Read Team Workload Charts",
                    "slug": "how-to-read-team-workload-charts",
                    "category": "Workload Management",
                    "category_slug": "manajemen-beban-kerja",
                    "duration": "4 min read",
                    "description": "Understand team capacity percentages and identify overloaded members before burnout occurs.",
                    "content": "<p>Prevent team burnout with transparent workload analytics.</p><h2>1. Open the Analytics Tab</h2><p>From the main top navigation, select the <strong>Analytics</strong> tab.</p><h2>2. Monitor Capacity Percentages</h2><p>Every team member's active capacity will be displayed visually:</p><ul><li><strong>Below 70% (Light)</strong>: Member is ready for more assignments.</li><li><strong>70% - 90% (Optimal)</strong>: Ideal workload balance.</li><li><strong>Above 95% (Critical/Overload)</strong>: Risk of burnout; needs immediate task redistribution.</li></ul>",
                    "language": "en",
                    "translation_key": "workload-charts"
                },
                {
                    "title": "Strategies for Fair Task Distribution",
                    "slug": "strategies-for-fair-task-distribution",
                    "category": "Workload Management",
                    "category_slug": "manajemen-beban-kerja",
                    "duration": "5 min read",
                    "description": "Best practices for workload management using alurku. to keep teams productive and happy.",
                    "content": "<p>Distributing work fairly keeps your team motivated and prevents bottlenecks.</p><h2>1. Track Estimated Time (ETC)</h2><p>Always ensure tasks have clear Estimated Time to Complete (ETC) values before assigning them.</p><h2>2. Drag & Drop Task Re-assignment</h2><p>If the workload visualization shows a team member in the red zone (overloaded), simply drag a task from their card in the analytics dashboard and drop it onto another team member who is underutilized.</p>",
                    "language": "en",
                    "translation_key": "fair-task-distribution"
                }
            ]
            for art_data in default_articles:
                new_art = Article(**art_data)
                db.add(new_art)
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
