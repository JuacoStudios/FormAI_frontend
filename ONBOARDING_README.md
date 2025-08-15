# Sistema de Onboarding - FormAI

## Descripción

Sistema de onboarding de 6 pasos que presenta preguntas al usuario sobre sus objetivos de fitness y preferencias de entrenamiento. Diseñado con un tema dark mode y acentos neon verde, siguiendo las especificaciones exactas del usuario.

## Características

- ✅ **6 pantallas de preguntas** con opciones seleccionables
- ✅ **Diseño dark mode** con acentos neon verde (#00FF7F)
- ✅ **Transiciones suaves** entre pantallas (fade + slide)
- ✅ **Barra de progreso** con indicador de paso actual
- ✅ **Navegación intuitiva** con botones de retroceso y continuar
- ✅ **Estado local temporal** - sin persistencia ni backend
- ✅ **Animaciones fluidas** entre preguntas

## Preguntas del Onboarding

1. **What is your main goal at the gym?**
   - Build muscle
   - Lose fat
   - Improve endurance
   - General fitness

2. **How often do you go to the gym?**
   - 0–2 times per week
   - 3–5 times per week
   - 6+ times per week

3. **What is your preferred workout type?**
   - Weight training
   - Cardio
   - Mixed training
   - Classes (yoga, pilates, etc.)

4. **Do you follow a specific diet plan?**
   - Yes
   - No

5. **What time of day do you usually work out?**
   - Morning
   - Afternoon
   - Evening

6. **Have you tried other fitness apps?**
   - Yes
   - No

## Estructura de Archivos

```
hooks/
└── useOnboarding.ts              # Hook principal del onboarding

components/
├── OnboardingScreen.tsx          # Pantalla principal del onboarding
├── OnboardingSelectableCard.tsx  # Tarjetas seleccionables
└── OnboardingTest.tsx            # Panel de prueba (remover en producción)

app/
└── onboarding.tsx                # Ruta del onboarding
```

## Diseño y Estilo

### Paleta de Colores
- **Fondo principal**: `colors.neonDarkBg` (#1a1a1a)
- **Fondo secundario**: `colors.neonGrayBg` (#2a2a2a)
- **Acento principal**: `colors.neonGreen` (#00e676)
- **Texto**: `colors.white` (#FFFFFF)
- **Texto secundario**: `colors.darkGray` (#1a1a1a)

### Elementos de UI
- **Status Bar**: Tiempo en pill verde neon
- **Progress Bar**: Verde neon para completado, gris oscuro para pendiente
- **Tarjetas seleccionables**: Borde verde neon cuando seleccionadas
- **Botón Continue**: Fondo verde neon con texto negro
- **Botón Back**: Borde verde neon con texto verde

## Funcionalidad

### Navegación
- **Avanzar**: Solo disponible después de seleccionar una opción
- **Retroceder**: Disponible desde el paso 2 en adelante
- **Progreso**: Barra de progreso actualizada automáticamente

### Animaciones
- **Transición entre preguntas**: Fade out + slide left, luego fade in + slide center
- **Duración**: 150ms fade out, 200ms fade in
- **Easing**: Linear para transiciones suaves

### Estado
- **Estado local**: React useState para respuestas y paso actual
- **Sin persistencia**: Las respuestas se pierden al recargar
- **Sin backend**: No hay llamadas a API o base de datos

## Uso

### Acceso al Onboarding
```tsx
// Navegar al onboarding
router.push('/onboarding');
```

### Estado del Onboarding
```tsx
import { useOnboarding } from '@/hooks/useOnboarding';

function MyComponent() {
  const { 
    currentStep, 
    answers, 
    canContinue,
    nextStep 
  } = useOnboarding();
  
  // Usar el estado del onboarding
}
```

## Testing

### Panel de Prueba
El componente `OnboardingTest` muestra:
- Paso actual y porcentaje de completado
- Respuestas seleccionadas
- Botones de prueba (Previous, Next, Reset)

### Para Remover en Producción
```tsx
// En OnboardingScreen.tsx, remover esta línea:
<OnboardingTest />
```

## Personalización

### Cambiar Preguntas
Editar `ONBOARDING_STEPS` en `useOnboarding.ts`:
```typescript
export const ONBOARDING_STEPS = [
  { 
    id: 'customQuestion', 
    title: 'Your custom question?', 
    options: ['Option 1', 'Option 2', 'Option 3'] 
  },
  // ... más preguntas
];
```

### Cambiar Colores
Editar `theme/colors.ts`:
```typescript
export const colors = {
  neonGreen: "#00FF7F", // Cambiar color principal
  neonDarkBg: "#000000", // Cambiar fondo
  // ... más colores
};
```

## Consideraciones

- **Sin persistencia**: Las respuestas se pierden al recargar la app
- **Sin backend**: Solo maneja estado local
- **Responsive**: Diseñado para móviles
- **Accesibilidad**: Alto contraste y elementos táctiles grandes

## Próximos Pasos

Para completar el sistema:
1. Agregar persistencia con AsyncStorage
2. Integrar con backend/Supabase
3. Agregar validación de respuestas
4. Implementar skip/omitir preguntas
5. Agregar analytics del onboarding
6. Remover panel de prueba en producción

## Troubleshooting

### El onboarding no se muestra
1. Verificar que la ruta `/onboarding` esté configurada
2. Verificar que los componentes estén importados correctamente
3. Verificar que no haya errores en la consola

### Animaciones no funcionan
1. Verificar que `useNativeDriver: true` esté configurado
2. Verificar que las animaciones estén en el useEffect correcto

### Estilos no se aplican
1. Verificar que `colors` esté importado correctamente
2. Verificar que las variables de color existan en `theme/colors.ts`
