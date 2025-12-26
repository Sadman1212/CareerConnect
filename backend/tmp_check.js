try {
  require('./src/controllers/companyController.js');
  console.log('companyController loaded OK');
} catch (err) {
  console.error('Error loading companyController:', err);
  process.exit(1);
}
