import React from 'react';

export default function LandingGuidePage() {
  const guides = [
    {
      category: 'Panduan Memulai',
      articles: [
        {
          title: 'Cara Membuat Proyek Pertama Anda',
          duration: 'Baca 3 menit',
          description: 'Langkah mudah untuk membuat papan proyek baru, menambahkan anggota tim, dan mengimpor tugas dari spreadsheet.'
        },
        {
          title: 'Memahami Kolom Status & Prioritas',
          duration: 'Baca 5 menit',
          description: 'Pelajari cara terbaik untuk mengatur kolom alur kerja Kanban dan menetapkan tingkat prioritas tugas yang tepat.'
        },
        {
          title: 'Mengundang Anggota Tim ke Papan Proyek',
          duration: 'Baca 2 menit',
          description: 'Kolaborasi menjadi mudah. Panduan singkat tentang cara membagikan tautan proyek dan mengatur hak akses anggota tim.'
        }
      ]
    },
    {
      category: 'Bantuan Asisten AI',
      articles: [
        {
          title: 'Menggunakan Fitur Asisten Perencana Otomatis',
          duration: 'Baca 6 menit',
          description: 'Bagaimana AI memprediksi durasi dan menyusun jadwal harian Anda. Tips menuliskan draf kasar agar hasil AI lebih akurat.'
        },
        {
          title: 'Meringkas Hasil Rapat ke Daftar Tugas',
          duration: 'Baca 4 menit',
          description: 'Panduan merekam poin rapat Anda secara real-time dan membiarkan AI Alurku memecahnya menjadi sub-tugas secara otomatis.'
        },
        {
          title: 'Menyematkan Konteks Proyek di Kolom Komentar',
          duration: 'Baca 3 menit',
          description: 'Cara memanggil AI dengan tag di thread tugas untuk menjawab pertanyaan teknis berdasarkan deskripsi dan lampiran.'
        }
      ]
    },
    {
      category: 'Manajemen Beban Kerja',
      articles: [
        {
          title: 'Cara Membaca Grafik Beban Kerja (Workload)',
          duration: 'Baca 4 menit',
          description: 'Memahami persentase kapasitas tim dan mengidentifikasi anggota yang mengalami kelebihan beban sebelum burnout terjadi.'
        },
        {
          title: 'Strategi Pembagian Tugas yang Adil',
          duration: 'Baca 5 menit',
          description: 'Metodologi manajemen beban kerja terbaik menggunakan Alurku untuk menjaga tim tetap produktif dan bahagia.'
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
            Pusat Panduan & Dokumentasi Alurku
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Temukan panduan langkah demi langkah, tips produktivitas, dan dokumentasi bantuan lengkap untuk memaksimalkan penggunaan Alurku.
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
                    <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-left mt-6 flex items-center gap-1">
                      Baca artikel selengkapnya <span>→</span>
                    </button>
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
