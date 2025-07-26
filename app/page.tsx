
'use client';

import { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
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
  createdAt?: Timestamp;
  status?: 'not_bought' | 'bought';
};

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'status'>>({
    phone: '',
    location: '',
    price: '',
    difficulty: '',
    remark: '',
    imageUrl: '',
  });
  const [activeTab, setActiveTab] = useState<'add' | 'not_bought' | 'bought'>('add');

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
      status: 'not_bought',
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
    });
  };

  const handleUpdate = async (id: string | undefined, updatedFields: Partial<Product>) => {
    if (!id) return;
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, updatedFields);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const toggleStatus = async (id: string | undefined, currentStatus: 'not_bought' | 'bought') => {
    const newStatus = currentStatus === 'not_bought' ? 'bought' : 'not_bought';
    await handleUpdate(id, { status: newStatus });
  };

  const filteredProducts =
    activeTab === 'add'
      ? []
      : products.filter((p) => p.status === (activeTab === 'not_bought' ? 'not_bought' : 'bought'));

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <div className="flex space-x-2 mb-4">
        <button onClick={() => setActiveTab('add')}>➕ 新增</button>
        <button onClick={() => setActiveTab('not_bought')}>📦 未買</button>
        <button onClick={() => setActiveTab('bought')}>✅ 已買</button>
      </div>

      {activeTab === 'add' ? (
        <form onSubmit={handleSubmit} className="space-y-3 mb-6">
          {['phone', 'location', 'price', 'difficulty', 'remark', 'imageUrl'].map((field) => (
            <input
              key={field}
              name={field}
              value={(formData as any)[field]}
              onChange={handleInputChange}
              placeholder={field}
              className="w-full border px-3 py-2 rounded"
            />
          ))}
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            儲存
          </button>
        </form>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`border rounded p-3 shadow ${
                product.status === 'bought' ? 'bg-green-100' : 'bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={product.status === 'bought'}
                onChange={() => toggleStatus(product.id, product.status || 'not_bought')}
              />
              {['phone', 'location', 'price', 'difficulty', 'remark', 'imageUrl'].map((field) => (
                <input
                  key={field}
                  defaultValue={(product as any)[field]}
                  onBlur={(e) => handleUpdate(product.id, { [field]: e.target.value })}
                  className="w-full border rounded px-2 py-1 my-1"
                />
              ))}
              {product.imageUrl && (
                <img src={product.imageUrl} alt="img" className="w-32 mt-2 border" />
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
