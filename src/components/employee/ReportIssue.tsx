import React, { useEffect, useState, useRef } from 'react';
import {
  AlertCircle, Upload, Send, Camera, X, CheckCircle,
  Train, Ship, FileImage, Loader2
} from 'lucide-react';
import { supabase, Vehicle } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useIssueStore } from '../../contexts/IssueStore';

export const ReportIssue: React.FC<{
  onNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}> = ({ onNotification }) => {
  const { user } = useAuth();
  const { addIssue } = useIssueStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [description, setDescription] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const vehicleType = user?.role === 'metro_employee' ? 'metro_train' : 'water_boat';

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('vehicle_type', vehicleType)
        .order('vehicle_number');

      if (error) throw error;
      if (data) setVehicles(data);
    } catch (err) {
      console.error('Error loading vehicles:', err);
    }
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onNotification('error', 'Only image files are accepted (JPG, PNG, WEBP, etc.)');
      return;
    }
    setPhotoLoading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPhotoDataUrl(dataUrl);
      setPhotoFileName(file.name);
    } catch {
      onNotification('error', 'Failed to read image file');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedVehicle || !description.trim()) return;

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 700));

    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    if (!vehicle) {
      onNotification('error', 'Vehicle not found');
      setSubmitting(false);
      return;
    }

    addIssue({
      reportedBy: user.id,
      reportedByName: user.full_name,
      vehicleId: vehicle.id,
      vehicleName: vehicle.vehicle_name,
      vehicleNumber: vehicle.vehicle_number,
      vehicleType: vehicle.vehicle_type,
      issueDescription: description.trim(),
      photoDataUrl: photoDataUrl ?? undefined,
      photoFileName: photoFileName ?? undefined,
    });

    setSubmitting(false);
    setSubmitted(true);
    onNotification('success', 'Issue reported to control center');

    setTimeout(() => {
      setSelectedVehicle('');
      setDescription('');
      setPhotoDataUrl(null);
      setPhotoFileName(null);
      setSubmitted(false);
    }, 3500);
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report Issue</h2>
          <p className="text-gray-600 mt-1">Report problems or issues with assigned vehicles</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-5">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">Issue reported to control center</h3>
          <p className="text-green-700 text-sm">Your report has been received. Admin will review and take action.</p>
          <p className="text-green-500 text-xs mt-3">Returning to form shortly…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Report Issue</h2>
        <p className="text-gray-600 mt-1">Report problems or issues with assigned vehicles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {vehicleType === 'metro_train' ? (
                  <span className="flex items-center gap-1.5"><Train className="w-4 h-4 text-blue-600" />Select Metro Train *</span>
                ) : (
                  <span className="flex items-center gap-1.5"><Ship className="w-4 h-4 text-cyan-600" />Select Water Metro Boat *</span>
                )}
              </label>
              <select
                value={selectedVehicle}
                onChange={e => setSelectedVehicle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">Choose a vehicle…</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.vehicle_number} — {v.vehicle_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Description *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={6}
                placeholder="Describe the issue in detail — include location on vehicle, when it was noticed, and any sounds or visual signs…"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{description.length} characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-1.5"><Camera className="w-4 h-4 text-gray-500" />Attach Photo (Optional)</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
              />
              {photoDataUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={photoDataUrl}
                    alt="Issue preview"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 px-3 py-2 flex items-center justify-between">
                    <span className="text-white text-xs font-medium truncate max-w-[200px]">{photoFileName}</span>
                    <button
                      type="button"
                      onClick={() => { setPhotoDataUrl(null); setPhotoFileName(null); }}
                      className="text-white bg-red-500 hover:bg-red-600 rounded-full p-1 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {photoLoading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-sm text-gray-500">Loading image…</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className={`p-3 rounded-xl transition-colors ${dragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <FileImage className={`w-7 h-7 ${dragOver ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {dragOver ? 'Drop image here' : 'Click or drag to attach a photo'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP — stored locally, not uploaded</p>
                      </div>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Choose Photo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedVehicle || !description.trim()}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Sending to Control Center…</>
              ) : (
                <><Send className="w-5 h-5" />Submit Issue Report</>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-5">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Reporting Guidelines</h3>
                <ul className="text-sm text-amber-800 space-y-1.5">
                  <li>• Provide a detailed description of the issue</li>
                  <li>• Select the exact vehicle experiencing problems</li>
                  <li>• Attach a photo when possible for better clarity</li>
                  <li>• Reports go directly to the Admin Control Center</li>
                  <li>• Admin will review and take appropriate action</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Common Issues to Report</h3>
            <ul className="text-sm text-blue-800 space-y-1.5">
              <li>• Mechanical problems or unusual sounds</li>
              <li>• Door or window malfunctions</li>
              <li>• Air conditioning or heating issues</li>
              <li>• Safety equipment concerns</li>
              <li>• Cleanliness or maintenance needs</li>
              <li>• Any safety hazards or risks</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="font-semibold text-gray-900 text-sm">Control Center Status</h3>
            </div>
            <p className="text-sm text-gray-600">Reports submitted here are instantly visible in the Admin Operations Issue Inbox. No server upload required.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
