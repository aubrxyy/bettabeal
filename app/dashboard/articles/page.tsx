'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../Header';
import Navbar from '../Navbar';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { getCookie } from '@/app/_utils/cookies';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Article {
  article_id: number;
  seller_id: number;
  title: string;
  content: string;
  image: string;
  created_at: string;
  updated_at: string;
}

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);
  const router = useRouter();
  const articlesPerPage = 2;

  useEffect(() => {
    const fetchArticles = async () => {
      const token = getCookie('USR');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/article`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.code === '000') {
          setArticles(data.articles);
        } else {
          setError(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(`Fetch error: ${(error as Error).message}`);
      }
    };

    fetchArticles();
  }, [router]);

  const handleDelete = async () => {
    const token = getCookie('USR');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!articleToDelete) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/article/${articleToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Error deleting article: ${text}`);
        setError(`Error: ${response.status} - ${text}`);
        return;
      }

      setArticles(articles.filter(article => article.article_id !== articleToDelete));
      toast.success('Article deleted successfully');
      setShowDialog(false);
      setArticleToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      setError(`Delete error: ${(error as Error).message}`);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex">
      <Header />
      <Navbar />
      <div className="flex-1" style={{ background: 'linear-gradient(to right, #1DACFE 45%, #7ec9f2 94%)' }}>
        <div className="px-5 py-4 mt-[4rem]"></div>
        <div className="px-4">
          <div className="flex justify-between items-center my-4 mx-2">
            <h1 className="text-white font-bold text-2xl">Article</h1>
            <button
              className="bg-blue-800 text-white px-12 py-2 rounded-lg text-lg hover:bg-blue-700"
              onClick={() => router.push('/dashboard/articles/add')}
            >
              + Add Article
            </button>
          </div>

          <div className="bg-white rounded-lg p-5 relative h-[50rem]">
            <div className="relative mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none placeholder-gray-500 text-sm"
                placeholder="Search..."
              />
            </div>

            <div className="grid grid-cols-[50px_300px_1fr_100px_100px] gap-5 py-3 border-b-2 border-gray-300 text-gray-500 font-medium">
              <div className="ml-2">No</div>
              <div>Article Image</div>
              <div>Article Text</div>
              <div className="text-center">Edit</div>
              <div className="text-center">Delete</div>
            </div>

            {currentArticles.map((article, index) => (
              <div key={article.article_id} className="grid grid-cols-[50px_300px_1fr_100px_100px] gap-5 py-4 border-b border-gray-200 items-start">
                <div className=" w-8 h-8 flex items-center justify-center rounded-md">{indexOfFirstArticle + index + 1}</div>
                <Image width={100} height={100} src={`${process.env.NEXT_PUBLIC_API_URL}${article.image}`} alt={article.title} className="w-72 h-52 object-cover rounded-md" />
                <div className="pr-5">
                  <div className="font-bold mb-2">{article.title}</div>
                    <p className="text-sm text-gray-600 line-clamp-6">{article.content}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="w-8 h-8 text-blue-700 border bg-gray-100 rounded-md flex items-center justify-center hover:bg-blue-200 ml-8"
                    onClick={() => router.push(`/dashboard/articles/${article.article_id}`)}
                  >
                    <FiEdit2 />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    className="w-8 h-8 text-red-700 rounded-md border bg-gray-100 flex items-center justify-center hover:bg-red-200 ml-8"
                    onClick={() => {
                      setArticleToDelete(article.article_id);
                      setShowDialog(true);
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}

            {filteredArticles.length > articlesPerPage && (
              <div className="absolute bottom-5 left-5 right-12 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`hover:text-blue-500 ${currentPage === 1 ? 'text-gray-400' : ''}`}
                  >
                    ←
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`px-2 py-1 border-gray-300 rounded-md ${currentPage === i + 1 ? 'text-white bg-blue-700' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`hover:text-blue-500 ${currentPage === totalPages ? 'text-gray-400' : ''}`}
                  >
                    →
                  </button>
                </div>
                <span id="results" className="text-sm">{filteredArticles.length} Results</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this article?</p>
            <div className="flex justify-end gap-4">
              <button 
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer closeOnClick hideProgressBar autoClose={2000} />
    </div>
  );
}