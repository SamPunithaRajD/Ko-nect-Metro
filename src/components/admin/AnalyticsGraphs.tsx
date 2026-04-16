import React from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, AlertTriangle, Users, Ship, Train } from 'lucide-react';
import {
  RidershipData, FleetAvailability, DriverAvailability,
  DemandPeriod, TerminalLoad
} from '../../lib/analyticsData';

// KMRL Theme Colors
const COLORS = {
  metroBlue: '#005DAA',
  kmrlRed: '#E31837',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  gray: '#6B7280',
  lightGray: '#E5E7EB'
};

// ========== Ridership Trend Chart ==========
export const RidershipTrendChart: React.FC<{ data: RidershipData[] }> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-gray-600" />
        <h3 className="text-base font-bold text-gray-900">Ridership Trend & Prediction</h3>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.lightGray} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke={COLORS.gray} />
          <YAxis tick={{ fontSize: 12 }} stroke={COLORS.gray} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: `1px solid ${COLORS.lightGray}`,
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="metro"
            stroke={COLORS.metroBlue}
            strokeWidth={2}
            dot={(props: any) => {
              const isPred = data[props.index]?.predicted;
              return <circle cx={props.cx} cy={props.cy} r={isPred ? 5 : 4} fill={isPred ? 'white' : COLORS.metroBlue} stroke={COLORS.metroBlue} strokeWidth={2} />;
            }}
            name="Metro Trains"
          />
          <Line
            type="monotone"
            dataKey="water"
            stroke={COLORS.kmrlRed}
            strokeWidth={2}
            dot={(props: any) => {
              const isPred = data[props.index]?.predicted;
              return <circle cx={props.cx} cy={props.cy} r={isPred ? 5 : 4} fill={isPred ? 'white' : COLORS.kmrlRed} stroke={COLORS.kmrlRed} strokeWidth={2} />;
            }}
            name="Water Metro"
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
        <span className="inline-block w-3 h-0.5 bg-gray-400" style={{ borderTop: '2px dashed' }}></span>
        Dashed line indicates tomorrow's AI prediction
      </p>
    </div>
  );
};

// ========== Fleet Availability Chart ==========
export const FleetAvailabilityChart: React.FC<{ data: FleetAvailability[] }> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Train className="w-5 h-5 text-gray-600" />
        <h3 className="text-base font-bold text-gray-900">Fleet Availability Overview</h3>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.lightGray} />
          <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke={COLORS.gray} />
          <YAxis tick={{ fontSize: 12 }} stroke={COLORS.gray} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: `1px solid ${COLORS.lightGray}`,
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="rect"
          />
          <Bar dataKey="running" fill={COLORS.success} name="Running" radius={[4, 4, 0, 0]} />
          <Bar dataKey="standby" fill={COLORS.warning} name="Standby" radius={[4, 4, 0, 0]} />
          <Bar dataKey="maintenance" fill={COLORS.error} name="Maintenance" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ========== Driver Availability Chart ==========
export const DriverAvailabilityChart: React.FC<{ data: DriverAvailability[] }> = ({ data }) => {
  const hasShortage = data.some(d => d.shortage > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-base font-bold text-gray-900">Driver Availability vs Required</h3>
        </div>
        {hasShortage && (
          <div className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            Shortage Alert
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.lightGray} />
          <XAxis dataKey="shift" tick={{ fontSize: 12 }} stroke={COLORS.gray} />
          <YAxis tick={{ fontSize: 12 }} stroke={COLORS.gray} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: `1px solid ${COLORS.lightGray}`,
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="rect"
          />
          <Bar dataKey="required" fill={COLORS.metroBlue} name="Required" radius={[4, 4, 0, 0]} />
          <Bar dataKey="available" fill={COLORS.success} name="Available" radius={[4, 4, 0, 0]} />
          <Bar dataKey="shortage" fill={COLORS.error} name="Shortage" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ========== Today Demand Chart (Employee) ==========
export const TodayDemandChart: React.FC<{ data: DemandPeriod[] }> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-bold text-gray-900">Today's Demand Forecast</h3>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.lightGray} />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke={COLORS.gray} />
          <YAxis tick={{ fontSize: 11 }} stroke={COLORS.gray} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: `1px solid ${COLORS.lightGray}`,
              borderRadius: '8px',
              fontSize: '11px'
            }}
          />
          <Line
            type="monotone"
            dataKey="passengers"
            stroke={COLORS.metroBlue}
            strokeWidth={2}
            dot={(props: any) => {
              const isPeak = data[props.index]?.isPeak;
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={isPeak ? 5 : 3}
                  fill={isPeak ? COLORS.kmrlRed : COLORS.metroBlue}
                  stroke="white"
                  strokeWidth={2}
                />
              );
            }}
            name="Passengers"
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-red-600"></span>
        Peak hours: 08:00–10:00, 17:00–19:00
      </p>
    </div>
  );
};

// ========== Terminal Load Chart (Water Employee) ==========
export const TerminalLoadChart: React.FC<{ data: TerminalLoad[] }> = ({ data }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'high': return COLORS.kmrlRed;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.gray;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Ship className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-bold text-gray-900">Terminal Load Distribution</h3>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.lightGray} />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke={COLORS.gray} />
          <YAxis dataKey="terminal" type="category" tick={{ fontSize: 11 }} stroke={COLORS.gray} width={80} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: `1px solid ${COLORS.lightGray}`,
              borderRadius: '8px',
              fontSize: '11px'
            }}
          />
          <Bar dataKey="load" name="Passengers" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-3 mt-2 text-xs">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-600"></span>High</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-600"></span>Medium</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-600"></span>Low</span>
      </div>
    </div>
  );
};
