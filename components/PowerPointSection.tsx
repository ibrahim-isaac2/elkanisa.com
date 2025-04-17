"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { X, Folder, Image as ImageIcon } from "lucide-react";

export default function PowerPointSection(): JSX.Element {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [fileStructure, setFileStructure] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [isDark, setIsDark] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const fetchFileStructure = async () => {
      try {
        const response = await fetch('/files.json');
        const data = await response.json();
        setFileStructure(data);
      } catch (err) {
        setError('فشل في جلب هيكل الملفات.');
      }
    };
    fetchFileStructure();
  }, []);

  useEffect(() => {
    const getCurrentItems = () => {
      if (!fileStructure) return [];
      let current = fileStructure;
      const pathParts = currentPath.split('/').filter(Boolean);
      for (const part of pathParts) {
        const child = current.children.find((c: any) => c.name === part);
        if (child && child.type === 'folder') {
          current = child;
        } else {
          return [];
        }
      }
      return current.children || [];
    };

    const currentItems = getCurrentItems();

    // Debugging: Log items before sorting
    console.log("Items before sorting:", currentItems.map((item: any) => item.name));

    // Sort items based on the number in the file name (e.g., Slide1.JPG, Slide10.JPG)
    const sortedItems = [...currentItems].sort((a: any, b: any) => {
      const getNumber = (name: string) => {
        // Match any number in the file name (e.g., Slide1.JPG -> 1, Slide10.JPG -> 10)
        const match = name.match(/Slide(\d+)\.JPG/);
        return match ? parseInt(match[1], 10) : Infinity; // Use Infinity for non-matching items to push them to the end
      };
      const numA = getNumber(a.name);
      const numB = getNumber(b.name);
      return numA - numB;
    });

    // Debugging: Log items after sorting
    console.log("Items after sorting:", sortedItems.map((item: any) => item.name));

    setItems(sortedItems);
  }, [currentPath, fileStructure]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (item: any) => {
    if (item.type === 'folder') {
      setCurrentPath(currentPath ? `${currentPath}/${item.name}` : item.name);
    } else if (item.type === 'file') {
      const imageUrl = `${process.env.NEXT_PUBLIC_R2_URL3}/orzozox/${currentPath}/${item.name}`;
      setSelectedImage(imageUrl);
      setSelectedImageIndex(items.findIndex((i: any) => i.name === item.name));
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.error('Error attempting to enable full-screen mode:', err);
      }
    }
  };

  const goBack = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  const exitFullScreen = () => {
    setSelectedImage(null);
    setSelectedImageIndex(-1);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error('Error attempting to exit full-screen mode:', err);
      });
    }
  };

  const showNextImage = () => {
    const imageItems = items.filter((item: any) => item.type === 'file');
    if (selectedImageIndex < imageItems.length - 1) {
      const nextIndex = selectedImageIndex + 1;
      const nextItem = imageItems[nextIndex];
      setSelectedImage(`${process.env.NEXT_PUBLIC_R2_URL3}/orzozox/${currentPath}/${nextItem.name}`);
      setSelectedImageIndex(nextIndex);
    }
  };

  const showPreviousImage = () => {
    const imageItems = items.filter((item: any) => item.type === 'file');
    if (selectedImageIndex > 0) {
      const prevIndex = selectedImageIndex - 1;
      const prevItem = imageItems[prevIndex];
      setSelectedImage(`${process.env.NEXT_PUBLIC_R2_URL3}/orzozox/${currentPath}/${prevItem.name}`);
      setSelectedImageIndex(prevIndex);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!selectedImage) return;
      if (event.key === 'Escape') {
        exitFullScreen();
      } else if (event.key === 'ArrowRight') {
        showNextImage();
      } else if (event.key === 'ArrowLeft') {
        showPreviousImage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, selectedImageIndex, items, currentPath]);

  // Swipe detection for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    if (Math.abs(diffX) > 50) { // Minimum swipe distance
      if (diffX > 0) {
        showNextImage(); // Swipe left -> next image
      } else {
        showPreviousImage(); // Swipe right -> previous image
      }
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .arabic-text {
        font-family: 'Scheherazade New', 'Amiri', 'Traditional Arabic', serif;
        text-align: right;
        direction: rtl;
        word-spacing: 0.1em;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-feature-settings: 'liga' on, 'calt' on;
        text-rendering: optimizeLegibility;
      }
    `;
    document.head.appendChild(style);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(style);
      document.head.removeChild(link);
    };
  }, []);

  const removeFileExtension = (fileName: string) => {
    return fileName.replace(/\.[^/.]+$/, '');
  };

  if (error) {
    return (
      <section className="bg-gray-900 p-4 xs:p-6 rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-xl xs:text-2xl font-bold mb-6 text-center text-white">الكنيسة القبطية الأرثوذكسية</h2>
        <p className="text-center text-red-400">{error}</p>
      </section>
    );
  }

  return (
    <section
      className={`${isDark ? 'bg-gray-900' : 'bg-gray-100'} p-4 xs:p-6 rounded-lg shadow-md max-w-4xl mx-auto transition-colors duration-300 min-h-[calc(100vh-300px)] relative mb-20`}
    >
      <div className="flex justify-between items-center mb-6 xs:mb-8">
        <button
          onClick={() => setIsDark(!isDark)}
          className={`p-2 rounded-full ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200'} transition-colors shadow-md`}
        >
          {isDark ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-indigo-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
        <h2
          className={`text-2xl xs:text-3xl font-bold text-center ${isDark ? 'text-white' : 'text-gray-800'} bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-blue-400 to-purple-500' : 'from-blue-600 to-purple-700'}`}
        >
          الكنيسة القبطية الأرثوذكسية
        </h2>
        <div className="w-5"></div>
      </div>

      <div className="mb-6 xs:mb-8 relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full flex items-center justify-between p-3 xs:p-4 rounded-xl shadow-lg transition-all duration-300 ${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800' : 'bg-gradient-to-r from-white to-gray-100 text-gray-800 hover:from-gray-100 hover:to-gray-200'} ${isDropdownOpen ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className="flex items-center">
            <ImageIcon className={`h-5 xs:h-6 w-5 xs:w-6 mr-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className="text-base xs:text-lg font-medium">{currentPath || 'اختر الفئة'}</span>
          </div>
          <svg
            className={`h-5 w-5 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && fileStructure && (
          <div
            className={`absolute z-50 mt-2 w-full rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
          >
            <div className="max-h-80 overflow-y-auto py-2 mb-4">
              {fileStructure.children.map((category: any) => (
                <button
                  key={category.name}
                  className={`w-full flex items-center px-4 py-3 text-right ${isDark ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'} ${currentPath.startsWith(category.name) ? isDark ? 'bg-gray-700' : 'bg-gray-100' : ''} transition-colors`}
                  onClick={() => {
                    setCurrentPath(category.name);
                    setIsDropdownOpen(false);
                  }}
                >
                  <Folder className={`h-5 w-5 mr-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className="text-sm xs:text-base">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {currentPath && (
        <button
          onClick={goBack}
          className={`mb-4 xs:mb-6 flex items-center p-3 rounded-xl ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-200'} transition-colors`}
        >
          <svg
            className="h-5 w-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          العودة
        </button>
      )}

      {currentPath && (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length > 0 ? (
            items.map((item: any, index: number) => (
              <div
                key={item.name}
                className={`relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-100'}`}
                onClick={() => handleItemClick(item)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`absolute top-0 left-0 w-2 h-full ${isDark ? 'bg-gradient-to-b from-blue-500 to-purple-600' : 'bg-gradient-to-b from-blue-600 to-purple-700'}`}></div>
                <div className="p-4 xs:p-5 rtl">
                  <div className="flex items-center mb-3">
                    {item.type === 'folder' ? (
                      <Folder className={`h-5 xs:h-6 w-5 xs:w-6 ml-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    ) : (
                      <ImageIcon className={`h-5 xs:h-6 w-5 xs:w-6 ml-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    )}
                    <h3 className={`text-base xs:text-lg font-bold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>{removeFileExtension(item.name)}</h3>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.type === 'folder' ? 'مجلد' : 'صورة'}
                  </div>
                  {item.type === 'file' && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_R2_URL3}/orzozox/${currentPath}/${item.name}`}
                      alt={item.name}
                      className="mt-2 w-full h-32 object-cover rounded-md"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className={`absolute bottom-0 right-0 w-full h-1 ${isDark ? 'bg-gradient-to-r from-purple-600 to-blue-500' : 'bg-gradient-to-r from-purple-700 to-blue-600'}`}></div>
              </div>
            ))
          ) : (
            <div className={`col-span-full p-6 xs:p-8 text-center rounded-xl shadow-lg ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-base xs:text-lg">لا توجد عناصر مطابقة للبحث أو المجلد فارغ.</p>
            </div>
          )}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black"
          onClick={exitFullScreen}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            className="absolute top-8 right-8 p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors duration-200 z-20"
            onClick={exitFullScreen}
          >
            <X className="h-5 xs:h-6 w-5 xs:w-6" />
          </button>

          <img
            src={selectedImage}
            alt="Fullscreen Image"
            className="w-full h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
