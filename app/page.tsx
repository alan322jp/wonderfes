'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

type Product = {
  id?: string;
  phone: string;
  location: string;
  price: string;
  difficulty: string;
  remark: string;
  createdAt?: Timestamp;
};

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt'>>({
    phone: '',
    location: '',
    price: '',
    difficulty: '',
    remark: '',
  });
  const [editId, setEditId] = useState<string | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editId) {
      const docRef = doc(db, 'products', editId);
      await updateDoc(docRef, { ...formData });
      setProducts((prev) =>
        prev.map((p) => (p.id === editId ? { ...p, ...formData } : p))
      );
      setEditId(null);
    } else {
      const newProduct: Product = {
        ...formData,
        createdAt: Timestamp.now(),
      };
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      setProducts((prev) => [...prev, { ...newProduct, id: docRef.id }]);
    }

    setFormData({
      phone: '',
      location: '',
      price: '',
      difficulty: '',
      remark: '',
    });
  };

  const handleEdit = (product: Product) => {
    setFormData({
      phone: product.phone,
      location: product.location,
      price: product.price,
      difficulty: product.difficulty,
      remark: product.remark,
    });
    setEditId(product.id ?? null);
  };

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">
        {editId ? '✏️ 編輯資料' : '📥 新增產品資料'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        {['phone', 'location', 'price', 'difficulty', 'remark'].map((field) => (
          <input
            key={field}
            name={field}
            value={(formData as any)[field]}
            onChange={handleInputChange}
            placeholder={field}
            className="w-full border px-3 py-2 rounded"
            required
          />
        ))}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {editId ? '更新' : '儲存'}
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-2">📃 已儲存產品</h2>
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded p-3 shadow">
            <div>📞 電話：{product.phone}</div>
            <div>📍 位置：{product.location}</div>
            <div>💰 價錢：{product.price}</div>
            <div>📈 難買度：{product.difficulty}</div>
            <div>📝 備註：{product.remark}</div>
            <button
              onClick={() => handleEdit(product)}
              className="mt-2 text-sm text-blue-600 underline"
            >
              編輯
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
