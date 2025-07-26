'use client';

import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const AddProductForm = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = async () => {
    if (!name || !price) return alert('請填入所有欄位');
    await addDoc(collection(db, 'products'), {
      name,
      price: Number(price),
      bought: false,
      image: '',
      remark: ''
    });
    setName('');
    setPrice('');
    alert('已儲存！請重新整理查看');
  };

  return (
    <div className="mb-6 space-y-2">
      <input
        className="border px-2 py-1"
        placeholder="產品名稱"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border px-2 py-1 ml-2"
        placeholder="金額"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button
        onClick={handleAdd}
        className="bg-blue-500 text-white px-4 py-1 ml-2"
      >
        儲存
      </button>
    </div>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'products'));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setProducts(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      {products.map((item) => (
        <div key={item.id} className="border p-2 mb-2">
          <div>🛒 {item.name}</div>
          <div>💰 ${item.price}</div>
        </div>
      ))}
    </div>
  );
};

export default function Page() {
  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🛒 Product List</h1>
      <AddProductForm />
      <ProductList />
    </main>
  );
}