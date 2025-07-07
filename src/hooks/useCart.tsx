import { useState, useEffect, useMemo, useCallback } from 'react';
import { CartItem } from '@/types/order';
import { Product } from '@/types/product';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

export const useCart = () => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string, visible: boolean }>({
        message: '',
        visible: false
    });

    const showNotification = useCallback((message: string) => {
        setNotification({ message, visible: true });
        setTimeout(() => setNotification({ message: '', visible: false }), 3000);
    }, []);

    useEffect(() => {
        setLoading(true);
        let unsubscribe = () => {};

        if (user) {
            const cartRef = doc(db, 'carts', user.uid);
            
            const mergeGuestCart = async () => {
                const guestCartJson = localStorage.getItem('tempCart');
                if (!guestCartJson) return;

                const guestCart: CartItem[] = JSON.parse(guestCartJson);
                if (guestCart.length === 0) return;

                const cartSnap = await getDoc(cartRef);
                const firestoreCart: CartItem[] = cartSnap.exists() ? cartSnap.data().items : [];

                const mergedCart = [...firestoreCart];

                guestCart.forEach(guestItem => {
                    const existingItemIndex = mergedCart.findIndex(item => item.id === guestItem.id);
                    if (existingItemIndex > -1) {
                        mergedCart[existingItemIndex].quantity += guestItem.quantity;
                    } else {
                        mergedCart.push(guestItem);
                    }
                });
                
                await setDoc(cartRef, { items: mergedCart });
                localStorage.removeItem('tempCart'); // Limpa o carrinho local após mesclar
                showNotification("Seu carrinho foi atualizado!");
            };

            mergeGuestCart();

            unsubscribe = onSnapshot(cartRef, (doc) => {
                const items = doc.exists() ? doc.data().items : [];
                setCartItems(items);
                setLoading(false);
            });
        
        } else {
            const savedCart = localStorage.getItem('tempCart');
            setCartItems(savedCart ? JSON.parse(savedCart) : []);
            setLoading(false);
        }

        return () => unsubscribe();
    }, [user, showNotification]);

    const updateCartInPersistence = async (items: CartItem[]) => {
        if (user) {
            await setDoc(doc(db, 'carts', user.uid), { items });
        } else {
            localStorage.setItem('tempCart', JSON.stringify(items));
        }
    };

    const addToCart = async (product: Product, quantityToAdd: number) => {
        if (!product.id) return;
        
        const newCart = [...cartItems];
        const existingIndex = newCart.findIndex(item => item.id === product.id);

        if (existingIndex > -1) {
            newCart[existingIndex].quantity += quantityToAdd;
        } else {
            newCart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantityToAdd,
            });
        }
        
        setCartItems(newCart);
        await updateCartInPersistence(newCart);
        showNotification(`${quantityToAdd}x ${product.name} adicionado(s) ao carrinho!`);
    };

    const removeFromCart = async (productId: string) => {
        const newCart = cartItems.filter(item => item.id !== productId);
        setCartItems(newCart);
        await updateCartInPersistence(newCart);
        showNotification('Produto removido do carrinho!');
    };

    const updateQuantity = async (productId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFromCart(productId); // Remove o item se a quantidade for menor que 1
            return;
        }

        const newCart = cartItems.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
        );
        
        setCartItems(newCart);
        await updateCartInPersistence(newCart);
    };

    const total = useMemo(() =>
        cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [cartItems]
    );

    const isInCart = useCallback((productId: string) =>
        cartItems.some(item => item.id === productId),
        [cartItems]
    );

    return {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        isInCart,
        total,
        loading,
        notification
    };
};