import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

export const isApiKeyAvailable = !!API_KEY;

// Initialize AI client only if the API key is available.
const ai = isApiKeyAvailable ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const checkApiAvailability = () => {
    if (!ai) {
        throw new Error("لا يمكن تهيئة Gemini API. يرجى التأكد من أن مفتاح API الخاص بك قد تم إعداده بشكل صحيح.");
    }
}

// --- Helper Functions ---
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};


// --- API Service Functions ---

/**
 * Enhances and translates an Arabic prompt to a detailed English prompt for image generation.
 */
export const enhancePrompt = async (arabicPrompt: string): Promise<string> => {
  checkApiAvailability();
  try {
    const systemInstruction = "You are an expert prompt engineer for generative AI image models. Your task is to translate a user's Arabic prompt into a highly detailed, descriptive English prompt. The English prompt should be rich in visual details, including subject, style (e.g., photorealistic, impressionistic, digital art), composition, lighting (e.g., cinematic lighting, soft light), and mood. The goal is to maximize the quality and artistic value of the generated image. Respond *only* with the final English prompt, without any extra text or explanation.";
    
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Original Arabic prompt: "${arabicPrompt}"`,
        config: {
            systemInstruction: systemInstruction,
            thinkingConfig: { thinkingBudget: 0 },
        }
    });

    const enhanced = response.text.trim();
    if (!enhanced) {
        throw new Error("Prompt enhancement returned an empty result.");
    }
    return enhanced;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`حدث خطأ أثناء تحسين الوصف: ${message}`);
  }
};


/**
 * Generates an image using the Imagen model.
 */
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  checkApiAvailability();
  try {
    const response = await ai!.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("لم يتم توليد الصورة. قد يكون السبب يتعلق بسياسات السلامة أو خطأ في النموذج.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`حدث خطأ أثناء توليد الصورة: ${message}`);
  }
};

/**
 * Edits an image using the Nano Banana model.
 */
export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
  checkApiAvailability();
  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      const base64ImageBytes: string = imagePart.inlineData.data;
      return `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
    }
    
    // If we reach here, no image was found in the response.
    // We will construct a more informative error message.
    let errorMessage = "لم يتمكن النموذج من تعديل الصورة ولم يقدم تفسيراً.";
    
    if (response.text) {
        // The model provided a text response instead of an image. This is the error condition we need to explain to the user.
        errorMessage = `استجاب النموذج بنص فقط دون إرجاع صورة. النص: "${response.text.trim()}"`;
    }

    throw new Error(errorMessage);

  } catch (error) {
    console.error("Error editing image:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`فشل تعديل الصورة: ${message}`);
  }
};


/**
 * Generates a video using the Veo model.
 */
export const generateVideo = async (prompt: string): Promise<string> => {
  checkApiAvailability();
  try {
    let operation = await ai!.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      config: { numberOfVideos: 1 }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
      operation = await ai!.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("فشل توليد الفيديو: لم يتم العثور على رابط التنزيل.");
    }
    
    const videoResponse = await fetch(`${downloadLink}&key=${API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`فشل تحميل الفيديو: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Error generating video:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`حدث خطأ أثناء توليد الفيديو: ${message}`);
  }
};