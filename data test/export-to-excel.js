const XLSX = require('xlsx');
const { GroupModuleFormateur, Group, Module, Branch, Formateur } = require('../backend/models');

async function exportToExcel() {
  try {
    console.log('📊 Exporting data to Excel...\n');
    
    const allGroupModules = await GroupModuleFormateur.findAll({
      include: [
        { model: Group, as: 'group', include: [{ model: Branch, as: 'branch' }] },
        { model: Module, as: 'module' },
        { model: Formateur, as: 'formateur' }
      ]
    });

    // Prepare data for Excel
    const excelData = allGroupModules.map(gm => ({
      'Code Filière': gm.group.branch?.code_branch || '',
      'filière': gm.group.branch?.label || '',
      'Groupe': gm.group.code_group,
      'Effectif Groupe': gm.group.effective || '',
      'Année de formation': gm.group.year_of_formation || '',
      'Niveau': gm.group.niveau || '',
      'Code Module': gm.module.code_module || '',
      'Module': gm.module.label || '',
      'Régional': gm.module.is_regionnal ? 'O' : 'N',
      'MHP S1 DRIF': gm.module.mhp_s1 || 0,
      'MHSYN S1 DRIF': gm.module.mhsyn_s1 || 0,
      'MHP S2 DRIF': gm.module.mhp_s2 || 0,
      'MHSYN S2 DRIF': gm.module.mhsyn_s2 || 0,
      'Mle Affecté Présentiel Actif': gm.formateur?.mle_formateur || '',
      'Formateur Affecté Présentiel Actif': gm.formateur?.name || '',
      'Mle Affecté Syn Actif': gm.formateur?.mle_formateur || '',
      'Formateur Affecté Syn Actif': gm.formateur?.name || '',
      'MH Réalisée Présentiel': gm.mhp_realise || 0,
      'MH Réalisée Sync': gm.mhsyn_realise || 0,
      'NB CC': gm.nbr_cc || 0,
      'Validation EFM': gm.validate_efm ? 'oui' : 'non',
      'FusionGroupe': '', // You can add merge information if needed
      'Nbr Heures Présentiel Semaine': gm.nbr_hours_presential_in_week || 0,
      'Nbr Heures Remote Semaine': gm.nbr_hours_remote_in_week || 0,
      'Module Actif': gm.is_started ? 'Oui' : 'Non',
      'Module Terminé': gm.validate_efm ? 'Oui' : 'Non'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Code Filière
      { wch: 25 }, // filière
      { wch: 12 }, // Groupe
      { wch: 15 }, // Effectif Groupe
      { wch: 15 }, // Année de formation
      { wch: 10 }, // Niveau
      { wch: 12 }, // Code Module
      { wch: 30 }, // Module
      { wch: 10 }, // Régional
      { wch: 15 }, // MHP S1 DRIF
      { wch: 15 }, // MHSYN S1 DRIF
      { wch: 15 }, // MHP S2 DRIF
      { wch: 15 }, // MHSYN S2 DRIF
      { wch: 20 }, // Mle Affecté Présentiel Actif
      { wch: 25 }, // Formateur Affecté Présentiel Actif
      { wch: 20 }, // Mle Affecté Syn Actif
      { wch: 25 }, // Formateur Affecté Syn Actif
      { wch: 20 }, // MH Réalisée Présentiel
      { wch: 20 }, // MH Réalisée Sync
      { wch: 10 }, // NB CC
      { wch: 15 }, // Validation EFM
      { wch: 15 }, // FusionGroupe
      { wch: 25 }, // Nbr Heures Présentiel Semaine
      { wch: 25 }, // Nbr Heures Remote Semaine
      { wch: 15 }, // Module Actif
      { wch: 15 }  // Module Terminé
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AvancementProgramme');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `AvancementProgramme_${timestamp}.xlsx`;

    // Write to file
    XLSX.writeFile(workbook, filename);

    console.log(`✅ Excel file exported successfully: ${filename}`);
    console.log(`📊 Total records exported: ${excelData.length}`);
    console.log(`🏫 Total groups: ${new Set(excelData.map(row => row.Groupe)).size}`);
    console.log(`📚 Total modules: ${new Set(excelData.map(row => row['Code Module'])).size}`);

    // Show summary statistics
    const finishedModules = excelData.filter(row => row['Module Terminé'] === 'Oui').length;
    const activeModules = excelData.filter(row => row['Module Actif'] === 'Oui').length;
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Finished modules: ${finishedModules} (${((finishedModules/excelData.length)*100).toFixed(1)}%)`);
    console.log(`   Active modules: ${activeModules} (${((activeModules/excelData.length)*100).toFixed(1)}%)`);
    console.log(`   Inactive modules: ${excelData.length - activeModules} (${(((excelData.length - activeModules)/excelData.length)*100).toFixed(1)}%)`);

  } catch (error) {
    console.error('❌ Error exporting to Excel:', error);
  }
}

exportToExcel(); 