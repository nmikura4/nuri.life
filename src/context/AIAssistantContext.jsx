import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const AIAssistantContext = createContext();

export const useAIAssistant = () => useContext(AIAssistantContext);

export const AIAssistantProvider = ({ children, apiKey, user, onSaveTask, onSaveNote }) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState(null);

  const initSession = () => {
    if (!apiKey) {
      setChatSession(null);
      return;
    }
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const tools = [
        {
          functionDeclarations: [
            {
              name: "createTask",
              description: "Creates a new task in the user's planner.",
              parameters: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING", description: "The title of the task" },
                  description: { type: "STRING", description: "Details or description of the task" },
                  priority: { type: "STRING", description: "Priority of the task: 'low', 'medium', or 'high'" },
                  deadline: { type: "STRING", description: "Deadline in YYYY-MM-DD format, or null if no deadline" }
                },
                required: ["title"]
              }
            },
            {
              name: "createNote",
              description: "Creates a new note for the user.",
              parameters: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING", description: "The title of the note" },
                  content: { type: "STRING", description: "The main text content of the note" }
                },
                required: ["title", "content"]
              }
            }
          ]
        }
      ];

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        tools,
        systemInstruction: "You are an AI Coach and psychologist embedded within a personal planner app (nuri.life). Your goal is to help the user brainstorm ideas, resolve problems, and organize their life. Be concise, empathetic, and highly actionable. If the user comes up with a concrete action, you MUST use the 'createTask' tool to add it to their planner. If the user wants to save an insight or write down thoughts, use the 'createNote' tool. Always inform the user when you create a task or note."
      });

      const session = model.startChat({ history: [] });
      setChatSession(session);
    } catch (error) {
      console.error("Error initializing Gemini:", error);
    }
  };

  useEffect(() => {
    initSession();
  }, [apiKey]);

  const sendMessage = async (text) => {
    if (!chatSession) {
      setMessages(prev => [...prev, { role: 'user', text }, { role: 'model', text: 'Пожалуйста, укажите валидный API ключ в настройках.' }]);
      return;
    }

    try {
      setIsTyping(true);
      setMessages(prev => [...prev, { role: 'user', text }]);
      
      const result = await chatSession.sendMessage(text);
      const response = await result.response;
      
      const functionCalls = response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        let functionResponses = [];
        
        for (const call of functionCalls) {
          try {
            if (call.name === 'createTask') {
              if (onSaveTask) {
                const taskData = {
                  title: call.args.title,
                  description: call.args.description || '',
                  priority: call.args.priority || 'medium',
                  status: 'todo',
                  deadline: call.args.deadline || null,
                  createdAt: new Date().toISOString()
                };
                await onSaveTask(taskData);
                functionResponses.push({
                  functionResponse: {
                    name: 'createTask',
                    response: { status: 'success', message: 'Task created successfully' }
                  }
                });
              }
            } else if (call.name === 'createNote') {
              if (onSaveNote) {
                const noteData = {
                  title: call.args.title,
                  content: call.args.content,
                  updatedAt: new Date().toISOString(),
                  color: 'default'
                };
                await onSaveNote(noteData);
                functionResponses.push({
                  functionResponse: {
                    name: 'createNote',
                    response: { status: 'success', message: 'Note created successfully' }
                  }
                });
              }
            }
          } catch (e) {
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: { status: 'error', message: e.message }
              }
            });
          }
        }
        
        const finalResult = await chatSession.sendMessage(functionResponses);
        const finalResponseText = finalResult.response.text();
        setMessages(prev => [...prev, { role: 'model', text: finalResponseText }]);
      } else {
        const responseText = response.text();
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Произошла ошибка при обращении к ИИ.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    initSession();
  };

  return (
    <AIAssistantContext.Provider value={{ messages, isTyping, sendMessage, clearChat, apiKey }}>
      {children}
    </AIAssistantContext.Provider>
  );
};
