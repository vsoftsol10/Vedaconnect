const StatCard = ({ icon: Icon, iconBg, label, value, badge }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm sm:p-6">
    <div className="flex items-center justify-between mb-4">
      <span className={`h-10 w-10 rounded-full flex items-center justify-center ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </span>
      {badge && (
        <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          {badge}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
  </div>
);

export default StatCard;
