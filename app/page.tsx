'use client';

import { useEffect, useState } from 'react';
import {
  getFirestore,
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
  imageUrl: string;
  status: 'notBought' | 'bought';
  createdAt?: Timestamp;
};

const TABS = ['add', 'notBought', 'bought'] as const;
type Tab = typeof TABS[number];

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<Tab>('add');
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt'>>({
    phone: '',
    location: '',
    price: '',
    difficulty: '',
    remark: '',
    imageUrl: '',
    status: 'notBought',
  });

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
    const productData: Product = {
      ...formData,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, 'products'), productData);
    setProducts((prev) => [...prev, { ...productData, id: docRef.id }]);
    setFormData({
      phone: '',
      location: '',
      price: '',
      difficulty: '',
      remark: '',
      imageUrl: '',
      status: 'notBought',
    });
  };

  const toggleStatus = async (product: Product) => {
    const newStatus = product.status === 'notBought' ? 'bought' : 'notBought';
    if (product.id) {
      const ref = doc(db, 'products', product.id);
      await updateDoc(ref, { status: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
      );
    }
  };

  const filtered = tab === 'notBought'
    ? products.filter((p) => p.status === 'notBought')
    : tab === 'bought'
    ? products.filter((p) => p.status === 'bought')
    : [];

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setTab('add')} className={tab === 'add' ? 'font-bold' : ''}>📝 入單</button>
        <button onClick={() => setTab('notBought')} className={tab === 'notBought' ? 'font-bold' : ''}>📦 未買</button>
        <button onClick={() => setTab('bought')} className={tab === 'bought' ? 'font-bold' : ''}>✅ 已買</button>
      </div>

      {tab === 'add' && (
        <>
          <form onSubmit={handleSubmit} className="space-y-3 mb-6">
            {['phone', 'location', 'price', 'difficulty', 'remark', 'imageUrl'].map((field) => (
              <input
                key={field}
                name={field}
                value={(formData as any)[field]}
                onChange={handleInputChange}
                placeholder={field}
                className="w-full border px-3 py-2 rounded"
                required={field !== 'imageUrl'}
              />
            ))}
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="preview" className="w-32 border" />
            )}
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">儲存</button>
          </form>
        </>
      )}

      {tab !== 'add' && (
        <div className="grid gap-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className={`border rounded p-3 shadow ${
                product.status === 'bought' ? 'bg-green-100' : 'bg-yellow-50'
              }`}
            >
              <label className="block mb-2">
                <input
                  type="checkbox"
                  checked={product.status === 'bought'}
                  onChange={() => toggleStatus(product)}
                  className="mr-2"
                />
                {product.status === 'bought' ? '✅ 已買' : '📦 未買'}
              </label>
              <div>📞 電話：{product.phone}</div>
              <div>📍 位置：{product.location}</div>
              <div>💰 價錢：{product.price}</div>
              <div>📈 難買度：{product.difficulty}</div>
              <div>📝 備註：{product.remark}</div>
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt="Product"
                  className="w-32 mt-2 border"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
