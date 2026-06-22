# Legal and Ethical Guidelines

CrawlForge is a data extraction platform. It must be designed for legal and ethical use.

## Forbidden Features

Do not implement:

- Captcha bypass
- Login cracking
- Credential theft
- Paywall bypass
- Anti-bot evasion
- Personal data harvesting
- Aggressive request flooding

## User Warning

Show this warning in bot creation screens:

> This tool must only be used for sources where you have access rights and where data collection is allowed by applicable laws and website terms. CrawlForge must not be used for captcha bypass, unauthorized copying, personal data harvesting or access restriction circumvention.

## Data Status

AI extracted data must not be automatically treated as verified.

Allowed statuses:

- draft
- needs_review
- approved
- rejected

Default AI output status:

```txt
needs_review
```

## Source Tracking

Every record must keep:

- source_url
- extraction_date
- extraction_method
- confidence_score
- document_url if available
