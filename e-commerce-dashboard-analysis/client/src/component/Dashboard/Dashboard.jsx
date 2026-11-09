import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUsers,
  FiPackage,
  FiDollarSign,
  FiShoppingCart,
} from "react-icons/fi";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg p-6 shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-semibold mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/dashboard/analytics`,
        );
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!data) return null;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error} </div>;
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Users"
            value={data?.activeUsers}
            icon={FiUsers}
            color="bg-blue-500 hover:bg-blue-600 transition-colors duration-300"
          />
          <StatCard
            title="Total Products"
            value={data?.totalProducts}
            icon={FiPackage}
            color="bg-green-500 hover:bg-green-600 transition-colors duration-300"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(data?.totalRevenue)}
            icon={FiDollarSign}
            color="bg-purple-500 hover:bg-purple-600 transition-colors duration-300"
          />
          <StatCard
            title="Conversion Rate"
            value={data?.kpis.conversionRate}
            icon={FiShoppingCart}
            color="bg-orange-500 hover:bg-orange-600 transition-colors duration-300"
          />
        </div>
        {/* Sales Chart */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Monthly Sales</h2>
              <p className="text-gray-500 mt-1">Revenue performance over time</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#8884d8] mr-2"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
            </div>
          </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
