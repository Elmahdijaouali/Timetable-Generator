const { Setting } = require('../models');

// Get all settings
const index = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Get a specific setting by key
const getByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOne({ where: { key } });
    
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json(setting);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
};

// Create or update a setting
const createOrUpdate = async (req, res) => {
  try {
    const { key, value, description } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'La clé et la valeur sont requises.' });
    }
    
    const [setting, created] = await Setting.findOrCreate({
      where: { key },
      defaults: { value: value.toString(), description }
    });
    
    if (!created) {
      // Update existing setting
      await setting.update({ 
        value: value.toString(), 
        description: description || setting.description 
      });
    }
    
    res.json(setting);
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour du paramètre :', error);
    res.status(500).json({ error: 'Échec de la création/mise à jour du paramètre.' });
  }
};

// Delete a setting
const destroy = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOne({ where: { key } });
    
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    await setting.destroy();
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
};

// Initialize default settings
const initializeDefaults = async () => {
  try {
    const defaultSettings = [
      {
        key: 'show_register_button',
        value: 'true',
        description: 'Enable or disable the register button on login page'
      },
      {
        key: 'max_presential_hours',
        value: '35',
        description: 'Maximum presential hours per week'
      },
      {
        key: 'max_remote_hours',
        value: '10',
        description: 'Maximum remote hours per week'
      }
    ];
    
    for (const setting of defaultSettings) {
      await Setting.findOrCreate({
        where: { key: setting.key },
        defaults: setting
      });
    }
    
    console.log('Default settings initialized');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des paramètres par défaut :', error);
  }
};

module.exports = {
  index,
  getByKey,
  createOrUpdate,
  destroy,
  initializeDefaults
}; 