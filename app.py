# app.py
from fastapi import FastAPI
import uvicorn

app = FastAPI(title="ADAN-ID OpenCloud")

@app.get("/health")
def health_check():
    return {"status": "healthy", "maintainer": "Muhammad Adnan Ul Mustafa"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
