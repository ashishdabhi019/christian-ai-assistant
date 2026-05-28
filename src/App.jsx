import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { MessageSquare, Cross, ChevronDown, ArrowUp, Paintbrush, Droplets, Church, Scroll, PenLine, Sparkles, Loader2, CheckCircle, XCircle, Info, Image as ImageIcon } from "lucide-react";
import { BsStars } from "react-icons/bs";

const DENOMINATIONS = [
  { id: "protestant", label: "Protestant / Evangelical" },
  { id: "catholic", label: "Roman Catholic" },
  { id: "orthodox", label: "Eastern Orthodox" },
  { id: "lutheran", label: "Lutheran" },
  { id: "methodist", label: "Methodist / Wesleyan" },
  { id: "baptist", label: "Baptist" },
  { id: "reformed", label: "Reformed / Presbyterian" },
];

const DENOM_CONTEXT = {
  protestant: "Evangelical Protestant tradition: Sola Scriptura, Sola Fide, personal relationship with Christ, priesthood of all believers.",
  catholic: "Roman Catholic tradition: Scripture + Sacred Tradition, Magisterium authority, seven sacraments, Marian theology, papal authority, purgatory, communion of saints.",
  orthodox: "Eastern Orthodox tradition: theosis (divinization), seven Ecumenical Councils, apophatic theology, Divine Liturgy, icons as windows to heaven, filioque controversy.",
  lutheran: "Lutheran tradition: Law-Gospel distinction, two kingdoms, consubstantiation, justification by faith as the central article, Book of Concord confessions.",
  methodist: "Methodist/Wesleyan tradition: Wesleyan Quadrilateral (Scripture, Tradition, Reason, Experience), prevenient grace, entire sanctification, social holiness.",
  baptist: "Baptist tradition: believer's baptism by immersion (credobaptism), congregational polity, soul competency, religious liberty, local church autonomy.",
  reformed: "Reformed/Presbyterian tradition: covenant theology, TULIP, Westminster Standards, regulative principle.",
};

const IMAGE_STYLES = [
  { id: "renaissance_oil_painting", label: "Oil Painting", desc: "Old master style" },
  { id: "Byzantine_icon_gold_background", label: "Byzantine Icon", desc: "Sacred tradition" },
  { id: "watercolor_luminous", label: "Watercolor", desc: "Soft & luminous" },
  { id: "stained_glass_cathedral", label: "Stained Glass", desc: "Cathedral windows" },
  { id: "illuminated_manuscript_gold_leaf", label: "Illuminated MS", desc: "Medieval gold leaf" },
  { id: "pencil_sketch_detailed", label: "Pencil Sketch", desc: "Fine line art" },
];

const QUICK_PROMPTS = [
  "What does the Bible say about forgiveness?",
  "Explain the Trinity simply",
  "How to handle anxiety as a Christian?",
  "What is the Lord's Supper / Eucharist?",
  "Tell me about the Sermon on the Mount",
  "What does 'born again' mean?",
];

const getSystemPrompt = (denomination) => `
You are FaithGuide — a warm, knowledgeable, and pastoral AI assistant for Christians and spiritual seekers.
DENOMINATION: ${denomination.toUpperCase()}
Context: ${DENOM_CONTEXT[denomination]}

SCRIPTURE ACCURACY (CRITICAL):
- NEVER fabricate, alter, or paraphrase as exact quotes
- Format: "Book Chapter:Verse (Translation)" e.g. John 3:16 (NIV)
- If user gives a FAKE/wrong verse: gently correct
- NEVER guess a verse number

SAFETY: Gracefully decline requests to rewrite Scripture, produce hateful content, or support extremist views.
HALLUCINATION PREVENTION: Hedge historical claims. Say "I'm not certain" rather than guess.
TONE: Warm, pastoral, accessible. Like a trusted pastor or Bible study leader.
`.trim();

const isSafeMessage = (text) => {
  const t = text.toLowerCase();
  const blocked = ["rewrite this verse to support","modify the bible to say","make the bible say","write a fake bible verse","create a verse that says","bible verse supporting genocide","bible verse for killing"];
  return !blocked.some(b => t.includes(b));
};

const isImageSafe = (prompt) => {
  const p = prompt.toLowerCase();
  const blocked = ["satanic ritual","demon worship","anti-christ","occult ritual","blasphemy worship","666 ceremony"];
  return !blocked.some(b => p.includes(b));
};

function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{ position:"fixed", top:76, right:16, zIndex:9999, display:"flex", flexDirection:"column", gap:12, pointerEvents:"none", alignItems:"flex-end" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display:"flex", alignItems:"center", gap:14, padding:"10px 16px 10px 12px", borderRadius:16,
          pointerEvents:"all",
          animation:"slideInToastRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          background: t.type==="error" ? "linear-gradient(135deg, rgba(50,20,20,0.85), rgba(70,30,30,0.95))" : t.type==="success" ? "linear-gradient(135deg, rgba(20,50,35,0.85), rgba(30,70,45,0.95))" : "linear-gradient(135deg, rgba(50,40,20,0.85), rgba(70,55,30,0.95))",
          border:`1px solid ${t.type==="error" ? "rgba(255,120,120,0.3)" : t.type==="success" ? "rgba(120,255,160,0.3)" : "rgba(255,210,120,0.3)"}`,
          boxShadow:`0 12px 32px -8px ${t.type==="error" ? "rgba(255,100,100,0.25)" : t.type==="success" ? "rgba(100,255,150,0.25)" : "rgba(255,200,100,0.25)"}`, 
          backdropFilter:"blur(16px)",
        }}>
          <div style={{ flexShrink:0, display:"flex", background:"rgba(255,255,255,0.1)", borderRadius:"50%", padding:6 }}>
            {t.type==="error" && <XCircle size={18} color="#ff9a9a" strokeWidth={2.5} />}
            {t.type==="success" && <CheckCircle size={18} color="#9affbc" strokeWidth={2.5} />}
            {t.type==="info" && <Info size={18} color="#ffef9a" strokeWidth={2.5} />}
          </div>
          <p style={{ margin:0, fontFamily:"'Inter', sans-serif", fontSize:14, fontWeight:500, letterSpacing:"0.01em", color:"#fff" }}>{t.msg}</p>
          <button onClick={() => onRemove(t.id)} style={{ background:"transparent", border:"none", cursor:"pointer", padding:"4px", display:"flex", alignItems:"center", color:"rgba(255,255,255,0.5)", marginLeft:4, transition:"color 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.color = "#fff"}
            onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function Avatar() {
  return (
    <div style={{ width:34, height:34, borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg, #5c3010, #b8902a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:"#fdecc8", marginTop:2 }}>✝</div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const hasCitation = /\b\d?\s?[A-Z][a-z]+\s\d+:\d+/.test(msg.content || "");
  const isSafetyBlock = msg.safety === true;
  return (
    <div style={{ display:"flex", flexDirection:isUser?"row-reverse":"row", alignItems:"flex-start", gap:8, marginBottom:14, animation:"fadeIn 0.25s ease" }}>
      {!isUser && <Avatar />}
      <div style={{ maxWidth:"72%" }}>
        <div style={{
          padding:"11px 15px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser ? "linear-gradient(135deg, rgba(184,144,42,0.18), rgba(92,48,16,0.28))" : isSafetyBlock ? "rgba(180,80,60,0.12)" : "rgba(255,255,255,0.055)",
          border: isUser ? "1px solid rgba(190,155,60,0.38)" : isSafetyBlock ? "1px solid rgba(180,80,60,0.35)" : "1px solid rgba(190,155,60,0.18)",
          backdropFilter:"blur(12px)",
        }}>
          {isUser ? (
            <p style={{ margin:0, color:"#d8eaff", fontSize:15, lineHeight:1.7, fontFamily:"sans-serif", whiteSpace:"pre-wrap" }}>{msg.content}</p>
          ) : (
            <div style={{ color:"#ede6d5", fontSize:15, lineHeight:1.7, fontFamily:"sans-serif" }}>
              <ReactMarkdown components={{
                p:({children})=><p style={{margin:"0 0 8px"}}>{children}</p>,
                strong:({children})=><strong style={{color:"#c9a84c",fontWeight:700}}>{children}</strong>,
                h1:({children})=><h1 style={{color:"#c9a84c",fontSize:18,margin:"10px 0 6px"}}>{children}</h1>,
                h2:({children})=><h2 style={{color:"#c9a84c",fontSize:16,margin:"10px 0 6px"}}>{children}</h2>,
                h3:({children})=><h3 style={{color:"#b8902a",fontSize:15,margin:"8px 0 4px"}}>{children}</h3>,
                ul:({children})=><ul style={{margin:"4px 0",paddingLeft:20}}>{children}</ul>,
                ol:({children})=><ol style={{margin:"4px 0",paddingLeft:20}}>{children}</ol>,
                li:({children})=><li style={{margin:"2px 0"}}>{children}</li>,
                blockquote:({children})=><blockquote style={{borderLeft:"3px solid #b8902a",paddingLeft:10,margin:"6px 0",color:"#c9a84c",fontStyle:"italic"}}>{children}</blockquote>,
                code:({children})=><code style={{background:"rgba(255,255,255,0.08)",padding:"1px 5px",borderRadius:4,fontSize:13,color:"#c9a84c"}}>{children}</code>,
                em:({children})=><em style={{color:"#b8a080"}}>{children}</em>,
              }}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {hasCitation && !isUser && <span style={{ fontSize:10, color:"#b8902a", fontFamily:"sans-serif", letterSpacing:"0.08em", marginTop:4, display:"block" }}>📖 SCRIPTURE CITED</span>}
        {isSafetyBlock && <div style={{ marginTop:5, fontSize:10, color:"#d08060", fontFamily:"sans-serif" }}>🛡 Safety filter applied</div>}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
      <Avatar />
      <div style={{ padding:"12px 18px", borderRadius:"16px 16px 16px 4px", background:"rgba(255,255,255,0.055)", border:"1px solid rgba(190,155,60,0.18)", display:"flex", gap:5, alignItems:"center" }}>
        {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#b8902a", animation:`dot 1.2s ${i*0.2}s ease-in-out infinite` }} />)}
      </div>
    </div>
  );
}

const generatePollinationsImage = (prompt, apiKey) => {
  const seed = Math.floor(Math.random() * 999999);
  let url = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&seed=${seed}&enhance=false`;
  if (apiKey) url += `&key=${apiKey}`;
  return url;
};

const generateOpenRouterText = async (messages, denomination, apiKey) => {
  if (!apiKey) throw new Error("OpenRouter API Key is missing in .env");
  
  const sysMsg = { role: "system", content: getSystemPrompt(denomination) };
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.href,
      "X-Title": "FaithGuide"
    },
    body: JSON.stringify({
      model: "openrouter/auto",
      messages: [sysMsg, ...messages.map(m => ({ role: m.role, content: m.content }))]
    })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`OpenRouter Error: ${errorData.error?.message || res.status}`);
  }
  
  const data = await res.json();
  return data.choices[0].message.content;
};

// ── IMAGE TAB ──
function ImageTab({ prompt, setPrompt, imgStyle, setImgStyle, result, loading, error, onGenerate, onToast, setError }) {
  const styleIcons = {
    renaissance_oil_painting: Paintbrush,
    Byzantine_icon_gold_background: Cross,
    watercolor_luminous: Droplets,
    stained_glass_cathedral: Church,
    illuminated_manuscript_gold_leaf: Scroll,
    pencil_sketch_detailed: PenLine,
  };

  return (
    <div style={{ padding:"24px 20px", overflowY:"auto", flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:700 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <h2 style={{ margin:0, fontFamily:"sans-serif", fontWeight:800, fontSize:24, background:"linear-gradient(135deg, #c9a84c, #f0d060)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Sacred Art Generator
          </h2>
          <p style={{ margin:"8px 0 0", fontFamily:"sans-serif", fontSize:13, color:"#6a5a40" }}>
            Describe a scene from Scripture or Christian tradition
          </p>
        </div>

        <div style={{ position:"relative", marginBottom:12, borderRadius:16, border:"1px solid rgba(190,155,60,0.6)", background:"rgba(255,255,255,0.06)", backdropFilter:"blur(20px)", padding:"4px" }}>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();onGenerate();} }}
            placeholder="e.g., The Good Shepherd at dusk, the Nativity in Bethlehem, Jesus calming the storm..."
            rows={3}
            style={{ width:"100%", padding:"10px 140px 10px 14px", borderRadius:12, boxSizing:"border-box", background:"transparent", border:"none", outline:"none", color:"#ede6d5", fontSize:14, resize:"none", fontFamily:"sans-serif", lineHeight:1.6 }}
          />
          <button onClick={onGenerate} disabled={loading || !prompt.trim()} style={{
            position:"absolute", bottom:12, right:12, height:38, padding:"0 18px", borderRadius:50,
            background: loading || !prompt.trim() ? "rgba(255,255,255,0.04)" : "linear-gradient(90deg, #b87a10, #e0b040)",
            border: "1px solid",
            borderColor: loading || !prompt.trim() ? "rgba(190,155,60,0.3)" : "transparent",
            boxShadow: loading || !prompt.trim() ? "none" : "0 0 20px rgba(224, 176, 64, 0.45), inset 0 1px 1px rgba(255,255,255,0.4)",
            cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            color: loading || !prompt.trim() ? "rgba(190,155,60,0.6)" : "#fff",
            fontFamily:"'Inter', sans-serif", fontSize:14, fontWeight:600, letterSpacing:"0.02em",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            backdropFilter: loading || !prompt.trim() ? "blur(10px)" : "none",
          }}>
            {loading ? <Loader2 size={16} strokeWidth={2.5} style={{ animation:"spin 0.8s linear infinite" }} /> : <BsStars size={18} />}
            {loading ? "Generating" : "Generate"}
          </button>
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:22 }}>
          {["The Good Shepherd carrying a lost lamb","Jesus calming the storm at sea","The Nativity in Bethlehem at night","The Last Supper","Mary holding the infant Jesus","The Resurrection at dawn"].map((p,i) => (
            <button key={i} onClick={() => setPrompt(p)} style={{ padding:"5px 13px", borderRadius:50, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(190,155,60,0.2)", color:"#7a6a52", fontSize:11, fontFamily:"sans-serif", cursor:"pointer" }}>{p}</button>
          ))}
        </div>

        <p style={{ color:"#5a4a35", fontSize:11, fontFamily:"sans-serif", margin:"0 0 10px", letterSpacing:"0.08em", textTransform:"uppercase" }}>Art Style</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:22 }}>
          {IMAGE_STYLES.map(s => {
            const Icon = styleIcons[s.id] || Paintbrush;
            return (
              <div key={s.id} onClick={() => setImgStyle(s.id)} style={{
                padding:"16px 10px", borderRadius:14, cursor:"pointer", textAlign:"center",
                background: imgStyle===s.id ? "linear-gradient(135deg, rgba(184,144,42,0.22), rgba(92,48,16,0.3))" : "rgba(255,255,255,0.03)",
                border:`1.5px solid ${imgStyle===s.id ? "rgba(190,155,60,0.55)" : "rgba(255,255,255,0.07)"}`,
                transition:"all 0.2s ease",
              }}>
                <div style={{ marginBottom:8 }}><Icon size={22} strokeWidth={1.6} color={imgStyle===s.id ? "#c9a84c" : "#5a4a38"} /></div>
                <div style={{ color:imgStyle===s.id ? "#c9a84c" : "#7a6a55", fontSize:12, fontFamily:"sans-serif", fontWeight:600, marginBottom:3 }}>{s.label}</div>
                <div style={{ color:"#7a6a52", fontSize:10, fontFamily:"sans-serif" }}>{s.desc}</div>
              </div>
            );
          })}
        </div>



        {error && (
          <div style={{ marginTop:12, padding:"10px 14px", borderRadius:10, background:"rgba(180,60,40,0.12)", border:"1px solid rgba(180,60,40,0.28)", color:"#e8907a", fontSize:13, fontFamily:"sans-serif" }}>⚠ {error}</div>
        )}

        {result && (
          <div style={{ marginTop:22, position:"relative", borderRadius:16, border:"1.5px solid rgba(190,155,60,0.25)", overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
            <img
              src={result}
              alt="AI-generated Christian art"
              onLoad={() => onToast("Sacred art ready! ✨", "success")}
              onError={() => {
                setError("Image failed to load. Try a different prompt.");
                onToast("Generation failed — try again.", "error");
              }}
              style={{ width:"100%", display:"block", minHeight:200, background:"rgba(20,15,10,0.5)" }}
            />
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"16px 14px 12px", background:"linear-gradient(to top, rgba(0,0,0,0.85), transparent)", textAlign:"center", pointerEvents:"none" }}>
              <p style={{ color:"rgba(255,255,255,0.7)", fontSize:11, fontFamily:"sans-serif", margin:0, letterSpacing:"0.02em", textShadow:"0 2px 4px rgba(0,0,0,0.8)" }}>AI-generated • For personal devotional use</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [denomination, setDenomination] = useState("protestant");
  const [messages, setMessages] = useState([{
    role:"assistant",
    content:"Peace be with you! I'm FaithGuide, your Christian AI companion.\n\nI'm here to help you explore Scripture, theology, prayer, and Christian living. I'm currently tuned to the Protestant/Evangelical tradition — change it above anytime.\n\nWhat's on your heart today?",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("chat");
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgStyle, setImgStyle] = useState("renaissance_oil_painting");
  const [imgResult, setImgResult] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState(null);
  const [showDenom, setShowDenom] = useState(false);
  const [toasts, setToasts] = useState([]);
  const denomRef = useRef(null);
  const bottomRef = useRef(null);

  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    if (!isSafeMessage(content)) {
      setMessages(prev => [...prev,
        { role:"user", content },
        { role:"assistant", content:"I noticed this request asks me to alter or rewrite Scripture to fit a specific agenda — that's something I can't do, as the integrity of God's Word matters deeply to me.\n\nI'd love to help you explore what the Bible actually teaches on this topic instead.", safety:true },
      ]);
      setInput("");
      return;
    }

    const userMsg = { role:"user", content };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    try {
      const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      
      const reply = await generateOpenRouterText(allMessages, denomination, openRouterKey);
      if (reply) {
        setMessages(prev => [...prev, { role:"assistant", content:reply }]);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch(err) {
      addToast(`AI Error: ${err.message}`, "error");
      setMessages(prev => [...prev, { role:"assistant", content:"⚠️ Could not reach AI. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!imgPrompt.trim() || imgLoading) return;

    if (!isImageSafe(imgPrompt)) {
      addToast("This prompt doesn't align with Christian values.", "error");
      return;
    }

    setImgLoading(true);
    setImgError(null);
    setImgResult(null);
    addToast("Generating sacred art... ✨", "info");

    const apiKey = import.meta.env.VITE_POLLINATIONS_API_KEY || "";
    const fullPrompt = `Christian sacred religious artwork, ${imgPrompt}, ${imgStyle.replace(/_/g," ")}, highly detailed, divine lighting, masterpiece, reverent, beautiful`;
    
    const url = generatePollinationsImage(fullPrompt, apiKey);

    setImgResult(url);
    setImgLoading(false);
  };

  const changeDenom = (id) => {
    setDenomination(id);
    setShowDenom(false);
    const label = DENOMINATIONS.find(d => d.id === id)?.label;
    addToast(`Switched to ${label} tradition`, "success");
    setMessages([{ role:"assistant", content:`I've updated my perspective to the ${label} tradition.\n\nHow can I serve you today?` }]);
  };

  useEffect(() => {
    const handler = (e) => { if (denomRef.current && !denomRef.current.contains(e.target)) setShowDenom(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"#000", fontFamily:"Georgia, serif", overflow:"hidden" }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInToastRight { from{opacity:0;transform:translateX(30px) scale(0.95)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes dot { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(190,155,60,0.18);border-radius:2px}
        textarea{outline:none!important}
      `}</style>

      {/* HEADER */}
      <header style={{ padding:"12px 18px", flexShrink:0, zIndex:10, borderBottom:"1px solid rgba(190,155,60,0.1)", background:"transparent", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(145deg, #7a5010, #c9a84c)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, color:"#fdecc8", boxShadow:"0 4px 18px rgba(184,144,42,0.35)" }}>✝</div>
          <div>
            <div style={{ fontFamily:"sans-serif", color:"#c9a84c", fontSize:19, fontWeight:700, lineHeight:1 }}>FaithGuide</div>
            <div style={{ color:"#5a4a32", fontSize:10, fontFamily:"sans-serif", letterSpacing:"0.07em" }}>Christian AI Assistant</div>
          </div>
        </div>
        <div ref={denomRef} style={{ position:"relative" }}>
          <button onClick={() => setShowDenom(v=>!v)} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px", background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(190,155,60,0.22)", borderRadius:50, color:"#c9a84c", fontSize:12, fontFamily:"sans-serif", fontWeight:500, cursor:"pointer", whiteSpace:"nowrap" }}>
            {DENOMINATIONS.find(d=>d.id===denomination)?.label}
            <ChevronDown size={13} strokeWidth={2} style={{ transition:"transform 0.2s", transform:showDenom?"rotate(180deg)":"rotate(0deg)" }} />
          </button>
          {showDenom && (
            <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, minWidth:220, background:"rgba(12,14,22,0.97)", border:"1.5px solid rgba(190,155,60,0.28)", borderRadius:14, backdropFilter:"blur(20px)", boxShadow:"0 8px 32px rgba(0,0,0,0.5)", overflow:"hidden", zIndex:100, animation:"fadeIn 0.15s ease" }}>
              {DENOMINATIONS.map((d,i) => (
                <div key={d.id} onClick={() => changeDenom(d.id)} style={{ padding:"10px 16px", cursor:"pointer", background:denomination===d.id?"rgba(190,155,60,0.12)":"transparent", borderBottom:i<DENOMINATIONS.length-1?"1px solid rgba(190,155,60,0.08)":"none", color:denomination===d.id?"#c9a84c":"#7a6a52", fontSize:13, fontFamily:"sans-serif", fontWeight:denomination===d.id?600:400 }}>
                  {d.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <div style={{ position:"relative", flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* FLOATING TABS */}
        <div style={{ position:"absolute", top:12, left:0, right:0, display:"flex", justifyContent:"center", zIndex:20, pointerEvents:"none" }}>
          <div style={{ display:"flex", position:"relative", background:"rgba(8,10,16,0.75)", border:"1px solid rgba(190,155,60,0.22)", borderRadius:50, padding:"3px", gap:2, backdropFilter:"blur(16px)", boxShadow:"0 4px 20px rgba(0,0,0,0.4)", pointerEvents:"all" }}>
            <div style={{ position:"absolute", top:3, left:tab==="chat"?3:"calc(50% + 1px)", width:"calc(50% - 4px)", bottom:3, background:"linear-gradient(135deg, rgba(184,144,42,0.25), rgba(92,48,16,0.32))", border:"1px solid rgba(190,155,60,0.4)", borderRadius:50, transition:"left 0.3s cubic-bezier(0.4,0,0.2,1)", pointerEvents:"none" }} />
            {[{ id:"chat", label:"Ask", icon:MessageSquare },{ id:"image", label:"Image", icon:ImageIcon }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:"6px 18px", background:"transparent", border:"none", borderRadius:50, color:tab===t.id?"#c9a84c":"#5a4a35", cursor:"pointer", fontSize:12, fontWeight:tab===t.id?600:400, display:"flex", alignItems:"center", gap:6, position:"relative", zIndex:1, fontFamily:"sans-serif", whiteSpace:"nowrap" }}>
                <t.icon size={13} strokeWidth={tab===t.id?2.2:1.8} />{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* CHAT TAB */}
        {tab==="chat" && (
          <>
            <div style={{ flex:1, overflowY:"auto", padding:"60px 14px 180px" }}>
              {messages.length===1 && (
                <div style={{ marginBottom:14 }}>
                  <p style={{ color:"#4a3a28", fontSize:11, fontFamily:"sans-serif", margin:"0 0 7px", letterSpacing:"0.07em" }}>QUICK START</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {QUICK_PROMPTS.map((p,i) => (
                      <button key={i} onClick={() => sendMessage(p)} style={{ padding:"5px 11px", borderRadius:20, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(190,155,60,0.18)", color:"#7a6a50", fontSize:12, cursor:"pointer", fontFamily:"sans-serif" }}>{p}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg,i) => <MessageBubble key={i} msg={msg} />)}
              {loading && <TypingDots />}
              <div ref={bottomRef} style={{ height:16 }} />
            </div>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"10px 20px 14px", zIndex:15 }}>
              <div style={{ maxWidth:900, margin:"0 auto" }}>
                <div style={{ position:"relative", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(190,155,60,0.6)", borderRadius:16, padding:"10px 60px 10px 14px", backdropFilter:"blur(20px)" }}>
                  <textarea
                    value={input} onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();} }}
                    placeholder="Ask about Scripture, theology, prayer..."
                    rows={3}
                    style={{ width:"100%", padding:0, background:"transparent", border:"none", color:"#ede6d5", fontSize:14, resize:"none", fontFamily:"sans-serif", lineHeight:1.4, outline:"none", boxSizing:"border-box" }}
                  />
                  <button onClick={() => sendMessage()} disabled={loading||!input.trim()} style={{
                    position:"absolute", bottom:8, right:8, width:38, height:38, borderRadius:"50%",
                    background: loading||!input.trim() ? "rgba(40,35,30,0.7)" : "linear-gradient(135deg, #b8680a, #f0c040)",
                    border: loading||!input.trim() ? "1.5px solid rgba(190,155,60,0.3)" : "1.5px solid rgba(255,200,80,0.5)",
                    cursor: loading||!input.trim() ? "default" : "pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <ArrowUp size={17} strokeWidth={2.5} color={loading||!input.trim() ? "rgba(190,155,60,0.45)" : "#fff"} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* IMAGE TAB */}
        {tab==="image" && (
          <div style={{ flex:1, overflowY:"auto", paddingTop:52 }}>
            <ImageTab
              prompt={imgPrompt} setPrompt={setImgPrompt}
              imgStyle={imgStyle} setImgStyle={setImgStyle}
              result={imgResult} loading={imgLoading}
              error={imgError} onGenerate={generateImage}
              onToast={addToast} setError={setImgError}
            />
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}