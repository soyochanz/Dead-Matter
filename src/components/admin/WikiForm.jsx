import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';

const WikiForm = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    subcategory_id: ''
  });
  const [subcategories, setSubcategories] = useState([]);
  const formInputClass = "w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500";

  useEffect(() => {
    const fetchSubcategories = async () => {
      const { data, error } = await supabase.from('wiki_subcategories').select('id, name, wiki_categories(name)');
      if (error) console.error(error);
      else setSubcategories(data);
    };
    fetchSubcategories();
  }, []);

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        content: item.content || '',
        subcategory_id: item.subcategory_id || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        content: '',
        subcategory_id: ''
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={formInputClass}
          required
        />
      </div>

       <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Subcategory</label>
        <select
          value={formData.subcategory_id}
          onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
          className={formInputClass}
          required
        >
          <option value="">Select a subcategory</option>
          {subcategories.map(sub => (
            <option key={sub.id} value={sub.id}>{sub.wiki_categories.name} / {sub.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={formInputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className={`${formInputClass} min-h-[150px]`}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-red-600 hover:bg-red-700">
          {item ? 'Update' : 'Create'}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default WikiForm;