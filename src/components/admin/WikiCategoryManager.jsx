import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/mySupabaseClient';
import * as Icons from 'lucide-react';
import { Input } from '@/components/ui/input';

const iconOptions = Object.keys(Icons).filter(name => /^[A-Z]/.test(name) && name !== 'createReactComponent' && name !== 'icons' && typeof Icons[name] === 'function');


const WikiCategoryForm = ({ item, onSave, onCancel, parentCategoryId = null }) => {
    const [formData, setFormData] = useState({ name: '', icon_name: 'BookOpen', category_id: parentCategoryId });
    const formSelectClass = "w-full h-10 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm";

    useEffect(() => {
        if (item) setFormData({ name: item.name, icon_name: item.icon_name || 'BookOpen', category_id: item.category_id || parentCategoryId });
        else setFormData({ name: '', icon_name: 'BookOpen', category_id: parentCategoryId });
    }, [item, parentCategoryId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...item, ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">{item ? 'Edit' : 'New'} {parentCategoryId ? 'Subcategory' : 'Category'}</h3>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    required
                />
            </div>
            {!parentCategoryId && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                    <select
                        value={formData.icon_name}
                        onChange={(e) => setFormData(prev => ({...prev, icon_name: e.target.value}))}
                        className={formSelectClass}
                    >
                        {iconOptions.map(iconName => (
                            <option key={iconName} value={iconName}>{iconName}</option>
                        ))}
                    </select>
                </div>
            )}
            <div className="flex gap-2">
                <Button type="submit" className="bg-red-600 hover:bg-red-700">Save</Button>
                <Button type="button" onClick={onCancel} variant="outline">Cancel</Button>
            </div>
        </form>
    );
};

const WikiCategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingSubcategory, setEditingSubcategory] = useState(null);
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadCategories = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('wiki_categories').select('*, wiki_subcategories(*)').order('name', { ascending: true }).order('name', {foreignTable: 'wiki_subcategories', ascending: true});
        if (error) toast({ title: "Error", description: "Could not load categories.", variant: "destructive" });
        else setCategories(data);
        setLoading(false);
    }, [toast]);

    useEffect(() => { loadCategories(); }, [loadCategories]);

    const handleSaveCategory = async (category) => {
        const { id, wiki_subcategories, ...categoryData } = category;
        const { error } = id
            ? await supabase.from('wiki_categories').update(categoryData).eq('id', id)
            : await supabase.from('wiki_categories').insert(categoryData);

        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Saved!", description: "Category saved." });
            setShowCategoryForm(false);
            setEditingCategory(null);
            loadCategories();
        }
    };

    const handleDeleteCategory = async (id) => {
        const { error } = await supabase.from('wiki_categories').delete().eq('id', id);
        if (error) toast({ title: "Error", description: `Could not delete category: ${error.message}`, variant: "destructive" });
        else {
            toast({ title: "Deleted!", description: "Category deleted." });
            loadCategories();
        }
    };

    const handleSaveSubcategory = async (subcategory) => {
        const { id, ...subcategoryData } = subcategory;
        const { error } = id
            ? await supabase.from('wiki_subcategories').update(subcategoryData).eq('id', id)
            : await supabase.from('wiki_subcategories').insert(subcategoryData);

        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Saved!", description: "Subcategory saved." });
            setShowSubcategoryForm(false);
            setEditingSubcategory(null);
            setActiveCategoryId(null);
            loadCategories();
        }
    };

    const handleDeleteSubcategory = async (id) => {
        const { error } = await supabase.from('wiki_subcategories').delete().eq('id', id);
        if (error) toast({ title: "Error", description: `Could not delete subcategory: ${error.message}`, variant: "destructive" });
        else {
            toast({ title: "Deleted!", description: "Subcategory deleted." });
            loadCategories();
        }
    };
    
    const handleAddNewSubcategory = (categoryId) => {
        setEditingSubcategory(null);
        setShowSubcategoryForm(true);
        setActiveCategoryId(categoryId);
    };
    
    const handleEditSubcategory = (subcategory, categoryId) => {
        setEditingSubcategory(subcategory);
        setShowSubcategoryForm(true);
        setActiveCategoryId(categoryId);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Manage Wiki Categories</h2>
                <Button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }} className="gap-2 bg-red-600 hover:bg-red-700">
                    <Plus className="h-4 w-4" /> New Category
                </Button>
            </div>

            {showCategoryForm && <WikiCategoryForm item={editingCategory} onSave={handleSaveCategory} onCancel={() => setShowCategoryForm(false)} />}

            {loading ? <Loader2 className="h-8 w-8 animate-spin text-red-500" /> : (
                <div className="space-y-8">
                    {categories.map(category => {
                        const IconComponent = Icons[category.icon_name] || Icons.BookOpen;
                        return (
                            <div key={category.id} className="bg-white/5 border border-white/10 rounded-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <IconComponent className="h-6 w-6 text-red-400" />
                                        <span className="font-bold text-xl text-white">{category.name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={() => { setEditingCategory(category); setShowCategoryForm(true);}} variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                                        <Button onClick={() => handleDeleteCategory(category.id)} variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-white mb-3">Subcategories</h3>
                                <div className="space-y-2 mb-4">
                                    {category.wiki_subcategories.map(sub => (
                                        <div key={sub.id} className="flex justify-between items-center bg-white/5 p-3 rounded-md">
                                            <span className="text-gray-300 ml-6 flex items-center gap-2"><ArrowRight className="h-4 w-4" /> {sub.name}</span>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleEditSubcategory(sub, category.id)} variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                                                <Button onClick={() => handleDeleteSubcategory(sub.id)} variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button 
                                    onClick={() => handleAddNewSubcategory(category.id)} 
                                    size="sm" 
                                    className="gap-2 bg-red-800 hover:bg-red-900"
                                >
                                    <Plus className="h-4 w-4" /> Add Subcategory
                                </Button>
                                {showSubcategoryForm && activeCategoryId === category.id && (
                                    <div className="mt-4">
                                        <WikiCategoryForm 
                                            item={editingSubcategory} 
                                            onSave={handleSaveSubcategory} 
                                            onCancel={() => { setShowSubcategoryForm(false); setActiveCategoryId(null); }}
                                            parentCategoryId={category.id} 
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default WikiCategoryManager;
