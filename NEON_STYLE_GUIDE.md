# Guía de Estilo Neón Moderno - FormAI

## Descripción General

Se ha actualizado la sección de Progress UI para que coincida con el estilo moderno y brillante de neón que ya se usa en la aplicación. Los cambios incluyen efectos de brillo, sombras y un sistema de colores consistente.

## Cambios Implementados

### 1. Progress Bar
- **Fondo**: Gris oscuro (`#2a2a2a`) con borde verde neón sutil
- **Barra de progreso**: Verde neón brillante (`#00e676`) con efecto de sombra
- **Efecto de brillo**: Sombra exterior verde neón para efecto de "glow"
- **Animación**: Transiciones suaves cuando cambia el valor de progreso

### 2. Texto y Títulos
- **"Monthly Progress"**: Título en blanco con sombra de texto verde neón
- **Contador de progreso**: Texto blanco con efecto de brillo sutil
- **Tipografía**: Fuentes más grandes y peso de fuente aumentado

### 3. Botones Contador (-1, +1, Target -1, Target +1)
- **Fondo**: Gris muy oscuro (`#1a1a1a`)
- **Borde**: Verde neón brillante con grosor de 2px
- **Efecto de brillo**: Sombra exterior verde neón
- **Texto**: Verde neón con sombra de texto
- **Interactividad**: `activeOpacity={0.7}` para efecto de presión

### 4. Layout y Espaciado
- **Padding aumentado**: De 16px a 24px para un look más limpio
- **Gap entre elementos**: Aumentado a 20px para mejor separación
- **Bordes redondeados**: 16px para contenedores, 12px para botones
- **Espaciado de botones**: 16px entre botones para mejor distribución

## Sistema de Colores

### Colores Principales
```typescript
export const colors = {
  neonGreen: "#00e676",           // Verde neón principal
  neonGreenGlow: "rgba(0,230,118,0.6)",      // Verde neón para efectos de brillo
  neonGreenShadow: "rgba(0,230,118,0.8)",    // Verde neón para sombras
  neonGreenBorder: "rgba(0,230,118,0.3)",    // Verde neón para bordes
  neonGreenTextShadow: "rgba(0,230,118,0.4)", // Verde neón para sombras de texto
  
  neonDarkBg: "#1a1a1a",         // Fondo oscuro para botones
  neonDarkerBg: "#121212",       // Fondo más oscuro para contenedores
  neonGrayBg: "#2a2a2a",         // Fondo gris para barras de progreso
};
```

### Efectos de Sombra y Brillo
```typescript
export const colors = {
  neonShadowOffset: { width: 0, height: 0 },
  neonShadowRadius: 8,            // Radio de sombra estándar
  neonShadowOpacity: 0.8,         // Opacidad de sombra
  neonGlowRadius: 12,             // Radio de brillo exterior
  neonGlowOpacity: 0.4,           // Opacidad de brillo
};
```

## Uso en Componentes

### ProgressBar
```typescript
<View style={styles.progressBarContainer}>
  <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
  <View style={styles.progressBarGlow} />
</View>
```

### Botones Contador
```typescript
<TouchableOpacity 
  style={styles.counterButton} 
  onPress={handlePress}
  activeOpacity={0.7}
>
  <Text style={styles.counterButtonText}>Button Text</Text>
</TouchableOpacity>
```

## Estilos CSS Equivalentes

Para referencia, aquí están los estilos CSS equivalentes:

```css
.progress-bar-container {
  height: 16px;
  border-radius: 12px;
  background-color: #2a2a2a;
  border: 1px solid rgba(0,230,118,0.3);
  position: relative;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #00e676;
  border-radius: 12px;
  box-shadow: 0 0 8px rgba(0,230,118,0.8);
}

.counter-button {
  background-color: #1a1a1a;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid #00e676;
  box-shadow: 0 0 8px rgba(0,230,118,0.6);
  min-width: 80px;
  text-align: center;
}

.counter-button-text {
  color: #00e676;
  font-weight: 700;
  font-size: 14px;
  text-shadow: 0 0 2px #00e676;
}
```

## Consistencia con el Tema

Todos los colores y efectos están definidos en `theme/colors.ts` para mantener consistencia en toda la aplicación. Para usar estos estilos en otros componentes:

1. Importar el archivo de colores: `import { colors } from '../../theme/colors'`
2. Usar las constantes de color en lugar de valores hardcodeados
3. Aplicar los mismos efectos de sombra y brillo para consistencia visual

## Próximos Pasos

Para extender este sistema de estilos:

1. Agregar más variantes de colores neón (azul, púrpura, etc.)
2. Crear componentes reutilizables para botones neón
3. Implementar animaciones más complejas con `Animated` de React Native
4. Agregar soporte para temas claros/oscuros

