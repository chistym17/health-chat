from langchain_core.runnables import RunnableLambda
from agents.query_transformation_agent import QueryTransformationAgent

query_agent = QueryTransformationAgent()

query_transformation_workflow = RunnableLambda(lambda input: query_agent.transform(input["text"]))

