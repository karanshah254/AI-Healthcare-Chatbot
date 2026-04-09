from vector_search import search_vector_db

query = "What should I do if I have fever?"

results = search_vector_db(query)

print("\nRelevant medical context:\n")

for r in results:
    print("-", r[:200])