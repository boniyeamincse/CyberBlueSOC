from fastapi import FastAPI

app = FastAPI(title="CyberBlue SOC API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "Hello from CyberBlue SOC API!"}

@app.get("/health")
async def health():
    return {"status": "healthy"}