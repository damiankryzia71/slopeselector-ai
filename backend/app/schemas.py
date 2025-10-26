from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Request schemas
class RecommendationRequest(BaseModel):
    prompt: str
    userId: str

# Response schemas
class ProductDetail(BaseModel):
    name: str
    brand: str
    description: str
    priceRange: str
    pros: List[str]
    cons: List[str]
    highlight: str
    storeLink: List[str] = []  # Optional, defaults to empty array

class Category(BaseModel):
    categoryTitle: str
    products: List[ProductDetail]

class ApiResponse(BaseModel):
    categories: List[Category]
    id: Optional[str] = None
    prompt_text: Optional[str] = None
    created_at: Optional[str] = None

class HistoryItem(BaseModel):
    id: str
    prompt_text: str
    created_at: str
