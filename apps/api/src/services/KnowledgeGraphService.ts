import { PrismaClient } from '@crawlforge/database';

const prisma = new PrismaClient();

export class KnowledgeGraphService {
  /**
   * Processes the structured JSON output from an AI Job and populates the Knowledge Graph.
   * Expects format: { "entities": [...], "relations": [...] }
   */
  static async processGraphData(
    aiJobId: string, 
    datasetId: string | null, 
    documentId: string | null, 
    jsonData: string
  ) {
    let data;
    try {
      data = JSON.parse(jsonData);
    } catch (e) {
      console.error(`[KnowledgeGraphService] Invalid JSON for AI Job ${aiJobId}`);
      return;
    }

    if (!data || typeof data !== 'object') {
      console.warn(`[KnowledgeGraphService] Data is not an object for AI Job ${aiJobId}`);
      return;
    }
    
    const entities = Array.isArray(data.entities) ? data.entities : [];
    const relations = Array.isArray(data.relations) ? data.relations : [];

    if (entities.length === 0 && relations.length === 0) {
      console.log(`[KnowledgeGraphService] No entities or relations found in AI Job ${aiJobId}`);
      return;
    }

    // Map to keep track of local JSON entity names to DB Entity IDs
    const entityIdMap = new Map<string, string>();

    // Process Entities
    for (const ent of entities) {
      if (!ent.type || !ent.name) continue;
      
      const normalizedName = ent.name.trim().toLowerCase();
      
      // Upsert entity
      const dbEntity = await prisma.entity.upsert({
        where: {
          entityType_normalizedName: {
            entityType: ent.type,
            normalizedName: normalizedName
          }
        },
        create: {
          entityType: ent.type,
          entityName: ent.name.trim(),
          normalizedName: normalizedName,
        },
        update: {} // If exists, do nothing (keep first seen name)
      });

      // We map the raw name from the JSON to the DB ID so relations can resolve it
      entityIdMap.set(ent.name, dbEntity.id);

      // Record the source
      // Use findFirst to avoid duplicates if this job was retried or something
      const existingSource = await prisma.entitySource.findFirst({
        where: {
          entityId: dbEntity.id,
          aiJobId: aiJobId
        }
      });

      if (!existingSource) {
        await prisma.entitySource.create({
          data: {
            entityId: dbEntity.id,
            aiJobId: aiJobId,
            datasetId: datasetId || null,
            documentId: documentId || null
          }
        });
      }
    }

    // Process Relations
    for (const rel of relations) {
      if (!rel.source || !rel.target || !rel.type) continue;

      const sourceId = entityIdMap.get(rel.source);
      const targetId = entityIdMap.get(rel.target);

      if (sourceId && targetId) {
        // Prevent duplicate exact relations
        const existingRelation = await prisma.relation.findFirst({
          where: {
            sourceEntityId: sourceId,
            targetEntityId: targetId,
            relationType: rel.type
          }
        });

        if (!existingRelation) {
          await prisma.relation.create({
            data: {
              sourceEntityId: sourceId,
              targetEntityId: targetId,
              relationType: rel.type
            }
          });
        }
      }
    }

    console.log(`[KnowledgeGraphService] Successfully processed ${entities.length} entities and ${relations.length} relations for AI Job ${aiJobId}`);
  }
}
