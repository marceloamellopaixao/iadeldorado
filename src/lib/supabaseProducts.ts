import { supabase } from "@/lib/supabase";

const productsBucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET || "cardapio";
const productsTable = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_TABLE || "cardapio";

const buildFilePath = (productId: string, fileName: string) => {
  const safeName = fileName.replace(/\s+/g, "-").toLowerCase();
  return `products/${productId}/${Date.now()}-${safeName}`;
};

const extractPathFromPublicUrl = (imageUrl?: string) => {
  if (!imageUrl) return "";
  const marker = `/object/public/${productsBucket}/`;
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex === -1) return "";
  const rawPath = imageUrl.slice(markerIndex + marker.length);
  return decodeURIComponent(rawPath.split("?")[0] || "");
};

export const uploadProductImage = async (
  file: File,
  productId: string,
  oldImagePath?: string,
) => {
  if (!supabase) {
    throw new Error("Supabase nao configurado.");
  }

  const filePath = buildFilePath(productId, file.name);

  const { error: uploadError } = await supabase.storage
    .from(productsBucket)
    .upload(filePath, file, { cacheControl: "3600", upsert: true });

  if (uploadError) {
    if ((uploadError as { message?: string }).message?.toLowerCase().includes("bucket not found")) {
      throw new Error(
        `Bucket "${productsBucket}" nao encontrado no Supabase Storage. Crie esse bucket no painel do Supabase.`,
      );
    }
    throw uploadError;
  }

  if (oldImagePath && oldImagePath !== filePath) {
    await supabase.storage.from(productsBucket).remove([oldImagePath]);
  }

  const { data } = supabase.storage.from(productsBucket).getPublicUrl(filePath);
  return { imageUrl: data.publicUrl, imagePath: filePath };
};

export const deleteProductImage = async (imagePath?: string, imageUrl?: string) => {
  if (!supabase) {
    return;
  }
  const targetPath = imagePath || extractPathFromPublicUrl(imageUrl);
  if (!targetPath) {
    return;
  }
  await supabase.storage.from(productsBucket).remove([targetPath]);
};

interface SyncProductPayload {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: boolean;
  imageUrl?: string;
}

export const syncProductToSupabaseTable = async (payload: SyncProductPayload) => {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from(productsTable).upsert(
    {
      id: payload.id,
      name: payload.name,
      description: payload.description,
      price: payload.price,
      category: payload.category,
      stock: payload.stock,
      status: payload.status,
      image_url: payload.imageUrl || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
};

export const deleteProductFromSupabaseTable = async (productId: string) => {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from(productsTable).delete().eq("id", productId);
  if (error) {
    throw error;
  }
};

export const deleteProductStorageFolder = async (productId: string) => {
  if (!supabase || !productId) {
    return;
  }

  const prefix = `products/${productId}`;
  const { data, error } = await supabase.storage.from(productsBucket).list(prefix, {
    limit: 1000,
    offset: 0,
  });

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return;
  }

  const files = data
    .filter((item) => item.name && item.name !== ".emptyFolderPlaceholder")
    .map((item) => `${prefix}/${item.name}`);

  if (files.length > 0) {
    const { error: removeError } = await supabase.storage.from(productsBucket).remove(files);
    if (removeError) {
      throw removeError;
    }
  }
};
