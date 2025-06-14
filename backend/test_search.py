
import asyncio
from workflows.retrieval_workflow import retrieval_workflow

async def test():
    symptom_text = "I have chest pain and shortness of breath"
    results = await retrieval_workflow.ainvoke(symptom_text)
    for i, result in enumerate(results, 1):
        print(f"\nMatch #{i}")
        for k, v in result.items():
            print(f"{k}: {v}")

if __name__ == "__main__":
    asyncio.run(test())
