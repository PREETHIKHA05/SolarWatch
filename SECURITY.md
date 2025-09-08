# Security Policy

## Environment Variables

This project uses several environment variables that contain sensitive information. **Never commit these to version control.**

### Required Environment Variables

- `MONGO_URI` - MongoDB connection string with credentials
- `OPENAI_API_KEY` - OpenAI API key for AI predictions
- `WEATHER_API_KEY` - OpenWeatherMap API key

### Security Best Practices

1. **Use `.env.local` for local development**
   - Copy `.env.example` to `.env.local`
   - Fill in your actual values
   - Never commit `.env.local` to git

2. **Production Deployment**
   - Set environment variables in your hosting platform
   - Use secure secret management services
   - Rotate API keys regularly

3. **API Key Security**
   - Restrict API key permissions where possible
   - Monitor API usage for unusual activity
   - Use different keys for development and production

## Reporting Security Issues

If you discover a security vulnerability, please email [your-email@domain.com] instead of creating a public issue.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Features

- Environment variable validation
- Secure HTTP headers
- Input sanitization
- MongoDB connection security
- API rate limiting (recommended for production)