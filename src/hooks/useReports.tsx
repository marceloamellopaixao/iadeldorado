import { useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types/order";

export function useReports() {
    const [salesData, setSalesData] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSalesData = async (startDate: Date, endDate: Date) => {
        setLoading(true);

        try {
            const q = query(
                collection(db, 'orders'),
                where('createdAt', '>=', startDate),
                where('createdAt', '<=', endDate),
                orderBy('createdAt', 'desc')
            )
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
                total: doc.data().total,
            } as Order))
            setSalesData(data);
        } finally {
            setLoading(false);
        }
    }

    return { salesData, loading, fetchSalesData }
}