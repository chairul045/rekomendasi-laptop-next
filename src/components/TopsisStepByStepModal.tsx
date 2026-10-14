'use client';

import { useState } from 'react';
import { X, Sparkles, HelpCircle, Layers, CheckCircle2, ChevronRight, Calculator } from 'lucide-react';

export interface CriterionInfo {
  kode: string;
  nama: string;
  tipe: string; // 'benefit' | 'cost'
  bobot: number;
  prioritas?: number;
}

export interface TopsisCalculationItem {
  laptopId: number;
  nama: string;
  merek: string;
  harga: number;
  ram: number;
  storage: number;
  baterai: number;
  berat: number;
  performa: number;
  dPos: number;
  dNeg: number;
  nilaiV: number;
  skorPersen: number;
  peringkat: number;
}

export interface TopsisCalculationData {
  ranked: TopsisCalculationItem[];
  matrixX: Record<number, Record<string, number>>;
  matrixR: Record<number, Record<string, number>>;
  matrixY: Record<number, Record<string, number>>;
  idealPositive: Record<string, number>;
  idealNegative: Record<string, number>;
}

interface TopsisStepByStepModalProps {
  data: TopsisCalculationData | null;
  criteria: CriterionInfo[];
  conditionLabel?: string;
  onClose: () => void;
}

export default function TopsisStepByStepModal({
  data,
  criteria,
  conditionLabel = 'Laptop Baru',
  onClose,
}: TopsisStepByStepModalProps) {
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!data || !data.ranked || data.ranked.length === 0) return null;

  const codes = criteria.map((c) => c.kode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0e0e15] border border-white/15 text-zinc-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colorful top border accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30">
              <Calculator className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Transparansi Algoritma TOPSIS
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-950/60 text-violet-300 border border-violet-800/60 font-mono capitalize">
                  {conditionLabel}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Langkah-langkah matematis terperinci pembentukan matriks keputusan hingga nilai preferensi $V_i$.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Switcher Tabs */}
        <div className="p-3 sm:px-6 bg-zinc-950/60 border-b border-white/10 overflow-x-auto flex items-center gap-2">
          {[
            { step: 1, title: '1. Matriks Keputusan (X)' },
            { step: 2, title: '2. Normalisasi (R)' },
            { step: 3, title: '3. Terbobot (Y)' },
            { step: 4, title: '4. Solusi Ideal (A+, A-)' },
            { step: 5, title: '5. Jarak & Skor Preferensi (V)' },
          ].map((tab) => (
            <button
              key={tab.step}
              type="button"
              onClick={() => setActiveStep(tab.step)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeStep === tab.step
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span>{tab.title}</span>
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* STEP 1: Matriks Keputusan X */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-1 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Tahap 1: Pembentukan Matriks Keputusan ($X$)</span>
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  Matriks X (m × n) berisi nilai pengukuran riil dari setiap laptop alternatif
                  terhadap kriteria C1 (Harga), C2 (Performa), C3 (RAM), C4 (Storage), C5 (Baterai), dan C6 (Portabilitas/Bobot).
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead className="bg-zinc-950/90 text-zinc-400 font-mono border-b border-white/10">
                    <tr>
                      <th className="p-3">Alternatif Laptop</th>
                      {criteria.map((c) => (
                        <th key={c.kode} className="p-3">
                          <div className="text-white font-bold">{c.kode}</div>
                          <div className="text-[10px] text-zinc-400 font-normal truncate max-w-[100px]">
                            {c.nama}
                          </div>
                          <span
                            className={`inline-block px-1 py-0.2 rounded text-[9px] uppercase font-mono ${
                              c.tipe === 'cost'
                                ? 'bg-amber-950 text-amber-300'
                                : 'bg-emerald-950 text-emerald-300'
                            }`}
                          >
                            {c.tipe}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#0e0e15]/50">
                    {data.ranked.map((item) => (
                      <tr key={item.laptopId} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-semibold text-white">
                          <div className="truncate max-w-[200px]">{item.nama}</div>
                          <span className="text-[10px] font-mono text-zinc-500">#{item.laptopId}</span>
                        </td>
                        {codes.map((code) => {
                          const val = data.matrixX[item.laptopId]?.[code] ?? 0;
                          return (
                            <td key={code} className="p-3 font-mono text-zinc-300">
                              {code === 'C1' ? `Rp ${val.toLocaleString('id-ID')}` : val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 2: Matriks Normalisasi R */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-1 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  <span>Tahap 2: Normalisasi Matriks Keputusan ($R$)</span>
                </span>
                <p className="text-zinc-400 leading-relaxed font-mono text-[11px]">
                  Rumus: r_ij = x_ij / √(∑ x_kj²)
                </p>
                <p className="text-zinc-400">
                  Setiap elemen matriks dinormalisasi menjadi skala Euclidean tanpa satuan (0 sampai 1).
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead className="bg-zinc-950/90 text-zinc-400 font-mono border-b border-white/10">
                    <tr>
                      <th className="p-3">Alternatif</th>
                      {criteria.map((c) => (
                        <th key={c.kode} className="p-3">
                          <div className="text-white font-bold">{c.kode}</div>
                          <span className="text-[10px] text-zinc-400">{c.nama}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#0e0e15]/50">
                    {data.ranked.map((item) => (
                      <tr key={item.laptopId} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-semibold text-white truncate max-w-[200px]">
                          {item.nama}
                        </td>
                        {codes.map((code) => {
                          const val = data.matrixR[item.laptopId]?.[code] ?? 0;
                          return (
                            <td key={code} className="p-3 font-mono text-cyan-300">
                              {val.toFixed(4)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: Matriks Ternormalisasi Terbobot Y */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-1 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>Tahap 3: Matriks Ternormalisasi Terbobot ($Y$)</span>
                </span>
                <p className="text-zinc-400 leading-relaxed font-mono text-[11px]">
                  Rumus: y_ij = w_j × r_ij
                </p>
                <p className="text-zinc-400">
                  Hasil normalisasi dikalikan dengan bobot kriteria ($w_j$) yang dihasilkan dari metode Rank Order Centroid (ROC).
                </p>
              </div>

              {/* Criteria ROC Weights pill bar */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                {criteria.map((c) => (
                  <div key={c.kode} className="p-2.5 rounded-xl bg-zinc-950 border border-white/10 text-center">
                    <span className="font-mono text-zinc-400 text-[10px] block">{c.kode} (w_{c.kode})</span>
                    <span className="text-cyan-300 font-bold font-mono">{(c.bobot * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead className="bg-zinc-950/90 text-zinc-400 font-mono border-b border-white/10">
                    <tr>
                      <th className="p-3">Alternatif</th>
                      {criteria.map((c) => (
                        <th key={c.kode} className="p-3">
                          <div className="text-white font-bold">{c.kode}</div>
                          <span className="text-[10px] text-zinc-500 font-mono">w = {c.bobot.toFixed(4)}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#0e0e15]/50">
                    {data.ranked.map((item) => (
                      <tr key={item.laptopId} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-semibold text-white truncate max-w-[200px]">
                          {item.nama}
                        </td>
                        {codes.map((code) => {
                          const val = data.matrixY[item.laptopId]?.[code] ?? 0;
                          return (
                            <td key={code} className="p-3 font-mono text-violet-300">
                              {val.toFixed(4)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: Solusi Ideal Positif & Negatif */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-1 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Tahap 4: Solusi Ideal Positif ($A^+$) & Negatif ($A^-$)</span>
                </span>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  - Untuk Kriteria <strong>Benefit</strong>: $A^+$ mengambil nilai maksimum, $A^-$ mengambil nilai minimum.<br />
                  - Untuk Kriteria <strong>Cost</strong>: $A^+$ mengambil nilai minimum, $A^-$ mengambil nilai maksimum.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead className="bg-zinc-950/90 text-zinc-400 font-mono border-b border-white/10">
                    <tr>
                      <th className="p-3">Solusi Ideal</th>
                      {criteria.map((c) => (
                        <th key={c.kode} className="p-3 font-mono">
                          <span className="text-white font-bold">{c.kode}</span>
                          <span
                            className={`block text-[9px] uppercase font-mono ${
                              c.tipe === 'cost' ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            ({c.tipe})
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#0e0e15]/50">
                    {/* A+ */}
                    <tr className="bg-emerald-950/20">
                      <td className="p-3 font-bold text-emerald-300 font-mono">
                        Solusi Ideal Positif (A⁺)
                      </td>
                      {codes.map((code) => (
                        <td key={code} className="p-3 font-mono font-bold text-emerald-300">
                          {(data.idealPositive[code] ?? 0).toFixed(4)}
                        </td>
                      ))}
                    </tr>
                    {/* A- */}
                    <tr className="bg-rose-950/20">
                      <td className="p-3 font-bold text-rose-300 font-mono">
                        Solusi Ideal Negatif (A⁻)
                      </td>
                      {codes.map((code) => (
                        <td key={code} className="p-3 font-mono font-bold text-rose-300">
                          {(data.idealNegative[code] ?? 0).toFixed(4)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 5: Jarak Solusi & Nilai Preferensi V */}
          {activeStep === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-1 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  <span>Tahap 5: Perhitungan Jarak Euclidean & Nilai Preferensi ($V_i$)</span>
                </span>
                <p className="text-zinc-400 leading-relaxed font-mono text-[11px]">
                  D_i⁺ = √[ ∑ (y_ij - y_j⁺)² ] &nbsp;|&nbsp; D_i⁻ = √[ ∑ (y_ij - y_j⁻)² ]<br />
                  V_i = D_i⁻ / (D_i⁺ + D_i⁻)
                </p>
                <p className="text-zinc-400">
                  Nilai $V_i$ mendekati 1 menandakan laptop memiliki kedekatan tertinggi dengan solusi ideal terbaik.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead className="bg-zinc-950/90 text-zinc-400 font-mono border-b border-white/10">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">Alternatif Laptop</th>
                      <th className="p-3 font-mono text-emerald-400">Jarak D⁺</th>
                      <th className="p-3 font-mono text-rose-400">Jarak D⁻</th>
                      <th className="p-3 font-mono text-cyan-300">Nilai Preferensi (V_i)</th>
                      <th className="p-3 font-mono text-amber-300">Skor Persen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#0e0e15]/50 font-mono">
                    {data.ranked.map((item, index) => (
                      <tr
                        key={item.laptopId}
                        className={index === 0 ? 'bg-amber-500/10' : 'hover:bg-white/[0.02]'}
                      >
                        <td className="p-3 font-bold text-white">
                          {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                        </td>
                        <td className="p-3 font-sans font-semibold text-white">
                          <div className="truncate max-w-[240px]">{item.nama}</div>
                        </td>
                        <td className="p-3 text-emerald-300">{item.dPos.toFixed(4)}</td>
                        <td className="p-3 text-rose-300">{item.dNeg.toFixed(4)}</td>
                        <td className="p-3 font-bold text-cyan-300 text-sm">{item.nilaiV.toFixed(6)}</td>
                        <td className="p-3 font-extrabold text-amber-300 text-sm">{item.skorPersen}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            disabled={activeStep <= 1}
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none text-zinc-300 border border-white/10 transition"
          >
            ← Tahap Sebelumnya
          </button>

          <span className="text-zinc-500 font-mono">
            Tahap {activeStep} dari 5
          </span>

          <button
            type="button"
            disabled={activeStep >= 5}
            onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold transition shadow-md"
          >
            Tahap Selanjutnya →
          </button>
        </div>
      </div>
    </div>
  );
}
