from llama_hub.assemblyai.base import AssemblyAIAudioTranscriptReader
from llama_index import VectorStoreIndex
from dotenv import load_dotenv
import os
load_dotenv()  # Carga las variables de entorno del archivo .env

ASSEMBLYAI_API_KEY=os.getenv("ASSEMBLYAI_API_KEY")
OPENAI_API_KEY=os.getenv("OPENAI_API_KEY")

audio_file ="./audio/video.mp4"
reader = AssemblyAIAudioTranscriptReader(file_path=audio_file,api_key=ASSEMBLYAI_API_KEY)
docs = reader.load_data()

# print(docs[0].text)
docs[0].metadata = {}

index = VectorStoreIndex.from_documents(docs)  # Crea un índice de vectores a partir de los documentos transcritos
query_engine = index.as_query_engine()  # Crea un motor de consulta a partir del índice de vectores
response = query_engine.query("what does it said about willpower")
print(response)  # Imprime la respuesta de la consulta
