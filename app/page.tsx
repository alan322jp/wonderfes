'use client';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export type Product = {
  id: string;
  name: string;
  image: string;
  remark: string;
  price: number;
  bought: boolean;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🛒 Product List</h1>
      <ul className="space-y-2">
        {products.map((product) => (
          <li key={product.id} className="border p-3 rounded shadow">
            <img src={product.image} alt={product.name} className="w-32 mb-2" />
            <div className="font-semibold">{product.name}</div>
            <div className="text-sm">{product.remark}</div>
            <div className="text-red-500">${product.price}</div>
            <div className={`text-sm ${product.bought ? 'text-green-600' : 'text-gray-400'}`}>
              {product.bought ? 'Bought' : 'Not bought'}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}