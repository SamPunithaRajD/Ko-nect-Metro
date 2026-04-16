import React from 'react';
import {
  Train, Clock, CheckCircle, Inbox, Calendar,
  AlertCircle, Shield, MapPin, Info, Users
} from 'lucide-react';
import { useDriverStore, SHIFTS } from '../../contexts/DriverStore';

export const DriverAssignment: React.FC = () => {
  const { metroAssignments, assignmentPublished, metroDrivers } = useDriverStore();

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  if (!assignmentPublished || metroAssignments.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Metro Rail — Driver Assignment List</h2>
          <p className="text-gray-500 mt-0.5 text-sm">Official crew allocation for today's metro rail operations</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4">
          <div className="p-2.5 bg-amber-100 rounded-xl flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">Assignment List Not Yet Published</h3>
            <p className="text-sm text-amber-800">
              The Admin Control Center has not yet approved and published today's operational plan.
              Metro driver assignments will appear here once the plan is approved.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Inbox className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">No assignments available yet</p>
          <p className="text-gray-400 text-sm mt-1">Check back after the admin approves the daily operational plan</p>
        </div>
      </div>
    );
  }

  const totalAssigned = metroAssignments.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Metro Rail — Driver Assignment List</h2>
          <p className="text-gray-500 mt-0.5 text-sm">Official crew allocation for today's metro rail operations</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-green-700">Published by Control Center</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-5 text-white">
        <div className="flex items-center gap-3 mb-1">
          <Calendar className="w-5 h-5 text-blue-300" />
          <span className="text-sm text-blue-200">Operational Date</span>
        </div>
        <p className="text-xl font-bold">{today}</p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-sm text-blue-200">
            <Users className="w-4 h-4" />
            {totalAssigned} metro drivers assigned
          </div>
          <div className="flex items-center gap-1.5 text-sm text-blue-200">
            <Train className="w-4 h-4" />
            {new Set(metroAssignments.map(a => a.vehicleId)).size} trains in service
          </div>
        </div>
      </div>

      {SHIFTS.map(shift => {
        const shiftAssignments = metroAssignments.filter(a => a.shift === shift.id);
        if (shiftAssignments.length === 0) {
          return (
            <div key={shift.id} className={`bg-white rounded-xl border-2 ${shift.border} overflow-hidden`}>
              <div className={`px-5 py-3 flex items-center gap-3 ${shift.bg}`}>
                <Clock className={`w-4 h-4 ${shift.color}`} />
                <span className={`font-bold ${shift.color}`}>{shift.label}</span>
                <span className={`text-sm ${shift.color} opacity-70`}>{shift.hours}</span>
              </div>
              <div className="px-5 py-6 text-center">
                <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                  <Info className="w-4 h-4" />No metro drivers assigned for this shift
                </p>
              </div>
            </div>
          );
        }

        return (
          <div key={shift.id} className={`bg-white rounded-xl border-2 ${shift.border} overflow-hidden shadow-sm`}>
            <div className={`px-5 py-3 flex items-center gap-3 ${shift.bg}`}>
              <Clock className={`w-4 h-4 ${shift.color}`} />
              <span className={`font-bold ${shift.color}`}>{shift.label}</span>
              <span className={`text-sm ${shift.color} opacity-70`}>{shift.hours}</span>
              <span className={`ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/60 ${shift.color}`}>
                {shiftAssignments.length} driver{shiftAssignments.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Driver</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Employee ID</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Assigned Train</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Experience</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {shiftAssignments.map((a, idx) => {
                    const driver = metroDrivers.find(d => d.id === a.driverId);
                    return (
                      <tr key={a.driverId} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3 text-xs text-gray-400 font-mono">#{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {a.driverName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="font-semibold text-gray-900 text-sm">{a.driverName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500 font-mono">{a.employeeId}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5 font-semibold text-blue-700 text-sm">
                            <Train className="w-3.5 h-3.5" />{a.vehicleNumber}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{a.vehicleName}</div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-600">{driver?.experience ?? '—'}y</td>
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full w-fit">
                            <CheckCircle className="w-3 h-3" />Assigned
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={`px-5 py-2.5 border-t ${shift.border} ${shift.bg} flex items-center gap-2`}>
              <Shield className={`w-3.5 h-3.5 ${shift.color}`} />
              <p className={`text-xs ${shift.color} font-medium`}>
                One shift per driver — no double duty. All drivers have valid operating licenses.
              </p>
            </div>
          </div>
        );
      })}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900 text-sm mb-1">Metro Rail Reporting Instructions</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Morning shift drivers report to Muttom Depot by <strong>04:30</strong></li>
            <li>• Afternoon shift drivers report by <strong>12:30</strong></li>
            <li>• Night shift drivers report by <strong>17:30</strong></li>
            <li>• Carry employee ID card and valid driving license at all times</li>
            <li>• Contact the Control Center immediately if unable to report for duty</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
