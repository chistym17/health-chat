from langchain_core.runnables import RunnableLambda
from agents.query_transformation_agent import QueryTransformationAgent

query_agent = QueryTransformationAgent()

query_transformation_workflow = RunnableLambda(lambda input: query_agent.transform(input["text"]))

if __name__ == "__main__":
    result = query_transformation_workflow.invoke({"text": "i have chest pain. i also have a headache, i can not sleep properly"})
    print(result) 