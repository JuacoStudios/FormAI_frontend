// Utilidades de debug para resetear el estado de la aplicación
// Ejecutar en la consola del navegador

const resetAllState = async () => {
  try {
    // Limpiar todas las claves relacionadas con el estado de la app
    const keysToRemove = [
      'diagnosticCompleted',
      'hasSeenWelcome',
      'hasCompletedFirstScan',
      'isPremiumUser',
      'paywallDismissed',
      'scanAttemptCount',
      'scanHistory'
    ];
    
    for (const key of keysToRemove) {
      await localStorage.removeItem(key);
      console.log(`🗑️ Removed: ${key}`);
    }
    
    console.log('✅ Estado de la aplicación reseteado completamente');
    console.log('🔄 Recarga la página para ver los cambios');
    
    // Recargar la página
    window.location.reload();
  } catch (error) {
    console.error('❌ Error reseteando estado:', error);
  }
};

const checkCurrentState = async () => {
  try {
    const keysToCheck = [
      'diagnosticCompleted',
      'hasSeenWelcome',
      'hasCompletedFirstScan',
      'isPremiumUser',
      'paywallDismissed',
      'scanAttemptCount',
      'scanHistory'
    ];
    
    console.log('🔍 Estado actual de la aplicación:');
    for (const key of keysToCheck) {
      const value = await localStorage.getItem(key);
      console.log(`${key}: ${value || 'undefined'}`);
    }
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  }
};

const makePremium = async () => {
  try {
    await localStorage.setItem('isPremiumUser', 'true');
    await localStorage.removeItem('paywallDismissed');
    console.log('✅ Usuario marcado como premium');
    console.log('🔄 Recarga la página para ver los cambios');
  } catch (error) {
    console.error('❌ Error marcando como premium:', error);
  }
};

// Exportar funciones para uso en consola
window.debugUtils = {
  resetAllState,
  checkCurrentState,
  makePremium
};

console.log('🔧 Debug utils cargadas. Usa:');
console.log('- debugUtils.resetAllState() para resetear todo');
console.log('- debugUtils.checkCurrentState() para ver estado actual');
console.log('- debugUtils.makePremium() para hacer premium al usuario');
