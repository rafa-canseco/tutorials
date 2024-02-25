import os
import tweepy
from dotenv import load_dotenv
from openaiRequests import generate_tweet

## https://developer.twitter.com/en

# Carga las variables de entorno desde un archivo .env
load_dotenv()

# Configuración de credenciales para la API de Twitter
# Obtén tus credenciales creando una cuenta de desarrollador de Twitter y creando una app
TWITTER_API_KEY = os.getenv("TWITTER_API_KEY")
TWITTER_API_SECRET_KEY = os.getenv("TWITTER_API_SECRET_KEY")
TWITTER_ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN")
TWITTER_ACCESS_TOKEN_SECRET = os.getenv("TWITTER_ACCESS_TOKEN_SECRET")
TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")

# Inicializa el cliente de tweepy con tus credenciales de Twitter
client = tweepy.Client(bearer_token=TWITTER_BEARER_TOKEN,
                       consumer_key=TWITTER_API_KEY,
                       consumer_secret=TWITTER_API_SECRET_KEY,
                       access_token=TWITTER_ACCESS_TOKEN,
                       access_token_secret=TWITTER_ACCESS_TOKEN_SECRET,
                       wait_on_rate_limit=True)

def create_tweet():
    # Genera un tweet utilizando un modelo de IA del módulo openaiRequests
    tweet = generate_tweet()
    # Publica el tweet en Twitter usando el cliente de tweepy
    response = client.create_tweet(text=tweet)
    # Imprime la respuesta de Twitter después de publicar el tweet
    print(response)
    # Extrae el ID del tweet de los datos de la respuesta
    tweet_id = response.data['id']
    # Devuelve el ID del tweet
    return tweet_id

# Crea un tweet e imprime su ID
tweet_id = create_tweet()
print(tweet_id)
