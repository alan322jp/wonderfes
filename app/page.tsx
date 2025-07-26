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
  imageLink: string;
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
    imageLink: '',
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

  const handleProductChange = async (
    id: string,
    field: keyof Product,
    value: string
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    const ref = doc(db, 'products', id);
    await updateDoc(ref, { [field]: value });
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
      imageLink: '',
    });
  };

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">📥 新增產品資料</h1>
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        {['phone', 'location', 'price', 'difficulty', 'remark', 'imageLink'].map(
          (field) => (
            <input
              key={field}
              name={field}
              value={(formData as any)[field]}
              onChange={handleInputChange}
              placeholder={field}
              className="w-full border px-3 py-2 rounded"
              required={field !== 'imageLink'}
            />
          )
        )}
        {formData.imageLink && (
          <img
            src={formData.imageLink}
            alt="預覽圖"
            className="w-32 mt-2 border"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          儲存
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-2">📃 已儲存產品</h2>
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded p-3 shadow space-y-2">
            {['phone', 'location', 'price', 'difficulty', 'remark', 'imageLink'].map(
              (field) => (
                <input
                  key={field}
                  name={field}
                  defaultValue={(product as any)[field]}
                  onBlur={(e) =>
                    product.id &&
                    handleProductChange(product.id, field as keyof Product, e.target.value)
                  }
                  placeholder={field}
                  className="w-full border px-2 py-1 rounded"
                />
              )
            )}
            {product.imageLink && (
              <img
                src={product.imageLink}
                alt="圖"
                className="w-32 mt-2 border"
                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
              />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
