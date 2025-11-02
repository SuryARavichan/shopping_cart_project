import React, {useState, useRef} from 'react';
import MessageBubble from './MessageBubble';
import ProductCard from './ProductCard';

export default function ChatWindow({apiPath = '/api/chat'}){
  const [messages, setMessages] = useState([{id:1, sender:'agent', text:'Hi! Ask me about phones — e.g. "Best camera under ₹30k?"'}]);
  const [input, setInput] = useState('');
  const idRef = useRef(2);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = {id: idRef.current++, sender: 'user', text: input};
    setMessages(m => [...m, userMsg]);
    setInput('');
    const loading = {id: idRef.current++, sender:'agent', text:'Searching...'};
    setMessages(m => [...m, loading]);

    try {
      const r = await fetch(apiPath, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({message: userMsg.text})});
      const json = await r.json();
      setMessages(m => m.filter(mm => mm !== loading));
      if (json.type === 'refusal') {
        setMessages(m => [...m, {id:idRef.current++, sender:'agent', text: json.text}]);
      } else if (json.type === 'search') {
        setMessages(m => [...m, {id:idRef.current++, sender:'agent', text: json.text}]);
        if (json.items && json.items.length) setMessages(m => [...m, {id:idRef.current++, sender:'agent', products: json.items}]);
      } else if (json.type === 'comparison') {
        setMessages(m => [...m, {id:idRef.current++, sender:'agent', text: json.text, products: json.items}]);
      } else if (json.type === 'detail') {
        setMessages(m => [...m, {id:idRef.current++, sender:'agent', text: `Details for ${json.item.brand} ${json.item.model}:`, products:[json.item]}]);
      } else {
        setMessages(m => [...m, {id:idRef.current++, sender:'agent', text: json.text}]);
      }
    } catch (err) {
      setMessages(m => m.filter(mm => mm !== loading));
      setMessages(m => [...m, {id:idRef.current++, sender:'agent', text: 'Network error — please try again.'}]);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 h-screen flex flex-col">
      <div className="flex-1 overflow-auto mb-4 p-2" style={{minHeight:0}}>
        {messages.map(m => (
          <div key={m.id} className="mb-3">
            <MessageBubble sender={m.sender} text={m.text} />
            {m.products && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {m.products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') sendMessage();}} className="flex-1 p-2 border rounded" placeholder={`Try: "Best camera phone under ₹30k?"`} />
        <button onClick={sendMessage} className="p-2 bg-blue-600 text-white rounded">Send</button>
      </div>
    </div>
  );
}