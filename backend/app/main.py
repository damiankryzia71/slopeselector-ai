from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uuid

from .database import get_db, init_db
from .models import User, RecommendationSet, Category, Product, ProductDetail, StoreLink
from .schemas import RecommendationRequest, ApiResponse, HistoryItem
from .crud import create_user, create_recommendation_set, get_user_history, get_recommendation_set
from .services.gemini_service import fetch_recommendations

app = FastAPI(title="SlopeSelector AI API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
async def root():
    return {"message": "SlopeSelector AI API is running"}

@app.post("/api/recommendations", response_model=ApiResponse)
async def get_recommendations(request: RecommendationRequest, db: Session = Depends(get_db)):
    """Get AI-powered gear recommendations"""
    try:
        # Ensure user exists
        user = create_user(db, request.userId)
        
        # Get recommendations from Gemini API
        recommendations = await fetch_recommendations(request.prompt)
        
        # Save to database
        recommendation_set = create_recommendation_set(
            db, 
            user_id=request.userId, 
            prompt_text=request.prompt, 
            recommendations_data=recommendations
        )
        
        # Add database info to response
        recommendations["id"] = str(recommendation_set.id)
        recommendations["prompt_text"] = request.prompt
        recommendations["created_at"] = recommendation_set.created_at.isoformat()
        
        return recommendations
        
    except Exception as e:
        print(f"Error in get_recommendations: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/history/{userId}", response_model=List[HistoryItem])
async def get_history(userId: str, db: Session = Depends(get_db)):
    """Get user's recommendation history"""
    try:
        history = get_user_history(db, userId)
        if not history:
            raise HTTPException(status_code=404, detail="User or history not found")
        return history
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommendations/{setId}", response_model=ApiResponse)
async def get_recommendation_by_id(setId: str, db: Session = Depends(get_db)):
    """Get a specific recommendation set by ID"""
    try:
        recommendation_set = get_recommendation_set(db, setId)
        if not recommendation_set:
            raise HTTPException(status_code=404, detail="Recommendation set not found")
        
        # Convert database data back to API response format
        response = {
            "categories": [],
            "id": str(recommendation_set.id),
            "prompt_text": recommendation_set.prompt_text,
            "created_at": recommendation_set.created_at.isoformat()
        }
        
        for category in recommendation_set.categories:
            category_data = {
                "categoryTitle": category.title,
                "products": []
            }
            
            for product in category.products:
                product_data = {
                    "name": product.name,
                    "brand": product.brand,
                    "description": product.description,
                    "priceRange": product.price_range or "",
                    "pros": [detail.text for detail in product.details if detail.type == "pro"],
                    "cons": [detail.text for detail in product.details if detail.type == "con"],
                    "highlight": product.highlight,
                    "storeLink": [link.url for link in product.store_links] if product.store_links else []
                }
                category_data["products"].append(product_data)
            
            response["categories"].append(category_data)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
