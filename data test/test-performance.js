/**
 * High-Performance Backend Test Suite
 * Benchmarks and validates performance optimizations
 */

const axios = require('axios');
const databaseService = require('../backend/services/databaseService.js');
const ControllerBase = require('../backend/services/controllerBase.js');

class PerformanceTester {
  constructor() {
    this.baseURL = 'http://localhost:8002';
    this.results = [];
  }

  /**
   * Run all performance tests
   */
  async runAllTests() {
    console.log('🚀 Starting High-Performance Backend Tests...\n');

    try {
      // Database performance tests
      await this.testDatabasePerformance();
      
      // API endpoint tests
      await this.testAPIEndpoints();
      
      // Cache performance tests
      await this.testCachePerformance();
      
      // Memory usage tests
      await this.testMemoryUsage();
      
      // Load testing
      await this.testLoadHandling();
      
      // Generate performance report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Performance test failed:', error.message);
    }
  }

  /**
   * Test database performance
   */
  async testDatabasePerformance() {
    console.log('📊 Testing Database Performance...');
    
    const tests = [
      {
        name: 'Simple Query',
        operation: () => databaseService.executeQuery('SELECT 1 as test')
      },
      {
        name: 'Complex Query with Cache',
        operation: () => databaseService.executeQuery(
          'SELECT COUNT(*) as count FROM timetables',
          [],
          { useCache: true, cacheTTL: 60 }
        )
      },
      {
        name: 'Bulk Insert Simulation',
        operation: async () => {
          const testData = Array.from({ length: 100 }, (_, i) => ({
            name: `Test Item ${i}`,
            description: `Description for item ${i}`
          }));
          // Simulate bulk insert without actual model
          return Promise.resolve(testData.length);
        }
      }
    ];

    for (const test of tests) {
      const result = await this.benchmark(test.operation, test.name);
      this.results.push({ category: 'Database', ...result });
    }
  }

  /**
   * Test API endpoints
   */
  async testAPIEndpoints() {
    console.log('🌐 Testing API Endpoints...');
    
    // Skip API tests if server is not running
    try {
      await axios.get(`${this.baseURL}/health`, { timeout: 2000 });
    } catch (error) {
      console.log('⚠️  Server not running, skipping API tests');
      return;
    }
    
    const endpoints = [
      { path: '/health', method: 'GET', name: 'Health Check' },
      { path: '/metrics', method: 'GET', name: 'Metrics Endpoint' },
      { path: '/api/v1/branch', method: 'GET', name: 'Branch List' },
      { path: '/api/v1/group', method: 'GET', name: 'Group List' },
      { path: '/api/v1/formateur', method: 'GET', name: 'Formateur List' }
    ];

    for (const endpoint of endpoints) {
      const result = await this.benchmarkAPI(endpoint);
      this.results.push({ category: 'API', ...result });
    }
  }

  /**
   * Test cache performance
   */
  async testCachePerformance() {
    console.log('💾 Testing Cache Performance...');
    
    const controller = new ControllerBase();
    
    const tests = [
      {
        name: 'Cache Set',
        operation: () => {
          for (let i = 0; i < 100; i++) {
            controller.cache.set(`test_key_${i}`, `test_value_${i}`, 60);
          }
        }
      },
      {
        name: 'Cache Get',
        operation: () => {
          for (let i = 0; i < 100; i++) {
            controller.cache.get(`test_key_${i}`);
          }
        }
      },
      {
        name: 'Cache Invalidation',
        operation: () => controller.invalidateModelCache('TestModel')
      }
    ];

    for (const test of tests) {
      const result = await this.benchmark(test.operation, test.name);
      this.results.push({ category: 'Cache', ...result });
    }
  }

  /**
   * Test memory usage
   */
  async testMemoryUsage() {
    console.log('🧠 Testing Memory Usage...');
    
    const initialMemory = process.memoryUsage();
    
    // Simulate memory-intensive operations
    const largeArray = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      data: `Large data object ${i}`.repeat(100)
    }));
    
    const finalMemory = process.memoryUsage();
    
    const memoryIncrease = {
      rss: finalMemory.rss - initialMemory.rss,
      heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
      heapTotal: finalMemory.heapTotal - initialMemory.heapTotal
    };
    
    this.results.push({
      category: 'Memory',
      name: 'Memory Usage Test',
      duration: 0,
      memoryIncrease,
      status: 'completed'
    });
  }

  /**
   * Test load handling
   */
  async testLoadHandling() {
    console.log('⚡ Testing Load Handling...');
    
    // Skip load test if server is not running
    try {
      await axios.get(`${this.baseURL}/health`, { timeout: 2000 });
    } catch (error) {
      console.log('⚠️  Server not running, skipping load test');
      return;
    }
    
    const concurrentRequests = 10; // Reduced for testing
    const requests = Array.from({ length: concurrentRequests }, () =>
      this.benchmarkAPI({ path: '/health', method: 'GET', name: 'Concurrent Health Check' })
    );
    
    const startTime = Date.now();
    const results = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    const avgResponseTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const successRate = results.filter(r => r.status === 'success').length / results.length;
    
    this.results.push({
      category: 'Load',
      name: `Concurrent Requests (${concurrentRequests})`,
      duration: totalTime,
      avgResponseTime,
      successRate: successRate * 100,
      status: 'completed'
    });
  }

  /**
   * Benchmark a single operation
   */
  async benchmark(operation, name) {
    const startTime = Date.now();
    
    try {
      await operation();
      const duration = Date.now() - startTime;
      
      return {
        name,
        duration,
        status: 'success'
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        name,
        duration,
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Benchmark API endpoint
   */
  async benchmarkAPI(endpoint) {
    const startTime = Date.now();
    
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${this.baseURL}${endpoint.path}`,
        timeout: 10000
      });
      
      const duration = Date.now() - startTime;
      
      return {
        name: endpoint.name,
        duration,
        status: 'success',
        statusCode: response.status,
        responseSize: JSON.stringify(response.data).length
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        name: endpoint.name,
        duration,
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Generate performance report
   */
  generateReport() {
    console.log('\n📈 PERFORMANCE TEST RESULTS\n');
    console.log('='.repeat(80));
    
    // Group results by category
    const categories = {};
    this.results.forEach(result => {
      if (!categories[result.category]) {
        categories[result.category] = [];
      }
      categories[result.category].push(result);
    });
    
    // Display results by category
    Object.keys(categories).forEach(category => {
      console.log(`\n${category.toUpperCase()} PERFORMANCE:`);
      console.log('-'.repeat(40));
      
      categories[category].forEach(result => {
        const status = result.status === 'success' ? '✅' : '❌';
        const duration = result.duration ? `${result.duration}ms` : 'N/A';
        
        console.log(`${status} ${result.name}: ${duration}`);
        
        if (result.avgResponseTime) {
          console.log(`   Average Response: ${result.avgResponseTime.toFixed(2)}ms`);
        }
        
        if (result.successRate) {
          console.log(`   Success Rate: ${result.successRate.toFixed(1)}%`);
        }
        
        if (result.memoryIncrease) {
          console.log(`   Memory Increase: ${(result.memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        }
        
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      });
    });
    
    // Summary statistics
    const successfulTests = this.results.filter(r => r.status === 'success');
    const avgDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length;
    const successRate = (successfulTests.length / this.results.length) * 100;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:');
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Successful: ${successfulTests.length}`);
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);
    
    // Performance recommendations
    console.log('\n💡 PERFORMANCE RECOMMENDATIONS:');
    
    if (avgDuration > 1000) {
      console.log('⚠️  Average response time is high. Consider:');
      console.log('   - Adding more database indexes');
      console.log('   - Implementing query optimization');
      console.log('   - Increasing cache TTL');
    }
    
    if (successRate < 95) {
      console.log('⚠️  Success rate is low. Consider:');
      console.log('   - Checking error logs');
      console.log('   - Improving error handling');
      console.log('   - Adding retry mechanisms');
    }
    
    const slowTests = this.results.filter(r => r.duration > 1000);
    if (slowTests.length > 0) {
      console.log('⚠️  Slow tests detected:');
      slowTests.forEach(test => {
        console.log(`   - ${test.name}: ${test.duration}ms`);
      });
    }
    
    console.log('\n✅ Performance testing completed!');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runAllTests().catch(console.error);
}

module.exports = PerformanceTester; 