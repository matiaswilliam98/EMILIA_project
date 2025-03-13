# Variables de Entorno para EMILIA

Este documento describe las variables de entorno necesarias para ejecutar el proyecto EMILIA correctamente.

## Archivo .env

Debes crear un archivo `.env` en el directorio raíz del Frontend con las siguientes variables:

```
# Proveedor de AI: 'openai' o 'openrouter'
VITE_AI_PROVIDER=openrouter

# Configuración de OpenAI (solo necesario si VITE_AI_PROVIDER=openai)
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_MODEL=gpt-4

# Configuración de OpenRouter (solo necesario si VITE_AI_PROVIDER=openrouter)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_OPENROUTER_MODEL=google/gemini-2.0-flash-001
VITE_SITE_URL=https://your-site-url.com
VITE_SITE_NAME=EMILIA Therapeutic Assistant

# API Base URL para backend
VITE_API_BASE_URL=http://localhost:3000
```

## Descripción de las Variables

### Configuración General

- **VITE_AI_PROVIDER**: Define qué proveedor de AI se utilizará:
  - `openai`: Utiliza la API de OpenAI directamente
  - `openrouter`: Utiliza OpenRouter para acceder a diferentes modelos (Recomendado)

### OpenAI

- **VITE_OPENAI_API_KEY**: Tu clave API de OpenAI. Solo necesaria si usas `openai` como proveedor.
- **VITE_OPENAI_MODEL**: El modelo de OpenAI a utilizar. Opciones:
  - `gpt-3.5-turbo`: Más rápido y económico
  - `gpt-4`: Más capaz para procesamiento de lenguaje complejo
  - `gpt-4o`: La última versión con mayores capacidades

### OpenRouter

- **VITE_OPENROUTER_API_KEY**: Tu clave API de OpenRouter. Necesaria cuando usas `openrouter` como proveedor.
- **VITE_OPENROUTER_MODEL**: El modelo a utilizar a través de OpenRouter. Opciones recomendadas:
  - `google/gemini-2.0-flash-001`: Modelo rápido de Google con buen rendimiento para casos terapéuticos
  - `anthropic/claude-3-sonnet`: Excelente para respuestas empáticas y detalladas
  - `openai/gpt-4`: La versión estándar de GPT-4 a través de OpenRouter
  - `mistralai/mistral-large`: Alternativa de código abierto con buen rendimiento

- **VITE_SITE_URL**: La URL de tu sitio web. OpenRouter utiliza esta información para rastrear el uso y proporcionar estadísticas por sitio. Es un campo opcional pero recomendado.
- **VITE_SITE_NAME**: El nombre de tu aplicación. Se usa para etiquetar tus solicitudes en OpenRouter. También es opcional.

### Backend

- **VITE_API_BASE_URL**: La URL base de tu API backend

## Consideraciones

- No cometas el archivo `.env` en el control de versiones
- Para entornos de producción, considera usar servicios de gestión de secretos más seguros
- Si no se especifican valores, el sistema utilizará valores predeterminados razonables
- OpenRouter permite acceder a múltiples modelos con una sola API key, lo que facilita la experimentación con diferentes modelos

## ⚠️ Importante: Seguridad de las claves API

Este proyecto está configurado para usar la opción `dangerouslyAllowBrowser: true` de la biblioteca OpenAI, lo que permite usar las APIs directamente desde el navegador. 

**Esta no es una práctica recomendada para entornos de producción**, ya que expone tus claves API a cualquier usuario que inspeccione el código de la aplicación. Para entornos de producción, considera:

1. Crear un backend proxy que maneje todas las comunicaciones con OpenAI/OpenRouter
2. Utilizar variables de entorno solo en el servidor
3. Implementar algún sistema de autenticación para proteger las llamadas a la API

La configuración actual es adecuada solo para desarrollo y pruebas locales. 