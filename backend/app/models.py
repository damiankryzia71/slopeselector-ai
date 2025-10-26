from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    recommendation_sets = relationship("RecommendationSet", back_populates="user")

class RecommendationSet(Base):
    __tablename__ = "recommendation_sets"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    prompt_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="recommendation_sets")
    categories = relationship("Category", back_populates="recommendation_set", cascade="all, delete-orphan")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_set_id = Column(String, ForeignKey("recommendation_sets.id"))
    title = Column(String)
    
    # Relationships
    recommendation_set = relationship("RecommendationSet", back_populates="categories")
    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id = Column(String, ForeignKey("categories.id"))
    name = Column(String)
    brand = Column(String)
    description = Column(Text)
    price_range = Column(String)
    highlight = Column(String)
    
    # Relationships
    category = relationship("Category", back_populates="products")
    details = relationship("ProductDetail", back_populates="product", cascade="all, delete-orphan")
    store_links = relationship("StoreLink", back_populates="product", cascade="all, delete-orphan")

class StoreLink(Base):
    __tablename__ = "store_links"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id"))
    url = Column(String)
    store_name = Column(String)  # e.g., "REI", "Evo", "Backcountry"
    
    # Relationships
    product = relationship("Product", back_populates="store_links")

class ProductDetail(Base):
    __tablename__ = "product_details"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id"))
    type = Column(String)  # "pro" or "con"
    text = Column(String)
    
    # Relationships
    product = relationship("Product", back_populates="details")
