import React, { useRef, useState, useEffect } from "react";
import { FiMousePointer, FiUpload, FiX, FiLoader } from "react-icons/fi";

export const Example = () => {
  const [images, setImages] = useState([]);
  const [showUploader, setShowUploader] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const preloadImages = (imageUrls) => {
    return new Promise((resolve) => {
      let loadedCount = 0;
      const total = imageUrls.length;
      
      if (total === 0) {
        resolve();
        return;
      }

      imageUrls.forEach((url, index) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          setLoadingProgress(Math.round((loadedCount / total) * 100));
          
          if (loadedCount === total) {
            setTimeout(() => {
              setImagesLoaded(true);
              setIsLoading(false);
              setShowUploader(false);
            }, 500); // Small delay to show 100% completion
          }
        };
        img.onerror = () => {
          loadedCount++;
          setLoadingProgress(Math.round((loadedCount / total) * 100));
          
          if (loadedCount === total) {
            setTimeout(() => {
              setImagesLoaded(true);
              setIsLoading(false);
              setShowUploader(false);
            }, 500);
          }
        };
        img.src = url;
      });
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = [];
    
    // Convert files to data URLs
    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target.result);
          };
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
      });
    });

    const results = await Promise.all(filePromises);
    const validImages = results.filter(url => url !== null);
    
    if (validImages.length > 0) {
      setImages(prev => [...prev, ...validImages]);
      setIsLoading(true);
      setImagesLoaded(false);
      setLoadingProgress(0);
      
      // Preload the new images
      await preloadImages([...images, ...validImages]);
    }
  };

  const removeImage = async (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    
    if (newImages.length > 0) {
      setIsLoading(true);
      setImagesLoaded(false);
      setLoadingProgress(0);
      await preloadImages(newImages);
    } else {
      setImagesLoaded(false);
      setShowUploader(true);
    }
  };

  const clearAllImages = () => {
    setImages([]);
    setImagesLoaded(false);
    setIsLoading(false);
    setLoadingProgress(0);
    setShowUploader(true);
  };

  if (showUploader && images.length === 0) {
    return (
      <section className="grid h-screen w-full place-content-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-6">
            <FiUpload className="mx-auto text-6xl text-white mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Upload Your Images</h2>
            <p className="text-white/80">Add images to create your mouse trail effect</p>
          </div>
          
          <label className="block cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="bg-white/20 hover:bg-white/30 transition-colors duration-200 rounded-xl p-8 border-2 border-dashed border-white/40 text-center">
              <p className="text-white font-semibold">Click to select images</p>
              <p className="text-white/60 text-sm mt-1">or drag and drop</p>
            </div>
          </label>
        </div>
      </section>
    );
  }

  // Loading screen while images are being preloaded
  if (isLoading || !imagesLoaded) {
    return (
      <section className="grid h-screen w-full place-content-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl text-center">
          <FiLoader className="mx-auto text-6xl text-white mb-4 animate-spin" />
          <h2 className="text-3xl font-bold text-white mb-4">Loading Images...</h2>
          
          {/* Progress bar */}
          <div className="w-64 bg-white/20 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          
          <p className="text-white/80 text-lg">
            {loadingProgress}% Complete
          </p>
          <p className="text-white/60 text-sm mt-2">
            Preparing {images.length} images for the trail effect...
          </p>
        </div>
      </section>
    );
  }

  return (
    <MouseImageTrail
      renderImageBuffer={50}
      rotationRange={25}
      images={images}
    >
      <section className="grid h-screen w-full place-content-center bg-white relative">
        {/* Control Panel */}
        <div className="absolute top-4 right-4 flex gap-2">
          <label className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors flex items-center gap-2">
            <FiUpload size={16} />
            Add More
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isLoading}
            />
          </label>
          <button
            onClick={clearAllImages}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            disabled={isLoading}
          >
            <FiX size={16} />
            Clear All
          </button>
        </div>

        {/* Image Preview Panel */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 max-w-xs">
          <h3 className="font-bold text-sm mb-2">Loaded Images ({images.length})</h3>
          <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Preview ${index}`}
                  className="w-12 h-12 object-cover rounded border"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <p className="flex items-center gap-2 text-3xl font-bold uppercase text-black">
          <FiMousePointer />
          <span>MOUSE TRAIL</span>
        </p>
        <p className="text-gray-600 mt-2 text-center">Move your mouse around to see the effect!</p>
      </section>
    </MouseImageTrail>
  );
};

const MouseImageTrail = ({
  children,
  images,
  renderImageBuffer,
  rotationRange,
}) => {
  const lastRenderPosition = useRef({ x: 0, y: 0 });
  const imageRenderCount = useRef(0);

  const handleMouseMove = (e) => {
    if (images.length === 0) return;

    const { clientX, clientY } = e;

    const distance = calculateDistance(
      clientX,
      clientY,
      lastRenderPosition.current.x,
      lastRenderPosition.current.y
    );

    if (distance >= renderImageBuffer) {
      lastRenderPosition.current.x = clientX;
      lastRenderPosition.current.y = clientY;

      renderNextImage();
    }
  };

  const calculateDistance = (x1, y1, x2, y2) => {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return distance;
  };

  const renderNextImage = () => {
    const imageIndex = imageRenderCount.current % images.length;
    const selector = `[data-mouse-move-index="${imageIndex}"]`;

    const el = document.querySelector(selector);
    if (!el) return;

    el.style.top = `${lastRenderPosition.current.y}px`;
    el.style.left = `${lastRenderPosition.current.x}px`;
    el.style.zIndex = imageRenderCount.current.toString();

    const rotation = Math.random() * rotationRange;

    // Simple animation without framer-motion
    el.style.opacity = '0';
    el.style.transform = `translate(-50%, -25%) scale(0.5) ${
      imageIndex % 2 ? `rotate(${rotation}deg)` : `rotate(-${rotation}deg)`
    }`;

    // Animate in
    setTimeout(() => {
      el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      el.style.opacity = '1';
      el.style.transform = `translate(-50%, -50%) scale(1) ${
        imageIndex % 2 ? `rotate(-${rotation}deg)` : `rotate(${rotation}deg)`
      }`;
    }, 10);

    // Animate out
    setTimeout(() => {
      el.style.transition = 'opacity 0.5s linear';
      el.style.opacity = '0';
    }, 5000);

    imageRenderCount.current = imageRenderCount.current + 1;
  };

  return (
    <div
      className="relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {children}

      {images.map((img, index) => (
        <img
          className="pointer-events-none absolute left-0 top-0 h-48 w-auto rounded-xl border-2 border-black bg-neutral-900 object-cover opacity-0"
          src={img}
          alt={`Mouse move image ${index}`}
          key={index}
          data-mouse-move-index={index}
        />
      ))}
    </div>
  );
};

export default Example;