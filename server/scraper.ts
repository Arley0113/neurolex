// Servicio de scraping de noticias con cheerio
// Extrae titulares y contenido de sitios web de noticias

import * as cheerio from 'cheerio';

export interface ScrapedArticle {
  titulo: string;
  contenido: string;
  resumen?: string;
  imagenUrl?: string;
  urlOriginal: string;
}

export interface ScrapeOptions {
  url: string;
  tipo: 'rss' | 'html';
  selectorTitulo?: string;
  selectorContenido?: string;
  selectorImagen?: string;
}

/**
 * Scraping básico de RSS feed
 */
async function scrapeRSS(url: string): Promise<ScrapedArticle[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    const articles: ScrapedArticle[] = [];

    // Intentar RSS 2.0
    $('item').each((_, item) => {
      const $item = $(item);
      const titulo = $item.find('title').text().trim();
      const link = $item.find('link').text().trim();
      const descripcion = $item.find('description').text().trim();
      const contenido = $item.find('content\\:encoded, encoded').text().trim() || descripcion;
      
      // Extraer imagen del contenido HTML o de media:content
      let imagenUrl = '';
      const mediaContent = $item.find('media\\:content, content').attr('url');
      const mediaThumbnail = $item.find('media\\:thumbnail, thumbnail').attr('url');
      
      if (mediaContent) {
        imagenUrl = mediaContent;
      } else if (mediaThumbnail) {
        imagenUrl = mediaThumbnail;
      } else if (descripcion) {
        const imgMatch = descripcion.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) {
          imagenUrl = imgMatch[1];
        }
      }

      if (titulo && link) {
        articles.push({
          titulo,
          contenido: stripHtml(contenido),
          resumen: stripHtml(descripcion).substring(0, 200),
          imagenUrl: imagenUrl || undefined,
          urlOriginal: link,
        });
      }
    });

    // Intentar Atom si no hay items
    if (articles.length === 0) {
      $('entry').each((_, entry) => {
        const $entry = $(entry);
        const titulo = $entry.find('title').text().trim();
        const link = $entry.find('link').attr('href') || '';
        const contenido = $entry.find('content, summary').text().trim();

        if (titulo && link) {
          articles.push({
            titulo,
            contenido: stripHtml(contenido),
            resumen: stripHtml(contenido).substring(0, 200),
            urlOriginal: link,
          });
        }
      });
    }

    return articles;
  } catch (error) {
    console.error('Error al scrapear RSS:', error);
    throw error;
  }
}

/**
 * Scraping básico de HTML con selectores CSS
 */
async function scrapeHTML(options: ScrapeOptions): Promise<ScrapedArticle[]> {
  try {
    const response = await fetch(options.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const articles: ScrapedArticle[] = [];

    // Usar selectores personalizados o defaults genéricos
    const titleSelector = options.selectorTitulo || 'article h2, .article-title, h1.title';
    const contentSelector = options.selectorContenido || 'article p, .article-content, .content p';
    const imageSelector = options.selectorImagen || 'article img, .article-image';

    // Intentar encontrar artículos agrupados
    $('article, .article, .post').each((_, article) => {
      const $article = $(article);
      const titulo = $article.find(titleSelector).first().text().trim();
      const link = $article.find('a').first().attr('href') || options.url;
      const contenido = $article.find(contentSelector).text().trim();
      const imagenUrl = $article.find(imageSelector).first().attr('src');

      if (titulo) {
        articles.push({
          titulo,
          contenido: contenido || 'Sin contenido disponible',
          resumen: contenido.substring(0, 200),
          imagenUrl: imagenUrl || undefined,
          urlOriginal: link.startsWith('http') ? link : new URL(link, options.url).href,
        });
      }
    });

    // Si no se encontraron artículos agrupados, buscar elementos individuales
    if (articles.length === 0) {
      const titulo = $(titleSelector).first().text().trim();
      const contenido = $(contentSelector).text().trim();
      const imagenUrl = $(imageSelector).first().attr('src');

      if (titulo) {
        articles.push({
          titulo,
          contenido: contenido || 'Sin contenido disponible',
          resumen: contenido.substring(0, 200),
          imagenUrl: imagenUrl || undefined,
          urlOriginal: options.url,
        });
      }
    }

    return articles;
  } catch (error) {
    console.error('Error al scrapear HTML:', error);
    throw error;
  }
}

/**
 * Función principal de scraping
 */
export async function scrapeNewsSource(options: ScrapeOptions): Promise<ScrapedArticle[]> {
  if (options.tipo === 'rss') {
    return await scrapeRSS(options.url);
  } else {
    return await scrapeHTML(options);
  }
}

/**
 * Helper para limpiar HTML y obtener solo texto
 */
function stripHtml(html: string): string {
  const $ = cheerio.load(html);
  return $.text().replace(/\s+/g, ' ').trim();
}

/**
 * Validar URL antes de scrapear
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
