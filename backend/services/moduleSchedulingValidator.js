const { 
  GroupModuleFormateur, 
  Module, 
  Group,
  Setting
} = require("../models");

/**
 * Module Scheduling Validator Service
 * 
 * This service ensures that modules can be completed within the group's available timetable
 * by calculating remaining duration, checking available hours, and dynamically adjusting
 * module hours to fit scheduling constraints.
 */

class ModuleSchedulingValidator {
  
  /**
   * Main validation function to ensure modules fit within group's timetable
   * @param {Array} groupModuleData - Array of group-module associations from import
   * @param {Array} modules - Array of module objects
   * @param {Array} groups - Array of group objects
   * @returns {Object} Validation and adjustment result
   */
  static async validateAndAdjustModuleHours(groupModuleData, modules, groups) {
    console.log("Starting module scheduling validation...");
    
    // Fetch max weekly hours from settings
    let maxWeeklyHours = 35;
    try {
      const presentialSetting = await Setting.findOne({ where: { key: 'max_presential_hours' } });
      if (presentialSetting && !isNaN(Number(presentialSetting.value))) {
        maxWeeklyHours = Number(presentialSetting.value);
      }
    } catch (e) {
      // fallback to default
    }

    const results = {
      isValid: true,
      adjustments: [],
      warnings: [],
      errors: [],
      summary: {
        totalModules: groupModuleData.length,
        adjustedModules: 0,
        totalHoursBefore: 0,
        totalHoursAfter: 0
      }
    };

    try {
      // Group modules by groupId for processing
      const modulesByGroup = this.groupModulesByGroup(groupModuleData);
      
      for (const [groupId, groupModules] of Object.entries(modulesByGroup)) {
        console.log(`\nProcessing group ${groupId} with ${groupModules.length} modules`);
        
        const groupResult = await this.processGroupModules(groupId, groupModules, modules, maxWeeklyHours);
        
        // Merge results
        results.adjustments.push(...groupResult.adjustments);
        results.warnings.push(...groupResult.warnings);
        results.errors.push(...groupResult.errors);
        results.summary.adjustedModules += groupResult.adjustments.length;
        results.summary.totalHoursBefore += groupResult.totalHoursBefore;
        results.summary.totalHoursAfter += groupResult.totalHoursAfter;
        
        if (!groupResult.isValid) {
          results.isValid = false;
        }
      }
      
      console.log(`Module scheduling validation completed`);
      console.log(`Total adjustments: ${results.adjustments.length}`);
      console.log(`Total warnings: ${results.warnings.length}`);
      
      return results;
      
    } catch (error) {
      console.error("Error in module scheduling validation:", error);
      results.isValid = false;
      results.errors.push({
        type: "system_error",
        message: "System error during validation",
        details: error.message
      });
      return results;
    }
  }

  /**
   * Process modules for a specific group
   * @param {number} groupId - The group ID
   * @param {Array} groupModules - Array of modules for this group
   * @param {Array} modules - All modules array
   * @param {number} maxWeeklyHours - Maximum allowed hours per week
   * @returns {Object} Processing result for this group
   */
  static async processGroupModules(groupId, groupModules, modules, maxWeeklyHours) {
    const result = {
      isValid: true,
      adjustments: [],
      warnings: [],
      errors: [],
      totalHoursBefore: 0,
      totalHoursAfter: 0
    };

    try {
      // Calculate total required hours for all modules in this group
      let totalRequiredHours = 0;
      const moduleDetails = [];

      for (const groupModule of groupModules) {
        const module = modules.find(m => m.id === groupModule.moduleId);
        if (!module) continue;

        const remainingHours = this.calculateRemainingHours(module);
        const weeklyHours = this.calculateWeeklyHours(module);
        
        moduleDetails.push({
          moduleId: groupModule.moduleId,
          moduleCode: module.code_module,
          moduleLabel: module.label,
          remainingHours,
          weeklyHours,
          totalModuleHours: module.mhp_s1 + module.mhp_s2 + module.mhsyn_s1 + module.mhsyn_s2,
          validate_efm: module.validate_efm
        });

        totalRequiredHours += weeklyHours;
        result.totalHoursBefore += weeklyHours;
      }

      console.log(`Group ${groupId} requires ${totalRequiredHours} hours per week`);
      console.log(`Available capacity: ${maxWeeklyHours} hours per week`);

      // Check if total hours exceed capacity
      if (totalRequiredHours <= maxWeeklyHours) {
        console.log(`Group ${groupId} hours fit within capacity`);
        result.totalHoursAfter = totalRequiredHours;
        return result;
      }

      // Hours exceed capacity - need to adjust
      console.log(`Group ${groupId} hours exceed capacity by ${totalRequiredHours - maxWeeklyHours} hours`);
      
      const adjustmentResult = this.adjustModuleHours(moduleDetails, totalRequiredHours, maxWeeklyHours);
      
      result.adjustments.push(...adjustmentResult.adjustments);
      result.warnings.push(...adjustmentResult.warnings);
      result.totalHoursAfter = adjustmentResult.totalHoursAfter;
      
      if (!adjustmentResult.isValid) {
        result.isValid = false;
        result.errors.push(...adjustmentResult.errors);
      }

      return result;

    } catch (error) {
      console.error(`Error processing group ${groupId}:`, error);
      result.isValid = false;
      result.errors.push({
        groupId,
        type: "processing_error",
        message: "Error processing group modules",
        details: error.message
      });
      return result;
    }
  }

  /**
   * Calculate remaining hours needed to complete a module
   * @param {Object} module - The module object
   * @returns {number} Remaining hours needed
   */
  static calculateRemainingHours(module) {
    const totalHours = module.mhp_s1 + module.mhp_s2 + module.mhsyn_s1 + module.mhsyn_s2;
    const completedHours = module.mhp_realise + module.mhsyn_realise;
    return Math.max(0, totalHours - completedHours);
  }

  /**
   * Calculate weekly hours needed for a module
   * @param {Object} module - The module object
   * @returns {number} Weekly hours needed
   */
  static calculateWeeklyHours(module) {
    const presentialHours = this.getNumberHoursModulePresentailInWeek(module);
    const remoteHours = this.getNumberHoursModuleRemoteInWeek(module);
    return presentialHours + remoteHours;
  }

  /**
   * Get number of presential hours per week for a module
   * @param {Object} module - The module object
   * @returns {number} Presential hours per week
   */
  static getNumberHoursModulePresentailInWeek(module) {
    const totalHoursInModulePresentail = module.mhp_s1 + module.mhp_s2;

    if (totalHoursInModulePresentail <= 30) {
      return 2.5;
    } else if (totalHoursInModulePresentail <= 90) {
      return 10;
    } else {
      return 15;
    }
  }

  /**
   * Get number of remote hours per week for a module
   * @param {Object} module - The module object
   * @returns {number} Remote hours per week
   */
  static getNumberHoursModuleRemoteInWeek(module) {
    const totalHoursInModuleRemote = module.mhsyn_s1 + module.mhsyn_s2;
    if (totalHoursInModuleRemote > 10) {
      return 5;
    } else if (totalHoursInModuleRemote <= 10 && totalHoursInModuleRemote != 0) {
      return 2.5;
    }
    return 0;
  }

  /**
   * Adjust module hours to fit within max weekly hours
   * @param {Array} moduleDetails - Array of module details
   * @param {number} totalRequiredHours - Total required hours
   * @param {number} maxWeeklyHours - Maximum allowed hours per week
   * @returns {Object} Adjustment result
   */
  static adjustModuleHours(moduleDetails, totalRequiredHours, maxWeeklyHours) {
    const result = {
      isValid: true,
      adjustments: [],
      warnings: [],
      errors: [],
      totalHoursAfter: 0
    };

    const excessHours = totalRequiredHours - maxWeeklyHours;
    console.log(`Need to reduce ${excessHours} hours to fit within capacity`);

    // Sort modules by total duration (largest first) for reduction priority
    const sortedModules = [...moduleDetails].sort((a, b) => {
      // Don't reduce finished modules
      if (a.validate_efm && !b.validate_efm) return 1;
      if (!a.validate_efm && b.validate_efm) return -1;
      
      // Sort by total module hours (largest first)
      return b.totalModuleHours - a.totalModuleHours;
    });

    let remainingExcess = excessHours;
    const adjustments = [];

    for (const module of sortedModules) {
      if (remainingExcess <= 0) break;
      
      // Skip finished modules
      if (module.validate_efm) {
        console.log(`Skipping finished module ${module.moduleCode}`);
        continue;
      }

      // Calculate how much we can reduce this module
      const maxReduction = Math.min(remainingExcess, module.weeklyHours);
      const reduction = Math.min(maxReduction, 5); // Don't reduce more than 5 hours at once
      
      if (reduction > 0) {
        const newWeeklyHours = module.weeklyHours - reduction;
        
        adjustments.push({
          moduleId: module.moduleId,
          moduleCode: module.moduleCode,
          moduleLabel: module.moduleLabel,
          originalHours: module.weeklyHours,
          newHours: newWeeklyHours,
          reduction: reduction,
          reason: "Capacity constraint adjustment"
        });

        remainingExcess -= reduction;
        console.log(`Reduced module ${module.moduleCode} by ${reduction} hours (${module.weeklyHours} → ${newWeeklyHours})`);
      }
    }

    // Continue reducing if we still have excess hours
    if (remainingExcess > 0) {
      for (const module of sortedModules) {
        if (remainingExcess <= 0) break;
        
        // Skip finished modules
        if (module.validate_efm) continue;
        
        // Find existing adjustment for this module
        const existingAdjustment = adjustments.find(adj => adj.moduleId === module.moduleId);
        const currentHours = existingAdjustment ? existingAdjustment.newHours : module.weeklyHours;
        
        if (currentHours > 2.5) { // Don't reduce below minimum
          const maxReduction = Math.min(remainingExcess, currentHours - 2.5);
          const reduction = Math.min(maxReduction, 2.5); // Smaller increments for second pass
          
          if (reduction > 0) {
            const newWeeklyHours = currentHours - reduction;
            
            if (existingAdjustment) {
              existingAdjustment.newHours = newWeeklyHours;
              existingAdjustment.reduction += reduction;
            } else {
              adjustments.push({
                moduleId: module.moduleId,
                moduleCode: module.moduleCode,
                moduleLabel: module.moduleLabel,
                originalHours: module.weeklyHours,
                newHours: newWeeklyHours,
                reduction: reduction,
                reason: "Capacity constraint adjustment (second pass)"
              });
            }

            remainingExcess -= reduction;
            console.log(`Further reduced module ${module.moduleCode} by ${reduction} hours (${currentHours} → ${newWeeklyHours})`);
          }
        }
      }
    }

    if (remainingExcess > 0) {
      result.isValid = false;
      result.errors.push({
        type: "capacity_exceeded",
        message: `Unable to fit all modules within capacity. Still ${remainingExcess} hours over limit.`,
        details: {
          excessHours: remainingExcess,
          maxCapacity: maxWeeklyHours,
          totalRequired: totalRequiredHours
        }
      });
    }

    result.adjustments = adjustments;
    result.totalHoursAfter = totalRequiredHours - (excessHours - remainingExcess);

    // Add warnings for significant reductions
    adjustments.forEach(adjustment => {
      if (adjustment.reduction >= 5) {
        result.warnings.push({
          type: "significant_reduction",
          message: `Significant reduction applied to module ${adjustment.moduleCode}`,
          details: adjustment
        });
      }
    });

    return result;
  }

  /**
   * Group modules by group ID
   * @param {Array} groupModuleData - Array of group-module associations
   * @returns {Object} Modules grouped by groupId
   */
  static groupModulesByGroup(groupModuleData) {
    const grouped = {};
    
    for (const item of groupModuleData) {
      if (!grouped[item.groupId]) {
        grouped[item.groupId] = [];
      }
      grouped[item.groupId].push(item);
    }
    
    return grouped;
  }

  /**
   * Apply adjustments to the actual data
   * @param {Array} groupModuleData - Original group-module data
   * @param {Array} adjustments - Array of adjustments to apply
   * @returns {Array} Updated group-module data
   */
  static applyAdjustments(groupModuleData, adjustments) {
    const updatedData = [...groupModuleData];
    
    for (const adjustment of adjustments) {
      const moduleIndex = updatedData.findIndex(item => item.moduleId === adjustment.moduleId);
      if (moduleIndex !== -1) {
        // Update the hours in the data
        updatedData[moduleIndex] = {
          ...updatedData[moduleIndex],
          adjustedHours: adjustment.newHours,
          originalHours: adjustment.originalHours,
          adjustmentApplied: true
        };
      }
    }
    
    return updatedData;
  }

  /**
   * Generate detailed report of validation results
   * @param {Object} results - Validation results
   * @returns {string} Formatted report
   */
  static generateReport(results) {
    let report = "\nMODULE SCHEDULING VALIDATION REPORT\n";
    report += "=" .repeat(50) + "\n\n";
    
    report += `SUMMARY:\n`;
    report += `   Total modules processed: ${results.summary.totalModules}\n`;
    report += `   Modules adjusted: ${results.summary.adjustedModules}\n`;
    report += `   Total hours before: ${results.summary.totalHoursBefore}\n`;
    report += `   Total hours after: ${results.summary.totalHoursAfter}\n`;
    report += `   Hours saved: ${results.summary.totalHoursBefore - results.summary.totalHoursAfter}\n\n`;
    
    if (results.adjustments.length > 0) {
      report += `ADJUSTMENTS:\n`;
      results.adjustments.forEach((adjustment, index) => {
        report += `   ${index + 1}. ${adjustment.moduleCode} (${adjustment.moduleLabel})\n`;
        report += `      Hours: ${adjustment.originalHours} → ${adjustment.newHours} (-${adjustment.reduction})\n`;
        report += `      Reason: ${adjustment.reason}\n\n`;
      });
    }
    
    if (results.warnings.length > 0) {
      report += `WARNINGS:\n`;
      results.warnings.forEach((warning, index) => {
        report += `   ${index + 1}. ${warning.message}\n`;
      });
      report += "\n";
    }
    
    if (results.errors.length > 0) {
      report += `ERRORS:\n`;
      results.errors.forEach((error, index) => {
        report += `   ${index + 1}. ${error.message}\n`;
      });
      report += "\n";
    }
    
    report += `STATUS: ${results.isValid ? 'VALID' : 'INVALID'}\n`;
    
    return report;
  }
}

module.exports = ModuleSchedulingValidator; 