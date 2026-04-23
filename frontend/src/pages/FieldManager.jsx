import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const STAGES = ['Planted', 'Growing', 'Ready', 'Harvested'];

export default function FieldManager() {
  const { user } = useAuth();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Form states
  const [createForm, setCreateForm] = useState({
    name: '', crop_type: '', planting_date: '', assigned_agent_id: ''
  });
  const [updateForm, setUpdateForm] = useState({
    fieldId: '', new_stage: 'Growing', notes: ''
  });
  const [selectedField, setSelectedField] = useState(null);

  // Load fields on mount
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/fields');
      setFields(data || []);
    } catch (err) {
      setError('Failed to load fields');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      await api.post('/api/fields', createForm);
      setMessage('✅ Field created successfully!');
      setCreateForm({ name: '', crop_type: '', planting_date: '', assigned_agent_id: '' });
      fetchFields();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating field');
    }
  };

  const handleStageUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      const { data } = await api.patch(`/api/fields/${updateForm.fieldId}/stage`, {
        new_stage: updateForm.new_stage,
        notes: updateForm.notes
      });
      setMessage(`✅ Stage updated to ${updateForm.new_stage}!`);
      setUpdateForm({ fieldId: '', new_stage: 'Growing', notes: '' });
      fetchFields();
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating stage');
    }
  };

  const handleViewDetails = async (fieldId) => {
    try {
      const { data } = await api.get(`/api/fields/${fieldId}`);
      setSelectedField(data);
    } catch (err) {
      setError('Failed to load field details');
    }
  };

  if (loading && fields.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fields...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Field Management</h1>
      
      {/* Messages */}
      {message && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 mb-4 rounded">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Create Field Form - Admin Only */}
        {user?.role === 'admin' && (
          <div className="lg:col-span-1">
            <form onSubmit={handleCreate} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">➕ Create New Field</h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Field Name *</label>
                  <input
                    type="text"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Crop Type *</label>
                  <input
                    type="text"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                    value={createForm.crop_type}
                    onChange={(e) => setCreateForm({...createForm, crop_type: e.target.value})}
                    placeholder="e.g., Maize, Wheat"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Planting Date *</label>
                  <input
                    type="date"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                    value={createForm.planting_date}
                    onChange={(e) => setCreateForm({...createForm, planting_date: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Assigned Agent ID</label>
                  <input
                    type="text"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                    value={createForm.assigned_agent_id}
                    onChange={(e) => setCreateForm({...createForm, assigned_agent_id: e.target.value})}
                    placeholder="UUID from profiles"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to assign later</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 sm:py-3 px-4 rounded hover:bg-green-700 transition font-medium text-sm sm:text-base"
                >
                  Create Field
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main Content Area */}
        <div className={user?.role === 'admin' ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {/* Update Stage Form */}
          <form onSubmit={handleStageUpdate} className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">📝 Update Field Stage</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Field ID *</label>
                <input
                  type="text"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  value={updateForm.fieldId}
                  onChange={(e) => setUpdateForm({...updateForm, fieldId: e.target.value})}
                  placeholder="Select from list below"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">New Stage</label>
                <select
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  value={updateForm.new_stage}
                  onChange={(e) => setUpdateForm({...updateForm, new_stage: e.target.value})}
                >
                  {STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded hover:bg-blue-700 transition font-medium text-sm sm:text-base"
                >
                  Update
                </button>
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Observation Notes</label>
              <textarea
                className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                rows="2"
                value={updateForm.notes}
                onChange={(e) => setUpdateForm({...updateForm, notes: e.target.value})}
                placeholder="Add your field observations..."
              />
            </div>
          </form>

          {/* Fields List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                {user?.role === 'admin' ? 'All Fields' : 'My Assigned Fields'} 
                <span className="ml-2 text-xs sm:text-sm text-gray-500">({fields.length})</span>
              </h3>
            </div>
            
            {fields.length === 0 ? (
              <p className="p-6 sm:p-8 text-center text-gray-500 text-sm sm:text-base">
                No fields found. Create one to get started!
              </p>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-gray-100">
                  {fields.map(field => (
                    <div key={field.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{field.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">{field.crop_type}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          field.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                          field.status === 'At Risk' ? 'bg-red-100 text-red-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {field.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
                          {field.current_stage}
                        </span>
                        <span className="text-gray-600">
                          Planted: {new Date(field.planting_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Agent: {field.profiles?.full_name || 'Unassigned'}
                        </p>
                        <button
                          onClick={() => handleViewDetails(field.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
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
                        <th className="p-3 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {fields.map(field => (
                        <tr key={field.id} className="hover:bg-gray-50">
                          <td className="p-3 font-medium text-sm">{field.name}</td>
                          <td className="p-3 text-sm text-gray-600">{field.crop_type}</td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(field.planting_date).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              field.current_stage === 'Harvested' ? 'bg-gray-100 text-gray-700' :
                              field.current_stage === 'Ready' ? 'bg-yellow-100 text-yellow-800' :
                              field.current_stage === 'Growing' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {field.current_stage}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              field.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                              field.status === 'At Risk' ? 'bg-red-100 text-red-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {field.status}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {field.profiles?.full_name || 'Unassigned'}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleViewDetails(field.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Field Details Modal - Responsive */}
      {selectedField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedField(null)}>
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">{selectedField.name}</h3>
              <button onClick={() => setSelectedField(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Crop Type</p>
                  <p className="font-medium text-sm sm:text-base">{selectedField.crop_type}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Planted</p>
                  <p className="font-medium text-sm sm:text-base">{new Date(selectedField.planting_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Current Stage</p>
                  <p className="font-medium text-sm sm:text-base">{selectedField.current_stage}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Status</p>
                  <p className="font-medium text-sm sm:text-base">{selectedField.status}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs sm:text-sm text-gray-500">Assigned To</p>
                  <p className="font-medium text-sm sm:text-base">{selectedField.profiles?.full_name || 'Unassigned'}</p>
                </div>
              </div>
              
              {selectedField.updates?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-sm sm:text-base">Update History</h4>
                  <div className="space-y-3">
                    {selectedField.updates.map(update => (
                      <div key={update.id} className="bg-gray-50 p-3 rounded">
                        <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm">
                          <span className="font-medium">{update.profiles?.full_name}</span>
                          <span className="text-gray-500">{new Date(update.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs sm:text-sm mt-1">
                          <span className="text-gray-600">{update.previous_stage}</span>
                          <span className="mx-2">→</span>
                          <span className="font-medium text-green-700">{update.new_stage}</span>
                        </p>
                        {update.notes && <p className="text-xs sm:text-sm text-gray-600 mt-1 italic">"{update.notes}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}