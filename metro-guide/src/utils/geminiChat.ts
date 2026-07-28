import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { ChatSession, FunctionDeclaration } from '@google/generative-ai';
import { searchLocations, planJourney } from './journeyApi';

// Ensure the user sets this in their .env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Cache user's location so we only ask for permission once per session
let cachedLocation: { lat: number, lng: number } | null = null;

const searchLocationTool: FunctionDeclaration = {
  name: 'search_location',
  description: 'Search for a place or address in the city to get its precise latitude and longitude. Use this to convert place names into coordinates before planning a journey.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description: 'The name of the location or station (e.g. "FC Road", "Pune Station")',
      },
      city: {
        type: SchemaType.STRING,
        description: 'The name of the city, defaults to "pune"',
      }
    },
    required: ['query'],
  } as any,
};

const planJourneyTool: FunctionDeclaration = {
  name: 'plan_metro_journey',
  description: 'Plan a step-by-step metro journey using exact source and destination coordinates. Call this ONLY after you have obtained coordinates using search_location.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      sourceLat: { type: SchemaType.NUMBER, description: 'Source latitude' },
      sourceLng: { type: SchemaType.NUMBER, description: 'Source longitude' },
      destLat: { type: SchemaType.NUMBER, description: 'Destination latitude' },
      destLng: { type: SchemaType.NUMBER, description: 'Destination longitude' },
      sourceName: { type: SchemaType.STRING, description: 'Optional name of the source' },
      destName: { type: SchemaType.STRING, description: 'Optional name of the destination' },
      city: { type: SchemaType.STRING, description: 'Defaults to "pune"' }
    },
    required: ['sourceLat', 'sourceLng', 'destLat', 'destLng'],
  } as any,
};

const getCurrentLocationTool: FunctionDeclaration = {
  name: 'get_current_location',
  description: 'ALWAYS call this tool immediately if the user asks for the nearest station or mentions their current location. It asks the user for GPS permission and returns their precise current latitude and longitude. DO NOT ask the user for their address or coordinates, use this tool instead.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      reason: { type: SchemaType.STRING, description: 'Optional reason' }
    }
  } as any,
};

const findNearestStationTool: FunctionDeclaration = {
  name: 'find_nearest_station',
  description: 'Finds the closest metro station to a given latitude and longitude. Use this after getting the user\'s current location.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      lat: { type: SchemaType.NUMBER },
      lng: { type: SchemaType.NUMBER },
      city: { type: SchemaType.STRING, description: 'Defaults to "pune"' }
    },
    required: ['lat', 'lng'],
  } as any,
};

const model = genAI.getGenerativeModel({
  model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash',
  tools: [
    {
      functionDeclarations: [searchLocationTool, planJourneyTool, getCurrentLocationTool, findNearestStationTool],
    },
  ],
  systemInstruction: "You are Metro AI Assistant, a helpful expert guide for metro passengers.\nWhen asked about a route:\n1) Call `search_location` for the source.\n2) Call `search_location` for the destination.\n3) Pass the exact coordinates returned into `plan_metro_journey`.\n4) Finally, use the `journey_steps` array returned by the tool to write a clear, step-by-step guide for the user in Markdown format. Mention the walking distance to the nearest station, the metro lines to take, and any interchanges.\n\nCRITICAL RULE: If the user asks for the nearest station to them, or mentions \"my location\", \"here\", or \"current location\", YOU MUST IMMEDIATELY CALL the `get_current_location` tool. DO NOT ask the user for their address, latitude, or longitude. The tool will automatically get their GPS coordinates. After getting the coordinates, call `find_nearest_station`. Always be polite.",
});

export function createChatSession(): ChatSession | null {
  if (!apiKey) return null;
  return model.startChat({
    history: [],
  });
}

export async function sendMessageWithTools(chatSession: ChatSession, message: string): Promise<string> {
  if (!apiKey) {
    return "API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.";
  }

  try {
    const result = await chatSession.sendMessage(message);
    let finalResponse = result.response;

    // Multi-step tool calling loop
    while (finalResponse.functionCalls() && finalResponse.functionCalls()!.length > 0) {
      const functionCalls = finalResponse.functionCalls()!;
      const functionResponses: any[] = [];

      for (const call of functionCalls) {
        if (call.name === 'search_location') {
          const { query, city = 'pune' } = call.args as any;
          try {
            const results = await searchLocations(query, city);
            if (results.length === 0) {
              functionResponses.push({
                functionResponse: {
                  name: 'search_location',
                  response: { error: `Could not find coordinates for: ${query}.` },
                  id: (call as any).id
                }
              });
            } else {
              // Return the best match
              const match = results[0];
              functionResponses.push({
                functionResponse: {
                  name: 'search_location',
                  response: { lat: match.lat, lng: match.lng, name: match.displayName },
                  id: (call as any).id
                }
              });
            }
          } catch (error: any) {
            functionResponses.push({
              functionResponse: {
                name: 'search_location',
                response: { error: `Search failed: ${error.message}` },
                id: (call as any).id
              }
            });
          }
        } 
        else if (call.name === 'plan_metro_journey') {
          const { sourceLat, sourceLng, destLat, destLng, sourceName, destName, city = 'pune' } = call.args as any;
          try {
            const journey = await planJourney(sourceLat, sourceLng, destLat, destLng, sourceName, destName, city);
            
            const routeData = {
              success: journey.success,
              source_station: journey.source_station?.name,
              dest_station: journey.dest_station?.name,
              total_distance_km: journey.metro_distance_km + ((journey.source_walking.distance_meters + journey.dest_walking.distance_meters) / 1000),
              total_time_minutes: journey.total_time_minutes,
              journey_steps: journey.journey_steps,
              ai_summary: journey.ai_summary
            };

            functionResponses.push({
              functionResponse: {
                name: 'plan_metro_journey',
                response: routeData,
                id: (call as any).id
              }
            });
          } catch (error: any) {
            functionResponses.push({
              functionResponse: {
                name: 'plan_metro_journey',
                response: { error: `Journey calculation failed: ${error.message}` },
                id: (call as any).id
              }
            });
          }
        }
        else if (call.name === 'get_current_location') {
          try {
            if (cachedLocation) {
              functionResponses.push({
                functionResponse: {
                  name: 'get_current_location',
                  response: { lat: cachedLocation.lat, lng: cachedLocation.lng },
                  id: (call as any).id
                }
              });
            } else {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                if (!navigator.geolocation) {
                  reject(new Error("Geolocation is not supported by this browser."));
                } else {
                  navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 15000 });
                }
              });
              
              cachedLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };

              functionResponses.push({
                functionResponse: {
                  name: 'get_current_location',
                  response: { lat: cachedLocation.lat, lng: cachedLocation.lng },
                  id: (call as any).id
                }
              });
            }
          } catch (error: any) {
            functionResponses.push({
              functionResponse: {
                name: 'get_current_location',
                response: { error: `Failed to get location: ${error.message}. The user might have denied permission.` },
                id: (call as any).id
              }
            });
          }
        }
        else if (call.name === 'find_nearest_station') {
          const { lat, lng, city = 'pune' } = call.args as any;
          try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_BASE}/api/journey/nearest?lat=${lat}&lng=${lng}&city=${city}`);
            
            if (!res.ok) {
              throw new Error(`Backend error: ${res.statusText}`);
            }
            
            const data = await res.json();
            
            functionResponses.push({
              functionResponse: {
                name: 'find_nearest_station',
                response: { 
                  name: data.station.name, 
                  distance_km: data.distance_km,
                  lat: data.station.latitude,
                  lng: data.station.longitude
                },
                id: (call as any).id
              }
            });
          } catch (error: any) {
            functionResponses.push({
              functionResponse: {
                name: 'find_nearest_station',
                response: { error: `Failed to find nearest station via backend: ${error.message}` },
                id: (call as any).id
              }
            });
          }
        }
      }

      // Send all function responses back to the model in a single message
      if (functionResponses.length > 0) {
        const toolResult = await chatSession.sendMessage(functionResponses);
        finalResponse = toolResult.response;
      } else {
        break;
      }
    }

    return finalResponse.text();
  } catch (err: any) {
    console.error("Gemini Error:", err);
    return `Error: ${err.message || err.toString()}`;
  }
}
