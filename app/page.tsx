'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
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
};

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt'>>({
    phone: '',
    location: '',
    price: '',
    difficulty: '',
    remark: '',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = '';
    if (imageFile) {
      const storage = getStorage();
      const imageRef = ref(storage, `product-images/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const productData: Product = {
      ...formData,
      imageUrl,
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
    });
    setImageFile(null);
  };

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">📥 新增產品資料</h1>
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
        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
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
          <div key={product.id} className="border rounded p-3 shadow">
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
    </main>
  );
}
