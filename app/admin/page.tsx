"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Admin() {
  const [form, setForm] = useState({ title: "", cleanTitle: "", type: "lecture", topic: "", summary: "", subjectId: "" });
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();
    const file = e.target.files[0];
    if(!file) return;

    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;

    // 1. Upload file to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage.from("resources").upload(fileName, file);

    if (storageError) {
      alert("Storage Error: " + storageError.message);
      setUploading(false);
      return;
    }

    // 2. Save metadata to Database (Using resource_type instead of type)
    const { error: dbError } = await supabase.from("resources").insert([{
      title: file.name,
      clean_title: form.cleanTitle,
      resource_type: form.type, // FIXED THIS LINE
      topic: form.topic,
      summary: form.summary,
      subject_id: form.subjectId,
      file_url: storageData.path
    }]);

    if (dbError) {
      alert("Database Error: " + dbError.message);
    } else {
      alert("Uploaded successfully!");
    }
    setUploading(false);
  }

  return (
    <div className="p-10 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Atlas Admin Panel</h1>
      <form className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border shadow-sm">
        <input className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" placeholder="Subject ID (UUID)" onChange={e => setForm({...form, subjectId: e.target.value})} />
        <input className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" placeholder="Display Title" onChange={e => setForm({...form, cleanTitle: e.target.value})} />
        <select className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" onChange={e => setForm({...form, type: e.target.value})}>
          <option value="lecture">Lecture</option>
          <option value="lab">Lab</option>
          <option value="note">Note</option>
          <option value="exam">Exam</option>
        </select>
        <input className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" placeholder="Topic" onChange={e => setForm({...form, topic: e.target.value})} />
        <textarea className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" placeholder="Summary" onChange={e => setForm({...form, summary: e.target.value})} />
        <div className="p-4 border-2 border-dashed rounded-xl text-center">
          <input type="file" onChange={handleUpload} disabled={uploading} />
          {uploading && <p className="text-xs text-blue-500 mt-2">Uploading to Cloud...</p>}
        </div>
      </form>
    </div>
  );
}
