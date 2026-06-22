export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-border">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Projects</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border border-border">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Bots</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border border-border">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Runs</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border border-border">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Datasets</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-4 bg-white shadow rounded-lg border border-border p-6 text-center text-gray-500">
          No recent activity found.
        </div>
      </div>
    </div>
  );
}
