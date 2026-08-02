import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AIAssistantContext = createContext();

export const useAIAssistant = () => useContext(AIAssistantContext);

export const AIAssistantProvider = ({ children, apiKey, user, onSaveTask, onSaveNote }) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState(null);

  const initSession = async () => {
    if (!apiKey) {
      setChatSession(null);
      return;
    }
    
    try {
      let contextStr = "No context available.";
      let chatHistory = [];
      
      if (user) {
        // Load chat history
        try {
          const historySnap = await getDoc(doc(db, "users", user.uid, "ai_chat", "history"));
          if (historySnap.exists()) {
            chatHistory = historySnap.data().messages || [];
            setMessages(chatHistory);
          }
        } catch(e) { console.error("Error loading chat history:", e); }

        // Load context data (tasks, habits, finances)
        try {
          const tasksSnap = await getDocs(collection(db, "users", user.uid, "tasks"));
          const tasks = tasksSnap.docs.map(d => d.data());
          const pendingTasks = tasks.filter(t => t.status !== 'done').length;
          const todayStr = new Date().toISOString().split('T')[0];
          const dueToday = tasks.filter(t => t.status !== 'done' && t.deadline === todayStr).length;
          
          const habitsSnap = await getDocs(collection(db, "users", user.uid, "habits"));
          const habits = habitsSnap.docs.map(d => d.data());
          const activeHabits = habits.filter(h => !h.archived).length;
          
          const txSnap = await getDocs(collection(db, "users", user.uid, "finances"));
          const txs = txSnap.docs.map(d => d.data());
          const thisMonthTx = txs.filter(t => t.date && t.date.startsWith(todayStr.slice(0,7)));
          const spentThisMonth = thisMonthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + (t.amount || 0), 0);

          contextStr = `Current User Context:\n- Pending Tasks: ${pendingTasks} (Due today: ${dueToday})\n- Active Habits: ${activeHabits}\n- Spent this month: ${spentThisMonth} ₼`;
        } catch(e) { console.error("Error loading context:", e); }
      }

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
        systemInstruction: "You are an AI Coach and psychologist embedded within a personal planner app (nuri.life). Your goal is to help the user brainstorm ideas, resolve problems, and organize their life. Be concise, empathetic, and highly actionable. If the user comes up with a concrete action, you MUST use the 'createTask' tool to add it to their planner. If the user wants to save an insight or write down thoughts, use the 'createNote' tool. Always inform the user when you create a task or note.\n\n" + contextStr
      });

      // Format history for Gemini (needs role 'user' or 'model' and parts array)
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const session = model.startChat({ history: formattedHistory });
      setChatSession(session);
    } catch (error) {
      console.error("Error initializing Gemini:", error);
    }
  };

  useEffect(() => {
    initSession();
  }, [apiKey, user]);

  const saveHistoryToFirebase = async (newMessages) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "ai_chat", "history"), { messages: newMessages }, { merge: true });
    } catch(e) { console.error("Error saving chat history", e); }
  };

  const sendMessage = async (text) => {
    if (!chatSession) {
      setMessages(prev => [...prev, { role: 'user', text }, { role: 'model', text: 'Пожалуйста, укажите валидный API ключ в настройках.' }]);
      return;
    }

    try {
      setIsTyping(true);
      const prevMessages = [...messages, { role: 'user', text }];
      setMessages(prevMessages);
      saveHistoryToFirebase(prevMessages);
      
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
        const newMsgs = [...prevMessages, { role: 'model', text: finalResponseText }];
        setMessages(newMsgs);
        saveHistoryToFirebase(newMsgs);
      } else {
        const responseText = response.text();
        const newMsgs = [...prevMessages, { role: 'model', text: responseText }];
        setMessages(newMsgs);
        saveHistoryToFirebase(newMsgs);
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
    if (user) {
      setDoc(doc(db, "users", user.uid, "ai_chat", "history"), { messages: [] }, { merge: true });
    }
    initSession();
  };

  return (
    <AIAssistantContext.Provider value={{ messages, isTyping, sendMessage, clearChat, apiKey }}>
      {children}
    </AIAssistantContext.Provider>
  );
};
