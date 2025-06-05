import { useAnimate } from "framer-motion";
import React, { useRef } from "react";
import { FiMousePointer } from "react-icons/fi";

export const Example = () => {
  return (
    <MouseImageTrail
      renderImageBuffer={50}
      rotationRange={25}
      images={[
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141696/1_uyurbg.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141957/2_abaepj.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141700/3_nvhhnt.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141667/4_yj0mhk.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141684/5_fecshj.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141691/6_vvjvqt.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141690/7_fhmpdv.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141699/8_pw5ndc.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141690/9_sbcura.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141699/10_fu6b82.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141705/11_khwmpf.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141707/12_ttplw2.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141703/13_ybbbuy.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141712/14_opmo0d.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141705/15_uzzo6p.jpg,
        https://res.cloudinary.com/daik9ymd7/image/upload/v1749141714/16_b6iouy.jpg,
      ]}
    >
      <section className="grid h-screen w-full place-content-center bg-white">
        <p className="flex items-center gap-2 text-3xl font-bold uppercase text-black">
          <FiMousePointer />
          <span>MATT & MISHA</span>
        </p>
      </section>
    </MouseImageTrail>
  );
};

const MouseImageTrail = ({
  children,
  // List of image sources
  images,
  // Will render a new image every X pixels between mouse moves
  renderImageBuffer,
  // images will be rotated at a random number between zero and rotationRange,
  // alternating between a positive and negative rotation
  rotationRange,
}) => {
  const [scope, animate] = useAnimate();

  const lastRenderPosition = useRef({ x: 0, y: 0 });
  const imageRenderCount = useRef(0);

  const handleMouseMove = (e) => {
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

    // Using the Pythagorean theorem to calculate the distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    return distance;
  };

  const renderNextImage = () => {
    const imageIndex = imageRenderCount.current % images.length;
    const selector = `[data-mouse-move-index="${imageIndex}"]`;

    const el = document.querySelector(selector);

    el.style.top = `${lastRenderPosition.current.y}px`;
    el.style.left = `${lastRenderPosition.current.x}px`;
    el.style.zIndex = imageRenderCount.current.toString();

    const rotation = Math.random() * rotationRange;

    animate(
      selector,
      {
        opacity: [0, 1],
        transform: [
          `translate(-50%, -25%) scale(0.5) ${
            imageIndex % 2
              ? `rotate(${rotation}deg)`
              : `rotate(-${rotation}deg)`
          }`,
          `translate(-50%, -50%) scale(1) ${
            imageIndex % 2
              ? `rotate(-${rotation}deg)`
              : `rotate(${rotation}deg)`
          }`,
        ],
      },
      { type: "spring", damping: 15, stiffness: 200 }
    );

    animate(
      selector,
      {
        opacity: [1, 0],
      },
      { ease: "linear", duration: 0.5, delay: 5 }
    );

    imageRenderCount.current = imageRenderCount.current + 1;
  };

  return (
    <div
      ref={scope}
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
