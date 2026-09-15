import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function ResourcesPage() {
  // Use the existing client from lib/supabase
  const { data: files, error } = await supabase
    .from('files')
    .select('file_name, storage_path, categories(name)')
    .order('file_name', { ascending: true });

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading resources: {error.message}</div>;
  }

  // Group files by category
  const categoriesMap: Record<string, any[]> = {};
  files?.forEach(file => {
    const catName = file.categories?.name || 'Uncategorized';
    if (!categoriesMap[catName]) categoriesMap[catName] = [];
    categoriesMap[catName].push(file);
  });

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-slate-900">Medical Study Atlas</h1>
      <p className="text-center text-slate-600 mb-12">Access all lecture materials and resources</p>

      <div className="grid gap-12">
        {Object.entries(categoriesMap).map(([category, items]) => (
          <section key={category} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">{category}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {items.map((file, idx) => (
                <a 
                  key={idx}
                  href={`https://fkrhjhfwzaqdntyoysog.supabase.co/storage/v1/object/public/resources/${file.storage_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-lg border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    PDF
                  </div>
                  <span className="text-sm text-slate-700 truncate">{file.file_name}</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
