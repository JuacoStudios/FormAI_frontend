# Configuración de Stripe + RevenueCat para FormAI

## Variables de Entorno Requeridas

### En Vercel Project Settings:

1. **EXPO_PUBLIC_STRIPE_PRICE_ID** = `prod_SupIePjPXzCOlT` (Monthly plan price ID)
2. **EXPO_PUBLIC_STRIPE_PRICE_ID_YEA** = `prod_SupIY9p6eOZuEa` (Annual plan price ID)
3. **EXPO_PUBLIC_REVENUECAT_API_KEY** = `your_revenuecat_api_key_here`

### En archivo local `.env.local`:

```bash
EXPO_PUBLIC_STRIPE_PRICE_ID=prod_SupIePjPXzCOlT
EXPO_PUBLIC_STRIPE_PRICE_ID_YEA=prod_SupIY9p6eOZuEa
EXPO_PUBLIC_REVENUECAT_API_KEY=your_revenuecat_api_key_here
```

## Configuración de RevenueCat

### Productos configurados:

- **$rc_monthly** → Vinculado a `prod_SupIePjPXzCOlT` (Plan mensual)
- **$rc_annual** → Vinculado a `prod_SupIY9p6eOZuEa` (Plan anual)

### Estructura de productos:

```typescript
{
  identifier: '$rc_monthly',
  title: 'Premium Monthly',
  price: 10.00,
  priceString: '$10.00',
  stripePriceId: 'prod_SupIePjPXzCOlT'
}
```

## Flujo de Compra

1. **Usuario selecciona plan** (Monthly/Annual)
2. **Sistema valida Price ID** contra variables de entorno
3. **Se crea sesión de Stripe** via backend
4. **Usuario es redirigido** a Stripe Checkout
5. **Después del pago** → redirect a success/cancel URL

## Verificación de Configuración

1. **Build local**: `npm run build`
2. **Verificar dist/**: Los productos deben cargarse correctamente
3. **Console logs**: Debe mostrar "✅ Stripe configuration validated"
4. **UI**: Debe mostrar los productos con sus Stripe IDs correctos
5. **Click en botones**: Debe abrir Stripe Checkout con el Price ID correcto

## Troubleshooting

### Error: "No products available"
- Verificar que las variables de entorno estén configuradas en Vercel
- Verificar que los Stripe Price IDs sean válidos
- Revisar console para errores de configuración

### Error: "Missing required environment variables"
- Configurar `EXPO_PUBLIC_STRIPE_PRICE_ID` y `EXPO_PUBLIC_STRIPE_PRICE_ID_YEA`
- Redeploy en Vercel después de configurar las variables

### Error: "Invalid price ID"
- Verificar que los Price IDs en Vercel coincidan con los de Stripe
- Los IDs deben ser exactamente: `prod_SupIePjPXzCOlT` y `prod_SupIY9p6eOZuEa`

## Archivos Modificados

- `app/config.ts` - Configuración centralizada con validación
- `services/stripeService.ts` - Servicio de Stripe para checkout
- `services/revenuecatWeb.ts` - Servicio web de RevenueCat integrado con Stripe
- `components/PaywallScreen.tsx` - UI de suscripciones con manejo de errores mejorado
- `env.web` - Variables de entorno de ejemplo
- `vercel.env.example` - Variables para Vercel

## Testing

### Local Testing:
```bash
npm start
# Verificar que los productos se carguen
# Click en Monthly → debe usar prod_SupIePjPXzCOlT
# Click en Annual → debe usar prod_SupIY9p6eOZuEa
```

### Production Testing:
1. Configurar variables en Vercel
2. Redeploy: `vercel --prod --force`
3. Verificar que los productos se carguen sin errores
4. Probar flujo de compra completo
