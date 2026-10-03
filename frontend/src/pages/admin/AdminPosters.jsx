import { useEffect, useState } from "react";
import { FileImage, FileText, Pencil, Pin, Send, Trash2, Upload, X } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { createPoster, deletePoster, getAdminPosters, posterAction, updatePoster } from "../../services/posterService";

const blank = { title: "", caption: "", category: "GENERAL", audience: "ALL_MEMBERS" };
const categories = ["GENERAL", "ONBOARDING_GUIDE", "RULES", "EVENT"];
const inputClass = "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-50";

export default function AdminPosters() {
  const [posters, setPosters] = useState([]);
  const [form, setForm] = useState(blank);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => getAdminPosters().then(setPosters).catch((error) => setMessage(error.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  const clearFile = () => { setFile(null); setPreview(""); };
  const selectFile = (event) => {
    const next = event.target.files?.[0];
    if (!next) return;
    if (next.size > 5 * 1024 * 1024) return setMessage("Poster must be 5 MB or smaller.");
    setMessage(""); setFile(next); setPreview(next.type.startsWith("image/") ? URL.createObjectURL(next) : "");
  };
  const submit = async (event) => {
    event.preventDefault();
    try {
      if (!editing && !file) throw new Error("Choose a poster file.");
      const item = editing ? await updatePoster(editing.id, form) : await createPoster(form, file);
      setPosters((all) => editing ? all.map((poster) => poster.id === item.id ? item : poster) : [item, ...all]);
      setForm(blank); clearFile(); setEditing(null); setMessage(editing ? "Poster updated." : "Poster saved as draft.");
    } catch (error) { setMessage(error.message); }
  };
  const action = async (poster, name) => { try { const item = await posterAction(poster.id, name); setPosters((all) => all.map((current) => current.id === item.id ? item : current)); } catch (error) { setMessage(error.message); } };
  const remove = async (poster) => { if (!window.confirm(`Delete “${poster.title}”?`)) return; try { await deletePoster(poster.id); setPosters((all) => all.filter((current) => current.id !== poster.id)); } catch (error) { setMessage(error.message); } };
  const startEdit = (poster) => { setEditing(poster); setForm({ title: poster.title, caption: poster.caption || "", category: poster.category, audience: poster.audience }); clearFile(); setMessage(""); };

  return <div className="flex min-h-screen bg-stone-50"><AdminSidebar /><div className="min-w-0 flex-1"><AdminHeader /><main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:p-8">
    <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">Member communications</p><h1 className="mt-1 text-2xl font-bold text-gray-950">Posters &amp; Announcements</h1><p className="mt-1 text-sm text-gray-500">Create drafts, publish updates, and pin the most important message.</p></div><span className="w-fit rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-gray-600">{posters.length} total</span></div>
    {message && <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />{message}</div>}
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="border-b border-gray-100 px-5 py-4 sm:px-6"><h2 className="font-semibold text-gray-950">{editing ? "Edit announcement" : "New announcement"}</h2><p className="mt-1 text-sm text-gray-500">{editing ? "Update the text and audience. The existing file will stay unchanged." : "Save it as a draft first, then publish when it is ready."}</p></div>
      <form onSubmit={submit} className="p-5 sm:p-6"><div className="grid gap-5 lg:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">Title<input required value={form.title} maxLength={150} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. New member onboarding guide" className={inputClass} /></label>
        <label className="block text-sm font-medium text-gray-700">Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className={inputClass}>{categories.map((category) => <option key={category} value={category}>{category.replaceAll("_", " ")}</option>)}</select></label>
        <label className="block text-sm font-medium text-gray-700 lg:col-span-2">Message <span className="font-normal text-gray-400">(optional)</span><textarea value={form.caption} maxLength={1000} onChange={(event) => setForm({ ...form, caption: event.target.value })} placeholder="Add a short description for members." rows={4} className={`${inputClass} resize-y`} /></label>
        <label className="block text-sm font-medium text-gray-700">Audience<select value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })} className={inputClass}><option value="ALL_MEMBERS">All members</option><option value="NEW_MEMBERS">New members (60 days)</option></select><span className="mt-1.5 block text-xs font-normal text-gray-400">Choose who can see this after it is published.</span></label>
        {!editing && <div className="rounded-xl border border-dashed border-gray-300 bg-stone-50 p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700"><Upload size={19} /></div><div><p className="text-sm font-semibold text-gray-800">Poster file</p><p className="text-xs text-gray-500">PNG, JPG, WebP, or PDF · up to 5 MB</p></div></div><input required accept="image/png,image/jpeg,image/webp,application/pdf" type="file" onChange={selectFile} className="mt-4 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-gray-700 file:shadow-sm hover:file:bg-gray-100" />{file && <div className="mt-4 flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">{preview ? <img src={preview} alt="Selected poster preview" className="h-20 w-16 rounded-md object-contain" /> : <div className="flex h-20 w-16 items-center justify-center rounded-md bg-red-50 text-red-600"><FileText size={22} /></div>}<div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-gray-800">{file.name}</p><p className="mt-1 text-xs text-gray-500">{Math.ceil(file.size / 1024)} KB selected</p><button type="button" onClick={clearFile} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-600"><X size={13} /> Remove</button></div></div>}</div>}
      </div><div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">{editing ? <button type="button" onClick={() => { setEditing(null); setForm(blank); clearFile(); setMessage(""); }} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel editing</button> : <p className="text-xs text-gray-400">Drafts are visible only to administrators.</p>}<button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-gray-950 transition hover:bg-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-200"><Send size={16} />{editing ? "Save changes" : "Save as draft"}</button></div></form>
    </section>
    <section className="mt-8"><div className="mb-4 flex items-center gap-2"><FileImage className="text-green-700" size={20} /><h2 className="text-lg font-bold text-gray-950">Your announcements</h2></div>{loading ? <p className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading announcements…</p> : !posters.length ? <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center"><FileImage className="mx-auto text-gray-300" size={30} /><p className="mt-3 font-semibold text-gray-700">No announcements yet</p><p className="mt-1 text-sm text-gray-500">Your saved drafts and published posters will appear here.</p></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{posters.map((poster) => <article key={poster.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="flex h-40 items-center justify-center bg-stone-100">{poster.fileType === "IMAGE" ? <img src={poster.fileUrl} alt="" className="h-full w-full object-contain" /> : <div className="flex items-center gap-2 text-sm font-medium text-gray-500"><FileText size={20} /> PDF document</div>}</div><div className="p-4"><div className="flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-stone-100 px-2 py-1 text-gray-600">{poster.category.replaceAll("_", " ")}</span><span className={`rounded-full px-2 py-1 ${poster.isPublished ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{poster.isPinned ? "Pinned" : poster.isPublished ? "Published" : "Draft"}</span></div><h3 className="mt-3 font-bold text-gray-900">{poster.title}</h3>{poster.caption && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{poster.caption}</p>}<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold"><button onClick={() => action(poster, poster.isPublished ? "unpublish" : "publish")} className="text-green-700 hover:text-green-800">{poster.isPublished ? "Unpublish" : "Publish"}</button><button disabled={!poster.isPublished} onClick={() => action(poster, poster.isPinned ? "unpin" : "pin")} className="inline-flex items-center gap-1 text-amber-700 disabled:cursor-not-allowed disabled:text-gray-300"><Pin size={14} />{poster.isPinned ? "Unpin" : "Pin"}</button><button onClick={() => startEdit(poster)} className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"><Pencil size={14} />Edit</button><button onClick={() => remove(poster)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"><Trash2 size={14} />Delete</button></div></div></article>)}</div>}</section>
  </main></div></div>;
}
