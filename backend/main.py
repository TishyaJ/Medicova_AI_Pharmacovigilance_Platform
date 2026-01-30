from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import create_db_and_tables
from routers import ai, medicines, cases, auth, ai_analysis

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router)
app.include_router(medicines.router)
app.include_router(cases.router)
app.include_router(auth.router)
app.include_router(ai_analysis.router)  # NEW: Gemini-based AI endpoints


@app.get("/")
def read_root():
    return {"message": "Medicircle Connect Backend API is running"}
