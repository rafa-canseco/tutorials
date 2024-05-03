## uv pip twilio uvicorn install fastapi langchain python-dotenv langchain_anthropic langchain_openai supabase langchain_community
from fastapi import FastAPI,Request
from fastapi.middleware.cors import CORSMiddleware
from functions.anthropicRequests import get_chat_response
from twilio.twiml.messaging_response import MessagingResponse
from fastapi.responses import Response
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.get("/health")
async def checkHealth():
    return {"status": "ok"}

@app.post("/whatsapp")
async def message(request: Request):
    
    incoming_que =(await request.form()).get('Body', '').lower()
    print(incoming_que)

    chat_response= get_chat_response(incoming_que)
    bot_resp =MessagingResponse()
    msg = bot_resp.message()
    msg.body(chat_response)

    return Response(content=str(bot_resp), media_type="application/xml")
    

