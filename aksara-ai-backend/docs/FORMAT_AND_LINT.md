FORMAT & LINT — Panduan cepat untuk proyek aksara-ai

Tujuan
-------
Dokumen ini menjelaskan cara menormalkan format kode (indentasi, import order, style) dan menjalankan lint autofixes pada repository ini. Termasuk perintah untuk:

- Meng-install tool (black, isort, ruff, autoflake, pre-commit)
- Menjalankan pipeline perbaikan otomatis: autoflake -> isort -> black -> ruff
- Menginstal dan menjalankan pre-commit hooks
- Tips troubleshooting dan catatan keamanan (commit sebelum perubahan massal)

Prasyarat
---------
- Python 3.10+ (proyek ini menggunakan pyright/pyproject target di sekitar 3.10)
- Git
- Virtualenv / venv direkomendasikan

Rekomendasi awal
-----------------
Sebelum melakukan perubahan massal pada kode, buat commit untuk menyimpan status kerja saat ini:

```bash
cd /path-project
git add -A
git commit -m "wip: save before formatting"
```

Langkah 1 — Buat/aktifkan virtualenv
-----------------------------------
Direkomendasikan untuk menggunakan virtual environment agar paket tool tidak tercampur dengan environment global.

```bash
# buat virtualenv (jika belum ada)
python -m venv .venv

# aktifkan
# zsh / bash
source .venv/bin/activate
```

Langkah 2 — Install tool yang diperlukan
----------------------------------------
Instal tool formatting/linting dan pre-commit:

```bash
pip install --upgrade pip
pip install black isort ruff autoflake pre-commit
```

Catatan versi: saya sengaja tidak memaksa pinned versi di dokumen ini — jika tim ingin versi tertentu, tambahkan versi di `requirements-dev.txt` atau `pyproject.toml`.

Langkah 3 — Konfigurasi proyek (pyproject.toml & .pre-commit-config.yaml)
-----------------------------------------------------------------------
Proyek ini memiliki `pyproject.toml` (di-root). Pastikan pengaturan untuk `black`, `isort`, dan `ruff` ada di sana. Contoh pengaturan ringkas ditambahkan ke `pyproject.toml` pada repositori.

File `.pre-commit-config.yaml` juga sudah dibuat di root. Jika Anda ingin menambahkan/mengubah hooks, edit file tersebut.

Langkah 4 — Jalankan pipeline perbaikan otomatis (aman)
-------------------------------------------------------
Urutan yang direkomendasikan:
1. autoflake — hapus import/variable yang tidak terpakai (mengurangi noise)
2. isort — urutkan imports
3. black — format kode
4. ruff --fix — perbaiki masalah lint yang aman

Perintah:

```bash
# berada di root project
cd /home/titan/project/aksara-ai/aksara-ai-backend

# 1) hapus unused imports/vars
autoflake --in-place --remove-unused-variables --remove-all-unused-imports -r .

# 2) urutkan imports untuk seluruh repo
isort .

# 3) format seluruh kode (black)
black .

# 4) biarkan ruff memperbaiki masalah yang bisa diperbaiki otomatis
ruff check --fix .
```

Catatan `ruff`:
- `ruff check --fix .` memperbaiki banyak masalah, tetapi beberapa perbaikan beresiko (unsafe) dan memerlukan flag tambahan `--unsafe-fixes`.
- Jika `ruff` gagal karena `pyproject.toml` (TOML parse error), periksa blok `tool.ruff` & pastikan tidak ada opsi yang tidak valid pada versi ruff yang terinstall (contoh: `tool.ruff.format.target-version` tidak dikenali oleh ruff versi tertentu). Jika ada peringatan tentang penggunaan top-level keys, pindahkan ke `[tool.ruff.lint]`.

Langkah 5 — Jalankan pre-commit hooks dan install hook git
---------------------------------------------------------
Pre-commit membantu memastikan code style konsisten di setiap commit.

```bash
# install hooks
pre-commit install

# jalankan semua hooks pada semua file saat ini (bisa memakan waktu)
pre-commit run --all-files
```

Jika Anda mengalami error pada pre-commit terkait versi hook, update `.pre-commit-config.yaml` untuk gunakan rev yang tersedia.

Tips & Troubleshooting
----------------------
- Backup/rollback: Jika perubahan masif tidak diinginkan, gunakan `git reset --hard HEAD~1` (atau revert commit khusus) — jangan lupa commit sebelum langkah formatting.
- `ruff` TOML errors: buka `pyproject.toml` dan cari blok `[tool.ruff]` / `[tool.ruff.format]`. Banyak opsi format pada ruff versi lama tidak tersedia. Hapus atau pindahkan opsi yang bermasalah.
- Jika `black` tidak tersedia pada versi yang Anda tentukan, hapus pin versi dan install `black` tanpa versi spesifik.
- Long-line (E501) & complexity (C901): beberapa perbaikan memerlukan perubahan manual:
  - Pisahkan string yang sangat panjang menjadi beberapa baris (contoh: gunakan parenthesis dan implicit concatenation atau textwrap.dedent untuk long text constants).
  - Pecah fungsi kompleks menjadi helper functions jika ruff menandai cyclomatic complexity terlalu tinggi.
- Bare except (E722): ganti `except:` dengan `except Exception:` atau lebih spesifik exception yang diharapkan.

Contoh perbaikan manual (long string):
```python
# sebelum
msg = "Ini pesan yang sangat panjang..."

# setelah
msg = (
    "Ini pesan yang sangat panjang... "
    "lanjutan pesan yang dipisah agar tidak melebihi panjang baris."
)
```

Menjalankan hanya pada folder/file tertentu
-----------------------------------------
Untuk memperbaiki hanya pada `src` saja:

```bash
autoflake --in-place --remove-unused-variables --remove-all-unused-imports -r src
isort src
black src
ruff check --fix src
```

Mengintegrasikan ke CI
----------------------
Jalankan `pre-commit run --all-files` pada job CI (mis. di GitHub Actions) sebelum membuat build/test. Contoh step di GitHub Actions:

```yaml
- uses: actions/checkout@v4
- name: Set up Python
  uses: actions/setup-python@v4
  with:
    python-version: '3.12'
- name: Install dev tools
  run: |
    python -m pip install --upgrade pip
    pip install pre-commit
- name: Run pre-commit
  run: pre-commit run --all-files
```

Catatan keamanan & gaya kerja tim
---------------------------------
- Selalu commit sebelum menjalankan format massal.
- Diskusikan policy formatting di tim (contoh: line-length 88, black + isort profile black) dan dokumentasikan di `pyproject.toml`.
- Untuk perubahan besar (refactor), buat branch terpisah dan review di PR.

Jika ingin saya jalankan otomatis sekarang
----------------------------------------
Saya bisa:
- Menjalankan pipeline penuh (autoflake/isort/black/ruff) dan melakukan commit perubahan yang dihasilkan; atau
- Hanya men-generate patch yang aman untuk Anda review;
- Atau menambahkan/menyempurnakan konfigurasi `pyproject.toml` dan `.pre-commit-config.yaml` lebih lanjut.

Sebutkan pilihan Anda (mis. "jalankan pipeline & commit" atau "jalankan pipeline tapi jangan commit") dan saya akan lanjutkan.
