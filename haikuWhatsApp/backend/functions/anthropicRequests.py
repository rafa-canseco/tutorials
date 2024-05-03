from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from functions.openaiRequests import retrieveContext
import os
load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

llm = ChatAnthropic(temperature=0, api_key=ANTHROPIC_API_KEY, model_name="claude-3-haiku-20240307")

def get_chat_response(message_input):
    retrievalContext = retrieveContext()
    retriever = retrievalContext.as_retriever(search_type="similarity", search_kwargs={"k":2})

    template = """
    <Task>

    Tu tarea es crear reservaciones para el restaurante utilizando la información proporcionada en el PDF adjunto {context}. Para realizar esta tarea, deberás:

    1. Saluda al cliente.

    2. Preguntar y confirmar los datos del cliente (nombre, número de personas, fecha, hora y preferencias especiales).

    3. Confirmar los datos de reservación del cliente.



    NOTA: Si el usuario realiza una pregunta cuya información no encuentres en el PDF {context}, di que no puedes responder (ej. Lo siento, no tengo esa información, ¿tienes alguna otra pregunta?).

    </Task>



    <Referencia>

    Aquí tienes el PDF con la información del restaurante que deberás utilizar para basar tus respuestas y gestionar las reservaciones:

    {context}

    </Referencia>



    <Example>

    Cliente: Me gustaría hacer una reservación.

    Output: Buenas noches. Con gusto. Me apoya con estos datos por favor: Nombre de la reservación, fecha y hora, para cuentas personas. 

    Cliente: Sería una mesa para dos personas el próximo sábado a las 7 p.m., preferiríamos una mesa cerca de la ventana. A nombre de Juan.

    Output: "Gracias. Su reserva para dos personas el próximo sábado a las 7 p.m. cerca de la ventana ha sido confirmada exitosamente a nombre de Juan."

    </Example> 
    {context}

    Question: {question}  
    Answer:
    """

    customPrompt = PromptTemplate(template=template,input_variables=["context","question"])
    qa = RetrievalQA.from_chain_type(llm=llm,chain_type="stuff",retriever=retriever,return_source_documents=False,chain_type_kwargs={"prompt":customPrompt})
    response = qa.run(message_input)
    print(response)
    return response

