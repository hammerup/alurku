import React from 'react';

export default function LandingGuidePage({ language }) {
  const tMsg = (en, id) => (language === 'id' ? id : en);

  const guides = [
    {
      category: tMsg('Get Started', 'Panduan Memulai'),
      articles: [
        {
          topic: 'workspace',
          title: tMsg('How to Create Your First Project', 'Cara Membuat Proyek Pertama Anda'),
          duration: tMsg('3 min read', 'Baca 3 menit'),
          description: tMsg(
            'Easy steps to create a new project board, add team members, and import tasks from a spreadsheet.',
            'Langkah mudah untuk membuat papan proyek baru, menambahkan anggota tim, dan mengimpor tugas dari spreadsheet.'
          )
        },
        {
          topic: 'tasks',
          title: tMsg('Understanding Status & Priority Columns', 'Memahami Kolom Status & Prioritas'),
          duration: tMsg('5 min read', 'Baca 5 menit'),
          description: tMsg(
            'Learn the best practices to organize Kanban workflow columns and assign correct task priority levels.',
            'Pelajari cara terbaik untuk mengatur kolom alur kerja Kanban dan menetapkan tingkat prioritas tugas yang tepat.'
          )
        },
        {
          topic: 'workspace',
          title: tMsg('Inviting Team Members to Project Boards', 'Mengundang Anggota Tim ke Papan Proyek'),
          duration: tMsg('2 min read', 'Baca 2 menit'),
          description: tMsg(
            'Collaboration made easy. A short guide on how to share project links and manage team access permissions.',
            'Kolaborasi menjadi mudah. Panduan singkat tentang cara membagikan tautan proyek dan mengatur hak akses anggota tim.'
          )
        }
      ]
    },
    {
      category: tMsg('AI Assistant Help', 'Bantuan Asisten AI'),
      articles: [
        {
          topic: 'overview',
          title: tMsg('Using the Automated AI Planner Feature', 'Menggunakan Fitur Asisten Perencana Otomatis'),
          duration: tMsg('6 min read', 'Baca 6 menit'),
          description: tMsg(
            'How AI breaks down tasks and predicts their durations. Tips on writing drafts to get more accurate AI results.',
            'Bagaimana AI memecah tugas dan memprediksi durasinya. Tips menuliskan draf kasar agar hasil AI lebih akurat.'
          )
        },
        {
          topic: 'tasks',
          title: tMsg('Summarizing Meeting Notes into Task Lists', 'Meringkas Hasil Rapat ke Daftar Tugas'),
          duration: tMsg('4 min read', 'Baca 4 menit'),
          description: tMsg(
            "Guide to recording meeting minutes in real-time and letting alurku.'s AI automatically break them into subtasks.",
            "Panduan merekam poin rapat Anda secara real-time dan membiarkan AI alurku. memecahnya menjadi sub-tugas secara otomatis."
          )
        },
        {
          topic: 'tasks',
          title: tMsg('Embedding Project Context in Comments', 'Menyematkan Konteks Proyek di Kolom Komentar'),
          duration: tMsg('3 min read', 'Baca 3 menit'),
          description: tMsg(
            'How to invoke AI with tags in task threads to answer technical questions based on descriptions and attachments.',
            'Cara memanggil AI dengan tag di thread tugas untuk menjawab pertanyaan teknis berdasarkan deskripsi dan lampiran.'
          )
        }
      ]
    },
    {
      category: tMsg('Workload Management', 'Manajemen Beban Kerja'),
      articles: [
        {
          topic: 'overview',
          title: tMsg('How to Read Team Workload Charts', 'Cara Membaca Grafik Beban Kerja (Workload)'),
          duration: tMsg('4 min read', 'Baca 4 menit'),
          description: tMsg(
            'Understand team capacity percentages and identify overloaded members before burnout occurs.',
            'Memahami persentase kapasitas tim dan mengidentifikasi anggota yang mengalami kelebihan beban sebelum burnout terjadi.'
          )
        },
        {
          topic: 'tasks',
          title: tMsg('Strategies for Fair Task Distribution', 'Strategi Pembagian Tugas yang Adil'),
          duration: tMsg('5 min read', 'Baca 5 menit'),
          description: tMsg(
            'Best practices for workload management using alurku. to keep teams productive and happy.',
            'Metodologi manajemen beban kerja terbaik menggunakan alurku. untuk menjaga tim tetap produktif dan bahagia.'
          )
        }
      ]
    }
  ];

  return (
    <div className="py-24 bg-white dark:bg-neutral-950 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#111E38] dark:text-white mb-6">
            {tMsg('alurku. Help & Documentation Center', 'Pusat Panduan & Dokumentasi alurku.')}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {tMsg(
              'Find step-by-step guides, productivity tips, and comprehensive help documentation to maximize your use of alurku.',
              'Temukan panduan langkah demi langkah, tips produktivitas, dan dokumentasi bantuan lengkap untuk memaksimalkan penggunaan alurku.'
            )}
          </p>
        </div>

        {/* Guides Container */}
        <div className="space-y-16">
          {guides.map((section, idx) => (
            <div key={idx} className="reveal-on-scroll">
              <h2 className="text-2xl font-black text-[#111E38] dark:text-white mb-8 border-b border-slate-100 dark:border-slate-800 pb-3">
                {section.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {section.articles.map((art, aIdx) => (
                  <div
                    key={aIdx}
                    className="bg-slate-50 dark:bg-neutral-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-1 px-2.5 rounded-full font-bold inline-block mb-4">
                        {art.duration}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                        {art.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {art.description}
                      </p>
                    </div>
                    <a 
                      href={`/dokumentasi?topic=${art.topic}`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState({}, '', `/dokumentasi?topic=${art.topic}`);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                        window.scrollTo({ top: 0 });
                      }}
                      className="text-xs font-bold bg-[#FACC15] text-[#111E38] hover:bg-yellow-500 py-2 px-4 rounded-xl text-center mt-6 flex items-center justify-center gap-2 transition-colors w-max"
                    >
                      {tMsg('Read more', 'Baca selengkapnya')} <span className="text-lg leading-none">→</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
