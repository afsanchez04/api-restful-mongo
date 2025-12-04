// middlewares/validationMiddleware.js
const xss = require('xss');

// Configuración de sanitización XSS
const xssOptions = {
  whiteList: {}, // No permitir ningún HTML
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script']
};

// Sanitizar entrada de texto
const sanitizeText = (text) => {
  if (typeof text !== 'string') return text;
  return xss(text.trim(), xssOptions);
};

// Validador de nombre
const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'El nombre es requerido y debe ser texto' };
  }

  const sanitized = sanitizeText(name);
  
  if (sanitized.length < 2) {
    return { valid: false, message: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (sanitized.length > 100) {
    return { valid: false, message: 'El nombre no puede exceder 100 caracteres' };
  }

  // Solo letras, espacios y caracteres latinos
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(sanitized)) {
    return { valid: false, message: 'El nombre solo puede contener letras y espacios' };
  }

  return { valid: true, value: sanitized };
};

// Validador de descripción
const validateDescription = (description) => {
  // La descripción es opcional
  if (!description) {
    return { valid: true, value: '' };
  }

  if (typeof description !== 'string') {
    return { valid: false, message: 'La descripción debe ser texto' };
  }

  const sanitized = sanitizeText(description);

  if (sanitized.length > 500) {
    return { valid: false, message: 'La descripción no puede exceder 500 caracteres' };
  }

  return { valid: true, value: sanitized };
};

// Validador de precio
const validatePrice = (price) => {
  if (price === undefined || price === null || price === '') {
    return { valid: false, message: 'El precio es requerido' };
  }

  const numPrice = Number(price);

  if (isNaN(numPrice)) {
    return { valid: false, message: 'El precio debe ser un número válido' };
  }

  if (numPrice < 0) {
    return { valid: false, message: 'El precio no puede ser negativo' };
  }

  if (numPrice > 999999999) {
    return { valid: false, message: 'El precio excede el valor máximo permitido' };
  }

  // Redondear a 2 decimales
  const rounded = Math.round(numPrice * 100) / 100;

  return { valid: true, value: rounded };
};

// Validador de UUID
const validateUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!id || typeof id !== 'string') {
    return { valid: false, message: 'ID inválido' };
  }

  if (!uuidRegex.test(id)) {
    return { valid: false, message: 'ID no tiene formato UUID válido' };
  }

  return { valid: true, value: id };
};

// Middleware para validar creación de items
const validateCreateItem = (req, res, next) => {
  try {
    const { name, description, price } = req.body;

    // Validar nombre
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return res.status(400).json({ error: nameValidation.message });
    }

    // Validar descripción
    const descValidation = validateDescription(description);
    if (!descValidation.valid) {
      return res.status(400).json({ error: descValidation.message });
    }

    // Validar precio
    const priceValidation = validatePrice(price);
    if (!priceValidation.valid) {
      return res.status(400).json({ error: priceValidation.message });
    }

    // Asignar valores sanitizados al body
    req.body = {
      name: nameValidation.value,
      description: descValidation.value,
      price: priceValidation.value
    };

    next();
  } catch (error) {
    console.error('Error en validación:', error);
    return res.status(500).json({ error: 'Error en la validación de datos' });
  }
};

// Middleware para validar actualización de items
const validateUpdateItem = (req, res, next) => {
  try {
    const { name, description, price } = req.body;
    const sanitizedBody = {};

    // Validar nombre si está presente
    if (name !== undefined) {
      const nameValidation = validateName(name);
      if (!nameValidation.valid) {
        return res.status(400).json({ error: nameValidation.message });
      }
      sanitizedBody.name = nameValidation.value;
    }

    // Validar descripción si está presente
    if (description !== undefined) {
      const descValidation = validateDescription(description);
      if (!descValidation.valid) {
        return res.status(400).json({ error: descValidation.message });
      }
      sanitizedBody.description = descValidation.value;
    }

    // Validar precio si está presente
    if (price !== undefined) {
      const priceValidation = validatePrice(price);
      if (!priceValidation.valid) {
        return res.status(400).json({ error: priceValidation.message });
      }
      sanitizedBody.price = priceValidation.value;
    }

    // Asignar valores sanitizados
    req.body = sanitizedBody;

    next();
  } catch (error) {
    console.error('Error en validación:', error);
    return res.status(500).json({ error: 'Error en la validación de datos' });
  }
};

// Middleware para validar parámetros de ID
const validateIdParam = (req, res, next) => {
  try {
    const { id } = req.params;
    
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      return res.status(400).json({ error: idValidation.message });
    }

    next();
  } catch (error) {
    console.error('Error en validación de ID:', error);
    return res.status(500).json({ error: 'Error en la validación del ID' });
  }
};

// Middleware para limitar el tamaño del body
const limitBodySize = (req, res, next) => {
  const contentLength = req.headers['content-length'];
  const maxSize = 10000; // 10KB

  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({ 
      error: 'El tamaño de la petición excede el límite permitido' 
    });
  }

  next();
};

// Middleware para sanitizar query params
const sanitizeQueryParams = (req, res, next) => {
  try {
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeText(req.query[key]);
        }
      });
    }
    next();
  } catch (error) {
    console.error('Error sanitizando query params:', error);
    return res.status(500).json({ error: 'Error procesando parámetros' });
  }
};

module.exports = {
  validateCreateItem,
  validateUpdateItem,
  validateIdParam,
  limitBodySize,
  sanitizeQueryParams,
  // Exportar funciones individuales para uso en otros lugares
  validateName,
  validateDescription,
  validatePrice,
  validateUUID,
  sanitizeText
};