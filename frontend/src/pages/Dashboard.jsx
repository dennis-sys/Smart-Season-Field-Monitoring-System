import { useEffect, useState } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard({ user }) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/fields').then(res => setFields(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  // Enhanced stats computation
  const stats = {
    total: fields.length,
    byStage: {
      Planted: fields.filter(f => f.current_stage === 'Planted').length,
      Growing: fields.filter(f => f.current_stage === 'Growing').length,
      Ready: fields.filter(f => f.current_stage === 'Ready').length,
      Harvested: fields.filter(f => f.current_stage === 'Harvested').length,
    },
    byStatus: {
      Active: fields.filter(f => f.status === 'Active').length,
      'At Risk': fields.filter(f => f.status === 'At Risk').length,
      Completed: fields.filter(f => f.status === 'Completed').length,
    },
    atRiskFields: fields.filter(f => f.status === 'At Risk'),
    active: fields.filter(f => f.status === 'Active').length,
    atRisk: fields.filter(f => f.status === 'At Risk').length,
    completed: fields.filter(f => f.status === 'Completed').length
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
        {user.role === 'admin' ? 'Admin Dashboard' : 'My Fields Dashboard'}
      </h1>

      {/* Top Level Stats - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <p className="text-gray-500 text-xs sm:text-sm">Total Fields</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg shadow">
          <p className="text-green-600 text-xs sm:text-sm">Active</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-700">{stats.active}</p>
        </div>
        <div className="bg-red-50 p-3 sm:p-4 rounded-lg shadow">
          <p className="text-red-600 text-xs sm:text-sm">At Risk</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-700">{stats.atRisk}</p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow">
          <p className="text-gray-600 text-xs sm:text-sm">Completed</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-700">{stats.completed}</p>
        </div>
      </div>

      {/* Stage Breakdown - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">📊 Crop Stage Breakdown</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded">
              <span className="text-blue-800 font-medium text-sm sm:text-base">Planted</span>
              <span className="text-xl sm:text-2xl font-bold text-blue-700">{stats.byStage.Planted}</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded">
              <span className="text-green-800 font-medium text-sm sm:text-base">Growing</span>
              <span className="text-xl sm:text-2xl font-bold text-green-700">{stats.byStage.Growing}</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-yellow-50 rounded">
              <span className="text-yellow-800 font-medium text-sm sm:text-base">Ready</span>
              <span className="text-xl sm:text-2xl font-bold text-yellow-700">{stats.byStage.Ready}</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-100 rounded">
              <span className="text-gray-800 font-medium text-sm sm:text-base">Harvested</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-700">{stats.byStage.Harvested}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">📈 Status Breakdown</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded">
              <div>
                <span className="text-green-800 font-medium block text-sm sm:text-base">Active Fields</span>
                <span className="text-xs text-green-600">Healthy progress</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-green-700">{stats.byStatus.Active}</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-red-50 rounded">
              <div>
                <span className="text-red-800 font-medium block text-sm sm:text-base">At Risk</span>
                <span className="text-xs text-red-600">Needs attention</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-red-700">{stats.byStatus['At Risk']}</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-100 rounded">
              <div>
                <span className="text-gray-800 font-medium block text-sm sm:text-base">Completed</span>
                <span className="text-xs text-gray-600">Harvested</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-700">{stats.byStatus.Completed}</span>
            </div>
          </div>
          
          {/* Quick Insights */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">💡 Quick Insights</h4>
            <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
              <li>• {((stats.byStatus.Active / stats.total) * 100 || 0).toFixed(1)}% of fields are active</li>
              <li>• {stats.byStage.Ready} fields ready for harvest</li>
              {stats.atRisk > 0 && (
                <li className="text-red-700 font-medium">• {stats.atRisk} fields need attention</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* At Risk Fields Alert */}
      {stats.atRiskFields.length > 0 && user.role === 'admin' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 mb-6 sm:mb-8 rounded">
          <h3 className="font-semibold text-red-800 mb-2 text-sm sm:text-base">⚠️ Fields Requiring Attention</h3>
          <div className="space-y-1 sm:space-y-2">
            {stats.atRiskFields.map(field => (
              <div key={field.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm">
                <span className="font-medium text-red-900">{field.name} ({field.crop_type})</span>
                <span className="text-red-700">Stage: {field.current_stage}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fields Table - Responsive */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
            {user.role === 'admin' ? 'All Fields' : 'My Assigned Fields'}
          </h3>
        </div>
        
        {/* Mobile Card View */}
        <div className="lg:hidden">
          {fields.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No fields found. Create one to get started!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {fields.map(f => (
                <div key={f.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{f.name}</h4>
                      <p className="text-sm text-gray-600">{f.crop_type}</p>
                    </div>
                    <StatusBadge status={f.status} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Planted: {new Date(f.planting_date).toLocaleDateString()}</span>
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                      {f.current_stage}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Agent: {f.profiles?.full_name || 'Unassigned'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-sm font-medium text-gray-600">Name</th>
                <th className="p-3 text-sm font-medium text-gray-600">Crop</th>
                <th className="p-3 text-sm font-medium text-gray-600">Planted</th>
                <th className="p-3 text-sm font-medium text-gray-600">Stage</th>
                <th className="p-3 text-sm font-medium text-gray-600">Status</th>
                <th className="p-3 text-sm font-medium text-gray-600">Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fields.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No fields found. Create one to get started!
                  </td>
                </tr>
              ) : (
                fields.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{f.name}</td>
                    <td className="p-3 text-gray-600">{f.crop_type}</td>
                    <td className="p-3 text-gray-600">
                      {new Date(f.planting_date).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        f.current_stage === 'Harvested' ? 'bg-gray-100 text-gray-700' :
                        f.current_stage === 'Ready' ? 'bg-yellow-100 text-yellow-800' :
                        f.current_stage === 'Growing' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {f.current_stage}
                      </span>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {f.profiles?.full_name || 'Unassigned'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}