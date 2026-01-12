# 🚀 REPSFINDER PRO - INSTRUCCIONES DE INSTALACIÓN

## ✅ ARCHIVOS GENERADOS

He creado **6 archivos** que transformarán tu app:

1. **translations.ts** - Sistema completo ES/EN
2. **currencies.ts** - Conversión USD/EUR
3. **AppSettingsContext.tsx** - Contexto global de configuración
4. **AnimatedBackground.tsx** - Fondo geométrico animado
5. **SettingsButton.tsx** - Selector de idioma/moneda
6. **index.tsx** - Pantalla principal PREMIUM rediseñada

---

## 📋 PASOS DE INSTALACIÓN

### PASO 1: Copiar archivos a tu proyecto

```
Tu estructura debe quedar así:

repsfinder-app/
├── app/
│   └── (tabs)/
│       └── index.tsx  ← REEMPLAZAR con el nuevo
│
├── components/
│   ├── AnimatedBackground.tsx  ← NUEVO
│   └── SettingsButton.tsx  ← NUEVO
│
├── constants/
│   └── currencies.ts  ← NUEVO (o reemplazar)
│
├── contexts/
│   └── AppSettingsContext.tsx  ← NUEVO (o reemplazar)
│
└── i18n/
    └── translations.ts  ← NUEVO (o reemplazar)
```

---

### PASO 2: Actualizar app/_layout.tsx

**Abre:** `app/_layout.tsx`

**Reemplaza TODO con:**

```tsx
import { Stack } from 'expo-router';
import { AppSettingsProvider } from '../contexts/AppSettingsContext';

export default function RootLayout() {
  return (
    <AppSettingsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/legal" options={{ headerShown: false }} />
      </Stack>
    </AppSettingsProvider>
  );
}
```

---

### PASO 3: Verificar imports

Asegúrate de que estos imports funcionen en **index.tsx**:

```tsx
import { useAppSettings } from '../contexts/AppSettingsContext';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { SettingsButton } from '../components/SettingsButton';
import { convertPrice, formatPrice } from '../constants/currencies';
```

Si tienes errores de ruta, ajusta según tu estructura de carpetas.

---

## 🎨 CARACTERÍSTICAS IMPLEMENTADAS

### ✅ Diseño Premium (Regla 60-30-10)
- 60% Negro/Gris oscuro (#0a0a0a, #1a1a1a)
- 30% Blanco/Gris claro (#fff, #a0a0a0)
- 10% Verde neón (#00e5b0) SOLO en acentos

### ✅ Fondo Animado
- Formas geométricas flotantes
- Animación suave y sutil
- No molesta la lectura

### ✅ Auto-Scroll Horizontal
- Agentes rotan cada 4 segundos
- Productos rotan cada 3 segundos
- Scroll automático infinito

### ✅ Bilingüe Completo (ES/EN)
- Selector visible en header
- Todos los textos traducidos
- Guardado en AsyncStorage

### ✅ Bi-Moneda (USD/EUR)
- Conversión automática de precios
- Selector junto con idioma
- Tasa de cambio 1 USD = 0.92 EUR

### ✅ UI/UX Premium
- Cards con sombras sutiles
- Border-radius consistente (12px, 16px)
- Espaciado uniforme
- Tipografía bold en títulos

---

## 🔧 SI TIENES ERRORES

### Error: "Cannot find module '../contexts/AppSettingsContext'"
**Solución:** Verifica que copiaste `AppSettingsContext.tsx` en la carpeta `contexts/`

### Error: "Cannot find module '../components/AnimatedBackground'"
**Solución:** Verifica que copiaste los componentes en `components/`

### Error: "Cannot find module '../constants/currencies'"
**Solución:** Verifica que copiaste `currencies.ts` en `constants/`

### Error: "Cannot find module '../i18n/translations'"
**Solución:** Verifica que copiaste `translations.ts` en `i18n/`

---

## 🎯 PRÓXIMOS PASOS

Una vez que `index.tsx` funcione perfectamente, te generaré:

1. **agents.tsx** - Pantalla de agentes rediseñada
2. **validate.tsx** - Validador rediseñado
3. **community.tsx** - Comunidad rediseñada
4. **learn.tsx** - Guías rediseñadas
5. **_layout.tsx** (tabs) - Tabs rediseñados

---

## 📱 CÓMO PROBARLO

```bash
# En tu terminal:
cd "C:\Users\Admin_\Desktop\app respsfinder\repsfinder-app"

# Ejecutar Expo:
npx expo start

# Presiona 'a' para Android
# o escanea el QR con Expo Go
```

---

## ✅ CHECKLIST

- [ ] Copié todos los 6 archivos a las carpetas correctas
- [ ] Actualicé app/_layout.tsx con AppSettingsProvider
- [ ] Verifiqué que los imports funcionan
- [ ] Ejecuté `npx expo start`
- [ ] La app carga sin errores
- [ ] Veo el botón ⚙️ en el header
- [ ] El fondo animado se muestra
- [ ] Los agentes hacen auto-scroll
- [ ] Los productos hacen auto-scroll

---

## 💡 ¿NECESITAS AYUDA?

Si hay algún error, **pégame EXACTAMENTE** el mensaje de error que te sale y lo arreglo inmediatamente.

**¡Tu app va a quedar INCREÍBLE!** 🚀
