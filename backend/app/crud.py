from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import uuid
from .models import User, RecommendationSet, Category, Product, ProductDetail, StoreLink
from .schemas import HistoryItem

def create_user(db: Session, user_id: str) -> User:
    """Create or get existing user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def create_recommendation_set(
    db: Session, 
    user_id: str, 
    prompt_text: str, 
    recommendations_data: dict
) -> RecommendationSet:
    """Create a new recommendation set with all related data"""
    
    # Create the recommendation set
    recommendation_set = RecommendationSet(
        user_id=user_id,
        prompt_text=prompt_text
    )
    db.add(recommendation_set)
    db.commit()
    db.refresh(recommendation_set)
    
    # Create categories and products
    for category_data in recommendations_data.get("categories", []):
        category = Category(
            recommendation_set_id=recommendation_set.id,
            title=category_data["categoryTitle"]
        )
        db.add(category)
        db.commit()
        db.refresh(category)
        
        # Create products for this category
        for product_data in category_data.get("products", []):
            product = Product(
                category_id=category.id,
                name=product_data["name"],
                brand=product_data["brand"],
                description=product_data["description"],
                price_range=product_data.get("priceRange", ""),
                highlight=product_data["highlight"]
            )
            db.add(product)
            db.commit()
            db.refresh(product)
            
            # Create store links (if any)
            store_links = product_data.get("storeLink", [])
            if store_links and len(store_links) > 0:
                for store_link in store_links:
                    # Extract store name from URL
                    store_name = "Unknown"
                    if "rei.com" in store_link:
                        store_name = "REI"
                    elif "evo.com" in store_link:
                        store_name = "Evo"
                    elif "backcountry.com" in store_link:
                        store_name = "Backcountry"
                    
                    store_link_obj = StoreLink(
                        product_id=product.id,
                        url=store_link,
                        store_name=store_name
                    )
                    db.add(store_link_obj)
            
            # Create product details (pros and cons)
            for pro in product_data.get("pros", []):
                pro_detail = ProductDetail(
                    product_id=product.id,
                    type="pro",
                    text=pro
                )
                db.add(pro_detail)
            
            for con in product_data.get("cons", []):
                con_detail = ProductDetail(
                    product_id=product.id,
                    type="con",
                    text=con
                )
                db.add(con_detail)
    
    db.commit()
    return recommendation_set

def get_user_history(db: Session, user_id: str) -> List[HistoryItem]:
    """Get user's recommendation history"""
    recommendation_sets = db.query(RecommendationSet)\
        .filter(RecommendationSet.user_id == user_id)\
        .order_by(desc(RecommendationSet.created_at))\
        .all()
    
    return [
        HistoryItem(
            id=str(rs.id),
            prompt_text=rs.prompt_text,
            created_at=rs.created_at.isoformat()
        )
        for rs in recommendation_sets
    ]

def get_recommendation_set(db: Session, set_id: str) -> Optional[RecommendationSet]:
    """Get a specific recommendation set by ID"""
    return db.query(RecommendationSet)\
        .filter(RecommendationSet.id == set_id)\
        .first()
