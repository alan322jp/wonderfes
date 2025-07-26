'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export type Product = {
  id?: string;
  phone: string;
  location: string;
  price: string;
  difficulty: string;
  remark: string;
  status: 'not_bought' | 'bought';
  imageUrl?: string;
};

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    phone: '',
    location: '',
    price: '',
    difficulty: '',
    remark: '',
    status: 'not_bought',
    imageUrl: '',
  });
  const [tab, setTab] = useState<'input' | 'not_bought' | 'bought'>('input');

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'products'));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
      setProducts(data);
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlurUpdate = async (id: string, name: string, value: string) => {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, { [name]: value });
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [name]: value } : p))
    );
  };

  const handleStatusToggle = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const newStatus = product.status === 'not_bought' ? 'bought' : 'not_bought';
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, { status: newStatus });
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const docRef = await addDoc(collection(db, 'products'), formData);
    setProducts((prev) => [...prev, { ...formData, id: docRef.id }]);
    setFormData({
      phone: '',
      location: '',
      price: '',
      difficulty: '',
      remark: '',
      status: 'not_bought',
      imageUrl: '',
    });
  };

  const filteredProducts =
    tab === 'not_bought'
      ? products.filter((p) => p.status === 'not_bought')
      : tab === 'bought'
      ? products.filter((p) => p.status === 'bought')
      : [];

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <div className="mb-4 space-x-2">
        <button
          onClick={() => setTab('input')}
          className={`px-3 py-1 rounded ${tab === 'input' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          ➕ 入單
        </button>
        <button
          onClick={() => setTab('not_bought')}
          className={`px-3 py-1 rounded ${tab === 'not_bought' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          🕒 未買
        </button>
        <button
          onClick={() => setTab('bought')}
          className={`px-3 py-1 rounded ${tab === 'bought' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          ✅ 已買
        </button>
      </div>

      {tab === 'input' && (
        <form onSubmit={handleSubmit} className="space-y-3 mb-6">
          {['phone', 'location', 'price', 'difficulty', 'remark', 'imageUrl'].map((field) => (
            <div key={field}>
              <label className="block font-medium mb-1">
                {field === 'phone' ? '電話' :
                field === 'location' ? '位置' :
                field === 'price' ? '價錢' :
                field === 'difficulty' ? '難買度' :
                field === 'remark' ? '備註' :
                field === 'imageUrl' ? '圖片連結' : field}
              </label>
              <input
                name={field}
                value={(formData as any)[field]}
                onChange={handleInputChange}
                placeholder={field}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          ))}
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            儲存
          </button>
        </form>
      )}

      {(tab === 'not_bought' || tab === 'bought') && (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`border rounded p-3 shadow ${product.status === 'bought' ? 'bg-green-100' : 'bg-yellow-50'}`}
            >
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={product.status === 'bought'}
                  onChange={() => handleStatusToggle(product.id!)}
                  className="mr-2"
                />
                {product.status === 'bought' ? '✅ 已買' : '🕒 未買'}
              </label>
              <div>
                <a
                  className="text-blue-700 underline"
                  href={`https://api.whatsapp.com/send/?phone=852${product.phone}&text&type=phone_number&app_absent=0`}
                  target="_blank"
                >
                  電話
                </a>
                ：
                <input
                  name="phone"
                  defaultValue={product.phone}
                  onBlur={(e) => handleBlurUpdate(product.id!, 'phone', e.target.value)}
                  className="border ml-2 rounded px-2 py-1"
                />
              </div>
              {['location', 'price', 'difficulty', 'remark'].map((field) => (
                <div key={field}>
                  <span className="font-medium">
                    {field === 'location'
                      ? '位置'
                      : field === 'price'
                      ? '價錢'
                      : field === 'difficulty'
                      ? '難買度'
                      : '備註'}
                  </span>
                  ：
                  <input
                    name={field}
                    defaultValue={(product as any)[field]}
                    onBlur={(e) => handleBlurUpdate(product.id!, field, e.target.value)}
                    className="border ml-2 rounded px-2 py-1"
                  />
                </div>
              ))}
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt="img"
                  className="w-full max-w-xs mt-2 border rounded"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
