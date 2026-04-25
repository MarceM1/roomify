import puter from "@heyputer/puter.js";
import { ROOMIFY_RENDER_PROMPT } from "./constants";

export async function fetchAsDataURL(url: string): Promise<string> {

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  };

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read blob as data URL'));
    reader.readAsDataURL(blob);
  });
};

export const generate3DView = async ({sourceImage}: Generate3DViewParams) => {
    
    const dataUrl = sourceImage.startsWith("data:") 
        ? sourceImage 
        : await fetchAsDataURL(sourceImage)
    ;

    const base64Data = dataUrl.split(",")[1];
    const mimeType = dataUrl.split(';')[0].split(':')[1];

    if(!mimeType || !base64Data) throw new Error("Invalid source data");

    const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
        model: 'gemini-2.5-flash-image',
        input_image: base64Data,
        input_image_mime_type: mimeType,
        ratio:{w:1024, h:1024},
    });

    const rawImageURL = (response && typeof response === 'object' && 'src' in response && typeof response.src === 'string')
        ? response.src
        : null;

    if(!rawImageURL) return {
        renderedImage: null,
        renderedPath: undefined
    };

    const renderedImage = rawImageURL.startsWith("data:")
        ? rawImageURL
        : await fetchAsDataURL(rawImageURL)
    ;

    return {
        renderedImage,
        renderedPath: undefined
    };

}