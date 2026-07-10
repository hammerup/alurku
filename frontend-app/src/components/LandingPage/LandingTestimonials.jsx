import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function LandingTestimonials({ language }) {
  const isId = language === 'id';
  const carouselRef = useRef(null);

  const testimonials = isId ? [
    {
      stars: 5,
      quote: "Sistem UI-nya sangat rapi. Tidak ada fitur berlebihan yang justru bikin bingung. Fokus pada hasil.",
      name: "Rina Kusumawati",
      role: "Freelance Designer",
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
      stars: 5,
      quote: "Peringatan beban kerja (workload) sangat berharga. Saya jadi tahu kapan harus istirahat dan menolak tugas baru.",
      name: "Davi Prasetyo",
      role: "Software Engineer",
      avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
      stars: 4,
      quote: "Sebelumnya, tim saya selalu berdebat siapa yang harus mengerjakan apa. Sekarang semua transparan.",
      name: "Budi Santoso",
      role: "Project Manager",
      avatar: "https://i.pravatar.cc/150?img=8"
    }
  ] : [
    {
      stars: 5,
      quote: "The UI system is super neat. No bloated features that confuse you. Just focus on results.",
      name: "Rina Kusumawati",
      role: "Freelance Designer",
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
      stars: 5,
      quote: "The workload alerts are invaluable. I now know when to rest and decline new tasks.",
      name: "Davi Prasetyo",
      role: "Software Engineer",
      avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
      stars: 4,
      quote: "Before, my team always argued about who does what. Now everything is transparent.",
      name: "Budi Santoso",
      role: "Project Manager",
      avatar: "https://i.pravatar.cc/150?img=8"
    }
  ];

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-24 bg-neutral-50 flex justify-center overflow-hidden">
      <div className="max-w-7xl w-full px-6 lg:px-12 relative flex items-center">
        
        <button 
          onClick={scrollLeft}
          className="absolute left-2 lg:left-4 z-10 w-10 h-10 bg-white rounded-full shadow-md border border-neutral-100 flex items-center justify-center text-neutral-600 hover:text-[#111E38] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div 
          ref={carouselRef}
          className="flex space-x-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-4 px-4 w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testi, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="min-w-[320px] max-w-[400px] flex-shrink-0 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 snap-center"
            >
              <div className="flex space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < testi.stars ? 'fill-[#FACC15] text-[#FACC15]' : 'fill-neutral-200 text-neutral-200'}`} />
                ))}
              </div>
              <p className="text-neutral-700 text-sm leading-relaxed mb-8">
                "{testi.quote}"
              </p>
              <div className="flex items-center space-x-3 mt-auto">
                <img src={testi.avatar} alt={testi.name} className="w-10 h-10 rounded-full object-cover bg-neutral-100" />
                <div>
                  <h4 className="font-bold text-[#111E38] text-sm">{testi.name}</h4>
                  <p className="text-neutral-500 text-xs">{testi.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={scrollRight}
          className="absolute right-2 lg:right-4 z-10 w-10 h-10 bg-white rounded-full shadow-md border border-neutral-100 flex items-center justify-center text-neutral-600 hover:text-[#111E38] transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>
    </section>
  );
}
