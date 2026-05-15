from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import leads, contacts, accounts, opportunities, activities, dashboard, masters

app = FastAPI(
    title="CRM Pro API",
    description="Backend API for CRM Pro React Application",
    version="1.0.0"
)

# CORS - allow React Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(leads.router)
app.include_router(contacts.router)
app.include_router(accounts.router)
app.include_router(opportunities.router)
app.include_router(activities.router)
app.include_router(dashboard.router)
app.include_router(masters.router)


@app.get("/")
def root():
    return {"message": "CRM Pro API is running", "docs": "/docs"}
