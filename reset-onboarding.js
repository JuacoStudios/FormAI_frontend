// Script temporal para resetear el estado del onboarding
// Ejecutar en la consola del navegador

const resetOnboarding = async () => {
  try {
    // Limpiar todas las claves relacionadas con onboarding
    await localStorage.removeItem('onboardingCompleted');
    await localStorage.removeItem('diagnosticCompleted');
    await localStorage.removeItem('hasSeenWelcome');
    
    console.log('✅ Estado del onboarding reseteado');
    console.log('🔄 Recarga la página para ver el onboarding nuevamente');
    
    // Recargar la página
    window.location.reload();
  } catch (error) {
    console.error('❌ Error reseteando onboarding:', error);
  }
};

// Ejecutar la función
resetOnboarding();
