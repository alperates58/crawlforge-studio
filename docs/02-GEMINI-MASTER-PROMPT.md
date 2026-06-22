# Gemini Master Prompt

Aşağıdaki prompt, Gemini/Antigravity/Codex gibi coding agent'a verilecek ana geliştirme talimatıdır.

---

Sen kıdemli full-stack yazılım mimarısın. Aşağıdaki projeyi sıfırdan geliştir.

# Proje

**SourceForge Studio**

No-code web data extraction, document ingestion and AI-powered structured data extraction platform.

Bu platform `databot.alperates.com.tr` altında çalışacak. GitHub repository üzerinden Coolify ile deploy edilecek. Her GitHub push sonrası Coolify redeploy edildiğinde uygulama güncellenebilir olmalı.

# Temel Hedef

Kod yazmayan bir kullanıcı bile arayüzden bot oluşturabilmeli:

1. URL aç
2. Login ol
3. Click / Type / Wait / Scroll adımları ekle
4. Liste sayfasından linkleri topla
5. Detay sayfalarına gir
6. CSS/XPath selector ile alanları scrape et
7. PDF/TDS/SDS dosyalarını indir
8. AI ile PDF veya HTML içinden yapılandırılmış veri çıkar
9. Veriyi tabloya kaydet
10. CSV/Excel/JSON export al

# İlk Kullanım Senaryosu

Kozmetik hammadde veritabanı oluşturmak.

Örnek çekilecek alanlar:

- Trade name
- Supplier
- INCI
- Function
- Recommended use level
- pH range
- Solubility
- Applications
- TDS PDF URL
- SDS PDF URL
- Source URL

# Teknoloji Tercihi

MVP için şu stack'i kullan:

- Frontend: React + Vite + TypeScript
- UI: Tailwind CSS + modern component structure
- Backend: Node.js + NestJS veya sade Express/Fastify
- Browser automation: Playwright
- Queue: BullMQ
- Cache/Queue backend: Redis
- Database: PostgreSQL
- ORM: Prisma
- File storage: local Docker volume
- AI Provider: OpenAI-compatible API endpoint
- Deployment: Docker Compose
- Reverse proxy dışarıdan Coolify tarafından yönetilecek

# Repository Yapısı

Önerilen yapı:

```txt
/
├─ apps/
│  ├─ web/
│  ├─ api/
│  └─ worker/
├─ packages/
│  ├─ shared/
│  └─ extractor/
├─ docs/
├─ docker-compose.yml
├─ .env.example
├─ README.md
└─ package.json
```

# Zorunlu Özellikler

## 1. Authentication

Basit admin login sistemi kur.

İlk MVP için:

- Email/password
- JWT session
- Admin user seed

## 2. Projects

CRUD:

- Create project
- Edit project
- Delete/archive project
- List projects
- Project detail

Alanlar:

- name
- description
- target_domain
- category
- status

## 3. Bots

CRUD:

- Create bot
- Edit bot
- Delete/archive bot
- Duplicate bot
- Manual run

Alanlar:

- project_id
- name
- description
- start_url
- steps JSON
- status

## 4. Bot Builder UI

Blok tabanlı kolay arayüz yap.

Step types:

- OPEN_URL
- CLICK
- TYPE
- WAIT
- SCROLL
- EXTRACT_TEXT
- EXTRACT_ATTRIBUTE
- EXTRACT_LINKS
- DOWNLOAD_FILE
- LOOP_LINKS
- PAGINATION
- AI_EXTRACT
- SAVE_RECORD

Her step için form alanları göster.

Örnek:

CLICK:
- selector
- timeout

TYPE:
- selector
- value

EXTRACT_TEXT:
- field_name
- selector
- required true/false

DOWNLOAD_FILE:
- selector
- file_type
- target_field

AI_EXTRACT:
- input_source: html/text/pdf
- schema JSON
- output_field

## 5. Playwright Worker

Worker queue'dan bot run alır.

Bot steps JSON'a göre çalışır.

İlk sürümde desteklenecekler:

- open url
- click
- type
- wait
- scroll
- extract text
- extract links
- download file
- loop collected links
- save extracted record

Worker her adımı loglamalı.

Hata olursa run failed olmalı ve hata mesajı kaydedilmeli.

## 6. Dataset

Çekilen kayıtlar dataset tablosunda görünmeli.

Alanlar:

- project
- bot
- source_url
- data JSON
- status: draft / needs_review / approved / rejected
- confidence_score
- created_at
- updated_at

UI:

- Table view
- Search
- Filter by status
- Record detail
- Approve/reject
- Export CSV

## 7. Documents

İndirilen dosyalar local volume'a kaydedilmeli.

Metadata:

- original_url
- filename
- mime_type
- size
- local_path
- source_record_id
- extracted_text
- ai_extracted_json

PDF text extraction için uygun Node kütüphanesi kullan.

## 8. AI Provider

Ayarlar sayfasında:

- provider name
- base_url
- api_key
- model
- temperature

OpenAI-compatible endpoint destekle.

AI Extract fonksiyonu şema bazlı JSON üretmeli.

AI çıktısı direkt approved yapılmamalı. Varsayılan status `needs_review` olmalı.

## 9. Logs

Run logs:

- run_id
- bot_id
- status
- started_at
- finished_at
- duration
- pages_visited
- records_extracted
- files_downloaded
- error_message

Step logs:

- run_id
- step_index
- step_type
- status
- message
- screenshot_path optional

## 10. Coolify Deployment

Docker Compose dosyası oluştur.

Servisler:

- web
- api
- worker
- postgres
- redis

Uygulama environment variable ile yapılandırılmalı.

Coolify'da domain:

```txt
databot.alperates.com.tr
```

API ve frontend aynı domain altında çalışabilsin.

Öneri:

- Frontend `/`
- API `/api`
- WebSocket gerekiyorsa `/ws`

# Tasarım

Modern, temiz, açık tema.

Renkler:

- Beyaz
- Açık gri
- Açık mavi
- Lacivert vurgu

Menü:

- Dashboard
- Projects
- Bots
- Runs
- Datasets
- Documents
- Settings

# Çok Önemli Kurallar

- Kod düzenli ve sürdürülebilir olmalı.
- Magic string azalt.
- TypeScript tipleri düzgün olmalı.
- Migration sistemi olmalı.
- Docker build sorunsuz çalışmalı.
- README içinde local ve production kurulum anlatılmalı.
- Mevcut dosyaları gereksiz silme.
- Her büyük değişiklikten sonra build/test çalıştır.
- Eğer bir modül henüz tam değilse UI'da "Coming soon" değil, çalışan minimum sürüm olmalı.
- Captcha bypass, ücretli içerik kırma, izinsiz veri kopyalama gibi özellikler ekleme.
- Sistem yasal/etik kullanım uyarısı göstermeli.

# İlk Teslimat

İlk teslimatta şunlar çalışmalı:

1. Login
2. Dashboard
3. Project CRUD
4. Bot CRUD
5. Basit Bot Builder
6. Manual run
7. Playwright ile bir sayfadan text/link extract
8. Dataset kayıtları
9. CSV export
10. Docker Compose ile ayağa kalkma

Geliştirmeye başla.
