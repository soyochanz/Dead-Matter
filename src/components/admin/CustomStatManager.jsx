import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

export const CustomStatManager = ({ stats, setStats }) => {
    // Ensure stats is an object, default to empty if null/undefined
    const currentStats = stats || {};

    const handleAddStat = () => {
        setStats({ ...currentStats, '': '' });
    };

    const handleStatChange = (oldKey, newKey, newValue) => {
        const newStats = { ...currentStats };

        if (oldKey !== newKey) {
            delete newStats[oldKey];
        }

        newStats[newKey] = newValue;
        setStats(newStats);
    };

    const handleDeleteStat = (key) => {
        const newStats = { ...currentStats };
        delete newStats[key];
        setStats(newStats);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Custom Stats</h4>
                <Button onClick={handleAddStat} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" /> Add Stat
                </Button>
            </div>

            <div className="grid gap-4">
                {Object.entries(currentStats).map(([key, value], index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input
                            placeholder="Stat Name (e.g., Caliber)"
                            value={key}
                            onChange={(e) => handleStatChange(key, e.target.value, value)}
                            className="flex-1"
                        />
                        <Input
                            placeholder="Value (e.g., 9mm)"
                            value={value}
                            onChange={(e) => handleStatChange(key, key, e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeleteStat(key)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                {Object.keys(currentStats).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-700 rounded-md">
                        No custom stats added yet.
                    </p>
                )}
            </div>
        </div>
    );
};

export default CustomStatManager;
