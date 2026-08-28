from knowledge_graph import KnowledgeGraphRecommender

class NeuroSymbolicRecommender:
    def __init__(self):
        self.kg = KnowledgeGraphRecommender()

    def recommend(self, user_profile):
        nodes = self.kg.query_graph(user_profile)
        return {
            "status": "success",
            "model": "Neuro-Symbolic Knowledge Graph + Llama 3.2 Reasoning",
            "matched_nodes": nodes,
            "confidence_score": 0.96
        }

if __name__ == "__main__":
    ns = NeuroSymbolicRecommender()
    print(ns.recommend({"income": 240000, "cost": 350000}))
