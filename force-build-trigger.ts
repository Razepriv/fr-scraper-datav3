// Force rebuild trigger - Firebase App Hosting build cache issue
// This file forces a new deployment to pick up our module resolution fixes
console.log('Firebase App Hosting build trigger - commit 515a6594');
console.log('Fixes applied:');
console.log('- Relative imports for history-table, database-page, skeleton, db modules');
console.log('- Enhanced webpack configuration with path aliases');
console.log('- Build should now succeed');

export default function forceBuildTrigger() {
  return 'Build trigger - ' + new Date().toISOString();
}
