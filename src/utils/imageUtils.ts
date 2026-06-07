// Utilidades para la manipulación de imágenes

import { logger } from './logger';

/**
 * Limpia la URL de una imagen para eliminar textos superpuestos en español
 * @param url URL de la imagen a limpiar
 * @returns URL limpia sin superposiciones
 */
export const cleanImageUrl = (url: string): string => {
  if (!url) return url;
  
  try {
    // Eliminar parámetros de superposiciones de texto
    let cleanUrl = url;
    
    // Eliminar parámetros de consulta comunes que añaden textos o marcas
    if (cleanUrl.includes('?')) {
      // Parámetros que pueden causar superposiciones de texto
      const paramsToRemove = ['watermark', 'text', 'overlay', 'mark', 'logo', 'titulo'];
      
      const [baseUrl, queryString] = cleanUrl.split('?');
      const params = queryString.split('&');
      const filteredParams = params.filter(param => {
        const paramName = param.split('=')[0].toLowerCase();
        return !paramsToRemove.some(p => paramName.includes(p));
      });
      
      cleanUrl = filteredParams.length > 0 ? 
        `${baseUrl}?${filteredParams.join('&')}` : 
        baseUrl;
    }
    
    // Convertir URL de miniatura a URL de imagen completa en casos específicos
    // Por ejemplo, muchas plataformas de comercio tienen un patrón como /thumbnail/ que se puede cambiar por /original/
    cleanUrl = cleanUrl.replace('/thumbnail/', '/original/');
    cleanUrl = cleanUrl.replace('_small', '');
    cleanUrl = cleanUrl.replace('_thumb', '');
    
    // Añadir parámetros para obtener la versión de mayor calidad si es necesario
    if (!cleanUrl.includes('quality') && !cleanUrl.includes('q=')) {
      if (cleanUrl.includes('?')) {
        cleanUrl += '&quality=100';
      } else {
        cleanUrl += '?quality=100';
      }
    }
    
    return cleanUrl;
  } catch (error) {
    logger.error('Error al limpiar URL de imagen:', error);
    return url; // Devolver la URL original en caso de error
  }
};

/**
 * Limpia un arreglo de URLs de imágenes
 * @param urls Arreglo de URLs a limpiar
 * @returns Arreglo de URLs limpias
 */
export const cleanImageUrls = (urls: string[]): string[] => {
  return urls.map(cleanImageUrl);
};