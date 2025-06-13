from abc import ABC, abstractmethod

class BaseAgent(ABC):
    @abstractmethod
    def run(self, input_text: str) -> dict:
        """
        Process input_text and return a dict result
        """
        pass
