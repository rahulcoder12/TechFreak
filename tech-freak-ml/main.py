from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

app = FastAPI()

# --- DEFINE THE INCOMING DATA STRUCTURE ---
class RecommendationRequest(BaseModel):
    target_id: str
    products: List[Dict[str, Any]]  # Accepts any list of product dictionaries

@app.get("/")
def read_root():
    return {"status": "Stateless ML Recommendation Engine is Online"}

@app.post("/recommendations")
def get_recommendations(request: RecommendationRequest):
    # 1. Load the data sent by Node.js into a Pandas DataFrame
    df = pd.DataFrame(request.products)

    if df.empty:
        raise HTTPException(status_code=400, detail="Product list is empty.")

    # 2. Data Scrubbing: Combine features into a single 'tags' string
    def create_tags(row):
        # Gracefully handle missing fields depending on your DB structure
        cats = str(row.get('category', ''))
        brand = str(row.get('brand', ''))
        title = str(row.get('title', ''))
        description = str(row.get('description', ''))
        
        return f"{title} {brand} {cats} {description}".lower()

    df['tags'] = df.apply(create_tags, axis=1)

    # 3. Find the index of the target product
    # We use string comparison just in case your DB uses integers (like PostgreSQL) or UUIDs
    df['id_string'] = df['_id'].astype(str)
    
    try:
        target_idx = df.index[df['id_string'] == str(request.target_id)].tolist()[0]
    except IndexError:
        raise HTTPException(status_code=404, detail=f"Target product {request.target_id} not found in the provided catalog.")

    # 4. THE MATH: TF-IDF & Cosine Similarity
    cv = TfidfVectorizer(max_features=5000, stop_words='english')
    vectorized_matrix = cv.fit_transform(df['tags'])
    similarity_scores = cosine_similarity(vectorized_matrix)

    # 5. Sort and extract the top 4 closest matches
    distances = similarity_scores[target_idx]
    product_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:5]

    # 6. Package the results
    recommended_products = []
    for i in product_list:
        recommended_products.append(df.iloc[i[0]]['id_string'])

    return {
        "target_product": request.target_id,
        "recommendations": recommended_products
    }