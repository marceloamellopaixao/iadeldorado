import { useState, useEffect } from "react";
import Image from "next/image";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PricingTier, Product } from "@/types/product";
import { toast } from "react-toastify";
import { FiImage, FiPlus, FiSave, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { hasSupabaseEnv } from "@/lib/supabase";
import { deleteProductImage, syncProductToSupabaseTable, uploadProductImage } from "@/lib/supabaseProducts";
import { formatCurrencyBRL, getTierBadgeText } from "@/utils/pricing";

interface ProductFormProps {
  product: Product | null;
  onSuccess: () => void;
  onClose: () => void;
}

type ProductFormState = Omit<Product, "id" | "createdAt" | "updatedAt">;

const initialState: ProductFormState = {
  name: "",
  description: "",
  price: 0,
  category: "",
  stock: 0,
  status: true,
  imageUrl: "",
  imagePath: "",
  pricingTiers: [],
};

export default function ProductForm({ product, onSuccess, onClose }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        status: product.status,
        imageUrl: product.imageUrl || "",
        imagePath: product.imagePath || "",
        pricingTiers: product.pricingTiers || [],
      });
      setPreviewUrl(product.imageUrl || "");
      setSelectedImageFile(null);
      setRemoveCurrentImage(false);
      return;
    }

    setFormData(initialState);
    setPreviewUrl("");
    setSelectedImageFile(null);
    setRemoveCurrentImage(false);
  }, [product]);

  useEffect(() => {
    if (!selectedImageFile) {
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImageFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImageFile]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.warn("Selecione um arquivo de imagem valido.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.warn("A imagem deve ter no maximo 4MB.");
      return;
    }

    setSelectedImageFile(file);
    setRemoveCurrentImage(false);
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setPreviewUrl("");
    setFormData((current) => ({ ...current, imageUrl: "", imagePath: "" }));
    setRemoveCurrentImage(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanedTiers = (formData.pricingTiers || [])
        .map((tier) => ({
          quantity: Math.floor(Number(tier.quantity) || 0),
          totalPrice: Number(tier.totalPrice) || 0,
        }))
        .filter((tier) => tier.quantity > 1 && tier.totalPrice >= 0)
        .sort((a, b) => a.quantity - b.quantity);

      const tierQtySet = new Set<number>();
      for (const tier of cleanedTiers) {
        if (tierQtySet.has(tier.quantity)) {
          throw new Error(`Quantidade repetida na promocao: ${tier.quantity}.`);
        }
        tierQtySet.add(tier.quantity);
      }

      const productRef = product?.id ? doc(db, "products", product.id) : doc(collection(db, "products"));
      let imageUrl = formData.imageUrl || "";
      let imagePath = formData.imagePath || "";

      if (removeCurrentImage && formData.imagePath) {
        await deleteProductImage(formData.imagePath);
        imageUrl = "";
        imagePath = "";
      }

      if (selectedImageFile) {
        if (!hasSupabaseEnv) {
          throw new Error("Supabase nao configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        }

        const uploadResult = await uploadProductImage(selectedImageFile, productRef.id, formData.imagePath);
        imageUrl = uploadResult.imageUrl;
        imagePath = uploadResult.imagePath;
      }

      const productData = {
        ...formData,
        pricingTiers: cleanedTiers,
        imageUrl,
        imagePath,
        updatedAt: serverTimestamp(),
      };

      if (product?.id) {
        await setDoc(productRef, productData, { merge: true });
        toast.success("Produto atualizado com sucesso!");
      } else {
        await setDoc(productRef, { ...productData, createdAt: serverTimestamp() });
        toast.success("Produto cadastrado com sucesso!");
      }

      try {
        await syncProductToSupabaseTable({
          id: productRef.id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          stock: productData.stock,
          status: productData.status,
          imageUrl: imageUrl || undefined,
        });
      } catch (syncError) {
        console.warn("Falha ao sincronizar produto na tabela do Supabase:", syncError);
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar o produto:", error);
      const message = error instanceof Error ? error.message : "Erro ao salvar o produto.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputBaseStyle = "block w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 shadow-sm transition focus:border-sky-500 focus:ring-sky-500";
  const labelBaseStyle = "block text-sm font-medium text-slate-700";

  const addPricingTier = () => {
    setFormData((current) => ({
      ...current,
      pricingTiers: [...(current.pricingTiers || []), { quantity: 3, totalPrice: 0 }],
    }));
  };

  const updatePricingTier = (index: number, payload: Partial<PricingTier>) => {
    setFormData((current) => ({
      ...current,
      pricingTiers: (current.pricingTiers || []).map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, ...payload } : tier,
      ),
    }));
  };

  const removePricingTier = (index: number) => {
    setFormData((current) => ({
      ...current,
      pricingTiers: (current.pricingTiers || []).filter((_, tierIndex) => tierIndex !== index),
    }));
  };

  return (
    <div className="relative rounded-2xl border border-[#e7d8be] bg-[#fffdf7] p-6 shadow-sm">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 text-slate-500 transition-colors hover:text-rose-600 lg:hidden"
        aria-label="Fechar formulario"
        type="button"
      >
        <FiX size={24} />
      </button>

      <h2 className="mb-6 text-2xl font-bold text-slate-800">{product ? "Editar Produto" : "Adicionar Novo Produto"}</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className={labelBaseStyle}>Nome do Produto</label>
          <input
            id="name"
            type="text"
            placeholder="Ex: Pastel de Frango"
            className={inputBaseStyle}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className={labelBaseStyle}>Descricao</label>
          <textarea
            id="description"
            placeholder="Uma breve descricao do produto"
            className={inputBaseStyle}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="price" className={labelBaseStyle}>Preco (R$)</label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              className={inputBaseStyle}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <div>
            <label htmlFor="stock" className={labelBaseStyle}>Estoque</label>
            <input
              id="stock"
              type="number"
              min="0"
              className={inputBaseStyle}
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className={labelBaseStyle}>Categoria</label>
          <input
            id="category"
            type="text"
            placeholder="Ex: Salgados"
            className={inputBaseStyle}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="status" className={labelBaseStyle}>Status</label>
          <select
            id="status"
            className={inputBaseStyle}
            value={String(formData.status)}
            onChange={(e) => setFormData({ ...formData, status: e.target.value === "true" })}
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>

        <div className="rounded-xl border border-[#e7d8be] bg-[#f8f2e6] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className={labelBaseStyle}>Promocoes por quantidade</p>
              <p className="text-xs text-slate-600">Exemplo: 3 por R$ 5,00.</p>
            </div>
            <button
              type="button"
              onClick={addPricingTier}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white hover:bg-sky-500"
            >
              <FiPlus />
              Adicionar promocao
            </button>
          </div>

          {(formData.pricingTiers || []).length === 0 ? (
            <p className="text-xs text-slate-600">Sem promocao cadastrada.</p>
          ) : (
            <div className="space-y-3">
              {(formData.pricingTiers || []).map((tier, index) => (
                <div key={`${tier.quantity}-${index}`} className="rounded-lg border border-[#e7d8be] bg-white p-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Quantidade</label>
                      <input
                        type="number"
                        min="2"
                        step="1"
                        className={inputBaseStyle}
                        value={tier.quantity}
                        onChange={(e) => updatePricingTier(index, { quantity: parseInt(e.target.value, 10) || 2 })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Preco total (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputBaseStyle}
                        value={tier.totalPrice}
                        onChange={(e) => updatePricingTier(index, { totalPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePricingTier(index)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-300 bg-white px-3 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50"
                    >
                      <FiTrash2 />
                      Remover
                    </button>
                  </div>

                  <p className="mt-2 text-xs font-semibold text-[#8b5e34]">
                    Oferta: {getTierBadgeText(tier)} | Unitario normal: {formatCurrencyBRL(formData.price)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[#e7d8be] bg-[#f8f2e6] p-4">
          <label htmlFor="image" className={labelBaseStyle}>Foto do produto</label>

          <div className="mt-3 flex items-center gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#d4c098] bg-[#fffdf7]">
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview do produto" fill className="object-cover" unoptimized />
              ) : (
                <FiImage className="text-[#8b5e34]" size={26} />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="image"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-bold text-white hover:bg-sky-500"
              >
                <FiUpload />
                Escolher imagem
              </label>
              <input id="image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

              {(previewUrl || formData.imageUrl) && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50"
                >
                  <FiTrash2 />
                  Remover
                </button>
              )}
            </div>
          </div>

          {!hasSupabaseEnv && (
            <p className="mt-3 text-xs text-[#8b5e34]">
              Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para habilitar upload.
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <span>Cancelar</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2 font-bold text-white transition-colors hover:bg-sky-500 disabled:bg-slate-400"
          >
            <FiSave />
            <span>{loading ? "Salvando..." : product ? "Atualizar" : "Cadastrar"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

