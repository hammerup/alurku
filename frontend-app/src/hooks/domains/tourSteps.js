export function getTourSteps({
  selectedBoard,
  tMsg,
  setIsFormOpen,
  getDriverObj,
  driverRef,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  const driverObj = getDriverObj ? getDriverObj() : null;
  return         !selectedBoard || selectedBoard.id === 'global'
          ? [
              {
                popover: {
                  title: tMsg('Welcome to alurku.! 🚀', 'Selamat datang di alurku.! 🚀'),
                  description: tMsg(
                    'This is your main dashboard. Let us give you a quick tour! Click the logo anytime to return here.',
                    'Ini adalah dasbor utama kamu. Yuk mulai tur singkat! Klik logo kapan saja untuk kembali ke sini.'
                  ),
                  side: 'bottom',
                  align: 'start',
                },
              },
              {
                element: '.tour-ai-briefing',
                popover: {
                  title: tMsg('AI Daily Briefing', 'Ringkasan Harian AI'),
                  description: tMsg(
                    'Get a quick AI-powered summary of your workload and priorities for the day.',
                    'Dapatkan ringkasan singkat bertenaga AI tentang beban kerja dan prioritasmu hari ini.'
                  ),
                  side: 'bottom',
                  align: 'start',
                },
              },
              {
                element: '.tour-my-capacity',
                popover: {
                  title: tMsg('Your Capacity Meter', 'Pengukur Kapasitasmu'),
                  description: tMsg(
                    "This meter shows your remaining active workload in hours. It also warns you if you're approaching a weekly or monthly overload, helping you manage your bandwidth.",
                    'Pengukur ini menunjukkan sisa beban kerja aktif kamu dalam jam. Ini juga akan memberi peringatan jika mendekati batas mingguan atau bulanan, membantumu mengelola kapasitas kerja.'
                  ),
                  side: 'bottom',
                  align: 'start',
                },
              },
              {
                element: '.tour-quick-stats',
                popover: {
                  title: tMsg('Quick Stats', 'Statistik Cepat'),
                  description: tMsg(
                    'Keep an eye on your personal tasks, active projects, and any overdue or critical items.',
                    'Pantau tugas pribadimu, proyek aktif, dan tugas yang terlambat atau kritis.'
                  ),
                  side: 'top',
                  align: 'start',
                },
              },
              {
                element: '.tour-top-queue',
                popover: {
                  title: tMsg('My Top Queue', 'Antrean Teratas'),
                  description: tMsg(
                    'Tackle your highest priority pending tasks here to keep your work flowing smoothly.',
                    'Selesaikan tugas prioritas tertinggimu di sini agar pekerjaan tetap mengalir lancar.'
                  ),
                  side: 'top',
                  align: 'start',
                },
              },
              {
                element: '.tour-recent-comments',
                popover: {
                  title: tMsg('Recent Comments', 'Komentar Terbaru'),
                  description: tMsg(
                    'Stay in the loop with the latest discussions, task updates, and teammate feedback.',
                    'Pantau diskusi terbaru, pembaruan tugas, dan masukan dari rekan tim.'
                  ),
                  side: 'top',
                  align: 'start',
                },
              },
              {
                element: '.tour-home-new-project',
                popover: {
                  title: tMsg('Create a Project', 'Buat Proyek'),
                  description: tMsg(
                    'Start a new project workspace here. You can invite your team members later.',
                    'Mulai ruang kerja proyek baru di sini. Kamu dapat mengundang anggota tim kapan saja.'
                  ),
                  side: 'left',
                  align: 'start',
                },
              },
              {
                element: '.tour-global-board',
                popover: {
                  title: tMsg('Global Board', 'Papan Global'),
                  description: tMsg(
                    'Access your Global Board from the sidebar anytime to see tasks from all projects.',
                    'Akses Papan Global dari bilah sisi kapan saja untuk melihat tugas dari semua proyek.'
                  ),
                  side: 'right',
                  align: 'start',
                },
                onHighlightStarted: () => {
                  if (window.innerWidth < 768 && !isMobileMenuOpen) {
                    setIsMobileMenuOpen(true);
                  }
                },
              },
              {
                element: '.tour-my-todolist',
                popover: {
                  title: tMsg('Personal Tasks', 'Tugas Pribadi'),
                  description: tMsg(
                    'Access your private scratchpad workspace here. These tasks are isolated and only visible to you.',
                    'Akses ruang kerja catatan pribadi kamu di sini. Tugas di sini terisolasi dan hanya dapat kamu lihat sendiri.'
                  ),
                  side: 'right',
                  align: 'start',
                },
                onHighlightStarted: () => {
                  if (window.innerWidth < 768 && !isMobileMenuOpen) {
                    setIsMobileMenuOpen(true);
                  }
                },
              },
              {
                element: '.tour-project-card',
                popover: {
                  title: tMsg('Your Projects', 'Proyekmu'),
                  description: tMsg(
                    'Your individual project workspaces will appear here in the sidebar.',
                    'Ruang kerja proyek kamu akan muncul di bilah sisi ini.'
                  ),
                  side: 'right',
                  align: 'start',
                },
                onHighlightStarted: () => {
                  if (window.innerWidth < 768 && !isMobileMenuOpen) {
                    setIsMobileMenuOpen(true);
                  }
                },
              },
              {
                element: '.tour-quick-actions',
                popover: {
                  title: tMsg('Quick Actions', 'Aksi Cepat'),
                  description: tMsg(
                    'Quickly access chat, export your data, view notifications, and open settings.',
                    'Akses obrolan dengan cepat, ekspor data, lihat notifikasi, dan buka pengaturan.'
                  ),
                  side: 'right',
                  align: 'start',
                },
                onHighlightStarted: () => {
                  if (window.innerWidth < 768 && !isMobileMenuOpen) {
                    setIsMobileMenuOpen(true);
                  }
                },
              },
              {
                element: window.innerWidth >= 768 ? '.tour-account-menu' : '.tour-account-menu-mobile',
                popover: {
                  title: tMsg('Account Options', 'Opsi Akun'),
                  description: tMsg(
                    'Manage your profile, set personal leaves, or start this tour again from the Account menu.',
                    'Kelola profil, atur cuti pribadi, atau mulai tur ini lagi dari menu Akun.'
                  ),
                  side: 'bottom',
                  align: 'start',
                },
                onHighlightStarted: () => {
                  if (window.innerWidth < 768 && isMobileMenuOpen) {
                    setIsMobileMenuOpen(false);
                  }
                },
              },
              {
                popover: {
                  title: tMsg("You're All Set! 🎉", 'Semua Siap! 🎉'),
                  description: tMsg(
                    "That's the end of the tour! Now let's put it into practice. Go ahead and create your first project to get started!",
                    'Sekian tur kali ini! Sekarang yuk kita praktikkan. Buat proyek pertamamu sekarang untuk memulai!'
                  ),
                  align: 'center',
                },
              },
            ]
          : [
              {
                element: window.innerWidth >= 768 ? '.tour-board-title' : '.tour-board-title-mobile',
                popover: {
                  title: tMsg('Home Dashboard', 'Beranda Utama'),
                  description: tMsg(
                    'Click the alurku. logo anytime to return to your Home Dashboard.',
                    'Klik logo alurku. kapan saja untuk kembali ke Beranda Utama kamu.'
                  ),
                  side: 'right',
                  align: 'center',
                },
              },
              {
                element: '.tour-breadcrumb',
                popover: {
                  title: tMsg('Project Path', 'Jalur Proyek'),
                  description: tMsg(
                    'Here you can easily identify the name of the current project workspace.',
                    'Di sini kamu dapat dengan mudah melihat nama ruang kerja proyek saat ini.'
                  ),
                  side: 'bottom',
                  align: 'start',
                },
              },
              {
                element: '.tour-team-menu',
                popover: {
                  title: tMsg('Manage Team & Invites', 'Kelola Tim & Undangan'),
                  description: tMsg(
                    'Invite your colleagues to this project or manage their access here. You will also see project invitation notifications here.',
                    'Undang rekan tim ke proyek ini atau kelola akses mereka di sini. Notifikasi undangan proyek juga akan muncul di sini.'
                  ),
                  side: 'bottom',
                  align: 'start',
                },
              },

              {
                element: '.tour-views',
                popover: {
                  title: tMsg('Workspace Views', 'Tampilan Ruang Kerja'),
                  description: tMsg(
                    'Switch between Kanban, Table List, Analytics Dashboard, Timeline (Gantt), and Calendar modes.',
                    'Beralih antara mode Papan Kanban, Daftar Tabel, Dasbor Analitik, Lini Masa (Gantt), dan Kalender.'
                  ),
                  side: 'bottom',
                  align: 'start',
                },
              },
              {
                element: '.tour-filters',
                popover: {
                  title: tMsg('Smart Filters', 'Filter Cerdas'),
                  description: tMsg(
                    'Filter tasks by status, category, or click "My Tasks" to instantly see your workload.',
                    'Saring tugas berdasarkan status, kategori, atau klik "Tugas Saya" untuk langsung melihat beban kerjamu.'
                  ),
                  side: 'bottom',
                  align: 'start',
                },
              },
              {
                element: '.tour-new-task',
                popover: {
                  title: tMsg('Create Task', 'Buat Tugas'),
                  description: tMsg(
                    "Let's simulate creating a request! Click the actual \"New Request\" button to open the form.",
                    'Yuk simulasikan pembuatan tugas! Klik tombol "Tugas Baru" yang asli untuk membuka formulir.'
                  ),
                  side: 'left',
                  align: 'start',
                  showButtons: ['previous'],
                },
                onHighlighted: () => {
                  if (driverRef.current) driverRef.current.isAtNewTask = true;
                },
                onDeselected: () => {
                  if (driverRef.current) driverRef.current.isAtNewTask = false;
                },
              },
              {
                element: '.tour-form-ai-input',
                popover: {
                  title: tMsg('Smart Assistant AI', 'Asisten Pintar AI'),
                  description: tMsg(
                    'You can now type your request naturally and let the AI draft the task, deadline, and checklist for you!',
                    'Kamu kini dapat mengetik kebutuhanmu secara alami dan biarkan AI menyusun tugas, tenggat waktu, dan daftar periksa untukmu!'
                  ),
                  side: 'bottom',
                  align: 'start',
                },
                onPrevClick: () => {
                  setIsFormOpen(false);
                  setTimeout(() => driverObj.movePrevious(), 300);
                },
              },
              {
                element: '.tour-form-manual-btn',
                popover: {
                  title: tMsg('Manual Entry', 'Isi Manual'),
                  description: tMsg(
                    'Prefer the old way? Click "Just Fill Manually" to open the standard task form.',
                    'Lebih suka cara standar? Klik "Isi Manual Saja" untuk membuka formulir tugas biasa.'
                  ),
                  side: 'top',
                  align: 'start',
                  showButtons: ['previous'],
                },
                onHighlighted: () => {
                  if (driverRef.current) driverRef.current.isAtManualBtn = true;
                },
                onDeselected: () => {
                  if (driverRef.current) driverRef.current.isAtManualBtn = false;
                },
              },
              {
                element: '.tour-form-project',
                popover: {
                  title: tMsg('Task Title', 'Judul Tugas'),
                  description: tMsg(
                    'Enter the title of your campaign or task here.',
                    'Masukkan judul tugas atau proyekmu di sini.'
                  ),
                  side: 'top',
                  align: 'start',
                },
                onPrevClick: () => {
                  setIsFormOpen(false);
                  setTimeout(() => driverObj.moveTo(4), 300);
                },
              },
              {
                element: '.tour-form-requester',
                popover: {
                  title: tMsg('Smart Assignment', 'Penugasan Cerdas'),
                  description: tMsg(
                    'Type a name, or type "@" to search and instantly assign this to a team member. They will get an email!',
                    'Ketik nama, atau ketik "@" untuk mencari dan langsung menugaskan ini ke rekan tim. Mereka akan mendapat notifikasi email!'
                  ),
                  side: 'top',
                  align: 'start',
                },
              },
              {
                element: '.tour-form-deadline',
                popover: {
                  title: tMsg('Smart Deadline', 'Tenggat Waktu Cerdas'),
                  description: tMsg(
                    'Pick a deadline. Our system automatically avoids weekends and public holidays!',
                    'Pilih tenggat waktu. Sistem kami otomatis menghindari akhir pekan dan libur nasional!'
                  ),
                  side: 'top',
                  align: 'start',
                },
              },
              {
                element: '.tour-form-checklist',
                popover: {
                  title: tMsg('Sub-task Delegation', 'Delegasi Sub-tugas'),
                  description: tMsg(
                    'Break down the task into smaller checklists and assign them to different people.',
                    'Pecah tugas menjadi daftar periksa yang lebih terperinci dan delegasikan ke rekan tim.'
                  ),
                  side: 'top',
                  align: 'start',
                },
              },
              {
                element: '.tour-form-submit',
                popover: {
                  title: tMsg('Submit Request', 'Kirim Permintaan'),
                  description: tMsg(
                    'Once filled, hit Create Task. That concludes our workspace tour! 🚀',
                    'Setelah terisi, tekan Buat Tugas. Selesai sudah tur ruang kerja kita! 🚀'
                  ),
                  side: 'top',
                  align: 'start',
                },
                onNextClick: () => {
                  setIsFormOpen(false);
                  driverObj.moveNext();
                },
              },
            ];
}
