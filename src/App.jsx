import React, { useMemo, useState } from "react";

const chapterVerseCounts = [33,22,35,27,23,35,27,36,18,32,31,28,25,35,33,33,28,24,29,30,31,29,35,34,28,28,27,28,27,33,31];

const themesEs = [
  "Sabiduría y temor del Señor","Discernimiento y protección","Confianza y dirección divina","Guarda el corazón","Pureza, fidelidad y prudencia","Diligencia y responsabilidad","Advertencia contra la seducción","La sabiduría llama públicamente","Dos caminos: sabiduría o necedad","Contrastes de vida justa","Integridad, justicia y lengua","Disciplina y fruto del justo","Prudencia, consejo y dominio propio","El camino del sabio","Respuesta suave y humildad","Planes humanos y soberanía divina","Carácter probado y relaciones","Palabras, amistad y prudencia","Sabiduría doméstica y justicia","Vino, trabajo y discernimiento","Corazón del rey y justicia práctica","Buen nombre, generosidad y formación","Consejos de sabiduría aplicada","No envidiar al malvado","Sabiduría ante reyes y conflictos","Necedad, pereza y palabras","Mañana incierto y amistad fiel","Justicia, liderazgo y confianza","Corrección, visión y temor de Dios","Palabras de Agur: humildad y reverencia","Palabras de Lemuel: liderazgo y mujer virtuosa"
];

const themesEn = [
  "Wisdom and the fear of the Lord","Discernment and protection","Trust and divine direction","Guard your heart","Purity, fidelity, and prudence","Diligence and responsibility","Warning against seduction","Wisdom calls aloud","Two ways: wisdom or folly","Contrasts of righteous living","Integrity, justice, and speech","Discipline and the fruit of the righteous","Prudence, counsel, and self-control","The path of the wise","A gentle answer and humility","Human plans and divine sovereignty","Tested character and relationships","Words, friendship, and prudence","Household wisdom and justice","Wine, work, and discernment","The king's heart and practical justice","A good name, generosity, and training","Applied wisdom","Do not envy the wicked","Wisdom before kings and conflicts","Folly, laziness, and words","An uncertain tomorrow and faithful friendship","Justice, leadership, and trust","Correction, vision, and the fear of God","The words of Agur: humility and reverence","The words of Lemuel: leadership and the virtuous woman"
];

const themeFilters = [
  { id: "all", es: "Todos", en: "All", icon: "✦", chapters: [] },
  { id: "wisdom", es: "Sabiduría", en: "Wisdom", icon: "🌳", chapters: [1,2,8,9,14,23,24] },
  { id: "heart", es: "Corazón", en: "Heart", icon: "♥", chapters: [3,4,12,16,17,19,28] },
  { id: "family", es: "Familia", en: "Family", icon: "👥", chapters: [5,6,7,13,22,31] },
  { id: "leadership", es: "Liderazgo", en: "Leadership", icon: "♛", chapters: [10,11,15,20,21,25,29] },
  { id: "words", es: "Palabras", en: "Words", icon: "💬", chapters: [18,26,27,30] }
];

const versesEs = {
  "1:1":"Los proverbios de Salomón, hijo de David, rey de Israel.",
  "1:2":"Para entender sabiduría y doctrina; para conocer las razones prudentes.",
  "1:7":"El principio de la sabiduría es el temor de Jehová: los insensatos desprecian la sabiduría y la enseñanza.",
  "3:1":"Hijo mío, no te olvides de mi ley; y tu corazón guarde mis mandamientos.",
  "3:5":"Fíate de Jehová de todo tu corazón, y no estribes en tu prudencia.",
  "4:23":"Sobre toda cosa guardada guarda tu corazón; porque de él mana la vida.",
  "9:10":"El temor de Jehová es el principio de la sabiduría; y la ciencia de los santos es inteligencia.",
  "31:10":"Mujer fuerte, ¿quién la hallará? Porque su estima sobrepuja largamente á la de piedras preciosas."
};

const versesEn = {
  "1:1":"The proverbs of Solomon, the son of David, king of Israel:",
  "1:2":"to know wisdom and instruction; to discern the words of understanding;",
  "1:7":"The fear of Yahweh is the beginning of knowledge; but the foolish despise wisdom and instruction.",
  "3:1":"My son, don't forget my teaching; but let your heart keep my commandments:",
  "3:5":"Trust in Yahweh with all your heart, and don't lean on your own understanding.",
  "4:23":"Keep your heart with all diligence, for out of it is the wellspring of life.",
  "9:10":"The fear of Yahweh is the beginning of wisdom. The knowledge of the Holy One is understanding.",
  "31:10":"Who can find a worthy woman? For her price is far above rubies."
};

const meditationsEs = {
  "1:1":"La sabiduría bíblica comienza con una vida formada por Dios. Proverbios ordena la mente, el corazón y las decisiones bajo la dirección del Señor.",
  "1:2":"Dios no nos llama a vivir por impulso. La sabiduría entrena el corazón para distinguir entre lo útil, lo correcto y lo eterno.",
  "1:7":"El temor del Señor no es miedo vacío, sino reverencia obediente. La vida se ordena cuando Dios ocupa el centro.",
  "3:1":"La memoria espiritual protege el corazón. Guardar la Palabra no es solo recordar, sino vivir bajo su dirección.",
  "3:5":"Confía en Dios aun cuando no veas todo el camino. La sabiduría comienza cuando descansas en su dirección.",
  "4:23":"El corazón dirige la vida interior. Guardarlo implica vigilar pensamientos, afectos, decisiones y motivaciones.",
  "9:10":"La verdadera inteligencia nace de conocer a Dios. La sabiduría bíblica une reverencia, obediencia y discernimiento.",
  "31:10":"La virtud, el carácter y la fidelidad delante de Dios valen más que cualquier apariencia externa."
};

const meditationsEn = {
  "1:1":"Biblical wisdom begins with a life shaped by God. Proverbs orders the mind, heart, and daily decisions under the Lord's direction.",
  "1:2":"God does not call us to live impulsively. Wisdom trains the heart to discern what is useful, right, and eternal.",
  "1:7":"The fear of the Lord is not empty fear but reverent obedience. Life becomes ordered when God is at the center.",
  "3:1":"Spiritual memory protects the heart. Keeping the Word means more than remembering; it means living under its direction.",
  "3:5":"Trust God even when you cannot see the whole road. Wisdom begins when you rest in his direction.",
  "4:23":"The heart directs the inner life. Guarding it means watching thoughts, affections, decisions, and motivations.",
  "9:10":"True understanding begins with knowing God. Biblical wisdom joins reverence, obedience, and discernment.",
  "31:10":"Virtue, character, and faithfulness before God are worth more than any external appearance."
};

function t(lang, es, en) { return lang === "en" ? en : es; }
function clampChapter(chapter) { return Math.min(Math.max(Number(chapter) || 1, 1), 31); }
function getTheme(chapter, lang) { const i = clampChapter(chapter) - 1; return lang === "en" ? themesEn[i] : themesEs[i]; }
function getVerseText(key, chapter, verse, lang) { return lang === "en" ? (versesEn[key] || "Bible text pending integration from WEB public-domain JSON/CSV.") : (versesEs[key] || "Texto bíblico pendiente de integrar desde JSON/CSV RVR1909 de dominio público."); }
function getMeditation(key, chapter, verse, lang, edits) { if (edits[key]) return edits[key]; return lang === "en" ? (meditationsEn[key] || `Guided meditation: Proverbs ${chapter}:${verse} invites us to examine the heart, receive counsel, and ask God for wisdom for daily life.`) : (meditationsEs[key] || `Meditación guía: Proverbios ${chapter}:${verse} invita a examinar el corazón, recibir consejo y pedir sabiduría para la vida diaria.`); }

function buildVerses(chapter, lang, edits) {
  const safe = clampChapter(chapter);
  const count = chapterVerseCounts[safe - 1];
  return Array.from({ length: count }, (_, i) => {
    const verse = i + 1;
    const key = `${safe}:${verse}`;
    return { key, chapter: safe, verse, reference: lang === "en" ? `Proverbs ${safe}:${verse}` : `Proverbios ${safe}:${verse}`, text: getVerseText(key, safe, verse, lang), meditation: getMeditation(key, safe, verse, lang, edits), theme: getTheme(safe, lang), isSample: Boolean(versesEs[key] || versesEn[key]) };
  });
}

function buildIndex(lang, edits) {
  return chapterVerseCounts.flatMap((count, c) => Array.from({ length: count }, (_, v) => {
    const chapter = c + 1;
    const verse = v + 1;
    const key = `${chapter}:${verse}`;
    return { key, chapter, verse, reference: lang === "en" ? `Proverbs ${chapter}:${verse}` : `Proverbios ${chapter}:${verse}`, text: getVerseText(key, chapter, verse, lang), meditation: getMeditation(key, chapter, verse, lang, edits), theme: getTheme(chapter, lang), isSample: Boolean(versesEs[key] || versesEn[key]) };
  }));
}

function getVerseOfDay(index) {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const day = Math.floor((today - start) / 86400000);
  return index[day % index.length] || index[0];
}

function runSmokeTests() {
  const total = chapterVerseCounts.reduce((sum, count) => sum + count, 0);
  if (chapterVerseCounts.length !== 31) throw new Error("Proverbios debe tener 31 capítulos.");
  if (total !== 915) throw new Error(`Proverbios debe tener 915 versículos; recibido: ${total}.`);
  if (buildVerses(1, "es", {}).length !== 33) throw new Error("Proverbios 1 debe tener 33 versículos.");
  if (clampChapter(100) !== 31) throw new Error("Capítulo fuera de rango debe limitarse a 31.");
  if (!getVerseText("3:5", 3, 5, "en").includes("Trust")) throw new Error("El modo inglés no está cargando WEB.");
}
runSmokeTests();

function MetricCard({ icon, label, value, note, className }) {
  return <article className={`metric-card ${className}`}><div className="metric-orb">{icon}</div><div><p className="metric-label">{label}</p><p className="metric-value">{value}</p><p className="metric-note">{note}</p></div><span className="metric-watermark">{icon}</span></article>;
}

export default function App() {
  const [lang, setLang] = useState("es");
  const [themeMode, setThemeMode] = useState("light");
  const [activeTab, setActiveTab] = useState("inicio");
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [selectedVerseKey, setSelectedVerseKey] = useState("3:5");
  const [themeFilter, setThemeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [completed, setCompleted] = useState({ "1:1": true, "1:2": true, "1:7": true, "3:1": true, "3:5": true });
  const [edits, setEdits] = useState({});
  const [editMode, setEditMode] = useState(false);

  const isDark = themeMode === "dark";
  const totalVerses = chapterVerseCounts.reduce((sum, count) => sum + count, 0);
  const readCount = Object.values(completed).filter(Boolean).length + 123;
  const progress = 42;

  const index = useMemo(() => buildIndex(lang, edits), [lang, edits]);
  const verseOfDay = useMemo(() => getVerseOfDay(index), [index]);
  const chapterVerses = useMemo(() => buildVerses(selectedChapter, lang, edits), [selectedChapter, lang, edits]);
  const selectedTheme = themeFilters.find((item) => item.id === themeFilter) || themeFilters[0];
  const allowedChapters = selectedTheme.id === "all" ? chapterVerseCounts.map((_, i) => i + 1) : selectedTheme.chapters;
  const selectedVerse = useMemo(() => index.find((item) => item.key === selectedVerseKey) || chapterVerses[0] || verseOfDay, [index, selectedVerseKey, chapterVerses, verseOfDay]);

  const visibleVerses = useMemo(() => {
    const base = index.filter((item) => allowedChapters.includes(item.chapter));
    const q = query.trim().toLowerCase();
    if (q) return base.filter((item) => item.reference.toLowerCase().includes(q) || item.text.toLowerCase().includes(q) || item.meditation.toLowerCase().includes(q) || item.theme.toLowerCase().includes(q)).slice(0, 16);
    return chapterVerses.filter((item) => allowedChapters.includes(item.chapter));
  }, [index, query, chapterVerses, allowedChapters]);

  function selectChapter(chapter) { const safe = clampChapter(chapter); setSelectedChapter(safe); setSelectedVerseKey(`${safe}:1`); setActiveTab("lectura"); }
  function selectVerse(item) { setSelectedChapter(item.chapter); setSelectedVerseKey(item.key); setActiveTab("devocional"); setQuery(""); }
  function updateThemeFilter(value) { setThemeFilter(value); const selected = themeFilters.find((item) => item.id === value); if (selected && selected.chapters.length) selectChapter(selected.chapters[0]); }

  async function copyDevotional(item = selectedVerse) {
    if (!item) return;
    const version = lang === "en" ? "WEB" : "RVR1909";
    const content = `${item.reference}\n${version}\n\n${item.text}\n\n${t(lang, "Meditación", "Meditation")}:\n${item.meditation}\n\nBy ReneBook`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) await navigator.clipboard.writeText(content);
      else console.log(content);
    } catch { console.log(content); }
  }

  const tabs = [
    { id: "inicio", label: t(lang, "Inicio", "Home"), icon: "▦" },
    { id: "lectura", label: t(lang, "Lectura", "Reading"), icon: "📖" },
    { id: "devocional", label: t(lang, "Devocional", "Devotional"), icon: "♡" },
    { id: "datos", label: t(lang, "Datos", "Data"), icon: "▥" }
  ];

  return <div className={`app ${isDark ? "dark" : "light"}`}>
    <aside className="sidebar">
      <div className="logo-mark">📖</div><div className="brand-script">ReneBook</div>
      <h1>{t(lang, "Proverbios", "Proverbs")}</h1><p className="brand-subtitle">{t(lang, "Sabiduría diaria", "Daily wisdom")}</p>
      <nav className="side-nav">{[["🏠",t(lang,"Inicio","Home"),"inicio"],["📖",t(lang,"Capítulos","Chapters"),"lectura"],["🏷️",t(lang,"Temas","Themes"),"lectura"],["☀️",t(lang,"Versículo del día","Verse of the day"),"inicio"],["♡",t(lang,"Favoritos","Favorites"),"devocional"],["⚙️",t(lang,"Configuración","Settings"),"datos"]].map(([icon,label,target])=><button key={label} onClick={()=>setActiveTab(target)} className={activeTab===target?"active":""}><span>{icon}</span>{label}</button>)}</nav>
      <div className="theme-box"><p>{t(lang,"Tema","Theme")}</p><button className={themeMode==="light"?"selected":""} onClick={()=>setThemeMode("light")}>☀️ {t(lang,"Claro","Light")}</button><button className={themeMode==="dark"?"selected":""} onClick={()=>setThemeMode("dark")}>🌙 {t(lang,"Oscuro","Dark")}</button></div>
      <div className="signature">By ReneBook</div>
    </aside>

    <main className="main">
      <header className="hero panel"><div><p className="eyebrow">{t(lang,"APLICACIÓN PREMIUM","PREMIUM APP")}</p><h2>{t(lang,"Proverbios para la vida diaria","Proverbs for Everyday Life")}</h2><p className="hero-subtitle">{t(lang,"Lectura bíblica de dominio público, meditación breve y progreso diario.","Public-domain Bible reading, short meditation, and daily progress.")}</p></div>
        <div className="hero-actions"><div className="language-toggle"><button onClick={()=>setLang("es")} className={lang==="es"?"active":""}>Español</button><button onClick={()=>setLang("en")} className={lang==="en"?"active":""}>English</button></div><button onClick={()=>setEditMode(!editMode)} className="primary-btn">{editMode?t(lang,"Guardar","Save"):t(lang,"Editar","Edit")}</button><button onClick={()=>copyDevotional()} className="outline-btn">⧉ {t(lang,"Copiar","Copy")}</button></div>
        <div className="top-tabs">{tabs.map((tab)=><button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={activeTab===tab.id?"active":""}><span>{tab.icon}</span>{tab.label}</button>)}</div>
      </header>

      {(activeTab==="inicio"||activeTab==="datos")&&<section className="metrics-grid"><MetricCard icon="📖" label={t(lang,"Capítulos","Chapters")} value="31" note={t(lang,"Libro completo","Complete book")} className="blue"/><MetricCard icon="📜" label={t(lang,"Versículos","Verses")} value={totalVerses} note={t(lang,"Estructura total","Full structure")} className="teal"/><MetricCard icon="✅" label={t(lang,"Leídos","Read")} value={readCount} note={`${progress}% ${t(lang,"completado","completed")}`} className="purple"/><MetricCard icon="🌐" label={t(lang,"Idioma","Language")} value={lang==="es"?"Español":"English"} note={lang==="es"?"RVR1909":"WEB"} className="gold"/></section>}

      <section className="content-grid">
        {(activeTab==="inicio"||activeTab==="devocional")&&<article className="verse-card panel"><div className="section-title"><span className="round-icon blue-icon">☀️</span><div><p className="eyebrow">{t(lang,"Versículo del día","Verse of the day")}</p><h3>{verseOfDay.reference}</h3></div></div><blockquote>“{verseOfDay.text}”</blockquote><p className="meditation">{verseOfDay.meditation}</p><button onClick={()=>selectVerse(verseOfDay)} className="glow-btn">📖 {t(lang,"Abrir","Open")} →</button></article>}

        {(activeTab==="inicio"||activeTab==="lectura")&&<article className="reader-card panel"><div className="section-title"><span className="round-icon teal-icon">📖</span><div><p className="eyebrow">{t(lang,"Lectura del capítulo","Chapter reading")}</p><h3>{t(lang,"Capítulo","Chapter")} {selectedChapter}</h3><p>{getTheme(selectedChapter,lang)}</p></div></div><div className="reader-tools"><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={t(lang,"Buscar: Proverbios 3:5, corazón...","Search: Proverbs 3:5, heart...")}/><select value={selectedChapter} onChange={(e)=>selectChapter(Number(e.target.value))}>{allowedChapters.map((chapter)=><option key={chapter} value={chapter}>{t(lang,"Capítulo","Chapter")} {chapter}</option>)}</select></div><div className="verse-list">{visibleVerses.slice(0,6).map((item)=><button key={item.key} onClick={()=>selectVerse(item)} className={selectedVerseKey===item.key?"selected":""}><span>{item.chapter}:{item.verse}</span><div><strong>{item.reference}</strong><small>{item.text}</small></div><em>›</em></button>)}</div></article>}

        {(activeTab==="inicio"||activeTab==="lectura")&&<aside className="right-stack"><article className="theme-card panel"><div className="section-title"><span className="round-icon purple-icon">🏷️</span><div><p className="eyebrow">{t(lang,"Filtro por tema","Theme filter")}</p><h3>{t(lang,"Temas","Themes")}</h3></div></div><div className="theme-pills">{themeFilters.slice(1).map((filter)=><button key={filter.id} onClick={()=>updateThemeFilter(themeFilter===filter.id?"all":filter.id)} className={themeFilter===filter.id?`active ${filter.id}`:filter.id}><span>{filter.icon}</span>{lang==="en"?filter.en:filter.es}<em>›</em></button>)}</div></article><article className="progress-card panel"><div className="section-title"><span className="round-icon teal-icon">📅</span><div><p className="eyebrow">{t(lang,"Plan de 31 días","31-day plan")}</p><h3>{t(lang,"Día 13 completado","Day 13 completed")}</h3></div></div><div className="progress-row"><div className="progress-bar"><span/></div><strong>42%</strong></div><p>{t(lang,"Sigue avanzando en tu camino de sabiduría.","Keep moving forward on your path of wisdom.")}</p></article></aside>}
      </section>

      {(activeTab==="inicio"||activeTab==="devocional")&&<section className="devotional-grid"><article className="devotional-card panel"><div className="section-title"><span className="round-icon blue-icon">✨</span><div><p className="eyebrow">{t(lang,"Devocional seleccionado","Selected devotional")}</p><h3>{selectedVerse?.reference}</h3><p>{lang==="en"?"WEB":"RVR1909"}</p></div></div><div className="text-box"><p className="eyebrow">{t(lang,"Texto bíblico","Bible text")}</p><h4>{selectedVerse?.text}</h4></div><div className="text-box"><p className="eyebrow">{t(lang,"Meditación","Meditation")}</p>{editMode?<textarea value={selectedVerse?.meditation||""} onChange={(e)=>setEdits((prev)=>({...prev,[selectedVerse.key]:e.target.value}))}/>:<p>{selectedVerse?.meditation}</p>}</div><div className="action-row"><button onClick={()=>setEditMode(!editMode)} className="primary-btn">{editMode?t(lang,"Guardar edición","Save edit"):t(lang,"Editar meditación","Edit meditation")}</button><button onClick={()=>setCompleted((prev)=>({...prev,[selectedVerse.key]:!prev[selectedVerse.key]}))} className="outline-btn">{completed[selectedVerse?.key]?t(lang,"Completado","Completed"):t(lang,"Marcar leído","Mark as read")}</button><button onClick={()=>copyDevotional()} className="outline-btn">{t(lang,"Copiar","Copy")}</button></div><div className="signature dark-signature">By ReneBook</div></article><article className="language-card panel"><span className="round-icon blue-icon">🌐</span><p className="eyebrow">{t(lang,"Cambiar idioma","Change language")}</p><h3>{lang==="es"?"Cambiar al inglés":"Change to Spanish"}</h3><p>{t(lang,"Explora Proverbios en otro idioma y enriquece tu estudio devocional.","Explore Proverbs in another language and enrich your devotional study.")}</p><button onClick={()=>setLang(lang==="es"?"en":"es")} className="glow-btn">{lang==="es"?"Cambiar a English":"Change to Español"} →</button></article></section>}

      {activeTab==="datos"&&<section className="panel data-panel"><h3>{t(lang,"Formato de datos recomendado","Recommended data format")}</h3><p>{t(lang,"Carga Proverbios completo desde JSON o CSV usando RVR1909 y WEB.","Load the full book of Proverbs from JSON or CSV using RVR1909 and WEB.")}</p><pre>{`{
  "app": "ReneBook — Proverbios",
  "versions": ["RVR1909", "WEB"],
  "license": "Public Domain",
  "default_language": "es",
  "signature": "By ReneBook",
  "logo": "/assets/renebook-logo.png",
  "verses": [{
    "chapter": 3,
    "verse": 5,
    "reference_es": "Proverbios 3:5",
    "reference_en": "Proverbs 3:5",
    "text_es": "Fíate de Jehová de todo tu corazón...",
    "text_en": "Trust in Yahweh with all your heart..."
  }]
}`}</pre></section>}
    </main>
  </div>;
}
