'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface LaptopReviewModalProps {
  laptop: {
    id: number;
    name: string;
    brand: string;
  } | null;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export default function LaptopReviewModal({
  laptop,
  onClose,
  onSubmitSuccess,
}: LaptopReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!laptop) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Silakan tulis ulasan singkat pengalaman Anda.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      // Simpan ulasan lokal
      try {
        const key = `lapmatch_reviews_${laptop.id}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({
          rating,
          comment: comment.trim(),
          date: new Date().toISOString(),
        });
        localStorage.setItem(key, JSON.stringify(existing));
      } catch {}

      setIsSubmitting(false);
      toast.success('Terima kasih! Ulasan & rating Anda berhasil disimpan. ⭐');
      onSubmitSuccess?.();
      onClose();
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-[#0e0e15] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-5"
        >
          {/* Top Bar Accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-violet-500 to-cyan-400 rounded-t-3xl" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {laptop.brand}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1.5 leading-snug">
              Beri Rating & Ulasan untuk {laptop.name}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Bantu sesama mahasiswa mengetahui kelebihan dan kenyamanan penggunaan laptop ini.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Interactive Stars */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Skor Penilaian (1 - 5 Bintang):
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = (hoverRating ?? rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl transition transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          filled
                            ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                            : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-mono font-bold text-amber-300 ml-2">
                  {rating} dari 5 Bintang
                </span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Ulasan & Pengalaman Kamu:
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Bagikan kesan kamu tentang keyboard, kecepatan prosesor, daya tahan baterai, atau bobot saat dibawa kuliah..."
                rows={4}
                className="w-full p-3 rounded-2xl bg-zinc-950/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Menyimpan...' : 'Kirim Ulasan'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
