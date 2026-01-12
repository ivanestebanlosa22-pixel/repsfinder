// Sistema de traducciones COMPLETAS ES/EN - RepsFinder PRO
// Actualizado: Enero 2026 - PRODUCCIÓN

export type Language = 'es' | 'en';

export const translations = {
  es: {
    // APP INFO
    appName: 'RepsFinder',
    tagline: 'Compra Seguro. Compra Inteligente.',

    // TABS (en español)
    home: 'Inicio',
    agents: 'Agentes',
    validate: 'Validar',
    community: 'Comunidad',
    learn: 'Aprender',

    // COMMON
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    close: 'Cerrar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',

    // HOME/INDEX SCREEN
    homeWelcome: '¡Encuentra los mejores agentes chinos!',
    homeSubtitle: 'Compara precios, revisa reputación y compra con confianza',
    homeTopAgents: 'Agentes Premium Verificados',
    homeTopAgentsNote: 'Los mejores agentes con enlaces exclusivos',
    homeWhyRepsfinder: '¿Por qué RepsFinder?',
    homeFeaturedProducts: 'Productos Destacados',
    homeProductsNote: 'Productos rotados cada 48 horas desde Google Sheets',
    homeStats: 'Estadísticas',
    homeComparison: 'Comparativa Rápida',
    homeComparisonNote: 'Valoraciones aproximadas según la comunidad',
    homeCTATitle: '¿Listo para empezar?',
    homeCTASubtitle: 'Únete a miles de usuarios comprando seguro',
    homeCTAButton: 'Crear Cuenta Gratis',

    // BENEFITS
    benefit1: 'Agentes verificados por la comunidad',
    benefit2: 'Protección de compras garantizada',
    benefit3: 'Soporte en español 24/7',
    benefit4: 'Comparativa de precios en tiempo real',
    benefit5: 'Comunidad activa de compradores',
    benefit6: 'Guías completas para principiantes',
    benefit7: 'Sin comisiones ocultas',

    // STATS
    stat1Value: '50K+',
    stat1Label: 'Usuarios activos',
    stat2Value: '11',
    stat2Label: 'Agentes verificados',
    stat3Value: '99%',
    stat3Label: 'Satisfacción',

    // COMPARISON TABLE
    comparisonAgent: 'Agente',
    comparisonSpeed: 'Velocidad',
    comparisonPrice: 'Precio',
    comparisonSupport: 'Soporte',

    // AGENTS BONUS
    agentsBonus: 'BONO',
    agentsRegister: 'Registrarse',

    // AUTH MODAL
    authLogin: 'Iniciar Sesión',
    authRegister: 'Crear Cuenta',
    authUsername: 'Nombre de usuario',
    authEmail: 'Email',
    authPassword: 'Contraseña',
    authConfirmPassword: 'Confirmar contraseña',
    authLoginButton: 'Entrar',
    authRegisterButton: 'Crear cuenta',
    authTerms: 'Al registrarte, aceptas nuestros Términos y Condiciones',

    // AGENTS SCREEN
    agentsTitle: 'Todos los Agentes Verificados',
    agentsSubtitle: 'Comparativa completa actualizada desde Google Sheets',
    agentsCount: 'agentes disponibles',
    agentFounded: 'Fundado',
    agentShipping: 'Envío',
    agentQC: 'QC',
    agentCommission: 'Comisión',
    agentPros: 'Ventajas',
    agentCons: 'Desventajas',
    agentRegisterAt: 'Registrarse en',
    agentVisitSite: 'Visitar Sitio',
    agentsFilterAll: 'Todos',
    agentsFilterFeatured: 'Destacados',
    agentsFilterBudget: 'Económicos',
    agentsFilterPremium: 'Premium',

    // VALIDATE SCREEN
    validateTitle: 'Validar Productos',
    validateSubtitle: 'Base de datos completa desde Google Sheets',
    validateProductCount: 'productos disponibles',
    validateBuyButton: 'COMPRAR',
    validateVerifiedSales: 'ventas verificadas',
    validateChooseAgent: 'Elige tu agente',
    validateClose: '✕',
    validateTopQuality: '⭐ TOP CALIDAD',
    validateTrending: '🔥 TENDENCIA',
    validatePopular: '👍 POPULAR',
    validatePremium: '💎 PREMIUM',
    validateOffer: '🎯 OFERTA',
    validateSearchPlaceholder: 'Buscar productos...',
    validateNoResults: 'No se encontraron productos',
    validateLoadMore: 'Cargar más',

    // COMMUNITY SCREEN
    communityTitle: 'Comunidad RepsFinder',
    communitySubtitle: 'Comparte experiencias y aprende de otros',
    communityLoadingVideos: 'Cargando videos...',
    communityNoVideos: 'Sin videos',
    communityNoVideosText: 'Aún no hay videos en la comunidad',
    communityReload: '🔄 Recargar',
    communityComments: 'Comentarios',
    communityFirstComment: 'Sé el primero en comentar',
    communityWriteComment: 'Escribe un comentario...',
    communitySend: 'Enviar',
    communityShare: 'Compartir',
    communityLike: 'Me gusta',
    communityViews: 'vistas',

    // LEARN SCREEN
    learnTitle: 'Centro de Aprendizaje',
    learnSubtitle: 'Todo lo que necesitas saber',
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

    // SETTINGS
    settingsTitle: 'Configuración',
    settingsLanguage: 'Idioma',
    settingsLanguageES: 'Español',
    settingsLanguageEN: 'English',
    settingsCurrency: 'Moneda',
    settingsCurrencyUSD: 'USD ($)',
    settingsCurrencyEUR: 'EUR (€)',
    settingsSaved: 'Configuración guardada',
    settingsTheme: 'Tema',
    settingsThemeDark: 'Oscuro',
    settingsThemeLight: 'Claro',

    // LEGAL
    legalTitle: 'Información Legal',
    legalSubtitle: 'Términos y condiciones',
    legalBack: 'Volver',

    // FOOTER
    footerLegal: 'Información Legal',
    footerCopy: '© 2026 RepsFinder',
    footerRights: 'Todos los derechos reservados',

    // BANNER (para todas las pantallas)
    bannerWelcome: '¡Bienvenido a RepsFinder!',
    bannerSubtext: 'La mejor plataforma para compras seguras',
  },

  en: {
    // APP INFO
    appName: 'RepsFinder',
    tagline: 'Shop Safe. Shop Smart.',

    // TABS (in English)
    home: 'Home',
    agents: 'Agents',
    validate: 'Validate',
    community: 'Community',
    learn: 'Learn',

    // COMMON
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',

    // HOME/INDEX SCREEN
    homeWelcome: 'Find the best Chinese agents!',
    homeSubtitle: 'Compare prices, check reputation and shop with confidence',
    homeTopAgents: 'Verified Premium Agents',
    homeTopAgentsNote: 'Top agents with exclusive links',
    homeWhyRepsfinder: 'Why RepsFinder?',
    homeFeaturedProducts: 'Featured Products',
    homeProductsNote: 'Products rotated every 48 hours from Google Sheets',
    homeStats: 'Statistics',
    homeComparison: 'Quick Comparison',
    homeComparisonNote: 'Approximate ratings according to the community',
    homeCTATitle: 'Ready to get started?',
    homeCTASubtitle: 'Join thousands of users shopping safely',
    homeCTAButton: 'Create Free Account',

    // BENEFITS
    benefit1: 'Community-verified agents',
    benefit2: 'Guaranteed purchase protection',
    benefit3: '24/7 Spanish support',
    benefit4: 'Real-time price comparison',
    benefit5: 'Active buyer community',
    benefit6: 'Complete guides for beginners',
    benefit7: 'No hidden fees',

    // STATS
    stat1Value: '50K+',
    stat1Label: 'Active users',
    stat2Value: '11',
    stat2Label: 'Verified agents',
    stat3Value: '99%',
    stat3Label: 'Satisfaction',

    // COMPARISON TABLE
    comparisonAgent: 'Agent',
    comparisonSpeed: 'Speed',
    comparisonPrice: 'Price',
    comparisonSupport: 'Support',

    // AGENTS BONUS
    agentsBonus: 'BONUS',
    agentsRegister: 'Register',

    // AUTH MODAL
    authLogin: 'Sign In',
    authRegister: 'Create Account',
    authUsername: 'Username',
    authEmail: 'Email',
    authPassword: 'Password',
    authConfirmPassword: 'Confirm password',
    authLoginButton: 'Enter',
    authRegisterButton: 'Create account',
    authTerms: 'By registering, you accept our Terms and Conditions',

    // AGENTS SCREEN
    agentsTitle: 'All Verified Agents',
    agentsSubtitle: 'Complete comparison updated from Google Sheets',
    agentsCount: 'available agents',
    agentFounded: 'Founded',
    agentShipping: 'Shipping',
    agentQC: 'QC',
    agentCommission: 'Commission',
    agentPros: 'Pros',
    agentCons: 'Cons',
    agentRegisterAt: 'Register at',
    agentVisitSite: 'Visit Site',
    agentsFilterAll: 'All',
    agentsFilterFeatured: 'Featured',
    agentsFilterBudget: 'Budget',
    agentsFilterPremium: 'Premium',

    // VALIDATE SCREEN
    validateTitle: 'Validate Products',
    validateSubtitle: 'Complete database from Google Sheets',
    validateProductCount: 'available products',
    validateBuyButton: 'BUY NOW',
    validateVerifiedSales: 'verified sales',
    validateChooseAgent: 'Choose your agent',
    validateClose: '✕',
    validateTopQuality: '⭐ TOP QUALITY',
    validateTrending: '🔥 TRENDING',
    validatePopular: '👍 POPULAR',
    validatePremium: '💎 PREMIUM',
    validateOffer: '🎯 DEAL',
    validateSearchPlaceholder: 'Search products...',
    validateNoResults: 'No products found',
    validateLoadMore: 'Load more',

    // COMMUNITY SCREEN
    communityTitle: 'RepsFinder Community',
    communitySubtitle: 'Share experiences and learn from others',
    communityLoadingVideos: 'Loading videos...',
    communityNoVideos: 'No videos',
    communityNoVideosText: 'No videos in the community yet',
    communityReload: '🔄 Reload',
    communityComments: 'Comments',
    communityFirstComment: 'Be the first to comment',
    communityWriteComment: 'Write a comment...',
    communitySend: 'Send',
    communityShare: 'Share',
    communityLike: 'Like',
    communityViews: 'views',

    // LEARN SCREEN
    learnTitle: 'Learning Center',
    learnSubtitle: 'Everything you need to know',
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

    // SETTINGS
    settingsTitle: 'Settings',
    settingsLanguage: 'Language',
    settingsLanguageES: 'Español',
    settingsLanguageEN: 'English',
    settingsCurrency: 'Currency',
    settingsCurrencyUSD: 'USD ($)',
    settingsCurrencyEUR: 'EUR (€)',
    settingsSaved: 'Settings saved',
    settingsTheme: 'Theme',
    settingsThemeDark: 'Dark',
    settingsThemeLight: 'Light',

    // LEGAL
    legalTitle: 'Legal Information',
    legalSubtitle: 'Terms and conditions',
    legalBack: 'Back',

    // FOOTER
    footerLegal: 'Legal Information',
    footerCopy: '© 2026 RepsFinder',
    footerRights: 'All rights reserved',

    // BANNER (for all screens)
    bannerWelcome: 'Welcome to RepsFinder!',
    bannerSubtext: 'The best platform for safe shopping',
  }
};
