from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
from chat_memory import chat_history

load_dotenv()

app = FastAPI()

PORT = os.getenv("PORT")

# CORS setup to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"http://localhost:{PORT}"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Query(BaseModel):
    message: str


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = os.getenv("GROQ_URL")


@app.post("/chat")
async def chat_with_ai(query: Query):
    system_prompt = (
        "You are a helpful and professional AI assistant with deep expertise in medical and healthcare topics only. "
        "You must only respond to queries strictly related to medical symptoms, treatments, diseases, health advice, and similar healthcare topics. "
        "If the query is not related to medical or healthcare domains, respond only with this message:\n\n"
        "'This chatbot is only answerable to medical and healthcare queries, for other queries search it on Google.'"
        "If there is some query like hi,hey, good morning, good evening, hello, etc. the response should be:\n\n"
        "'Hello! How can I assist you with your medical or healthcare-related questions today?'"
        "If there is some query like bye, good night, take care, etc. the response should be:\n\n"
        "'Goodbye! Take care and stay healthy!'"
        "If there is some query like thank you, thanks, etc. the response should be:\n\n"
        "'You're welcome! If you have any more questions, feel free to ask.'"
        "If there is some query like what is your name, who are you, etc. the response should be:\n\n"
        "'I am a medical AI assistant here to help you with your healthcare-related questions.'"
        "If there is some query like what is your age, how old are you, etc. the response should be:\n\n"
        "'I don't have an age like humans do, but I'm here to provide you with the latest medical information.'"
        "If there is some query like some NSWF content, adult content, etc. the response should be:\n\n"
        "'I'm sorry, but I cannot assist with that. My focus is on providing medical and healthcare information.'"
        "If there is some query like some illegal content, hacking, etc. the response should be:\n\n"
        "'I'm sorry, but I cannot assist with that. My focus is on providing medical and healthcare information.'"
        "If there is some query like some political content, etc. the response should be:\n\n"
        "'I'm sorry, but I cannot assist with that. My focus is on providing medical and healthcare information.'"
        "If there is some query like some religious content, etc. the response should be:\n\n"
        "'I'm sorry, but I cannot assist with that. My focus is on providing medical and healthcare information.'"
        "If there is some query like some personal content, etc. the response should be:\n\n"
        "'I'm sorry, but I cannot assist with that. My focus is on providing medical and healthcare information.'"
        "If there is some query like asking real name, address, phone number, etc. the response should be:\n\n"
        "'I'm sorry, but I cannot assist with that. My focus is on providing medical and healthcare information.'"
    )

    # Build message history from saved chat
    messages = [{"role": "system", "content": system_prompt}]

    for pair in chat_history:
        messages.append({"role": "user", "content": pair["user"]})
        messages.append({"role": "assistant", "content": pair["bot"]})

    # Add the current query
    messages.append({"role": "user", "content": query.message})

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        body = {
            "model": "llama3-8b-8192",
            "messages": messages,
        }

        response = await client.post(GROQ_URL, headers=headers, json=body)
        response.raise_for_status()
        ai_response = response.json()["choices"][0]["message"]["content"]

    # Save the latest interaction
    chat_history.append({"user": query.message, "bot": ai_response})

    return {"reply": ai_response}


@app.get("/chat/history")
def get_chat_history():
    return chat_history
