const TimetableValidator = require('./timetableValidator.js');
const { transformGroupwithModules } = require("../helpers/transformers/groupWithSessionPresential.js");

/**
 * Timetable Retry Service
 * 
 * This service handles timetable generation with automatic retry logic:
 * 1. Generates timetable
 * 2. Validates the generated timetable
 * 3. Retries if validation fails
 * 4. Stops after maximum attempts or when valid timetable is found
 */

class TimetableRetryService {
  
  constructor(maxAttempts = 50) {
    this.maxAttempts = maxAttempts;
    this.attemptCount = 0;
    this.validationHistory = [];
  }

  /**
   * Generate timetable with retry logic
   * @param {Function} generateFunction - The timetable generation function
   * @param {Object} group - The group object
   * @param {Array} requiredSessions - Array of required sessions
   * @param {Object} options - Additional options
   * @returns {Object} Generation result with validation details
   */
  async generateWithRetry(generateFunction, group, requiredSessions, options = {}) {
    // Use maxAttempts from options or fall back to constructor default
    const maxAttempts = options.maxAttempts || this.maxAttempts;
    
    // Removed console.log statements for production
    // console.log(`Starting timetable generation with retry for group: ${group.code_group}`);
    // console.log(`Required sessions: ${requiredSessions.length}`);
    // console.log(`Maximum attempts: ${maxAttempts}`);

    this.attemptCount = 0;
    this.validationHistory = [];

    while (this.attemptCount < maxAttempts) {
      this.attemptCount++;
      
      // Removed console.log statements for production
      // console.log(`\nAttempt ${this.attemptCount}/${maxAttempts} for group: ${group.code_group}`);

      try {
        // Generate timetable
        const timetable = await this.generateTimetable(generateFunction, group, options);
        
        // Validate the generated timetable with cross-group conflict checking
        const validationResult = await TimetableValidator.validateTimetable(timetable, group, requiredSessions);
        
        // Store validation history
        this.validationHistory.push({
          attempt: this.attemptCount,
          isValid: validationResult.isValid,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          details: validationResult.details
        });

        if (validationResult.isValid) {
          // Removed console.log statements for production
          // console.log(`Valid timetable generated on attempt ${this.attemptCount}`);
          return {
            success: true,
            timetable,
            validationResult,
            attemptCount: this.attemptCount,
            validationHistory: this.validationHistory
          };
        } else {
          // Removed console.log statements for production
          // console.log(`Invalid timetable on attempt ${this.attemptCount}`);
          // console.log(`   Errors: ${validationResult.errors.length}`);
          // console.log(`   Missing sessions: ${validationResult.details.missingSessions.length}`);
          // console.log(`   Conflicts: ${validationResult.details.conflicts.length}`);
          
          // If this is the last attempt, return the best result
          if (this.attemptCount === maxAttempts) {
            // Removed console.log statements for production
            // console.log(`Maximum attempts reached. Returning best attempt.`);
            return {
              success: false,
              timetable,
              validationResult,
              attemptCount: this.attemptCount,
              validationHistory: this.validationHistory,
              message: `Failed to generate valid timetable after ${maxAttempts} attempts`
            };
          }

          // Wait a bit before retrying (to avoid overwhelming the system)
          await this.delay(100);
        }

      } catch (error) {
        // Removed console.log statements for production
        // console.error(`Error during attempt ${this.attemptCount}:`, error.message);
        
        this.validationHistory.push({
          attempt: this.attemptCount,
          isValid: false,
          errors: [error.message],
          details: { error: error.message }
        });

        if (this.attemptCount === maxAttempts) {
          throw new Error(`Failed to generate timetable after ${maxAttempts} attempts: ${error.message}`);
        }

        // Wait before retrying
        await this.delay(200);
      }
    }

    throw new Error(`Failed to generate valid timetable after ${maxAttempts} attempts`);
  }

  /**
   * Generate a single timetable attempt
   * @param {Function} generateFunction - The generation function
   * @param {Object} group - The group object
   * @param {Object} options - Generation options
   * @returns {Object} Generated timetable
   */
  async generateTimetable(generateFunction, group, options) {
    // This is a placeholder - the actual generation logic will be passed in
    // The generateFunction should handle the actual timetable generation
    return await generateFunction(group, options);
  }

  /**
   * Analyze validation history to provide insights
   * @returns {Object} Analysis of validation attempts
   */
  analyzeValidationHistory() {
    if (this.validationHistory.length === 0) {
      return { message: "No validation history available" };
    }

    const totalAttempts = this.validationHistory.length;
    const successfulAttempts = this.validationHistory.filter(v => v.isValid).length;
    const failedAttempts = totalAttempts - successfulAttempts;

    // Find most common errors
    const errorCounts = {};
    this.validationHistory.forEach(validation => {
      validation.errors.forEach(error => {
        errorCounts[error] = (errorCounts[error] || 0) + 1;
      });
    });

    const commonErrors = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));

    // Find best attempt (least errors)
    const bestAttempt = this.validationHistory.reduce((best, current) => {
      if (current.isValid) return current;
      if (!best.isValid) return current;
      return current.errors.length < best.errors.length ? current : best;
    });

    return {
      totalAttempts,
      successfulAttempts,
      failedAttempts,
      successRate: (successfulAttempts / totalAttempts) * 100,
      commonErrors,
      bestAttempt: {
        attempt: bestAttempt.attempt,
        errors: bestAttempt.errors.length,
        isValid: bestAttempt.isValid
      }
    };
  }

  /**
   * Get suggestions for improving generation success
   * @param {Object} validationResult - The validation result
   * @returns {Array} Array of suggestions
   */
  getImprovementSuggestions(validationResult) {
    const suggestions = [];

    if (validationResult.details.missingSessions.length > 0) {
      suggestions.push({
        type: 'missing_sessions',
        priority: 'high',
        message: 'Some sessions could not be scheduled. Consider:',
        actions: [
          'Check formateur availability for missing sessions',
          'Verify room availability',
          'Review time slot constraints',
          'Consider reducing session hours if possible'
        ]
      });
    }

    if (validationResult.details.conflicts.length > 0) {
      suggestions.push({
        type: 'conflicts',
        priority: 'high',
        message: 'Scheduling conflicts detected. Consider:',
        actions: [
          'Review formateur schedules for overlaps',
          'Check room assignments',
          'Verify time slot availability',
          'Consider alternative time slots'
        ]
      });
    }

    if (validationResult.details.gapRuleViolations.length > 0) {
      suggestions.push({
        type: 'gap_rules',
        priority: 'medium',
        message: 'Gap rule violations found. Consider:',
        actions: [
          'Review remote/presential session placement',
          'Ensure 2.5-hour gaps between different session types',
          'Consider rescheduling conflicting sessions'
        ]
      });
    }

    if (validationResult.details.hourViolations && validationResult.details.hourViolations.length > 0) {
      suggestions.push({
        type: 'hour_limits',
        priority: 'medium',
        message: 'Weekly hour limits exceeded. Consider:',
        actions: [
          'Review formateur workload distribution',
          'Consider reducing hours for some modules',
          'Check for alternative formateurs',
          'Verify hour calculations'
        ]
      });
    }

    return suggestions;
  }

  /**
   * Generate a comprehensive report
   * @param {Object} result - The generation result
   * @returns {string} Detailed report
   */
  generateReport(result) {
    let report = `\n📊 Timetable Generation Report\n`;
    report += `Group: ${result.validationResult.groupCode}\n`;
    report += `Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}\n`;
    report += `Attempts: ${result.attemptCount}/${this.maxAttempts}\n\n`;

    if (result.success) {
      report += `🎉 Valid timetable generated successfully!\n`;
      report += `📈 Statistics:\n`;
      report += `  - Total sessions: ${result.validationResult.details.totalScheduledSessions}\n`;
      report += `  - Required sessions: ${result.validationResult.details.totalRequiredSessions}\n`;
      report += `  - Conflicts: ${result.validationResult.details.conflicts.length}\n`;
      report += `  - Gap violations: ${result.validationResult.details.gapRuleViolations.length}\n\n`;
    } else {
      report += `⚠️  Failed to generate valid timetable\n`;
      report += `📋 Issues found:\n`;
      result.validationResult.errors.forEach(error => {
        report += `  - ${error}\n`;
      });
      report += `\n`;
    }

    // Add analysis
    const analysis = this.analyzeValidationHistory();
    report += `📈 Attempt Analysis:\n`;
    report += `  - Success rate: ${analysis.successRate.toFixed(1)}%\n`;
    report += `  - Best attempt: ${analysis.bestAttempt.attempt}\n`;
    report += `  - Common errors: ${analysis.commonErrors.length}\n\n`;

    // Add suggestions
    const suggestions = this.getImprovementSuggestions(result.validationResult);
    if (suggestions.length > 0) {
      report += `💡 Improvement Suggestions:\n`;
      suggestions.forEach(suggestion => {
        report += `  ${suggestion.priority === 'high' ? '🔴' : '🟡'} ${suggestion.message}\n`;
        suggestion.actions.forEach(action => {
          report += `    • ${action}\n`;
        });
        report += `\n`;
      });
    }

    return report;
  }

  /**
   * Utility function to add delay
   * @param {number} ms - Milliseconds to delay
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset the service state
   */
  reset() {
    this.attemptCount = 0;
    this.validationHistory = [];
  }
}

module.exports = TimetableRetryService; 