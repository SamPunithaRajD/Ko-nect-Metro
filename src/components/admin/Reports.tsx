import React, { useEffect, useState } from 'react';
import { FileText, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { supabase, AIReport } from '../../lib/supabase';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<AIReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_reports')
        .select('*')
        .order('report_date', { ascending: false });

      if (error) throw error;
      if (data) {
        setReports(data);
        if (data.length > 0) setSelectedReport(data[0]);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportTypeLabels: Record<string, string> = {
    operational_analysis: 'Operational Analysis',
    maintenance_prediction: 'Maintenance Prediction',
    efficiency_report: 'Efficiency Report',
  };

  const reportTypeColors: Record<string, string> = {
    operational_analysis: 'bg-blue-100 text-blue-800',
    maintenance_prediction: 'bg-amber-100 text-amber-800',
    efficiency_report: 'bg-green-100 text-green-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI Reports</h2>
        <p className="text-gray-600 mt-1">Previously generated AI analysis and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className={`bg-white border rounded-lg p-4 cursor-pointer transition ${
                selectedReport?.id === report.id
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${reportTypeColors[report.report_type]}`}>
                  {reportTypeLabels[report.report_type]}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-1 capitalize">{report.vehicle_type} Metro</div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {new Date(report.report_date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${reportTypeColors[selectedReport.report_type]}`}>
                    {reportTypeLabels[selectedReport.report_type]}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 capitalize">
                    {selectedReport.vehicle_type} Metro Operations
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedReport.report_date).toLocaleDateString()}
                  </div>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Key Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedReport.report_data).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {typeof value === 'number' ? (
                          value % 1 === 0 ? value : value.toFixed(1)
                        ) : Array.isArray(value) ? (
                          value.length
                        ) : (
                          String(value)
                        )}
                        {key.includes('percentage') || key.includes('efficiency') || key.includes('performance') ? '%' : ''}
                        {key.includes('cost') && typeof value === 'number' ? ' ₹' : ''}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">AI Insights</h4>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <p className="text-gray-800 leading-relaxed">{selectedReport.insights}</p>
                </div>
              </div>

              {selectedReport.report_type === 'maintenance_prediction' && selectedReport.report_data.predicted_failures && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Predicted Issues</h4>
                  <div className="space-y-2">
                    {(selectedReport.report_data.predicted_failures as string[]).map((failure, index) => (
                      <div key={index} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span className="text-sm text-amber-900">{failure}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Select a report to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
