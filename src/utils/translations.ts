// ==================== TRANSLATION UTILS ====================

// Using 'any' for the 't' function to avoid complex type dependencies.
// The 't' function is passed from the useTranslation hook in the component.
export const getCategoryTranslation = (categoria: string, t: any): string => {
  const categoryMap: { [key: string]: string } = {
    'ZAPATOS': t('categorySneakers'),
    'SHOES 👟': t('categorySneakers'),
    'HOODIES & SWEATSHIRTS': t('categoryHoodies'),
    'JACKETS🧥': t('categoryJackets'),
    'PANTS, SHORTS & SET👖🩳': t('categoryPants'),
    'T-SHIRTS👕': t('categoryTshirts'),
    'ZAPATILLAS': t('categorySneakers'),
    'CAZADORAS': t('categoryJackets'),
    'SUDADERAS': t('categoryHoodies'),
    'PANTALONES': t('categoryPants'),
    'CAMISETAS': t('categoryTshirts'),
    'CORTOS PANTALONES': t('categoryShorts'),
    'CHANDAL': t('categoryTracksuits'),
    'JERSEIS': t('categoryJerseys'),
    'GORRAS': t('categoryCaps'),
    'GORROS': t('categoryBeanies'),
    'CINTURONES': t('categoryBelts'),
    'PAÑUELOS BUFANDAS': t('categoryScarves'),
    'BOLSOS': t('categoryBags'),
    'CARTERAS': t('categoryWallets'),
    'PULSERAS JOYAS': t('categoryJewelry'),
    'GAFAS': t('categoryGlasses'),
    'CALCETINES': t('categorySocks'),
    'LLAVEROS': t('categoryKeychains'),
    'JVL ALTAVOCES': t('categorySpeakers'),
    'RELOG': t('categoryWatches'),
    'EKECTRONICA AUDIO': t('categoryElectronics'),
    'ACCESORIOS': t('categoryAccessories'),
    'PERFUMES': t('categoryPerfumes'),
    'RELOJES': t('categoryWatches'),
    'ELECTRONICA': t('categoryElectronics'),
    'Electronics': t('categoryElectronics'),
    'JOYERIA': t('categoryJewelry'),
    'ROPA INTERIOR': t('categoryUnderwear'),
    'Women👩': t('categoryWomen'),
    'KIDS 👦': t('categoryKids'),
    'OTROS': t('categoryOther'),
    'Accessories, Jewelry & Bags💎': t('categoryAccessories'),
  };

  if (categoria.startsWith('Airpods Pro')) {
    return 'Airpods Pro';
  }

  return categoryMap[categoria] || categoria;
};
