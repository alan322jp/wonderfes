
'use client';

import { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
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
  isBought: boolean;
};

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<'add' | 'notBought' | 'bought'>('add');
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'isBought'>>({
    phone: '',
    location: '',
    price: '',
    difficulty: '',
    remark: '',
    imageUrl: '',
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id?: string
  ) => {
    const { name, value } = e.target;
    if (id) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [name]: value } : item
        )
      );
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = async (id: string, name: string, value: string) => {
    await updateDoc(doc(db, 'products', id), { [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct: Product = {
      ...formData,
      isBought: false,
    };
    const docRef = await addDoc(collection(db, 'products'), newProduct);
    setProducts((prev) => [...prev, { ...newProduct, id: docRef.id }]);
    setFormData({
      phone: '',
      location: '',
      price: '',
      difficulty: '',
      remark: '',
      imageUrl: '',
    });
  };

  const toggleBought = async (id: string, isBought: boolean) => {
    await updateDoc(doc(db, 'products', id), { isBought: !isBought });
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isBought: !isBought } : p
      )
    );
  };

  const filteredProducts = products.filter((p) =>
    tab === 'notBought' ? !p.isBought : tab === 'bought' ? p.isBought : true
  );

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <div className="flex gap-4 mb-4">
        <button onClick={() => setTab('add')}>➕ 新增</button>
        <button onClick={() => setTab('notBought')}>🛒 未買</button>
        <button onClick={() => setTab('bought')}>✅ 已買</button>
      </div>

      {tab === 'add' && (
        <form onSubmit={handleSubmit} className="space-y-3 mb-6">
          {[
            ['phone', '電話'],
            ['location', '位置'],
            ['price', '價錢'],
            ['difficulty', '難買度'],
            ['remark', '備註'],
            ['imageUrl', '圖片 URL'],
          ].map(([field, label]) => (
            <label key={field} className="block">
              {label}：
              <input
                name={field}
                value={(formData as any)[field]}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded mt-1"
              />
            </label>
          ))}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            儲存
          </button>
        </form>
      )}

      {tab !== 'add' && (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`border rounded p-3 shadow ${
                product.isBought ? 'bg-green-100' : 'bg-yellow-50'
              }`}
            >
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={product.isBought}
                  onChange={() =>
                    toggleBought(product.id!, product.isBought)
                  }
                  className="mr-2"
                />
                {product.isBought ? '✅ 已買' : '🛒 未買'}
              </label>

              {[
                ['phone', '電話'],
                ['location', '位置'],
                ['price', '價錢'],
                ['difficulty', '難買度'],
                ['remark', '備註'],
                ['imageUrl', '圖片 URL'],
              ].map(([field, label]) => (
                <label key={field} className="block mb-1">
                  {label}：
                  <input
                    name={field}
                    value={(product as any)[field]}
                    onChange={(e) => handleInputChange(e, product.id)}
                    onBlur={(e) =>
                      handleBlur(product.id!, field, e.target.value)
                    }
                    className="w-full border px-3 py-2 rounded mt-1"
                  />
                </label>
              ))}
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt="Product"
                  className="w-64 mt-2 border rounded shadow"
                />
              )}

              {product.phone && (
                <a
                  href={`https://api.whatsapp.com/send/?phone=852${product.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  聯絡賣家
                </a>
)}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
