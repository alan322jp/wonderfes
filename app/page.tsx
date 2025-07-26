'use client';

import { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

type Product = {
  id: string;
  phone: string;
  location: string;
  price: string;
  difficulty: string;
  remark: string;
};

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const handleChange = async (
    id: string,
    field: keyof Product,
    value: string
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );

    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, {
      [field]: value,
    });
  };

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">📃 編輯產品資料</h1>
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded p-3 shadow">
            {['phone', 'location', 'price', 'difficulty', 'remark'].map((field) => (
              <div key={field} className="mb-2">
                <label className="block text-sm font-semibold capitalize">
                  {field}
                </label>
                <input
                  className="w-full border px-2 py-1 rounded"
                  value={product[field as keyof Product] || ''}
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((p) =>
                        p.id === product.id
                          ? { ...p, [field]: e.target.value }
                          : p
                      )
                    )
                  }
                  onBlur={(e) =>
                    handleChange(product.id, field as keyof Product, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
