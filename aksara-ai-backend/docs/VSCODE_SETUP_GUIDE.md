# Cara Mengatasi Warning "Import could not be resolved" di VS Code

## Masalah
VS Code/Pylance menampilkan warning "Import 'fastapi' could not be resolved" dan sejenisnya meskipun packages sudah terinstall di virtual environment.

## Penyebab
1. VS Code tidak menggunakan interpreter dari virtual environment yang benar
2. Pylance belum mengindeks packages di virtual environment
3. Konfigurasi workspace belum diatur dengan benar

## Solusi

### 1. Pastikan VS Code menggunakan interpreter yang benar

**Cara 1: Via Command Palette**
1. Tekan `Ctrl+Shift+P` (atau `Cmd+Shift+P` di Mac)
2. Ketik "Python: Select Interpreter"
3. Pilih interpreter dari virtual environment: `/home/titan/project/aksara-ai/aksara-ai-backend/.venv/bin/python`

**Cara 2: Via status bar**
1. Lihat status bar di bawah VS Code
2. Klik pada versi Python yang ditampilkan
3. Pilih interpreter yang benar dari daftar

### 2. Reload VS Code Window
Setelah mengubah interpreter:
1. Tekan `Ctrl+Shift+P`
2. Ketik "Developer: Reload Window"
3. Atau tutup dan buka kembali VS Code

### 3. Verifikasi Virtual Environment

Di terminal VS Code, pastikan virtual environment aktif:
```bash
# Aktifkan virtual environment
source .venv/bin/activate

# Cek interpreter yang digunakan
which python
python -c "import sys; print(sys.executable)"

# Test import packages
python -c "import fastapi, pydantic, sqlalchemy; print('OK')"
```

### 4. File Konfigurasi yang Sudah Dibuat

Saya telah membuat file-file konfigurasi berikut:

**`.vscode/settings.json`**
```json
{
    "python.defaultInterpreterPath": "/home/titan/project/aksara-ai/aksara-ai-backend/.venv/bin/python",
    "python.analysis.indexing": true,
    "python.analysis.autoImportCompletions": true,
    "python.analysis.extraPaths": [
        "/home/titan/project/aksara-ai/aksara-ai-backend",
        "/home/titan/project/aksara-ai/aksara-ai-backend/src"
    ],
    "python.analysis.diagnosticMode": "workspace",
    "python.analysis.typeCheckingMode": "basic"
}
```

**`pyrightconfig.json`**
```json
{
    "include": ["src", "."],
    "exclude": ["**/__pycache__", ".venv"],
    "venv": ".venv",
    "venvPath": ".",
    "pythonVersion": "3.12",
    "typeCheckingMode": "basic",
    "useLibraryCodeForTypes": true
}
```

### 5. Langkah-langkah Troubleshooting

Jika masih ada masalah:

1. **Restart Pylance Language Server**
   - `Ctrl+Shift+P` → "Python: Restart Language Server"

2. **Clear Cache**
   - `Ctrl+Shift+P` → "Python: Clear Cache and Reload Window"

3. **Reinstall Pylance Extension**
   - Go to Extensions (`Ctrl+Shift+X`)
   - Search "Pylance"
   - Disable → Enable, atau Uninstall → Install

4. **Check Extension Settings**
   - Make sure Pylance is set as default language server
   - Disable other Python language servers if any

### 6. Verifikasi Setup

Untuk memastikan setup benar:
```bash
# Di terminal project dengan venv aktif
cd /home/titan/project/aksara-ai/aksara-ai-backend
source .venv/bin/activate
python -c "
import fastapi
import pydantic
import sqlalchemy
import starlette
print('✅ All imports successful!')
print(f'FastAPI: {fastapi.__version__}')
print(f'Pydantic: {pydantic.__version__}')
print(f'SQLAlchemy: {sqlalchemy.__version__}')
print(f'Starlette: {starlette.__version__}')
"
```

### 7. Jika Masih Bermasalah

Coba langkah-langkah ini:

1. **Restart VS Code completely**
2. **Reinstall virtual environment**:
   ```bash
   rm -rf .venv
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. **Update VS Code dan Pylance extension**

## Status Packages Terinstall

Packages yang sudah terverifikasi terinstall di virtual environment:
- ✅ fastapi (0.115.4)
- ✅ pydantic (2.9.2) 
- ✅ sqlalchemy (2.0.40)
- ✅ starlette (0.41.2)
- ✅ Dan semua dependencies lainnya

## Catatan Penting

- Warning ini adalah masalah konfigurasi VS Code/Pylance, bukan masalah dengan code
- Code akan tetap berjalan normal meskipun ada warning
- Setelah konfigurasi benar, warning akan hilang dalam beberapa saat