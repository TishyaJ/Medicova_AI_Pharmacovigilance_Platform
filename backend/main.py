from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import create_db_and_tables
from routers import ai, medicines, cases, auth
# AI Analysis router temporarily disabled - use ai-side notebooks for AI features
# from routers import ai_analysis

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()
    yield
    # Shutdown (if needed)

# Initialize FastAPI app
app = FastAPI(
    title="Medicircle Connect API",
    description="AI-powered Pharmacovigilance Platform Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative dev port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ai.router)
app.include_router(medicines.router)
app.include_router(cases.router)
app.include_router(auth.router)
# AI Analysis router temporarily disabled - use ai-side notebooks for AI features
# app.include_router(ai_analysis.router)


@app.get("/")
def read_root():
    return {"message": "Medicircle Connect Backend API is running", "status": "healthy"}

