from langchain_core.runnables import RunnableLambda, RunnableBranch
from agents.classifier_agent import ClassifierAgent

classifier = ClassifierAgent()

classifier_step = RunnableLambda(lambda input: classifier.run(input["text"]))

process_workflow = (
    RunnableLambda(lambda input: {"text": input["text"]})
    .assign(classification=classifier_step)
    .pipe(
        RunnableBranch(
            (lambda input: input["classification"]["decision"] == "Not Relevant",
             RunnableLambda(lambda _: {"status": "warning", "message": "This is not health-related."})),

            (lambda input: input["classification"]["decision"] == "Needs More Context",
             RunnableLambda(lambda input: {
                 "status": "followup",
                 "questions": input["classification"].get("questions", [])
             })),

            (lambda input: input["classification"]["decision"] == "Relevant",
             RunnableLambda(lambda input: {
                 "status": "completed",
                 "message": "Proceeding to diagnosis (placeholder)."
             })),

             RunnableLambda(lambda _: {"status": "error", "message": "Unhandled case."})
        )
    )
)
