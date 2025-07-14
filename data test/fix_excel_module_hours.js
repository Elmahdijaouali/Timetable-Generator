const XLSX = require('xlsx');
const path = require('path');

// Helper: Calculate weekly hours for a module (same logic as backend)
function getNumberHoursModulePresentailInWeek(module) {
  const total = Number(module['MHP S1 DRIF'] || 0) + Number(module['MHP S2 DRIF'] || 0);
  if (total <= 30) return 2.5;
  if (total <= 90) return 10;
  return 15;
}
function getNumberHoursModuleRemoteInWeek(module) {
  const total = Number(module['MHSYN S1 DRIF'] || 0) + Number(module['MHSYN S2 DRIF'] || 0);
  if (total > 10) return 5;
  if (total > 0) return 2.5;
  return 0;
}

const MAX_WEEKLY_HOURS = 35;
const inputFile = path.join(__dirname, 'AvancementProgramme.xlsx');
const outputFile = path.join(__dirname, 'AvancementProgramme_fixed.xlsx');

const workbook = XLSX.readFile(inputFile);
const sheetName = workbook.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Group by group code
const groups = {};
rows.forEach(row => {
  const group = row['Groupe'];
  if (!group) return;
  if (!groups[group]) groups[group] = [];
  groups[group].push(row);
});

let changed = false;
Object.entries(groups).forEach(([group, modules]) => {
  // Calculate total weekly hours
  let moduleHours = modules.map(m => ({
    row: m,
    pres: getNumberHoursModulePresentailInWeek(m),
    remote: getNumberHoursModuleRemoteInWeek(m)
  }));
  let total = moduleHours.reduce((sum, m) => sum + m.pres + m.remote, 0);
  if (total <= MAX_WEEKLY_HOURS) return;

  // Try to reduce presential hours first, then remote
  // Sort by presential+remote descending
  moduleHours.sort((a, b) => (b.pres + b.remote) - (a.pres + a.remote));
  for (let mh of moduleHours) {
    while (total > MAX_WEEKLY_HOURS && mh.pres > 2.5) {
      // Reduce presential in steps (15->10->2.5)
      if (mh.pres === 15) mh.pres = 10;
      else if (mh.pres === 10) mh.pres = 2.5;
      else break;
      total = moduleHours.reduce((sum, m) => sum + m.pres + m.remote, 0);
      changed = true;
    }
    while (total > MAX_WEEKLY_HOURS && mh.remote > 0) {
      // Reduce remote in steps (5->2.5->0)
      if (mh.remote === 5) mh.remote = 2.5;
      else if (mh.remote === 2.5) mh.remote = 0;
      else break;
      total = moduleHours.reduce((sum, m) => sum + m.pres + m.remote, 0);
      changed = true;
    }
  }
  if (total > MAX_WEEKLY_HOURS) {
    console.warn(`Group ${group} still over limit: ${total} hours. Manual review needed.`);
  }
  // Write back changes
  moduleHours.forEach(mh => {
    // Adjust the original row for export
    // (Optionally, add new columns to show fixed values)
    mh.row['PresentialHoursFixed'] = mh.pres;
    mh.row['RemoteHoursFixed'] = mh.remote;
  });
});

// Export to new Excel file
const newSheet = XLSX.utils.json_to_sheet(rows);
const newWorkbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
XLSX.writeFile(newWorkbook, outputFile);

console.log(changed
  ? `Fixed file written to ${outputFile}`
  : 'No changes needed. All groups fit within weekly hours.'); 