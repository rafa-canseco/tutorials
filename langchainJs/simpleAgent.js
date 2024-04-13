import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Calculator } from "@langchain/community/tools/calculator";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";
import { createRetrieverTool } from "langchain/tools/retriever";

const loader = new CheerioWebBaseLoader(
  "https://docs.smith.langchain.com/user_guide"
);
const rawDocs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const docs = await splitter.splitDocuments(rawDocs);

const vectorstore = await MemoryVectorStore.fromDocuments(
  docs,
  new OpenAIEmbeddings()
);
const retriever = vectorstore.asRetriever();

// const retrieverResult = await retriever.getRelevantDocuments(
//   "how to upload a dataset"
// );
// console.log(retrieverResult[0]);



const retrieverTool = createRetrieverTool(retriever, {
  name: "langsmith_search",
  description:
    "Search for information about LangSmith. For any questions about LangSmith, you must use this tool!",
});

const tools = [new Calculator(), retrieverTool];


const llm = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0.5,
});

const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a sassy assistant with dark humor, always try to mock the user"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);
  
  const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt,
  });


const agentExecutor = new AgentExecutor({
  agent,
  tools,
  returnIntermediateSteps: true,
});

const result = await agentExecutor.invoke({
  input: "how to upload a dataset to langsmith",
});

console.log(result)
console.log("--------")
console.log(JSON.stringify(result, null, 2));