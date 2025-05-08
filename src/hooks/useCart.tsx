import { useState, useEffect } from 'react';
import { CartItem } from '@/types/order';
import { Product } from '@/types/product';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, query, collection, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { get } from 'http';

export const useCart = () => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [tempCart, setTempCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string, visible: boolean }>({
        message: '',
        visible: false
    });

    // Exibe uma notificação temporária
    const showNotification = (message: string) => {
        setNotification({ message, visible: true });
        setTimeout(() => setNotification({ message: '', visible: false }), 3000);
    };

    // Carrega o carrinho do usuário ou o carrinho temporário em tempo real
    useEffect(() => {
        let unsubscribe: () => void;

        const loadCart = async () => {
            setLoading(true);
            try {
                if (user) {
                    const cartRef = doc(db, 'carts', user.uid);
                    const cartSnap = await getDoc(cartRef);

                    if (cartSnap.exists()) {
                        setCartItems(cartSnap.data().items || []);
                    }

                    // Listener em tempo real para o carrinho
                    unsubscribe = onSnapshot(cartRef, (doc) => {
                        if (doc.exists()) {
                            setCartItems(doc.data().items || []);
                        }
                    })
                } else {
                    const savedCart = localStorage.getItem('tempCart');
                    setTempCart(savedCart ? JSON.parse(savedCart) : []);
                }
            } catch (error) {
                return;
            } finally {
                setLoading(false);
            }

        };

        loadCart();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user]);

    // Atualiza o carrinho no Firestore (Logado) ou no localStorage (Deslogado)
    const updateCart = async (items: CartItem[]) => {
        try {
            if (user) {
                await setDoc(doc(db, 'carts', user.uid), { items }, { merge: true });
            } else {
                localStorage.setItem('tempCart', JSON.stringify(items));
            }
        } catch (error) {
            console.error('Erro ao atualizar o carrinho: ', error);
        }
    };

    // Adiciona somente 1 produto ao carrinho com notificação
    const addToCart = async (product: Product) => {
        if (!product.id) return;

        const items = user ? [...cartItems] : [...tempCart];
        const existingIndex = items.findIndex(item => item.id === product.id);

        if (existingIndex >= 0) {
            items[existingIndex].quantity == 1;

            showNotification(`${product.name} já está no carrinho!`);
        } else {
            items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
            });

            user ? setCartItems(items) : setTempCart(items);
            await updateCart(items);
            showNotification(`${product.name} foi adicionado ao carrinho!`);
        }
    };

    // Remove item do carrinho
    const removeFromCart = async (productId: string) => {
        const items = (user ? cartItems : tempCart).filter(item => item.id !== productId);
        user ? setCartItems(items) : setTempCart(items);
        await updateCart(items);
    };

    // Atualiza a quantidade do item no carrinho
    const updateQuantity = async (productId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        const items = user ? [...cartItems] : [...tempCart];
        const itemIndex = items.findIndex(item => item.id === productId);

        if (itemIndex >= 0) {
            items[itemIndex].quantity = newQuantity;
            user ? setCartItems(items) : setTempCart(items);
            await updateCart(items);
        }
    };


    return {
        cartItems: user ? cartItems : tempCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        isInCart: (productId: string) =>
            (user ? cartItems : tempCart).some(item => item.id === productId),
        total: (user ? cartItems : tempCart).reduce(
            (sum, item) => sum + (item.price * item.quantity), 0
        ),
        loading,
        notification
    };
};