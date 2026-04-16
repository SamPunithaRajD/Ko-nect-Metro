import React, { useEffect, useState } from 'react';
import { Train, Ship, Save } from 'lucide-react';
import { supabase, Vehicle } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const UpdateStatus: React.FC<{ onNotification: (type: 'success' | 'error' | 'info', message: string) => void }> = ({ onNotification }) => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [updates, setUpdates] = useState<Record<string, { status: string; notes: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const vehicleType = user?.role === 'metro_employee' ? 'metro_train' : 'water_boat';
  const Icon = vehicleType === 'metro_train' ? Train : Ship;

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('vehicle_type', vehicleType)
        .eq('assigned_to', user?.id)
        .order('vehicle_number');

      if (error) throw error;
      if (data) {
        setVehicles(data);
        const initialUpdates: Record<string, { status: string; notes: string }> = {};
        data.forEach(v => {
          initialUpdates[v.id] = { status: v.status, notes: '' };
        });
        setUpdates(initialUpdates);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (vehicleId: string, newStatus: string) => {
    setUpdates(prev => ({
      ...prev,
      [vehicleId]: { ...prev[vehicleId], status: newStatus }
    }));
  };

  const handleNotesChange = (vehicleId: string, notes: string) => {
    setUpdates(prev => ({
      ...prev,
      [vehicleId]: { ...prev[vehicleId], notes }
    }));
  };

  const saveUpdates = async () => {
    if (!user) return;

    setSaving(true);
    let updatedCount = 0;

    try {
      for (const vehicle of vehicles) {
        const update = updates[vehicle.id];
        if (update && update.status !== vehicle.status) {
          const { error: updateError } = await supabase
            .from('vehicles')
            .update({
              status: update.status,
              updated_at: new Date().toISOString()
            })
            .eq('id', vehicle.id);

          if (updateError) throw updateError;

          await supabase.from('vehicle_updates').insert({
            vehicle_id: vehicle.id,
            updated_by: user.id,
            previous_status: vehicle.status,
            new_status: update.status,
            notes: update.notes || 'Status updated by employee'
          });

          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        onNotification('success', `${updatedCount} vehicle(s) updated successfully`);
        await loadVehicles();
      } else {
        onNotification('info', 'No changes to save');
      }
    } catch (error) {
      console.error('Error saving updates:', error);
      onNotification('error', 'Failed to save updates');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Update Vehicle Status</h2>
          <p className="text-gray-600 mt-1">Update the operational status of your assigned vehicles</p>
        </div>
        <button
          onClick={saveUpdates}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save All Updates'}
        </button>
      </div>

      <div className="space-y-4">
        {vehicles.map((vehicle) => {
          const currentUpdate = updates[vehicle.id] || { status: vehicle.status, notes: '' };
          const hasChanges = currentUpdate.status !== vehicle.status;

          return (
            <div
              key={vehicle.id}
              className={`bg-white border rounded-xl p-6 transition ${
                hasChanges ? 'border-blue-500 shadow-md' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{vehicle.vehicle_number}</h3>
                      <p className="text-sm text-gray-600">{vehicle.vehicle_name}</p>
                      <p className="text-xs text-gray-500 mt-1">{vehicle.current_location}</p>
                    </div>
                    {hasChanges && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                        Modified
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Status: <span className="text-blue-600 capitalize">{vehicle.status}</span>
                      </label>
                      <select
                        value={currentUpdate.status}
                        onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="service">Service</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="ready">Ready</option>
                        <option value="standby">Standby</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={currentUpdate.notes}
                        onChange={(e) => handleNotesChange(vehicle.id, e.target.value)}
                        placeholder="Add any notes about this update..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {vehicles.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Icon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No vehicles assigned</p>
        </div>
      )}
    </div>
  );
};
