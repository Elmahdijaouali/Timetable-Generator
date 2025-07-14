const {
  hasSufficientGap,
  getValidSlotsWithGap,
  canAddSessionWithGapRule,
  findAlternativeTimeSlot
} = require('./constraints.js');

/**
 * Comprehensive examples of using the 2.5-hour gap rule
 */

// Example 1: Basic gap validation
function example1_BasicGapValidation() {
  console.log('=== Example 1: Basic Gap Validation ===');
  
  // Test different time slot combinations
  const testCases = [
    {
      description: "Remote 08:30-11:00 → Presential 11:00-13:30",
      remoteSlot: "08:30-11:00",
      presentialSlot: "11:00-13:30",
      expected: false
    },
    {
      description: "Remote 08:30-11:00 → Presential 13:30-16:00",
      remoteSlot: "08:30-11:00",
      presentialSlot: "13:30-16:00",
      expected: true
    },
    {
      description: "Remote 11:00-13:30 → Presential 16:00-18:30",
      remoteSlot: "11:00-13:30",
      presentialSlot: "16:00-18:30",
      expected: true
    },
    // Afternoon remote sessions
    {
      description: "Remote 13:30-16:00 → Presential 08:30-11:00",
      remoteSlot: "13:30-16:00",
      presentialSlot: "08:30-11:00",
      expected: true
    },
    {
      description: "Remote 13:30-16:00 → Presential 11:00-13:30",
      remoteSlot: "13:30-16:00",
      presentialSlot: "11:00-13:30",
      expected: false
    },
    {
      description: "Remote 16:00-18:30 → Presential 08:30-11:00",
      remoteSlot: "16:00-18:30",
      presentialSlot: "08:30-11:00",
      expected: true
    },
    {
      description: "Remote 16:00-18:30 → Presential 11:00-13:30",
      remoteSlot: "16:00-18:30",
      presentialSlot: "11:00-13:30",
      expected: true
    },
    {
      description: "Remote 16:00-18:30 → Presential 13:30-16:00",
      remoteSlot: "16:00-18:30",
      presentialSlot: "13:30-16:00",
      expected: false
    }
  ];

  testCases.forEach(testCase => {
    const hasGap = hasSufficientGap(testCase.remoteSlot, testCase.presentialSlot);
    const status = hasGap === testCase.expected ? '✅' : '❌';
    console.log(`${status} ${testCase.description}: ${hasGap}`);
  });
}

// Example 2: Finding valid time slots
function example2_FindingValidSlots() {
  console.log('\n=== Example 2: Finding Valid Time Slots ===');
  
  const referenceSlots = ["08:30-11:00", "11:00-13:30", "13:30-16:00", "16:00-18:30"];
  
  referenceSlots.forEach(slot => {
    const validSlots = getValidSlotsWithGap(slot);
    console.log(`For ${slot}, valid slots with 2.5h gap: ${validSlots.join(', ')}`);
  });
}

// Example 3: Session validation in a day
function example3_SessionValidation() {
  console.log('\n=== Example 3: Session Validation in a Day ===');
  
  // Scenario: Day with existing remote session
  const daySessions = [
    {
      timeShot: "08:30-11:00",
      type: "à distance",
      module: "Mathématiques",
      formateur: "Dr. Smith"
    }
  ];

  // Try to add different presential sessions
  const newSessions = [
    {
      timeShot: "11:00-13:30",
      type: "présentiel",
      module: "Physique",
      formateur: "Dr. Johnson"
    },
    {
      timeShot: "13:30-16:00",
      type: "présentiel",
      module: "Chimie",
      formateur: "Dr. Brown"
    },
    {
      timeShot: "16:00-18:30",
      type: "présentiel",
      module: "Biologie",
      formateur: "Dr. Davis"
    }
  ];

  newSessions.forEach(session => {
    const canAdd = canAddSessionWithGapRule(daySessions, session);
    console.log(`Can add ${session.module} at ${session.timeShot}: ${canAdd ? '✅ Yes' : '❌ No'}`);
  });
}

// Example 4: Finding alternative time slots
function example4_FindingAlternatives() {
  console.log('\n=== Example 4: Finding Alternative Time Slots ===');
  
  const daySessions = [
    {
      timeShot: "08:30-11:00",
      type: "à distance",
      module: "Mathématiques"
    },
    {
      timeShot: "13:30-16:00",
      type: "présentiel",
      module: "Physique"
    }
  ];

  const conflictingSession = {
    timeShot: "11:00-13:30",
    type: "présentiel",
    module: "Chimie"
  };

  console.log('Current day sessions:');
  daySessions.forEach(session => {
    console.log(`  - ${session.timeShot}: ${session.module} (${session.type})`);
  });

  console.log(`\nTrying to add: ${conflictingSession.timeShot}: ${conflictingSession.module} (${conflictingSession.type})`);
  
  const canAdd = canAddSessionWithGapRule(daySessions, conflictingSession);
  console.log(`Can add directly: ${canAdd ? 'Yes' : 'No'}`);

  if (!canAdd) {
    const alternative = findAlternativeTimeSlot(daySessions, conflictingSession);
    console.log(`Alternative time slot: ${alternative || 'None available'}`);
  }
}

// Example 5: Complex scenario with multiple sessions
function example5_ComplexScenario() {
  console.log('\n=== Example 5: Complex Scenario ===');
  
  const complexDaySessions = [
    {
      timeShot: "08:30-11:00",
      type: "à distance",
      module: "Mathématiques"
    },
    {
      timeShot: "11:00-13:30",
      type: "à distance",
      module: "Informatique"
    },
    {
      timeShot: "13:30-16:00",
      type: "présentiel",
      module: "Physique"
    }
  ];

  console.log('Complex day schedule:');
  complexDaySessions.forEach(session => {
    console.log(`  - ${session.timeShot}: ${session.module} (${session.type})`);
  });

  // Try to add a new remote session
  const newRemoteSession = {
    timeShot: "16:00-18:30",
    type: "à distance",
    module: "Anglais"
  };

  console.log(`\nTrying to add: ${newRemoteSession.timeShot}: ${newRemoteSession.module} (${newRemoteSession.type})`);
  
  const canAdd = canAddSessionWithGapRule(complexDaySessions, newRemoteSession);
  console.log(`Can add: ${canAdd ? 'Yes' : 'No'}`);

  if (!canAdd) {
    const alternative = findAlternativeTimeSlot(complexDaySessions, newRemoteSession);
    console.log(`Alternative: ${alternative || 'None available'}`);
  }
}

// Example 6: Integration with timetable generation
function example6_TimetableIntegration() {
  console.log('\n=== Example 6: Timetable Integration ===');
  
  // Simulate a day's timetable
  const dayTimetable = [];
  
  // Add sessions one by one with gap validation
  const sessionsToAdd = [
    {
      timeShot: "08:30-11:00",
      type: "à distance",
      module: "Mathématiques"
    },
    {
      timeShot: "11:00-13:30",
      type: "présentiel",
      module: "Physique"
    },
    {
      timeShot: "13:30-16:00",
      type: "à distance",
      module: "Informatique"
    },
    {
      timeShot: "16:00-18:30",
      type: "présentiel",
      module: "Chimie"
    }
  ];

  console.log('Building timetable with gap validation:');
  
  sessionsToAdd.forEach((session, index) => {
    console.log(`\nStep ${index + 1}: Adding ${session.module} at ${session.timeShot}`);
    
    if (canAddSessionWithGapRule(dayTimetable, session)) {
      dayTimetable.push(session);
      console.log(`✅ Added successfully`);
    } else {
      const alternative = findAlternativeTimeSlot(dayTimetable, session);
      if (alternative) {
        const adjustedSession = { ...session, timeShot: alternative };
        dayTimetable.push(adjustedSession);
        console.log(`⚠️  Adjusted to ${alternative}`);
      } else {
        console.log(`❌ Cannot add - no valid alternative`);
      }
    }
  });

  console.log('\nFinal timetable:');
  dayTimetable.forEach(session => {
    console.log(`  - ${session.timeShot}: ${session.module} (${session.type})`);
  });
}

// Example 7: Afternoon remote sessions
function example7_AfternoonRemoteSessions() {
  console.log('\n=== Example 7: Afternoon Remote Sessions ===');
  
  // Scenario 1: Remote session at 13:30-16:00
  console.log('Scenario 1: Remote session at 13:30-16:00');
  const afternoonRemote1 = [
    {
      timeShot: "13:30-16:00",
      type: "à distance",
      module: "Anglais"
    }
  ];

  const presentialSessions1 = [
    { timeShot: "08:30-11:00", type: "présentiel", module: "Mathématiques" },
    { timeShot: "11:00-13:30", type: "présentiel", module: "Physique" },
    { timeShot: "16:00-18:30", type: "présentiel", module: "Chimie" }
  ];

  presentialSessions1.forEach(session => {
    const canAdd = canAddSessionWithGapRule(afternoonRemote1, session);
    console.log(`Can add ${session.module} at ${session.timeShot}: ${canAdd ? '✅ Yes' : '❌ No'}`);
  });

  // Scenario 2: Remote session at 16:00-18:30
  console.log('\nScenario 2: Remote session at 16:00-18:30');
  const afternoonRemote2 = [
    {
      timeShot: "16:00-18:30",
      type: "à distance",
      module: "Informatique"
    }
  ];

  const presentialSessions2 = [
    { timeShot: "08:30-11:00", type: "présentiel", module: "Mathématiques" },
    { timeShot: "11:00-13:30", type: "présentiel", module: "Physique" },
    { timeShot: "13:30-16:00", type: "présentiel", module: "Chimie" }
  ];

  presentialSessions2.forEach(session => {
    const canAdd = canAddSessionWithGapRule(afternoonRemote2, session);
    console.log(`Can add ${session.module} at ${session.timeShot}: ${canAdd ? '✅ Yes' : '❌ No'}`);
  });

  // Scenario 3: Complex afternoon schedule
  console.log('\nScenario 3: Complex afternoon schedule');
  const complexAfternoon = [
    {
      timeShot: "08:30-11:00",
      type: "présentiel",
      module: "Mathématiques"
    },
    {
      timeShot: "13:30-16:00",
      type: "à distance",
      module: "Anglais"
    }
  ];

  const newPresential = {
    timeShot: "11:00-13:30",
    type: "présentiel",
    module: "Physique"
  };

  const canAdd = canAddSessionWithGapRule(complexAfternoon, newPresential);
  console.log(`Can add ${newPresential.module} at ${newPresential.timeShot}: ${canAdd ? '✅ Yes' : '❌ No'}`);

  if (!canAdd) {
    const alternative = findAlternativeTimeSlot(complexAfternoon, newPresential);
    console.log(`Alternative slot: ${alternative || 'None available'}`);
  }
}

// Run all examples
function runAllExamples() {
  console.log('🚀 Running 2.5-Hour Gap Rule Examples\n');
  
  example1_BasicGapValidation();
  example2_FindingValidSlots();
  example3_SessionValidation();
  example4_FindingAlternatives();
  example5_ComplexScenario();
  example6_TimetableIntegration();
  example7_AfternoonRemoteSessions();
  
  console.log('\n✅ All examples completed!');
}

// Export for use in other files
module.exports = {
  runAllExamples,
  example1_BasicGapValidation,
  example2_FindingValidSlots,
  example3_SessionValidation,
  example4_FindingAlternatives,
  example5_ComplexScenario,
  example6_TimetableIntegration
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
} 