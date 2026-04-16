import React, { useEffect, useState } from 'react';
import { Calendar, Download, FileText, Train, Ship, CheckCircle } from 'lucide-react';
import { supabase, OperationalPlan } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const EmployeeHistory: React.FC<{ onNotification: (type: 'success' | 'error' | 'info', message: string) => void }> = ({ onNotification }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<OperationalPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const isMetro = user?.role === 'metro_employee';
  const Icon = isMetro ? Train : Ship;
  const accentColor = isMetro ? 'blue' : 'cyan';

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('operational_plans')
        .select('*')
        .eq('status', 'sent')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPlans(data);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPlan = (plan: OperationalPlan) => {
    const d = plan.plan_data;
    const section = isMetro ? d?.metro_trains : d?.water_boats;
    const assignments: any[] = section?.assignments ?? [];
    const vehicleLabel = isMetro ? 'Metro Trains' : 'Water Boats';

    const formatGroup = (list: any[]) => {
      if (!list.length) return '  (none)\n';
      return list.map(a => `  • ${a.vehicle_number} (${a.vehicle_name}) — ${a.status}${a.manually_edited ? ' [admin reviewed]' : ''}`).join('\n') + '\n';
    };

    const content = [
      '================================================================',
      `     KO-NECT APPROVED OPERATIONAL PLAN — ${vehicleLabel.toUpperCase()}`,
      '================================================================',
      '',
      `Plan Date   : ${new Date(plan.plan_date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`,
      `Approved At : ${new Date(plan.approved_at || plan.created_at).toLocaleString()}`,
      `Plan ID     : ${plan.id}`,
      `AI Confidence: ${plan.ai_confidence.toFixed(1)}%`,
      '',
      '----------------------------------------------------------------',
      `  ${vehicleLabel.toUpperCase()} SUMMARY`,
      '----------------------------------------------------------------',
      `  Total         : ${section?.total ?? 0}`,
      `  In Service    : ${section?.service ?? 0}`,
      `  In Maintenance: ${section?.maintenance ?? 0}`,
      `  Standby/Ready : ${section?.standby ?? 0}`,
      '',
      '  IN SERVICE:',
      formatGroup(assignments.filter((a: any) => a.status === 'service')),
      '  IN MAINTENANCE:',
      formatGroup(assignments.filter((a: any) => a.status === 'maintenance')),
      '  STANDBY / READY:',
      formatGroup(assignments.filter((a: any) => a.status === 'standby' || a.status === 'ready')),
      '',
      '================================================================',
      '  KO-NECT Metro Operations Control System',
      `  Downloaded: ${new Date().toLocaleString()}`,
      '================================================================',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KONECT-${isMetro ? 'Metro' : 'Water'}-Plan-${plan.plan_date}-${plan.id.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onNotification('success', 'Plan downloaded successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Approved Plans History</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Last 7 days of approved {isMetro ? 'metro train' : 'water boat'} operational plans
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg flex items-start gap-3">
        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-medium text-blue-900">7-Day Archive</div>
          <div className="text-sm text-blue-700">
            Showing {isMetro ? 'metro train' : 'water boat'} data only — download includes full vehicle assignment details
          </div>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No approved plans in the last 7 days</p>
          <p className="text-gray-400 text-sm mt-1">Plans appear here after admin approves and sends an operational plan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => {
            const section = isMetro ? plan.plan_data?.metro_trains : plan.plan_data?.water_boats;
            return (
              <div key={plan.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`bg-${accentColor}-100 p-2.5 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${accentColor}-600`} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {new Date(plan.plan_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-0.5">
                      <CheckCircle className="w-3 h-3" /> Approved & Delivered
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-xs text-gray-400">AI Score</div>
                    <div className="text-sm font-bold text-gray-700">{plan.ai_confidence.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">In Service</span>
                    <span className="font-semibold text-green-600">{section?.service ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Maintenance</span>
                    <span className="font-semibold text-red-600">{section?.maintenance ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Standby / Ready</span>
                    <span className="font-semibold text-gray-600">{section?.standby ?? 0}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-1.5 flex justify-between text-sm">
                    <span className="text-gray-500">Total</span>
                    <span className="font-bold text-gray-800">{section?.total ?? 0}</span>
                  </div>
                </div>

                <button
                  onClick={() => downloadPlan(plan)}
                  className="mt-auto w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition"
                >
                  <Download className="w-4 h-4" />
                  Download Plan
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-sm text-gray-400">
        {plans.length} approved plan{plans.length !== 1 ? 's' : ''} in the last 7 days
      </p>
    </div>
  );
};
