import React, { useEffect, useState } from 'react';
import { Train, Ship, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { supabase, Vehicle, Certificate } from '../../lib/supabase';

export const FleetManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filter, setFilter] = useState<'all' | 'metro_train' | 'water_boat'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vehiclesRes, certsRes] = await Promise.all([
        supabase.from('vehicles').select('*').order('vehicle_number'),
        supabase.from('certificates').select('*')
      ]);

      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      if (certsRes.data) setCertificates(certsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleCertificates = (vehicleId: string) => {
    return certificates.filter(c => c.vehicle_id === vehicleId);
  };

  const getExpiringCerts = (vehicleId: string) => {
    return certificates.filter(c => c.vehicle_id === vehicleId && c.status === 'expiring_soon');
  };

  const filteredVehicles = vehicles.filter(v => {
    if (filter !== 'all' && v.vehicle_type !== filter) return false;
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    return true;
  });

  const statusColors: Record<string, string> = {
    service: 'bg-green-100 text-green-800',
    maintenance: 'bg-red-100 text-red-800',
    cleaning: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-blue-100 text-blue-800',
    standby: 'bg-gray-100 text-gray-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading fleet data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Fleet Management</h2>
        <p className="text-gray-600 mt-1">Monitor and manage all vehicles in the KO-NECT network</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({vehicles.length})
              </button>
              <button
                onClick={() => setFilter('metro_train')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'metro_train'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Train className="w-4 h-4 inline mr-2" />
                Metro (25)
              </button>
              <button
                onClick={() => setFilter('water_boat')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'water_boat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Ship className="w-4 h-4 inline mr-2" />
                Water (40)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="service">In Service</option>
              <option value="maintenance">Maintenance</option>
              <option value="cleaning">Cleaning</option>
              <option value="ready">Ready</option>
              <option value="standby">Standby</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alerts
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => {
                const expiringCerts = getExpiringCerts(vehicle.id);
                const nextMaintenance = new Date(vehicle.next_maintenance);
                const daysUntilMaintenance = Math.ceil((nextMaintenance.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                return (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {vehicle.vehicle_type === 'metro_train' ? (
                          <Train className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Ship className="w-5 h-5 text-cyan-600" />
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">{vehicle.vehicle_number}</div>
                          <div className="text-sm text-gray-600">{vehicle.vehicle_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[vehicle.status]}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {vehicle.current_location}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {vehicle.capacity} passengers
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(vehicle.next_maintenance).toLocaleDateString()} ({daysUntilMaintenance}d)
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {expiringCerts.length > 0 && (
                        <div className="flex items-center gap-2 text-amber-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">{expiringCerts.length} cert expiring</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Showing {filteredVehicles.length} of {vehicles.length} vehicles
      </div>
    </div>
  );
};
