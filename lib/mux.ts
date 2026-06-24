import Mux from '@mux/mux-node';

const tokenId = process.env.MUX_TOKEN_ID;
const tokenSecret = process.env.MUX_TOKEN_SECRET;

const mux = new Mux({
  tokenId,
  tokenSecret,
});

export const video = mux.video;

/**
 * Creates a direct upload URL for the client to upload video directly.
 */
export async function createDirectUpload() {
  try {
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
      },
      cors_origin: '*', // Allows uploading from standard web browser contexts
    });
    return upload;
  } catch (error) {
    console.error('Mux upload creation error:', error);
    throw new Error('Failed to initiate video upload with Mux.');
  }
}

/**
 * Retrieves details about a video asset.
 */
export async function getAsset(assetId: string) {
  try {
    const asset = await mux.video.assets.retrieve(assetId);
    return asset;
  } catch (error) {
    console.error('Mux retrieve asset error:', error);
    throw new Error('Failed to retrieve video details from Mux.');
  }
}

/**
 * Deletes a video asset from Mux.
 */
export async function deleteAsset(assetId: string) {
  try {
    await mux.video.assets.delete(assetId);
  } catch (error) {
    console.error('Mux delete asset error:', error);
    // Suppress error if it's already deleted
  }
}
