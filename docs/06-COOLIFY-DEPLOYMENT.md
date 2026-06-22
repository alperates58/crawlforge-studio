# Coolify Deployment

## Domain

```txt
databot.alperates.com.tr
```

## Deployment Flow

1. Create GitHub repository named `crawlforge-studio` or `crawlforge`.
2. Push the project.
3. Open Coolify.
4. Create new resource from GitHub repository.
5. Choose Docker Compose deployment.
6. Add environment variables.
7. Attach domain.
8. Deploy.
9. On each GitHub push, redeploy from Coolify.

## DNS

Create DNS record:

```txt
Type: A or CNAME
Name: databot
Target: Coolify server IP or target
```

## Required Volumes

- postgres_data
- redis_data
- app_storage

## Production Rules

- Never commit `.env`.
- Use `.env.example` only as template.
- Keep API keys in Coolify environment variables.
- Worker must use restart policy.
- Database data must persist between redeploys.
