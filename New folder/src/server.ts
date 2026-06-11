import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Body parser limits configured for spatial layout plans
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

/**
 * Image-based blueprint data extractor API route
 */
app.post('/api/estimate/extract', async (req, res): Promise<unknown> => {
  try {
    const { imageBase64, mimeType, prompt } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 parameter is required' });
    }

    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
      // Return high-fidelity mock extraction data if the API key is offline
      return res.json({
        spaceType: 'Office',
        scanSize: 1850,
        interiorScope: ['Architecture', 'MEP'],
        isComplexMepf: true,
        isExteriorRequired: true,
        exteriorScope: ['Architecture'],
        isSiteRequired: false,
        shortRationale: 'Demo CAD extractor output. Plans indicate 1,850 Sq.ft commercial room layouts with complex MEP grids and exterior elevations.'
      });
    }

    const { GoogleGenAI, Type } = await import('@google/genai');
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType || 'image/png'
      }
    };

    const textPart = {
      text: prompt || 'Analyze this architectural plan diagram, CAD floor plan sheet, or sketch layout and extract estimate parameters.'
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Standard modern multimodal model
      contents: [imagePart, textPart],
      config: {
        systemInstruction: `You are an expert BIM and architectural quantity surveyor system at BIM-IQ. 
        Your task is to analyze the upload (drawing, floor plan, sheet, blueprint, plan) and extract the following parameters:
        - spaceType: choose one value strictly from: ["Office", "Residential", "Retail", "Hospitality", "Medical", "Educational", "Industrial"]
        - scanSize: estimate or extract the floor area or scan size in square feet (Sq.ft). If none is mentioned, guess a realistic value between 800 and 5000 based on the layout density. Ensure it is an integer.
        - interiorScope: array of strings. Identify which interior system categories are active/drawn. Values can only be from: ["Architecture", "Furniture", "MEP"]
        - isComplexMepf: boolean. Is there heavy mechanical equipment, plumbing, electrical system, or fire protection mapped?
        - isExteriorRequired: boolean. Does it show exterior views, facades, site plans, elevation, or rendering of building shell?
        - exteriorScope: array of strings. Under exterior, what is active? Values can only be from: ["Architecture", "Furniture", "MEP"]
        - isSiteRequired: boolean. Does it show landscaping, site boundaries, plots or surrounding terrains?
        - shortRationale: a short 1-2 sentence human-readable rationale of what was identified in the drawing.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            spaceType: {
              type: Type.STRING,
              description: 'The classified space type.'
            },
            scanSize: {
              type: Type.INTEGER,
              description: 'The floor size or estimated scanned area in Sq.ft.'
            },
            interiorScope: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Systems scopes found in the drawing: Architecture, Furniture, MEP.'
            },
            isComplexMepf: {
              type: Type.BOOLEAN,
              description: 'Whether layout indicates dense/complex mechanical/plumbing systems.'
            },
            isExteriorRequired: {
              type: Type.BOOLEAN,
              description: 'Whether exterior modeling or envelope extraction is needed.'
            },
            exteriorScope: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exterior layer scopes.'
            },
            isSiteRequired: {
              type: Type.BOOLEAN,
              description: 'Whether plot/site modeling is evident in drawing.'
            },
            shortRationale: {
              type: Type.STRING,
              description: 'Short 1-2 sentence human description of findings.'
            }
          },
          required: ['spaceType', 'scanSize', 'interiorScope', 'isComplexMepf', 'isExteriorRequired', 'exteriorScope', 'isSiteRequired', 'shortRationale']
        }
      }
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);
    return res.json(parsed);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Extraction error:', err);
    return res.status(500).json({ error: err.message || 'Error occurred during image extraction' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
