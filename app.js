(function () {
  "use strict";

  const STORAGE_KEYS = {
    theme: "llh.theme",
    progress: "llh.progress",
    bookmarks: "llh.bookmarks",
    quizResults: "llh.quizResults",
    collapsed: "llh.collapsed",
    notes: "llh.notes"
  };

  const LEVEL_ORDER = ["Beginner", "Intermediate", "Advanced", "Expert", "Reference"];

  const SOURCE_LEDGER = [
    {
      title: "LangChain docs",
      url: "https://docs.langchain.com/",
      note: "Primary source for modern LangChain v1 agent framework concepts, model/tool abstractions, structured output, middleware, and streaming."
    },
    {
      title: "LangGraph docs",
      url: "https://docs.langchain.com/oss/python/langgraph/overview",
      note: "Primary source for graph runtime concepts: state, nodes, edges, checkpointing, persistence, interrupts, routing, and multi-agent workflows."
    },
    {
      title: "LangSmith docs",
      url: "https://docs.langchain.com/langsmith/home",
      note: "Primary source for tracing, datasets, evaluation, monitoring, observability, and deployment workflows."
    },
    {
      title: "Model Context Protocol architecture",
      url: "https://modelcontextprotocol.io/docs/concepts/architecture",
      note: "Primary source for MCP host, client, server, tools, resources, prompts, data layer, and transport layer concepts."
    },
    {
      title: "OpenAI MCP tools guide",
      url: "https://platform.openai.com/docs/guides/tools-remote-mcp",
      note: "Primary source for using remote MCP servers as tools, allowed tools, approvals, and MCP security concerns."
    },
    {
      title: "VS Code MCP servers",
      url: "https://code.visualstudio.com/docs/copilot/chat/mcp-servers",
      note: "Primary source for VS Code MCP capabilities, resources, prompts, transports, approval flows, and troubleshooting."
    },
    {
      title: "Cursor MCP docs",
      url: "https://docs.cursor.com/context/model-context-protocol",
      note: "Primary source for Cursor MCP usage patterns."
    },
    {
      title: "Windsurf MCP docs",
      url: "https://docs.windsurf.com/windsurf/cascade/mcp",
      note: "Primary source for Windsurf Cascade MCP setup and usage patterns."
    }
  ];

  const PROVIDER_NODES = [
    { id: "openai", label: "OpenAI", x: 90, y: 86, kind: "provider", description: "Hosted frontier and tool-capable models.", details: ["Use when latency, structured output, function calling, and hosted tools matter.", "Production teams still wrap provider APIs with retries, budgets, evaluation, and observability."] },
    { id: "anthropic", label: "Anthropic", x: 90, y: 176, kind: "provider", description: "Claude models with strong long-context and tool workflows.", details: ["Common in coding, analysis, and MCP-heavy workflows.", "The application layer should keep provider interfaces swappable."] },
    { id: "gemini", label: "Gemini", x: 90, y: 266, kind: "provider", description: "Google model family with multimodal and ecosystem integrations.", details: ["Useful when Google Cloud, Workspace, or multimodal context is central.", "Treat provider-specific features as adapters, not the domain model."] },
    { id: "ollama", label: "Ollama", x: 90, y: 356, kind: "provider", description: "Local model runner for privacy, prototyping, and offline workflows.", details: ["Best for constrained local tasks and cost control.", "Expect weaker capability and different operational envelopes than hosted frontier models."] },
    { id: "llm", label: "LLM interface", x: 305, y: 220, kind: "core", description: "The normalized chat model boundary.", details: ["This is where prompts, messages, model settings, and provider adapters meet.", "Keep prompts and schema contracts explicit so model swaps are observable."] },
    { id: "langchain", label: "LangChain", x: 500, y: 220, kind: "core", description: "Agent framework and integration layer.", details: ["Use it for model integration, tools, messages, structured output, middleware, streaming, and simple agent loops.", "It gives a productive default before you need a custom graph."] },
    { id: "langgraph", label: "LangGraph", x: 685, y: 142, kind: "core", description: "Durable orchestration runtime for stateful agent workflows.", details: ["Use it when flow control, persistence, interrupts, retries, and human review matter.", "Graphs make state transitions inspectable and testable."] },
    { id: "langsmith", label: "LangSmith", x: 685, y: 300, kind: "core", description: "Tracing, evaluation, observability, and deployment workflow platform.", details: ["Use it to see traces, build datasets, run evaluators, compare experiments, and monitor production behavior.", "It closes the loop between prototypes and measurable reliability."] },
    { id: "mcp", label: "MCP", x: 500, y: 72, kind: "extension", description: "Protocol for connecting AI apps to external tools and context.", details: ["MCP servers expose tools, resources, and prompts to clients.", "Treat untrusted MCP output as untrusted input because it can carry instructions and data."] },
    { id: "rag", label: "RAG", x: 500, y: 372, kind: "pattern", description: "Retrieval augmented generation for grounded answers.", details: ["RAG is not just a vector database. It is ingestion, chunking, retrieval, ranking, synthesis, and evaluation.", "Most production failures come from retrieval quality, stale data, and missing evaluation."] },
    { id: "tools", label: "Tools", x: 315, y: 86, kind: "extension", description: "Typed actions a model or agent can call.", details: ["Tools need narrow schemas, clear descriptions, idempotency plans, and approval gates for sensitive actions.", "Tool calling turns language intent into software operations."] },
    { id: "production", label: "Production", x: 855, y: 220, kind: "outcome", description: "Reliable, observed, governed agent systems.", details: ["Production means reliability, cost control, latency budgets, security, evals, and rollback paths.", "The stack is only useful when it improves a real workflow under measurable constraints."] }
  ];

  const PROVIDER_EDGES = [
    ["openai", "llm", "models"], ["anthropic", "llm", "models"], ["gemini", "llm", "models"], ["ollama", "llm", "local models"],
    ["llm", "langchain", "messages"], ["tools", "langchain", "actions"], ["mcp", "tools", "external tools"], ["mcp", "langchain", "context"],
    ["langchain", "langgraph", "complex flow"], ["langchain", "rag", "retrieval"], ["langgraph", "production", "durable runtime"],
    ["langsmith", "production", "observability"], ["langgraph", "langsmith", "traces"], ["rag", "production", "grounding"]
  ];

  const AGENT_ARCHITECTURE_NODES = [
    { id: "input", label: "User input", x: 80, y: 210, description: "The visible request plus implicit context such as user, account, and task intent.", details: ["Normalize input early.", "Separate user text from trusted system context."] },
    { id: "context", label: "Context", x: 230, y: 95, description: "Relevant facts, policy, history, retrieved documents, and tool state.", details: ["Context is a budgeted design object.", "More context is not automatically better."] },
    { id: "model", label: "Model", x: 420, y: 210, description: "The reasoning and generation engine.", details: ["Models are probabilistic collaborators.", "Use schemas, tools, and evaluators to constrain the operating envelope."] },
    { id: "tools", label: "Tools", x: 600, y: 95, description: "External actions with typed inputs and outputs.", details: ["Every write tool needs approval, idempotency, and audit logs.", "Keep tool descriptions precise and action-oriented."] },
    { id: "state", label: "State", x: 600, y: 325, description: "Durable workflow memory used by graph nodes and recovery logic.", details: ["State is not chat history.", "It is the structured snapshot needed to resume and reason about the workflow."] },
    { id: "eval", label: "Evaluation", x: 785, y: 210, description: "Tests, graders, traces, and feedback loops.", details: ["Production agents need task-level evals, trajectory evals, and regression datasets.", "Observability without evaluation only tells you what happened."] }
  ];

  const AGENT_ARCHITECTURE_EDGES = [
    ["input", "context", "retrieve"], ["context", "model", "condition"], ["model", "tools", "call"], ["tools", "state", "result"],
    ["state", "model", "resume"], ["model", "eval", "trace"], ["eval", "context", "improve"], ["input", "model", "prompt"]
  ];

  const LANGGRAPH_NODES = [
    { id: "start", label: "START", x: 70, y: 220, description: "Graph entry point.", details: ["Receives typed state.", "Starts deterministic control flow."] },
    { id: "classify", label: "classify_intent", x: 230, y: 220, description: "Node that decides the task type.", details: ["Nodes are functions over state.", "Return partial state updates."] },
    { id: "retrieve", label: "retrieve", x: 430, y: 110, description: "Fetches context from docs, tools, or databases.", details: ["Use retries for transient dependencies.", "Store retrieval evidence in state."] },
    { id: "draft", label: "draft_response", x: 430, y: 330, description: "Generates candidate output.", details: ["Use structured outputs where possible.", "Keep prompt inputs traceable."] },
    { id: "review", label: "human_review", x: 650, y: 220, description: "Interrupt for approval or correction.", details: ["Interrupts let workflows pause safely.", "Checkpointing lets the graph resume later."] },
    { id: "end", label: "END", x: 830, y: 220, description: "Terminal graph state.", details: ["Return final answer and metadata.", "Persist trace and evaluation hooks."] }
  ];

  const LANGGRAPH_EDGES = [
    ["start", "classify", "start"], ["classify", "retrieve", "needs context"], ["classify", "draft", "simple"], ["retrieve", "draft", "evidence"],
    ["draft", "review", "approval"], ["review", "end", "send"]
  ];

  const RAG_NODES = [
    { id: "sources", label: "Sources", x: 80, y: 220, description: "Docs, tickets, PDFs, websites, databases, and code.", details: ["Track provenance and freshness.", "Separate trusted and untrusted corpora."] },
    { id: "ingest", label: "Ingestion", x: 230, y: 220, description: "Load, parse, clean, and normalize source material.", details: ["Bad parsing causes bad retrieval.", "Keep source metadata from the first step."] },
    { id: "chunk", label: "Chunking", x: 380, y: 220, description: "Split content into retrieval units.", details: ["Chunk by semantic boundary when possible.", "Tune overlap with evals, not vibes."] },
    { id: "embed", label: "Embeddings", x: 530, y: 220, description: "Represent chunks as vectors.", details: ["Embedding model choice affects recall.", "Re-embedding is a migration event."] },
    { id: "retrieve", label: "Retrieval", x: 680, y: 145, description: "Find candidate chunks.", details: ["Hybrid search often beats vectors alone.", "Measure recall before measuring answer quality."] },
    { id: "rerank", label: "Re-rank", x: 680, y: 295, description: "Order candidates by relevance.", details: ["Re-ranking improves precision at extra latency and cost.", "Use it when top-k is noisy."] },
    { id: "answer", label: "Answer", x: 840, y: 220, description: "Synthesize a grounded response.", details: ["Cite evidence.", "Refuse or ask for more context when retrieval is weak."] }
  ];

  const RAG_EDGES = [
    ["sources", "ingest", "load"], ["ingest", "chunk", "split"], ["chunk", "embed", "vectorize"], ["embed", "retrieve", "index"],
    ["retrieve", "rerank", "candidates"], ["rerank", "answer", "context"], ["retrieve", "answer", "fallback"]
  ];

  const MCP_NODES = [
    { id: "host", label: "MCP host", x: 120, y: 220, description: "The AI application such as Claude Desktop, VS Code, Cursor, Windsurf, Codex, or a custom app.", details: ["The host coordinates one or more clients.", "It decides what context is sent to the model."] },
    { id: "clientA", label: "MCP client", x: 330, y: 120, description: "A client instance connected to one server.", details: ["Each connection has lifecycle negotiation.", "Clients discover capabilities before use."] },
    { id: "clientB", label: "MCP client", x: 330, y: 320, description: "A second client instance for another server.", details: ["Hosts can connect to multiple servers.", "Tool lists can change over time."] },
    { id: "serverA", label: "Local server", x: 560, y: 120, description: "A local STDIO server, often for filesystem or local tools.", details: ["Good for local context and developer workflows.", "Sandbox writes when possible."] },
    { id: "serverB", label: "Remote server", x: 560, y: 320, description: "A remote Streamable HTTP or legacy SSE server.", details: ["Good for SaaS systems and shared services.", "Treat remote servers as third-party data processors."] },
    { id: "primitives", label: "Tools, resources, prompts", x: 790, y: 220, description: "The core primitives MCP servers expose.", details: ["Tools perform actions.", "Resources provide context.", "Prompts provide reusable interaction templates."] }
  ];

  const MCP_EDGES = [
    ["host", "clientA", "connection"], ["host", "clientB", "connection"], ["clientA", "serverA", "stdio"], ["clientB", "serverB", "http"],
    ["serverA", "primitives", "exposes"], ["serverB", "primitives", "exposes"], ["primitives", "host", "context and action"]
  ];

  const KNOWLEDGE_NODES = [
    { id: "llms", label: "LLMs", x: 450, y: 55, description: "Models are the reasoning and generation substrate.", details: ["They do not provide state, tools, or guarantees by themselves."] },
    { id: "prompts", label: "Prompting", x: 230, y: 150, description: "Instructions and examples shape behavior.", details: ["Prompting is necessary but not sufficient for production reliability."] },
    { id: "rag", label: "RAG", x: 670, y: 150, description: "Retrieval grounds model outputs in external knowledge.", details: ["RAG depends on ingestion quality and evaluation."] },
    { id: "tools", label: "Tools", x: 170, y: 315, description: "Tools let models act through typed interfaces.", details: ["Tool abuse is a security risk."] },
    { id: "memory", label: "Memory", x: 360, y: 315, description: "Memory provides continuity across turns and tasks.", details: ["Distinguish user memory, thread state, and workflow state."] },
    { id: "agents", label: "Agents", x: 540, y: 315, description: "Agents combine models, tools, context, and control loops.", details: ["Agent quality comes from architecture and evals, not autonomy alone."] },
    { id: "langgraph", label: "LangGraph", x: 740, y: 315, description: "LangGraph makes agent workflows durable and explicit.", details: ["Use for state machines, approvals, and multi-agent workflows."] },
    { id: "mcp", label: "MCP", x: 260, y: 455, description: "MCP standardizes tool and context connections.", details: ["It is a protocol, not an agent framework."] },
    { id: "langsmith", label: "LangSmith", x: 610, y: 455, description: "LangSmith observes and evaluates LLM systems.", details: ["It turns traces into testable improvement loops."] }
  ];

  const KNOWLEDGE_EDGES = [
    ["llms", "prompts", "condition"], ["llms", "rag", "ground"], ["prompts", "tools", "select"], ["tools", "agents", "act"],
    ["memory", "agents", "context"], ["rag", "agents", "evidence"], ["agents", "langgraph", "orchestrate"],
    ["mcp", "tools", "standardize"], ["langgraph", "langsmith", "trace"], ["agents", "langsmith", "evaluate"]
  ];

  const FUNDAMENTAL_TOPICS = [
    {
      title: "Models",
      what: "A model is the provider-backed chat or completion interface that turns messages into output.",
      why: "Production teams isolate model choice because capability, latency, cost, context window, and supported features change quickly.",
      how: "Wrap providers behind a standard chat model interface, keep model settings explicit, and log model/version with each run.",
      code: "import { initChatModel } from \"langchain/chat_models/universal\";\n\nconst model = await initChatModel(\"openai:gpt-4.1-mini\", {\n  temperature: 0,\n});\n\nconst result = await model.invoke(\"Summarize the incident in 3 bullets.\");",
      mistakes: ["Binding business rules to one provider feature.", "Changing temperature without tracking experiment results.", "Ignoring rate limits, retries, and timeout behavior."],
      questions: ["What changes when you swap providers?", "Why should model version be part of trace metadata?"]
    },
    {
      title: "Prompts",
      what: "Prompts combine instructions, examples, constraints, and context into the model input.",
      why: "Prompts are the cheapest control surface, but they are brittle when they carry business logic that should be code.",
      how: "Keep system instructions stable, inject task context separately, and pair prompts with eval datasets.",
      code: "const prompt = `You are a support triage agent.\nReturn JSON with: priority, reason, next_action.\nTicket: ${ticketText}`;",
      mistakes: ["Mixing untrusted user content into system instructions.", "Changing prompts without evals.", "Using long policy walls instead of narrow tools and schemas."],
      questions: ["What prompt content is trusted?", "Which parts should be tests instead of prose?"]
    },
    {
      title: "Messages",
      what: "Messages preserve roles such as system, user, assistant, and tool across a conversation.",
      why: "Message structure helps models distinguish instruction, request, answer, and tool evidence.",
      how: "Store message history deliberately, trim by relevance, and keep tool outputs separate from user text.",
      code: "const messages = [\n  { role: \"system\", content: \"Answer from approved docs only.\" },\n  { role: \"user\", content: question },\n  { role: \"tool\", content: retrievedEvidence }\n];",
      mistakes: ["Treating chat history as memory.", "Stuffing raw tool output into the user role.", "Letting old conversation state override current policy."],
      questions: ["When should old messages be summarized?", "How do tool messages differ from user messages?"]
    },
    {
      title: "Tool calling",
      what: "Tool calling lets a model request typed software actions instead of only writing text.",
      why: "Tools turn intent into controlled operations such as search, database lookup, ticket creation, or file edits.",
      how: "Define narrow schemas, clear descriptions, safe defaults, timeouts, and approval gates for sensitive writes.",
      code: "import { tool } from \"@langchain/core/tools\";\nimport * as z from \"zod\";\n\nconst lookupOrder = tool(async ({ orderId }) => {\n  return await orders.findById(orderId);\n}, {\n  name: \"lookup_order\",\n  description: \"Use to retrieve one customer order by id.\",\n  schema: z.object({ orderId: z.string() })\n});",
      mistakes: ["Giving a tool broad admin powers.", "Vague tool descriptions.", "Returning huge unfiltered payloads to the model."],
      questions: ["Which tools require human approval?", "How should failed tool calls be represented?"]
    },
    {
      title: "Structured output",
      what: "Structured output constrains model responses into typed objects such as JSON schemas.",
      why: "Applications need parseable contracts for routing, storage, evaluation, and UI rendering.",
      how: "Use provider-native schemas when available, tool-based strategies when needed, and validate everything at the boundary.",
      code: "const TicketSchema = z.object({\n  priority: z.enum([\"low\", \"medium\", \"high\"]),\n  reason: z.string(),\n  needsHuman: z.boolean()\n});\n\nconst agent = createAgent({ model, tools, responseFormat: TicketSchema });",
      mistakes: ["Assuming generated JSON is valid without validation.", "Making schemas too loose to be useful.", "Hiding uncertainty instead of representing it."],
      questions: ["What should happen on schema validation failure?", "When is a free-form answer better?"]
    },
    {
      title: "Middleware",
      what: "Middleware wraps model and agent calls with cross-cutting behavior.",
      why: "Retries, safety filters, logging, model routing, redaction, and budgets should not be duplicated in every prompt.",
      how: "Put reusable controls at the agent boundary and record decisions in traces.",
      code: "const agent = createAgent({\n  model,\n  tools,\n  middleware: [redactSecrets, enforceBudget, retryTransientModelErrors]\n});",
      mistakes: ["Putting invisible policy changes in middleware without trace metadata.", "Retrying non-idempotent tool calls.", "Hiding errors that evals need to see."],
      questions: ["Which failures are retryable?", "What middleware decisions should appear in traces?"]
    },
    {
      title: "Memory",
      what: "Memory is persisted information used beyond the current prompt.",
      why: "Agents need continuity, but careless memory creates privacy, stale context, and prompt injection risk.",
      how: "Separate conversation summaries, user preferences, task state, and long-term knowledge. Make deletion and provenance explicit.",
      code: "const memoryRecord = {\n  userId,\n  kind: \"preference\",\n  value: \"prefers concise engineering explanations\",\n  sourceTraceId,\n  createdAt: new Date().toISOString()\n};",
      mistakes: ["Saving everything.", "Treating memory as truth without provenance.", "Letting user-controlled text become future system instruction."],
      questions: ["What memory can the user inspect or delete?", "How do you expire stale memory?"]
    },
    {
      title: "Streaming",
      what: "Streaming sends partial model or workflow events before the final response is complete.",
      why: "Streaming improves perceived latency and exposes intermediate agent progress.",
      how: "Stream tokens for text UX, stream events for agents, and keep the final persisted state authoritative.",
      code: "for await (const chunk of await agent.stream(input, { streamMode: \"updates\" })) {\n  renderWorkflowEvent(chunk);\n}",
      mistakes: ["Persisting partial text as final truth.", "Streaming internal secrets or raw tool outputs.", "Ignoring cancellation and backpressure."],
      questions: ["What events are safe for users to see?", "How does streaming change timeout handling?"]
    },
    {
      title: "Callbacks and tracing",
      what: "Callbacks and tracing capture model calls, tool calls, timings, inputs, outputs, and metadata.",
      why: "You cannot debug or evaluate an agent you cannot see.",
      how: "Instrument every meaningful boundary and connect traces to datasets, releases, and user-impact metrics.",
      code: "const result = await agent.invoke(input, {\n  configurable: { thread_id: userSessionId },\n  metadata: { release: \"rag-assistant-v3\", tenant: tenantId }\n});",
      mistakes: ["Logging sensitive data without redaction.", "Tracing only the final answer.", "Not linking traces to eval failures."],
      questions: ["Which metadata lets you compare releases?", "How do you sample high-volume traces?"]
    }
  ];

  const PRODUCT_COMPARISON_ROWS = [
    ["LangChain", "Agent framework and integration layer", "Low to medium", "Chatbots, tool calling, structured output, simple agents, provider abstraction", "Fast start, broad integrations, productive defaults", "Can hide control flow when workflows become complex", "Use for most first agents and integration-heavy apps", "Avoid as the only abstraction for durable multi-step workflows"],
    ["LangGraph", "Durable orchestration runtime", "Medium to high", "State machines, human approval, retries, persistence, multi-agent systems", "Explicit state, controllable routing, checkpointing, interrupts", "More design upfront than simple chains", "Use when the workflow has branches, state, or approvals", "Avoid for one-shot calls or trivial prompt wrappers"],
    ["LangSmith", "Observability, evaluation, testing, and deployment workflows", "Low to medium", "Tracing, datasets, regression evals, monitoring, experiment comparison", "Turns agent behavior into inspectable evidence", "Requires evaluation discipline and trace hygiene", "Use before serious production rollout", "Avoid only for throwaway local experiments"]
  ];

  const DECISIONS = [
    ["I want a basic chatbot.", "Start with LangChain. Add LangSmith tracing early. Move to LangGraph only when the conversation needs durable state or explicit workflow branches."],
    ["I want a RAG assistant.", "Use LangChain for models, prompts, tools, and retrievers. Add LangSmith evals for retrieval and answer quality. Use LangGraph if retrieval, review, and fallback paths become stateful."],
    ["I want a multi-agent system.", "Use LangGraph. Multi-agent coordination is control flow and state management, not just a prompt pattern."],
    ["I want production observability.", "Use LangSmith. Traces, datasets, evaluations, and monitoring are the feedback loop for reliability."],
    ["I only need a typed model call.", "Use the raw provider SDK or LangChain model abstraction. Do not introduce graph orchestration until the workflow needs it."],
    ["I need human approval before sending emails or making changes.", "Use LangGraph interrupts and checkpointing, plus LangSmith traces for auditability."]
  ];

  const RAG_VECTOR_ROWS = [
    ["pgvector", "Teams already on Postgres, moderate scale, transactional metadata joins", "Simple ops, SQL joins, good enough for many products", "Scaling and ANN tuning can be harder than managed vector systems"],
    ["Pinecone", "Managed vector search with low operational overhead", "Strong managed experience, filtering, scaling", "Vendor dependency and cost visibility need attention"],
    ["Weaviate", "Knowledge-graph-like metadata and hybrid search use cases", "Hybrid retrieval, schemas, managed or self-hosted", "Operational model can be heavier than simple embedded stores"],
    ["Chroma", "Local development, prototypes, small internal tools", "Fast setup, simple developer experience", "Not always the right production control plane for enterprise scale"],
    ["Qdrant", "High-performance vector search with self-host or cloud", "Strong filtering, performance, Rust implementation", "Still requires retrieval design, monitoring, and backup planning"]
  ];

  const ROADMAP_LEVELS = [
    ["Level 0", "LLM basics", "8-12 hours", "Understand tokens, context windows, messages, temperature, tool calling, and eval vocabulary.", "Build a provider comparison notebook."],
    ["Level 1", "Prompt engineering", "12-18 hours", "Write clear instructions, examples, constraints, and refusal behavior.", "Create a prompt regression set."],
    ["Level 2", "LangChain fundamentals", "16-24 hours", "Use models, prompts, tools, structured output, middleware, memory, streaming, and tracing.", "Build a tool-calling support bot."],
    ["Level 3", "RAG", "24-40 hours", "Design ingestion, chunking, retrieval, ranking, synthesis, citations, and retrieval evals.", "Build a documented knowledge assistant."],
    ["Level 4", "Tools", "16-24 hours", "Design safe typed actions, approvals, retries, idempotency, and error recovery.", "Build a calendar or ticket triage agent with mocked writes."],
    ["Level 5", "Agents", "24-40 hours", "Understand ReAct, planning, reflection, routing, tool loops, and failure handling.", "Build a research agent with budget controls."],
    ["Level 6", "LangGraph", "32-56 hours", "Model workflows as state graphs with checkpointing, interrupts, and conditional routing.", "Build a human-approved email agent."],
    ["Level 7", "LangSmith", "16-32 hours", "Trace, evaluate, monitor, compare, and regression-test LLM systems.", "Create an eval suite for a RAG assistant."],
    ["Level 8", "Production agent engineering", "60+ hours", "Own security, cost, latency, reliability, observability, rollout, and incident response.", "Ship an enterprise agent with guardrails and dashboards."]
  ];

  const PROJECTS = [
    { level: "Beginner", title: "Chatbot", difficulty: "Beginner", time: "4-8 hours", description: "A local chat UI backed by one model provider.", architecture: "Browser UI -> API wrapper -> chat model -> trace.", skills: ["messages", "prompting", "model settings"] },
    { level: "Beginner", title: "Tool calling bot", difficulty: "Beginner", time: "6-10 hours", description: "A bot that calls a weather, calculator, or ticket lookup tool.", architecture: "Agent -> typed tools -> tool result -> final response.", skills: ["tool schemas", "tool descriptions", "error handling"] },
    { level: "Beginner", title: "PDF chat", difficulty: "Beginner", time: "8-14 hours", description: "Ask questions over one PDF with citations.", architecture: "PDF parser -> chunks -> embeddings -> retriever -> answer.", skills: ["chunking", "retrieval", "citations"] },
    { level: "Intermediate", title: "RAG assistant", difficulty: "Intermediate", time: "20-35 hours", description: "A docs assistant with ingestion, retrieval evals, and citations.", architecture: "Ingestion job -> vector index -> retriever -> re-ranker -> answer evaluator.", skills: ["hybrid search", "evals", "source grounding"] },
    { level: "Intermediate", title: "Research agent", difficulty: "Intermediate", time: "24-40 hours", description: "An agent that decomposes a question, searches, summarizes, and cites evidence.", architecture: "Planner -> search tools -> note state -> synthesis -> evaluator.", skills: ["planning", "tool use", "budgeting"] },
    { level: "Intermediate", title: "Email agent", difficulty: "Intermediate", time: "24-40 hours", description: "Classifies messages, drafts replies, and asks for approval before sending.", architecture: "LangGraph state -> classify -> retrieve context -> draft -> interrupt -> send.", skills: ["interrupts", "approval", "checkpointing"] },
    { level: "Advanced", title: "Multi-agent team", difficulty: "Advanced", time: "40-70 hours", description: "Specialized researcher, analyst, writer, and reviewer agents coordinated by a supervisor.", architecture: "Supervisor graph -> worker agents -> shared state -> reviewer -> final.", skills: ["routing", "multi-agent state", "review loops"] },
    { level: "Advanced", title: "Autonomous research system", difficulty: "Advanced", time: "50-90 hours", description: "Long-running research workflow with source tracking, retries, and report generation.", architecture: "Graph scheduler -> search -> extraction -> synthesis -> eval -> report.", skills: ["durable execution", "source ledger", "quality gates"] },
    { level: "Advanced", title: "Coding agent", difficulty: "Advanced", time: "60-100 hours", description: "A bounded code agent that reads, edits, tests, and produces PR-ready diffs.", architecture: "Task brief -> repo tools -> plan -> edit -> test -> review -> diff.", skills: ["sandboxing", "test loops", "tool safety"] },
    { level: "Expert", title: "Agent platform", difficulty: "Expert", time: "100+ hours", description: "A platform for multiple internal agents with shared tracing, policies, tools, and evals.", architecture: "Agent registry -> tool gateway -> policy engine -> LangSmith -> deployment.", skills: ["governance", "multi-tenant ops", "observability"] },
    { level: "Expert", title: "Enterprise agent system", difficulty: "Expert", time: "120+ hours", description: "A governed assistant connected to enterprise knowledge, identity, approvals, and audit logs.", architecture: "Identity -> retrieval -> policy -> agent graph -> approvals -> audit.", skills: ["security", "RBAC", "data boundaries"] },
    { level: "Expert", title: "Deep research clone", difficulty: "Expert", time: "120+ hours", description: "A deep research product with planning, web/source discovery, extraction, synthesis, and verifiable reports.", architecture: "Planner -> parallel research graph -> evidence store -> synthesis -> critique -> report.", skills: ["parallelism", "evidence quality", "report evals"] }
  ];

  const RESOURCES = [
    { category: "Official", title: "LangChain Docs", url: "https://docs.langchain.com/", description: "Core documentation for LangChain, LangGraph, LangSmith, integrations, and agent engineering." },
    { category: "Official", title: "LangGraph Docs", url: "https://docs.langchain.com/oss/python/langgraph/overview", description: "Graph runtime docs for stateful workflows, persistence, interrupts, and multi-agent systems." },
    { category: "Official", title: "LangSmith Docs", url: "https://docs.langchain.com/langsmith/home", description: "Tracing, evaluation, datasets, monitoring, and deployment documentation." },
    { category: "Official", title: "LangChain Academy", url: "https://academy.langchain.com/", description: "Official curriculum for agent and LangGraph learning paths." },
    { category: "GitHub", title: "langchain-ai/langchain", url: "https://github.com/langchain-ai/langchain", description: "Python LangChain repository." },
    { category: "GitHub", title: "langchain-ai/langchainjs", url: "https://github.com/langchain-ai/langchainjs", description: "JavaScript and TypeScript LangChain repository." },
    { category: "GitHub", title: "langchain-ai/langgraph", url: "https://github.com/langchain-ai/langgraph", description: "Python LangGraph repository." },
    { category: "GitHub", title: "langchain-ai/langgraphjs", url: "https://github.com/langchain-ai/langgraphjs", description: "JavaScript and TypeScript LangGraph repository." },
    { category: "GitHub", title: "langchain-ai/docs", url: "https://github.com/langchain-ai/docs", description: "Source repository for LangChain documentation." },
    { category: "GitHub", title: "langchain-ai/langchain-academy", url: "https://github.com/langchain-ai/langchain-academy", description: "Official academy examples and coursework." },
    { category: "GitHub", title: "learning-langchain", url: "https://github.com/search?q=learning-langchain&type=repositories", description: "Community repositories for practice and reference. Verify freshness before copying code." },
    { category: "GitHub", title: "langchain-course", url: "https://github.com/search?q=langchain-course&type=repositories", description: "Community course repositories. Treat as supplemental, not authoritative." },
    { category: "GitHub", title: "langchain-for-beginners", url: "https://github.com/search?q=langchain-for-beginners&type=repositories", description: "Beginner-oriented examples, often useful for syntax repetition." },
    { category: "Videos", title: "LangChain YouTube", url: "https://www.youtube.com/@LangChain", description: "Official talks, demos, and release explanations." },
    { category: "Books", title: "LLM engineering books", url: "https://www.oreilly.com/search/?query=langchain", description: "Long-form references. Prefer recent editions because APIs move quickly." },
    { category: "Blogs", title: "LangChain Blog", url: "https://blog.langchain.com/", description: "Product updates, case studies, patterns, and ecosystem announcements." },
    { category: "Podcasts", title: "LangChain podcast appearances", url: "https://www.youtube.com/@LangChain/search?query=podcast", description: "Useful for architectural context and production stories." },
    { category: "Community", title: "LangChain Forum", url: "https://forum.langchain.com/", description: "Community Q&A and release discussions." },
    { category: "Community", title: "Reddit LangChain", url: "https://www.reddit.com/r/LangChain/", description: "A noisy but useful signal for real-world pain points." },
    { category: "Community", title: "LangChain Discord", url: "https://www.langchain.com/join-community", description: "Community support and ecosystem discussion." }
  ];

  const INTERVIEW_GROUPS = [
    {
      level: "Beginner",
      questions: [
        ["What problem does LangChain solve?", "It standardizes common LLM app building blocks: models, prompts, messages, tools, structured output, retrieval, streaming, and agent loops."],
        ["What is a tool?", "A typed function the model can request to perform an external action or lookup."],
        ["Why use structured output?", "To turn model output into validated data the rest of the application can safely consume."]
      ]
    },
    {
      level: "Intermediate",
      questions: [
        ["When do you move from LangChain to LangGraph?", "When the workflow needs explicit state, branching, persistence, retries, interrupts, or multi-agent orchestration."],
        ["What makes RAG fail?", "Poor parsing, bad chunking, low recall, stale data, missing citations, prompt injection, and no retrieval evaluation."],
        ["How do you debug an agent?", "Start with traces, inspect tool calls and state transitions, reproduce with a dataset example, then add a regression evaluator."]
      ]
    },
    {
      level: "Senior",
      questions: [
        ["How would you design human-in-the-loop approval?", "Use a graph interrupt before sensitive action, persist checkpoint state, show evidence and proposed action to the reviewer, then resume with the decision."],
        ["How do you control cost?", "Budget per request, model routing, context trimming, cache deterministic substeps, limit tool loops, and monitor cost by tenant and release."],
        ["What belongs in memory?", "Only durable facts with provenance, user value, consent, expiry, and a clear retrieval purpose."]
      ]
    },
    {
      level: "Staff",
      questions: [
        ["How do you evaluate an agent workflow?", "Use task outcome evals, trajectory evals, tool-call assertions, retrieval metrics, latency/cost budgets, and human review on sampled traces."],
        ["How do you handle provider swaps?", "Keep provider-specific features behind adapters, track model capabilities, run regression evals, and gate rollout by quality and cost metrics."],
        ["What is the difference between observability and evaluation?", "Observability shows what happened. Evaluation judges whether it was good enough for the task."]
      ]
    },
    {
      level: "Principal",
      questions: [
        ["What is the platform boundary for enterprise agents?", "Identity, data access, tool gateway, policy, audit, evals, deployment, and incident response should be platform concerns."],
        ["How do you mitigate prompt injection across tools and RAG?", "Treat retrieved and tool content as untrusted, separate instructions from data, enforce tool permissions in code, require approvals, and test attacks."],
        ["How do you decide autonomy level?", "Use blast radius, reversibility, confidence, observability, and human cost to choose between suggestion, approval, bounded action, and automation."]
      ]
    },
    {
      level: "Agent Engineer",
      questions: [
        ["Explain ReAct.", "A loop where the model reasons, chooses an action, observes tool output, and continues until it can answer."],
        ["Explain supervisor pattern.", "A coordinating agent or graph node routes work to specialized agents and combines results under a shared state contract."],
        ["Explain graph workflows.", "Workflows represented as nodes and edges over typed state, enabling deterministic control flow around probabilistic model steps."]
      ]
    }
  ];

  const CASE_STUDIES = [
    {
      title: "Customer support agent",
      difficulty: "Intermediate",
      description: "Triage, retrieve policy, inspect account state, draft response, and ask for approval on refunds or account changes.",
      architecture: "LangChain tools for account lookup and policy retrieval. LangGraph for classify -> retrieve -> draft -> approve -> send. LangSmith for trace review and regression datasets.",
      risks: ["Prompt injection in customer messages", "Wrong refund action", "Stale policy retrieval"],
      metrics: ["First response time", "Correct routing", "Approval edits", "Escalation rate"]
    },
    {
      title: "Research agent",
      difficulty: "Advanced",
      description: "Plan research, search sources, extract evidence, synthesize a report, and critique unsupported claims.",
      architecture: "Planner graph with search and extraction tools, evidence store, synthesis node, critique node, and trace-based evals.",
      risks: ["Low quality sources", "Hallucinated citations", "Unbounded tool loops"],
      metrics: ["Citation precision", "Claim support rate", "Cost per report", "Reviewer correction rate"]
    },
    {
      title: "Coding agent",
      difficulty: "Advanced",
      description: "Read code, plan changes, edit files, run tests, and present diffs without unapproved destructive actions.",
      architecture: "Tool gateway with filesystem and test commands, graph checkpoints, plan review, test execution, and code review stage.",
      risks: ["Destructive commands", "Hidden unrelated changes", "False test claims"],
      metrics: ["Test pass rate", "Review defects", "Rollback rate", "Time to PR"]
    },
    {
      title: "Enterprise knowledge assistant",
      difficulty: "Expert",
      description: "Answer employee questions over internal documents with identity-aware retrieval and citations.",
      architecture: "Identity and RBAC filter before retrieval, hybrid search, re-ranking, answer synthesis, citation enforcement, trace sampling.",
      risks: ["Cross-tenant leakage", "RAG poisoning", "Missing document freshness"],
      metrics: ["Answer groundedness", "Access-control violations", "User deflection", "Freshness coverage"]
    },
    {
      title: "Multi-agent team",
      difficulty: "Expert",
      description: "Supervisor coordinates specialist agents for analysis, writing, review, and final synthesis.",
      architecture: "LangGraph supervisor with role nodes, shared state, budgets, critique loops, and LangSmith trajectory evaluation.",
      risks: ["Coordination loops", "Conflicting outputs", "Excessive cost"],
      metrics: ["Task completion", "Loop count", "Reviewer score", "Cost by role"]
    }
  ];

  const CHEATSHEETS = [
    { title: "LangChain", items: ["Use for models, messages, prompts, tools, structured output, middleware, streaming, and simple agents.", "Keep provider choice swappable.", "Validate structured output.", "Trace each production call."] },
    { title: "LangGraph", items: ["State is the shared workflow snapshot.", "Nodes update state.", "Edges route control.", "Checkpoint for resume.", "Interrupt before human approval.", "Use conditional edges for branches."] },
    { title: "LangSmith", items: ["Trace every step.", "Create datasets from real failures.", "Run evaluators before rollout.", "Compare experiments by release.", "Monitor production drift and cost."] },
    { title: "RAG", items: ["Parse cleanly.", "Chunk by meaning.", "Track provenance.", "Measure recall.", "Use hybrid search when exact terms matter.", "Re-rank noisy top-k.", "Cite sources."] },
    { title: "MCP", items: ["Host runs clients.", "Clients connect to servers.", "Servers expose tools, resources, and prompts.", "Prefer trusted servers.", "Require approvals for sensitive actions.", "Constrain allowed tools."] },
    { title: "Agents", items: ["Start with the workflow, not the model.", "Limit tool loop count.", "Store state explicitly.", "Budget cost and latency.", "Use evals for trajectories and outcomes."] },
    { title: "Prompting", items: ["Separate instructions from data.", "Use examples for edge cases.", "Keep policies short and testable.", "Represent uncertainty.", "Never trust retrieved instructions."] },
    { title: "Evaluation", items: ["Test retrieval, final answer, and trajectory separately.", "Use golden examples.", "Sample production traces.", "Track regressions by release.", "Pair automated graders with human review."] }
  ];

  const QUIZZES = [
    { id: "q1", sectionId: "product-comparison", level: "Beginner", tags: ["langchain", "langgraph"], question: "When should a team move from a simple LangChain agent to LangGraph?", choices: ["When the workflow needs durable state, branching, interrupts, or approvals.", "Whenever a model supports tool calling.", "Only after deploying LangSmith.", "When using a vector database."], answer: 0, explanation: "LangGraph is the orchestration runtime for explicit stateful workflows. Tool calling alone does not require a graph." },
    { id: "q2", sectionId: "rag", level: "Intermediate", tags: ["rag", "retrieval"], question: "What should be measured before judging final RAG answer quality?", choices: ["The color of the UI.", "Retrieval recall and evidence quality.", "The number of chunks in the database.", "Whether the answer is long."], answer: 1, explanation: "If the right evidence is not retrieved, answer generation cannot reliably succeed." },
    { id: "q3", sectionId: "mcp", level: "Intermediate", tags: ["mcp", "tools"], question: "What are the three core primitives an MCP server can expose?", choices: ["Agents, chains, memories.", "Tools, resources, prompts.", "Models, embeddings, indexes.", "Users, teams, projects."], answer: 1, explanation: "The MCP data layer standardizes tools for actions, resources for context, and prompts for reusable interaction templates." },
    { id: "q4", sectionId: "security", level: "Advanced", tags: ["security", "prompt injection"], question: "Which mitigation is strongest for tool abuse?", choices: ["A longer system prompt.", "Code-enforced permissions, narrow schemas, and approval gates.", "Hiding the tool name.", "Increasing model temperature."], answer: 1, explanation: "Prompts help, but authorization and approval must be enforced outside the model." },
    { id: "q5", sectionId: "langgraph", level: "Advanced", tags: ["langgraph", "checkpointing"], question: "Why does checkpointing matter for human-in-the-loop workflows?", choices: ["It makes prompts shorter.", "It lets a graph pause and resume from persisted state.", "It replaces tracing.", "It removes the need for tools."], answer: 1, explanation: "Approval flows need durable state so work can safely resume after a human decision." },
    { id: "q6", sectionId: "langsmith", level: "Advanced", tags: ["langsmith", "evaluation"], question: "What is the difference between tracing and evaluation?", choices: ["Tracing records what happened. Evaluation judges quality against criteria.", "Tracing is only for local apps. Evaluation is only for production.", "They are the same thing.", "Evaluation only measures speed."], answer: 0, explanation: "Traces provide evidence. Evaluators turn evidence and outputs into quality signals." },
    { id: "q7", sectionId: "agent-engineering", level: "Expert", tags: ["production", "cost"], question: "Which cost strategy is most production-oriented?", choices: ["Use the biggest model everywhere.", "Route by task difficulty, trim context, cap loops, cache deterministic work, and monitor cost by release.", "Never use tools.", "Disable tracing."], answer: 1, explanation: "Cost management is an architectural concern that spans model routing, context, loops, caching, and observability." },
    { id: "q8", sectionId: "fundamentals", level: "Beginner", tags: ["structured output"], question: "Why validate structured output?", choices: ["Because generated JSON can still be invalid or semantically wrong.", "Because validation makes the model deterministic.", "Because validation replaces evals.", "Because all providers require Zod."], answer: 0, explanation: "Schemas constrain output, but applications still need validation and fallback behavior." }
  ];

  const CONTENT_SECTIONS = [
    {
      id: "ecosystem-map",
      title: "LangChain ecosystem map",
      level: "Beginner",
      summary: "A visual map of how LLM providers, LangChain, LangGraph, LangSmith, MCP, RAG, tools, and production concerns connect.",
      tags: ["ecosystem", "architecture", "langchain", "langgraph", "langsmith"],
      blocks: [
        { type: "callout", tone: "info", title: "Read this map top-down", body: ["LLM providers supply capability. LangChain normalizes application building blocks. LangGraph controls durable workflows. LangSmith observes and evaluates behavior. Production adds security, cost, latency, rollout, and incident response."] },
        { type: "diagram", title: "Interactive ecosystem architecture", nodes: PROVIDER_NODES, edges: PROVIDER_EDGES, mermaid: "graph TD\n  LLM --> LangChain\n  LangChain --> LangGraph\n  LangGraph --> Production\n  LangSmith --> Production\n  MCP --> Tools\n  Tools --> LangChain\n  VectorDB --> RAG\n  RAG --> Production" },
        { type: "list", title: "Relationship guide", items: ["OpenAI, Anthropic, Gemini, and Ollama are model providers or model runtimes.", "LangChain is the application framework for model, prompt, tool, structured output, middleware, and agent abstractions.", "LangGraph is the runtime for stateful, durable, branch-heavy agent workflows.", "LangSmith is the feedback loop: traces, datasets, evals, monitoring, and deployment workflows.", "MCP standardizes external tool and context connections across clients and servers.", "RAG is a production pattern for grounding answers in external knowledge."] }
      ]
    },
    {
      id: "why-langchain",
      title: "Why LangChain exists",
      level: "Beginner",
      summary: "Understand the problems that appear when raw API calls grow into real LLM applications.",
      tags: ["why", "raw api", "evolution", "agents"],
      blocks: [
        { type: "timeline", title: "Evolution of LLM applications", items: [
          ["Prompting", "A single request and response. Fast to prototype, fragile to operate."],
          ["Chains", "Multiple steps compose prompts, parsers, and model calls."],
          ["RAG", "The application retrieves external knowledge before generation."],
          ["Agents", "The model chooses tools and iterates over observations."],
          ["Agent workflows", "The system constrains agents with state, branches, approvals, and retries."],
          ["Multi-agent systems", "Specialized roles coordinate through explicit state and supervision."]
        ] },
        { type: "table", title: "Raw API problems", headers: ["Problem", "Why it appears", "LangChain or ecosystem response"], rows: [
          ["Provider churn", "Model APIs and capabilities change.", "Standard model interfaces and integration packages."],
          ["Tool calling", "Models need typed actions, tool results, and error handling.", "Tool abstractions and agent loops."],
          ["Memory", "Conversations and workflows need continuity.", "Message management, memory patterns, and graph state."],
          ["Retrieval", "Model context must include trusted knowledge.", "Retrievers, vector store integrations, RAG patterns."],
          ["Orchestration", "Agents need branches, retries, and approvals.", "LangGraph state graphs and interrupts."],
          ["Observability", "Failures are invisible without traces.", "LangSmith tracing, datasets, and evals."]
        ] },
        { type: "code", title: "Raw API versus agent abstraction", language: "ts", code: "// Raw API code starts simple, then grows retries, tools, schemas, tracing, and memory.\nconst response = await client.responses.create({ model, input });\n\n// A framework boundary keeps those concerns explicit and reusable.\nconst agent = createAgent({ model, tools, responseFormat, middleware });\nconst result = await agent.invoke({ messages });" }
      ]
    },
    {
      id: "product-comparison",
      title: "LangChain vs LangGraph vs LangSmith",
      level: "Beginner",
      summary: "A decision table and decision tree for choosing the right layer of the modern ecosystem.",
      tags: ["comparison", "decision", "langchain", "langgraph", "langsmith"],
      blocks: [
        { type: "comparison", title: "Interactive comparison table", headers: ["Product", "Purpose", "Difficulty", "Typical use cases", "Pros", "Cons", "When to use", "When not to use"], rows: PRODUCT_COMPARISON_ROWS },
        { type: "decision", title: "Decision tree", rows: DECISIONS },
        { type: "callout", tone: "warning", title: "Pragmatic rule", body: ["Start with the smallest layer that makes the workflow reliable. Add LangGraph for control flow and persistence. Add LangSmith as soon as quality matters."] }
      ]
    },
    {
      id: "agent-architecture",
      title: "Modern agent architecture",
      level: "Intermediate",
      summary: "A production mental model for model, tools, memory, context, state, planning, reflection, and evaluation.",
      tags: ["agents", "architecture", "patterns"],
      blocks: [
        { type: "diagram", title: "Agent system anatomy", nodes: AGENT_ARCHITECTURE_NODES, edges: AGENT_ARCHITECTURE_EDGES, mermaid: "graph LR\n  Input --> Context\n  Context --> Model\n  Model --> Tools\n  Tools --> State\n  State --> Model\n  Model --> Evaluation\n  Evaluation --> Context" },
        { type: "cards", title: "Core patterns", items: [
          { title: "ReAct", description: "Reason, act, observe, repeat. Useful for tool loops, but needs loop limits and trace review." },
          { title: "Plan-and-execute", description: "Create a plan, execute steps, revise when evidence changes. Useful for research and coding." },
          { title: "Supervisor pattern", description: "A coordinator routes tasks to specialized workers. Useful when roles need separation." },
          { title: "Router pattern", description: "Classify intent and route to the right tool, retriever, or workflow." },
          { title: "Hierarchical agents", description: "Managers decompose work and assign subtasks. Powerful but easy to overcomplicate." },
          { title: "Human-in-the-loop", description: "Pause before sensitive actions and resume after approval." },
          { title: "State machines", description: "Represent workflow stages explicitly instead of hoping prompts remember." },
          { title: "Graph workflows", description: "Use nodes and edges to make branches, retries, approvals, and recovery inspectable." }
        ] },
        { type: "table", title: "Architecture tradeoffs", headers: ["Pattern", "Strength", "Failure mode", "Production guardrail"], rows: [
          ["ReAct", "Flexible tool use", "Loops, tool spam, weak final synthesis", "Loop budget, tool evals, trace review"],
          ["Plan-and-execute", "Better decomposition", "Bad plans can anchor the workflow", "Plan critique and replanning triggers"],
          ["Supervisor", "Role specialization", "Coordinator bottleneck", "Typed handoffs and per-role budgets"],
          ["Router", "Fast task selection", "Misclassification", "Confidence thresholds and fallbacks"],
          ["Graph workflow", "Deterministic control around probabilistic steps", "Upfront design cost", "Small state schema and tests"]
        ] }
      ]
    },
    {
      id: "fundamentals",
      title: "LangChain fundamentals",
      level: "Beginner",
      summary: "The beginner path through models, prompts, messages, tool calling, structured output, middleware, memory, streaming, and callbacks.",
      tags: ["fundamentals", "models", "tools", "memory", "streaming"],
      blocks: [
        { type: "fundamentals", title: "Beginner path topics", topics: FUNDAMENTAL_TOPICS },
        { type: "quizzes", title: "Fundamentals checks", ids: ["q8"] }
      ]
    },
    {
      id: "langgraph",
      title: "LangGraph masterclass",
      level: "Advanced",
      summary: "Graphs, nodes, edges, state, checkpointing, persistence, human approval, interrupts, routing, subgraphs, and multi-agent systems.",
      tags: ["langgraph", "graphs", "checkpointing", "interrupts"],
      blocks: [
        { type: "diagram", title: "State graph with human approval", nodes: LANGGRAPH_NODES, edges: LANGGRAPH_EDGES, mermaid: "graph LR\n  START --> classify_intent\n  classify_intent -->|needs context| retrieve\n  classify_intent -->|simple| draft_response\n  retrieve --> draft_response\n  draft_response --> human_review\n  human_review --> END" },
        { type: "code", title: "Minimal graph shape", language: "py", code: "from typing import TypedDict, Literal\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    question: str\n    route: str\n    answer: str\n\ndef classify(state: State):\n    route = \"retrieve\" if \"policy\" in state[\"question\"].lower() else \"answer\"\n    return {\"route\": route}\n\ndef route(state: State) -> Literal[\"retrieve\", \"answer\"]:\n    return state[\"route\"]\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"classify\", classify)\nbuilder.add_node(\"retrieve\", retrieve_context)\nbuilder.add_node(\"answer\", draft_answer)\nbuilder.add_edge(START, \"classify\")\nbuilder.add_conditional_edges(\"classify\", route)\nbuilder.add_edge(\"retrieve\", \"answer\")\nbuilder.add_edge(\"answer\", END)\ngraph = builder.compile()" },
        { type: "cards", title: "Masterclass concepts", items: [
          { title: "Graphs", description: "The whole workflow definition: state schema, nodes, edges, and runtime options." },
          { title: "Nodes", description: "Functions that read current state and return updates." },
          { title: "Edges", description: "Fixed or conditional transitions between nodes." },
          { title: "State", description: "The typed shared snapshot. Keep it small, explicit, and serializable." },
          { title: "Checkpointing", description: "Persist graph state for resume, retries, and human approval." },
          { title: "Persistence", description: "Use durable storage when workflows outlive a single request." },
          { title: "Interrupts", description: "Pause execution and wait for external input." },
          { title: "Subgraphs", description: "Nest reusable workflows behind a clean state boundary." },
          { title: "Multi-agent systems", description: "Represent agents as nodes or subgraphs with typed handoffs." }
        ] },
        { type: "quizzes", title: "LangGraph checks", ids: ["q5"] }
      ]
    },
    {
      id: "langsmith",
      title: "LangSmith masterclass",
      level: "Advanced",
      summary: "Tracing, evaluation, datasets, monitoring, observability, testing, deployment, and production workflows.",
      tags: ["langsmith", "tracing", "evaluation", "observability"],
      blocks: [
        { type: "cards", title: "Production workflow", items: [
          { title: "Trace", description: "Capture model calls, tool calls, inputs, outputs, metadata, timings, and errors." },
          { title: "Debug", description: "Inspect failed runs, compare prompts, and identify bad retrieval or tool behavior." },
          { title: "Dataset", description: "Promote real examples into regression datasets." },
          { title: "Evaluate", description: "Run graders for correctness, groundedness, trajectory, safety, and format." },
          { title: "Monitor", description: "Track quality, cost, latency, drift, and incident patterns in production." },
          { title: "Deploy", description: "Move observed, evaluated workflows into managed runtime patterns when appropriate." }
        ] },
        { type: "callout", tone: "info", title: "Trace screen anatomy", body: ["A useful trace view shows the request, model calls, tool calls, retrieval evidence, state transitions, latency, token usage, error surfaces, and metadata such as release, tenant, and eval dataset. This app uses screenshot-style cards instead of external image assets so it remains self-contained."] },
        { type: "code", title: "Evaluation loop shape", language: "py", code: "from langsmith import Client, traceable\n\nclient = Client()\n\n@traceable\ndef app(inputs: dict) -> dict:\n    return agent.invoke(inputs)\n\ndef grounded(inputs, outputs, reference_outputs):\n    return all(claim in outputs[\"citations\"] for claim in reference_outputs[\"required_citations\"])\n\nclient.evaluate(\n    app,\n    data=\"support-rag-regression\",\n    evaluators=[grounded],\n    experiment_prefix=\"rag-v4\"\n)" },
        { type: "quizzes", title: "LangSmith checks", ids: ["q6"] }
      ]
    },
    {
      id: "rag",
      title: "RAG masterclass",
      level: "Intermediate",
      summary: "Embeddings, chunking, retrieval, hybrid search, re-ranking, vector databases, best practices, and anti-patterns.",
      tags: ["rag", "retrieval", "vector databases", "embeddings"],
      blocks: [
        { type: "diagram", title: "RAG pipeline", nodes: RAG_NODES, edges: RAG_EDGES, mermaid: "graph LR\n  Sources --> Ingestion\n  Ingestion --> Chunking\n  Chunking --> Embeddings\n  Embeddings --> Retrieval\n  Retrieval --> ReRank\n  ReRank --> Answer" },
        { type: "comparison", title: "Vector database comparison", headers: ["Database", "Best fit", "Pros", "Cons"], rows: RAG_VECTOR_ROWS },
        { type: "table", title: "Best practices and anti-patterns", headers: ["Area", "Best practice", "Anti-pattern"], rows: [
          ["Embeddings", "Pick a model based on domain recall tests.", "Choose embeddings by popularity only."],
          ["Chunking", "Split by semantic structure and preserve metadata.", "Use one fixed chunk size for every source."],
          ["Retrieval", "Measure recall and use hybrid search when exact terms matter.", "Assume vector similarity means answer quality."],
          ["Re-ranking", "Use when top-k candidates are noisy or long.", "Add re-ranking without a latency budget."],
          ["Synthesis", "Cite sources and represent uncertainty.", "Answer confidently when evidence is missing."],
          ["Security", "Treat retrieved text as untrusted data.", "Let retrieved instructions override system policy."]
        ] },
        { type: "quizzes", title: "RAG checks", ids: ["q2"] }
      ]
    },
    {
      id: "mcp",
      title: "MCP masterclass",
      level: "Intermediate",
      summary: "What MCP is, why it matters, servers, clients, tools, resources, prompts, and usage across Claude, OpenAI, Cursor, Windsurf, VS Code, and Codex.",
      tags: ["mcp", "tools", "resources", "prompts"],
      blocks: [
        { type: "diagram", title: "MCP client-server architecture", nodes: MCP_NODES, edges: MCP_EDGES, mermaid: "graph LR\n  Host --> ClientA\n  Host --> ClientB\n  ClientA --> LocalServer\n  ClientB --> RemoteServer\n  LocalServer --> Primitives\n  RemoteServer --> Primitives\n  Primitives --> Host" },
        { type: "table", title: "MCP usage patterns", headers: ["Client or host", "Typical use", "Engineering note"], rows: [
          ["Claude", "Desktop, Code, and API workflows connect to MCP servers for external tools and context.", "Watch approvals and prompt injection on write tools."],
          ["OpenAI", "Remote MCP servers can be exposed as tools with allowed tool filtering and approval settings.", "Prefer trusted servers and constrain tool exposure."],
          ["Cursor", "IDE agent workflows connect to MCP servers for codebase and external context.", "Keep server descriptions clear so tool selection is reliable."],
          ["Windsurf", "Cascade can use MCP servers to extend coding workflows.", "Treat IDE-level tools as high-blast-radius actions."],
          ["VS Code", "MCP servers provide tools, prompts, resources, and related capabilities in Copilot agent mode.", "Use workspace/user config and approval controls."],
          ["Codex", "Codex can connect to MCP servers for docs, repos, browsers, and custom tools.", "Use MCP for context and tools, but keep repo changes auditable."]
        ] },
        { type: "callout", tone: "warning", title: "Security rule", body: ["MCP is powerful because it standardizes access to tools and context. That also means untrusted servers, broad tool lists, and hidden instructions can create serious data and action risks. Use trusted servers, constrain allowed tools, and require approval for sensitive actions."] },
        { type: "quizzes", title: "MCP checks", ids: ["q3"] }
      ]
    },
    {
      id: "agent-engineering",
      title: "Agent engineering",
      level: "Expert",
      summary: "Reliability, observability, evaluations, testing, security, cost management, latency, human oversight, failure modes, and debugging.",
      tags: ["production", "reliability", "debugging", "cost"],
      blocks: [
        { type: "table", title: "Production lessons", headers: ["Concern", "What teams do", "Failure mode"], rows: [
          ["Reliability", "Constrain workflows, add fallbacks, and regression test real failures.", "Agent succeeds in demos but fails edge cases."],
          ["Observability", "Trace every model, tool, retrieval, and graph step.", "No one knows why an answer changed."],
          ["Evaluation", "Use datasets, graders, human review, and release comparisons.", "Quality regresses silently."],
          ["Testing", "Unit test tools, integration test graphs, scenario test user workflows.", "Only final text is checked."],
          ["Security", "Enforce permissions in code and treat model input as untrusted.", "Prompt injection triggers tool abuse."],
          ["Cost", "Route models, cap loops, trim context, cache, and monitor by tenant.", "Costs scale faster than value."],
          ["Latency", "Stream, parallelize safe branches, and set budgets.", "Complex agents feel broken."],
          ["Human oversight", "Use approval for high-blast-radius actions.", "Automation causes irreversible damage."]
        ] },
        { type: "decision", title: "Debugging guide", rows: [
          ["Bad answer", "Check retrieval evidence, prompt inputs, model output, structured parser, and evaluator result."],
          ["Wrong tool call", "Inspect tool descriptions, schema ambiguity, prompt context, and examples."],
          ["Infinite loop", "Check stopping condition, tool observation quality, and loop budget."],
          ["High latency", "Break down trace timings by model, retrieval, tool, and graph branch."],
          ["High cost", "Inspect context size, model selection, loop count, and repeated deterministic work."],
          ["Unsafe action", "Audit authorization boundary, approval placement, and tool permissions."]
        ] },
        { type: "quizzes", title: "Production checks", ids: ["q7"] }
      ]
    },
    {
      id: "security",
      title: "Security",
      level: "Advanced",
      summary: "Prompt injection, tool abuse, secret leakage, data exfiltration, RAG poisoning, agent escalation, mitigations, and architecture recommendations.",
      tags: ["security", "prompt injection", "tool abuse"],
      blocks: [
        { type: "table", title: "Threat model", headers: ["Threat", "How it appears", "Mitigation"], rows: [
          ["Prompt injection", "User, document, or tool output tells the model to ignore policy.", "Separate instructions from data, quote untrusted content, and enforce policy in code."],
          ["Tool abuse", "Model calls a sensitive tool with harmful arguments.", "Narrow schemas, RBAC, allowlists, approvals, and idempotent operations."],
          ["Secret leakage", "Secrets enter prompts, traces, or tool outputs.", "Secret scanning, redaction middleware, least privilege, and trace hygiene."],
          ["Data exfiltration", "Agent sends private data to a tool, server, or user.", "Access controls, egress controls, tool allowlists, and audit logs."],
          ["RAG poisoning", "Malicious documents influence answers or tool use.", "Source trust tiers, ingestion review, content signing, and retrieval-time filters."],
          ["Agent escalation", "Agent chains tools to exceed intended authority.", "Capability separation, approval gates, and policy enforcement outside the model."]
        ] },
        { type: "callout", tone: "danger", title: "Architecture recommendation", body: ["Do not rely on prompts as the security boundary. The model can recommend an action, but authorization, data access, approval, and tool execution must be enforced by deterministic application code."] },
        { type: "quizzes", title: "Security checks", ids: ["q4"] }
      ]
    },
    {
      id: "roadmap",
      title: "Learning roadmap",
      level: "Beginner",
      summary: "A beginner-to-expert curriculum with estimated hours, milestones, and projects.",
      tags: ["roadmap", "curriculum", "projects"],
      blocks: [
        { type: "timeline", title: "Beginner to expert path", items: ROADMAP_LEVELS.map((row) => [row[0] + ": " + row[1] + " (" + row[2] + ")", row[3] + " Milestone: " + row[4]]) },
        { type: "callout", tone: "info", title: "How to use the roadmap", body: ["Do not wait until Level 8 to care about production. Add tracing, eval thinking, and security boundaries early, then deepen them as project blast radius increases."] }
      ]
    },
    {
      id: "projects",
      title: "Projects",
      level: "Reference",
      summary: "Project ideas organized by difficulty, with architecture, skills learned, difficulty, and time estimate.",
      tags: ["projects", "practice", "portfolio"],
      blocks: [
        { type: "projects", title: "Project catalog", items: PROJECTS }
      ]
    },
    {
      id: "resources",
      title: "Resource library",
      level: "Reference",
      summary: "Official docs, GitHub repositories, videos, books, blogs, podcasts, and community sources.",
      tags: ["resources", "official", "github", "community"],
      blocks: [
        { type: "resources", title: "Curated resources", items: RESOURCES },
        { type: "sources", title: "Source ledger", items: SOURCE_LEDGER }
      ]
    },
    {
      id: "interview",
      title: "Interview prep",
      level: "Reference",
      summary: "Beginner through principal and agent engineer questions with concise answers and explanations.",
      tags: ["interview", "questions", "answers"],
      blocks: [
        { type: "interview", title: "Question bank", groups: INTERVIEW_GROUPS }
      ]
    },
    {
      id: "cheat-sheets",
      title: "Cheat sheets",
      level: "Reference",
      summary: "Quick reference pages for LangChain, LangGraph, LangSmith, RAG, MCP, agents, prompting, and evaluation.",
      tags: ["cheatsheet", "reference"],
      blocks: [
        { type: "cheatsheets", title: "Quick references", items: CHEATSHEETS }
      ]
    },
    {
      id: "glossary",
      title: "Glossary",
      level: "Reference",
      summary: "Searchable glossary with more than 300 LangChain, RAG, MCP, agent, security, and production terms.",
      tags: ["glossary", "definitions", "reference"],
      blocks: [
        { type: "glossary", title: "Searchable glossary" }
      ]
    },
    {
      id: "knowledge-graph",
      title: "Knowledge graph",
      level: "Reference",
      summary: "Interactive relationship map among LLMs, RAG, agents, tools, memory, LangGraph, LangSmith, and MCP.",
      tags: ["knowledge graph", "relationships", "architecture"],
      blocks: [
        { type: "diagram", title: "Concept relationships", nodes: KNOWLEDGE_NODES, edges: KNOWLEDGE_EDGES, mermaid: "graph TD\n  LLMs --> Prompting\n  LLMs --> RAG\n  Prompting --> Tools\n  Tools --> Agents\n  Memory --> Agents\n  RAG --> Agents\n  Agents --> LangGraph\n  MCP --> Tools\n  LangGraph --> LangSmith" }
      ]
    },
    {
      id: "case-studies",
      title: "Production case studies",
      level: "Expert",
      summary: "Customer support, research, coding, enterprise knowledge, and multi-agent team architectures.",
      tags: ["case studies", "production", "architecture"],
      blocks: [
        { type: "cases", title: "Production examples", items: CASE_STUDIES }
      ]
    },
    {
      id: "self-assessment",
      title: "Self-assessment",
      level: "Reference",
      summary: "Quizzes, local progress, stored results, and learning recommendations.",
      tags: ["quiz", "assessment", "recommendations"],
      blocks: [
        { type: "assessment", title: "Learning dashboard" },
        { type: "quizzes", title: "All quizzes", ids: QUIZZES.map((quiz) => quiz.id) }
      ]
    }
  ];

  const GLOSSARY_TOPICS = [
    "agent", "agent loop", "agent state", "agent trajectory", "alignment", "allowed tools", "annotation", "API wrapper", "approval gate", "assistant message",
    "authorization", "auto-evaluator", "autonomy", "base model", "batch evaluation", "blast radius", "callback", "capability negotiation", "chain", "checkpoint",
    "checkpoint saver", "chunk", "chunk overlap", "citation", "client", "code interpreter tool", "completion", "conditional edge", "context", "context compression",
    "context engineering", "context window", "conversation memory", "cost budget", "data exfiltration", "dataset", "deterministic guardrail", "document loader", "durable execution",
    "edge", "embedding", "embedding drift", "embedding model", "eval dataset", "evaluator", "few-shot prompt", "final answer", "flow control", "function calling",
    "graph", "groundedness", "guardrail", "handoff", "human approval", "human-in-the-loop", "hybrid search", "idempotency", "index", "ingestion",
    "instruction hierarchy", "interrupt", "JSON mode", "JSON schema", "LangChain", "LangGraph", "LangSmith", "latency budget", "least privilege", "LLM",
    "local model", "memory", "message", "metadata", "MCP", "MCP client", "MCP host", "MCP prompt", "MCP resource", "MCP server",
    "MCP tool", "middleware", "model profile", "model routing", "monitoring", "multi-agent system", "node", "observability", "output parser", "permission boundary",
    "persistence", "pgvector", "Pinecone", "planner", "policy", "prompt", "prompt injection", "prompt template", "Qdrant", "RAG",
    "RAG poisoning", "ranking", "React agent", "ReAct", "recall", "redaction", "reflection", "re-ranking", "resource", "retrieval",
    "retriever", "retry policy", "router", "sampling", "schema validation", "semantic search", "server", "state", "state graph", "STDIO transport",
    "streaming", "structured output", "subgraph", "supervisor", "system message", "temperature", "thread", "token", "tool", "tool abuse",
    "tool choice", "tool description", "tool gateway", "tool result", "tool schema", "trace", "trajectory evaluation", "transport", "user message", "vector database",
    "Weaviate", "zero trust", "access control", "adaptive retrieval", "answer synthesis", "application trace", "audit log", "backpressure", "benchmark", "cache",
    "cancellation", "capability", "chain-of-thought policy", "classification node", "confidence threshold", "content filter", "conversation thread", "correctness evaluator", "custom tool", "data residency",
    "deduplication", "deployment", "document parser", "domain tool", "drift", "egress control", "enterprise search", "error boundary", "fallback", "feedback loop",
    "fine-tuning", "ground truth", "hallucination", "hosted tool", "identity", "implicit context", "integration package", "knowledge assistant", "knowledge base", "latency",
    "localStorage", "log probability", "long context", "managed vector store", "memory store", "message trimming", "model adapter", "model gateway", "multi-modal model", "namespace",
    "OpenAI", "Anthropic", "Gemini", "Ollama", "orchestration", "parallel branch", "parameter schema", "parser", "policy engine", "post-processing",
    "prebuilt agent", "precision", "production eval", "prompt registry", "query expansion", "rate limit", "recency", "reference answer", "regression test", "retrieval eval",
    "risk tier", "rollback", "route", "run", "sample", "sandbox", "secret leakage", "sensitive tool", "session", "source attribution",
    "source freshness", "span", "specialist agent", "state reducer", "stream event", "synthetic data", "task decomposition", "tenant", "test set", "tool approval",
    "tool call", "tool error", "tool output", "tool policy", "tool timeout", "trace metadata", "trusted server", "untrusted content", "validation error", "vector index",
    "workflow", "workflow state", "write tool", "zero data retention", "agent benchmark", "agent platform", "answer evaluator", "approval queue", "artifact", "automatic retry",
    "budget guard", "cache key", "canonical source", "chunk metadata", "cold start", "connection lifecycle", "context picker", "context source", "context stuffing", "cost monitor",
    "cross-encoder", "data connector", "debug stream", "decision tree", "deep research", "document store", "dynamic routing", "embedding migration", "eval runner", "evidence",
    "evidence store", "execution graph", "experiment", "experiment comparison", "extractor", "failure mode", "federated search", "filter expression", "format instruction", "golden dataset",
    "graph compiler", "graph runtime", "graph visualization", "guarded action", "human correction", "incident response", "index freshness", "input contract", "integration test", "intent classifier",
    "knowledge graph", "LangChain Academy", "LangGraph Platform", "LangSmith Deployment", "LangSmith Observability", "live eval", "loop limit", "managed deployment", "memory provenance", "message role",
    "model fallback", "model settings", "node retry", "observability project", "offline eval", "online eval", "output contract", "parallel tool call", "plan-and-execute", "policy retrieval",
    "production monitor", "prompt version", "prompt-injection benchmark", "query rewrite", "ranking signal", "read tool", "reasoning model", "reference output", "release comparison", "relevance score",
    "retrieval cache", "retrieval pipeline", "review node", "schema drift", "security review", "semantic chunking", "semantic router", "sensitive data", "service account", "session state",
    "state channel", "state update", "stream mode", "summarization memory", "supervisor agent", "system prompt", "test trace", "tool allowlist", "tool sandbox", "trace tree",
    "typed state", "unstructured document", "user preference", "vector search", "workflow interrupt", "write approval", "MCP roots", "MCP sampling", "MCP elicitation", "MCP apps",
    "SSE transport", "Streamable HTTP", "resources list", "tools list", "prompts list", "tool discovery", "resource template", "prompt template arguments", "OAuth", "RBAC"
  ];

  const EXPLICIT_DEFINITIONS = {
    "LangChain": "The open-source framework layer for building LLM applications and agents with model, message, prompt, tool, structured output, middleware, streaming, and integration abstractions.",
    "LangGraph": "A graph runtime for durable, stateful agent workflows built from typed state, nodes, edges, checkpointing, interrupts, and routing.",
    "LangSmith": "A platform for tracing, evaluation, datasets, observability, monitoring, and deployment workflows for LLM applications and agents.",
    "MCP": "Model Context Protocol, an open protocol that lets AI hosts connect to servers exposing tools, resources, and prompts.",
    "RAG": "Retrieval augmented generation, a pattern where an application retrieves external knowledge and passes relevant evidence to a model before generation.",
    "ReAct": "An agent pattern where the model reasons, acts through tools, observes results, and repeats until it can answer.",
    "prompt injection": "An attack where untrusted text attempts to override instructions or manipulate tool use.",
    "checkpoint": "A persisted snapshot of workflow state that allows a graph to resume after interruption, failure, or human review.",
    "structured output": "A model response constrained to a schema so application code can validate and consume it.",
    "tool": "A typed function exposed to a model or agent so it can request external actions or lookups."
  };

  const GLOSSARY_TERMS = GLOSSARY_TOPICS.map((term, index) => {
    const category = inferGlossaryCategory(term);
    return {
      term,
      level: inferGlossaryLevel(term, index),
      definition: EXPLICIT_DEFINITIONS[term] || buildDefinition(term, category),
      example: buildExample(term, category),
      related: buildRelated(term, category),
      tags: [category, inferGlossaryLevel(term, index).toLowerCase()]
    };
  });

  const DOM = {};
  let state = {};
  let searchIndex = [];
  let currentSectionId = "ecosystem-map";
  const diagramRegistry = new Map();

  function init() {
    cacheDom();
    loadState();
    applyTheme(state.theme);
    searchIndex = buildSearchIndex();
    bindGlobalEvents();
    renderNav();
    renderPage();
  }

  function cacheDom() {
    DOM.root = document.documentElement;
    DOM.body = document.body;
    DOM.app = document.getElementById("app");
    DOM.nav = document.getElementById("nav-list");
    DOM.sidebarStats = document.getElementById("sidebar-stats");
    DOM.menuToggle = document.getElementById("menu-toggle");
    DOM.themeToggle = document.getElementById("theme-toggle");
    DOM.bookmarkCurrent = document.getElementById("bookmark-current");
    DOM.searchTrigger = document.getElementById("search-trigger");
    DOM.searchDialog = document.getElementById("search-dialog");
    DOM.searchClose = document.getElementById("search-close");
    DOM.searchInput = document.getElementById("search-input");
    DOM.searchFilters = document.getElementById("search-filters");
    DOM.searchResults = document.getElementById("search-results");
    DOM.shortcutsTrigger = document.getElementById("shortcuts-trigger");
    DOM.shortcutsDialog = document.getElementById("shortcuts-dialog");
    DOM.shortcutsClose = document.getElementById("shortcuts-close");
    DOM.overlay = document.getElementById("overlay");
  }

  function loadState() {
    state = {
      theme: readStore(STORAGE_KEYS.theme, "dark"),
      progress: readStore(STORAGE_KEYS.progress, {}),
      bookmarks: readStore(STORAGE_KEYS.bookmarks, {}),
      quizResults: readStore(STORAGE_KEYS.quizResults, {}),
      collapsed: readStore(STORAGE_KEYS.collapsed, {}),
      notes: readStore(STORAGE_KEYS.notes, {})
    };
  }

  function readStore(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStore(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Unable to persist local state", error);
    }
  }

  function bindGlobalEvents() {
    window.addEventListener("hashchange", renderPage);
    DOM.menuToggle.addEventListener("click", () => toggleSidebar());
    DOM.themeToggle.addEventListener("click", toggleTheme);
    DOM.bookmarkCurrent.addEventListener("click", () => toggleBookmark(currentSectionId, "section"));
    DOM.searchTrigger.addEventListener("click", openSearch);
    DOM.searchClose.addEventListener("click", closeDialogs);
    DOM.shortcutsTrigger.addEventListener("click", openShortcuts);
    DOM.shortcutsClose.addEventListener("click", closeDialogs);
    DOM.overlay.addEventListener("click", () => {
      closeDialogs();
      closeSidebar();
    });
    DOM.searchInput.addEventListener("input", () => renderSearchResults(DOM.searchInput.value));

    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const isTyping = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (event.key === "Escape") closeDialogs();
      if (isTyping) return;
      if (event.key === "/") {
        event.preventDefault();
        openSearch();
      }
      if (event.key.toLowerCase() === "t") toggleTheme();
      if (event.key.toLowerCase() === "b") toggleBookmark(currentSectionId, "section");
      if (event.key.toLowerCase() === "j") goRelative(1);
      if (event.key.toLowerCase() === "k") goRelative(-1);
      if (event.key === "?") openShortcuts();
    });

    DOM.app.addEventListener("click", handleAppClick);
    DOM.app.addEventListener("keydown", handleAppKeydown);
    DOM.app.addEventListener("input", handleAppInput);
  }

  function handleAppClick(event) {
    const navTarget = event.target.closest("[data-nav-target]");
    if (navTarget) {
      location.hash = navTarget.dataset.navTarget;
      closeSidebar();
      return;
    }

    const completeButton = event.target.closest("[data-complete-section]");
    if (completeButton) {
      const id = completeButton.dataset.completeSection;
      state.progress[id] = !state.progress[id];
      writeStore(STORAGE_KEYS.progress, state.progress);
      renderNav();
      renderPage();
      return;
    }

    const bookmarkButton = event.target.closest("[data-bookmark]");
    if (bookmarkButton) {
      toggleBookmark(bookmarkButton.dataset.bookmark, bookmarkButton.dataset.bookmarkType || "item");
      return;
    }

    const collapseButton = event.target.closest("[data-collapse]");
    if (collapseButton) {
      const id = collapseButton.dataset.collapse;
      state.collapsed[id] = !state.collapsed[id];
      writeStore(STORAGE_KEYS.collapsed, state.collapsed);
      renderPage();
      return;
    }

    const copyButton = event.target.closest("[data-copy-code]");
    if (copyButton) {
      copyCode(copyButton.dataset.copyCode);
      return;
    }

    const node = event.target.closest("[data-diagram-node]");
    if (node) {
      selectDiagramNode(node.dataset.diagramId, node.dataset.diagramNode);
      return;
    }

    const quizOption = event.target.closest("[data-quiz-option]");
    if (quizOption) {
      answerQuiz(quizOption.dataset.quizId, Number(quizOption.dataset.quizOption));
    }
  }

  function handleAppInput(event) {
    const glossarySearch = event.target.closest("[data-glossary-search]");
    if (glossarySearch) {
      renderGlossaryResults(glossarySearch.value);
    }
  }

  function handleAppKeydown(event) {
    const node = event.target.closest("[data-diagram-node]");
    if (node && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      selectDiagramNode(node.dataset.diagramId, node.dataset.diagramNode);
    }
  }

  function renderNav() {
    const grouped = groupBy(CONTENT_SECTIONS, "level");
    DOM.nav.innerHTML = LEVEL_ORDER.map((level) => {
      const sections = grouped[level] || [];
      if (!sections.length) return "";
      return `<div class="nav-group">
        <p class="nav-group-title">${escapeHtml(level)}</p>
        ${sections.map((section) => renderNavLink(section)).join("")}
      </div>`;
    }).join("");

    DOM.nav.querySelectorAll("[data-section-link]").forEach((button) => {
      button.addEventListener("click", () => {
        location.hash = button.dataset.sectionLink;
        closeSidebar();
      });
    });

    renderSidebarStats();
  }

  function renderNavLink(section) {
    const index = String(CONTENT_SECTIONS.findIndex((item) => item.id === section.id) + 1).padStart(2, "0");
    const complete = !!state.progress[section.id];
    const current = section.id === currentSectionId ? ' aria-current="page"' : "";
    return `<button class="nav-link ${complete ? "is-complete" : ""}" data-section-link="${section.id}" type="button"${current}>
      <span class="nav-index">${index}</span>
      <span>${escapeHtml(section.title)}</span>
      <span class="nav-progress-dot" aria-hidden="true"></span>
    </button>`;
  }

  function renderSidebarStats() {
    const completed = Object.values(state.progress).filter(Boolean).length;
    const quizSummary = getQuizSummary();
    DOM.sidebarStats.innerHTML = `<div class="stat-grid">
      <div class="stat-box"><strong>${completed}/${CONTENT_SECTIONS.length}</strong><span>sections done</span></div>
      <div class="stat-box"><strong>${quizSummary.correct}/${QUIZZES.length}</strong><span>quiz correct</span></div>
      <div class="stat-box"><strong>${Object.keys(state.bookmarks).length}</strong><span>bookmarks</span></div>
      <div class="stat-box"><strong>${GLOSSARY_TERMS.length}</strong><span>glossary terms</span></div>
    </div>`;
  }

  function renderPage() {
    const hash = decodeURIComponent(location.hash.replace("#", ""));
    currentSectionId = CONTENT_SECTIONS.some((section) => section.id === hash) ? hash : "ecosystem-map";
    diagramRegistry.clear();
    const section = getSection(currentSectionId);
    renderNav();
    DOM.bookmarkCurrent.classList.toggle("is-active", !!state.bookmarks[currentSectionId]);
    DOM.bookmarkCurrent.setAttribute("aria-pressed", String(!!state.bookmarks[currentSectionId]));
    DOM.app.innerHTML = `<article class="hub-page">
      ${currentSectionId === "ecosystem-map" ? renderHomeHero() : ""}
      ${renderSection(section)}
    </article>`;
    setupInitialDiagramSelections();
    if (currentSectionId === "glossary") renderGlossaryResults("");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function renderHomeHero() {
    const profile = buildLearningProfile();
    const recommendations = recommendNextSteps(profile);
    return `<section class="hero-grid" aria-label="Learning dashboard">
      <div class="hero-panel">
        <p class="eyebrow">Standalone local curriculum</p>
        <h1>Learn the agent stack end to end.</h1>
        <p class="hero-copy">A self-contained engineering atlas for LangChain v1, LangGraph, LangSmith, RAG, MCP, security, and production agent systems. No backend. No build step. No external runtime.</p>
        <div class="hero-actions">
          <a class="primary-link" href="#roadmap">Start roadmap</a>
          <a class="secondary-link" href="#self-assessment">Take assessment</a>
          <a class="secondary-link" href="#projects">Pick a project</a>
        </div>
      </div>
      <aside class="progress-panel">
        <div class="progress-ring" style="--progress: ${profile.progressPercent}%">
          <div class="progress-ring-inner">
            <div><strong>${profile.progressPercent}%</strong><span>complete</span></div>
          </div>
        </div>
        <h3 style="margin-top: 1rem;">Next recommendations</h3>
        <ol class="recommendation-list">
          ${recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ol>
      </aside>
    </section>`;
  }

  function renderSection(section) {
    const complete = !!state.progress[section.id];
    const bookmarked = !!state.bookmarks[section.id];
    return `<section class="section-card" id="${escapeAttr(section.id)}">
      <header class="section-header">
        <div>
          <p class="eyebrow">${escapeHtml(section.level)}</p>
          <h2>${escapeHtml(section.title)}</h2>
          <p class="section-summary">${escapeHtml(section.summary)}</p>
          <div class="section-meta">
            ${section.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </div>
        <div class="section-toolbar">
          <button class="complete-button ${complete ? "is-complete" : ""}" type="button" data-complete-section="${escapeAttr(section.id)}" aria-pressed="${complete}">
            ${complete ? "Completed" : "Mark complete"}
          </button>
          <button class="complete-button bookmark-toggle ${bookmarked ? "is-bookmarked" : ""}" type="button" data-bookmark="${escapeAttr(section.id)}" data-bookmark-type="section" aria-pressed="${bookmarked}">
            ${bookmarked ? "Bookmarked" : "Bookmark"}
          </button>
        </div>
      </header>
      <div class="block-stack">
        ${section.blocks.map((block, index) => renderBlock(section, block, index)).join("")}
      </div>
    </section>`;
  }

  function renderBlock(section, block, index) {
    const blockId = `${section.id}-${index}`;
    const collapsed = !!state.collapsed[blockId];
    const body = renderBlockBody(section, block, blockId);
    return `<section class="block-card ${collapsed ? "collapsed" : ""}" data-block-id="${escapeAttr(blockId)}">
      <header class="block-header">
        <h3>${escapeHtml(block.title || "Section block")}</h3>
        <div class="block-actions">
          <button class="chip-button" type="button" data-collapse="${escapeAttr(blockId)}" aria-expanded="${!collapsed}">
            ${collapsed ? "Expand" : "Collapse"}
          </button>
        </div>
      </header>
      <div class="block-body">${body}</div>
    </section>`;
  }

  function renderBlockBody(section, block, blockId) {
    switch (block.type) {
      case "callout":
        return renderCallout(block);
      case "diagram":
        return renderDiagram(block, blockId);
      case "list":
        return `<ul class="compact-list">${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
      case "timeline":
        return renderTimeline(block.items);
      case "table":
      case "comparison":
        return renderTable(block.headers, block.rows);
      case "decision":
        return renderDecision(block.rows);
      case "code":
        return renderCode(block.code, block.language || "text", blockId);
      case "cards":
        return renderCards(block.items);
      case "fundamentals":
        return renderFundamentals(block.topics, blockId);
      case "quizzes":
        return renderQuizzes(block.ids);
      case "projects":
        return renderProjects(block.items);
      case "resources":
        return renderResources(block.items);
      case "sources":
        return renderSources(block.items);
      case "interview":
        return renderInterview(block.groups);
      case "cheatsheets":
        return renderCheatsheets(block.items);
      case "glossary":
        return renderGlossary();
      case "cases":
        return renderCases(block.items);
      case "assessment":
        return renderAssessment();
      default:
        return `<p>${escapeHtml(block.body || "")}</p>`;
    }
  }

  function renderCallout(block) {
    const body = Array.isArray(block.body) ? block.body : [block.body];
    return `<div class="callout ${escapeAttr(block.tone || "")}">
      ${body.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
    </div>`;
  }

  function renderTimeline(items) {
    return `<div class="timeline">
      ${items.map((item, index) => `<div class="timeline-item">
        <span class="timeline-index">${String(index + 1).padStart(2, "0")}</span>
        <div class="timeline-copy"><h4>${escapeHtml(item[0])}</h4><p>${escapeHtml(item[1])}</p></div>
      </div>`).join("")}
    </div>`;
  }

  function renderTable(headers, rows) {
    return `<div class="table-wrap">
      <table>
        <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>`;
  }

  function renderDecision(rows) {
    return `<div class="decision-tree">
      ${rows.map((row) => `<div class="decision-row">
        <div class="decision-prompt">${escapeHtml(row[0])}</div>
        <div class="decision-answer">${escapeHtml(row[1])}</div>
      </div>`).join("")}
    </div>`;
  }

  function renderCode(code, language, id) {
    return `<div class="code-shell">
      <div class="code-toolbar"><span>${escapeHtml(language)}</span><button class="copy-button" type="button" data-copy-code="${escapeAttr(id)}">Copy</button></div>
      <pre><code id="${escapeAttr(id)}-code">${escapeHtml(code)}</code></pre>
    </div>`;
  }

  function renderCards(items) {
    return `<div class="card-grid">${items.map((item) => `<article class="resource-card">
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.description)}</p>
    </article>`).join("")}</div>`;
  }

  function renderFundamentals(topics, blockId) {
    return `<div class="card-grid">
      ${topics.map((topic, index) => {
        const codeId = `${blockId}-topic-${index}`;
        return `<article class="project-card">
          <h4>${escapeHtml(topic.title)}</h4>
          <p><strong>What:</strong> ${escapeHtml(topic.what)}</p>
          <p><strong>Why:</strong> ${escapeHtml(topic.why)}</p>
          <p><strong>How:</strong> ${escapeHtml(topic.how)}</p>
          ${renderCode(topic.code, "ts", codeId)}
          <h4 style="margin-top: .8rem;">Common mistakes</h4>
          <ul class="mistake-list">${topic.mistakes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          <h4 style="margin-top: .8rem;">Interview questions</h4>
          <ul class="interview-list">${topic.questions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </article>`;
      }).join("")}
    </div>`;
  }

  function renderQuizzes(ids) {
    const quizzes = ids.map((id) => QUIZZES.find((quiz) => quiz.id === id)).filter(Boolean);
    return `<div class="card-grid">
      ${quizzes.map((quiz) => renderQuizCard(quiz)).join("")}
    </div>`;
  }

  function renderQuizCard(quiz) {
    const result = state.quizResults[quiz.id];
    return `<article class="quiz-card" data-quiz-card="${escapeAttr(quiz.id)}">
      <span class="level-pill">${escapeHtml(quiz.level)}</span>
      <h4 style="margin-top: .6rem;">${escapeHtml(quiz.question)}</h4>
      <div class="quiz-options">
        ${quiz.choices.map((choice, index) => {
          const chosen = result && result.selected === index;
          const correct = result && quiz.answer === index;
          const wrong = chosen && !correct;
          return `<button class="option-button ${correct ? "is-correct" : ""} ${wrong ? "is-wrong" : ""}" type="button" data-quiz-id="${escapeAttr(quiz.id)}" data-quiz-option="${index}">
            ${escapeHtml(choice)}
          </button>`;
        }).join("")}
      </div>
      ${result ? `<p class="quiz-explanation"><strong>${result.correct ? "Correct" : "Review"}:</strong> ${escapeHtml(quiz.explanation)}</p>` : ""}
    </article>`;
  }

  function renderProjects(items) {
    const grouped = groupBy(items, "level");
    return LEVEL_ORDER.map((level) => {
      const projects = grouped[level] || [];
      if (!projects.length) return "";
      return `<h3>${escapeHtml(level)}</h3><div class="card-grid">
        ${projects.map((project) => `<article class="project-card">
          <span class="difficulty">${escapeHtml(project.difficulty)} • ${escapeHtml(project.time)}</span>
          <h4>${escapeHtml(project.title)}</h4>
          <p>${escapeHtml(project.description)}</p>
          <p><strong>Architecture:</strong> ${escapeHtml(project.architecture)}</p>
          <p><strong>Skills learned:</strong> ${escapeHtml(project.skills.join(", "))}</p>
          <button class="complete-button bookmark-toggle ${state.bookmarks[project.title] ? "is-bookmarked" : ""}" type="button" data-bookmark="${escapeAttr(project.title)}" data-bookmark-type="project">${state.bookmarks[project.title] ? "Bookmarked" : "Bookmark"}</button>
        </article>`).join("")}
      </div>`;
    }).join("");
  }

  function renderResources(items) {
    const grouped = groupBy(items, "category");
    return Object.keys(grouped).map((category) => `<h3>${escapeHtml(category)}</h3><div class="card-grid">
      ${grouped[category].map((resource) => `<article class="resource-card">
        <h4><a href="${escapeAttr(resource.url)}" target="_blank" rel="noreferrer">${escapeHtml(resource.title)}</a></h4>
        <p>${escapeHtml(resource.description)}</p>
        <button class="complete-button bookmark-toggle ${state.bookmarks[resource.title] ? "is-bookmarked" : ""}" type="button" data-bookmark="${escapeAttr(resource.title)}" data-bookmark-type="resource">${state.bookmarks[resource.title] ? "Bookmarked" : "Bookmark"}</button>
      </article>`).join("")}
    </div>`).join("");
  }

  function renderSources(items) {
    return `<div class="card-grid">${items.map((source) => `<article class="resource-card">
      <h4><a href="${escapeAttr(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a></h4>
      <p>${escapeHtml(source.note)}</p>
    </article>`).join("")}</div>`;
  }

  function renderInterview(groups) {
    return groups.map((group) => `<h3>${escapeHtml(group.level)}</h3><div class="card-grid">
      ${group.questions.map((item) => `<article class="quiz-card">
        <h4>${escapeHtml(item[0])}</h4>
        <p>${escapeHtml(item[1])}</p>
      </article>`).join("")}
    </div>`).join("");
  }

  function renderCheatsheets(items) {
    return `<div class="card-grid">
      ${items.map((sheet) => `<article class="resource-card">
        <h4>${escapeHtml(sheet.title)}</h4>
        <ul class="compact-list">${sheet.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </article>`).join("")}
    </div>`;
  }

  function renderGlossary() {
    return `<div class="glossary-panel" style="padding: 1rem;">
      <div class="glossary-controls">
        <label><span class="sr-only">Search glossary</span><input class="text-input" data-glossary-search type="search" placeholder="Filter ${GLOSSARY_TERMS.length} terms by concept, example, or tag"></label>
        <span class="level-pill">${GLOSSARY_TERMS.length} terms</span>
      </div>
      <div class="glossary-results" id="glossary-results"></div>
    </div>`;
  }

  function renderGlossaryResults(query) {
    const target = document.getElementById("glossary-results");
    if (!target) return;
    const q = normalize(query);
    const results = GLOSSARY_TERMS.filter((term) => {
      if (!q) return true;
      return normalize([term.term, term.definition, term.example, term.related.join(" "), term.tags.join(" ")].join(" ")).includes(q);
    }).slice(0, q ? 120 : 72);

    target.innerHTML = results.length ? results.map((term) => `<article class="glossary-term">
      <span class="level-pill">${escapeHtml(term.level)}</span>
      <h4>${escapeHtml(term.term)}</h4>
      <p>${escapeHtml(term.definition)}</p>
      <p><strong>Example:</strong> ${escapeHtml(term.example)}</p>
      <p><strong>Related:</strong> ${escapeHtml(term.related.join(", "))}</p>
      <button class="complete-button bookmark-toggle ${state.bookmarks[term.term] ? "is-bookmarked" : ""}" type="button" data-bookmark="${escapeAttr(term.term)}" data-bookmark-type="glossary">${state.bookmarks[term.term] ? "Bookmarked" : "Bookmark"}</button>
    </article>`).join("") : `<div class="empty-state">No glossary terms match that filter.</div>`;
  }

  function renderCases(items) {
    return `<div class="card-grid">
      ${items.map((item) => `<article class="case-card">
        <span class="difficulty">${escapeHtml(item.difficulty)}</span>
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.description)}</p>
        <p><strong>Architecture:</strong> ${escapeHtml(item.architecture)}</p>
        <p><strong>Risks:</strong> ${escapeHtml(item.risks.join(", "))}</p>
        <p><strong>Metrics:</strong> ${escapeHtml(item.metrics.join(", "))}</p>
      </article>`).join("")}
    </div>`;
  }

  function renderAssessment() {
    const profile = buildLearningProfile();
    const recommendations = recommendNextSteps(profile);
    const quizSummary = getQuizSummary();
    return `<div class="hero-grid">
      <div class="progress-panel">
        <h3>Current profile</h3>
        <p>${profile.completedSections} of ${CONTENT_SECTIONS.length} sections complete. ${quizSummary.correct} of ${QUIZZES.length} quizzes correct.</p>
        <p>Strong tags: ${escapeHtml(profile.strongTags.join(", ") || "none yet")}.</p>
        <p>Weak tags: ${escapeHtml(profile.weakTags.join(", ") || "none yet")}.</p>
      </div>
      <div class="progress-panel">
        <h3>Recommended next steps</h3>
        <ol class="recommendation-list">${recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
      </div>
    </div>`;
  }

  function renderDiagram(block, blockId) {
    diagramRegistry.set(blockId, block);
    const selected = block.nodes[0] ? block.nodes[0].id : "";
    return `<div class="diagram-card" data-diagram="${escapeAttr(blockId)}" data-selected-node="${escapeAttr(selected)}">
      <div class="diagram-canvas">
        <svg viewBox="0 0 940 520" role="img" aria-label="${escapeAttr(block.title)}">
          <defs>
            <marker id="arrow-${escapeAttr(blockId)}" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="currentColor"></path>
            </marker>
          </defs>
          ${block.edges.map((edge) => renderSvgEdge(edge, block.nodes, blockId)).join("")}
          ${block.nodes.map((node) => renderSvgNode(node, blockId, node.id === selected)).join("")}
        </svg>
      </div>
      <aside class="diagram-panel" id="${escapeAttr(blockId)}-panel">
        ${renderDiagramPanel(block.nodes[0], block)}
      </aside>
      ${block.mermaid ? `<div style="grid-column: 1 / -1;">${renderCode(block.mermaid, "mermaid source", `${blockId}-mermaid`)}</div>` : ""}
    </div>`;
  }

  function renderSvgEdge(edge, nodes, blockId) {
    const from = nodes.find((node) => node.id === edge[0]);
    const to = nodes.find((node) => node.id === edge[1]);
    if (!from || !to) return "";
    const x1 = from.x + 52;
    const y1 = from.y;
    const x2 = to.x - 52;
    const y2 = to.y;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    return `<g class="diagram-edge-group" data-edge-from="${escapeAttr(edge[0])}" data-edge-to="${escapeAttr(edge[1])}">
      <line class="diagram-edge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#arrow-${escapeAttr(blockId)})"></line>
      <text x="${midX}" y="${midY - 6}" fill="var(--faint)" font-family="var(--font-mono)" font-size="10" text-anchor="middle">${escapeHtml(edge[2] || "")}</text>
    </g>`;
  }

  function renderSvgNode(node, blockId, selected) {
    const width = Math.max(104, node.label.length * 8 + 24);
    const height = 48;
    return `<g class="diagram-node ${selected ? "is-selected" : ""}" tabindex="0" role="button" aria-label="${escapeAttr(node.label)}" data-diagram-id="${escapeAttr(blockId)}" data-diagram-node="${escapeAttr(node.id)}">
      <rect x="${node.x - width / 2}" y="${node.y - height / 2}" width="${width}" height="${height}" rx="8"></rect>
      <text x="${node.x}" y="${node.y + 4}" text-anchor="middle">${escapeHtml(node.label)}</text>
    </g>`;
  }

  function renderDiagramPanel(node, block) {
    if (!node) return `<p>Select a node to inspect it.</p>`;
    const related = block.edges.filter((edge) => edge[0] === node.id || edge[1] === node.id).map((edge) => {
      const otherId = edge[0] === node.id ? edge[1] : edge[0];
      const other = block.nodes.find((item) => item.id === otherId);
      return other ? `${other.label}: ${edge[2] || "related"}` : "";
    }).filter(Boolean);
    return `<p class="eyebrow">${escapeHtml(node.kind || "concept")}</p>
      <h3>${escapeHtml(node.label)}</h3>
      <p>${escapeHtml(node.description || "")}</p>
      <ul>${(node.details || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      ${related.length ? `<h4>Connections</h4><ul>${related.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}`;
  }

  function setupInitialDiagramSelections() {
    diagramRegistry.forEach((block, id) => {
      if (block.nodes[0]) selectDiagramNode(id, block.nodes[0].id, true);
    });
  }

  function selectDiagramNode(diagramId, nodeId, silent) {
    const block = diagramRegistry.get(diagramId);
    if (!block) return;
    const diagram = document.querySelector(`[data-diagram="${cssEscape(diagramId)}"]`);
    const panel = document.getElementById(`${diagramId}-panel`);
    const node = block.nodes.find((item) => item.id === nodeId);
    if (!diagram || !panel || !node) return;
    diagram.dataset.selectedNode = nodeId;
    diagram.querySelectorAll(".diagram-node").forEach((el) => {
      el.classList.toggle("is-selected", el.dataset.diagramNode === nodeId);
    });
    diagram.querySelectorAll(".diagram-edge").forEach((edgeEl) => {
      const group = edgeEl.closest(".diagram-edge-group");
      const active = group.dataset.edgeFrom === nodeId || group.dataset.edgeTo === nodeId;
      edgeEl.classList.toggle("is-active", active);
    });
    panel.innerHTML = renderDiagramPanel(node, block);
    if (!silent) panel.focus && panel.focus();
  }

  function buildSearchIndex() {
    const sectionItems = CONTENT_SECTIONS.map((section) => ({
      type: "Section",
      title: section.title,
      level: section.level,
      target: section.id,
      text: flattenText(section)
    }));
    const glossaryItems = GLOSSARY_TERMS.map((term) => ({
      type: "Glossary",
      title: term.term,
      level: term.level,
      target: "glossary",
      text: flattenText(term)
    }));
    const resourceItems = RESOURCES.map((resource) => ({
      type: "Resource",
      title: resource.title,
      level: resource.category,
      target: "resources",
      text: flattenText(resource)
    }));
    const projectItems = PROJECTS.map((project) => ({
      type: "Project",
      title: project.title,
      level: project.level,
      target: "projects",
      text: flattenText(project)
    }));
    const quizItems = QUIZZES.map((quiz) => ({
      type: "Quiz",
      title: quiz.question,
      level: quiz.level,
      target: quiz.sectionId,
      text: flattenText(quiz)
    }));
    return sectionItems.concat(glossaryItems, resourceItems, projectItems, quizItems).map((item) => ({
      ...item,
      normalized: normalize(item.title + " " + item.text)
    }));
  }

  function openSearch() {
    openDialog(DOM.searchDialog);
    renderSearchFilters();
    renderSearchResults(DOM.searchInput.value);
    setTimeout(() => DOM.searchInput.focus(), 0);
  }

  function openShortcuts() {
    openDialog(DOM.shortcutsDialog);
  }

  function openDialog(dialog) {
    DOM.overlay.hidden = false;
    dialog.hidden = false;
  }

  function closeDialogs() {
    DOM.searchDialog.hidden = true;
    DOM.shortcutsDialog.hidden = true;
    if (!DOM.body.classList.contains("sidebar-open")) DOM.overlay.hidden = true;
  }

  function renderSearchFilters() {
    const types = ["All"].concat(Array.from(new Set(searchIndex.map((item) => item.type))));
    DOM.searchFilters.innerHTML = types.map((type) => `<button class="chip-button" type="button" data-search-filter="${escapeAttr(type)}">${escapeHtml(type)}</button>`).join("");
    DOM.searchFilters.querySelectorAll("[data-search-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        DOM.searchFilters.dataset.filter = button.dataset.searchFilter;
        renderSearchResults(DOM.searchInput.value);
      });
    });
  }

  function renderSearchResults(query) {
    const filter = DOM.searchFilters.dataset.filter || "All";
    const q = normalize(query);
    const results = searchIndex
      .filter((item) => filter === "All" || item.type === filter)
      .map((item) => ({ item, score: scoreSearch(item, q) }))
      .filter((entry) => !q || entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40);

    DOM.searchResults.innerHTML = results.length ? results.map(({ item }) => `<button class="search-result" type="button" data-search-target="${escapeAttr(item.target)}">
      <span class="source-pill">${escapeHtml(item.type)} • ${escapeHtml(item.level)}</span>
      <h4>${highlight(item.title, q)}</h4>
      <p>${highlight(excerpt(item.text, q), q)}</p>
    </button>`).join("") : `<div class="empty-state">${q ? "No matches found." : "Type to search sections, glossary, projects, resources, and quizzes."}</div>`;

    DOM.searchResults.querySelectorAll("[data-search-target]").forEach((button) => {
      button.addEventListener("click", () => {
        location.hash = button.dataset.searchTarget;
        closeDialogs();
      });
    });
  }

  function scoreSearch(item, q) {
    if (!q) return item.type === "Section" ? 5 : 1;
    const title = normalize(item.title);
    let score = 0;
    if (title === q) score += 100;
    if (title.includes(q)) score += 40;
    if (item.normalized.includes(q)) score += 10;
    q.split(/\s+/).forEach((part) => {
      if (part && item.normalized.includes(part)) score += 3;
    });
    return score;
  }

  function toggleTheme() {
    state.theme = state.theme === "light" ? "dark" : "light";
    writeStore(STORAGE_KEYS.theme, state.theme);
    applyTheme(state.theme);
  }

  function applyTheme(theme) {
    DOM.root.setAttribute("data-theme", theme);
  }

  function toggleBookmark(id, type) {
    if (state.bookmarks[id]) {
      delete state.bookmarks[id];
    } else {
      state.bookmarks[id] = { type, createdAt: new Date().toISOString() };
    }
    writeStore(STORAGE_KEYS.bookmarks, state.bookmarks);
    renderNav();
    renderPage();
  }

  function answerQuiz(id, selected) {
    const quiz = QUIZZES.find((item) => item.id === id);
    if (!quiz) return;
    state.quizResults[id] = {
      selected,
      correct: selected === quiz.answer,
      answeredAt: new Date().toISOString(),
      tags: quiz.tags
    };
    writeStore(STORAGE_KEYS.quizResults, state.quizResults);
    renderNav();
    renderPage();
  }

  function copyCode(id) {
    const code = document.getElementById(`${id}-code`);
    if (!code) return;
    const text = code.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  function goRelative(direction) {
    const index = CONTENT_SECTIONS.findIndex((section) => section.id === currentSectionId);
    const next = CONTENT_SECTIONS[index + direction];
    if (next) location.hash = next.id;
  }

  function toggleSidebar() {
    const open = !DOM.body.classList.contains("sidebar-open");
    DOM.body.classList.toggle("sidebar-open", open);
    DOM.menuToggle.setAttribute("aria-expanded", String(open));
    DOM.overlay.hidden = !open;
  }

  function closeSidebar() {
    DOM.body.classList.remove("sidebar-open");
    DOM.menuToggle.setAttribute("aria-expanded", "false");
    if (DOM.searchDialog.hidden && DOM.shortcutsDialog.hidden) DOM.overlay.hidden = true;
  }

  function getSection(id) {
    return CONTENT_SECTIONS.find((section) => section.id === id) || CONTENT_SECTIONS[0];
  }

  function getQuizSummary() {
    const results = Object.values(state.quizResults);
    return {
      answered: results.length,
      correct: results.filter((item) => item.correct).length
    };
  }

  function buildLearningProfile() {
    const completedSections = Object.values(state.progress).filter(Boolean).length;
    const progressPercent = Math.round((completedSections / CONTENT_SECTIONS.length) * 100);
    const tagScores = {};
    QUIZZES.forEach((quiz) => {
      const result = state.quizResults[quiz.id];
      quiz.tags.forEach((tag) => {
        tagScores[tag] = tagScores[tag] || { correct: 0, wrong: 0, unanswered: 0 };
        if (!result) tagScores[tag].unanswered += 1;
        else if (result.correct) tagScores[tag].correct += 1;
        else tagScores[tag].wrong += 1;
      });
    });
    const weakTags = Object.keys(tagScores).filter((tag) => tagScores[tag].wrong || tagScores[tag].unanswered).slice(0, 6);
    const strongTags = Object.keys(tagScores).filter((tag) => tagScores[tag].correct && !tagScores[tag].wrong).slice(0, 6);
    return {
      completedSections,
      progressPercent,
      weakTags,
      strongTags,
      incompleteSections: CONTENT_SECTIONS.filter((section) => !state.progress[section.id]),
      quizSummary: getQuizSummary()
    };
  }

  function recommendNextSteps(profile) {
    const recommendations = [];
    if (profile.weakTags.includes("structured output") || profile.weakTags.includes("langchain")) {
      recommendations.push("Review LangChain fundamentals before adding more agent autonomy.");
    }
    if (profile.weakTags.includes("rag") || profile.weakTags.includes("retrieval")) {
      recommendations.push("Work through the RAG masterclass and test retrieval recall before building a larger assistant.");
    }
    if (profile.weakTags.includes("security") || profile.weakTags.includes("prompt injection")) {
      recommendations.push("Study the security section before connecting write tools or MCP servers.");
    }
    if (profile.weakTags.includes("langgraph") || profile.weakTags.includes("checkpointing")) {
      recommendations.push("Build the email agent project to practice interrupts, approval, and checkpointing.");
    }
    if (profile.quizSummary.answered < QUIZZES.length) {
      recommendations.push("Finish the self-assessment quizzes to reveal weak areas.");
    }
    if (profile.incompleteSections.length) {
      recommendations.push(`Continue with ${profile.incompleteSections[0].title}.`);
    }
    recommendations.push("Pick the smallest project that exercises your weakest concept and add LangSmith tracing from the start.");
    return Array.from(new Set(recommendations)).slice(0, 4);
  }

  function inferGlossaryCategory(term) {
    const value = term.toLowerCase();
    if (value.includes("mcp") || value.includes("server") || value.includes("client") || value.includes("resource") || value.includes("prompt template arguments")) return "mcp";
    if (value.includes("rag") || value.includes("retrieval") || value.includes("embedding") || value.includes("vector") || value.includes("chunk")) return "rag";
    if (value.includes("security") || value.includes("injection") || value.includes("secret") || value.includes("permission") || value.includes("rbac") || value.includes("abuse")) return "security";
    if (value.includes("eval") || value.includes("trace") || value.includes("monitor") || value.includes("observability") || value.includes("dataset")) return "evaluation";
    if (value.includes("graph") || value.includes("node") || value.includes("edge") || value.includes("checkpoint") || value.includes("state")) return "langgraph";
    if (value.includes("tool")) return "tools";
    if (value.includes("agent") || value.includes("supervisor") || value.includes("planner")) return "agents";
    return "foundation";
  }

  function inferGlossaryLevel(term, index) {
    const category = inferGlossaryCategory(term);
    if (["security", "evaluation", "langgraph"].includes(category)) return index % 3 === 0 ? "Advanced" : "Intermediate";
    if (category === "agents") return index % 4 === 0 ? "Expert" : "Intermediate";
    if (category === "mcp") return index % 5 === 0 ? "Advanced" : "Intermediate";
    return index % 6 === 0 ? "Intermediate" : "Beginner";
  }

  function buildDefinition(term, category) {
    const lower = term.toLowerCase();
    const templates = {
      mcp: `${term} is part of the Model Context Protocol integration surface for connecting AI hosts to external context, tools, prompts, or server capabilities.`,
      rag: `${term} is a retrieval concept used to get the right evidence into the model context before answer generation.`,
      security: `${term} is a security concern or control that limits what an agent can see, decide, or do.`,
      evaluation: `${term} is part of the feedback loop that records, measures, compares, or improves LLM application behavior.`,
      langgraph: `${term} is a workflow orchestration concept for making agent control flow, state, and recovery explicit.`,
      tools: `${term} is a tool-use concept for exposing typed external actions to a model or agent.`,
      agents: `${term} is an agent architecture concept for coordinating model reasoning, context, tools, and control flow.`,
      foundation: `${term} is a foundational LLM application concept that shapes model input, output, behavior, or production operation.`
    };
    if (lower.includes("transport")) return `${term} describes how MCP clients and servers exchange protocol messages.`;
    if (lower.includes("latency")) return `${term} is the time budget or observed delay for a model, tool, retrieval, or workflow step.`;
    return templates[category];
  }

  function buildExample(term, category) {
    const examples = {
      mcp: `A ${term} appears when an IDE connects to a filesystem or GitHub MCP server.`,
      rag: `A ${term} decision affects whether the support assistant retrieves the correct policy paragraph.`,
      security: `A ${term} control prevents a malicious document from triggering an unauthorized write tool.`,
      evaluation: `A ${term} helps compare release v3 against v4 on the same regression examples.`,
      langgraph: `A ${term} is visible in a graph that pauses for human approval before sending email.`,
      tools: `A ${term} matters when the model calls lookup_order with a validated orderId.`,
      agents: `A ${term} appears in a research workflow that plans, searches, critiques, and synthesizes.`,
      foundation: `A ${term} affects how the application formats, routes, or evaluates a model call.`
    };
    return examples[category];
  }

  function buildRelated(term, category) {
    const related = {
      mcp: ["MCP", "tools", "resources"],
      rag: ["retrieval", "embeddings", "groundedness"],
      security: ["prompt injection", "tool approval", "least privilege"],
      evaluation: ["trace", "dataset", "evaluator"],
      langgraph: ["state", "node", "edge"],
      tools: ["tool schema", "tool result", "approval gate"],
      agents: ["state", "tools", "evaluation"],
      foundation: ["messages", "prompt", "model"]
    };
    return related[category].filter((item) => item.toLowerCase() !== term.toLowerCase()).slice(0, 3);
  }

  function groupBy(items, key) {
    return items.reduce((acc, item) => {
      const value = item[key];
      acc[value] = acc[value] || [];
      acc[value].push(item);
      return acc;
    }, {});
  }

  function flattenText(value) {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) return value.map(flattenText).join(" ");
    if (typeof value === "object") return Object.values(value).map(flattenText).join(" ");
    return "";
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function excerpt(text, q) {
    const cleaned = String(text || "").replace(/\s+/g, " ").trim();
    if (!q) return cleaned.slice(0, 180);
    const index = normalize(cleaned).indexOf(q);
    if (index < 0) return cleaned.slice(0, 180);
    const start = Math.max(0, index - 70);
    return (start > 0 ? "... " : "") + cleaned.slice(start, start + 220) + (start + 220 < cleaned.length ? " ..." : "");
  }

  function highlight(text, q) {
    const safe = escapeHtml(text);
    if (!q) return safe;
    const words = q.split(/\s+/).filter(Boolean).map(escapeRegExp);
    if (!words.length) return safe;
    return safe.replace(new RegExp(`(${words.join("|")})`, "gi"), "<mark>$1</mark>");
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    return String(value).replace(/"/g, '\\"');
  }

  document.addEventListener("DOMContentLoaded", init);
})();
