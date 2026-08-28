import json
import networkx as nx

class KnowledgeGraphRecommender:
    def __init__(self, schemes_file="backend/src/data/schemesData.js"):
        self.graph = nx.DiGraph()
        self.build_graph()

    def build_graph(self):
        # Build knowledge graph mapping schemes to eligibility rules & benefits
        self.graph.add_node("Scheme:PMMY_Kishore", type="Scheme", min_income=0, max_income=800000, max_loan=500000)
        self.graph.add_node("Scheme:PM_KISAN", type="Scheme", min_income=0, max_income=500000, max_loan=300000)
        self.graph.add_node("Scheme:StandUpIndia", type="Scheme", min_income=0, max_income=1500000, max_loan=10000000)
        
        self.graph.add_edge("Category:Agriculture", "Scheme:PM_KISAN", relation="targets")
        self.graph.add_edge("Category:MicroEnterprise", "Scheme:PMMY_Kishore", relation="targets")
        self.graph.add_edge("Category:SC_ST_Entrepreneurship", "Scheme:StandUpIndia", relation="targets")

    def query_graph(self, user_profile):
        income = user_profile.get("income", 200000)
        cost = user_profile.get("cost", 300000)
        matched = []

        for node, data in self.graph.nodes(data=True):
            if data.get("type") == "Scheme":
                if income <= data.get("max_income", 1000000) and cost <= data.get("max_loan", 10000000):
                    matched.append(node)
        return matched

if __name__ == "__main__":
    kg = KnowledgeGraphRecommender()
    print("Graph Nodes:", kg.graph.nodes())
