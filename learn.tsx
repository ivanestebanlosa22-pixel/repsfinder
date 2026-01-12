import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { useAppSettings } from '../../AppSettingsContext';

const MODULES = [
  {
    id: 1,
    title: 'Fundamentos Weidian',
    titleEn: 'Weidian Fundamentals',
    icon: '📚',
    color: '#00e5b0',
    sections: [
      {
        subtitle: '¿Qué es Weidian?',
        subtitleEn: 'What is Weidian?',
        content: 'Weidian (微店) es una plataforma china de e-commerce móvil donde vendedores independientes crean tiendas para vender productos. Fundada en 2013, tiene 50+ millones de tiendas activas.\n\n✅ Mobile-first\n✅ Precios 70-90% menores que retail\n✅ Paraíso de réplicas\n✅ Acceso a fábricas directas',
        contentEn: 'Weidian (微店) is a Chinese mobile e-commerce platform where independent sellers create stores to sell products. Founded in 2013, it has 50+ million active stores.\n\n✅ Mobile-first\n✅ Prices 70-90% lower than retail\n✅ Replica paradise\n✅ Direct factory access',
      },
      {
        subtitle: 'Weidian vs Competidores',
        subtitleEn: 'Weidian vs Competitors',
        content: '📊 Comparativa:\n\nWeidian: Precios muy bajos, abundantes réplicas, necesita agente\nTaobao: Precios medios, muchas réplicas, necesita agente\n1688: Mayoreo, pocas réplicas, necesita agente\nAliExpress: Precios altos, raras réplicas, envío directo',
        contentEn: '📊 Comparison:\n\nWeidian: Very low prices, abundant replicas, needs agent\nTaobao: Medium prices, many replicas, needs agent\n1688: Wholesale, few replicas, needs agent\nAliExpress: High prices, rare replicas, direct shipping',
      },
      {
        subtitle: 'Estructura de Costos Real',
        subtitleEn: 'Real Cost Structure',
        content: '💰 Ejemplo: 2 pares Jordan 1\n\nProductos: $83 (55%)\nService fee agente: $2 (1%)\nQC photos: $2 (1%)\nRemove boxes: $4 (3%)\nEnvío internacional: $60 (40%)\n\nTOTAL: $151\nRetail: $340\nAHORRO: $189 (56%)',
        contentEn: '💰 Example: 2 pairs Jordan 1\n\nProducts: $83 (55%)\nAgent service fee: $2 (1%)\nQC photos: $2 (1%)\nRemove boxes: $4 (3%)\nInternational shipping: $60 (40%)\n\nTOTAL: $151\nRetail: $340\nSAVINGS: $189 (56%)',
      },
    ],
  },
  {
    id: 2,
    title: 'Herramientas Esenciales',
    titleEn: 'Essential Tools',
    icon: '🛠️',
    color: '#fbbf24',
    sections: [
      {
        subtitle: 'ChinaBuyHub - Central de Herramientas',
        subtitleEn: 'ChinaBuyHub - Tool Hub',
        content: '🌐 chinabuyhub.com/tools.html\n\nHerramientas disponibles:\n\n1️⃣ Link Converter - Convierte links Weidian a cualquier agente\n2️⃣ Shipping Calculator - Estima costos antes de comprar\n3️⃣ Top Weidian Stores - Base datos tiendas verificadas\n4️⃣ Agent Comparison - Compara agentes lado a lado\n5️⃣ QC Photos Finder - Busca fotos QC previas\n6️⃣ Batch Identifier - Identifica batches\n7️⃣ Price Tracker - Rastrea precios',
        contentEn: '🌐 chinabuyhub.com/tools.html\n\nAvailable tools:\n\n1️⃣ Link Converter - Convert Weidian links to any agent\n2️⃣ Shipping Calculator - Estimate costs before buying\n3️⃣ Top Weidian Stores - Verified store database\n4️⃣ Agent Comparison - Compare agents side by side\n5️⃣ QC Photos Finder - Find previous QC photos\n6️⃣ Batch Identifier - Identify batches\n7️⃣ Price Tracker - Track prices',
      },
      {
        subtitle: 'FindQC.com',
        subtitleEn: 'FindQC.com',
        content: '🔍 Base de datos comunitaria de QC photos\n\nCómo usar:\n1. Pega link Weidian del producto\n2. FindQC muestra QCs previas\n3. Compara tus fotos con database\n4. Ve si defectos son normales del batch\n\nURL: findqc.com',
        contentEn: '🔍 Community QC photo database\n\nHow to use:\n1. Paste Weidian product link\n2. FindQC shows previous QCs\n3. Compare your photos with database\n4. See if defects are normal for batch\n\nURL: findqc.com',
      },
      {
        subtitle: 'Reddit Communities',
        subtitleEn: 'Reddit Communities',
        content: '💬 Comunidades esenciales:\n\nr/FashionReps (1.5M) - QC, reviews, guías\nr/RepSneakers (1M) - Solo zapatillas, QC detallados\nr/RepBudgetSneakers (200K) - Budget, Weidian-heavy\nr/DesignerReps (400K) - High-end designer\n\nCómo usar:\n1. Busca: "[Tu producto] QC"\n2. Mira 10-20 QCs\n3. Lee comments (GL/RL)\n4. Aprende qué buscar',
        contentEn: '💬 Essential communities:\n\nr/FashionReps (1.5M) - QC, reviews, guides\nr/RepSneakers (1M) - Sneakers only, detailed QC\nr/RepBudgetSneakers (200K) - Budget, Weidian-heavy\nr/DesignerReps (400K) - High-end designer\n\nHow to use:\n1. Search: "[Your product] QC"\n2. Look at 10-20 QCs\n3. Read comments (GL/RL)\n4. Learn what to look for',
      },
    ],
  },
  {
    id: 3,
    title: 'Buscar Productos',
    titleEn: 'Search Products',
    icon: '🔎',
    color: '#8b5cf6',
    sections: [
      {
        subtitle: 'Método 1: ChinaBuyHub Top Stores',
        subtitleEn: 'Method 1: ChinaBuyHub Top Stores',
        content: '🏪 Proceso:\n\n1. Ve a chinabuyhub.com/tools.html\n2. Click "Top Stores"\n3. Selecciona categoría (Sneakers → Jordan 1)\n4. Ve tiendas top rated\n5. Click en tienda → Ve catálogo\n6. Usa Link Converter para tu agente\n\nVentajas:\n✅ Tiendas pre-verificadas\n✅ Ratings de comunidad\n✅ Seguro para principiantes',
        contentEn: '🏪 Process:\n\n1. Go to chinabuyhub.com/tools.html\n2. Click "Top Stores"\n3. Select category (Sneakers → Jordan 1)\n4. See top rated stores\n5. Click on store → See catalog\n6. Use Link Converter for your agent\n\nAdvantages:\n✅ Pre-verified stores\n✅ Community ratings\n✅ Safe for beginners',
      },
      {
        subtitle: 'Método 2: Búsqueda Directa Weidian',
        subtitleEn: 'Method 2: Direct Weidian Search',
        content: '📱 Para usuarios avanzados:\n\nWeidian App: iOS/Android (todo en chino)\nWeidian Web: weidian.com + Chrome traducción\n\nKeywords útiles:\nZapatillas: 鞋子\nJordan: AJ1\nNike: 耐克\nSudadera: 卫衣\nCamiseta: T恤\n\nProceso:\n1. Busca en chino\n2. Ordena por ventas\n3. Verifica reviews con fotos\n4. Copia link\n5. Convierte en ChinaBuyHub',
        contentEn: '📱 For advanced users:\n\nWeidian App: iOS/Android (all in Chinese)\nWeidian Web: weidian.com + Chrome translation\n\nUseful keywords:\nShoes: 鞋子\nJordan: AJ1\nNike: 耐克\nHoodie: 卫衣\nT-shirt: T恤\n\nProcess:\n1. Search in Chinese\n2. Sort by sales\n3. Check reviews with photos\n4. Copy link\n5. Convert in ChinaBuyHub',
      },
      {
        subtitle: 'Identificar Tiendas Confiables',
        subtitleEn: 'Identify Reliable Stores',
        content: '✅ Señales positivas:\n\n• 10,000+ seguidores = consolidada\n• Tasa devolución <5% = excelente\n• Reviews con fotos reales\n• QC Photos disponibles en FindQC\n• Recomendaciones Reddit\n\n🚩 Red flags:\n\n• Sin fotos QC disponibles\n• Precios sospechosamente bajos\n• Sin reviews\n• No acepta devoluciones\n• Links muertos frecuentes',
        contentEn: '✅ Positive signals:\n\n• 10,000+ followers = established\n• Return rate <5% = excellent\n• Reviews with real photos\n• QC Photos available on FindQC\n• Reddit recommendations\n\n🚩 Red flags:\n\n• No QC photos available\n• Suspiciously low prices\n• No reviews\n• Doesn\'t accept returns\n• Frequent dead links',
      },
    ],
  },
  {
    id: 4,
    title: 'Elegir Agente',
    titleEn: 'Choose Agent',
    icon: '🤝',
    color: '#f87171',
    sections: [
      {
        subtitle: '¿Qué es un Agente?',
        subtitleEn: 'What is an Agent?',
        content: '🏢 Un agente de compras es una empresa intermediaria en China que:\n\n1. Compra productos de Weidian por ti\n2. Los recibe en su warehouse\n3. Hace fotos QC (quality control)\n4. Consolida múltiples compras\n5. Envía internacionalmente\n\n¿Por qué necesitas uno?\n❌ Weidian NO acepta pagos internacionales\n❌ Weidian NO envía fuera de China\n✅ Necesitas verificar calidad antes de envío',
        contentEn: '🏢 A buying agent is an intermediary company in China that:\n\n1. Buys Weidian products for you\n2. Receives them at their warehouse\n3. Takes QC photos (quality control)\n4. Consolidates multiple purchases\n5. Ships internationally\n\nWhy do you need one?\n❌ Weidian does NOT accept international payments\n❌ Weidian does NOT ship outside China\n✅ You need to verify quality before shipping',
      },
      {
        subtitle: 'TOP 3 Agentes 2025',
        subtitleEn: 'TOP 3 Agents 2025',
        content: '⭐ 1. LITBUY\nMejor servicio general\nService fee: 0%\nEUR-Air 4kg: $62\nExcelente customer service\nMejor para: España, Europa, USA\n\n⭐ 2. USFANS\nInterface en ESPAÑOL\nService fee: 0%\nUS-Tax-Free 4kg: $54\nWelcome bonus: $120\nMejor para: USA, LATAM, España\n\n⭐ 3. OOPBUY\nExcelente calidad-precio\nService fee: 0%\nEUR-Air 4kg: $64\nPrecios competitivos\nMejor para: Budget-conscious',
        contentEn: '⭐ 1. LITBUY\nBest overall service\nService fee: 0%\nEUR-Air 4kg: $62\nExcellent customer service\nBest for: Spain, Europe, USA\n\n⭐ 2. USFANS\nInterface in SPANISH\nService fee: 0%\nUS-Tax-Free 4kg: $54\nWelcome bonus: $120\nBest for: USA, LATAM, Spain\n\n⭐ 3. OOPBUY\nExcellent value for money\nService fee: 0%\nEUR-Air 4kg: $64\nCompetitive prices\nBest for: Budget-conscious',
      },
      {
        subtitle: 'Elegir Según Tu País',
        subtitleEn: 'Choose by Your Country',
        content: '🌍 España/Europa:\n#1 LitBuy - EUR-Railway: $20-25\n#2 OopBuy - Alternativa sólida\n\n🇺🇸 Estados Unidos:\n#1 USFans - Interface español + optimizado USA\n#2 LitBuy - Alternativa excelente\n\n🇦🇺 Australia:\nLitBuy o OopBuy - SAL: $50-52\n\n🌎 Latinoamérica:\n#1 USFans - Crucial por español + conocen mercado\nMéxico: USFans o LitBuy\nColombia: USFans (entienden aduanas)\nArgentina: Complicado (aduanas restrictivas)',
        contentEn: '🌍 Spain/Europe:\n#1 LitBuy - EUR-Railway: $20-25\n#2 OopBuy - Solid alternative\n\n🇺🇸 United States:\n#1 USFans - Spanish interface + USA optimized\n#2 LitBuy - Excellent alternative\n\n🇦🇺 Australia:\nLitBuy or OopBuy - SAL: $50-52\n\n🌎 Latin America:\n#1 USFans - Crucial for Spanish + know market\nMexico: USFans or LitBuy\nColombia: USFans (understand customs)\nArgentina: Complicated (restrictive customs)',
      },
    ],
  },
  {
    id: 5,
    title: 'Proceso de Compra',
    titleEn: 'Purchase Process',
    icon: '🛒',
    color: '#06b6d4',
    sections: [
      {
        subtitle: 'Paso 1: Registro',
        subtitleEn: 'Step 1: Registration',
        content: '📝 Ejemplo con LitBuy:\n\n1. Ve a litbuy.com\n2. Click "Sign Up" / "Register"\n3. Completa: Email + Contraseña\n4. Verifica email (revisa spam)\n5. Login\n6. Completa perfil: Nombre, País, Dirección\n\nProceso similar en USFans y OopBuy.\n\n💡 TIP: Usa email real que revises frecuentemente.',
        contentEn: '📝 Example with LitBuy:\n\n1. Go to litbuy.com\n2. Click "Sign Up" / "Register"\n3. Complete: Email + Password\n4. Verify email (check spam)\n5. Login\n6. Complete profile: Name, Country, Address\n\nSimilar process on USFans and OopBuy.\n\n💡 TIP: Use real email you check frequently.',
      },
      {
        subtitle: 'Paso 2: Añadir Fondos',
        subtitleEn: 'Step 2: Add Funds',
        content: '💳 Métodos de pago:\n\nPayPal ⭐⭐⭐⭐⭐\n• Más usado\n• Fee: ~3.9%\n• Instantáneo\n\nTarjeta Crédito/Débito ⭐⭐⭐⭐\n• Visa, Mastercard, Amex\n• Fee similar\n\nWise ⭐⭐⭐⭐⭐\n• Fee más bajo (~1%)\n• Tarda 1-2 días\n• Mejor para cantidades grandes\n\nProceso:\n1. "Recharge" / "Top-Up"\n2. Introduce cantidad ($50-100 inicio)\n3. Selecciona método\n4. Completa pago\n5. Fondos aparecen en balance',
        contentEn: '💳 Payment methods:\n\nPayPal ⭐⭐⭐⭐⭐\n• Most used\n• Fee: ~3.9%\n• Instant\n\nCredit/Debit Card ⭐⭐⭐⭐\n• Visa, Mastercard, Amex\n• Similar fee\n\nWise ⭐⭐⭐⭐⭐\n• Lower fee (~1%)\n• Takes 1-2 days\n• Better for large amounts\n\nProcess:\n1. "Recharge" / "Top-Up"\n2. Enter amount ($50-100 start)\n3. Select method\n4. Complete payment\n5. Funds appear in balance',
      },
      {
        subtitle: 'Paso 3: Configurar y Comprar',
        subtitleEn: 'Step 3: Configure and Buy',
        content: '🎯 Agregar producto:\n\n1. Encuentra producto (Módulo 3)\n2. Copia link Weidian\n3. Pega en agente "Buy for Me"\n4. Configura:\n   • Talla (⚠️ +1 o +2 vs talla normal)\n   • Color\n   • Cantidad\n   • Notas: "Check for defects"\n5. Verifica precio\n6. "Add to Cart" o "Buy Now"\n7. Checkout con balance\n8. Espera 3-7 días llegada warehouse\n\nStatus: Ordered → Shipped → In Warehouse',
        contentEn: '🎯 Add product:\n\n1. Find product (Module 3)\n2. Copy Weidian link\n3. Paste in agent "Buy for Me"\n4. Configure:\n   • Size (⚠️ +1 or +2 vs normal size)\n   • Color\n   • Quantity\n   • Notes: "Check for defects"\n5. Verify price\n6. "Add to Cart" or "Buy Now"\n7. Checkout with balance\n8. Wait 3-7 days warehouse arrival\n\nStatus: Ordered → Shipped → In Warehouse',
      },
    ],
  },
  {
    id: 6,
    title: 'Quality Control (QC)',
    titleEn: 'Quality Control (QC)',
    icon: '🔍',
    color: '#ec4899',
    sections: [
      {
        subtitle: '¿Qué son las QC Photos?',
        subtitleEn: 'What are QC Photos?',
        content: '📸 Fotos tomadas por el agente del producto REAL antes de enviártelo.\n\nPropósito:\n✅ Verificar producto correcto\n✅ Detectar defectos\n✅ Comparar con retail\n✅ Decidir GL (aprobar) o RL (rechazar)\n\nTipos:\nEstándar (Gratis): 3-5 fotos básicas\nHD Photos ($0.30-0.50): Alta resolución\nDetailed ($0.50-1): Close-ups específicos\nVideo ($1-2): 360° del producto\n\n⚠️ CRUCIAL: Revisa SIEMPRE antes de envío internacional',
        contentEn: '📸 Photos taken by agent of REAL product before sending it to you.\n\nPurpose:\n✅ Verify correct product\n✅ Detect defects\n✅ Compare with retail\n✅ Decide GL (approve) or RL (reject)\n\nTypes:\nStandard (Free): 3-5 basic photos\nHD Photos ($0.30-0.50): High resolution\nDetailed ($0.50-1): Specific close-ups\nVideo ($1-2): 360° of product\n\n⚠️ CRUCIAL: ALWAYS review before international shipping',
      },
      {
        subtitle: 'Checklist QC Zapatillas',
        subtitleEn: 'Sneakers QC Checklist',
        content: '👟 Áreas críticas:\n\n1. Swoosh/Logo\n✅ Posición correcta\n✅ Tamaño apropiado\n✅ Costura limpia\n\n2. Toebox (Puntera)\n✅ Forma natural\n✅ Simetría L y R\n\n3. Heel (Talón)\n✅ Forma correcta\n✅ Logo centrado\n\n4. Color\n✅ Match con retail\n✅ Sin manchas\n\n5. Sole (Suela)\n✅ Color correcto\n✅ Sin burbujas\n\n6. Stitching\n✅ Limpio y derecho\n✅ Sin hilos sueltos',
        contentEn: '👟 Critical areas:\n\n1. Swoosh/Logo\n✅ Correct position\n✅ Appropriate size\n✅ Clean stitching\n\n2. Toebox\n✅ Natural shape\n✅ L and R symmetry\n\n3. Heel\n✅ Correct shape\n✅ Centered logo\n\n4. Color\n✅ Match with retail\n✅ No stains\n\n5. Sole\n✅ Correct color\n✅ No bubbles\n\n6. Stitching\n✅ Clean and straight\n✅ No loose threads',
      },
      {
        subtitle: 'GL vs RL: Decisión',
        subtitleEn: 'GL vs RL: Decision',
        content: '✅ GREEN LIGHT (Aprobar):\n• Defectos menores aceptables\n• Glue stains pequeños (se limpian)\n• Loose thread mínimo (se corta)\n• Color slightly off\n• Defecto no visible on-feet\n\n❌ RED LIGHT (Rechazar):\n• Color obviamente incorrecto\n• Swoosh/logo muy torcido\n• Stitching muy mal\n• Material claramente barato\n• Stains grandes\n• Damage visible\n\n📸 Pedir más fotos si:\n• Foto poco clara\n• Ángulo no muestra área crítica\n• Necesitas close-up específico\n\nCosto RL: ¥10-15 return shipping',
        contentEn: '✅ GREEN LIGHT (Approve):\n• Acceptable minor defects\n• Small glue stains (cleanable)\n• Minimal loose thread (cuttable)\n• Color slightly off\n• Defect not visible on-feet\n\n❌ RED LIGHT (Reject):\n• Obviously incorrect color\n• Very crooked swoosh/logo\n• Very bad stitching\n• Clearly cheap material\n• Large stains\n• Visible damage\n\n📸 Request more photos if:\n• Unclear photo\n• Angle doesn\'t show critical area\n• Need specific close-up\n\nRL cost: ¥10-15 return shipping',
      },
    ],
  },
  {
    id: 7,
    title: 'Preparación Envío',
    titleEn: 'Shipping Preparation',
    icon: '📦',
    color: '#14b8a6',
    sections: [
      {
        subtitle: 'Consolidación',
        subtitleEn: 'Consolidation',
        content: '🎁 Consolidar = Agrupar múltiples productos en UN paquete.\n\nSIN consolidar:\n• Producto A: $40 envío\n• Producto B: $40 envío\n• Producto C: $40 envío\nTotal: $120\n\nCON consolidar:\n• A+B+C juntos: $70\nTotal: $70\nAHORRO: $50\n\nEstrategia:\n1. Compra varios productos\n2. Espera que TODOS lleguen\n3. GL a todos\n4. Envía todo junto\n\nAlmacenamiento gratis: 90-180 días',
        contentEn: '🎁 Consolidate = Group multiple products in ONE package.\n\nWITHOUT consolidation:\n• Product A: $40 shipping\n• Product B: $40 shipping\n• Product C: $40 shipping\nTotal: $120\n\nWITH consolidation:\n• A+B+C together: $70\nTotal: $70\nSAVINGS: $50\n\nStrategy:\n1. Buy multiple products\n2. Wait for ALL to arrive\n3. GL all\n4. Ship all together\n\nFree storage: 90-180 days',
      },
      {
        subtitle: 'Value-Added Services',
        subtitleEn: 'Value-Added Services',
        content: '✅ RECOMENDADOS:\n\nRemove Box ($1-3)\n• Ahorro: $10-20 por paquete\n• Volumen: -30 a 50%\n• Siempre para zapatillas\n\nVacuum Seal ($1-2)\n• Comprime ropa 20-40%\n• Ideal: sudaderas, hoodies, jeans\n\nRemove Brand Tags ($0.50-1)\n• Reduce riesgo aduanas\n• Recomendado para réplicas obvias\n\nMoisture Barrier ($2-4)\n• Protege de humedad\n• Dificulta inspección aduanas\n\n❌ NO recomendados:\n• Shoe trees (más volumen)\n• Gift wrapping (inútil)',
        contentEn: '✅ RECOMMENDED:\n\nRemove Box ($1-3)\n• Savings: $10-20 per package\n• Volume: -30 to 50%\n• Always for sneakers\n\nVacuum Seal ($1-2)\n• Compresses clothes 20-40%\n• Ideal: hoodies, hoodies, jeans\n\nRemove Brand Tags ($0.50-1)\n• Reduces customs risk\n• Recommended for obvious replicas\n\nMoisture Barrier ($2-4)\n• Protects from moisture\n• Makes customs inspection harder\n\n❌ NOT recommended:\n• Shoe trees (more volume)\n• Gift wrapping (useless)',
      },
      {
        subtitle: 'Rehearsal Packaging',
        subtitleEn: 'Rehearsal Packaging',
        content: '⚖️ El agente pesa REAL antes de enviar.\n\nProceso:\n1. Seleccionas items\n2. Aplicas servicios (remove box, vacuum)\n3. Solicitas "Rehearsal Packaging" ($2-5)\n4. Agente empaqueta TODO como si fuera enviar\n5. Pesa y mide dimensiones reales\n6. Ajusta precio envío\n7. Te devuelven diferencia si pesó menos\n\n¿Cuándo vale?\n✅ Paquetes >5kg\n✅ Muchos items\n❌ No necesario <3kg\n\nAhorro potencial: $10-30',
        contentEn: '⚖️ Agent weighs REAL before shipping.\n\nProcess:\n1. Select items\n2. Apply services (remove box, vacuum)\n3. Request "Rehearsal Packaging" ($2-5)\n4. Agent packs ALL as if shipping\n5. Weighs and measures real dimensions\n6. Adjusts shipping price\n7. Refunds difference if weighed less\n\nWhen worth it?\n✅ Packages >5kg\n✅ Many items\n❌ Not necessary <3kg\n\nPotential savings: $10-30',
      },
    ],
  },
  {
    id: 8,
    title: 'Shipping Internacional',
    titleEn: 'International Shipping',
    icon: '✈️',
    color: '#a855f7',
    sections: [
      {
        subtitle: 'Líneas de Envío',
        subtitleEn: 'Shipping Lines',
        content: '🚢 ECONOMY ($15-30 / 4kg)\n• Velocidad: 20-40 días\n• Tracking: Parcial\n• Ejemplo: Sea Mail, China Post\n\n📦 STANDARD ($50-75 / 4kg)\n• Velocidad: 12-20 días\n• Tracking: Completo\n• Ejemplo: EMS, Railway, Air Mail\n\n⚡ EXPRESS ($100-130 / 4kg)\n• Velocidad: 5-10 días\n• Tracking: Tiempo real\n• Ejemplo: DHL, FedEx, UPS\n\n🎯 TAX-FREE ($50-80 / 4kg)\n• Velocidad: 10-18 días\n• Evita aduanas destino\n• Ejemplo: EUR-Tax-Free, US-Tax-Free',
        contentEn: '🚢 ECONOMY ($15-30 / 4kg)\n• Speed: 20-40 days\n• Tracking: Partial\n• Example: Sea Mail, China Post\n\n📦 STANDARD ($50-75 / 4kg)\n• Speed: 12-20 days\n• Tracking: Complete\n• Example: EMS, Railway, Air Mail\n\n⚡ EXPRESS ($100-130 / 4kg)\n• Speed: 5-10 days\n• Tracking: Real-time\n• Example: DHL, FedEx, UPS\n\n🎯 TAX-FREE ($50-80 / 4kg)\n• Speed: 10-18 days\n• Avoids destination customs\n• Example: EUR-Tax-Free, US-Tax-Free',
      },
      {
        subtitle: 'España/Europa - Líneas',
        subtitleEn: 'Spain/Europe - Lines',
        content: '🇪🇸 Recomendadas:\n\nEUR-Railway Tax-Free ⭐⭐⭐⭐⭐\n• 4kg: $20-25\n• Tiempo: 20-28 días\n• Tax-Free: ✅\n• Mejor para: Presupuesto ajustado\n\nEUR-Air Tax-Free ⭐⭐⭐⭐⭐\n• 4kg: $60-70\n• Tiempo: 12-18 días\n• Tax-Free: ✅\n• Mejor para: Balance precio-velocidad (RECOMENDADO)\n\nDHL/FedEx Express\n• 4kg: $110-130\n• Tiempo: 5-8 días\n• Tax-Free: ❌ (IVA 21%)\n• Mejor para: Urgencias',
        contentEn: '🇪🇸 Recommended:\n\nEUR-Railway Tax-Free ⭐⭐⭐⭐⭐\n• 4kg: $20-25\n• Time: 20-28 days\n• Tax-Free: ✅\n• Best for: Tight budget\n\nEUR-Air Tax-Free ⭐⭐⭐⭐⭐\n• 4kg: $60-70\n• Time: 12-18 days\n• Tax-Free: ✅\n• Best for: Price-speed balance (RECOMMENDED)\n\nDHL/FedEx Express\n• 4kg: $110-130\n• Time: 5-8 days\n• Tax-Free: ❌ (VAT 21%)\n• Best for: Emergencies',
      },
      {
        subtitle: 'Declaraciones Aduana',
        subtitleEn: 'Customs Declarations',
        content: '📋 Regla de Oro:\nDeclaración = Peso (kg) × $12\n\nEjemplos:\n2kg → $24\n4kg → $48\n6kg → $72\n\nSi hay zapatillas: +$8-10 por par\n\nEspaña/UE (límite €150):\n4kg → $44-48\n4kg + 1 par zapas → $58\n\nUSA (límite $800):\n5kg → $60-70\n\nMéxico (límite $50):\n Declarar $40-48\n\nDescripción:\n✅ "Clothing and footwear"\n✅ "Textile products"\n❌ "Replica items"\n❌ "Nike shoes" (marca específica)',
        contentEn: '📋 Golden Rule:\nDeclaration = Weight (kg) × $12\n\nExamples:\n2kg → $24\n4kg → $48\n6kg → $72\n\nIf there are shoes: +$8-10 per pair\n\nSpain/EU (limit €150):\n4kg → $44-48\n4kg + 1 pair shoes → $58\n\nUSA (limit $800):\n5kg → $60-70\n\nMexico (limit $50):\n Declare $40-48\n\nDescription:\n✅ "Clothing and footwear"\n✅ "Textile products"\n❌ "Replica items"\n❌ "Nike shoes" (specific brand)',
      },
    ],
  },
  {
    id: 9,
    title: 'Trucos PRO Ahorro',
    titleEn: 'PRO Saving Tricks',
    icon: '💰',
    color: '#22c55e',
    sections: [
      {
        subtitle: 'Estrategia Remove Boxes',
        subtitleEn: 'Remove Boxes Strategy',
        content: '📦 Ahorro masivo:\n\n2 pares zapatillas:\nSin cajas: 2kg → $30 envío\nCon cajas: 3kg → $45 envío\nAHORRO: $15\n\n5 pares zapatillas:\nSin cajas: 5kg → $70 envío\nCon cajas: 7.5kg → $105 envío\nAHORRO: $35\n\nCosto service: $1-3 por caja\nAhorro neto: $10-32 por haul\n\n✅ SIEMPRE quita cajas (a menos que necesites específicamente)',
        contentEn: '📦 Massive savings:\n\n2 pairs sneakers:\nWithout boxes: 2kg → $30 shipping\nWith boxes: 3kg → $45 shipping\nSAVINGS: $15\n\n5 pairs sneakers:\nWithout boxes: 5kg → $70 shipping\nWith boxes: 7.5kg → $105 shipping\nSAVINGS: $35\n\nService cost: $1-3 per box\nNet savings: $10-32 per haul\n\n✅ ALWAYS remove boxes (unless you specifically need them)',
      },
      {
        subtitle: 'Vacuum Seal Estratégico',
        subtitleEn: 'Strategic Vacuum Seal',
        content: '🗜️ Compresión ropa:\n\n3 sudaderas:\nSin vacuum: 2kg\nCon vacuum: 1.3kg\nAHORRO: $10-15\n\n5 hoodies + 3 jeans:\nSin vacuum: 4.5kg → $65\nCon vacuum: 3kg → $50\nAHORRO: $15\n\nCosto: $1-2 por vacuum\n\nMejor para:\n✅ Sudaderas\n✅ Hoodies\n✅ Jackets\n✅ Jeans\n\n❌ NO para:\nCamisas formales (se arrugan)',
        contentEn: '🗜️ Clothes compression:\n\n3 hoodies:\nWithout vacuum: 2kg\nWith vacuum: 1.3kg\nSAVINGS: $10-15\n\n5 hoodies + 3 jeans:\nWithout vacuum: 4.5kg → $65\nWith vacuum: 3kg → $50\nSAVINGS: $15\n\nCost: $1-2 per vacuum\n\nBest for:\n✅ Sweatshirts\n✅ Hoodies\n✅ Jackets\n✅ Jeans\n\n❌ NOT for:\nFormal shirts (wrinkle)',
      },
      {
        subtitle: 'Sales Events China',
        subtitleEn: 'China Sales Events',
        content: '🎉 Fechas clave:\n\n11.11 (Singles Day) - Nov 11\n• El Black Friday chino\n• Descuentos 20-50%\n• EL MÁS GRANDE\n\n6.18 (Mid-Year) - Jun 18\n• Segundo más grande\n• Buenos deals\n\n12.12 - Dic 12\n• Clearance fin de año\n\nChinese New Year - Ene/Feb\n• Algunas ofertas\n• ⚠️ Fábricas cierran 2-3 semanas\n\n💡 Estrategia: Compra durante estas fechas para mejores precios productos.',
        contentEn: '🎉 Key dates:\n\n11.11 (Singles Day) - Nov 11\n• Chinese Black Friday\n• 20-50% discounts\n• THE BIGGEST\n\n6.18 (Mid-Year) - Jun 18\n• Second biggest\n• Good deals\n\n12.12 - Dec 12\n• End of year clearance\n\nChinese New Year - Jan/Feb\n• Some offers\n• ⚠️ Factories close 2-3 weeks\n\n💡 Strategy: Buy during these dates for better product prices.',
      },
    ],
  },
  {
    id: 10,
    title: 'Tracking & Recepción',
    titleEn: 'Tracking & Reception',
    icon: '📍',
    color: '#f59e0b',
    sections: [
      {
        subtitle: 'Tracking Tools',
        subtitleEn: 'Tracking Tools',
        content: '🔍 Mejores herramientas:\n\n17track.net ⭐⭐⭐⭐⭐\n• Mejor tracker universal\n• Todas las líneas\n• Actualización frecuente\n• Web + App\n\nParcelsapp.com ⭐⭐⭐⭐\n• App móvil excelente\n• Notificaciones push\n• Interface limpia\n\nAfterShip.com ⭐⭐⭐⭐\n• Multi-tracking\n• Dashboard profesional\n\nProceso:\n1. Agente envía → Tracking number\n2. Ve a 17track.net\n3. Pega tracking\n4. Añade a "My Packages"\n5. Recibe updates automáticos',
        contentEn: '🔍 Best tools:\n\n17track.net ⭐⭐⭐⭐⭐\n• Best universal tracker\n• All lines\n• Frequent updates\n• Web + App\n\nParcelsapp.com ⭐⭐⭐⭐\n• Excellent mobile app\n• Push notifications\n• Clean interface\n\nAfterShip.com ⭐⭐⭐⭐\n• Multi-tracking\n• Professional dashboard\n\nProcess:\n1. Agent ships → Tracking number\n2. Go to 17track.net\n3. Paste tracking\n4. Add to "My Packages"\n5. Receive automatic updates',
      },
      {
        subtitle: 'Fases del Envío',
        subtitleEn: 'Shipping Phases',
        content: '📦 Timeline típico:\n\nFASE 1: Origin (Días 1-3)\n"Shipment info received"\n"Picked up"\n"Departed facility"\n\nFASE 2: Transit (Días 4-10)\n"In transit"\n⚠️ Puede no haber updates 5-7 días\n\nFASE 3: Customs (Días 11-13)\n"Inbound Into Customs"\n"Customs Clearance" ← BUENA SEÑAL\n"Released from Customs"\nDuración: 1-3 días\n\nFASE 4: Delivery (Días 14-16)\n"Arrive at delivery office"\n"Out for delivery"\n"Delivered"\n\nTotal: 15-18 días típico',
        contentEn: '📦 Typical timeline:\n\nPHASE 1: Origin (Days 1-3)\n"Shipment info received"\n"Picked up"\n"Departed facility"\n\nPHASE 2: Transit (Days 4-10)\n"In transit"\n⚠️ May have no updates 5-7 days\n\nPHASE 3: Customs (Days 11-13)\n"Inbound Into Customs"\n"Customs Clearance" ← GOOD SIGN\n"Released from Customs"\nDuration: 1-3 days\n\nPHASE 4: Delivery (Days 14-16)\n"Arrive at delivery office"\n"Out for delivery"\n"Delivered"\n\nTotal: 15-18 days typical',
      },
      {
        subtitle: 'Troubleshooting',
        subtitleEn: 'Troubleshooting',
        content: '⚠️ Problemas comunes:\n\nNo movement 7+ días:\n• Normal en economy lines\n• Espera, contacta agente si >10 días\n\n"Customs Inspection":\n• NO pánico (mayoría pasa)\n• Espera 2-3 días\n• Pueden pedir invoice adicional\n\n"Seized by Customs":\n• Contacta agente INMEDIATAMENTE\n• Si asegurado: Reclama\n• Si no: Pérdida total\n\n"Lost in Transit":\n• Espera 30 días\n• Reporta a agente\n• Reclama si asegurado\n\n"Damaged":\n• Fotos ANTES de abrir\n• Reporta 24-48h\n• Reclama si asegurado',
        contentEn: '⚠️ Common problems:\n\nNo movement 7+ days:\n• Normal on economy lines\n• Wait, contact agent if >10 days\n\n"Customs Inspection":\n• DON\'T panic (most pass)\n• Wait 2-3 days\n• May request additional invoice\n\n"Seized by Customs":\n• Contact agent IMMEDIATELY\n• If insured: Claim\n• If not: Total loss\n\n"Lost in Transit":\n• Wait 30 days\n• Report to agent\n• Claim if insured\n\n"Damaged":\n• Photos BEFORE opening\n• Report 24-48h\n• Claim if insured',
      },
    ],
  },
  {
    id: 11,
    title: 'Top Tiendas Verificadas',
    titleEn: 'Top Verified Stores',
    icon: '🏪',
    color: '#3b82f6',
    sections: [
      {
        subtitle: 'Sneakers - Jordan',
        subtitleEn: 'Sneakers - Jordan',
        content: '👟 Mejores tiendas:\n\nA1 Top ⭐⭐⭐⭐⭐\n• Jordan 1, Dunk Low\n• Batches: LJR, M batch\n• Precio: ¥280-450\n• Rating: 4.9/5\n• Muy confiable\n\nCappuccino ⭐⭐⭐⭐⭐\n• Jordan 1, Jordan 4\n• Varios batches\n• Precio: ¥200-400\n• Rating: 4.8/5\n\nPhilanthropist ⭐⭐⭐⭐\n• Jordan budget\n• Precio: ¥160-280\n• Rating: 4.6/5\n• Best budget option',
        contentEn: '👟 Best stores:\n\nA1 Top ⭐⭐⭐⭐⭐\n• Jordan 1, Dunk Low\n• Batches: LJR, M batch\n• Price: ¥280-450\n• Rating: 4.9/5\n• Very reliable\n\nCappuccino ⭐⭐⭐⭐⭐\n• Jordan 1, Jordan 4\n• Various batches\n• Price: ¥200-400\n• Rating: 4.8/5\n\nPhilanthropist ⭐⭐⭐⭐\n• Jordan budget\n• Price: ¥160-280\n• Rating: 4.6/5\n• Best budget option',
      },
      {
        subtitle: 'Streetwear - Supreme/Essentials',
        subtitleEn: 'Streetwear - Supreme/Essentials',
        content: '👕 Top sellers:\n\nLogan ⭐⭐⭐⭐⭐\n• Box logos excelentes\n• Tees, hoodies gran catálogo\n• Precio: ¥80-180\n• Supreme specialist\n\nMirror ⭐⭐⭐⭐⭐\n• Box logos top tier\n• Precio: ¥180-280\n• Más caro pero mejor\n\nGman ⭐⭐⭐⭐⭐\n• Best batch Essentials\n• Thick, high quality\n• Precio: ¥100-250\n\nSingor ⭐⭐⭐⭐\n• Budget Essentials\n• Precio: ¥60-120',
        contentEn: '👕 Top sellers:\n\nLogan ⭐⭐⭐⭐⭐\n• Excellent box logos\n• Tees, hoodies large catalog\n• Price: ¥80-180\n• Supreme specialist\n\nMirror ⭐⭐⭐⭐⭐\n• Top tier box logos\n• Price: ¥180-280\n• More expensive but better\n\nGman ⭐⭐⭐⭐⭐\n• Best batch Essentials\n• Thick, high quality\n• Price: ¥100-250\n\nSingor ⭐⭐⭐⭐\n• Budget Essentials\n• Price: ¥60-120',
      },
      {
        subtitle: 'Outerwear - TNF/CG',
        subtitleEn: 'Outerwear - TNF/CG',
        content: '🧥 Chaquetas top:\n\nHusky Reps ⭐⭐⭐⭐⭐\n• TNF Nuptse best batch\n• Precio: ¥300-450\n• Puffiness excelente\n• TNF specialist\n\n0832Club ⭐⭐⭐⭐\n• TNF general\n• Precio: ¥200-350\n• Buen backup\n\nFeiyu ⭐⭐⭐⭐⭐\n• Best Canada Goose\n• Precio: ¥900-1300\n• Top tier quality\n\nRepcourier ⭐⭐⭐⭐⭐\n• Best Arc\'teryx\n• Precio: ¥300-600',
        contentEn: '🧥 Top jackets:\n\nHusky Reps ⭐⭐⭐⭐⭐\n• TNF Nuptse best batch\n• Price: ¥300-450\n• Excellent puffiness\n• TNF specialist\n\n0832Club ⭐⭐⭐⭐\n• TNF general\n• Price: ¥200-350\n• Good backup\n\nFeiyu ⭐⭐⭐⭐⭐\n• Best Canada Goose\n• Price: ¥900-1300\n• Top tier quality\n\nRepcourier ⭐⭐⭐⭐⭐\n• Best Arc\'teryx\n• Price: ¥300-600',
      },
    ],
  },
  {
    id: 12,
    title: 'Troubleshooting',
    titleEn: 'Troubleshooting',
    icon: '🔧',
    color: '#ef4444',
    sections: [
      {
        subtitle: 'Problemas Compra',
        subtitleEn: 'Purchase Problems',
        content: '⚠️ Situaciones comunes:\n\n"Out of Stock":\n• Agente notifica\n• Opciones: Esperar restock, cambiar producto, reembolso\n\n"Producto Incorrecto":\n• RL inmediatamente\n• Agente contacta vendedor\n• Envían correcto sin costo\n\n"Vendedor No Responde":\n• Espera 3-5 días\n• Agente cancela orden\n• Reembolso automático\n\n"Risk Item":\n• Réplica muy obvia\n• Puedes proceder bajo riesgo\n• O cancelar y buscar alternativa',
        contentEn: '⚠️ Common situations:\n\n"Out of Stock":\n• Agent notifies\n• Options: Wait restock, change product, refund\n\n"Wrong Product":\n• RL immediately\n• Agent contacts seller\n• They send correct at no cost\n\n"Seller Doesn\'t Respond":\n• Wait 3-5 days\n• Agent cancels order\n• Automatic refund\n\n"Risk Item":\n• Very obvious replica\n• You can proceed at risk\n• Or cancel and find alternative',
      },
      {
        subtitle: 'Returns y Cambios',
        subtitleEn: 'Returns and Exchanges',
        content: '🔄 Política general:\n\nANTES envío internacional:\n✅ Fácil: RL durante QC\n• Costo: ¥10-15 return shipping\n• Espera: 3-7 días\n\nDESPUÉS envío:\n❌ Imposible/muy difícil\n• Agente no acepta\n• POR ESO QC ES CRUCIAL\n\nProceso Return:\n1. Click "Return" durante QC\n2. Razón: Quality/Wrong size/Not as described\n3. Agente contacta vendedor\n4. Si acepta: ¥10-15 fee\n5. Opciones: Reemplazo o refund\n\nTips evitar returns:\n✅ Lee reviews\n✅ Verifica QCs previas FindQC\n✅ Pregunta medidas\n✅ Entiende sizing chino',
        contentEn: '🔄 General policy:\n\nBEFORE international shipping:\n✅ Easy: RL during QC\n• Cost: ¥10-15 return shipping\n• Wait: 3-7 days\n\nAFTER shipping:\n❌ Impossible/very difficult\n• Agent doesn\'t accept\n• THAT\'S WHY QC IS CRUCIAL\n\nReturn process:\n1. Click "Return" during QC\n2. Reason: Quality/Wrong size/Not as described\n3. Agent contacts seller\n4. If accepts: ¥10-15 fee\n5. Options: Replacement or refund\n\nTips to avoid returns:\n✅ Read reviews\n✅ Check previous QCs FindQC\n✅ Ask for measurements\n✅ Understand Chinese sizing',
      },
      {
        subtitle: 'Contactar Soporte',
        subtitleEn: 'Contact Support',
        content: '📞 Cómo contactar agente:\n\nChat en sitio\n• Más rápido (minutos-horas)\n• Para issues simples\n\nEmail\n• Para issues complejas\n• Más formal\n\nDiscord/Reddit\n• Representantes oficiales\n• Comunidad ayuda\n\nTicket System\n• Formal con tracking\n• Para disputes\n\nEscalación:\n1. Contacto inicial\n2. Explica problema claramente\n3. Provee evidencia (screenshots)\n4. Si no resuelven: Manager\n5. Último recurso: PayPal dispute',
        contentEn: '📞 How to contact agent:\n\nSite chat\n• Faster (minutes-hours)\n• For simple issues\n\nEmail\n• For complex issues\n• More formal\n\nDiscord/Reddit\n• Official representatives\n• Community helps\n\nTicket System\n• Formal with tracking\n• For disputes\n\nEscalation:\n1. Initial contact\n2. Explain problem clearly\n3. Provide evidence (screenshots)\n4. If not resolved: Manager\n5. Last resort: PayPal dispute',
      },
    ],
  },
  {
    id: 13,
    title: 'FAQ',
    titleEn: 'FAQ',
    icon: '❓',
    color: '#06b6d4',
    sections: [
      {
        subtitle: 'Preguntas Generales',
        subtitleEn: 'General Questions',
        content: '❓ Más frecuentes:\n\n¿Es seguro?\nSí, usando agentes establecidos (LitBuy, USFans, OopBuy). El agente verifica calidad antes.\n\n¿Necesito saber chino?\nNo. Los agentes gestionan todo. Usa Google Translate si navegas Weidian.\n\n¿Cuánto tarda?\n15-30 días total (3-7 warehouse + 12-18 envío)\n\n¿Es legal?\nComprar réplicas para uso personal es legal mayoría países. Revender puede ser ilegal.\n\n¿Qué tan buenas son?\nDepende batch:\n• Budget: 6-7/10\n• Mid-tier: 7-8.5/10\n• High-tier: 8.5-9.5/10',
        contentEn: '❓ Most frequent:\n\nIs it safe?\nYes, using established agents (LitBuy, USFans, OopBuy). Agent verifies quality before.\n\nDo I need to know Chinese?\nNo. Agents handle everything. Use Google Translate if browsing Weidian.\n\nHow long does it take?\n15-30 days total (3-7 warehouse + 12-18 shipping)\n\nIs it legal?\nBuying replicas for personal use is legal in most countries. Reselling may be illegal.\n\nHow good are they?\nDepends on batch:\n• Budget: 6-7/10\n• Mid-tier: 7-8.5/10\n• High-tier: 8.5-9.5/10',
      },
      {
        subtitle: 'Sobre Agentes',
        subtitleEn: 'About Agents',
        content: '🤝 Agentes:\n\n¿Cuál es mejor?\nDepende país y prioridades:\n• LitBuy: Best overall\n• USFans: Best USA/español\n• OopBuy: Best precio\n\n¿Cobran comisión?\nLos 3 top: 0% service fee. Solo pagas producto + envío.\n\n¿Puedo usar múltiples?\nSí, pero NO puedes consolidar entre agentes.\n\n¿Qué si agente cierra?\nRaro pero pasa. Usa agentes establecidos con buena reputación.',
        contentEn: '🤝 Agents:\n\nWhich is best?\nDepends on country and priorities:\n• LitBuy: Best overall\n• USFans: Best USA/Spanish\n• OopBuy: Best price\n\nDo they charge commission?\nTop 3: 0% service fee. You only pay product + shipping.\n\nCan I use multiple?\nYes, but you CANNOT consolidate between agents.\n\nWhat if agent closes?\nRare but happens. Use established agents with good reputation.',
      },
      {
        subtitle: 'Sobre Aduanas',
        subtitleEn: 'About Customs',
        content: '🛃 Aduanas:\n\n¿Me retendrán paquete?\nSi declaras correctamente y usas tax-free: probabilidad baja (5-10%).\n\n¿Qué pasa si abren?\nMayoría pasa sin problema. Pueden pedir invoice. Rara vez retienen.\n\n¿Debo pagar impuestos?\n• Tax-free lines: NO\n• Express lines: SÍ (IVA)\n• Standard: Depende declaración\n\n¿Puedo declarar $0?\nNO. Muy sospechoso. Mínimo razonable.',
        contentEn: '🛃 Customs:\n\nWill they hold my package?\nIf you declare correctly and use tax-free: low probability (5-10%).\n\nWhat if they open it?\nMost pass without problem. May ask for invoice. Rarely hold.\n\nDo I have to pay taxes?\n• Tax-free lines: NO\n• Express lines: YES (VAT)\n• Standard: Depends on declaration\n\nCan I declare $0?\nNO. Very suspicious. Reasonable minimum.',
      },
    ],
  },
  {
    id: 14,
    title: 'Glosario',
    titleEn: 'Glossary',
    icon: '📖',
    color: '#10b981',
    sections: [
      {
        subtitle: 'Términos Compra',
        subtitleEn: 'Purchase Terms',
        content: 'Agent: Intermediario China que compra por ti\n\nBatch: Lote/versión específica producto (LJR, PK)\n\nBudget: Productos <¥250\n\nHaul: Compra grande múltiples items\n\nMiddleman: Vendedor WhatsApp/web (más caro)\n\nQC: Quality Control - Inspección calidad\n\nRep/Replica: Copia producto marca\n\nRetail: Producto auténtico original\n\nW2C: Where to Cop - ¿Dónde comprar?\n\nYupoo: Plataforma álbumes fotos sellers',
        contentEn: 'Agent: China intermediary who buys for you\n\nBatch: Specific product lot/version (LJR, PK)\n\nBudget: Products <¥250\n\nHaul: Large purchase multiple items\n\nMiddleman: WhatsApp/web seller (more expensive)\n\nQC: Quality Control - Quality inspection\n\nRep/Replica: Brand product copy\n\nRetail: Original authentic product\n\nW2C: Where to Cop - Where to buy?\n\nYupoo: Sellers photo album platform',
      },
      {
        subtitle: 'Términos Shipping',
        subtitleEn: 'Shipping Terms',
        content: 'Consolidation: Agrupar productos en un paquete\n\nCustoms: Aduana\n\nDeclaration: Valor declarado paquete\n\nDDP: Delivered Duty Paid (impuestos incluidos)\n\nEMS: Express Mail Service\n\nRehearsal: Pesaje real antes enviar\n\nSAL: Surface Air Lifted (económica)\n\nSeized: Retenido por aduanas\n\nTax-Free: Línea evita aduanas destino\n\nVacuum Seal: Sellado al vacío\n\nVolumetric Weight: Peso por volumen\n\nWarehouse: Almacén agente China',
        contentEn: 'Consolidation: Group products in one package\n\nCustoms: Customs\n\nDeclaration: Package declared value\n\nDDP: Delivered Duty Paid (taxes included)\n\nEMS: Express Mail Service\n\nRehearsal: Real weighing before shipping\n\nSAL: Surface Air Lifted (economy)\n\nSeized: Held by customs\n\nTax-Free: Line avoids destination customs\n\nVacuum Seal: Vacuum sealed\n\nVolumetric Weight: Weight by volume\n\nWarehouse: China agent warehouse',
      },
      {
        subtitle: 'Términos QC y Slang',
        subtitleEn: 'QC and Slang Terms',
        content: 'GL: Green Light - Aprobar producto\n\nRL: Red Light - Rechazar producto\n\nSwoosh: Logo Nike\n\nToebox: Puntera zapatilla\n\nHeel: Talón\n\nSole: Suela\n\nStitching: Costura\n\nGlue Stains: Manchas pegamento\n\nBatch Flaw: Defecto común del batch\n\nCalloutable: Obviamente falso\n\n1:1: Idéntico retail (nunca 100% real)\n\nGOAT: Greatest Of All Time\n\nGrail: Producto muy deseado\n\nGP: Guinea Pig - Primero en comprar\n\nTTS: True to Size - Talla correcta',
        contentEn: 'GL: Green Light - Approve product\n\nRL: Red Light - Reject product\n\nSwoosh: Nike logo\n\nToebox: Sneaker toe\n\nHeel: Heel\n\nSole: Sole\n\nStitching: Stitching\n\nGlue Stains: Glue stains\n\nBatch Flaw: Common batch defect\n\nCalloutable: Obviously fake\n\n1:1: Identical retail (never 100% real)\n\nGOAT: Greatest Of All Time\n\nGrail: Highly desired product\n\nGP: Guinea Pig - First to buy\n\nTTS: True to Size - Correct size',
      },
    ],
  },
];

const QUICK_LINKS = [
  { title: 'LitBuy', titleEn: 'LitBuy', url: 'https://www.litbuy.com/', icon: '🔗' },
  { title: 'USFans', titleEn: 'USFans', url: 'https://www.usfans.com/', icon: '🔗' },
  { title: 'OopBuy', titleEn: 'OopBuy', url: 'https://www.oopbuy.com/', icon: '🔗' },
  { title: 'ChinaBuyHub', titleEn: 'ChinaBuyHub', url: 'https://www.chinabuyhub.com/tools.html', icon: '🛠️' },
  { title: 'FindQC', titleEn: 'FindQC', url: 'https://findqc.com/', icon: '🔍' },
  { title: 'r/FashionReps', titleEn: 'r/FashionReps', url: 'https://www.reddit.com/r/FashionReps/', icon: '💬' },
];

export default function LearnScreen() {
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  const { t, language } = useAppSettings();
  
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  const progress = (completedModules.length / MODULES.length) * 100;

  const toggleModule = (id: number) => {
    setExpandedModule(expandedModule === id ? null : id);
  };

  const markComplete = (id: number) => {
    if (!completedModules.includes(id)) {
      setCompletedModules([...completedModules, id]);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening link:', err));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={[styles.header, { paddingTop: statusBarHeight + 20 }]}>
        <Text style={styles.logo}>RepsFinder</Text>
        <Text style={styles.tagline}>{t.tagline}</Text>
      </View>

      <View style={[styles.bannerContainer, { marginTop: statusBarHeight + 90 }]}>
        <View style={styles.banner}>
          <View style={styles.bannerHeader}>
            <Text style={styles.bannerIcon}>📚</Text>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>
                {language === 'es' ? 'Guía Completa Weidian 2025' : 'Complete Weidian Guide 2025'}
              </Text>
              <Text style={styles.bannerSubtitle}>
                {language === 'es' ? 'De principiante a experto en 14 módulos' : 'From beginner to expert in 14 modules'}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>{t.learnProgress}</Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedModules.length} {language === 'es' ? 'de' : 'of'} {MODULES.length} {language === 'es' ? 'módulos completados' : 'modules completed'}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 210 : 254 }}
      >
        <View style={styles.quickLinks}>
          <Text style={styles.quickLinksTitle}>
            {language === 'es' ? '🔗 Enlaces Útiles' : '🔗 Useful Links'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {QUICK_LINKS.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickLinkCard}
                onPress={() => openLink(link.url)}
              >
                <Text style={styles.quickLinkIcon}>{link.icon}</Text>
                <Text style={styles.quickLinkText}>
                  {language === 'es' ? link.title : link.titleEn}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.modulesContainer}>
          {MODULES.map(module => {
            const isExpanded = expandedModule === module.id;
            const isCompleted = completedModules.includes(module.id);

            return (
              <View key={module.id} style={styles.moduleCard}>
                <TouchableOpacity
                  style={styles.moduleHeader}
                  onPress={() => toggleModule(module.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.moduleLeft}>
                    <View style={[styles.moduleIconContainer, { backgroundColor: module.color + '20' }]}>
                      <Text style={styles.moduleIcon}>{module.icon}</Text>
                    </View>
                    <View style={styles.moduleInfo}>
                      <View style={styles.moduleTitleRow}>
                        <Text style={styles.moduleNumber}>#{module.id}</Text>
                        <Text style={styles.moduleTitle}>
                          {language === 'es' ? module.title : module.titleEn}
                        </Text>
                      </View>
                      {isCompleted && (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedIcon}>✓</Text>
                          <Text style={styles.completedText}>
                            {language === 'es' ? 'Completado' : 'Completed'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={[styles.expandIcon, { color: module.color }]}>
                    {isExpanded ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.moduleContent}>
                    {module.sections.map((section, index) => (
                      <View key={index} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: module.color }]}>
                          {language === 'es' ? section.subtitle : section.subtitleEn}
                        </Text>
                        <Text style={styles.sectionContent}>
                          {language === 'es' ? section.content : section.contentEn}
                        </Text>
                      </View>
                    ))}

                    <TouchableOpacity
                      style={[
                        styles.completeButton,
                        { backgroundColor: module.color },
                        isCompleted && styles.completeButtonDone
                      ]}
                      onPress={() => markComplete(module.id)}
                      disabled={isCompleted}
                    >
                      <Text style={[styles.completeButtonText, isCompleted && { color: module.color }]}>
                        {isCompleted 
                          ? (language === 'es' ? '✓ Completado' : '✓ Completed')
                          : (language === 'es' ? 'Marcar como completado' : 'Mark as completed')
                        }
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.footerMessage}>
          <Text style={styles.footerIcon}>🎯</Text>
          <Text style={styles.footerText}>
            {language === 'es' 
              ? '¡Has completado la guía más completa de Weidian! Ahora estás listo para hacer tu primera compra.' 
              : 'You\'ve completed the most comprehensive Weidian guide! Now you\'re ready to make your first purchase.'}
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#000', 
    paddingHorizontal: 20, 
    paddingBottom: 12, 
    zIndex: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#111' 
  },
  logo: { fontSize: 32, fontWeight: '900', color: '#00e5b0', letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: '#888', marginTop: 4, fontWeight: '500' },
  
  bannerContainer: { 
    position: 'absolute', 
    left: 20, 
    right: 20, 
    zIndex: 9 
  },
  banner: { 
    backgroundColor: '#0a0a0a', 
    padding: 18, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#00e5b0' 
  },
  bannerHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16, 
    gap: 12 
  },
  bannerIcon: { fontSize: 36 },
  bannerTextContainer: { flex: 1 },
  bannerTitle: { 
    fontSize: 18, 
    fontWeight: '900', 
    color: '#00e5b0', 
    marginBottom: 4 
  },
  bannerSubtitle: { 
    fontSize: 13, 
    color: '#aaa', 
    fontWeight: '600' 
  },
  
  progressHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 10 
  },
  progressTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  progressPercent: { fontSize: 15, fontWeight: '900', color: '#00e5b0' },
  progressBarBg: { 
    height: 8, 
    backgroundColor: '#1a1a1a', 
    borderRadius: 4, 
    overflow: 'hidden', 
    marginBottom: 8 
  },
  progressBarFill: { 
    height: '100%', 
    backgroundColor: '#00e5b0', 
    borderRadius: 4 
  },
  progressText: { 
    fontSize: 12, 
    color: '#666', 
    fontWeight: '600',
    textAlign: 'center'
  },
  
  content: { 
    flex: 1
  },
  
  quickLinks: { paddingHorizontal: 20, marginBottom: 24 },
  quickLinksTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#fff', 
    marginBottom: 12 
  },
  quickLinkCard: { 
    backgroundColor: '#0a0a0a', 
    borderWidth: 1, 
    borderColor: '#1a1a1a', 
    borderRadius: 12, 
    padding: 14, 
    marginRight: 12, 
    alignItems: 'center', 
    width: 110 
  },
  quickLinkIcon: { fontSize: 28, marginBottom: 6 },
  quickLinkText: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#00e5b0', 
    textAlign: 'center' 
  },
  
  modulesContainer: { paddingHorizontal: 20, gap: 16 },
  moduleCard: { 
    backgroundColor: '#0a0a0a', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#1a1a1a', 
    overflow: 'hidden' 
  },
  moduleHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16 
  },
  moduleLeft: { flexDirection: 'row', gap: 14, flex: 1, alignItems: 'center' },
  moduleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIcon: { fontSize: 26 },
  moduleInfo: { flex: 1 },
  moduleTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    marginBottom: 6
  },
  moduleNumber: { 
    fontSize: 13, 
    fontWeight: '900', 
    color: '#666',
    backgroundColor: '#111',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  moduleTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#fff',
    flex: 1,
  },
  completedBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1a3a1a', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  completedIcon: {
    fontSize: 11,
    color: '#4ade80',
    fontWeight: '900',
  },
  completedText: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#4ade80' 
  },
  expandIcon: { 
    fontSize: 16, 
    fontWeight: '700',
    marginLeft: 8,
  },
  
  moduleContent: { 
    borderTopWidth: 1, 
    borderTopColor: '#111', 
    padding: 16 
  },
  section: { marginBottom: 20 },
  sectionTitle: { 
    fontSize: 15, 
    fontWeight: '800', 
    marginBottom: 10 
  },
  sectionContent: { 
    fontSize: 14, 
    color: '#ccc', 
    lineHeight: 22 
  },
  
  completeButton: { 
    paddingVertical: 14, 
    borderRadius: 12, 
    marginTop: 8 
  },
  completeButtonDone: { 
    backgroundColor: '#1a3a1a', 
    borderWidth: 2, 
    borderColor: '#4ade80' 
  },
  completeButtonText: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: '#000', 
    textAlign: 'center' 
  },
  
  footerMessage: {
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
    backgroundColor: '#0a0a0a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00e5b0',
    alignItems: 'center',
  },
  footerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 15,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  
  bottomSpacer: { height: Platform.OS === 'ios' ? 100 : 95 },
});