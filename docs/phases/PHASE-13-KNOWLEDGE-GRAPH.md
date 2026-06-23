# PHASE-13-KNOWLEDGE-GRAPH

## Hedef
Toplanan AI ekstraksiyon verilerini birleştirerek, farklı doküman ve veri kümelerinden gelen ilişkileri tek bir tabloda (Knowledge Graph) sunmak.

## Teknik Kararlar
1. **Veri Formatı:** Sadece sabit bir JSON formatını (`{ "entities": [...], "relations": [...] }`) kabul eden bir çıkarım mantığı oluşturuldu.
2. **Birleştirme (Merge) Kuralları:** `entityType` ve `normalizedName` (trim ve lowercase) kullanılarak benzersizlik (unique) garantilendi.
3. **Graph Storage:** İlk sürümde Neo4j kullanılmadı. Mevcut Postgres üzerinden ilişkisel model kuruldu (`Entity`, `Relation`, `EntitySource`).
4. **Onay Mekanizması:** Varlıklar ve ilişkiler, AI Job sadece **Approve** edildiğinde Knowledge Graph'a ekleniyor.

## Yapılan İşler
- `packages/database/prisma/schema.prisma` içine `Entity`, `Relation` ve `EntitySource` modelleri eklendi.
- `apps/api/src/services/KnowledgeGraphService.ts` oluşturularak JSON parse ve DB insert işlemleri yazıldı.
- `POST /api/ai-jobs/:id/approve` güncellenerek bu servis ile entegre edildi.
- API için GET metodlu listeleme, detay ve arama uçları (`/entities`, `/entities/:id`, `/entities/search`) eklendi.
- `apps/web` içerisine `Entities` (Liste/Arama) ve `EntityDetail` (İlişkiler, Kaynaklar, AI Jobs) sayfaları geliştirilip navigasyona bağlandı.

## Durum
**Tamamlandı.**
