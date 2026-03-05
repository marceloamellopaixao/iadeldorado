import { supabase } from "@/lib/supabase";

const productsBucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET || "cardapio";
const productsTable = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_TABLE || "cardapio";

const buildFilePath = (productId: string, fileName: string) => {
  const safeName = fileName.replace(/\s+/g, "-").toLowerCase();
  return `products/${productId}/${Date.now()}-${safeName}`;
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

export const deleteProductImage = async (imagePath?: string) => {
  if (!supabase || !imagePath) {
    return;
  }
  await supabase.storage.from(productsBucket).remove([imagePath]);
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
