import { supabase } from '@/lib/supabase';
import ResourceGrid from '@/components/ResourceGrid';

export default async function ResourcesPage() {
  // Fetch files and their categories from the database
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
    let catName = 'Uncategorized';

    if (file.categories) {
      if (Array.isArray(file.categories)) {
        catName = file.categories[0]?.name || 'Uncategorized';
      } else {
        const cat = file.categories as any;
        catName = cat.name || 'Uncategorized';
      }
    }

    if (!categoriesMap[catName]) categoriesMap[catName] = [];
    categoriesMap[catName].push(file);
  });

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-slate-900">Medical Study Atlas</h1>
      <p className="text-center text-slate-600 mb-12">Access all lecture materials and resources</p>

      <ResourceGrid categoriesMap={categoriesMap} />
    </div>
  );
}
