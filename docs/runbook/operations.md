# Signal Watcher Operations Runbook

## Overview

This runbook provides operational procedures for the Signal Watcher security monitoring platform.

## System Architecture

### Components

- **Frontend**: Next.js application (Port 3000)
- **Backend API**: Express.js server (Port 3001)
- **Database**: PostgreSQL/SQLite
- **Cache**: Redis
- **AI Service**: OpenAI GPT-4 integration

### Health Checks

- **API Health**: `GET /health`
- **Frontend**: Browser access to `http://localhost:3000`
- **Database**: Prisma connection status
- **Redis**: Connection status in logs

## Development Operations

### Starting the System

```bash
# Install dependencies
pnpm install

# Setup database
pnpm run db:setup

# Start development servers
pnpm run dev
```

### Database Operations

```bash
# Generate Prisma client
pnpm --filter @signal-watcher/database db:generate

# Run migrations
pnpm --filter @signal-watcher/database db:migrate

# Reset database (development only)
pnpm --filter @signal-watcher/database db:reset

# Open database studio
pnpm run db:studio
```

### Building for Production

```bash
# Build all packages
pnpm run build

# Build specific package
pnpm --filter @signal-watcher/frontend build
pnpm --filter @signal-watcher/backend build
```

## Troubleshooting

### Common Issues

#### Backend Won't Start

1. **Check database connection**

   ```bash
   # Verify DATABASE_URL in .env
   cat .env | grep DATABASE_URL

   # Test database connectivity
   pnpm run db:studio
   ```

2. **Check Redis connection**

   ```bash
   # Verify Redis is running
   redis-cli ping

   # Check Redis URL in .env
   cat .env | grep REDIS_URL
   ```

3. **Check dependencies**

   ```bash
   # Reinstall dependencies
   pnpm install

   # Build shared packages
   pnpm --filter @signal-watcher/shared build
   ```

#### Frontend Build Errors

1. **TypeScript errors**

   ```bash
   # Check types
   pnpm --filter @signal-watcher/frontend type-check

   # Build shared types first
   pnpm --filter @signal-watcher/shared build
   ```

2. **API connection issues**

   ```bash
   # Verify API URL
   echo $NEXT_PUBLIC_API_URL

   # Test API health
   curl http://localhost:3001/health
   ```

#### AI Integration Issues

1. **OpenAI API errors**

   ```bash
   # Check API key configuration
   cat .env | grep OPENAI_API_KEY

   # Test in mock mode (remove API key temporarily)
   ```

2. **Mock mode not working**
   - Check logs for AI service initialization
   - Verify fallback logic in AIService

### Performance Issues

#### High Memory Usage

1. Monitor Node.js processes

   ```bash
   ps aux | grep node
   top -p $(pgrep -f "tsx\|next")
   ```

2. Check for memory leaks
   - Review database connection pooling
   - Monitor Redis memory usage
   - Check for hanging HTTP requests

#### Slow API Response

1. Check database query performance

   ```bash
   # Enable Prisma query logging
   export DEBUG="prisma:query"
   ```

2. Monitor Redis cache hit rates
   - Check cache service logs
   - Verify cache key patterns
   - Review TTL settings

#### High CPU Usage

1. Profile AI service calls
   - Monitor OpenAI API response times
   - Check async processing queue
   - Review correlation ID logging

## Monitoring

### Log Locations

- **Backend logs**: Console output with structured JSON
- **Frontend logs**: Browser console and Next.js output
- **Database logs**: Prisma query logs when enabled

### Key Metrics to Monitor

- API response times
- Database query performance
- AI analysis completion rates
- Cache hit/miss ratios
- Error rates by endpoint

### Alert Conditions

- API response time > 2 seconds
- Database connection failures
- AI analysis failures > 10%
- Memory usage > 80%
- Disk space < 20%

## Security Operations

### Environment Variables

```bash
# Required for production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...
JWT_SECRET=<strong-secret>
NEXTAUTH_SECRET=<strong-secret>
```

### Security Checklist

- [ ] All environment variables are set
- [ ] Database credentials are secure
- [ ] API keys are rotated regularly
- [ ] CORS origins are configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced in production

## Deployment

### Environment Setup

1. **Staging Environment**

   - Use separate database
   - Mock AI mode for testing
   - Reduced logging level

2. **Production Environment**
   - PostgreSQL with connection pooling
   - Redis cluster for high availability
   - Real AI integration with monitoring

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backup procedures tested

## Incident Response

### Severity Levels

- **P0 (Critical)**: Service completely down
- **P1 (High)**: Major functionality broken
- **P2 (Medium)**: Minor functionality affected
- **P3 (Low)**: Enhancement or documentation issue

### Incident Workflow

1. **Detect**: Monitoring alerts or user reports
2. **Assess**: Determine severity and impact
3. **Respond**: Implement immediate fixes
4. **Communicate**: Update stakeholders
5. **Resolve**: Implement permanent solution
6. **Review**: Post-incident analysis

### Emergency Contacts

- **On-call Engineer**: [Contact information]
- **Product Owner**: [Contact information]
- **Infrastructure Team**: [Contact information]

## Maintenance

### Regular Tasks

- **Daily**: Review error logs and metrics
- **Weekly**: Update dependencies and security patches
- **Monthly**: Database maintenance and optimization
- **Quarterly**: Security audit and penetration testing

### Backup Procedures

- **Database**: Automated daily backups with 30-day retention
- **Configuration**: Version controlled in Git
- **Secrets**: Secure backup of environment variables

This runbook should be updated as the system evolves and new operational procedures are established.
