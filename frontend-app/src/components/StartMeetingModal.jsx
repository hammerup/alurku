import React, { useState } from 'react';

export default function StartMeetingModal({
  isOpen,
  onClose,
  title = 'Meeting',
  roomName = 'general-room',
  targetMention = '@all',
  onSendMeetingLink,
  language = 'id',
  showNotification,
}) {
  const [activeTab, setActiveTab] = useState('instant'); // 'instant' | 'gmeet'
  const [gmeetLinkInput, setGmeetLinkInput] = useState('');

  if (!isOpen) return null;

  const tMsg = (en, id) => (language === 'id' ? id : en);

  const cleanRoomSlug = (roomName || 'meeting')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const jitsiRoomUrl = `https://meet.jit.si/alurku-${cleanRoomSlug || 'meeting'}`;

  const openPopup = (url) => {
    const popupFeatures =
      'width=1000,height=700,left=100,top=100,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes';
    window.open(url, 'MeetingPopup', popupFeatures);
  };

  const handleStartInstantMeeting = () => {
    openPopup(jitsiRoomUrl);
    if (onSendMeetingLink) {
      onSendMeetingLink(jitsiRoomUrl, 'Ruang Instan Video');
    }
    if (showNotification) {
      showNotification(
        tMsg('Instant meeting room opened & invitation shared to chat!', 'Ruang meeting instan dibuka & undangan dibagikan ke chat!'),
        'success'
      );
    }
    onClose();
  };

  const handleOpenNewGMeet = () => {
    openPopup('https://meet.google.com/new');
    if (showNotification) {
      showNotification(
        tMsg('Google Meet opened in a new window! Copy the link and paste it below.', 'Google Meet dibuka di jendela baru! Salin tautannya dan tempel di bawah.'),
        'info'
      );
    }
  };

  const handleShareGMeetLink = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    let link = gmeetLinkInput.trim();
    if (!link) return;

    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      if (link.includes('meet.google.com/')) {
        link = `https://${link}`;
      } else {
        link = `https://meet.google.com/${link}`;
      }
    }

    if (onSendMeetingLink) {
      onSendMeetingLink(link, 'Google Meet');
    }
    if (showNotification) {
      showNotification(
        tMsg('Google Meet link shared to chat successfully!', 'Tautan Google Meet berhasil dibagikan ke obrolan!'),
        'success'
      );
    }
    setGmeetLinkInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-70 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-neutral-950 p-6 sm:p-8 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl text-left relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-emerald-200 dark:border-emerald-800/50 shrink-0">
            <span className="material-symbols-outlined text-2xl">videocam</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black text-[#111E38] dark:text-white uppercase tracking-tight truncate">
              {tMsg('Start Video Meeting', 'Mulai Pertemuan Video')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {title}
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-900 p-1 mb-5 border border-neutral-200/80 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'instant'
                ? 'bg-white dark:bg-neutral-800 text-[#111E38] dark:text-[#FACC15] shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <span className="text-sm">⚡</span>
            <span>{tMsg('1-Click Instant Room', 'Ruang Instan 1-Klik')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gmeet')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'gmeet'
                ? 'bg-white dark:bg-neutral-800 text-[#111E38] dark:text-[#FACC15] shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <span className="text-sm">🎥</span>
            <span>{tMsg('Google Meet', 'Google Meet')}</span>
          </button>
        </div>

        {/* Option 1: 1-Click Instant Room (Deterministic Shared Video Room) */}
        {activeTab === 'instant' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <div className="font-bold text-[#111E38] dark:text-[#FACC15] flex items-center gap-1.5 mb-1">
                <span>✨</span>
                <span>{tMsg('Automatic Shared Room', 'Otomatis Masuk Ruangan yang Sama')}</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                {tMsg(
                  'All team members who click the chat invitation will automatically land in the exact same room with HD video, screen sharing, and no login required.',
                  'Semua anggota tim yang mengklik undangan di obrolan akan langsung masuk ke ruangan yang sama persis tanpa perlu login atau menyalin kode.'
                )}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartInstantMeeting}
                className="w-full py-3 px-4 rounded-xl font-bold bg-[#FACC15] text-[#111E38] hover:bg-amber-400 transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider hover:-translate-y-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">video_call</span>
                <span>{tMsg('Start & Invite to Chat', 'Buka & Bagikan ke Chat')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Option 2: Official Google Meet with Link Sharing */}
        {activeTab === 'gmeet' && (
          <form onSubmit={handleShareGMeetLink} className="space-y-4 animate-fadeIn">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 block uppercase tracking-wider">
                {tMsg('Step 1: Create Meeting Room', 'Langkah 1: Buat Ruang Meeting')}
              </label>
              <button
                type="button"
                onClick={handleOpenNewGMeet}
                className="w-full py-2.5 px-4 rounded-xl font-bold bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 transition-all flex items-center justify-center gap-2 text-xs shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-emerald-500 text-base">open_in_new</span>
                <span>{tMsg('Open Google Meet (New Tab)', 'Buka Google Meet (Tab Baru)')}</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 block uppercase tracking-wider">
                {tMsg('Step 2: Paste Generated Link / Code', 'Langkah 2: Tempel Link / Kode Meeting')}
              </label>
              <input
                type="text"
                value={gmeetLinkInput}
                onChange={(e) => setGmeetLinkInput(e.target.value)}
                placeholder="https://meet.google.com/xxx-yyyy-zzz"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs transition-colors uppercase tracking-wider cursor-pointer"
              >
                {tMsg('Cancel', 'Batal')}
              </button>
              <button
                type="submit"
                disabled={!gmeetLinkInput.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                <span>{tMsg('Share to Chat', 'Kirim ke Chat')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
