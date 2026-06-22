# Database Design

Önerilen veritabanı: PostgreSQL  
Önerilen ORM: Prisma

## Temel Tablolar

### users

- id
- email
- password_hash
- name
- role: admin/operator/reviewer
- created_at
- updated_at

### projects

- id
- name
- description
- target_domain
- category
- status
- created_by
- created_at
- updated_at

### bots

- id
- project_id
- name
- description
- start_url
- steps_json
- status
- created_by
- created_at
- updated_at

### bot_runs

- id
- bot_id
- status: queued/running/succeeded/failed/cancelled
- started_at
- finished_at
- duration_ms
- pages_visited
- records_extracted
- files_downloaded
- error_message
- created_at

### bot_step_logs

- id
- run_id
- step_index
- step_type
- status
- message
- data_json
- screenshot_path
- created_at

### datasets

- id
- project_id
- bot_id
- run_id
- source_url
- data_json
- status: draft/needs_review/approved/rejected
- confidence_score
- created_at
- updated_at

### documents

- id
- project_id
- dataset_id
- source_url
- original_url
- filename
- mime_type
- size_bytes
- local_path
- extracted_text
- ai_extracted_json
- status
- created_at
- updated_at

### ai_settings

- id
- provider_name
- base_url
- encrypted_api_key
- model
- temperature
- is_active
- created_at
- updated_at

### app_settings

- id
- key
- value_json
- created_at
- updated_at

## Bot Step JSON Örneği

```json
[
  {
    "type": "OPEN_URL",
    "url": "https://example.com/products"
  },
  {
    "type": "EXTRACT_LINKS",
    "selector": ".product-card a",
    "field": "product_links"
  },
  {
    "type": "LOOP_LINKS",
    "source_field": "product_links",
    "steps": [
      {
        "type": "EXTRACT_TEXT",
        "field": "trade_name",
        "selector": "h1"
      },
      {
        "type": "EXTRACT_TEXT",
        "field": "inci",
        "selector": ".inci"
      },
      {
        "type": "DOWNLOAD_FILE",
        "selector": "a[href$='.pdf']",
        "field": "pdf_files"
      },
      {
        "type": "SAVE_RECORD"
      }
    ]
  }
]
```

## Kozmetik Veri Şeması Örneği

```json
{
  "trade_name": "",
  "supplier": "",
  "inci": "",
  "function": [],
  "recommended_use_level": "",
  "ph_range": "",
  "solubility": "",
  "applications": [],
  "tds_pdf_url": "",
  "sds_pdf_url": "",
  "source_url": ""
}
```
