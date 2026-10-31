# -*- coding: utf-8 -*-
import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_callout_box(cell, bg_color="F1F5F9", border_color="4F46E5"):
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=180)
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="32" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)

def set_table_borders(table, border_color="CBD5E1"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="{border_color}"/>
            <w:left w:val="none"/>
            <w:bottom w:val="single" w:sz="8" w:space="0" w:color="{border_color}"/>
            <w:right w:val="none"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def add_callout(doc, text, bold_prefix="CATATAN PENTING: ", bg_color="EEF2FF", border_color="4F46E5"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(6.5)
    cell = table.cell(0, 0)
    set_callout_box(cell, bg_color, border_color)
    p = cell.paragraphs[0]
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.space_before = Pt(2)
    
    r_prefix = p.add_run(bold_prefix)
    r_prefix.bold = True
    r_prefix.font.name = 'Calibri'
    r_prefix.font.size = Pt(10)
    r_prefix.font.color.rgb = RGBColor(79, 70, 229) if border_color == "4F46E5" else RGBColor(16, 185, 129)
    
    r_text = p.add_run(text)
    r_text.font.name = 'Calibri'
    r_text.font.size = Pt(9.5)
    r_text.font.color.rgb = RGBColor(30, 41, 59)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def format_row(row, heights=None, bg_color=None, is_header=False):
    for idx, cell in enumerate(row.cells):
        if bg_color:
            set_cell_background(cell, bg_color)
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        for p in cell.paragraphs:
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.line_spacing = 1.1
            for run in p.runs:
                run.font.name = 'Calibri'
                if is_header:
                    run.bold = True
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = RGBColor(255, 255, 255)
                else:
                    run.font.size = Pt(9)
                    run.font.color.rgb = RGBColor(30, 41, 59)

def main():
    doc = Document()
    
    # Page setup
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(1)
        s.bottom_margin = Inches(1)
        s.left_margin = Inches(1)
        s.right_margin = Inches(1)
        s.different_first_page_header_footer = False
        
        # Header & Footer
        header = s.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("LAPMATCH • Laporan Progres Pengembangan Web & Marketing")
        hrun.font.name = 'Calibri'
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(148, 163, 184)
        
        footer = s.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Lapmatch Platform © 2026 | Dokumen Pembaruan Progres Proyek")
        frun.font.name = 'Calibri'
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(148, 163, 184)

    # ─────────────────────────────────────────────────────────────────────────────
    # COVER / HEADER BANNER
    # ─────────────────────────────────────────────────────────────────────────────
    
    # Check if logo exists
    logo_path = os.path.abspath("public/logo.png")
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_after = Pt(12)
        run_img = p_logo.add_run()
        run_img.add_picture(logo_path, width=Inches(1.3))

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    run_t1 = p_title.add_run("LAPORAN PROGRES PENGEMBANGAN WEBSITE\n")
    run_t1.bold = True
    run_t1.font.name = 'Calibri'
    run_t1.font.size = Pt(22)
    run_t1.font.color.rgb = RGBColor(30, 27, 75) # Navy Deep

    run_t2 = p_title.add_run("PLATFORM LAPMATCH (SMART LAPTOP MATCHING ENGINE)")
    run_t2.bold = True
    run_t2.font.name = 'Calibri'
    run_t2.font.size = Pt(15)
    run_t2.font.color.rgb = RGBColor(79, 70, 229) # Indigo

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(4)
    p_sub.paragraph_format.space_after = Pt(18)
    run_sub = p_sub.add_run(
        "Pembaruan Fitur: Uji Banding Laptop Baru & Second, Identitas Pengguna Multi-Persona\n"
        "(Mahasiswa, Pekerja, Pelajar, Dosen), Serta Peluncuran Kanal Promosi Instagram & TikTok"
    )
    run_sub.font.name = 'Calibri'
    run_sub.font.size = Pt(10.5)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(100, 116, 139)

    # Metadata Table
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False
    meta_table.columns[0].width = Inches(2.2)
    meta_table.columns[1].width = Inches(4.3)
    set_table_borders(meta_table, "E2E8F0")

    metadata_items = [
        ("Nama Aplikasi / Web", "Lapmatch (Smart Laptop Matching Platform)"),
        ("Teknologi Pendukung", "Next.js 15, TypeScript, Tailwind CSS, Supabase PostgreSQL, Google Gemini AI"),
        ("Status Pembaruan", "Progres Fitur Utama & Kampanye Digital Selesai Diimplementasikan"),
        ("Ruang Lingkup Laporan", "Fitur Komparasi Baru/Second, Multi-Role User, dan Promosi Media Sosial")
    ]

    for idx, (label, val) in enumerate(metadata_items):
        row = meta_table.rows[idx]
        set_cell_background(row.cells[0], "F8FAFC")
        set_cell_background(row.cells[1], "FFFFFF")
        
        c0 = row.cells[0].paragraphs[0]
        c0.paragraph_format.space_after = Pt(2)
        c0.paragraph_format.space_before = Pt(2)
        r0 = c0.add_run(label)
        r0.bold = True
        r0.font.name = 'Calibri'
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = RGBColor(51, 65, 85)
        
        c1 = row.cells[1].paragraphs[0]
        c1.paragraph_format.space_after = Pt(2)
        c1.paragraph_format.space_before = Pt(2)
        r1 = c1.add_run(val)
        r1.font.name = 'Calibri'
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(15, 23, 42)
        
        set_cell_margins(row.cells[0], top=80, bottom=80, left=120, right=120)
        set_cell_margins(row.cells[1], top=80, bottom=80, left=120, right=120)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ─────────────────────────────────────────────────────────────────────────────
    # RINGKASAN EKSEKUTIF
    # ─────────────────────────────────────────────────────────────────────────────
    h_exec = doc.add_paragraph()
    h_exec.paragraph_format.space_before = Pt(14)
    h_exec.paragraph_format.space_after = Pt(4)
    r = h_exec.add_run("RINGKASAN EKSEKUTIF")
    r.bold = True
    r.font.name = 'Calibri'
    r.font.size = Pt(13)
    r.font.color.rgb = RGBColor(30, 27, 75)

    p_exec = doc.add_paragraph()
    p_exec.paragraph_format.space_after = Pt(6)
    p_exec.paragraph_format.line_spacing = 1.15
    p_exec.add_run(
        "Dokumen ini disusun sebagai wujud pertanggungjawaban dan rekapitulasi progres pengembangan terkini website "
        "Lapmatch. Platform Lapmatch dirancang sebagai sistem pendukung keputusan (SPK) cerdas berbasis integrasi metode "
        "Rank Order Centroid (ROC) dan Technique for Order Preference by Similarity to Ideal Solution (TOPSIS), yang diperkaya "
        "analisis Artificial Intelligence (Google Gemini). "
        "Pada iterasi pengembangan fase ini, terdapat tiga pencapaian strategis besar yang telah berhasil direalisasikan, yaitu: "
        "(1) Penyediaan fitur uji banding (komparasi) komprehensif antara laptop kondisi baru dan second (bekas); "
        "(2) Implementasi sistem identitas pengguna berorientasi multi-persona (Mahasiswa, Pekerja/Profesional, Pelajar, Dosen, dan Umum); "
        "serta (3) Eksekusi strategi pemasaran digital melalui pembuatan dan optimalisasi akun media sosial resmi Instagram dan TikTok."
    )

    add_callout(
        doc,
        "Pembaruan ini menjawab tantangan nyata para pencari laptop di Indonesia yang kerap bingung memilih antara membeli unit baru bergaransi "
        "atau unit second dengan spesifikasi tinggi namun harga lebih terjangkau, sekaligus memastikan sistem mengenali latar belakang pengguna "
        "untuk memberikan analisis rekomendasi yang tepat sasaran.",
        bold_prefix="INTISARI PEMBARUAN: "
    )

    # ─────────────────────────────────────────────────────────────────────────────
    # BAB 1: PROGRES FITUR UJI BANDING LAPTOP BARU DAN SECOND
    # ─────────────────────────────────────────────────────────────────────────────
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(4)
    r1 = h1.add_run("BAB 1: PROGRES PEMBARUAN FITUR 1 – SISTEM UJI BANDING (KOMPARASI) LAPTOP BARU & SECOND")
    r1.bold = True
    r1.font.name = 'Calibri'
    r1.font.size = Pt(12)
    r1.font.color.rgb = RGBColor(30, 27, 75)

    p1_1 = doc.add_paragraph()
    p1_1.paragraph_format.space_after = Pt(6)
    p1_1.paragraph_format.line_spacing = 1.15
    p1_1.add_run(
        "1.1. Latar Belakang & Urgensi Fitur Komparasi Baru vs. Second\n"
        "Dalam kondisi ekonomi dan tren pasar teknologi saat ini, calon pembeli sering kali dihadapkan pada dilema krusial: "
        "apakah harus membeli laptop baru kelas entry-level dengan garansi resmi pabrikan, atau membeli laptop bekas/second kelas "
        "business/flagship yang memiliki performa komputasi jauh lebih tinggi pada kisaran budget yang sama. "
        "Sebelum pembaruan ini, platform belum menyediakan media komparasi visual langsung antarkondisi. "
        "Kini, Lapmatch secara resmi menghadirkan fitur Uji Banding Berdampingan (Side-by-Side Comparison) yang memungkinkan "
        "pengguna menyandingkan laptop baru dan second secara transparan, adil, dan objektif."
    )

    p1_2 = doc.add_paragraph()
    p1_2.paragraph_format.space_after = Pt(6)
    p1_2.paragraph_format.line_spacing = 1.15
    p1_2.add_run(
        "1.2. Rincian Teknis & Pengalaman Pengguna (UX)\n"
        "Fitur ini bekerja secara dinamis baik pada halaman Katalog Laptop maupun pada halaman Rekomendasi Hasil Kuisioner. "
        "Pengguna dapat memilih hingga beberapa unit laptop secara bersamaan dan membuka Modal Komparasi Berdampingan "
        "(LaptopCompareModal.tsx). Sistem menyajikan tabel metrik terstandarisasi dengan keunggulan berikut:"
    )

    # Bullet points
    points_1 = [
        ("Filter Kondisi di Kuisioner: ", "Pengguna dapat memfilter sejak awal pada tahap kuisioner apakah ingin mencari 'Hanya Baru (Garansi Resmi)', 'Hanya Second (Hemat Budget)', atau 'Semua Kondisi (Keduanya)'."),
        ("Indikator Keunggulan Otomatis (Winner Badges): ", "Sistem secara pintar menghitung dan memberikan label visual pemenang, seperti badge 'Paling Hemat' pada laptop dengan harga terendah, 'Skor Tertinggi' pada laptop dengan performa komposit unggul, serta penanda RAM, SSD, dan Baterai terbaik."),
        ("Perbandingan Spesifikasi Lengkap: ", "Menyandingkan Prosesor, Grafis (VGA), RAM (GB), Penyimpanan SSD (GB), Ukuran Layar, Daya Tahan Baterai (Jam), dan Bobot Fisik (Kg)."),
        ("Tautan Cek Toko / Marketplace Langsung: ", "Dilengkapi tombol direct link menuju Tokopedia, Shopee, dan Blibli untuk mempermudah pengecekan ketersediaan stok riil dan varian garansi.")
    ]
    for b_title, b_desc in points_1:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(3)
        bp.paragraph_format.line_spacing = 1.15
        r_bt = bp.add_run(b_title)
        r_bt.bold = True
        r_bt.font.name = 'Calibri'
        r_bt.font.size = Pt(9.5)
        r_bt.font.color.rgb = RGBColor(15, 23, 42)
        r_bd = bp.add_run(b_desc)
        r_bd.font.name = 'Calibri'
        r_bd.font.size = Pt(9.5)
        r_bd.font.color.rgb = RGBColor(51, 65, 85)

    # Tabel Perbandingan Karakteristik Baru vs Second
    p_tbl1_title = doc.add_paragraph()
    p_tbl1_title.paragraph_format.space_before = Pt(8)
    p_tbl1_title.paragraph_format.space_after = Pt(4)
    r_t1t = p_tbl1_title.add_run("Tabel 1.1: Matriks Analisis Uji Banding Laptop Kondisi Baru vs. Second pada Lapmatch")
    r_t1t.bold = True
    r_t1t.font.name = 'Calibri'
    r_t1t.font.size = Pt(9.5)
    r_t1t.font.color.rgb = RGBColor(79, 70, 229)

    table1 = doc.add_table(rows=6, cols=3)
    table1.alignment = WD_TABLE_ALIGNMENT.CENTER
    table1.autofit = False
    table1.columns[0].width = Inches(1.8)
    table1.columns[1].width = Inches(2.3)
    table1.columns[2].width = Inches(2.4)
    set_table_borders(table1, "CBD5E1")

    headers1 = ["Parameter Komparasi", "Laptop Kondisi Baru", "Laptop Kondisi Second (Bekas)"]
    for idx, text in enumerate(headers1):
        table1.rows[0].cells[idx].paragraphs[0].add_run(text)
    format_row(table1.rows[0], bg_color="1E1B4B", is_header=True)

    data1 = [
        ("Efisiensi Anggaran (Harga)", "Harga standar ritel resmi pabrikan. Depresiasi harga relatif cepat di tahun awal.", "Harga jauh lebih terjangkau (hemat 30% - 60% dibanding harga rilis baru)."),
        ("Spesifikasi & Skor Performa", "Mendapatkan prosesor generasi terbaru, namun pada budget terbatas pilihan komponen lebih minim.", "Bisa mendapatkan spesifikasi tinggi (Core i7 / Ryzen 7, RAM 16GB) di budget setara laptop baru entry-level."),
        ("Jaminan & Garansi", "Garansi resmi pabrikan aktif 1 - 2 tahun penuh. Ketenangan pakai terjamin bebas rasa cemas.", "Garansi toko / personal relatif pendek (1 minggu - 3 bulan). Butuh ketelitian cek kondisi fisik/baterai."),
        ("Daya Tahan Baterai", "Baterai 100% sehat dengan siklus siklus daya (cycle count) nol dan efisiensi prima.", "Health battery umumnya 75% - 90%. Sistem Lapmatch memperhitungkan estimasi jam kerja riil."),
        ("Target Segmen Rekomendasi", "Cocok untuk mahasiswa baru/pekerja yang memprioritaskan ketenangan pemakaian jangka panjang.", "Sangat pas untuk mahasiswa komputasi/desain dengan budget ketat namun butuh performa kencang.")
    ]

    for row_idx, data_row in enumerate(data1, start=1):
        row = table1.rows[row_idx]
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, cell_value in enumerate(data_row):
            row.cells[col_idx].paragraphs[0].add_run(cell_value)
        format_row(row, bg_color=bg, is_header=False)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ─────────────────────────────────────────────────────────────────────────────
    # BAB 2: PROGRES IDENTITAS PENGGUNA MULTI-PERSONA
    # ─────────────────────────────────────────────────────────────────────────────
    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(4)
    r2 = h2.add_run("BAB 2: PROGRES PEMBARUAN FITUR 2 – SISTEM IDENTITAS PENGGUNA MULTI-PERSONA")
    r2.bold = True
    r2.font.name = 'Calibri'
    r2.font.size = Pt(12)
    r2.font.color.rgb = RGBColor(30, 27, 75)

    p2_1 = doc.add_paragraph()
    p2_1.paragraph_format.space_after = Pt(6)
    p2_1.paragraph_format.line_spacing = 1.15
    p2_1.add_run(
        "2.1. Latar Belakang Pengembangan Identitas Pengguna\n"
        "Setiap individu memiliki profil kebutuhan komputasi yang sangat berbeda. Mahasiswa umumnya membutuhkan laptop serbaguna "
        "yang ringan untuk dibawa ke kampus dan tahan baterai, sedangkan pekerja profesional lebih menuntut stabilitas kinerja, "
        "keamanan data, dan kecepatan multitasking. "
        "Pada versi sebelumnya, sistem belum memfasilitasi pengenalan identitas profesi pengguna secara terstruktur. "
        "Dalam progres terbaru, Lapmatch telah mengintegrasikan fitur Seleksi Identitas Pengguna saat Pendaftaran (Register Step 1) "
        "serta Pengaturan Profil Akun."
    )

    p2_2 = doc.add_paragraph()
    p2_2.paragraph_format.space_after = Pt(6)
    p2_2.paragraph_format.line_spacing = 1.15
    p2_2.add_run(
        "2.2. Klasifikasi Persona Pengguna yang Diterapkan di Web\n"
        "Sistem kini menyediakan 5 opsi identitas persona utama lengkap dengan badge visual, ikon tematik, dan deskripsi kebutuhan:"
    )

    # Tabel Persona Identitas
    p_tbl2_title = doc.add_paragraph()
    p_tbl2_title.paragraph_format.space_before = Pt(6)
    p_tbl2_title.paragraph_format.space_after = Pt(4)
    r_t2t = p_tbl2_title.add_run("Tabel 2.1: Matriks Segmentasi Identitas Pengguna pada Sistem Lapmatch")
    r_t2t.bold = True
    r_t2t.font.name = 'Calibri'
    r_t2t.font.size = Pt(9.5)
    r_t2t.font.color.rgb = RGBColor(79, 70, 229)

    table2 = doc.add_table(rows=6, cols=4)
    table2.alignment = WD_TABLE_ALIGNMENT.CENTER
    table2.autofit = False
    table2.columns[0].width = Inches(1.5)
    table2.columns[1].width = Inches(0.9)
    table2.columns[2].width = Inches(2.2)
    table2.columns[3].width = Inches(1.9)
    set_table_borders(table2, "CBD5E1")

    headers2 = ["Identitas Pengguna", "Kategori", "Karakteristik & Beban Kebutuhan", "Prioritas Kriteria Utama"]
    for idx, text in enumerate(headers2):
        table2.rows[0].cells[idx].paragraphs[0].add_run(text)
    format_row(table2.rows[0], bg_color="1E1B4B", is_header=True)

    data2 = [
        ("Mahasiswa (S1 / D3)", "Akademik", "Pengerjaan skripsi/tugas akhir, praktikum laboratorium, coding, browsing riset banyak tab, dan mobilitas tinggi antarkelas.", "Portabilitas (C6), Baterai (C5), Harga Hemat (C1)"),
        ("Pekerja / Profesional", "Karir", "Produktivitas kantoran, multitasking dokumen kompleks, video conference harian, coding intensif, desain grafis & bisnis digital.", "Performa CPU (C2), RAM 16GB+ (C3), Kecepatan SSD (C4)"),
        ("Pelajar (SMA / SMK)", "Sekolah", "Tugas harian sekolah, aplikasi office standar, ujian daring, multimedia pembelajaran, dan pembuatan konten kreatif ringan.", "Harga Terjangkau (C1), Baterai Awet (C5), Daya Tahan Fisik"),
        ("Dosen / Tenaga Pendidik", "Pengajar", "Penyusunan materi kuliah, evaluasi akademik, riset jurnal ilmiah, presentasi projektor perkuliahan, dan fleksibilitas berpindah ruang.", "Portabilitas Ringan (C6), Baterai Tahan Lama (C5), Konektivitas Port"),
        ("Lainnya / Umum", "Fleksibel", "Penggunaan personal rumahan, streaming hiburan, manajemen toko online/wirausaha mikro, atau hobi kasual.", "Keseimbangan Harga dan Spesifikasi Serbaguna (All-Rounder)")
    ]

    for row_idx, data_row in enumerate(data2, start=1):
        row = table2.rows[row_idx]
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, cell_value in enumerate(data_row):
            row.cells[col_idx].paragraphs[0].add_run(cell_value)
        format_row(row, bg_color=bg, is_header=False)

    p2_3 = doc.add_paragraph()
    p2_3.paragraph_format.space_before = Pt(8)
    p2_3.paragraph_format.space_after = Pt(6)
    p2_3.paragraph_format.line_spacing = 1.15
    p2_3.add_run(
        "2.3. Dampak Integrasi Identitas ke Algoritma & AI\n"
        "Pemberian identitas pengguna tidak sekadar berfungsi sebagai label statis di profil, melainkan langsung memberikan dampak:"
    )
    
    impacts = [
        ("Preset Bobot Cerdas (ROC): ", "Ketika pengguna memilih peruntukan pemakaian yang relevan dengan profesinya (contoh: Mahasiswa memilih 'Kuliah & Tugas Harian'), sistem secara otomatis mengurutkan kriteria prioritas (C1 Efisiensi Harga, C5 Baterai, C6 Portabilitas)."),
        ("Analisis AI Persona: ", "Modul AI (Google Gemini) yang terintegrasi di web Lapmatch membaca profil identitas pengguna untuk menghasilkan penjelasan rekomendasi yang kontekstual, misalnya: 'Laptop ini sangat cocok bagi Anda selaku Mahasiswa Teknik karena RAM 16GB memudahkan kompilasi software dan bodi yang ringan mudah dibawa ke ruang kuliah.'"),
        ("Riwayat & Manajemen Akun: ", "Pengguna dapat memantau seluruh riwayat konsultasi laptop masa lalu yang tersimpan rapi berdasarkan tanggal dan persona kebutuhan.")
    ]
    for b_title, b_desc in impacts:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(3)
        bp.paragraph_format.line_spacing = 1.15
        r_bt = bp.add_run(b_title)
        r_bt.bold = True
        r_bt.font.name = 'Calibri'
        r_bt.font.size = Pt(9.5)
        r_bt.font.color.rgb = RGBColor(15, 23, 42)
        r_bd = bp.add_run(b_desc)
        r_bd.font.name = 'Calibri'
        r_bd.font.size = Pt(9.5)
        r_bd.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ─────────────────────────────────────────────────────────────────────────────
    # BAB 3: PROGRES PEMASARAN DIGITAL (INSTAGRAM & TIKTOK)
    # ─────────────────────────────────────────────────────────────────────────────
    h3 = doc.add_paragraph()
    h3.paragraph_format.space_before = Pt(14)
    h3.paragraph_format.space_after = Pt(4)
    r3 = h3.add_run("BAB 3: PROGRES PEMASARAN & PUBLIKASI DIGITAL – PELUNCURAN AKUN INSTAGRAM & TIKTOK")
    r3.bold = True
    r3.font.name = 'Calibri'
    r3.font.size = Pt(12)
    r3.font.color.rgb = RGBColor(30, 27, 75)

    p3_1 = doc.add_paragraph()
    p3_1.paragraph_format.space_after = Pt(6)
    p3_1.paragraph_format.line_spacing = 1.15
    p3_1.add_run(
        "3.1. Inisiasi Saluran Media Sosial Resmi\n"
        "Untuk memperluas adopsi pengguna, meningkatkan brand awareness, serta menjembatani platform web dengan target audiens utama "
        "(generasi muda, mahasiswa, pelajar, dan first-jobber), telah diinisiasi dan dibuat akun resmi media sosial Lapmatch "
        "pada dua platform dengan pertumbuhan dan engagement tertinggi di Indonesia: Instagram dan TikTok."
    )

    add_callout(
        doc,
        "Peluncuran akun Instagram dan TikTok ini menandai transisi penting platform Lapmatch dari sekadar sistem web berbasis lokal/akademis "
        "menjadi produk digital yang aktif berinteraksi dengan komunitas pengguna nyata dan siap melayani publik secara luas.",
        bold_prefix="PENCAPAIAN MARKETING: ",
        bg_color="ECFDF5",
        border_color="10B981"
    )

    p3_2 = doc.add_paragraph()
    p3_2.paragraph_format.space_after = Pt(6)
    p3_2.paragraph_format.line_spacing = 1.15
    p3_2.add_run(
        "3.2. Strategi Konten dan Pilar Kampanye Tiap Platform\n"
        "Masing-masing kanal dirancang dengan strategi komunikasi dan format konten yang disesuaikan secara spesifik:"
    )

    # Tabel Rencana Konten Medsos
    p_tbl3_title = doc.add_paragraph()
    p_tbl3_title.paragraph_format.space_before = Pt(6)
    p_tbl3_title.paragraph_format.space_after = Pt(4)
    r_t3t = p_tbl3_title.add_run("Tabel 3.1: Matriks Strategi Konten Media Sosial Resmi Lapmatch")
    r_t3t.bold = True
    r_t3t.font.name = 'Calibri'
    r_t3t.font.size = Pt(9.5)
    r_t3t.font.color.rgb = RGBColor(79, 70, 229)

    table3 = doc.add_table(rows=5, cols=4)
    table3.alignment = WD_TABLE_ALIGNMENT.CENTER
    table3.autofit = False
    table3.columns[0].width = Inches(1.3)
    table3.columns[1].width = Inches(1.5)
    table3.columns[2].width = Inches(2.2)
    table3.columns[3].width = Inches(1.5)
    set_table_borders(table3, "CBD5E1")

    headers3 = ["Kanal Medsos", "Format Konten Utama", "Topik / Tema Edukasi & Promosi", "Target & Call to Action (CTA)"]
    for idx, text in enumerate(headers3):
        table3.rows[0].cells[idx].paragraphs[0].add_run(text)
    format_row(table3.rows[0], bg_color="1E1B4B", is_header=True)

    data3 = [
        ("Instagram\n(@lapmatch.id)", "Carousel Infografis & Feed Statis", "• Komparasi visual: Laptop Baru vs Laptop Second Rp 5 Jutaan\n• Tips cek fisik & baterai saat beli laptop bekas\n• Panduan spesifikasi laptop sesuai jurusan kuliah", "Mengarahkan traffic ke Link di Bio Web untuk konsultasi langsung."),
        ("Instagram Reels & Stories", "Video Pendek & Q&A Interaktif", "• Rekomendasi mingguan laptop terfavorit\n• Polling kuis: 'Lebih pilih garansi resmi atau performa tinggi?'\n• Behind-the-scenes pembaruan fitur web", "Meningkatkan brand trust dan interaksi followers aktif."),
        ("TikTok\n(@lapmatch)", "Short Video Vertical (15-60 detik)", "• 'POV: Cari laptop tanpa takut ketipu toko'\n• Demo live web Lapmatch: Rekomendasi keluar dalam 1 menit!\n• Kupas tuntas mitos laptop bekas murah", "Menjangkau FYP mahasiswa & pelajar, dorong viralitas penggunaan web."),
        ("TikTok Live & Diskusi", "Live Streaming Konsultasi", "• Bedah spesifikasi laptop langsung dari penonton live\n• Simulasi input budget penonton ke sistem SPK Lapmatch\n• Review jujur trade-off laptop", "Membangun komunitas pengguna loyal dan validasi real-time.")
    ]

    for row_idx, data_row in enumerate(data3, start=1):
        row = table3.rows[row_idx]
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, cell_value in enumerate(data_row):
            row.cells[col_idx].paragraphs[0].add_run(cell_value)
        format_row(row, bg_color=bg, is_header=False)

    p3_3 = doc.add_paragraph()
    p3_3.paragraph_format.space_before = Pt(8)
    p3_3.paragraph_format.space_after = Pt(6)
    p3_3.paragraph_format.line_spacing = 1.15
    p3_3.add_run(
        "3.3. Integrasi Kanal Media Sosial dengan Ekosistem Website\n"
        "Untuk menciptakan alur konversi pengguna yang mulus (seamless conversion funnel), telah dirancang alur sebagai berikut:"
    )

    funnel_steps = [
        ("Penempatan Link Bio Interaktif: ", "Tautan langsung menuju website Lapmatch diletakkan di profil Instagram & TikTok menggunakan link tree/domain langsung."),
        ("Penyematan Ikon & Kontak Resmi di Web: ", "Halaman footer dan navigasi web telah dilengkapi tombol direct-access ke WhatsApp Business, serta dipersiapkan tautan resmi media sosial."),
        ("Kode Kampanye / UTM Tracking: ", "Penggunaan tautan pelacak untuk mengukur saluran mana (Instagram vs. TikTok) yang paling banyak menyumbang pengguna kuisioner.")
    ]
    for b_title, b_desc in funnel_steps:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(3)
        bp.paragraph_format.line_spacing = 1.15
        r_bt = bp.add_run(b_title)
        r_bt.bold = True
        r_bt.font.name = 'Calibri'
        r_bt.font.size = Pt(9.5)
        r_bt.font.color.rgb = RGBColor(15, 23, 42)
        r_bd = bp.add_run(b_desc)
        r_bd.font.name = 'Calibri'
        r_bd.font.size = Pt(9.5)
        r_bd.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ─────────────────────────────────────────────────────────────────────────────
    # BAB 4: REKAPITULASI PROGRES SISTEM & ARSITEKTUR TEKNOLOGI
    # ─────────────────────────────────────────────────────────────────────────────
    h4 = doc.add_paragraph()
    h4.paragraph_format.space_before = Pt(14)
    h4.paragraph_format.space_after = Pt(4)
    r4 = h4.add_run("BAB 4: REKAPITULASI PROGRES FITUR WEB SECARA MENYELURUH")
    r4.bold = True
    r4.font.name = 'Calibri'
    r4.font.size = Pt(12)
    r4.font.color.rgb = RGBColor(30, 27, 75)

    p4_1 = doc.add_paragraph()
    p4_1.paragraph_format.space_after = Pt(6)
    p4_1.paragraph_format.line_spacing = 1.15
    p4_1.add_run(
        "Berikut adalah tabel status penyelesaian seluruh modul utama pada platform Lapmatch hingga versi rilis saat ini:"
    )

    # Tabel Modul Keseluruhan
    table4 = doc.add_table(rows=7, cols=4)
    table4.alignment = WD_TABLE_ALIGNMENT.CENTER
    table4.autofit = False
    table4.columns[0].width = Inches(1.8)
    table4.columns[1].width = Inches(1.8)
    table4.columns[2].width = Inches(1.6)
    table4.columns[3].width = Inches(1.3)
    set_table_borders(table4, "CBD5E1")

    headers4 = ["Nama Modul / Fitur", "Implementasi Teknis", "Cakupan Fitur Utama", "Status Progres"]
    for idx, text in enumerate(headers4):
        table4.rows[0].cells[idx].paragraphs[0].add_run(text)
    format_row(table4.rows[0], bg_color="1E1B4B", is_header=True)

    data4 = [
        ("Uji Banding Baru vs Second", "LaptopCompareModal.tsx & Filter Kuisioner", "Komparasi berdampingan, badge pemenang hemat/performa, perbandingan spesifikasi", "100% Selesai (Aktif)"),
        ("Identitas Multi-Persona", "RegisterPage.tsx & ProfilePage.tsx", "Seleksi peran mahasiswa, pekerja, pelajar, dosen, umum dengan badge & tema", "100% Selesai (Aktif)"),
        ("Akun Promosi Medsos", "Instagram & TikTok Setup", "Pembuatan akun resmi, perumusan pilar konten edukasi, persiapan materi promo", "100% Siap Kampanye"),
        ("Kalkulasi ROC & TOPSIS", "src/lib/roc.ts & src/lib/topsis.ts", "Pembobotan matematis ROC & perankingan kedekatan solusi ideal TOPSIS", "100% Selesai (Stabil)"),
        ("Analisis Cerdas AI", "src/lib/ai.ts (Gemini Engine)", "Penjelasan kelebihan, kekurangan, dan kecocokan laptop berbasis profil pengguna", "100% Selesai (Aktif)"),
        ("Katalog & Admin Manager", "src/app/admin & LaptopCatalog.tsx", "Manajemen data laptop, import data batch, filter brand & rentang budget", "100% Selesai (Aktif)")
    ]

    for row_idx, data_row in enumerate(data4, start=1):
        row = table4.rows[row_idx]
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, cell_value in enumerate(data_row):
            row.cells[col_idx].paragraphs[0].add_run(cell_value)
        format_row(row, bg_color=bg, is_header=False)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ─────────────────────────────────────────────────────────────────────────────
    # BAB 5: RENCANA TAHAP SELANJUTNYA (NEXT ACTION PLAN)
    # ─────────────────────────────────────────────────────────────────────────────
    h5 = doc.add_paragraph()
    h5.paragraph_format.space_before = Pt(14)
    h5.paragraph_format.space_after = Pt(4)
    r5 = h5.add_run("BAB 5: RENCANA TINDAK LANJUT & TAHAP PENGEMBANGAN MENDATANG")
    r5.bold = True
    r5.font.name = 'Calibri'
    r5.font.size = Pt(12)
    r5.font.color.rgb = RGBColor(30, 27, 75)

    p5_1 = doc.add_paragraph()
    p5_1.paragraph_format.space_after = Pt(6)
    p5_1.paragraph_format.line_spacing = 1.15
    p5_1.add_run(
        "Untuk mempertahankan momentum pertumbuhan dan memaksimalkan manfaat platform Lapmatch, berikut adalah rencana kerja "
        "tindak lanjut (action plan) jangka pendek dan menengah:"
    )

    next_steps = [
        ("Peluncuran Konten Perdana Instagram & TikTok: ", "Memproduksi 5 batch video perdana mengenai '3 Rekomendasi Laptop Bekas Rasa Baru untuk Mahasiswa' dan infografis komparasi langsung dari web Lapmatch."),
        ("Uji Coba Pengguna Terbuka (Open User Testing): ", "Melakukan pengujian langsung ke 20-30 mahasiswa dan pekerja muda untuk mengumpulkan feedback mengenai kemudahan penggunaan modal komparasi dan kecocokan rekomendasi AI."),
        ("Pembaruan Database Berkala: ", "Menambah inventaris laptop kondisi second yang populer di pasaran (seperti Lenovo ThinkPad series, Dell Latitude, MacBook Air M1 second, dan HP EliteBook)."),
        ("Optimasi SEO & Pelacakan Analitik: ", "Menerapkan metadata OpenGraph dinamis untuk setiap halaman perbandingan agar tautan yang dibagikan ke Instagram dan WhatsApp memunculkan preview kartu yang menarik.")
    ]
    for b_title, b_desc in next_steps:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(3)
        bp.paragraph_format.line_spacing = 1.15
        r_bt = bp.add_run(b_title)
        r_bt.bold = True
        r_bt.font.name = 'Calibri'
        r_bt.font.size = Pt(9.5)
        r_bt.font.color.rgb = RGBColor(15, 23, 42)
        r_bd = bp.add_run(b_desc)
        r_bd.font.name = 'Calibri'
        r_bd.font.size = Pt(9.5)
        r_bd.font.color.rgb = RGBColor(51, 65, 85)

    # ─────────────────────────────────────────────────────────────────────────────
    # BAB 6: PENUTUP & TANDA TANGAN / PENGESAHAN
    # ─────────────────────────────────────────────────────────────────────────────
    h6 = doc.add_paragraph()
    h6.paragraph_format.space_before = Pt(14)
    h6.paragraph_format.space_after = Pt(4)
    r6 = h6.add_run("BAB 6: PENUTUP")
    r6.bold = True
    r6.font.name = 'Calibri'
    r6.font.size = Pt(12)
    r6.font.color.rgb = RGBColor(30, 27, 75)

    p6 = doc.add_paragraph()
    p6.paragraph_format.space_after = Pt(16)
    p6.paragraph_format.line_spacing = 1.15
    p6.add_run(
        "Demikian laporan progres pengembangan website Lapmatch ini disusun. Seluruh fitur utama seperti komparasi "
        "laptop baru dan second, identifikasi multi-persona pengguna, serta kesiapan kanal promosi digital Instagram dan TikTok "
        "telah berjalan dengan baik. Diharapkan pembaruan ini dapat memberikan dampak nyata bagi pengguna dalam menemukan "
        "laptop yang paling tepat, bernilai ekonomis tinggi, dan sesuai dengan aktivitas kesehariannya."
    )

    # Sign-off box
    sign_table = doc.add_table(rows=1, cols=2)
    sign_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sign_table.autofit = False
    sign_table.columns[0].width = Inches(3.2)
    sign_table.columns[1].width = Inches(3.3)
    set_table_borders(sign_table, "FFFFFF")

    c_sign0 = sign_table.rows[0].cells[0].paragraphs[0]
    c_sign0.add_run("Mengetahui,\nTim Pengembang Platform Lapmatch\n\n\n\n")
    r_lead = c_sign0.add_run("( Tim Pengembang Web & Produk )")
    r_lead.bold = True

    c_sign1 = sign_table.rows[0].cells[1].paragraphs[0]
    c_sign1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    c_sign1.add_run(f"Dibuat dan Diperbarui:\nTanggal: 27 Oktober 2026\n\n\n\n")
    r_pic = c_sign1.add_run("( Pengelola & Kreator Lapmatch )")
    r_pic.bold = True

    output_filename = "Laporan_Progres_Pengembangan_Web_Lapmatch.docx"
    doc.save(output_filename)
    print(f"Document successfully created and saved as: {output_filename}")

if __name__ == "__main__":
    main()
