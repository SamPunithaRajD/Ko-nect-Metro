import React, { useState } from 'react';
import {
  AlertCircle, Clock, Image as ImageIcon, User, Train, Ship,
  Inbox, ZoomIn, X, ChevronRight
} from 'lucide-react';
import { useIssueStore, LocalIssue } from '../../contexts/IssueStore';

const timeAgo = (date: Date): string => {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString();
};

export const IssueInbox: React.FC<{
  onNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}> = () => {
  const { issues } = useIssueStore();
  const [selectedIssue, setSelectedIssue] = useState<LocalIssue | null>(null);
  const [filter, setFilter] = useState<'all' | 'metro_train' | 'water_boat'>('all');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const filteredIssues = filter === 'all' ? issues : issues.filter(i => i.vehicleType === filter);
  const metroCount = issues.filter(i => i.vehicleType === 'metro_train').length;
  const waterCount = issues.filter(i => i.vehicleType === 'water_boat').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Operations Issue Inbox</h2>
          <p className="text-gray-500 mt-0.5 text-sm">Employee-reported issues received from field operations</p>
        </div>
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm font-semibold text-red-700">{issues.length} issue{issues.length !== 1 ? 's' : ''} received</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All Issues', count: issues.length },
          { key: 'metro_train', label: 'Metro Trains', count: metroCount },
          { key: 'water_boat', label: 'Water Metro', count: waterCount },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
              filter === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
            }`}
          >
            {tab.key === 'metro_train' && <Train className="w-3.5 h-3.5" />}
            {tab.key === 'water_boat' && <Ship className="w-3.5 h-3.5" />}
            {tab.label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {issues.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-16 text-center">
          <Inbox className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-base">No issues reported yet</p>
          <p className="text-gray-400 text-sm mt-1">Employee issue reports will appear here instantly when submitted</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {filteredIssues.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500 text-sm">No issues in this category</p>
              </div>
            ) : (
              filteredIssues.map(issue => (
                <button
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`w-full text-left bg-white border rounded-xl p-4 transition hover:shadow-md ${
                    selectedIssue?.id === issue.id
                      ? 'border-blue-500 shadow-md ring-1 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {issue.vehicleType === 'metro_train' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex-shrink-0">
                          <Train className="w-3 h-3" />Metro
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full flex-shrink-0">
                          <Ship className="w-3 h-3" />Water
                        </span>
                      )}
                      <span className="font-semibold text-gray-900 truncate text-sm">{issue.vehicleName}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${selectedIssue?.id === issue.id ? 'text-blue-500' : 'text-gray-300'}`} />
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{issue.issueDescription}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(issue.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {issue.reportedByName}
                    </span>
                    {issue.photoDataUrl && (
                      <span className="flex items-center gap-1 text-blue-500 font-medium">
                        <ImageIcon className="w-3 h-3" />
                        Photo
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-3">
            {selectedIssue ? (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden sticky top-6">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${selectedIssue.vehicleType === 'metro_train' ? 'bg-blue-100' : 'bg-cyan-100'}`}>
                      {selectedIssue.vehicleType === 'metro_train'
                        ? <Train className="w-5 h-5 text-blue-700" />
                        : <Ship className="w-5 h-5 text-cyan-700" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{selectedIssue.vehicleName}</h3>
                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">{selectedIssue.vehicleNumber}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selectedIssue.createdAt.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{selectedIssue.reportedByName}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Issue Description</h4>
                    <p className="text-gray-800 text-sm leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-100">
                      {selectedIssue.issueDescription}
                    </p>
                  </div>

                  {selectedIssue.photoDataUrl ? (
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Attached Photo</h4>
                      <div className="relative group rounded-xl overflow-hidden border border-gray-200 cursor-zoom-in" onClick={() => setLightboxSrc(selectedIssue.photoDataUrl!)}>
                        <img
                          src={selectedIssue.photoDataUrl}
                          alt="Issue photo"
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 px-3 py-2">
                          <span className="text-white text-xs font-medium">{selectedIssue.photoFileName}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        Click to view full size
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <ImageIcon className="w-4 h-4" />
                      No photo attached to this report
                    </div>
                  )}

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">This report is read-only. Coordinate action through the Operations Panel or contact the employee directly.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-16 text-center h-full flex flex-col items-center justify-center">
                <Inbox className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">Select an issue to view details</p>
                <p className="text-gray-400 text-sm mt-1">{filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} in this view</p>
              </div>
            )}
          </div>
        </div>
      )}

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
            onClick={() => setLightboxSrc(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxSrc}
            alt="Issue photo fullsize"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
