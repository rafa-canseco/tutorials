import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import { ChatPromptTemplate } from "@langchain/core/prompts";
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const chatModel = new ChatOpenAI({
  apiKey: OPENAI_API_KEY,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a world class technical documentation writer."],
  ["user", "{input}"],
]);

const chain = prompt.pipe(chatModel);

const response = await chain.invoke({
    input: "what is basketball?",
  });

console.log(response.content);