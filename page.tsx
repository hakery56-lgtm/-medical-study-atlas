
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Admin() {
  const [form, setForm] = useState({ title: "", cleanTitle: "", type: "lecture", topic: "", summary: "", subjectId: "" });
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();
    setUploading(true);
    const file = e.target.files[0];
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from("resources").upload(fileName, file);

    if (data) {
      const { data: resData } = await supabase.from("resources").insert([{
        title: file.name,
        clean_title: form.cleanTitle,
        type: form.type,
        topic: form.topic,
        summary: form.summary,
        subject_id: form.subjectId,
        file_url: data.path
      }]).select();
      alert("Uploaded successfully!");
    }
    setUploading(false);
  }

  return (
    <div className="p-10 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Atlas Admin Panel</h1>
      <form className="space-y-4 bg-white p-6 rounded-2xl border shadow-sm">
        <input className="w-full p-2 border rounded" placeholder="Subject ID (UUID)" onChange={e => setForm({...form, subjectId: e.target.value})} />
        <input className="w-full p-2 border rounded" placeholder="Display Title" onChange={e => setForm({...form, cleanTitle: e.target.value})} />
        <select className="w-full p-2 border rounded" onChange={e => setForm({...form, type: e.target.value})}>
          <option value="lecture">Lecture</option>
          <option value="lab">Lab</option>
          <option value="note">Note</option>
          <option value="exam">Exam</option>
        </select>
        <input className="w-full p-2 border rounded" placeholder="Topic" onChange={e => setForm({...form, topic: e.target.value})} />
        <textarea className="w-full p-2 border rounded" placeholder="Summary" onChange={e => setForm({...form, summary: e.target.value})} />
        <div className="p-4 border-2 border-dashed rounded-xl text-center">
          <input type="file" onChange={handleUpload} disabled={uploading} />
          {uploading && <p className="text-xs text-blue-500 mt-2">Uploading to Cloud...</p>}
        </div>
      </form>
    </div>
  );
}
