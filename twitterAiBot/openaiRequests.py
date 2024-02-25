## langchain_openai
## tweepy
## python-dotenv

## https://python.langchain.com/docs/get_started/quickstart

from langchain_openai import ChatOpenAI  # Importa la clase ChatOpenAI de la librería langchain_openai
from langchain_core.output_parsers import StrOutputParser  # Importa StrOutputParser para procesar la salida del modelo
from langchain_core.prompts import ChatPromptTemplate  # Importa ChatPromptTemplate para crear plantillas de mensajes
from dotenv import load_dotenv  # Importa load_dotenv para cargar variables de entorno desde un archivo .env
import os  # Importa el módulo os para interactuar con el sistema operativo
load_dotenv()  # Carga las variables de entorno desde un archivo .env

# Obtiene la clave de API de OpenAI desde las variables de entorno
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Crea una instancia de ChatOpenAI con ciertos parámetros, incluyendo la temperatura y el modelo a usar
llm = ChatOpenAI(temperature=1, model="gpt-4")

# Crea un objeto para analizar la salida del modelo y convertirla en una cadena de texto
output_parser = StrOutputParser()

# Define una función para generar un tweet
def generate_tweet():
    # Define la personalidad del bot en una variable
    personalidad = "Eres un bot de twitter diseñado para generar tweets sarcásticos, con un humor oscuro y burlón."
    # Crea una plantilla de mensajes usando la personalidad y la entrada del usuario
    prompt = ChatPromptTemplate.from_messages([
        ("system", personalidad),
        ("user", "{input}")
    ])

        # Combina la plantilla con el modelo de lenguaje y el analizador de salida
    chain = prompt | llm | output_parser
    # Invoca la cadena con la entrada del usuario y obtiene la respuesta
    response = chain.invoke({"input": "genera un tweet interesante, debe ser obligatoriamente menor a 140 caracteres"})
    return response

# # Llama a la función generate_tweet y almacena el resultado en una variable
# generated_tweet = generate_tweet()
# # Imprime el tweet generado
# print(generated_tweet)
