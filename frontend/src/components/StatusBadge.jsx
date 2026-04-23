export default function StatusBadge({ status }) {
  const colors = {
    Active: 'bg-green-100 text-green-800',
    'At Risk': 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-gray-100 text-gray-800'
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || colors['Active']}`}>{status}</span>;
}