const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const sharp = require("sharp");

admin.initializeApp();

/**
 * When a space recipe is created/updated and has imagePrompt but no img,
 * call Gemini to generate an image, store it in Cloud Storage, and
 * update the recipe document's img field.
 */
exports.generateRecipeImage = functions
  .runWith({
    secrets: ["GEMINI_API_KEY"],
  })
  .firestore.document("artifacts/{appId}/spaces/{spaceId}/recipes/{recipeId}")
  .onWrite(async (change, context) => {
    // Initialize Gemini with the secret
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash-image"});
    const after = change.after.exists ? change.after.data() : null;
    if (!after) {
      return;
    }

    const recipeRef = change.after.ref;
    const imagePrompt = after.imagePrompt;
    const img = after.img;
    const spaceId = context.params.spaceId;
    const recipeId = context.params.recipeId;

    // Only act if we have a prompt and no image yet (or image is a placeholder)
    if (!imagePrompt) {
      return;
    }

    // Skip if image already exists and is not a placeholder
    if (img && !img.includes("placehold.co")) {
      return;
    }

    try {
      console.log(`Generating image for recipe ${recipeId} with prompt: ${imagePrompt}`);
      
      // 1) Call Gemini to generate an image
      const result = await model.generateContent([
        {text: imagePrompt},
      ]);

      console.log("Gemini response received:", JSON.stringify(result.response, null, 2));

      const part =
        result.response.candidates &&
        result.response.candidates[0] &&
        result.response.candidates[0].content &&
        result.response.candidates[0].content.parts &&
        result.response.candidates[0].content.parts.find((p) => p.inlineData);

      if (!part || !part.inlineData || !part.inlineData.data) {
        console.warn("No inlineData image returned from Gemini. Response structure:", JSON.stringify(result.response, null, 2));
        return;
      }

      const imageBytes = Buffer.from(part.inlineData.data, "base64");
      const mimeType = part.inlineData.mimeType || "image/png";

      // 2) Process image to square format (800x800)
      const processedImage = await sharp(imageBytes)
        .resize(800, 800, {
          fit: "cover",
          position: "center",
        })
        .png()
        .toBuffer();

      // 3) Save to Cloud Storage in the space's recipe images folder
      const bucket = admin.storage().bucket();
      const filePath = `recipes/${spaceId}/${recipeId}_generated.png`;
      const file = bucket.file(filePath);

      await file.save(processedImage, {
        contentType: "image/png",
        resumable: false,
        metadata: {
          cacheControl: "public, max-age=31536000",
        },
      });

      // Make the file publicly accessible
      await file.makePublic();

      // Generate public URL
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;

      console.log(`Image saved successfully. Public URL: ${publicUrl}`);

      // 4) Update recipe with image URL
      await recipeRef.update({
        img: publicUrl,
        imageGeneratedAt: Date.now(),
        imagePrompt: admin.firestore.FieldValue.delete(), // Remove prompt after generation
      });

      console.log(`Recipe ${recipeId} updated with generated image URL`);
    } catch (err) {
      console.error("Error generating recipe image:", err);
    }
  });