import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
// Remove chart kit imports - they require SVG
// import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

import styles from '../styles/AnalyticsScreenStyles';

// Sample data for analytics
const revenueData = {
  daily: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [450.75, 385.25, 520.50, 490.30, 625.80, 780.40, 598.75],
      }
    ]
  },
  weekly: {
    labels: ["W1", "W2", "W3", "W4"],
    datasets: [
      {
        data: [3250.80, 3850.45, 4220.30, 4560.95],
      }
    ]
  },
  monthly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        data: [10580.45, 12450.30, 13850.75, 14980.25, 4287.50],
      }
    ]
  }
};

const paymentMethodData = [
  {
    name: "TAPYZE Card",
    population: 75,
    color: "#ed7b0e",
  },
  {
    name: "TAPYZE App",
    population: 25,
    color: "#000000",
  }
];

const transactionsByHourData = {
  labels: ["6am", "9am", "12pm", "3pm", "6pm", "9pm"],
  datasets: [
    {
      data: [5, 18, 32, 38, 42, 15]
    }
  ]
};

const topProductsData = [
  { name: "Espresso", quantity: 42, revenue: 168.00 },
  { name: "Cappuccino", quantity: 37, revenue: 185.00 },
  { name: "Latte", quantity: 35, revenue: 192.50 },
  { name: "Iced Coffee", quantity: 28, revenue: 140.00 },
  { name: "Croissant", quantity: 25, revenue: 125.00 }
];

// Simple bar chart component using View elements
const SimpleBarChart = ({ data, height = 150, color = "#ed7b0e" }) => {
  const maxValue = Math.max(...data.datasets[0].data);
  
  return (
    <View style={{ height, padding: 20, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {data.datasets[0].data.map((value, index) => (
          <View key={index} style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 10, marginBottom: 5, fontWeight: 'bold' }}>
              {Math.round(value)}
            </Text>
            <View
              style={{
                width: 20,
                height: (value / maxValue) * (height - 60),
                backgroundColor: color,
                borderRadius: 2,
              }}
            />
            <Text style={{ fontSize: 10, marginTop: 5, color: '#666' }}>
              {data.labels[index]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Clean area chart using stacked bars for smoother appearance
const SimpleLineChart = ({ data, height = 220, color = "#ed7b0e" }) => {
  const maxValue = Math.max(...data.datasets[0].data);
  const minValue = Math.min(...data.datasets[0].data);
  const range = maxValue - minValue || 1;
  
  return (
    <View style={{ height, backgroundColor: '#fff', borderRadius: 12 }}>
      {/* Values display at top */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        paddingTop: 15,
        paddingHorizontal: 10,
        paddingBottom: 5
      }}>
        {data.datasets[0].data.map((value, index) => (
          <Text key={index} style={{ 
            fontSize: 12, 
            fontWeight: '600', 
            color: '#333',
            textAlign: 'center',
            flex: 1
          }}>
            {value < 1000 ? Math.round(value) : `${(value/1000).toFixed(1)}k`}
          </Text>
        ))}
      </View>
      
      {/* Chart area with area fill effect - Full width */}
      <View style={{ 
        height: height - 80,
        width: '100%',
        flexDirection: 'row', 
        alignItems: 'flex-end', 
        backgroundColor: '#f8f9fa',
        marginHorizontal: 10,
        borderRadius: 12,
        paddingVertical: 12,
        marginBottom: 5
      }}>
        {data.datasets[0].data.map((value, index) => {
          const heightPercentage = range > 0 ? ((value - minValue) / range) * 85 + 15 : 50;
          const isHighest = value === maxValue;
          
          return (
            <View key={index} style={{ 
              flex: 1, 
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
              marginHorizontal: 1
            }}>
              {/* Area fill bars with gradient effect */}
              <View style={{
                width: '95%',
                height: `${heightPercentage}%`,
                backgroundColor: color,
                opacity: 0.15,
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                marginBottom: 3
              }} />
              
              {/* Top line indicator */}
              <View style={{
                width: '95%',
                height: 4,
                backgroundColor: color,
                borderRadius: 2,
                marginBottom: 3
              }} />
              
              {/* Data point dot */}
              <View style={{
                width: isHighest ? 10 : 8,
                height: isHighest ? 10 : 8,
                borderRadius: isHighest ? 5 : 4,
                backgroundColor: isHighest ? color : '#fff',
                borderWidth: 2,
                borderColor: color,
                marginBottom: 6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2,
              }} />
            </View>
          );
        })}
      </View>
      
      {/* X-axis labels */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingBottom: 5
      }}>
        {data.labels.map((label, index) => (
          <Text key={index} style={{ 
            fontSize: 12, 
            color: '#666',
            fontWeight: '500',
            textAlign: 'center',
            flex: 1
          }}>
            {label}
          </Text>
        ))}
      </View>
      
      {/* Trend indicators */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingBottom: 15
      }}>
        {data.datasets[0].data.map((value, index) => {
          if (index === 0) return <View key={index} style={{ flex: 1 }} />;
          
          const prevValue = data.datasets[0].data[index - 1];
          const isUp = value > prevValue;
          const isFlat = value === prevValue;
          
          return (
            <View key={index} style={{ 
              alignItems: 'center',
              flex: 1
            }}>
              <Ionicons 
                name={isFlat ? 'remove' : (isUp ? 'trending-up' : 'trending-down')} 
                size={14} 
                color={isFlat ? '#999' : (isUp ? '#28a745' : '#dc3545')} 
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Simple pie chart using View elements
const SimplePieChart = ({ data }) => {
  return (
    <View style={{ height: 220, padding: 20, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <View style={{ width: 120, height: 120, borderRadius: 60, overflow: 'hidden', flexDirection: 'row' }}>
          {data.map((item, index) => (
            <View
              key={index}
              style={{
                width: `${item.population}%`,
                backgroundColor: item.color,
                height: '100%',
              }}
            />
          ))}
        </View>
        <View style={{ marginLeft: 30 }}>
          {data.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: 6,
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 12, color: '#666' }}>
                {item.name} ({item.population}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const AnalyticsScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');
  const [selectedChart, setSelectedChart] = useState('revenue');
  const screenWidth = Dimensions.get("window").width - 40;
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle navigation back to dashboard
  const navigateToDashboard = () => {
    navigation.navigate('Dashboard');
  };
  
  // Navigate to profile/settings screen
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Get the appropriate data based on selected timeframe
  const getChartData = () => {
    return revenueData[selectedTimeframe];
  };

  // Function to sum up all data values
  const calculateTotal = (data) => {
    return data.datasets[0].data.reduce((sum, value) => sum + value, 0).toFixed(2);
  };

  // Function to calculate percentage change
  const calculateChange = () => {
    const currentData = revenueData[selectedTimeframe].datasets[0].data;
    const lastValue = currentData[currentData.length - 1];
    const prevValue = currentData[currentData.length - 2];
    
    const percentChange = ((lastValue - prevValue) / prevValue) * 100;
    return percentChange.toFixed(1);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ed7b0e" />
        <Text style={styles.loadingText}>Loading analytics data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandName}>TAPYZE</Text>
            <Text style={styles.merchantLabel}>ANALYTICS</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={28} color="#000000" />
        </TouchableOpacity>
      </View>
      
      {/* Greeting Section */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>Business Analytics</Text>
        <Text style={styles.greetingSubtext}>Track your business performance</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Timeframe Selector */}
        <View style={styles.timeframeContainer}>
          <Text style={styles.sectionTitle}>Transaction Analytics</Text>
          <View style={styles.timeframeSelector}>
            <TouchableOpacity 
              style={[styles.timeframeOption, selectedTimeframe === 'daily' && styles.timeframeActive]}
              onPress={() => setSelectedTimeframe('daily')}
            >
              <Text style={selectedTimeframe === 'daily' ? styles.timeframeActiveText : styles.timeframeText}>
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeframeOption, selectedTimeframe === 'weekly' && styles.timeframeActive]}
              onPress={() => setSelectedTimeframe('weekly')}
            >
              <Text style={selectedTimeframe === 'weekly' ? styles.timeframeActiveText : styles.timeframeText}>
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeframeOption, selectedTimeframe === 'monthly' && styles.timeframeActive]}
              onPress={() => setSelectedTimeframe('monthly')}
            >
              <Text style={selectedTimeframe === 'monthly' ? styles.timeframeActiveText : styles.timeframeText}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chart Type Selector */}
        <View style={styles.chartTypeContainer}>
          <TouchableOpacity 
            style={[styles.chartTypeOption, selectedChart === 'revenue' && styles.chartTypeActive]}
            onPress={() => setSelectedChart('revenue')}
          >
            <Ionicons 
              name="trending-up" 
              size={18} 
              color={selectedChart === 'revenue' ? "#FFFFFF" : "#666666"} 
            />
            <Text style={selectedChart === 'revenue' ? styles.chartTypeActiveText : styles.chartTypeText}>
              Revenue
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chartTypeOption, selectedChart === 'transactions' && styles.chartTypeActive]}
            onPress={() => setSelectedChart('transactions')}
          >
            <Ionicons 
              name="card" 
              size={18} 
              color={selectedChart === 'transactions' ? "#FFFFFF" : "#666666"} 
            />
            <Text style={selectedChart === 'transactions' ? styles.chartTypeActiveText : styles.chartTypeText}>
              Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chartTypeOption, selectedChart === 'customers' && styles.chartTypeActive]}
            onPress={() => setSelectedChart('customers')}
          >
            <Ionicons 
              name="people" 
              size={18} 
              color={selectedChart === 'customers' ? "#FFFFFF" : "#666666"} 
            />
            <Text style={selectedChart === 'customers' ? styles.chartTypeActiveText : styles.chartTypeText}>
              Customers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>
                {selectedChart === 'revenue' && 'Revenue Trend'}
                {selectedChart === 'transactions' && 'Transaction Count'}
                {selectedChart === 'customers' && 'Customer Activity'}
              </Text>
              <Text style={styles.chartSubtitle}>
                {selectedTimeframe === 'daily' && 'Last 7 days'}
                {selectedTimeframe === 'weekly' && 'Last 4 weeks'}
                {selectedTimeframe === 'monthly' && 'Last 5 months'}
              </Text>
            </View>
            <View style={styles.chartMetrics}>
              <Text style={styles.totalValue}>
                {selectedChart === 'revenue' && 'Rs. ' + calculateTotal(getChartData())}
                {selectedChart === 'transactions' && '98 transactions'}
                {selectedChart === 'customers' && '65 customers'}
              </Text>
              <View style={[
                styles.changeBadge, 
                calculateChange() >= 0 ? styles.positiveChange : styles.negativeChange
              ]}>
                <Ionicons 
                  name={calculateChange() >= 0 ? "arrow-up" : "arrow-down"} 
                  size={12} 
                  color="#FFFFFF" 
                />
                <Text style={styles.changeText}>{Math.abs(calculateChange())}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartContainer}>
            {/* Replace LineChart with SimpleLineChart */}
            <SimpleLineChart
              data={getChartData()}
              height={220}
              color="#ed7b0e"
            />
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, styles.transactionsIcon]}>
              <Ionicons name="card-outline" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.summaryTitle}>Transactions</Text>
              <Text style={styles.summaryValue}>98</Text>
              <View style={styles.summaryChange}>
                <Ionicons name="arrow-up" size={12} color="#28A745" />
                <Text style={[styles.summaryChangeText, styles.positiveChangeText]}>12%</Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, styles.averageIcon]}>
              <Ionicons name="calculator-outline" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.summaryTitle}>Avg. Transaction</Text>
              <Text style={styles.summaryValue}>Rs. 43.75</Text>
              <View style={styles.summaryChange}>
                <Ionicons name="arrow-up" size={12} color="#28A745" />
                <Text style={[styles.summaryChangeText, styles.positiveChangeText]}>5.3%</Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, styles.customersIcon]}>
              <Ionicons name="people-outline" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.summaryTitle}>New Customers</Text>
              <Text style={styles.summaryValue}>15</Text>
              <View style={styles.summaryChange}>
                <Ionicons name="arrow-down" size={12} color="#DC3545" />
                <Text style={[styles.summaryChangeText, styles.negativeChangeText]}>3.8%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Methods Chart */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.pieChartCard}>
            {/* Replace PieChart with SimplePieChart */}
            <SimplePieChart data={paymentMethodData} />
          </View>
        </View>

        {/* Transactions by Hour */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Transactions by Time of Day</Text>
          <View style={styles.barChartCard}>
            {/* Replace BarChart with SimpleBarChart */}
            <SimpleBarChart
              data={transactionsByHourData}
              height={220}
              color="#000000"
            />
          </View>
        </View>

        {/* Top Products Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Top Products</Text>

          <View style={styles.productsCard}>
            <View style={styles.productHeader}>
              <Text style={styles.productHeaderText}>Product</Text>
              <Text style={styles.productHeaderText}>Quantity</Text>
              <Text style={styles.productHeaderText}>Revenue</Text>
            </View>

            {topProductsData.map((product, index) => (
              <View key={index} style={styles.productRow}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productQuantity}>{product.quantity}</Text>
                <Text style={styles.productRevenue}>Rs. {product.revenue.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Customer Insights */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Customer Insights</Text>

          <View style={styles.insightsContainer}>
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>Returning Customers</Text>
              <View style={styles.insightValue}>
                <Text style={styles.insightNumber}>68%</Text>
                <View style={styles.insightChange}>
                  <Ionicons name="arrow-up" size={12} color="#28A745" />
                  <Text style={styles.insightChangePositive}>8%</Text>
                </View>
              </View>
              <Text style={styles.insightDescription}>Customers who made repeat purchases</Text>
            </View>

            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>Customer Retention</Text>
              <View style={styles.insightValue}>
                <Text style={styles.insightNumber}>72%</Text>
                <View style={styles.insightChange}>
                  <Ionicons name="arrow-up" size={12} color="#28A745" />
                  <Text style={styles.insightChangePositive}>5%</Text>
                </View>
              </View>
              <Text style={styles.insightDescription}>Monthly retention rate</Text>
            </View>
          </View>
        </View>

        {/* Export Reports Section */}
        <View style={styles.exportSection}>
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={20} color="#FFFFFF" />
            <Text style={styles.exportButtonText}>Export Analytics Report</Text>
          </TouchableOpacity>
          <Text style={styles.exportNote}>Export detailed analytics in PDF or CSV format</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnalyticsScreen;