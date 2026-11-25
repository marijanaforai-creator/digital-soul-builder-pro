import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Copy,
  Download,
  Eye,
  FilePlus2,
  FolderOpen,
  ImagePlus,
  Layers,
  Monitor,
  Pencil,
  Plus,
  Redo2,
  Save,
  Search,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
  Upload
} from "lucide-react";
import {
  BLOCK_CATEGORIES,
  BLOCK_DEFINITIONS,
  createBlock,
  createInitialProject,
  nextId
} from "./data/blocksAndPages";

const MAX_HISTORY = 40;
const DB_NAME = "digital-soul-editor-storage";
const STORE_NAME = "drafts";
const PROJECT_KEY = "digital-soul-unified-project-v1";
const LEGACY_KEY = "digital-soul-editor-draft-v2";
const LOCAL_FALLBACK_KEY = "digital-soul-editor-draft";

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB nije dostupan u ovom pregledaču."));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Greška pri otvaranju baze."));
  });
}

async function loadProjectFromStorage(fallbackFactory) {
  try {
    const db = await openDB();
    const record = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const getMain = store.get(PROJECT_KEY);
      getMain.onsuccess = () => {
        if (getMain.result) {
          db.close();
          resolve({ project: getMain.result });
          return;
        }
        const getLegacy = store.get(LEGACY_KEY);
        getLegacy.onsuccess = () => {
          db.close();
          resolve({ legacy: getLegacy.result || null });
        };
        getLegacy.onerror = () => {
          db.close();
          reject(getLegacy.error);
        };
      };
      getMain.onerror = () => {
        db.close();
        reject(getMain.error);
      };
    });

    if (record?.project && Array.isArray(record.project.pages) && record.project.pages.length > 0) {
      return { project: record.project, statusText: "Učitan sačuvani projekat" };
    }
  } catch {
    // Fallback na localStorage ispod
  }

  try {
    const raw = localStorage.getItem(PROJECT_KEY) || localStorage.getItem(LOCAL_FALLBACK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
        return { project: parsed, statusText: "Učitan lokalni projekat" };
      }
    }
  } catch {
    // Ignorišemo neispravan JSON
  }

  return { project: fallbackFactory(), statusText: "Novi projekat" };
}

async function saveProjectToStorage(project) {
  let savedToIDB = false;
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(project, PROJECT_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error || new Error("Greška pri čuvanju u IndexedDB."));
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error || new Error("Čuvanje je prekinuto."));
      };
    });
    savedToIDB = true;
  } catch (err) {
    try {
      localStorage.setItem(PROJECT_KEY, JSON.stringify(project));
      return { storageType: "localStorage", warning: err?.message || "" };
    } catch {
      throw new Error("Nije moguće sačuvati projekat. Proveri slobodan prostor u pregledaču.");
    }
  }

  try {
    localStorage.setItem(PROJECT_KEY, JSON.stringify(project));
  } catch {
    // IndexedDB je već sačuvao projekat
  }

  return { storageType: savedToIDB ? "IndexedDB" : "localStorage" };
}

export default function App() {
  const initialProject = useMemo(() => createInitialProject(), []);
  const [project, setProject] = useState(initialProject);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(() => JSON.stringify(initialProject));
  const [history, setHistory] = useState({ past: [], future: [] });

  const [leftTab, setLeftTab] = useState("pages");
  const [categoryFilter, setCategoryFilter] = useState("Sve");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedBlockId, setSelectedBlockId] = useState(() => initialProject.pages[0]?.blocks[1]?.id || null);
  const [editingMode, setEditingMode] = useState(true);
  const [device, setDevice] = useState("desktop");

  const [status, setStatus] = useState("Novi projekat");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [newPageTitle, setNewPageTitle] = useState("");
  const [renamingPageId, setRenamingPageId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const mediaInputRef = useRef(null);
  const importInputRef = useRef(null);
  const hasHydratedRef = useRef(false);

  const activePage = useMemo(() => {
    return project.pages.find((p) => p.id === project.activePageId) || project.pages[0];
  }, [project]);

  const selectedBlock = useMemo(() => {
    if (!activePage || !selectedBlockId) return null;
    return activePage.blocks.find((b) => b.id === selectedBlockId) || null;
  }, [activePage, selectedBlockId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const loaded = await loadProjectFromStorage(createInitialProject);
        if (!alive) return;
        setProject(loaded.project);
        setLastSavedSnapshot(JSON.stringify(loaded.project));
        setStatus(loaded.statusText);
        const firstPage = loaded.project.pages.find((p) => p.id === loaded.project.activePageId) || loaded.project.pages[0];
        setSelectedBlockId(firstPage?.blocks?.[0]?.id || null);
      } catch (err) {
        if (alive) setError(err?.message || "Nije moguće učitati sačuvani projekat.");
      } finally {
        if (alive) hasHydratedRef.current = true;
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const commitProject = (updater, statusMsg = "Nesačuvane izmene") => {
    setError("");
    setNotice("");
    setProject((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      setHistory((h) => ({
        past: [...h.past.slice(-(MAX_HISTORY - 1)), prev],
        future: []
      }));
      setStatus(statusMsg);
      return next;
    });
  };

  const handleUndo = () => {
    setError("");
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      const remainingPast = h.past.slice(0, -1);
      setProject((current) => {
        setHistory({
          past: remainingPast,
          future: [current, ...h.future]
        });
        return previous;
      });
      setStatus("Vraćeno (Undo)");
      return { past: remainingPast, future: h.future };
    });
  };

  const handleRedo = () => {
    setError("");
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const nextProj = h.future[0];
      const remainingFuture = h.future.slice(1);
      setProject((current) => {
        setHistory({
          past: [...h.past, current],
          future: remainingFuture
        });
        return nextProj;
      });
      setStatus("Ponovljeno (Redo)");
      return { past: [...h.past, project], future: remainingFuture };
    });
  };

  const persistNow = async (projToSave, isAuto = false) => {
    setIsSaving(true);
    try {
      const res = await saveProjectToStorage(projToSave);
      setLastSavedSnapshot(JSON.stringify(projToSave));
      setStatus(isAuto ? "Automatski sačuvano" : `Sačuvano (${res.storageType})`);
      if (!isAuto) {
        setNotice("Projekat, stranice i blokovi su bezbedno sačuvani na ovom uređaju.");
      }
    } catch (err) {
      setStatus("Greška pri čuvanju");
      setError(err?.message || "Čuvanje nije uspelo.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    const currentSnap = JSON.stringify(project);
    if (currentSnap === lastSavedSnapshot) return;
    const timer = setTimeout(() => {
      persistNow(project, true);
    }, 900);
    return () => clearTimeout(timer);
  }, [project, lastSavedSnapshot]);

  const selectPage = (pageId) => {
    const target = project.pages.find((p) => p.id === pageId);
    if (!target) return;
    setProject((prev) => ({ ...prev, activePageId: pageId }));
    setSelectedBlockId(target.blocks[0]?.id || null);
    setError("");
  };

  const addPage = (e) => {
    e?.preventDefault();
    const title = (newPageTitle || "").trim() || `Nova stranica ${project.pages.length + 1}`;
    const slugBase = title
      .toLowerCase()
      .replace(/[^a-z0-9čćžšđ]+/gi, "-")
      .replace(/^-|-$/g, "");
    const newPage = {
      id: nextId("page"),
      title,
      slug: `/${slugBase || "stranica"}`,
      blocks: [
        createBlock("text", {
          props: {
            heading: title,
            body: "Dodaj blokove iz leve biblioteke i uredi njihova svojstva u desnom panelu."
          }
        })
      ]
    };
    commitProject((prev) => ({
      ...prev,
      activePageId: newPage.id,
      pages: [...prev.pages, newPage]
    }));
    setSelectedBlockId(newPage.blocks[0].id);
    setNewPageTitle("");
  };

  const duplicatePage = (pageId) => {
    const source = project.pages.find((p) => p.id === pageId);
    if (!source) return;
    const clonedBlocks = source.blocks.map((b) => ({
      ...structuredClone(b),
      id: nextId("block")
    }));
    const copyPage = {
      ...structuredClone(source),
      id: nextId("page"),
      title: `${source.title} (kopija)`,
      slug: `${source.slug}-kopija`,
      blocks: clonedBlocks
    };
    commitProject((prev) => ({
      ...prev,
      activePageId: copyPage.id,
      pages: [...prev.pages, copyPage]
    }));
    setSelectedBlockId(copyPage.blocks[0]?.id || null);
  };

  const startRenamePage = (page) => {
    setRenamingPageId(page.id);
    setRenameValue(page.title);
  };

  const confirmRenamePage = (pageId) => {
    const trimmed = renameValue.trim();
    if (trimmed) {
      commitProject((prev) => ({
        ...prev,
        pages: prev.pages.map((p) => (p.id === pageId ? { ...p, title: trimmed } : p))
      }));
    }
    setRenamingPageId(null);
    setRenameValue("");
  };

  const deletePage = (pageId) => {
    if (project.pages.length <= 1) {
      setError("Mora ostati barem jedna stranica u projektu.");
      return;
    }
    commitProject((prev) => {
      const remaining = prev.pages.filter((p) => p.id !== pageId);
      const nextActiveId = prev.activePageId === pageId ? remaining[0].id : prev.activePageId;
      const nextActive = remaining.find((p) => p.id === nextActiveId) || remaining[0];
      setSelectedBlockId(nextActive?.blocks?.[0]?.id || null);
      return {
        ...prev,
        activePageId: nextActiveId,
        pages: remaining
      };
    });
  };

  const addBlockToPage = (type) => {
    if (!activePage) return;
    const block = createBlock(type);
    commitProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === activePage.id ? { ...p, blocks: [...p.blocks, block] } : p
      )
    }));
    setSelectedBlockId(block.id);
    setEditingMode(true);
  };

  const moveBlock = (blockId, direction) => {
    if (!activePage) return;
    const idx = activePage.blocks.findIndex((b) => b.id === blockId);
    if (idx < 0) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= activePage.blocks.length) return;
    commitProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== activePage.id) return p;
        const copy = [...p.blocks];
        const [item] = copy.splice(idx, 1);
        copy.splice(targetIdx, 0, item);
        return { ...p, blocks: copy };
      })
    }));
  };

  const duplicateBlock = (blockId) => {
    if (!activePage) return;
    const idx = activePage.blocks.findIndex((b) => b.id === blockId);
    if (idx < 0) return;
    const original = activePage.blocks[idx];
    const copyBlock = {
      ...structuredClone(original),
      id: nextId("block")
    };
    commitProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== activePage.id) return p;
        const nextBlocks = [...p.blocks];
        nextBlocks.splice(idx + 1, 0, copyBlock);
        return { ...p, blocks: nextBlocks };
      })
    }));
    setSelectedBlockId(copyBlock.id);
  };

  const deleteBlock = (blockId) => {
    if (!activePage) return;
    commitProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === activePage.id
          ? { ...p, blocks: p.blocks.filter((b) => b.id !== blockId) }
          : p
      )
    }));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const updateSelectedBlockProp = (propKey, value) => {
    if (!activePage || !selectedBlockId) return;
    commitProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          blocks: p.blocks.map((b) =>
            b.id === selectedBlockId ? { ...b, props: { ...b.props, [propKey]: value } } : b
          )
        };
      })
    }));
  };

  const updateSelectedBlockStyle = (styleKey, value) => {
    if (!activePage || !selectedBlockId) return;
    commitProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          blocks: p.blocks.map((b) =>
            b.id === selectedBlockId ? { ...b, style: { ...b.style, [styleKey]: value } } : b
          )
        };
      })
    }));
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Izaberi ispravnu datoteku slike.");
      e.target.value = "";
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError("Slika mora biti manja od 6 MB radi stabilnog lokalnog čuvanja.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const mediaItem = {
        id: nextId("media"),
        name: file.name,
        url: dataUrl
      };
      commitProject((prev) => ({
        ...prev,
        media: [mediaItem, ...(prev.media || [])]
      }));
      if (selectedBlock) {
        if ("imageUrl" in selectedBlock.props) {
          updateSelectedBlockProp("imageUrl", dataUrl);
        } else if ("posterUrl" in selectedBlock.props) {
          updateSelectedBlockProp("posterUrl", dataUrl);
        }
      }
      setNotice(`Slika "${file.name}" je dodata u Media biblioteku.`);
    };
    reader.onerror = () => setError("Greška pri učitavanju slike.");
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const applyMediaToSelectedBlock = (url) => {
    if (!selectedBlock) {
      setError("Prvo izaberi blok na Canvas-u da bi primenila sliku.");
      return;
    }
    if ("imageUrl" in selectedBlock.props) {
      updateSelectedBlockProp("imageUrl", url);
    } else if ("posterUrl" in selectedBlock.props) {
      updateSelectedBlockProp("posterUrl", url);
    } else {
      setError("Izabrani blok nema polje za sliku — izaberi Hero, Slika ili Video blok.");
    }
  };

  const handleExportJson = () => {
    try {
      const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "digital-soul-site-builder.json";
      a.click();
      URL.revokeObjectURL(url);
      setNotice("Projekat je izvezen u JSON fajl.");
    } catch {
      setError("Izvoz projekta nije uspeo.");
    }
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ""));
        if (!parsed || !Array.isArray(parsed.pages) || parsed.pages.length === 0) {
          throw new Error("JSON fajl ne sadrži validne stranice.");
        }
        const normalized = {
          name: parsed.name || "Uvezeni projekat",
          activePageId: parsed.activePageId || parsed.pages[0].id,
          media: Array.isArray(parsed.media) ? parsed.media : [],
          pages: parsed.pages
        };
        commitProject(normalized, "Uvezen projekat iz JSON-a");
        setSelectedBlockId(normalized.pages[0]?.blocks?.[0]?.id || null);
        setNotice("Projekat je uspešno uvezen.");
      } catch (err) {
        setError(err?.message || "Neispravan JSON fajl.");
      }
    };
    reader.onerror = () => setError("Nije moguće pročitati izabrani fajl.");
    reader.readAsText(file);
    e.target.value = "";
  };

  const filteredBlocks = useMemo(() => {
    return BLOCK_DEFINITIONS.filter((def) => {
      const matchesCategory = categoryFilter === "Sve" || def.category === categoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        def.label.toLowerCase().includes(q) ||
        def.type.toLowerCase().includes(q) ||
        def.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [categoryFilter, searchQuery]);

  const isDirty = JSON.stringify(project) !== lastSavedSnapshot;

  const renderBlockContent = (block) => {
    const { type, props, style } = block;
    const boxStyle = {
      backgroundColor: style.backgroundColor,
      color: style.textColor,
      fontFamily: style.fontFamily,
      fontSize: `${style.fontSize}px`,
      paddingTop: `${style.paddingTop}px`,
      paddingBottom: `${style.paddingBottom}px`,
      marginTop: `${style.marginTop}px`,
      marginBottom: `${style.marginBottom}px`,
      borderRadius: `${style.borderRadius}px`,
      border: style.borderWidth ? `${style.borderWidth}px solid ${style.borderColor}` : "none",
      width: style.width || "100%",
      minHeight: style.minHeight ? `${style.minHeight}px` : "auto",
      textAlign: style.textAlign || "left"
    };

    switch (type) {
      case "header":
        return (
          <div style={boxStyle} className="builder-block-inner header-block">
            <strong className="site-brand" style={{ color: style.textColor }}>
              {props.brand}
            </strong>
            <div className="nav-links" style={{ color: style.textColor }}>
              {(props.links || []).map((lnk, i) => (
                <span key={i}>{lnk}</span>
              ))}
            </div>
          </div>
        );

      case "hero":
        return (
          <div style={boxStyle} className="builder-block-inner hero-block">
            <div className="hero-copy">
              {props.eyebrow && (
                <div className="eyebrow" style={{ color: style.accentColor }}>
                  {props.eyebrow}
                </div>
              )}
              <h1 className="hero-title" style={{ color: style.textColor, fontSize: `${style.fontSize}px` }}>
                {props.title}
              </h1>
              <p className="hero-description" style={{ color: style.textColor, opacity: 0.85 }}>
                {props.description}
              </p>
              <div className="hero-actions">
                {props.primaryButtonText && (
                  <a
                    href={props.primaryButtonUrl || "#"}
                    onClick={(e) => e.preventDefault()}
                    className="hero-cta"
                    style={{ backgroundColor: style.accentColor, color: "#fff" }}
                  >
                    {props.primaryButtonText}
                    <ArrowUpRight size={15} />
                  </a>
                )}
                {props.secondaryButtonText && (
                  <a
                    href={props.secondaryButtonUrl || "#"}
                    onClick={(e) => e.preventDefault()}
                    className="hero-cta hero-cta-secondary"
                  >
                    {props.secondaryButtonText}
                  </a>
                )}
              </div>
            </div>
            <div className="hero-image">
              {props.imageUrl ? (
                <img src={props.imageUrl} alt={props.imageAlt || "Hero slika"} />
              ) : (
                <div className="image-placeholder">
                  <div className="image-placeholder-icon">
                    <ImagePlus size={24} />
                  </div>
                  <strong>Hero fotografija</strong>
                  <span>Izaberi sliku u Properties panelu ili Media biblioteci</span>
                </div>
              )}
            </div>
          </div>
        );

      case "text":
        return (
          <div style={boxStyle} className="builder-block-inner">
            <h2 style={{ margin: "0 0 10px", fontFamily: style.fontFamily, color: style.textColor }}>
              {props.heading}
            </h2>
            <p style={{ margin: 0, lineHeight: 1.7, color: style.textColor, opacity: 0.9 }}>
              {props.body}
            </p>
          </div>
        );

      case "image":
        return (
          <div style={boxStyle} className="builder-block-inner">
            {props.imageUrl ? (
              <img
                src={props.imageUrl}
                alt={props.alt || "Slika"}
                style={{ maxWidth: "100%", maxHeight: "420px", objectFit: "cover", borderRadius: "10px" }}
              />
            ) : (
              <div className="image-placeholder" style={{ minHeight: 160 }}>
                <ImagePlus size={26} />
                <strong>Nema izabrane slike</strong>
                <span>Dodaj sliku iz Media biblioteke ili unesi URL desno</span>
              </div>
            )}
            {props.caption && (
              <p style={{ marginTop: 12, marginBottom: 0, fontSize: 13, opacity: 0.8 }}>{props.caption}</p>
            )}
          </div>
        );

      case "gallery":
        return (
          <div style={boxStyle} className="builder-block-inner">
            <h2 style={{ margin: "0 0 18px", color: style.textColor }}>{props.title}</h2>
            <div className="gallery-grid">
              {(props.items || []).map((item) => (
                <div key={item.id} className="gallery-item-card">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} />
                  ) : (
                    <div className="gallery-item-placeholder">
                      <ImagePlus size={20} />
                      <span>{item.title}</span>
                    </div>
                  )}
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
                </div>
              ))}
            </div>
          </div>
        );

      case "button":
        return (
          <div style={boxStyle} className="builder-block-inner">
            <a
              href={props.url || "#"}
              onClick={(e) => e.preventDefault()}
              className="hero-cta"
              style={{
                backgroundColor: props.variant === "secondary" ? "#2d1b4e" : style.accentColor,
                color: style.textColor,
                borderRadius: `${style.borderRadius}px`
              }}
            >
              {props.label || "Dugme"}
              <ArrowUpRight size={15} />
            </a>
          </div>
        );

      case "cta":
        return (
          <div style={boxStyle} className="builder-block-inner">
            {props.kicker && (
              <div className="library-kicker" style={{ color: style.accentColor, marginBottom: 8 }}>
                {props.kicker}
              </div>
            )}
            <h2 style={{ margin: "0 0 10px", color: style.textColor }}>{props.title}</h2>
            <p style={{ margin: "0 0 20px", opacity: 0.9, color: style.textColor }}>{props.description}</p>
            <a
              href={props.buttonUrl || "#"}
              onClick={(e) => e.preventDefault()}
              className="hero-cta"
              style={{ backgroundColor: style.accentColor, color: "#fff" }}
            >
              {props.buttonText || "Započni"}
              <ArrowUpRight size={15} />
            </a>
          </div>
        );

      case "features":
        return (
          <div style={boxStyle} className="builder-block-inner">
            {props.kicker && (
              <div className="library-kicker" style={{ color: style.accentColor, marginBottom: 6 }}>
                {props.kicker}
              </div>
            )}
            <h2 style={{ margin: "0 0 20px", color: style.textColor }}>{props.title}</h2>
            <div className="features-grid">
              {(props.cards || []).map((card) => (
                <div key={card.id} className="feature-box">
                  <span className="library-number">{card.number || "01"}</span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <button
                    type="button"
                    className="feature-link-btn"
                    style={{ backgroundColor: style.accentColor }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (card.targetPageId && project.pages.some((p) => p.id === card.targetPageId)) {
                        selectPage(card.targetPageId);
                      }
                    }}
                  >
                    {card.buttonText || "Otvori"} <ArrowUpRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "testimonials":
        return (
          <div style={boxStyle} className="builder-block-inner">
            <h2 style={{ margin: "0 0 18px", color: style.textColor }}>{props.title}</h2>
            <div className="testimonials-grid">
              {(props.items || []).map((t) => (
                <blockquote key={t.id} className="testimonial-card">
                  <p style={{ margin: "0 0 8px", fontStyle: "italic" }}>„{t.quote}“</p>
                  <footer style={{ fontWeight: 600, fontSize: 13, color: style.accentColor }}>— {t.author}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        );

      case "pricing":
        return (
          <div style={boxStyle} className="builder-block-inner">
            <h2 style={{ margin: "0 0 18px", color: style.textColor }}>{props.title}</h2>
            <div className="pricing-grid">
              {(props.plans || []).map((pl) => (
                <div key={pl.id} className="pricing-card">
                  <h3>{pl.name}</h3>
                  <div className="pricing-price" style={{ color: style.accentColor }}>{pl.price}</div>
                  <p>{pl.note}</p>
                  <button type="button" className="button button-primary" onClick={(e) => e.stopPropagation()}>
                    {pl.cta || "Izaberi"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "faq":
        return (
          <div style={boxStyle} className="builder-block-inner">
            <h2 style={{ margin: "0 0 16px", color: style.textColor }}>{props.title}</h2>
            <div className="faq-list">
              {(props.questions || []).map((item) => (
                <details key={item.id} className="faq-item" onClick={(e) => e.stopPropagation()}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        );

      case "contact":
        return (
          <div style={boxStyle} className="builder-block-inner">
            <h2 style={{ margin: "0 0 10px", color: style.textColor }}>{props.title}</h2>
            <p style={{ margin: "4px 0" }}><strong>Email:</strong> {props.email}</p>
            <p style={{ margin: "4px 0" }}><strong>Telefon:</strong> {props.phone}</p>
            <p style={{ margin: "10px 0 0", opacity: 0.85 }}>{props.note}</p>
          </div>
        );

      case "form":
        return (
          <div style={boxStyle} className="builder-block-inner">
            <h2 style={{ margin: "0 0 14px", color: style.textColor }}>{props.title}</h2>
            <form
              className="demo-inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                setNotice(props.successMessage || "Forma poslata.");
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input type="text" placeholder="Ime i prezime" required />
              <input type="email" placeholder="Email adresa" required />
              <textarea rows={3} placeholder="Tvoja poruka..." />
              <button
                type="submit"
                className="hero-cta"
                style={{ backgroundColor: style.accentColor, color: "#fff" }}
              >
                {props.submitLabel || "Pošalji"}
              </button>
            </form>
          </div>
        );

      case "video":
        return (
          <div style={boxStyle} className="builder-block-inner">
            <h2 style={{ margin: "0 0 14px", color: style.textColor }}>{props.title}</h2>
            {props.videoUrl ? (
              <video
                src={props.videoUrl}
                poster={props.posterUrl || undefined}
                controls
                style={{ maxWidth: "100%", borderRadius: 12 }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="image-placeholder" style={{ minHeight: 160 }}>
                <ImagePlus size={26} />
                <strong>Video blok</strong>
                <span>{props.caption}</span>
              </div>
            )}
          </div>
        );

      case "custom_html":
        return (
          <div style={boxStyle} className="builder-block-inner">
            <h3 style={{ margin: "0 0 10px", color: style.textColor }}>{props.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: props.html || "" }} />
          </div>
        );

      default:
        return (
          <div style={boxStyle} className="builder-block-inner">
            <p>{props.body || props.title || "Blok"}</p>
          </div>
        );
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">DS</div>
          <div>
            <div className="brand-title">{project.name || "Digital Soul"}</div>
            <div className="brand-subtitle">JEDINSTVENI VISUAL PAGE BUILDER</div>
          </div>
        </div>

        <div className="top-actions">
          <span className={`save-state ${isDirty ? "dirty" : ""}`}>
            <span className="state-dot" />
            {isSaving ? "Čuvanje…" : isDirty ? "Nesačuvane izmene" : status}
          </span>

          <button
            type="button"
            className="button button-quiet"
            onClick={handleUndo}
            disabled={history.past.length === 0}
            title="Undo"
          >
            <Undo2 size={15} /> Undo
          </button>
          <button
            type="button"
            className="button button-quiet"
            onClick={handleRedo}
            disabled={history.future.length === 0}
            title="Redo"
          >
            <Redo2 size={15} /> Redo
          </button>

          <button type="button" className="button button-quiet" onClick={() => importInputRef.current?.click()}>
            <FolderOpen size={15} /> Import
          </button>
          <input ref={importInputRef} type="file" accept="application/json" hidden onChange={handleImportJson} />

          <button type="button" className="button button-quiet" onClick={handleExportJson}>
            <Download size={15} /> Export
          </button>

          <button type="button" className="button button-primary" onClick={() => persistNow(project, false)}>
            <Save size={15} /> Sačuvaj
          </button>
        </div>
      </header>

      {(error || notice) && (
        <div className={`feedback-banner ${error ? "is-error" : "is-notice"}`}>
          <span>{error || notice}</span>
          <button
            type="button"
            onClick={() => {
              setError("");
              setNotice("");
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="workspace">
        <aside className="left-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">RADNI PROSTOR</span>
              <h2>Pages & Elements</h2>
            </div>
            <Layers size={18} />
          </div>

          <div className="mode-switch">
            <button
              type="button"
              className={leftTab === "pages" ? "active" : ""}
              onClick={() => setLeftTab("pages")}
            >
              Stranice ({project.pages.length})
            </button>
            <button
              type="button"
              className={leftTab === "elements" ? "active" : ""}
              onClick={() => setLeftTab("elements")}
            >
              Blokovi ({BLOCK_DEFINITIONS.length})
            </button>
          </div>

          {leftTab === "pages" ? (
            <div className="panel-section">
              <div className="section-title">STRANICE U PROJEKTU</div>
              <form className="new-page-form" onSubmit={addPage}>
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  placeholder="Naziv nove stranice..."
                />
                <button type="submit" className="button button-primary" title="Dodaj stranicu">
                  <FilePlus2 size={15} />
                </button>
              </form>

              <div className="page-list">
                {project.pages.map((pg) => {
                  const isCurrent = pg.id === activePage?.id;
                  return (
                    <div key={pg.id} className={`page-item ${isCurrent ? "active" : ""}`}>
                      {renamingPageId === pg.id ? (
                        <input
                          type="text"
                          value={renameValue}
                          autoFocus
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => confirmRenamePage(pg.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmRenamePage(pg.id);
                            if (e.key === "Escape") setRenamingPageId(null);
                          }}
                        />
                      ) : (
                        <button type="button" className="page-select-btn" onClick={() => selectPage(pg.id)}>
                          <strong>{pg.title}</strong>
                          <span>{pg.blocks.length} blok.</span>
                        </button>
                      )}
                      <div className="page-item-actions">
                        <button type="button" title="Preimenuj" onClick={() => startRenamePage(pg)}>
                          <Pencil size={12} />
                        </button>
                        <button type="button" title="Kopiraj stranicu" onClick={() => duplicatePage(pg.id)}>
                          <Copy size={12} />
                        </button>
                        <button type="button" title="Obriši stranicu" onClick={() => deletePage(pg.id)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="panel-section">
              <div className="section-title">BIBLIOTEKA BLOKOVA</div>
              <div className="search-box">
                <Search size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pretraži blokove..."
                />
              </div>

              <div className="category-pills">
                {["Sve", ...BLOCK_CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-pill ${categoryFilter === cat ? "active" : ""}`}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="blocks-catalog-list">
                {filteredBlocks.map((def) => (
                  <div key={def.type} className="catalog-block-card">
                    <div>
                      <strong>{def.label}</strong>
                      <p>{def.description}</p>
                    </div>
                    <button
                      type="button"
                      className="button button-outline"
                      onClick={() => addBlockToPage(def.type)}
                      title={`Dodaj ${def.label}`}
                    >
                      <Plus size={14} /> Dodaj
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="panel-section">
            <div className="section-title">MEDIA LIBRARY</div>
            <div className="upload-card">
              <div className="upload-icon">
                <Upload size={18} />
              </div>
              <strong>Otpremi sliku</strong>
              <p>Dodaj fotografiju ili mockup u biblioteku medija.</p>
              <button
                type="button"
                className="button button-outline full-width"
                onClick={() => mediaInputRef.current?.click()}
              >
                <ImagePlus size={14} /> Izaberi sliku
              </button>
              <input ref={mediaInputRef} type="file" accept="image/*" hidden onChange={handleMediaUpload} />
            </div>

            {(project.media || []).length > 0 && (
              <div className="media-grid">
                {project.media.map((m) => (
                  <div key={m.id} className="media-thumb" title={m.name}>
                    <img src={m.url} alt={m.name} onClick={() => applyMediaToSelectedBlock(m.url)} />
                    <button type="button" onClick={() => applyMediaToSelectedBlock(m.url)}>
                      Primeni
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="canvas-area">
          <div className="canvas-toolbar">
            <div className="breadcrumb">
              <span>{project.name}</span>
              <span>/</span>
              <strong>{activePage?.title || "Stranica"}</strong>
              <span className="draft-tag">{editingMode ? "UREĐIVANJE" : "PREGLED"}</span>
            </div>

            <div className="device-switch">
              <button
                type="button"
                className={device === "desktop" ? "active" : ""}
                onClick={() => setDevice("desktop")}
                title="Desktop"
              >
                <Monitor size={15} />
              </button>
              <button
                type="button"
                className={device === "tablet" ? "active" : ""}
                onClick={() => setDevice("tablet")}
                title="Tablet"
              >
                <Tablet size={15} />
              </button>
              <button
                type="button"
                className={device === "mobile" ? "active" : ""}
                onClick={() => setDevice("mobile")}
                title="Telefon"
              >
                <Smartphone size={15} />
              </button>
            </div>

            <button type="button" className="preview-button" onClick={() => setEditingMode((v) => !v)}>
              {editingMode ? (
                <>
                  <Eye size={14} /> Preview
                </>
              ) : (
                <>
                  <Pencil size={14} /> Uredi
                </>
              )}
            </button>
          </div>

          <div className="preview-stage">
            <div className={`website-preview ${device} ${editingMode ? "editing" : "preview-only"}`}>
              {(activePage?.blocks || []).length === 0 ? (
                <div className="empty-canvas-state">
                  <h3>Stranica je prazna</h3>
                  <p>Dodaj blok iz kartice „Blokovi“ na levoj strani.</p>
                  <button type="button" className="button button-primary" onClick={() => addBlockToPage("hero")}>
                    <Plus size={15} /> Dodaj Hero blok
                  </button>
                </div>
              ) : (
                activePage.blocks.map((block, index) => {
                  const isSelected = editingMode && selectedBlockId === block.id;
                  return (
                    <div
                      key={block.id}
                      className={`canvas-block-wrapper ${isSelected ? "is-selected" : ""}`}
                      onClick={() => {
                        if (editingMode) setSelectedBlockId(block.id);
                      }}
                    >
                      {editingMode && (
                        <div className="block-floating-bar" onClick={(e) => e.stopPropagation()}>
                          <span className="block-badge">{block.label}</span>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveBlock(block.id, -1)}
                            title="Pomeri gore"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={index === activePage.blocks.length - 1}
                            onClick={() => moveBlock(block.id, 1)}
                            title="Pomeri dole"
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button type="button" onClick={() => duplicateBlock(block.id)} title="Dupliraj">
                            <Copy size={13} />
                          </button>
                          <button type="button" onClick={() => deleteBlock(block.id)} title="Obriši blok">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                      {renderBlockContent(block)}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
const [isPreview, setIsPreview] = useState(false);
        <aside className="right-panel">
          <div className="inspector-heading">
            <div>
              <span className="panel-kicker">SVOJSTVA</span>
              <h2>{selectedBlock ? selectedBlock.label : "Properties"}</h2>
            </div>
            <Pencil size={17} />
          </div>

          {!selectedBlock ? (
            <div className="inspector-content">
              <p className="field-help">
                Klikni na bilo koji blok na Canvas-u da vidiš i menjaš njegov sadržaj, boje, fontove, razmake, dimenzije, linkove i stilove.
              </p>
            </div>
          ) : (
            <div className="inspector-content properties-scroll">
              <div className="section-title">SADRŽAJ I LINKOVI</div>
              {Object.entries(selectedBlock.props).map(([key, val]) => {
                if (Array.isArray(val)) {
                  return (
                    <div key={key} className="prop-group">
                      <label className="field-label">{key} (JSON lista)</label>
                      <textarea
                        rows={4}
                        value={JSON.stringify(val, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            if (Array.isArray(parsed)) {
                              updateSelectedBlockProp(key, parsed);
                              setError("");
                            }
                          } catch {
                            // Korisnik još kuca JSON
                          }
                        }}
                      />
                    </div>
                  );
                }

                const isLongText =
                  typeof val === "string" &&
                  (val.length > 70 || key.includes("description") || key.includes("body") || key === "html");

                return (
                  <div key={key} className="prop-group">
                    <label className="field-label">{key}</label>
                    {isLongText ? (
                      <textarea
                        rows={3}
                        value={val ?? ""}
                        onChange={(e) => updateSelectedBlockProp(key, e.target.value)}
                      />
                    ) : (
                      <input
                        type="text"
                        value={val ?? ""}
                        onChange={(e) => updateSelectedBlockProp(key, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}

              <div className="inspector-divider" />
              <div className="section-title">BOJE, FONT I STIL</div>

              <div className="prop-row-2">
                <div className="prop-group">
                  <label className="field-label">Pozadina</label>
                  <input
                    type="color"
                    value={
                      selectedBlock.style.backgroundColor?.startsWith("#")
                        ? selectedBlock.style.backgroundColor
                        : "#ffffff"
                    }
                    onChange={(e) => updateSelectedBlockStyle("backgroundColor", e.target.value)}
                  />
                </div>
                <div className="prop-group">
                  <label className="field-label">Boja teksta</label>
                  <input
                    type="color"
                    value={
                      selectedBlock.style.textColor?.startsWith("#")
                        ? selectedBlock.style.textColor
                        : "#30243b"
                    }
                    onChange={(e) => updateSelectedBlockStyle("textColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="prop-group">
                <label className="field-label">Akcent boja (dugmad / detalji)</label>
                <input
                  type="color"
                  value={
                    selectedBlock.style.accentColor?.startsWith("#")
                      ? selectedBlock.style.accentColor
                      : "#8060a5"
                  }
                  onChange={(e) => updateSelectedBlockStyle("accentColor", e.target.value)}
                />
              </div>

              <div className="prop-group">
                <label className="field-label">Font</label>
                <select
                  value={selectedBlock.style.fontFamily}
                  onChange={(e) => updateSelectedBlockStyle("fontFamily", e.target.value)}
                >
                  <option value='"DM Sans", sans-serif'>DM Sans</option>
                  <option value='"Playfair Display", Georgia, serif'>Playfair Display</option>
                  <option value="'DM Sans', sans-serif">DM Sans</option>
<option value="'Playfair Display', Georgia, serif">Playfair Display</option>
<option value="'Cormorant Garamond', Georgia, serif">Cormorant Garamond</option>
<option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
<option value="Georgia, serif">Georgia</option>
                  <option value="Georgia, serif">Georgia</option>
                </select>
              </div>

              <div className="prop-row-2">
                <div className="prop-group">
                  <label className="field-label">Veličina fonta (px)</label>
                  <input
                    type="number"
                    min={10}
                    max={96}
                    value={selectedBlock.style.fontSize ?? 16}
                    onChange={(e) => updateSelectedBlockStyle("fontSize", Number(e.target.value) || 16)}
                  />
                </div>
                <div className="prop-group">
                  <label className="field-label">Poravnanje</label>
                  <select
                    value={selectedBlock.style.textAlign || "left"}
                    onChange={(e) => updateSelectedBlockStyle("textAlign", e.target.value)}
                  >
                    <option value="left">Levo</option>
                    <option value="center">Centar</option>
                    <option value="right">Desno</option>
                  </select>
                </div>
              </div>

              <div className="inspector-divider" />
              <div className="section-title">MARGINE, RAZMACI I DIMENZIJE</div>

              <div className="prop-row-2">
                <div className="prop-group">
                  <label className="field-label">Padding gore (px)</label>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={selectedBlock.style.paddingTop ?? 24}
                    onChange={(e) => updateSelectedBlockStyle("paddingTop", Number(e.target.value) || 0)}
                  />
                </div>
                <div className="prop-group">
                  <label className="field-label">Padding dole (px)</label>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={selectedBlock.style.paddingBottom ?? 24}
                    onChange={(e) => updateSelectedBlockStyle("paddingBottom", Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="prop-row-2">
                <div className="prop-group">
                  <label className="field-label">Margin gore (px)</label>
                  <input
                    type="number"
                    min={0}
                    max={160}
                    value={selectedBlock.style.marginTop ?? 0}
                    onChange={(e) => updateSelectedBlockStyle("marginTop", Number(e.target.value) || 0)}
                  />
                </div>
                <div className="prop-group">
                  <label className="field-label">Margin dole (px)</label>
                  <input
                    type="number"
                    min={0}
                    max={160}
                    value={selectedBlock.style.marginBottom ?? 0}
                    onChange={(e) => updateSelectedBlockStyle("marginBottom", Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="prop-row-2">
                <div className="prop-group">
                  <label className="field-label">Border radius (px)</label>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={selectedBlock.style.borderRadius ?? 0}
                    onChange={(e) => updateSelectedBlockStyle("borderRadius", Number(e.target.value) || 0)}
                  />
                </div>
                <div className="prop-group">
                  <label className="field-label">Border širina (px)</label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={selectedBlock.style.borderWidth ?? 0}
                    onChange={(e) => updateSelectedBlockStyle("borderWidth", Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="prop-row-2">
                <div className="prop-group">
                  <label className="field-label">Širina</label>
                  <input
                    type="text"
                    value={selectedBlock.style.width || "100%"}
                    onChange={(e) => updateSelectedBlockStyle("width", e.target.value)}
                  />
                </div>
                <div className="prop-group">
                  <label className="field-label">Min visina (px)</label>
                  <input
                    type="number"
                    min={0}
                    max={1200}
                    value={selectedBlock.style.minHeight ?? 0}
                    onChange={(e) => updateSelectedBlockStyle("minHeight", Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

