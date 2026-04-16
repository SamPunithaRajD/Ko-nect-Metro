import React, { useEffect, useState } from 'react';
import { Train, Ship, MapPin, Circle } from 'lucide-react';
import { supabase, Vehicle } from '../../lib/supabase';

export const RouteMap: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [viewMode, setViewMode] = useState<'metro' | 'water' | 'both'>('both');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'service');

      if (error) throw error;
      if (data) setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const metroStations = [
    'Aluva', 'Kalamassery', 'Cochin University', 'Pathadipalam', 'Edachira',
    'Changampuzha Park', 'Palarivattom', 'JLN Stadium', 'Kaloor', 'Town Hall',
    'MG Road', 'Maharajas College', 'Ernakulam South', 'Kadavanthra',
    'Elamkulam', 'Vyttila', 'Thaikoodam', 'Petta', 'SN Junction'
  ];

  const waterJetties = [
    'Vypeen', 'High Court', 'Bolgatty', 'Fort Kochi', 'Mattancherry',
    'Willingdon Island', 'Embankment', 'Kakkanad', 'Eloor', 'Aroor',
    'Vaikom', 'Cherai', 'Munambam', 'Ernakulam Wharf', 'Kumbalam',
    'Thoppumpady', 'Vallarpadam', 'Mulavukad'
  ];

  const activeMetroTrains = vehicles.filter(v => v.vehicle_type === 'metro_train');
  const activeWaterBoats = vehicles.filter(v => v.vehicle_type === 'water_boat');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Route Maps</h2>
        <p className="text-gray-600 mt-1">Complete Kochi Metro and Water Metro network overview</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('both')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'both'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Both Networks
          </button>
          <button
            onClick={() => setViewMode('metro')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'metro'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Train className="w-4 h-4 inline mr-2" />
            Metro Only
          </button>
          <button
            onClick={() => setViewMode('water')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'water'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Ship className="w-4 h-4 inline mr-2" />
            Water Only
          </button>
        </div>
      </div>

      {(viewMode === 'metro' || viewMode === 'both') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Train className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Kochi Metro Network</h3>
              <p className="text-sm text-gray-600">{activeMetroTrains.length} trains currently in service</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <div className="font-medium text-blue-900 mb-2">Line 1: Aluva - SN Junction</div>
              <div className="text-sm text-blue-800">25 stations • 25.6 km • Operational</div>
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-col gap-3">
              {metroStations.map((station, index) => (
                <div key={station} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-4 h-4 rounded-full ${
                      index === 0 || index === metroStations.length - 1
                        ? 'bg-blue-600'
                        : 'bg-blue-400'
                    } ring-4 ring-blue-100`} />
                    <div className="flex-1 bg-gray-50 rounded-lg px-4 py-2">
                      <div className="font-medium text-gray-900">{station}</div>
                      {index === 0 && <div className="text-xs text-blue-600">Terminal Station - North</div>}
                      {index === metroStations.length - 1 && <div className="text-xs text-blue-600">Terminal Station - South</div>}
                    </div>
                  </div>
                  {index < metroStations.length - 1 && (
                    <div className="h-8 w-1 bg-blue-300 ml-1.5" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Active Trains</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {activeMetroTrains.map(train => (
                <div key={train.id} className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="text-xs font-semibold text-green-900">{train.vehicle_number}</div>
                  <div className="text-xs text-green-700">{train.current_location}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(viewMode === 'water' || viewMode === 'both') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Ship className="w-6 h-6 text-cyan-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Kochi Water Metro Network</h3>
              <p className="text-sm text-gray-600">{activeWaterBoats.length} boats currently in service</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-cyan-50 border-l-4 border-cyan-600 p-4 rounded">
              <div className="font-medium text-cyan-900 mb-1">Vypeen - High Court Route</div>
              <div className="text-sm text-cyan-800">Primary route • High frequency</div>
            </div>
            <div className="bg-cyan-50 border-l-4 border-cyan-600 p-4 rounded">
              <div className="font-medium text-cyan-900 mb-1">Fort Kochi - Mattancherry Route</div>
              <div className="text-sm text-cyan-800">Tourist route • Regular service</div>
            </div>
            <div className="bg-cyan-50 border-l-4 border-cyan-600 p-4 rounded">
              <div className="font-medium text-cyan-900 mb-1">Island Connection Routes</div>
              <div className="text-sm text-cyan-800">Multiple islands • Scheduled service</div>
            </div>
            <div className="bg-cyan-50 border-l-4 border-cyan-600 p-4 rounded">
              <div className="font-medium text-cyan-900 mb-1">Backwater Express Routes</div>
              <div className="text-sm text-cyan-800">Long distance • Premium service</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {waterJetties.map(jetty => (
              <div key={jetty} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                  <div className="text-sm font-medium text-gray-900">{jetty}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Active Boats</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {activeWaterBoats.map(boat => (
                <div key={boat.id} className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="text-xs font-semibold text-green-900">{boat.vehicle_number}</div>
                  <div className="text-xs text-green-700">{boat.current_location}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
