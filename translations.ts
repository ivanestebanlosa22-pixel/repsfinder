// Sistema de traducciones ES/EN - RepsFinder PRO

export type Language = 'es' | 'en';

export const translations = {
  es: {
    // APP
    appName: 'RepsFinder',

    // TABS
    tabHome: 'Inicio',
    tabAgents: 'Agentes',
    tabValidate: 'Validar',
    tabCommunity: 'Comunidad',
    tabLearn: 'Aprender',
    home: 'Inicio',
    agents: 'Agentes',
    validate: 'Validar',
    community: 'Comunidad',
    learn: 'Aprender',

    // COMMON
    tagline: 'Compra Seguro. Compra Inteligente.',
    loading: 'Cargando...',
    
    // AGENTS SCREEN
    agentsTitle: 'Todos los Agentes',
    agentsSubtitle: 'Comparativa completa y verificada',
    agentsCount: 'agentes',
    agentFounded: 'Fundado',
    agentShipping: 'Envío',
    agentQC: 'Éxito QC',
    agentCommission: 'Comisión',
    agentPros: 'Ventajas',
    agentCons: 'Desventajas',
    agentRegister: 'Registrarse en',
    
    // VALIDATE SCREEN
    validateProductCount: 'productos',
    validateBuyButton: 'COMPRAR',
    validateVerifiedSales: 'ventas verificadas',
    validateChooseAgent: 'Elige tu agente',
    validateClose: '✕',
    validateTopQuality: '⭐ TOP CALIDAD',
    validateTrending: '🔥 TENDENCIA',
    validatePopular: '👍 POPULAR',
    validatePremium: '💎 PREMIUM',
    validateOffer: '🎯 OFERTA',
    
    // COMMUNITY SCREEN
    communityLoadingVideos: 'Cargando videos...',
    communityNoVideos: 'Sin videos',
    communityNoVideosText: 'Aún no hay videos en Community',
    communityReload: '🔄 Recargar',
    communityComments: 'Comentarios',
    communityFirstComment: 'Sé el primero en comentar',
    communityWriteComment: 'Escribe un comentario...',
    communitySend: 'Enviar',
    communityShare: 'Share',
    
    // LEARN SCREEN
    learnProgress: 'Tu progreso',
    learnCompleted: 'guías completadas',
    learnBeginner: 'Principiante',
    learnIntermediate: 'Intermedio',
    learnExpert: 'Experto',
    learnUsefulLinks: '🔗 Enlaces útiles',
    learnGlossary: '📖 Glosario de Términos',
    learnGlossarySubtitle: 'Todos los términos que necesitas conocer',
    learnViewGuides: 'Ver Guías',
    learnViewGlossary: 'Ver Glosario',
    learnLegal: 'Legal e Información',
    learnLegalSubtitle: 'Términos, privacidad y avisos importantes',
    learnMarkComplete: 'Marcar como completada',
    learnCompleteButton: '✓ Completada',
    learnExternalGuide: 'Ver guía completa externa',
    
    // HOME/INDEX SCREEN (ya existen en tu translations.ts original, las mantengo)
    heroTitle: 'Encuentra agentes chinos de confianza',
    heroUpdate: 'Actualizado',
    heroMin: 'min',
    whyTitle: '¿Por qué RepsFinder?',
    whySubtitle: 'La primera plataforma todo-en-uno para compras seguras en China',
    whyItems: [
      {
        icon: '🛡️',
        title: 'Agentes Verificados',
        desc: 'Solo agentes con reputación probada'
      },
      {
        icon: '⚡',
        title: 'Actualización Diaria',
        desc: 'Base de datos sincronizada en tiempo real'
      },
      {
        icon: '🔍',
        title: 'Validación Instantánea',
        desc: 'Compara precios de múltiples agentes al instante'
      },
      {
        icon: '📊',
        title: 'Análisis de Reputación',
        desc: 'Sistema de scoring basado en opiniones verificadas'
      }
    ],
    agentsTitle: 'Agentes Verificados',
    agentsSubtitle: 'Comparación en tiempo real',
    verified: 'Verificado',
    fee: 'Fee',
    rating: 'Rating',
    response: 'Respuesta',
    satisfaction: 'Satisfacción',
    shipping: 'Envío',
    days: 'días',
    viewAgent: 'Ver Agente',
    verificationTitle: '¿Cómo validamos agentes?',
    verificationSubtitle: 'Proceso de 3 pasos para garantizar tu seguridad',
    verificationSteps: [
      {
        number: '01',
        title: 'Análisis de Reputación',
        desc: 'Rastreamos r/FashionReps, r/Reps y foros especializados para medir la satisfacción real de usuarios'
      },
      {
        number: '02',
        title: 'Verificación Operativa',
        desc: 'Confirmamos tiempos de respuesta, procesamiento de pedidos y métodos de pago'
      },
      {
        number: '03',
        title: 'Monitoreo Continuo',
        desc: 'Actualizamos ratings semanalmente basados en nuevos reportes de la comunidad'
      }
    ],
    productsTitle: 'Catálogo Verificado',
    productsSubtitle: 'Productos validados con múltiples agentes',
    ctaTitle: 'Únete a la comunidad',
    ctaSubtitle: 'Miles de usuarios comprando seguro cada día',
    ctaButton: 'Explorar Agentes',
    prefLanguage: 'Idioma',
    prefCurrency: 'Moneda',
    legalButton: 'Información Legal',
    footerCopy: '2025 RepsFinder.',
    footerRights: 'Todos los derechos reservados.',
    modalLogin: 'Iniciar Sesión',
    modalRegister: 'Crear Cuenta',
    username: 'Usuario',
    email: 'Email',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    enterButton: 'Entrar',
    createButton: 'Crear Cuenta',
    termsText: 'Al continuar, aceptas los Términos y Condiciones'
  },
  en: {
    // APP
    appName: 'RepsFinder',

    // TABS
    tabHome: 'Home',
    tabAgents: 'Agents',
    tabValidate: 'Validate',
    tabCommunity: 'Community',
    tabLearn: 'Learn',
    home: 'Home',
    agents: 'Agents',
    validate: 'Validate',
    community: 'Community',
    learn: 'Learn',

    // COMMON
    tagline: 'Shop Safe. Shop Smart.',
    loading: 'Loading...',
    
    // AGENTS SCREEN
    agentsTitle: 'All Agents',
    agentsSubtitle: 'Complete verified comparison',
    agentsCount: 'agents',
    agentFounded: 'Founded',
    agentShipping: 'Shipping',
    agentQC: 'QC Success',
    agentCommission: 'Commission',
    agentPros: 'Pros',
    agentCons: 'Cons',
    agentRegister: 'Register at',
    
    // VALIDATE SCREEN
    validateProductCount: 'products',
    validateBuyButton: 'BUY NOW',
    validateVerifiedSales: 'verified sales',
    validateChooseAgent: 'Choose your agent',
    validateClose: '✕',
    validateTopQuality: '⭐ TOP QUALITY',
    validateTrending: '🔥 TRENDING',
    validatePopular: '👍 POPULAR',
    validatePremium: '💎 PREMIUM',
    validateOffer: '🎯 DEAL',
    
    // COMMUNITY SCREEN
    communityLoadingVideos: 'Loading videos...',
    communityNoVideos: 'No videos',
    communityNoVideosText: 'No videos in Community yet',
    communityReload: '🔄 Reload',
    communityComments: 'Comments',
    communityFirstComment: 'Be the first to comment',
    communityWriteComment: 'Write a comment...',
    communitySend: 'Send',
    communityShare: 'Share',
    
    // LEARN SCREEN
    learnProgress: 'Your progress',
    learnCompleted: 'guides completed',
    learnBeginner: 'Beginner',
    learnIntermediate: 'Intermediate',
    learnExpert: 'Expert',
    learnUsefulLinks: '🔗 Useful Links',
    learnGlossary: '📖 Terms Glossary',
    learnGlossarySubtitle: 'All the terms you need to know',
    learnViewGuides: 'View Guides',
    learnViewGlossary: 'View Glossary',
    learnLegal: 'Legal & Information',
    learnLegalSubtitle: 'Terms, privacy and important notices',
    learnMarkComplete: 'Mark as completed',
    learnCompleteButton: '✓ Completed',
    learnExternalGuide: 'View full external guide',
    
    // HOME/INDEX SCREEN
    heroTitle: 'Find trusted Chinese agents',
    heroUpdate: 'Updated',
    heroMin: 'min',
    whyTitle: 'Why RepsFinder?',
    whySubtitle: 'The first all-in-one platform for safe shopping in China',
    whyItems: [
      {
        icon: '🛡️',
        title: 'Verified Agents',
        desc: 'Only agents with proven reputation'
      },
      {
        icon: '⚡',
        title: 'Daily Updates',
        desc: 'Real-time synchronized database'
      },
      {
        icon: '🔍',
        title: 'Instant Validation',
        desc: 'Compare prices from multiple agents instantly'
      },
      {
        icon: '📊',
        title: 'Reputation Analysis',
        desc: 'Scoring system based on verified reviews'
      }
    ],
    agentsTitle: 'Verified Agents',
    agentsSubtitle: 'Real-time comparison',
    verified: 'Verified',
    fee: 'Fee',
    rating: 'Rating',
    response: 'Response',
    satisfaction: 'Satisfaction',
    shipping: 'Shipping',
    days: 'days',
    viewAgent: 'View Agent',
    verificationTitle: 'How do we validate agents?',
    verificationSubtitle: '3-step process to guarantee your safety',
    verificationSteps: [
      {
        number: '01',
        title: 'Reputation Analysis',
        desc: 'We track r/FashionReps, r/Reps and specialized forums to measure real user satisfaction'
      },
      {
        number: '02',
        title: 'Operational Verification',
        desc: 'We confirm response times, order processing and payment methods'
      },
      {
        number: '03',
        title: 'Continuous Monitoring',
        desc: 'We update ratings weekly based on new community reports'
      }
    ],
    productsTitle: 'Verified Catalog',
    productsSubtitle: 'Products validated with multiple agents',
    ctaTitle: 'Join the community',
    ctaSubtitle: 'Thousands of users shopping safely every day',
    ctaButton: 'Explore Agents',
    prefLanguage: 'Language',
    prefCurrency: 'Currency',
    legalButton: 'Legal Information',
    footerCopy: '2025 RepsFinder.',
    footerRights: 'All rights reserved.',
    modalLogin: 'Sign In',
    modalRegister: 'Create Account',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    enterButton: 'Enter',
    createButton: 'Create Account',
    termsText: 'By continuing, you accept the Terms and Conditions'
  }
};
