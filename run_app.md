#### Run frontend
```code 
npm run dev
```

#### Run backend
1. Create ```.env``` file in root of backend
```code
GROQ_API_KEY=<your-api-key>
GROQ_URL="url"
PORT=5173
```
2. Install all dependencies list from ```requirements.txt``` file
```code
pip install -r requirements.txt
```
3. Run the app
```code
python -m uvicorn main:app --reload --port 8000
```
4. Docker commands
- >Run docker container first
```
cd backend
docker build -t healthcare-backend .
docker run -p 8000:8000 healthcare-backend
```