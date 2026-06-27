import React from 'react';

export default function LandingAboutPage() {
  return (
    <div className="py-24 bg-white dark:bg-neutral-950 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#111E38] dark:text-white mb-6">
            Misi Kami: Menyeimbangkan Produktivitas
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Di Alurku, kami percaya bahwa produktivitas terbaik tidak lahir dari tekanan kerja berlebih, melainkan dari alur eksekusi yang seimbang dan teratur.
          </p>
        </div>

        {/* Content sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 reveal-on-scroll">
          <div>
            <h2 className="text-3xl font-black text-[#111E38] dark:text-white mb-6 tracking-tight">
              Filosofi Brand Alurku
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-4">
              Nama **Alurku** diambil dari keinginan kami untuk memberikan kebebasan bagi setiap individu dan organisasi untuk memiliki alur kerjanya sendiri (*"My Flow"*). 
            </p>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6">
              Dengan tagline utama kami, **"Kuasai Waktumu, Lancarkan Alurmu"**, kami menggeser fokus teknologi manajemen dari sekadar "kecepatan tinggi" menjadi "pengelolaan beban kerja manusia secara harmonis".
            </p>
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold block text-sm mb-1">Motto Utama Kami</span>
              <p className="text-slate-700 dark:text-slate-300 italic text-sm font-medium">
                "Kerja keras itu penting, namun menjaga keseimbangan dan kebahagiaan tim adalah kunci dari kesuksesan jangka panjang."
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-neutral-900 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Hubungi Kami</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
              Punya pertanyaan seputar produk, kemitraan, atau butuh bantuan teknis? Kirimkan pesan Anda langsung kepada tim kami.
            </p>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block">Hubungi via Email</span>
                  <a href="mailto:ekahary89@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    ekahary89@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block">Kantor Utama</span>
                  <span className="text-slate-750 dark:text-slate-350">Jakarta, Indonesia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
