# Phase 9: ML Recommendation Engine

Welcome to the ML phase! This is where TechFreak gets "smart" and suggests products to users based on what they are currently viewing. The ML service lives in `/Users/rahulbhuiya/Desktop/TechFreak/tech-freak-ml/`.

## What is Machine Learning? (The Simple Version)
Normally in programming, you write rules: "If user clicks button, show alert."
In Machine Learning (ML), you feed data into an algorithm, and the algorithm figures out the rules. For our recommendation engine, we aren't hardcoding "If a user views a laptop, suggest a mouse." Instead, we give the algorithm descriptions of all products, and it mathematically calculates which products are most similar.

## Recommendation Approaches

### Collaborative Filtering vs. Content-Based Filtering
1. **Collaborative Filtering:** Recommends things based on what similar *users* liked. ("People who bought X also bought Y"). Needs user history data.
2. **Content-Based Filtering:** Recommends things based on the *properties of the item itself*. ("This phone has similar specs/description to the phone you are viewing").

TechFreak uses **Content-Based Filtering**. We look at the product's title, description, and brand to find similar products.

## Natural Language Processing (NLP)
NLP is how computers understand human text. To recommend a product based on its description, we need to turn that text into math (numbers) so the computer can compare them.

## TF-IDF Explained from Scratch
We use an algorithm called **TF-IDF** (Term Frequency-Inverse Document Frequency) to turn product descriptions into numbers.

### 1. Term Frequency (TF)
How often does a specific word appear in a document (product description)?
If the word "laptop" appears 5 times in a description, its TF is high. But wait, what if the word "the" appears 20 times? Is "the" an important keyword? No.

### 2. Inverse Document Frequency (IDF)
This fixes the "the" problem. IDF measures how rare a word is across *all* documents.
- "the" appears in every document -> Low IDF score.
- "laptop" appears in only a few documents -> High IDF score.

**TF * IDF** = A score that tells us how important a word is to a specific document.

### Parameters in our code:
- `max_features=5000`: We only keep the top 5000 most important words across all products to save memory.
- `stop_words='english'`: Automatically removes common, useless words like "the", "is", "at", "which".

## Cosine Similarity Explained
Once TF-IDF turns our text into vectors (lists of numbers in a graph), how do we compare them?

### Vector Space Model
Imagine plotting products on a graph based on their features. 
### The Angle Matters
Instead of measuring the straight-line distance between two points (Euclidean distance), we measure the **angle** between their vectors from the origin.
- **Cosine of 0 degrees = 1**: The vectors point in the exact same direction. The products are identical!
- **Cosine of 90 degrees = 0**: The vectors are totally unrelated.

**Why Cosine over Euclidean for text?**
If one product description is 10 words long and another is 1000 words long, their points on a graph might be far apart (high Euclidean distance), even if they use the exact same words proportionally. Cosine similarity only cares about the *direction* (the ratio of words), making it perfect for comparing texts of different lengths.

## FastAPI vs. Flask/Django
Our ML service is built with **FastAPI**.
- **Django** is a massive framework with everything built-in (batteries included).
- **Flask** is a micro-framework, very simple but older.
- **FastAPI** is modern, incredibly fast, and has built-in data validation using Pydantic. It automatically generates API documentation!

### Pydantic for Validation
Pydantic ensures that the data we receive is exactly what we expect. If the backend sends a product without an ID, Pydantic throws an error automatically before our code even runs.

## `main.py` Line-by-Line Breakdown
Let's look at how the ML service works in `main.py`.

```python
from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

app = FastAPI()

# Pydantic models define expected data structures
class Product(BaseModel):
    id: str
    title: str
    description: str
    brand: str
    category: str

class RecommendationRequest(BaseModel):
    target_product_id: str
    all_products: list[Product]

# Feature Engineering function
def create_tags(row):
    # Combine important text fields into one giant string for TF-IDF
    return f"{row['title']} {row['description']} {row['brand']} {row['category']}"

@app.post("/recommend")
def get_recommendations(req: RecommendationRequest):
    # Convert incoming data into a Pandas DataFrame for easy manipulation
    df = pd.DataFrame([p.dict() for p in req.all_products])
    
    # Apply feature engineering
    df['tags'] = df.apply(create_tags, axis=1)
    
    # Initialize TF-IDF
    cv = TfidfVectorizer(max_features=5000, stop_words='english')
    
    # Convert text tags into a matrix of numbers
    vectors = cv.fit_transform(df['tags']).toarray()
    
    # Calculate cosine similarity between all products
    similarity = cosine_similarity(vectors)
    
    # Find the target product's index
    target_idx = df[df['id'] == req.target_product_id].index[0]
    
    # Get similarity scores for the target product
    distances = similarity[target_idx]
    
    # Sort and get top 4 most similar (excluding itself at index 0)
    product_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:5]
    
    # Return IDs of recommended products
    return {"recommended_ids": [df.iloc[i[0]]['id'] for i in product_list]}
```

### The `create_tags` Function (Feature Engineering)
Before we can run TF-IDF, we need text. The `create_tags` function combines the title, description, brand, and category into one mega-string called `tags`. This single string represents everything we know about the product textually.

## Architecture: Stateless vs. Stateful
Our ML service is **Stateless**. It doesn't have a database. 
**Data Flow:**
1. User views Product A.
2. Backend fetches *all* products from MongoDB.
3. Backend sends *all* products + Product A's ID to the ML service via HTTP POST.
4. ML service computes similarities on the fly.
5. ML service returns top 4 IDs.
6. Backend fetches those 4 products and sends them to frontend.

### Tradeoffs and Scalability Problems
- **Pros of Stateless:** Easy to deploy, no database to manage.
- **Cons:** It's terribly inefficient! Sending *all* products over the network on every single request is fine for 50 products, but impossible for 50,000. Re-calculating TF-IDF from scratch every time is very CPU intensive.

### The Solution for Scaling
In a real-world massive app:
1. We would pre-compute the TF-IDF vectors (Embeddings).
2. Store these vectors in a **Vector Database** (like Pinecone or Milvus).
3. The backend would just query the Vector DB for "Nearest Neighbors" instantly.

### The Duplicate Code Issue
If you look closely at the project, there is a `recommendationEngine.js` in the backend doing similar logic in Node.js, and this `main.py` in Python. This is a common architectural debt scenario. The Python service was likely built to replace the Node.js one for better ML libraries (scikit-learn), but the old code wasn't cleaned up.

---

## 🎤 Interview Prep

**Q: Can you explain how the recommendation system in your project works?**
**A:** "We use a content-based filtering approach. When a user views a product, the backend sends the catalog to a Python microservice built with FastAPI. The service uses scikit-learn's TF-IDF vectorizer to convert product titles, descriptions, and brands into numerical vectors. We then calculate the cosine similarity between the target product and all other products, returning the IDs of the top 4 most similar items."

**Q: What is the difference between TF and IDF?**
**A:** "Term Frequency (TF) measures how often a word appears in a specific document. But common words like 'the' have high TF. Inverse Document Frequency (IDF) corrects this by penalizing words that appear across *many* documents. So TF-IDF highlights words that are frequent in a specific document but rare globally, helping us find the actual keywords."

**Q: Why use Cosine Similarity instead of Euclidean Distance?**
**A:** "Cosine similarity measures the angle between two vectors rather than the physical distance between their points. This is crucial for text because two documents might have the exact same topic and vocabulary proportions, but one might just be longer. Euclidean distance would say they are far apart, while cosine similarity correctly identifies them as pointing in the exact same direction."

**Q: How would you scale this ML service if you had 1 million products?**
**A:** "Right now, the architecture computes vectors on the fly, which wouldn't scale. I would switch to an asynchronous pipeline where product embeddings are pre-computed whenever a product is added or updated. These embeddings would be stored in a specialized Vector Database like Pinecone. Then, recommendations would just be a fast nearest-neighbor lookup in the vector DB rather than a real-time matrix calculation."
