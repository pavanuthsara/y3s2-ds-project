# AI Symptom Checker Service - Quick Start Testing Guide

## Step 1: Get Gemini API Key (Free)

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (keep it safe!)

## Step 2: Start the Full Stack

```bash
cd /Users/kaveeshaathukorala/blog-api/y3s2-ds-project/backend

# Set your API key (replace with your actual key)
export GEMINI_API_KEY="your-gemini-api-key-here"

# Build and run all services
docker-compose up -d --build
```

**Wait 30-60 seconds for services to start.**

Verify services are running:
```bash
docker-compose ps
```

You should see:
- ✅ api-gateway (8080)
- ✅ auth-service (8081)
- ✅ ai-symptom-checker (8087)

## Step 3: Test the Service

### Test 1: Health Check

```bash
curl http://localhost:8087/api/symptoms/health
```

**Expected Response:**
```json
{
  "status": "UP",
  "service": "AI Symptom Checker Service",
  "version": "1.0.0"
}
```

### Test 2: Analyze Symptoms (Direct)

```bash
curl -X POST http://localhost:8087/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "cough", "sore throat"],
    "duration": "3-7 days",
    "severity": "moderate",
    "ageGroup": "adult"
  }'
```

### Test 3: Analyze Symptoms (Through Gateway)

```bash
curl -X POST http://localhost:8080/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["headache", "fatigue", "chills"],
    "duration": "1-2 weeks",
    "severity": "mild",
    "ageGroup": "adult",
    "additionalInfo": "Recently recovered from cold"
  }'
```

### Test 4: Service Info

```bash
curl http://localhost:8080/api/symptoms/info
```

## Test Scenarios

### Scenario 1: Cold/Flu-like Symptoms
```bash
curl -X POST http://localhost:8080/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "cough", "headache", "sore throat"],
    "duration": "3-7 days",
    "severity": "moderate",
    "ageGroup": "adult"
  }'
```

### Scenario 2: Respiratory Issues
```bash
curl -X POST http://localhost:8080/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["chest pain", "shortness of breath", "cough"],
    "duration": "1-2 weeks",
    "severity": "severe",
    "ageGroup": "adult",
    "additionalInfo": "Smoker, history of asthma"
  }'
```

### Scenario 3: Digestive Issues
```bash
curl -X POST http://localhost:8080/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["nausea", "diarrhea", "stomach cramps"],
    "duration": "1-2 days",
    "severity": "moderate",
    "ageGroup": "adult",
    "additionalInfo": "Recent food intake unclear"
  }'
```

### Scenario 4: Allergic Reaction
```bash
curl -X POST http://localhost:8080/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["runny nose", "sneezing", "itchy eyes"],
    "duration": "few hours to days",
    "severity": "mild",
    "ageGroup": "adult"
  }'
```

## Expected Response Format

All analysis responses include:

```json
{
  "conditions": [
    {
      "name": "Condition Name",
      "probability": 80,
      "description": "Description of condition",
      "characteristics": ["symptom1", "symptom2"],
      "severity": "mild/moderate/severe"
    }
  ],
  "recommendedSpecialties": ["Specialty1", "Specialty2"],
  "warnings": ["Warning message"],
  "nextSteps": "What to do next",
  "analysisTimestamp": "2026-04-16T...",
  "disclaimer": "Medical disclaimer",
  "confidence": "high/medium/low"
}
```

## Validation

The service validates input:

```bash
# Missing symptoms (should fail with 400)
curl -X POST http://localhost:8080/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": [],
    "duration": "3-7 days",
    "severity": "moderate",
    "ageGroup": "adult"
  }'
```

## Postman Collection

Import this into Postman:

```json
{
  "info": {
    "name": "AI Symptom Checker",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "request": [
    {
      "name": "Analyze Symptoms",
      "request": {
        "method": "POST",
        "url": "http://localhost:8080/api/symptoms/analyze",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"symptoms\": [\"fever\", \"cough\"], \"duration\": \"3-7 days\", \"severity\": \"moderate\", \"ageGroup\": \"adult\"}"
        }
      }
    }
  ]
}
```

## Troubleshooting

### Service Not Starting
```bash
# Check logs
docker-compose logs ai-symptom-checker

# Restart service
docker-compose restart ai-symptom-checker
```

### Port Already in Use
```bash
# Kill service using port 8087
lsof -ti:8087 | xargs kill -9

# Or change docker-compose port mapping
```

### API Key Issues
```bash
# Verify API key is set
echo $GEMINI_API_KEY

# Check container environment
docker exec ai-symptom-checker env | grep GEMINI
```

### Gateway Can't Connect
```bash
# Test direct service
curl http://localhost:8087/api/symptoms/health

# Test through gateway
curl http://localhost:8080/api/symptoms/health

# Check network
docker network inspect dsproject-network
```

## Integration with Frontend

React usage example:

```javascript
// Hook for symptom analysis
const analyzeSymptoms = async (symptoms) => {
  const response = await fetch('http://localhost:8080/api/symptoms/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symptoms: symptoms,
      duration: '3-7 days',
      severity: 'moderate',
      ageGroup: 'adult'
    })
  });
  return response.json();
};
```

## Next Steps

1. ✅ Service is running
2. 📝 Test all endpoints
3. 🔌 Integrate real Gemini API (currently using mock)
4. 🎨 Add UI component in frontend
5. 📊 Add logging/monitoring

## Documentation

- Full README: `backend/ai-symptom-checker-service/README.md`
- Architecture: `docs/IMPLEMENTATION_GUIDE.md`
- Setup Guide: `docs/QUICK_START.md`
