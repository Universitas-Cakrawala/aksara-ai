# Dummy Mode - Aksara AI Frontend

Dummy mode memungkinkan Anda untuk menjalankan aplikasi frontend tanpa memerlukan backend yang aktif. Mode ini sangat berguna untuk development dan testing.

## Cara Mengaktifkan Dummy Mode

1. Pastikan file `.env` memiliki konfigurasi berikut:
   ```bash
   VITE_DUMMY_MODE=true
   ```

2. Jalankan development server:
   ```bash
   npm run dev
   ```

## Kredensial Dummy untuk Login

Ketika dummy mode aktif, Anda dapat login menggunakan kredensial berikut:

| Username | Password | Nama Lengkap    | Email            |
|----------|----------|-----------------|------------------|
| admin    | admin123 | Administrator   | admin@aksara.ai  |
| user     | user123  | User Test       | user@aksara.ai   |
| demo     | demo123  | Demo User       | demo@aksara.ai   |

## Fitur yang Tersedia dalam Dummy Mode

### Authentication
- ✅ Login dengan dummy users
- ✅ Register user baru (disimpan sementara dalam session)
- ✅ Logout
- ✅ Simulasi error handling (username/password salah)

### Chat
- ✅ Chat history dengan pesan dummy
- ✅ Mengirim pesan dan mendapat respons AI dummy
- ✅ Simulasi typing indicator
- ✅ Simulasi network delay yang realistis

## Cara Menonaktifkan Dummy Mode

Untuk menggunakan backend real, ubah konfigurasi di `.env`:

```bash
VITE_DUMMY_MODE=false
# atau hapus baris tersebut
```

Pastikan backend sudah berjalan di `http://localhost:8000` (atau sesuai `VITE_API_BASE_URL`).

## Struktur File Dummy

- `src/services/dummyData.ts` - Data dummy (users, messages, konstanta)
- `src/services/mockApi.ts` - Mock API services
- `src/context/AuthContext.tsx` - Authentication context dengan support dummy mode
- `src/components/LoginForm.tsx` - Form login dengan info kredensial dummy
- `src/pages/ChatPage.tsx` - Chat page dengan dummy messages

## Notes untuk Development

1. **Persistent Data**: Data dummy hanya bertahan selama session browser. Refresh halaman akan reset data.

2. **Network Simulation**: API calls disimulasi dengan delay 300-1000ms untuk realism.

3. **Error Handling**: Dummy mode tetap mensimulasi error seperti "username sudah digunakan" atau "password salah".

4. **Visual Indicator**: LoginForm menampilkan info kredensial dummy ketika mode aktif.

5. **Chat AI**: Respons AI bersifat random dari pool predefined responses, dengan sedikit personalisasi berdasarkan input user.

## Transisi ke Production

Ketika backend sudah siap:

1. Set `VITE_DUMMY_MODE=false` atau hapus dari `.env`
2. Pastikan `VITE_API_BASE_URL` mengarah ke backend yang benar
3. Aplikasi akan otomatis beralih menggunakan real API calls

Tidak ada code changes yang diperlukan - aplikasi akan seamlessly beralih antara dummy dan real mode.