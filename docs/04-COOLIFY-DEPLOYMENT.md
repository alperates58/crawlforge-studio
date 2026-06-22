# Coolify Deployment Guide

Bu proje GitHub repository üzerinden Coolify ile deploy edilecek şekilde tasarlanmalıdır.

## Önerilen Subdomain

```txt
databot.alperates.com.tr
```

## Coolify Akışı

1. GitHub repository oluştur.
2. Bu proje dosyalarını repository'ye yükle.
3. Coolify içinde New Resource > Git Repository seç.
4. Repository'yi bağla.
5. Docker Compose deploy seç.
6. Environment variables gir.
7. Domain olarak `databot.alperates.com.tr` tanımla.
8. Deploy et.
9. GitHub'a push sonrası Coolify üzerinden redeploy ile güncelle.

## DNS

Cloudflare veya DNS panelinde:

```txt
Type: A veya CNAME
Name: databot
Target: Coolify sunucu IP veya ilgili hedef
Proxy: ihtiyaca göre
```

## Environment Variables

`.env.example` dosyasını temel al.

Önemli değişkenler:

```txt
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
APP_URL=
API_URL=
AI_BASE_URL=
AI_API_KEY=
AI_MODEL=
STORAGE_PATH=
```

## Servisler

Docker Compose içinde önerilen servisler:

- web
- api
- worker
- postgres
- redis

## Kalıcı Volumeler

Mutlaka kalıcı volume kullanılmalı:

- PostgreSQL data
- Redis data
- uploaded/downloaded documents
- screenshots/log files

## Production Notları

- API key'ler GitHub'a commit edilmemeli.
- `.env` dosyası repo içinde olmamalı.
- `.env.example` commit edilebilir.
- Upload klasörü volume olarak bağlanmalı.
- Worker restart policy açık olmalı.
- Bot run sırasında uygulama kapanırsa run failed/retry yönetimi olmalı.
