"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Moon, Sun } from "lucide-react";

interface Subject {
  id: string;
  name: string;
}

interface Resource {
  id: string;
  clean_title: string;
  resource_type: string;
  topic: string;
  summary: string;
  file_url: string;
  subject_id: string;
}

export default function Atlas() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSub, setCurrentSub] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedRes, setSelectedRes] = useState<Resource | null>(null);
  const [filter, setFilter] = useState("all");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("subjects").select("*");
      setSubjects((data as Subject[]) || []);
    }
    load();
  }, []);

  async function selectSubject(id: string) {
    setCurrentSub(id);
    const { data } = await supabase.from("resources").select("*").eq("subject_id", id);
    setResources((data as Resource[]) || []);
  }

  const filtered = resources.filter(r => filter === "all" || r.resource_type === filter);

  return (
    <div className={`flex h-screen ${dark ? "dark" : ""}`}>
      <div className="flex w-full h-full bg-main text-main transition-colors duration-300">
        <aside className="w-64 bg-pane p-6 border-r border-border-color">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight">Medical Atlas</h1>
              <p className="text-xs uppercase tracking-widest mt-1 opacity-60">Academic Repository</p>
            </div>
            <button onClick={() => setDark(!dark)} className="p-2 rounded-lg bg-card border border-border-color">
              {dark ? <Sun size={16}/> : <Moon size={16}/>}
            </button>
          </div>
          <nav className="space-y-2">
            {subjects.map(s => (
              <button key={s.id} onClick={() => selectSubject(s.id)} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentSub === s.id ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100" : "hover:bg-slate-100 dark:hover:bg-slate-700"}`}>
                {s.name}
              </button>
            ))}
          </nav>
        </aside>
        <main className="w-96 bg-card p-6 border-r border-border-color">
          <h2 className="font-serif text-xl font-bold mb-4">Resources</h2>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {["all", "lecture", "lab", "note", "exam"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${filter === f ? "bg-slate-900 text-white dark:bg-sky-600" : "bg-slate-200 dark:bg-slate-700"}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r.id} onClick={() => setSelectedRes(r)} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer border border-transparent hover:border-blue-400 transition-all">
                <p className="text-sm font-semibold">{r.clean_title}</p>
                <p className="text-xs opacity-50">{r.resource_type}</p>
              </div>
            ))}
          </div>
        </main>
        <section className="flex-1 bg-main p-8">
          {selectedRes ? (
            <div className="max-w-3xl space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">{selectedRes.resource_type}</span>
                </div>
                <h2 className="font-serif text-4xl font-bold leading-tight">{selectedRes.clean_title}</h2>
              </div>
              <div className="p-8 bg-card border rounded-3xl shadow-sm space-y-6">
                <p className="text-lg leading-relaxed opacity-80">{selectedRes.summary}</p>
                <a href={selectedRes.file_url} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-4 bg-slate-900 dark:bg-sky-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all">
                  View Resource
                </a>
              </div>
            </div>
          ) : <div className="h-full flex items-center justify-center text-slate-400 italic">Select a resource from the list to begin studying...</div>}
        </section>
      </div>
    </div>
  );
}
