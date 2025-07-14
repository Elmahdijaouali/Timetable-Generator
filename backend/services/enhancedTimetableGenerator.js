const TimetableValidator = require('./timetableValidator.js');
const TimetableRetryService = require('./timetableRetryService.js');
const { transformGroupwithModules } = require("../helpers/transformers/groupWithSessionPresential.js");

const {
  Group,
  Merge,
  GroupModuleFormateur,
  Branch,
  Module,
  Formateur,
  Classroom,
  FormateurTimetable,
  Session,
  Timetable,
  GroupsNeedChangeTimetable,
  Setting
} = require("../models/index.js");

const {
  getRandomDay,
  getRandomTimeShot,
  getRandomTimeShotInSamedi,
  getNextTimeShot,
} = require("../controllers/GA/randoms.js");

const {
  canAddSessionToDay,
  canAddSessionToDaySamedi,
  checkIfTimeshotTakenInDayEdit,
  checkIfHaveSessionRemoteInDay,
  checkIfSessionWithFormateurTakenByGroup,
  checkFormateurAvailabilityForGroup,
  getValidTimeShotsForFormateurDay,
  isTimeshotTaken,
  canAddSessionWithGapRule,
  findAlternativeTimeSlot
} = require("../controllers/GA/constraints.js");

const { sortSessionInDay } = require("../controllers/GA/helper.js");
const generateTimetableRemoteForEveryMerge = require("../controllers/GA/Generate-remote-timetable.js");

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const TIME_SHOTS = ["08:30-11:00", "11:00-13:30", "13:30-16:00", "16:00-18:30"];

/**
 * Enhanced Timetable Generator
 * 
 * This service provides enhanced timetable generation with:
 * 1. Comprehensive validation
 * 2. Automatic retry logic
 * 3. Conflict detection and resolution
 * 4. Detailed reporting
 */

class EnhancedTimetableGenerator {
  
  constructor(maxAttempts = 50) {
    this.retryService = new TimetableRetryService(maxAttempts);
    this.generationStats = {
      totalGroups: 0,
      successfulGroups: 0,
      failedGroups: 0,
      totalAttempts: 0,
      averageAttempts: 0
    };
  }

  /**
   * Generate timetables for all groups with enhanced validation and retry
   * @param {string} valide_a_partir_de - Valid from date
   * @param {Object} options - Generation options
   * @returns {Object} Generation results
   */
  async generateAllTimetables(valide_a_partir_de, options = {}) {
    console.log(`Starting enhanced timetable generation for date: ${valide_a_partir_de}`);
    
    this.generationStats = {
      totalGroups: 0,
      successfulGroups: 0,
      failedGroups: 0,
      totalAttempts: 0,
      averageAttempts: 0
    };

    const results = {
      success: true,
      message: "Timetable generation completed",
      stats: this.generationStats,
      groups: [],
      errors: []
    };

    try {
      // Check if formateur timetables exist
      const timetablesFormateur = await FormateurTimetable.findOne();
      if (!timetablesFormateur) {
        throw new Error('Before generating group timetables, formateur timetables must be generated first!');
      }

      // Check if this is first generation or update
      const timetablesDB = await Timetable.findAll({});
      const isFirstGeneration = timetablesDB.length === 0;

      if (isFirstGeneration) {
        console.log("First generation mode - generating for all groups");
        await this.generateFirstTime(valide_a_partir_de, options, results);
      } else {
        console.log("Update mode - generating for groups that need changes");
        await this.generateUpdates(valide_a_partir_de, options, results);
      }

      // Calculate final statistics
      this.calculateFinalStats(results);
      
      // Clean up groups that needed changes
      await GroupsNeedChangeTimetable.destroy({ truncate: true });

      console.log(`Enhanced timetable generation completed`);
      console.log(`Final Statistics:`, this.generationStats);

      return results;

    } catch (error) {
      console.error("Error in enhanced timetable generation:", error);
      results.success = false;
      results.message = "Timetable generation failed";
      results.errors.push(error.message);
      return results;
    }
  }

  /**
   * Generate timetables for first time (all groups)
   * @param {string} valide_a_partir_de - Valid from date
   * @param {Object} options - Generation options
   * @param {Object} results - Results object to update
   */
  async generateFirstTime(valide_a_partir_de, options, results) {
    const branches = await Branch.findAll({
      include: [{ model: Group, include: [Merge] }],
    });

    this.generationStats.totalGroups = branches.reduce((total, branch) => total + branch.Groups.length, 0);

    // Fetch max hours per week from settings
    let maxHoursPerWeek = 35;
    try {
      const presentialSetting = await Setting.findOne({ where: { key: 'max_presential_hours' } });
      if (presentialSetting && !isNaN(Number(presentialSetting.value))) {
        maxHoursPerWeek = Number(presentialSetting.value);
      }
    } catch (e) {}

    // Pre-check: For each group, calculate total planned hours per week and compare to max
    for (const branch of branches) {
      for (const group of branch.Groups) {
        // Get all active modules for this group
        const groupModules = await this.getGroupModulesWithDetails(group.id);
        const activeModules = groupModules.filter(m => m.validate_efm !== true);
        let totalPresential = 0;
        let totalRemote = 0;
        activeModules.forEach(m => {
          totalPresential += Number(m.nbr_hours_presential_in_week || 0);
          // If you want to include remote hours in the weekly max, add here:
          // totalRemote += Number(m.nbr_hours_remote_in_week || 0);
        });
        const totalWeekly = totalPresential; // + totalRemote if needed
        if (totalWeekly > maxHoursPerWeek) {
          console.log(`\n⚠️  Group ${group.code_group}: Total planned presential hours per week (${totalWeekly}) EXCEEDS max allowed (${maxHoursPerWeek}).`);
          console.log(`   - Consider reducing weekly hours for some modules or pausing modules in some weeks.`);
          // Optionally, skip generation for this group:
          // results.groups.push({ groupCode: group.code_group, success: false, message: `Total planned hours per week exceeds max allowed.` });
          // this.generationStats.failedGroups++;
          // results.errors.push(`Group ${group.code_group}: Total planned hours per week exceeds max allowed.`);
          // continue;
        } else {
          console.log(`Group ${group.code_group}: Total planned presential hours per week = ${totalWeekly} (OK)`);
        }
        // Proceed with timetable generation
        const groupResult = await this.generateGroupTimetable(group, valide_a_partir_de, options);
        results.groups.push(groupResult);
        if (groupResult.success) {
          this.generationStats.successfulGroups++;
        } else {
          this.generationStats.failedGroups++;
          results.errors.push(`Group ${group.code_group}: ${groupResult.message}`);
        }
      }
    }
  }

  /**
   * Generate timetables for groups that need updates
   * @param {string} valide_a_partir_de - Valid from date
   * @param {Object} options - Generation options
   * @param {Object} results - Results object to update
   */
  async generateUpdates(valide_a_partir_de, options, results) {
    const groups = await GroupsNeedChangeTimetable.findAll({
      include: [
        { model: Group, include: [{ model: Merge }] }
      ]
    });

    this.generationStats.totalGroups = groups.length;

    for (const groupData of groups) {
      const group = groupData.Group;
      const groupResult = await this.generateGroupTimetable(group, valide_a_partir_de, options);
      results.groups.push(groupResult);
      
      if (groupResult.success) {
        this.generationStats.successfulGroups++;
      } else {
        this.generationStats.failedGroups++;
        results.errors.push(`Group ${group.code_group}: ${groupResult.message}`);
      }
    }
  }

  /**
   * Generate timetable for a single group with retry logic and module deactivation
   * @param {Object} group - The group object
   * @param {string} valide_a_partir_de - Valid from date
   * @param {Object} options - Generation options
   * @returns {Object} Generation result
   */
  async generateGroupTimetable(group, valide_a_partir_de, options) {
    console.log(`\nGenerating timetable for group: ${group.code_group}`);
    try {
      // Get required sessions for the group
      let requiredSessions = await this.getRequiredSessions(group);

      // ADD THIS CHECK:
      if (!requiredSessions || requiredSessions.length === 0) {
        console.log(`Group ${group.code_group} has no active modules. Skipping timetable generation.`);
        return {
          success: true,
          message: "No active modules for this group. Skipped.",
          timetable: [],
          deactivatedModules: []
        };
      }

      let originalSessions = [...requiredSessions]; // Keep original for comparison
      
      // Try with 100 attempts first
      const maxAttempts = 100;
      let result = await this.retryService.generateWithRetry(
        (group, options) => this.generateSingleTimetable(group, options),
        group,
        requiredSessions,
        { ...options, maxAttempts }
      );

      // If still no valid timetable, start deactivating modules with most duration
      if (!result.success) {
        console.log(`\n⚠️  Failed to generate valid timetable after ${maxAttempts} attempts`);
        console.log(`🔄 Starting module deactivation strategy for group: ${group.code_group}`);
        
        result = await this.generateWithModuleDeactivation(group, requiredSessions, valide_a_partir_de, options);
      }

      // Store timetable if successful
      if (result.success) {
        await this.storeTimetableToDB(group.code_group, result.timetable, valide_a_partir_de);
        console.log(`✅ Timetable stored for group: ${group.code_group}`);
      } else {
        console.log(`❌ Failed to generate timetable for group: ${group.code_group} even with module deactivation`);
      }

      // Generate detailed report
      const report = this.retryService.generateReport(result);
      console.log(report);

      return {
        groupCode: group.code_group,
        groupId: group.id,
        success: result.success,
        message: result.success ? "Timetable generated successfully" : result.message,
        attemptCount: result.attemptCount,
        validationResult: result.validationResult,
        report: report,
        deactivatedModules: result.deactivatedModules || []
      };
    } catch (error) {
      console.error(`Error generating timetable for group ${group.code_group}:`, error);
      return {
        groupCode: group.code_group,
        groupId: group.id,
        success: false,
        message: error.message,
        error: error
      };
    }
  }

  /**
   * Generate a single timetable attempt for a group
   * @param {Object} group - The group object
   * @param {Object} options - Generation options
   * @returns {Object} Generated timetable
   */
  async generateSingleTimetable(group, options) {
    // Generate remote timetables
    const remoteTimetables = await generateTimetableRemoteForEveryMerge();
    
    // Build merged remote timetable for the group
    const mergeResult = await this.buildMergedGroupRemoteTimetable(group.Merges, remoteTimetables);
    
    if (mergeResult.conflictDetected) {
      // Handle conflicts by retrying remote generation
      throw new Error("Remote timetable conflicts detected - retrying generation");
    }

    // Get presential sessions
    const presentialSessions = await this.getPresentialSessions(group);
    
    // Create empty timetable structure
    const timetable = this.createEmptyTimetable();
    
    // Merge with remote sessions
    if (mergeResult.merged) {
      timetable.forEach((dayObj, index) => {
        const dayName = Object.keys(dayObj)[0];
        if (mergeResult.merged[index] && mergeResult.merged[index][dayName]) {
          dayObj[dayName] = mergeResult.merged[index][dayName];
        }
      });
    }

    // Place presential sessions
    for (const moduleSession of presentialSessions) {
      await this.placeSessionWithValidation(timetable, [], moduleSession);
    }

    return timetable;
  }

  /**
   * Get required sessions for a group
   * @param {Object} group - The group object
   * @returns {Array} Array of required sessions
   */
  async getRequiredSessions(group) {
    const groupData = await Group.findOne({
      where: { id: group.id },
      include: [{
        model: GroupModuleFormateur,
        include: [
          { model: Module, as: "module" },
          {
            model: Formateur,
            as: "formateur",
            include: [{ model: Classroom, as: "classroom" }],
          },
        ],
      }],
    });

    return transformGroupwithModules(groupData);
  }

  /**
   * Get presential sessions for a group
   * @param {Object} group - The group object
   * @returns {Array} Array of presential sessions
   */
  async getPresentialSessions(group) {
    return await this.getRequiredSessions(group);
  }

  /**
   * Create empty timetable structure
   * @returns {Array} Empty timetable array
   */
  createEmptyTimetable() {
    return DAYS.map(day => ({ [day]: [] }));
  }

  /**
   * Build merged group remote timetable
   * @param {Array} merges - Array of merges
   * @param {Array} remoteTimetables - Array of remote timetables
   * @returns {Object} Merge result
   */
  async buildMergedGroupRemoteTimetable(merges, remoteTimetables) {
    const mergedTimetable = this.createEmptyTimetable();
    let conflictDetected = false;

    for (const merge of merges) {
      const remoteTimetable = remoteTimetables.find(rt => rt.mergeId === merge.id);
      
      if (remoteTimetable) {
        // Merge remote sessions into the main timetable
        remoteTimetable.timetable.forEach((dayObj, index) => {
          const dayName = Object.keys(dayObj)[0];
          const daySessions = dayObj[dayName];
          
          daySessions.forEach(session => {
            mergedTimetable[index][dayName].push(session);
          });
        });
      }
    }

    return {
      merged: mergedTimetable,
      conflictDetected
    };
  }

  /**
   * Place session with validation
   * @param {Array} timetable - The timetable
   * @param {Array} groupsTimetables - Other groups' timetables
   * @param {Object} moduleSession - The session to place
   */
  async placeSessionWithValidation(timetable, groupsTimetables, moduleSession) {
    let attemptCount = 0;
    let placed = false;

    while (!placed && attemptCount < 1000) {
      const randomDay = getRandomDay();
      const indexDay = DAYS.indexOf(randomDay);
      const dayKey = DAYS[indexDay];
      
      if (indexDay === -1 || !timetable[indexDay] || !timetable[indexDay][dayKey]) {
        attemptCount++;
        continue;
      }

      const timeShot = indexDay === 5 ? getRandomTimeShotInSamedi() : getRandomTimeShot();
      const timeshotAfterCheck = checkIfTimeshotTakenInDayEdit(timetable[indexDay][dayKey], timeShot);
      const session = {
        ...moduleSession,
        timeShot: timeshotAfterCheck
      };

      const validatedSession = checkIfHaveSessionRemoteInDay(timetable[indexDay][dayKey], session);

      // Check formateur availability
      const timetableFormateur = await FormateurTimetable.findOne({
        where: {
          formateurId: validatedSession.formateurId,
          day: randomDay
        }
      });
      
      if (!timetableFormateur) {
        attemptCount++;
        continue;
      }
     
      const [availStart, availEnd] = timetableFormateur.timeshot.split('-').map(t => t.trim());
      const [sessionStart, sessionEnd] = validatedSession.timeShot.split('-').map(t => t.trim());
      
      const toMinutes = (t) => {
        const [h, m] = t.split(':');
        return h * 60 + Number(m);
      };
      
      const sessionStartMin = toMinutes(sessionStart);
      const sessionEndMin = toMinutes(sessionEnd);
      const availStartMin = toMinutes(availStart);
      const availEndMin = toMinutes(availEnd);
   
      const isAvailable = sessionStartMin >= availStartMin && sessionEndMin <= availEndMin;

      if (!isAvailable) {
        attemptCount++;
        continue;
      }

      if (
        isAvailable && 
        canAddSessionToDay(timetable, indexDay, moduleSession) &&
        checkIfSessionWithFormateurTakenByGroup(groupsTimetables, session, randomDay) &&
        (indexDay !== 5 || canAddSessionToDaySamedi(timetable, indexDay, validatedSession)) &&
        canAddSessionWithGapRule(timetable[indexDay][dayKey], validatedSession)
      ) {
        // Handle 5-hour sessions (two consecutive slots)
        if (moduleSession.nbr_hours_presential_in_week === 5) {
          const nextTime = getNextTimeShot(timeShot);
          if (nextTime == null) {
            attemptCount++;
            continue;
          }

          const [sessionNextStart, sessionNextEnd] = nextTime.split('-').map(t => t.trim());
          const sessionNextStartMin = toMinutes(sessionNextStart);
          const sessionNextEndMin = toMinutes(sessionNextEnd);
          const isAvailableNextSession = sessionNextStartMin >= availStartMin && sessionNextEndMin <= availEndMin;

          if (isTimeshotTaken(timetable[indexDay][dayKey], nextTime) || !isAvailableNextSession) {
            attemptCount++;
            continue;
          }
          
          const sessionTwo = {
            ...moduleSession,
            timeShot: checkIfTimeshotTakenInDayEdit(timetable[indexDay][dayKey], nextTime),
          };
           
          const validatedSessionTwo = checkIfHaveSessionRemoteInDay(timetable[indexDay][dayKey], sessionTwo);
          
          if (checkIfSessionWithFormateurTakenByGroup(groupsTimetables, validatedSessionTwo, randomDay) &&
              canAddSessionWithGapRule(timetable[indexDay][dayKey], validatedSessionTwo)) {
            this.pushSessionToDay(timetable[indexDay][dayKey], validatedSessionTwo);
          } else {
            attemptCount++;
            continue;
          }
        }

        this.pushSessionToDay(timetable[indexDay][dayKey], validatedSession);
        placed = true;
      }

      attemptCount++;
    }

    if (!placed) {
      throw new Error(`Could not place session for module ${moduleSession.module_label} after ${attemptCount} attempts`);
    }
  }

  /**
   * Push session to day
   * @param {Array} daySessions - Day sessions array
   * @param {Object} session - Session to add
   */
  pushSessionToDay(daySessions, session) {
    session.timeShot = checkIfTimeshotTakenInDayEdit(daySessions, session.timeShot);
    daySessions.push(session);
  }

  /**
   * Store timetable to database
   * @param {string} groupCode - Group code
   * @param {Array} timetableData - Timetable data
   * @param {string} valide_a_partir_de - Valid from date
   */
  async storeTimetableToDB(groupCode, timetableData, valide_a_partir_de) {
    try {
      const group = await Group.findOne({ where: { code_group: groupCode } });
      if (!group) throw new Error(`Group ${groupCode} not found`);

      // Update status of all existing timetables for this group to archived
      const timetablesGroup = await Timetable.findAll({ where: { groupId: group.id } });
      if (timetablesGroup.length > 0) {
        await Timetable.update({ status: 'archived' }, {
          where: { groupId: group.id },
        });
      }

      // Create new timetable
      const timetable = await Timetable.create({
        groupId: group.id,
        valid_form: valide_a_partir_de,
        status: 'active'
      });

      let nbr_hours_in_week = 0;

      // Store sessions
      for (const dayObj of timetableData) {
        const dayName = Object.keys(dayObj)[0];
        const sessions = dayObj[dayName];

        for (const session of sessions) {
          await Session.create({
            timetableId: timetable.id,
            groupId: group.id,
            moduleId: session.moduleId,
            formateurId: session.formateurId,
            classroomId: session.classroomId,
            timeshot: session.timeShot,
            type: session.type,
            day: dayName
          });

          nbr_hours_in_week += 2.5;
        }
      }
      
      // Update total hours
      await Timetable.update({ nbr_hours_in_week: nbr_hours_in_week }, {
        where: {
          groupId: group.id,
          status: 'active'
        },
      });

      console.log(`Timetable stored for group ${groupCode}`);
      
    } catch (err) {
      console.error(`Error saving timetable:`, err);
      throw err;
    }
  }

  /**
   * Generate timetable by progressively deactivating modules with most duration
   * @param {Object} group - The group object
   * @param {Array} requiredSessions - Required sessions
   * @param {string} valide_a_partir_de - Valid from date
   * @param {Object} options - Generation options
   * @returns {Object} Generation result
   */
  async generateWithModuleDeactivation(group, requiredSessions, valide_a_partir_de, options) {
    console.log(`\n🔄 Starting module deactivation strategy for group: ${group.code_group}`);
    
    // Get all modules for this group with their details
    const groupModules = await this.getGroupModulesWithDetails(group.id);
    
    // Sort modules by duration (highest first) and filter out finished modules
    const sortableModules = groupModules
      .filter(module => !module.validate_efm) // Skip finished modules
      .sort((a, b) => b.nbr_hours_presential_in_week - a.nbr_hours_presential_in_week);
    
    console.log(`📋 Found ${sortableModules.length} non-finished modules to potentially deactivate`);
    sortableModules.forEach(module => {
      console.log(`   - ${module.module_label}: ${module.nbr_hours_presential_in_week} hours`);
    });

    // Try deactivating modules one by one, starting with the highest duration
    for (let i = 0; i < sortableModules.length; i++) {
      const moduleToDeactivate = sortableModules[i];
      console.log(`\n🔄 Attempt ${i + 1}: Deactivating module "${moduleToDeactivate.module_label}" (${moduleToDeactivate.nbr_hours_presential_in_week} hours)`);
      
      // Create a copy of required sessions without this module
      const filteredSessions = requiredSessions.filter(session => 
        session.moduleId !== moduleToDeactivate.moduleId
      );
      
      console.log(`   📊 Sessions before: ${requiredSessions.length}, after: ${filteredSessions.length}`);
      
      if (filteredSessions.length === 0) {
        console.log(`   ⚠️  No sessions left after deactivation, skipping this module`);
        continue;
      }

      // Try to generate timetable with reduced sessions
      try {
        const result = await this.retryService.generateWithRetry(
          (group, options) => this.generateSingleTimetable(group, options),
          group,
          filteredSessions,
          { ...options, maxAttempts: 100 } // Reduced attempts for deactivation attempts
        );

        if (result.success) {
          console.log(`✅ Success! Generated valid timetable after deactivating "${moduleToDeactivate.module_label}"`);
          
          // Update the module status in database to deactivated
          await this.deactivateModule(group.id, moduleToDeactivate.moduleId);
          
          return {
            ...result,
            deactivatedModules: [{
              moduleId: moduleToDeactivate.moduleId,
              moduleLabel: moduleToDeactivate.module_label,
              hours: moduleToDeactivate.nbr_hours_presential_in_week,
              reason: "Deactivated due to scheduling constraints"
            }]
          };
        } else {
          console.log(`   ❌ Still failed after deactivating "${moduleToDeactivate.module_label}"`);
        }
      } catch (error) {
        console.log(`   ❌ Error during deactivation attempt: ${error.message}`);
      }
    }

    // If we get here, even deactivating all modules didn't work
    console.log(`❌ Failed to generate timetable even after deactivating all non-finished modules`);
    throw new Error(`Could not generate valid timetable for group ${group.code_group} even with module deactivation strategy`);
  }

  /**
   * Get group modules with detailed information
   * @param {number} groupId - Group ID
   * @returns {Array} Array of modules with details
   */
  async getGroupModulesWithDetails(groupId) {
    const groupModules = await GroupModuleFormateur.findAll({
      where: { groupId, is_started: true },
      include: [
        { model: Module, as: 'module' },
        { model: Formateur, as: 'formateur' }
      ]
    });

    return groupModules.map(gm => ({
      moduleId: gm.moduleId,
      module_label: gm.module.label,
      nbr_hours_presential_in_week: gm.nbr_hours_presential_in_week,
      validate_efm: gm.validate_efm,
      mhp_realise: gm.mhp_realise,
      mhsyn_realise: gm.mhsyn_realise
    }));
  }

  /**
   * Deactivate a module for a group
   * @param {number} groupId - Group ID
   * @param {number} moduleId - Module ID
   */
  async deactivateModule(groupId, moduleId) {
    try {
      await GroupModuleFormateur.update(
        { is_started: false },
        { where: { groupId, moduleId } }
      );
      console.log(`   ✅ Module ${moduleId} deactivated for group ${groupId}`);
    } catch (error) {
      console.error(`   ❌ Error deactivating module: ${error.message}`);
    }
  }

  /**
   * Calculate final statistics
   * @param {Object} results - Results object
   */
  calculateFinalStats(results) {
    this.generationStats.totalAttempts = results.groups.reduce((total, group) => {
      return total + (group.attemptCount || 0);
    }, 0);

    this.generationStats.averageAttempts = this.generationStats.totalGroups > 0 ? 
      (this.generationStats.totalAttempts / this.generationStats.totalGroups).toFixed(2) : 0;

    results.stats = this.generationStats;
  }

  /**
   * Generate comprehensive generation report
   * @param {Object} results - Generation results
   * @returns {string} Detailed report
   */
  generateComprehensiveReport(results) {
    let report = `\nEnhanced Timetable Generation Report\n`;
    report += `==========================================\n\n`;
    
    report += `Overall Status: ${results.success ? 'SUCCESS' : 'FAILED'}\n`;
    report += `Valid From: ${results.validFrom || 'N/A'}\n\n`;
    
    report += `Generation Statistics:\n`;
    report += `  - Total Groups: ${this.generationStats.totalGroups}\n`;
    report += `  - Successful: ${this.generationStats.successfulGroups}\n`;
    report += `  - Failed: ${this.generationStats.failedGroups}\n`;
    report += `  - Success Rate: ${this.generationStats.totalGroups > 0 ? 
      ((this.generationStats.successfulGroups / this.generationStats.totalGroups) * 100).toFixed(1) : 0}%\n`;
    report += `  - Total Attempts: ${this.generationStats.totalAttempts}\n`;
    report += `  - Average Attempts: ${this.generationStats.averageAttempts}\n\n`;

    if (results.errors.length > 0) {
      report += `Errors (${results.errors.length}):\n`;
      results.errors.forEach(error => {
        report += `  - ${error}\n`;
      });
      report += `\n`;
    }

          report += `Group Results:\n`;
      results.groups.forEach(group => {
        const status = group.success ? 'SUCCESS' : 'FAILED';
      report += `  ${status} ${group.groupCode}: ${group.message}\n`;
      if (group.attemptCount) {
        report += `    Attempts: ${group.attemptCount}\n`;
      }
      
      // Add deactivated modules information
      if (group.deactivatedModules && group.deactivatedModules.length > 0) {
        report += `    Deactivated Modules:\n`;
        group.deactivatedModules.forEach(module => {
          report += `      - ${module.moduleLabel}: ${module.hours} hours (${module.reason})\n`;
        });
      }
    });

    return report;
  }
}

module.exports = EnhancedTimetableGenerator; 