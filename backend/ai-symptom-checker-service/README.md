# AI Symptom Checker Service

A microservice that provides AI-powered preliminary health analysis based on patient symptoms.

## Overview

This service analyzes patient-reported symptoms and provides:
- Preliminary health condition suggestions
- Recommended doctor specialties
- Warning signs to watch for
- Next steps for medical care

**Disclaimer**: This service provides preliminary analysis only and should NOT replace professional medical consultation.

## Architecture

- **Framework**: Spring Boot 3.x
- **Port**: 8087
- **AI Engine**: Google Generative AI (Gemini API)
- **No Database**: Stateless service

## Prerequisites

- Java 17+
- Maven 3.9+
- Google Gemini API Key (free tier available at https://makersuite.google.com)

## Setup Instructions

### 1. Get Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Create a new API key (free tier available)
3. Keep it secure

### 2. Build the Service

```bash
cd backend/ai-symptom-checker-service
mvn clean install
```

### 3. Run Locally (without Docker)

```bash
# Set the API key
export GEMINI_API_KEY="your-api-key-here"

# Run the service
mvn spring-boot:run
```

The service will start on `http://localhost:8087`

### 4. Run with Docker

```bash
cd backend
GEMINI_API_KEY="your-api-key-here" docker-compose up -d --build
```

## API Endpoints

### 1. Analyze Symptoms

**POST** `/api/symptoms/analyze`

**Request Body:**
```json
{
  "symptoms": ["fever", "cough", "headache"],
  "duration": "3-7 days",
  "severity": "moderate",
  "ageGroup": "adult",
  "additionalInfo": "Recently exposed to sick colleague"
}
```

**Response:**
```json
{
  "conditions": [
    {
      "name": "Common Cold",
      "probability": 80,
      "description": "A viral infection causing upper respiratory symptoms",
      "characteristics": ["nasal congestion", "cough", "mild fever"],
      "severity": "mild"
    },
    {
      "name": "Influenza (Flu)",
      "probability": 60,
      "description": "Highly contagious viral infection",
      "characteristics": ["high fever", "body aches", "severe fatigue"],
      "severity": "moderate"
    }
  ],
  "recommendedSpecialties": ["General Practitioner", "Pulmonologist"],
  "warnings": ["If fever exceeds 103F, seek immediate care"],
  "nextSteps": "Rest and monitor symptoms for 2-3 days",
  "analysisTimestamp": "2026-04-16T10:30:00",
  "disclaimer": "This is preliminary analysis and should NOT substitute professional medical advice",
  "confidence": "high"
}
```

### 2. Health Check

**GET** `/api/symptoms/health`

```json
{
  "status": "UP",
  "service": "AI Symptom Checker Service",
  "version": "1.0.0"
}
```

### 3. Service Info

**GET** `/api/symptoms/info`

```json
{
  "serviceName": "AI Symptom Checker Service",
  "version": "1.0.0",
  "description": "AI-powered preliminary health analysis service",
  "endpoints": [...]
}
```

## Testing with cURL

```bash
# Test through API Gateway
curl -X POST http://localhost:8080/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "cough"],
    "duration": "3-7 days",
    "severity": "moderate",
    "ageGroup": "adult"
  }'

# Direct service test (if running on 8087)
curl -X POST http://localhost:8087/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "cough"],
    "duration": "3-7 days",
    "severity": "moderate",
    "ageGroup": "adult"
  }'

# Health check
curl http://localhost:8087/api/symptoms/health
```

## Configuration

### Environment Variables

```properties
GEMINI_API_KEY        # Your Google Gemini API key (required)
SERVER_PORT          # Port to run on (default: 8087)
```

### Application Properties

Edit `src/main/resources/application.properties`:

```properties
spring.application.name=ai-symptom-checker-service
server.port=8087
gemini.api.key=${GEMINI_API_KEY:your-gemini-api-key-here}
```

## Integration with API Gateway

The service is automatically routed through the API Gateway:

- **Gateway Port**: 8080
- **Route**: `/api/symptoms/**` → `http://ai-symptom-checker:8087/api/symptoms/**`

### Gateway Properties

Update `api-gateway/src/main/resources/application.properties`:

```properties
services.symptom-checker.base-url=http://localhost:8087/api/symptoms
```

## Features

✅ Symptom Analysis
✅ Condition Suggestions with Probabilities
✅ Specialty Recommendations
✅ Warning Signs Detection
✅ Medical Disclaimers
✅ CORS Support
✅ Input Validation
✅ Health Checks
✅ Microservice Architecture

## Limitations

- Initial version uses mock responses (ready for real Gemini API integration)
- Stateless service (no history storage)
- Free tier Gemini API rate limits apply
- Analysis is preliminary, not diagnostic

## Future Enhancements

- Real Gemini API integration
- Analysis history logging
- User feedback collection
- Machine learning model fine-tuning
- Multi-language support
- Advanced caching

## Troubleshooting

### Service won't start
- Check Java 17+ is installed: `java -version`
- Verify Maven: `mvn -version`
- Check port 8087 is available

### API key errors
- Ensure `GEMINI_API_KEY` is set: `echo $GEMINI_API_KEY`
- Verify API key is valid from Google

### Docker build fails
- Clean: `docker-compose down -v`
- Rebuild: `docker-compose up -d --build`

### Gateway can't reach service
- Verify service is running: `curl http://localhost:8087/api/symptoms/health`
- Check docker network: `docker network ls`
- Verify network connection in compose file

## Security Notes

⚠️ **Important**: 
- This service accepts public requests (no auth required for demo)
- In production, add JWT validation or API key authentication
- Never commit real API keys to git
- Use environment variables for secrets

## Support

For issues or questions, check the main project documentation in the `docs/` folder.
