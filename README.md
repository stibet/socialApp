# 🎉 Dambul

> **"Bu gece nereye çıkıyorsun?"** — Ankara'da eğlence mekanlarına karma grup buluşma uygulaması.

---

## 📁 Proje Yapısı

```
dambul/
├── backend/    → NestJS + PostgreSQL REST API
└── mobile/     → React Native mobil uygulama
```

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- React Native ortamı ([RN Kurulum Rehberi](https://reactnative.dev/docs/environment-setup))
- Android Studio veya Xcode

---

### 1. Backend Kurulumu

```bash
cd backend

# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
cp .env.example .env
# → .env dosyasını kendi değerlerinle doldur

# PostgreSQL'de veritabanı oluştur
createdb dambul

# Dev modda başlat (hot-reload)
npm run start:dev
```

Backend `http://localhost:3000/api/v1` adresinde çalışacak.

> **Not:** `NODE_ENV=development` iken TypeORM tabloları otomatik oluşturur (`synchronize: true`).
> Production'da bu kapatılmalı ve migration kullanılmalıdır.

---

### 2. SMS / OTP Kurulumu (Twilio)

`backend/src/auth/auth.service.ts` dosyasındaki `sendSms` fonksiyonunu gerçek Twilio entegrasyonu için güncelle:

```typescript
const sendSms = async (phone: string, message: string) => {
  const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};
```

> **Geliştirme sırasında:** OTP kodu console'a yazdırılır, SMS gönderilmez.

---

### 3. Mobile Kurulumu

```bash
cd mobile

# Bağımlılıkları yükle
npm install

# iOS (sadece Mac)
cd ios && pod install && cd ..

# Android emülatör veya cihazda çalıştır
npm run android

# iOS simülatörde çalıştır
npm run ios
```

**IP Ayarı:** `mobile/src/services/api.ts` dosyasında `BASE_URL`'i cihazınıza göre ayarlayın:

```typescript
// Android Emülatör
export const BASE_URL = 'http://10.0.2.2:3000/api/v1';

// iOS Simülatör
export const BASE_URL = 'http://localhost:3000/api/v1';

// Fiziksel cihaz (bilgisayarınızın yerel IP'si)
export const BASE_URL = 'http://192.168.X.X:3000/api/v1';
```

---

## 🗂️ API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/auth/send-otp` | OTP gönder |
| POST | `/auth/verify-otp` | OTP doğrula + JWT al |
| GET | `/users/me` | Kendi profilim |
| PUT | `/users/me` | Profili güncelle |
| GET | `/users/:id` | Kullanıcı profili |
| GET | `/venues` | Mekan listesi |
| GET | `/venues/:id` | Mekan detayı |
| GET | `/events` | Etkinlik listesi |
| GET | `/events/today` | Bugünkü etkinlikler |
| GET | `/events/:id` | Etkinlik detayı |
| POST | `/events` | Etkinlik ekle |
| GET | `/groups/event/:id` | Etkinliğe ait gruplar |
| GET | `/groups/my` | Benim gruplarım |
| POST | `/groups` | Grup oluştur |
| POST | `/groups/:id/join` | Gruba katıl |
| DELETE | `/groups/:id/leave` | Gruptan ayrıl |
| DELETE | `/groups/:id/close` | Grubu kapat |
| POST | `/reviews` | Puan ver |
| GET | `/reviews/user/:id` | Kullanıcı yorumları |

---

## 🏗️ Mimari

```
React Native App
      │
      ├── Zustand (state)
      ├── Axios (HTTP)
      └── React Navigation

NestJS Backend
      │
      ├── AuthModule   → OTP + JWT
      ├── UsersModule  → Profil yönetimi
      ├── VenuesModule → Mekan veritabanı
      ├── EventsModule → Etkinlikler
      ├── GroupsModule → Grup oluştur / katıl
      └── ReviewsModule → Puan & yorum

PostgreSQL
      │
      ├── users
      ├── venues
      ├── events
      ├── groups
      ├── group_members
      └── reviews
```

---

## 📱 Uygulama Akışı

```
1. Telefon numarası gir
2. SMS OTP doğrula
3. (Yeni kullanıcı) İsim + cinsiyet kaydet
4. Etkinlikler listesi → Etkinlik seç
5. Grupları gör → Katıl veya Grup Oluştur
6. Grup oluştururken teklif seç:
   - Teklif yok
   - 🍺 2 Yerli içecek
   - 🍺🍺 3 Yerli içecek
   - ✍️ Kendi notum
7. Etkinlikten sonra → Üyeleri puanla
8. Güven skoru otomatik güncellenir
```

---

## 🔜 Roadmap

- [ ] Push notification (FCM)
- [ ] In-app chat (Socket.IO)
- [ ] Instagram etkinlik scraping
- [ ] Mekan partner paneli (admin)
- [ ] Fotoğraf yükleme (S3)
- [ ] Harita görünümü
- [ ] Şikâyet / blok sistemi

---

## ⚠️ Önemli Notlar

- İçecek teklifleri tamamen **söz bazlı**; uygulama para transferi yapmaz
- Ödeme mekanda, buluşma sırasında gerçekleşir
- Kullanıcılar sadece birlikte grup oldukları kişileri puanlayabilir
- Güven skoru alınan tüm puanların ortalamasıdır
