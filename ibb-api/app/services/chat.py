import re
from app.services.summarizer import SummarizerService
from app.services.keywords import KeywordsService

class ChatService:
    def __init__(self):
        self._summarizer = None
        self._keywords = None

    def _get_summarizer(self):
        if not self._summarizer:
            self._summarizer = SummarizerService()
        return self._summarizer

    def _get_keywords(self):
        if not self._keywords:
            self._keywords = KeywordsService()
        return self._keywords

    async def chat(self, message: str, context: str = "") -> str:
        """
        Intelligent chat with optional document context.
        Uses local models - no external API required.
        """
        msg_lower = message.lower()

        # Context-aware responses
        if context and len(context.strip()) > 50:
            if any(k in msg_lower for k in ["summarize", "summary", "brief", "overview"]):
                try:
                    summary = self._get_summarizer().summarize(context[:6000])
                    return f"**Summary of your document:**\n\n{summary}"
                except Exception as e:
                    return f"I encountered an issue summarizing the document: {str(e)}"

            if any(k in msg_lower for k in ["keyword", "topic", "key point", "main"]):
                try:
                    kw = self._get_keywords().extract(context[:4000])
                    kw_list = ", ".join(kw[:15]) if kw else "No keywords extracted"
                    return f"**Key topics and keywords from your document:**\n\n{kw_list}"
                except Exception as e:
                    return f"I encountered an issue extracting keywords: {str(e)}"

            if any(k in msg_lower for k in ["claim", "fact", "misinformation", "verify"]):
                from app.utils.text import extract_claims
                claims = extract_claims(context[:5000])
                if claims:
                    claim_list = "\n".join(f"- {c}" for c in claims[:8])
                    return f"**Claims detected in your document (pending verification):**\n\n{claim_list}\n\n_These claims should be verified against authoritative sources._"
                return "No specific verifiable claims were detected in the document."

        # General knowledge responses
        if any(k in msg_lower for k in ["hello", "hi", "hey", "how are you"]):
            return "Hello! I'm your AI Research Assistant. I can help you analyze documents, extract key information, detect claims, and research topics. Upload a document and ask me anything about it!"

        if "help" in msg_lower or "what can you do" in msg_lower:
            return """I can help you with:
- **Summarizing** your uploaded documents
- **Extracting keywords** and main topics
- **Identifying claims** that need fact-checking
- **Analyzing sentiment** and variant
- **Research questions** about any topic

Upload a document first, then ask me specific questions about it!"""

        if not context:
            return f"I understand you're asking: *{message}*\n\nFor the best results, please upload a document first so I can provide context-specific analysis. I can then summarize it, extract key claims, identify topics, and much more!"

        # Fallback with context
        word_count = len(context.split())
        preview = context[:300].strip()
        return f"Based on your document ({word_count} words), I can see it begins with: \"{preview}...\"\n\nCould you be more specific? For example, ask me to:\n- Summarize the document\n- Extract key claims\n- Identify main topics\n- Analyze the sentiment"
