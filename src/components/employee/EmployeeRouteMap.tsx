import React, { useEffect, useState } from 'react';
import { Train, Ship, MapPin } from 'lucide-react';
import { supabase, Vehicle } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const EmployeeRouteMap: React.FC = () => {
  const { user } = useAuth();
  const [myVehicles, setMyVehicles] = useState<Vehicle[]>([]);

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
        .eq('assigned_to', user?.id);

      if (error) throw error;
      if (data) setMyVehicles(data);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {vehicleType === 'metro_train' ? 'Metro Route Map' : 'Water Metro Route Map'}
        </h2>
        <p className="text-gray-600 mt-1">Your assigned vehicles are highlighted</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Icon className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {vehicleType === 'metro_train' ? 'Kochi Metro Network' : 'Kochi Water Metro Network'}
            </h3>
            <p className="text-sm text-gray-600">
              {myVehicles.length} of your {vehicleType === 'metro_train' ? 'trains' : 'boats'} highlighted
            </p>
          </div>
        </div>

        {vehicleType === 'metro_train' ? (
          <>
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
                      </div>
                    </div>
                    {index < metroStations.length - 1 && (
                      <div className="h-8 w-1 bg-blue-300 ml-1.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-cyan-50 border-l-4 border-cyan-600 p-4 rounded">
                <div className="font-medium text-cyan-900 mb-1">Vypeen - High Court Route</div>
                <div className="text-sm text-cyan-800">Primary route • High frequency</div>
              </div>
              <div className="bg-cyan-50 border-l-4 border-cyan-600 p-4 rounded">
                <div className="font-medium text-cyan-900 mb-1">Fort Kochi - Mattancherry Route</div>
                <div className="text-sm text-cyan-800">Tourist route • Regular service</div>
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
          </>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">My Assigned Vehicles</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {myVehicles.map(vehicle => (
              <div
                key={vehicle.id}
                className={`border rounded-lg px-3 py-2 ${
                  vehicle.status === 'service'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="text-xs font-semibold text-gray-900">{vehicle.vehicle_number}</div>
                <div className="text-xs text-gray-700">{vehicle.current_location}</div>
                <div className={`text-xs font-medium capitalize mt-1 ${
                  vehicle.status === 'service' ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {vehicle.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
