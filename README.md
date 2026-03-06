# Parça Takip Sistemi

Bu proje, bir işletmede parça ve malzeme stoklarını takip etmek için geliştirilmiş basit bir web uygulamasıdır. Proje Node.js ve MySQL kullanılarak geliştirilmiştir.

## Özellikler

- Kullanıcı giriş/çıkış (login/logout) sistemi
- Parça ekleme, güncelleme ve silme
- Stok takibi
- Kategori yönetimi
- Basit ve anlaşılır arayüz

## Kullanılan Teknolojiler

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js (Express)
- Veritabanı: MySQL

## 📸 Uygulama Ekran Görüntüleri ve İşleyiş

Aşağıda, sistemin ana işlevlerini gösteren ekran görüntüleri ve açıklamaları yer almaktadır.

### 1. Kimlik Doğrulama ve Giriş

Sisteme sadece yetkili personelin erişebilmesi için güvenli bir giriş sayfası bulunmaktadır. Bu sayfa, kullanıcıların kimlik bilgilerini doğrulayarak ana panele erişim sağlar.

| Giriş Sayfası Görünümü |
| :--- |
![image alt](https://github.com/tayrubys/parca_takip_sistemi/blob/597884360071f6bfa3ae4195162172f5d1b221b2/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202026-03-06%20235047.png)

### 2. Ana Takip Sistemi Paneli

Bu sayfa, sistemin kalbidir. Personel, bu panel üzerinden tüm parça envanterini görebilir ve yeni parça hareketleri (giriş/çıkış) ekleyebilir.
**Admin** olarak giriş yapıldığında, sağ üstte personel yönetimini sağlayan **"Kullanıcılar"** butonu aktifleşir.

| Takip Sistemi Ana Görünümü |
| :--- |
![image alt](https://github.com/tayrubys/parca_takip_sistemi/blob/b497465bd71c8c7fe00f7d8937cd3806e9c25a98/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202026-03-06%20235949.png)

### 3. Admin Paneli (Kullanıcı Yönetimi)
| Admin Paneli |
| :--- |
Sadece Admin yetkisine sahip kullanıcıların erişebildiği bu bölümde, sisteme yeni personel eklenebilir ve mevcut kullanıcıların rolleri (Admin/Kullanıcı) yönetilebilir.
![image alt](https://github.com/tayrubys/parca_takip_sistemi/blob/f563d8376d3d7500795158b616302bb260d59d6b/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202026-03-07%20000238.png)
